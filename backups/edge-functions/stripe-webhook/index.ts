import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

// ============================================================================
// stripe-webhook v2.2 — 11/08/2026
//
// AJOUT v2.2 — DETECTION DES ECHECS DE PAIEMENT
//   Le webhook ne traitait AUCUN echec. Une carte refusee laissait Supabase en
//   status='active', le dashboard en vert, et le livre partait en fabrication
//   pour un abonnement impaye. Le cas devient nettement plus probable avec le
//   report du premier prelevement au 10 : un mois s'ecoule entre la saisie de
//   la carte et le premier debit.
//
//   Trois evolutions :
//     [1] Nouveau handler `invoice.payment_failed` : pose payment_failed_at,
//         payment_attempt_count et stripe_status.
//     [2] `customer.subscription.updated` ecrit desormais AUSSI stripe_status
//         (past_due, unpaid, trialing…), en plus de cancel_at.
//     [3] `invoice.payment_succeeded` EFFACE payment_failed_at : une relance
//         Stripe qui aboutit doit lever l'alerte toute seule.
//     Plus : stripe_status est pose des la creation.
//
//   PARTI PRIS : on stocke le statut Stripe BRUT. Stripe est la source de
//   verite ; inventer un vocabulaire maison creerait une definition de plus a
//   maintenir. `status`/`is_active` disent « couvre-t-il ce mois ? »,
//   `stripe_status` dit « est-il paye ? ». Un abonnement peut etre actif et
//   impaye — c'est exactement le cas qu'on ne voyait pas.
//
//   PREREQUIS : migration_payment_failures_v1.sql.
//
// ============================================================================
// stripe-webhook v2.1 — 06/08/2026
// (remplace la v2.0, jamais déployée)
//
// Décisions actées avec Robin le 06/08 :
//
//   [1] RENOUVELLEMENT RÉPARÉ + « A durable ».
//       `invoice.subscription` a quitté la racine des payloads dans les
//       versions récentes de l'API Stripe (déplacé sous
//       invoice.parent.subscription_details.subscription). Le champ valait
//       `undefined`, retrieve(undefined) levait, le catch global renvoyait 500 :
//       AUCUN end_date n'a jamais été rafraîchi (constaté en base).
//       De plus, le handler écrasait end_date sur TOUS les abonnements actifs
//       du parent. Désormais : appariement fort, et si l'événement n'est pas
//       attribuable, on n'écrit RIEN et on enregistre une ANOMALIE DURABLE
//       (table webhook_anomalies) — les logs du plan free vivent 24 h.
//       Plus aucune mise à jour de masse par created_by, dans aucun handler.
//
//   [2] APPARIEMENT FORT via `stripe_subscription_id` (migration v1.1).
//       (child_id, created_by) ne distingue pas deux abonnements successifs du
//       même enfant : un `deleted` rejoué annulait le nouvel abonnement payé.
//       Repli automatique sur (child_id, created_by) tant que la colonne est
//       NULL (lignes pré-backfill). L'appariement fort évite en prime les
//       appels customers.retrieve + recherche utilisateur quand il aboutit.
//
//   [3] IDEMPOTENCE de checkout.session.completed, option C blindée :
//       - rejeu -> on ne réinsère pas la ligne, mais on POURSUIT (génération
//         des livres et rédemption cadeau retentées, aucun rattrapage perdu) ;
//       - course entre deux livraisons simultanées -> tranchée par l'index
//         UNIQUE uq_subscriptions_stripe_subscription_id + upsert
//         ignoreDuplicates : la base décide, pas le code.
//
//   [4] listUsers() SUPPRIMÉ des quatre handlers. Il ne renvoie qu'une PAGE
//       (50 comptes par défaut) : au 51e client, plus aucun utilisateur n'était
//       trouvé et le webhook sortait sans rien écrire. Remplacé par la RPC SQL
//       get_user_id_by_email (migration v1.1). Supprime aussi l'appel le plus
//       lourd du handler de création -> moins de timeouts -> moins de rejeux.
//
//   [C affiné] invoice.payment_succeeded : une facture dont billing_reason est
//       subscription_cycle / subscription_update / subscription_threshold porte
//       PAR DÉFINITION un abonnement. Ne pas réussir à le lire = anomalie
//       enregistrée PUIS 500 (visible en rouge dans le dashboard Stripe).
//       Toute autre facture sans abonnement -> 200 silencieux (pas d'erreur).
//
//   Lecteurs défensifs partout : le SDK est épinglé 2023-10-16 (ancienne forme
//   des objets), l'endpoint webhook est sur une version récente (nouvelle
//   forme). Les deux formes sont lues. Le passage en Live recréera l'endpoint
//   sur la version courante du compte : déjà couvert.
//
//   PRÉREQUIS DE DÉPLOIEMENT : migration v1.1 exécutée AVANT de coller ce
//   fichier (colonne, index unique, table webhook_anomalies, RPC
//   get_user_id_by_email). Sans elle, toute création d'abonnement échoue.
//
//   Blocs volontairement INCHANGÉS : vérification de signature, tout le bloc
//   CADEAU (achat + rédemption), génération des livres, ordre des handlers.
// ============================================================================

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

// v2.1 [1] — Trace DURABLE. Chaque cas que le webhook choisit de ne pas
// traiter est enregistré en base, où il survit aux 24 h de logs du plan free.
// Ne lève jamais : une anomalie non enregistrable ne doit pas casser un
// paiement.
const logAnomaly = async (
  supabaseAdmin: any,
  a: { eventId?: string; eventType?: string; stripeObjectId?: string | null; reason: string; details?: any }
) => {
  try {
    await supabaseAdmin.from('webhook_anomalies').insert({
      source: 'stripe-webhook',
      event_id: a.eventId ?? null,
      event_type: a.eventType ?? null,
      stripe_object_id: a.stripeObjectId ?? null,
      reason: a.reason,
      details: a.details ?? null,
    });
  } catch (e) {
    logStep("Failed to record anomaly (non-blocking)", { error: String(e) });
  }
  logStep(`ANOMALY: ${a.reason}`, a.details);
};

// v2.1 [4] — Recherche ciblée, remplace le balayage listUsers().
const getUserIdByEmail = async (supabaseAdmin: any, email: string | null | undefined): Promise<string | null> => {
  if (!email) return null;
  const { data, error } = await supabaseAdmin.rpc('get_user_id_by_email', { p_email: email });
  if (error) {
    logStep("get_user_id_by_email failed", { error: error.message });
    return null;
  }
  return data ?? null;
};

// v2.1 [2] — Appariement. Priorité 1 : stripe_subscription_id (certain).
const findRowsByStripeId = async (supabaseAdmin: any, stripeSubscriptionId: string) => {
  const { data } = await supabaseAdmin
    .from('subscriptions')
    .select('id, status, is_active')
    .eq('stripe_subscription_id', stripeSubscriptionId);
  return data ?? [];
};

// Priorité 2 : (child_id, created_by) — lignes antérieures au backfill.
const findRowsByChild = async (supabaseAdmin: any, childId: string, userId: string) => {
  const { data } = await supabaseAdmin
    .from('subscriptions')
    .select('id, status, is_active')
    .eq('child_id', childId)
    .eq('created_by', userId);
  return data ?? [];
};

// v2.1 [C affiné] — billing_reason qui impliquent OBLIGATOIREMENT un abonnement.
const SUBSCRIPTION_BILLING_REASONS = new Set([
  "subscription_cycle",
  "subscription_update",
  "subscription_threshold",
]);

// v2.1 — `current_period_start/end` ont quitté la racine de l'objet
// Subscription dans les versions récentes (déplacés dans les items). Le SDK
// épinglé renvoie encore l'ancienne forme ; on lit les deux.
const readPeriodEnd = (subscription: any): number | null =>
  subscription?.current_period_end
  ?? subscription?.items?.data?.[0]?.current_period_end
  ?? null;

const readPeriodStart = (subscription: any): number | null =>
  subscription?.current_period_start
  ?? subscription?.items?.data?.[0]?.current_period_start
  ?? null;

// Génère un code cadeau lisible (sans caractères ambigus), ex: MCF-CADO-A2B4C6
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const generateGiftCode = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  let s = "";
  for (let i = 0; i < 6; i++) s += ALPHABET[bytes[i] % ALPHABET.length];
  return `MCF-CADO-${s}`;
};

serve(async (req) => {
  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    const signature = req.headers.get("stripe-signature");
    if (!signature) throw new Error("No stripe-signature header");

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      logStep("Webhook signature verification failed", { error: String(err) });
      return new Response("Webhook signature verification failed", { status: 400 });
    }

    logStep("Event received", { type: event.type, id: event.id });

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // ── Abonnement créé / Achat cadeau ─────────────────────────────────────
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      logStep("checkout.session.completed", { sessionId: session.id, mode: session.mode });

      // ── Achat d'un CADEAU (paiement unique par Paul) ─────────────────────
      if (session.mode === "payment" && session.metadata?.gift === "true") {
        // Idempotence : si ce paiement a déjà généré un code, on ne refait rien
        const { data: existingGift } = await supabaseAdmin
          .from('gift_codes')
          .select('id')
          .eq('stripe_checkout_session_id', session.id)
          .maybeSingle();
        if (existingGift) {
          logStep("Gift already processed", { sessionId: session.id });
          return new Response("OK", { status: 200 });
        }

        const durationMonths = parseInt(session.metadata?.duration_months || "0", 10);
        const couponId = session.metadata?.coupon_id || "";
        const purchaserName = session.metadata?.purchaser_name || null;
        const giftMessage = session.metadata?.gift_message || null;
        const purchaserEmail = session.customer_details?.email || null;
        const amountPaid = session.amount_total != null ? session.amount_total / 100 : null;
        const paymentIntentId = (session.payment_intent as string) || null;

        if (!couponId || ![3, 6, 12].includes(durationMonths)) {
          logStep("Invalid gift metadata, skipping", { couponId, durationMonths });
          return new Response("OK", { status: 200 });
        }

        // Génère un code promo UNIQUE (usage unique) rattaché au bon coupon
        let promo: Stripe.PromotionCode | null = null;
        for (let attempt = 0; attempt < 5 && !promo; attempt++) {
          try {
            promo = await stripe.promotionCodes.create({
              coupon: couponId,
              code: generateGiftCode(),
              max_redemptions: 1,
            });
          } catch (e) {
            const msg = String((e as any)?.message || "").toLowerCase();
            if (msg.includes("already")) continue; // collision très rare -> on retente
            throw e;
          }
        }
        if (!promo) throw new Error("Failed to generate a unique gift promotion code");

        const { error: giftInsertError } = await supabaseAdmin
          .from('gift_codes')
          .insert({
            code: promo.code,
            duration_months: durationMonths,
            stripe_coupon_id: couponId,
            stripe_promotion_code_id: promo.id,
            status: 'active',
            purchaser_email: purchaserEmail,
            purchaser_name: purchaserName,
            gift_message: giftMessage,
            stripe_checkout_session_id: session.id,
            stripe_payment_intent_id: paymentIntentId,
            amount_paid: amountPaid,
          });

        if (giftInsertError) {
          logStep("Error inserting gift_code", { error: giftInsertError.message });
          throw new Error(`Failed to insert gift_code: ${giftInsertError.message}`);
        }

        logStep("Gift code created", { code: promo.code, durationMonths });

        // Déclenche l'email de confirmation cadeau (workflow n8n), sans bloquer le webhook
        const n8nGiftUrl = Deno.env.get("N8N_GIFT_WEBHOOK_URL")
          || "https://mcf-automation-n8n.jnow9f.easypanel.host/webhook/gift-confirmation";
        try {
          await fetch(n8nGiftUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: purchaserEmail,
              purchaserName: purchaserName,
              giftMessage: giftMessage,
              durationMonths: durationMonths,
              code: promo.code,
            }),
          });
          logStep("Gift email workflow triggered", { to: purchaserEmail });
        } catch (e) {
          logStep("Failed to trigger gift email (non-blocking)", { error: String(e) });
        }

        return new Response("OK", { status: 200 });
      }

      if (session.mode !== "subscription") {
        return new Response("OK", { status: 200 });
      }

      const subscriptionId = session.subscription as string;
      const customerEmail = session.customer_details?.email;
      const childId = session.metadata?.child_id || null;

      const subscription: any = await stripe.subscriptions.retrieve(subscriptionId);
      const interval = subscription.items.data[0].price.recurring?.interval;
      // v2.1 — lecture défensive : ancienne forme (racine) ou nouvelle (items).
      const periodStart = readPeriodStart(subscription);
      const periodEnd = readPeriodEnd(subscription);
      if (!periodStart || !periodEnd) {
        await logAnomaly(supabaseAdmin, {
          eventId: event.id, eventType: event.type, stripeObjectId: subscriptionId,
          reason: "Période de facturation illisible à la création d'abonnement",
        });
        throw new Error(`Cannot read billing period for ${subscriptionId}`);
      }
      const startDate = new Date(periodStart * 1000).toISOString().split('T')[0];
      const endDate = new Date(periodEnd * 1000).toISOString().split('T')[0];
      const type = interval === "year" ? "annual" : "monthly";

      logStep("Subscription details", { subscriptionId, type, childId, customerEmail });

      let userId: string | null = null;
      let familyId: string | null = null;

      if (customerEmail) {
        // v2.1 [4] — recherche ciblée (listUsers ne renvoyait qu'une page de 50).
        userId = await getUserIdByEmail(supabaseAdmin, customerEmail);
        if (userId) {
          const { data: userProfile } = await supabaseAdmin
            .from('user_profiles')
            .select('family_id')
            .eq('id', userId)
            .single();
          familyId = userProfile?.family_id || null;
          logStep("User and family found", { userId, familyId });
        }
      }

      if (!userId) {
        // Cas réel fréquent : le client paie dans Stripe Checkout avec un autre
        // email que celui de son compte. On insère quand même (comportement v1,
        // et l'appariement fort par stripe_subscription_id fonctionnera), mais
        // on laisse une trace durable pour investigation.
        await logAnomaly(supabaseAdmin, {
          eventId: event.id, eventType: event.type, stripeObjectId: subscriptionId,
          reason: "Abonnement créé sans utilisateur Supabase correspondant (email Checkout ≠ email compte ?)",
          details: { customerEmail, childId },
        });
      }

      // v2.1 [3] — Idempotence SANS perte de rattrapage (option C blindée).
      // Rejeu -> on ne réinsère pas, mais on POURSUIT vers la génération des
      // livres et la rédemption cadeau. Course entre deux livraisons
      // simultanées -> tranchée par l'index UNIQUE (upsert ignoreDuplicates).
      let insertedSubId: string | null = null;

      const { data: existingRow } = await supabaseAdmin
        .from('subscriptions')
        .select('id')
        .eq('stripe_subscription_id', subscriptionId)
        .maybeSingle();

      if (existingRow) {
        insertedSubId = existingRow.id;
        logStep("Replay detected: subscription row already exists, continuing to book generation", {
          subscriptionRowId: insertedSubId,
        });
      } else {
        const { data: upserted, error: insertError } = await supabaseAdmin
          .from('subscriptions')
          .upsert({
            type,
            start_date: startDate,
            end_date: endDate,
            status: 'active',
            is_active: true,
            created_by: userId,
            family_id: familyId,
            child_id: childId || null,
            cancel_at: null,
            stripe_subscription_id: subscriptionId, // v2.1 [2] — appariement fort
            stripe_status: subscription.status,     // v2.2 — actif, en essai, incomplet…
          }, { onConflict: 'stripe_subscription_id', ignoreDuplicates: true })
          .select('id')
          .maybeSingle();

        if (insertError) {
          logStep("Error inserting subscription", { error: insertError.message });
          throw new Error(`Failed to insert subscription: ${insertError.message}`);
        }

        if (upserted?.id) {
          insertedSubId = upserted.id;
          logStep("Subscription inserted successfully", { subscriptionRowId: insertedSubId });
        } else {
          // Course perdue contre une livraison simultanée : l'autre exécution a
          // inséré. On récupère sa ligne et on poursuit normalement.
          const { data: raced } = await supabaseAdmin
            .from('subscriptions')
            .select('id')
            .eq('stripe_subscription_id', subscriptionId)
            .maybeSingle();
          insertedSubId = raced?.id ?? null;
          logStep("Concurrent insert detected, reusing existing row", { subscriptionRowId: insertedSubId });
        }
      }

      // ── Génération des livres (déterministe) ─────────────────────────────
      // Fait ICI, juste après la création de l'abonnement, pour éliminer la course
      // avec n8n (qui appelait la RPC avant que la ligne d'abonnement existe).
      if (childId) {
        try {
          const { data: childRow } = await supabaseAdmin
            .from('child_profiles')
            .select('family_id, user_id')
            .eq('id', childId)
            .single();

          if (childRow?.family_id && childRow?.user_id) {
            const { error: bookError } = await supabaseAdmin.rpc('generate_book_requests_for_child', {
              p_child_id: childId,
              p_family_id: childRow.family_id,
              p_created_by: childRow.user_id,
            });
            if (bookError) {
              logStep("Error generating book_requests", { error: bookError.message });
            } else {
              logStep("book_requests generated", { childId });
            }
          } else {
            logStep("Skipping book generation (missing family/user on child)", { childId });
          }
        } catch (e) {
          logStep("book generation failed (non-blocking)", { error: String(e) });
        }
      }

      // ── Rédemption d'un code CADEAU (Phase 4) ────────────────────────────
      // Si l'abonnement d'Elie a été créé avec un code promo cadeau, on marque
      // le gift_code correspondant comme redeemed et on lie Elie -> Paul (tracking).
      // Non bloquant : ne casse jamais la création d'abonnement.
      try {
        const subFull: any = await stripe.subscriptions.retrieve(subscriptionId, {
          expand: ['discounts.promotion_code'],
        });
        const disc = subFull?.discount
          || (Array.isArray(subFull?.discounts) ? subFull.discounts.find((d: any) => d && typeof d === 'object') : null);
        const pc = disc?.promotion_code;
        const promoCodeId = (pc && typeof pc === 'object') ? pc.id : (typeof pc === 'string' ? pc : null);

        if (promoCodeId) {
          const { error: giftUpdError } = await supabaseAdmin
            .from('gift_codes')
            .update({
              status: 'redeemed',
              redeemed_by_user_id: userId,
              redeemed_child_id: childId || null,
              redeemed_subscription_id: insertedSubId,
              redeemed_at: new Date().toISOString(),
            })
            .eq('stripe_promotion_code_id', promoCodeId)
            .eq('status', 'active');

          if (giftUpdError) {
            logStep("Error marking gift redeemed", { error: giftUpdError.message });
          } else {
            logStep("Gift redemption processed", { promoCodeId, redeemedBy: userId });
          }
        }
      } catch (e) {
        logStep("Gift redemption detection failed (non-blocking)", { error: String(e) });
      }
    }

    // ── Abonnement mis à jour (résiliation programmée ou réactivation) ─────
    if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object as Stripe.Subscription;
      logStep("customer.subscription.updated", { subscriptionId: subscription.id });

      const cancelAt = subscription.cancel_at
        ? new Date(subscription.cancel_at * 1000).toISOString()
        : null;

      const childId = subscription.metadata?.child_id || null;

      logStep("Updating subscription cancel_at", {
        cancelAt,
        childId,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      });

      // v2.1 [2] — Appariement fort d'abord. S'il aboutit, aucun appel
      // customers.retrieve ni recherche d'utilisateur n'est nécessaire.
      let rows = await findRowsByStripeId(supabaseAdmin, subscription.id);
      let matchedBy = "stripe_subscription_id";

      if (rows.length === 0 && childId) {
        // Repli pré-backfill : (child_id, created_by).
        const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
        const userId = await getUserIdByEmail(supabaseAdmin, customer.email);
        if (userId) {
          rows = await findRowsByChild(supabaseAdmin, childId, userId);
          matchedBy = "child_id";
        }
      }

      if (rows.length === 0) {
        // v2.1 [1] — Plus JAMAIS de mise à jour de masse par created_by. Un
        // événement non attribuable ne touche rien et laisse une trace durable.
        // Détecte aussi les abonnements « fantômes » créés à la main dans
        // Stripe sans métadonnée child_id.
        await logAnomaly(supabaseAdmin, {
          eventId: event.id, eventType: event.type, stripeObjectId: subscription.id,
          reason: "Mise à jour reçue pour un abonnement introuvable en base",
          details: { childId, cancelAt },
        });
        return new Response("OK", { status: 200 });
      }

      const targetIds = rows.filter((r: any) => r.is_active === true).map((r: any) => r.id);

      if (targetIds.length === 0) {
        logStep("No active row to update (replay on cancelled subscription)", { matchedBy });
      } else {
        const { error: updateError } = await supabaseAdmin
          .from('subscriptions')
          .update({
            cancel_at: cancelAt,
            // v2.2 [2] — c'est par cet evenement que Stripe annonce past_due,
            // unpaid ou le retour a active apres une relance reussie.
            stripe_status: subscription.status,
            updated_at: new Date().toISOString(),
          })
          .in('id', targetIds);

        if (updateError) {
          logStep("Error updating cancel_at", { error: updateError.message });
        } else {
          logStep("cancel_at updated successfully", { cancelAt, matchedBy, rows: targetIds.length });
        }
      }
    }

    // ── Renouvellement ─────────────────────────────────────────────────────
    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object as any;

      if (invoice.billing_reason === "subscription_create") {
        logStep("First invoice, already handled by checkout.session.completed");
        return new Response("OK", { status: 200 });
      }

      // v2.1 [C affiné] — cette facture appartient-elle par définition à un
      // abonnement ? Si oui, toute impossibilité de la traiter est une anomalie
      // VISIBLE (trace durable + 500 rouge dans le dashboard Stripe).
      const isSubscriptionInvoice = SUBSCRIPTION_BILLING_REASONS.has(invoice.billing_reason);

      // v2.1 [1] — LE BUG D'ORIGINE. `invoice.subscription` a quitté la racine.
      // Trois chemins de lecture : ancienne forme, nouvelle forme, ligne de
      // facture en dernier recours.
      const subscriptionId: string | null =
        (typeof invoice.subscription === 'string' ? invoice.subscription : null)
        ?? invoice.parent?.subscription_details?.subscription
        ?? invoice.lines?.data?.[0]?.parent?.subscription_item_details?.subscription
        ?? null;

      if (!subscriptionId) {
        if (isSubscriptionInvoice) {
          await logAnomaly(supabaseAdmin, {
            eventId: event.id, eventType: event.type, stripeObjectId: invoice.id,
            reason: "Facture d'abonnement sans ID d'abonnement lisible (nouveau déplacement de champ API ?)",
            details: { billing_reason: invoice.billing_reason },
          });
          return new Response("Subscription id not found on subscription invoice", { status: 500 });
        }
        logStep("No subscription id on non-subscription invoice, skipping", { invoiceId: invoice.id });
        return new Response("OK", { status: 200 });
      }

      const subscription: any = await stripe.subscriptions.retrieve(subscriptionId);
      const periodEnd = readPeriodEnd(subscription);

      if (!periodEnd) {
        if (isSubscriptionInvoice) {
          await logAnomaly(supabaseAdmin, {
            eventId: event.id, eventType: event.type, stripeObjectId: subscriptionId,
            reason: "current_period_end illisible sur un renouvellement",
          });
          return new Response("Cannot read period end", { status: 500 });
        }
        logStep("Cannot read period end on non-subscription invoice, skipping", { subscriptionId });
        return new Response("OK", { status: 200 });
      }

      const newEndDate = new Date(periodEnd * 1000).toISOString().split('T')[0];

      // child_id : métadonnées de la facture (nouvelle forme), de la ligne,
      // puis de l'abonnement en dernier recours.
      const childId: string | null =
        invoice.parent?.subscription_details?.metadata?.child_id
        ?? invoice.lines?.data?.[0]?.metadata?.child_id
        ?? subscription.metadata?.child_id
        ?? null;

      // v2.1 [2] — Appariement fort d'abord ; si trouvé, aucun appel
      // customers.retrieve ni recherche d'utilisateur.
      let rows = await findRowsByStripeId(supabaseAdmin, subscriptionId);
      let matchedBy = "stripe_subscription_id";

      if (rows.length === 0 && childId) {
        let email: string | null = invoice.customer_email ?? null;
        if (!email && invoice.customer) {
          const customer = await stripe.customers.retrieve(invoice.customer as string) as Stripe.Customer;
          email = (customer as any)?.email ?? null;
        }
        const userId = await getUserIdByEmail(supabaseAdmin, email);
        if (userId) {
          rows = await findRowsByChild(supabaseAdmin, childId, userId);
          matchedBy = "child_id";
        }
      }

      if (rows.length === 0) {
        // v2.1 [1] — Décision « A durable » : renouvellement non attribuable ->
        // on n'écrit RIEN (l'ancienne version écrasait end_date sur toute la
        // fratrie du parent) et la trace survit en base. Détecte aussi les
        // abonnements « fantômes » créés à la main dans Stripe.
        // 200 volontaire : rejouer ne rendrait pas l'événement attribuable.
        await logAnomaly(supabaseAdmin, {
          eventId: event.id, eventType: event.type, stripeObjectId: subscriptionId,
          reason: "Renouvellement reçu pour un abonnement introuvable en base — end_date NON mis à jour",
          details: { childId, newEndDate, billing_reason: invoice.billing_reason },
        });
        return new Response("OK", { status: 200 });
      }

      const targetIds = rows.filter((r: any) => r.status === 'active').map((r: any) => r.id);

      if (targetIds.length === 0) {
        logStep("No active row for renewal (replay on cancelled subscription?)", { matchedBy });
      } else {
        const { error: updateError } = await supabaseAdmin
          .from('subscriptions')
          .update({
            end_date: newEndDate,
            // v2.2 [3] — une relance Stripe qui aboutit leve l'alerte seule.
            stripe_status: 'active',
            payment_failed_at: null,
            payment_attempt_count: null,
            updated_at: new Date().toISOString(),
          })
          .in('id', targetIds);

        if (updateError) {
          logStep("Error updating subscription end date", { error: updateError.message });
        } else {
          logStep("Subscription renewed successfully", {
            newEndDate, matchedBy, childId, rows: targetIds.length,
          });
        }
      }
    }

    // ── Echec de paiement (v2.2) ───────────────────────────────────────────
    // Stripe emet cet evenement a CHAQUE tentative refusee : la premiere, puis
    // chaque relance intelligente (~2 a 3 semaines). `attempt_count` dit ou on
    // en est. Tant que payment_failed_at n'est pas NULL, le livre ne doit pas
    // partir en fabrication.
    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object as any;

      // Meme deplacement de champ que pour payment_succeeded : `subscription`
      // a quitte la racine dans les versions recentes de l'API.
      const subscriptionId: string | null =
        (typeof invoice.subscription === 'string' ? invoice.subscription : null)
        ?? invoice.parent?.subscription_details?.subscription
        ?? invoice.lines?.data?.[0]?.parent?.subscription_item_details?.subscription
        ?? null;

      if (!subscriptionId) {
        // Facture hors abonnement (cadeau) : un echec n'y concerne aucune ligne
        // de `subscriptions`. 200 volontaire, pas de rejeu.
        logStep("Payment failed on a non-subscription invoice, skipping", { invoiceId: invoice.id });
        return new Response("OK", { status: 200 });
      }

      const attemptCount = typeof invoice.attempt_count === 'number' ? invoice.attempt_count : null;
      const childId: string | null =
        invoice.parent?.subscription_details?.metadata?.child_id
        ?? invoice.lines?.data?.[0]?.metadata?.child_id
        ?? null;

      logStep("Payment FAILED", { subscriptionId, attemptCount, childId, amount: invoice.amount_due });

      // Appariement fort d'abord, repli sur (child_id, created_by).
      let rows = await findRowsByStripeId(supabaseAdmin, subscriptionId);
      let matchedBy = "stripe_subscription_id";

      if (rows.length === 0 && childId) {
        let email: string | null = invoice.customer_email ?? null;
        if (!email && invoice.customer) {
          const customer = await stripe.customers.retrieve(invoice.customer as string) as Stripe.Customer;
          email = (customer as any)?.email ?? null;
        }
        const userId = await getUserIdByEmail(supabaseAdmin, email);
        if (userId) {
          rows = await findRowsByChild(supabaseAdmin, childId, userId);
          matchedBy = "child_id";
        }
      }

      if (rows.length === 0) {
        // Un echec non attribuable est plus grave qu'un renouvellement non
        // attribuable : on ne peut pas prevenir Robin d'un impaye qu'on ne sait
        // pas rattacher. Trace durable, obligatoirement.
        await logAnomaly(supabaseAdmin, {
          eventId: event.id, eventType: event.type, stripeObjectId: subscriptionId,
          reason: "ECHEC DE PAIEMENT sur un abonnement introuvable en base",
          details: { childId, attemptCount, invoiceId: invoice.id },
        });
        return new Response("OK", { status: 200 });
      }

      // On marque toutes les lignes appariees, y compris deja resiliees : un
      // impaye sur un abonnement en cours de resiliation reste une information.
      const targetIds = rows.map((r: any) => r.id);

      const { error: failError } = await supabaseAdmin
        .from('subscriptions')
        .update({
          payment_failed_at: new Date().toISOString(),
          payment_attempt_count: attemptCount,
          stripe_status: 'past_due',
          updated_at: new Date().toISOString(),
        })
        .in('id', targetIds);

      if (failError) {
        logStep("Error recording payment failure", { error: failError.message });
      } else {
        logStep("Payment failure recorded", { matchedBy, rows: targetIds.length, attemptCount });
      }

      // Trace durable : les logs du plan free vivent 24 h, un impaye doit
      // survivre plus longtemps que ca.
      await logAnomaly(supabaseAdmin, {
        eventId: event.id, eventType: event.type, stripeObjectId: subscriptionId,
        reason: "Echec de paiement — ne pas lancer la fabrication du livre",
        details: {
          childId, attemptCount, matchedBy,
          amount_due: invoice.amount_due,
          hosted_invoice_url: invoice.hosted_invoice_url ?? null,
        },
      });
    }

    // ── Résiliation définitive ─────────────────────────────────────────────
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const childId = subscription.metadata?.child_id || null;

      logStep("Subscription cancelled definitively", { subscriptionId: subscription.id, childId });

      // v2.1 [2] — Appariement fort d'abord ; customers.retrieve seulement en
      // repli pré-backfill.
      let rows = await findRowsByStripeId(supabaseAdmin, subscription.id);
      let matchedBy = "stripe_subscription_id";

      if (rows.length === 0 && childId) {
        const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
        const userId = await getUserIdByEmail(supabaseAdmin, customer.email);
        if (userId) {
          rows = await findRowsByChild(supabaseAdmin, childId, userId);
          matchedBy = "child_id";
        }
      }

      if (rows.length === 0) {
        // v2.1 [1] — Résiliation non attribuable : on ne touche rien, trace
        // durable. Plus de repli de masse par created_by.
        await logAnomaly(supabaseAdmin, {
          eventId: event.id, eventType: event.type, stripeObjectId: subscription.id,
          reason: "Résiliation reçue pour un abonnement introuvable en base",
          details: { childId },
        });
        return new Response("OK", { status: 200 });
      }

      // v2.1 [3 du périmètre initial] — Filtre `status = 'active'` rétabli :
      // la branche childId de la v1 l'avait perdu et réécrivait updated_at sur
      // tout l'historique de l'enfant (les 7 lignes de Béline au même
      // horodatage). Rend aussi le rejeu idempotent : un `deleted` rejoué sur
      // une ligne déjà annulée ne touche plus rien.
      const targetIds = rows.filter((r: any) => r.status === 'active').map((r: any) => r.id);

      if (targetIds.length === 0) {
        logStep("No active row to cancel (replay, already cancelled)", { matchedBy });
      } else {
        const { error: cancelError } = await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'cancelled',
            is_active: false,
            updated_at: new Date().toISOString(),
          })
          .in('id', targetIds);

        if (cancelError) {
          logStep("Error cancelling subscription", { error: cancelError.message });
        } else {
          logStep("Subscription marked as cancelled", { matchedBy, rows: targetIds.length });
        }
      }
    }

    return new Response("OK", { status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log(`[STRIPE-WEBHOOK] ERROR - ${errorMessage}`);
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
});