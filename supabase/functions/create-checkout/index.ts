// ============================================================================
// create-checkout v2.2 — 29/09/2026
//
// Changelog v2.2 : ADRESSE DE LIVRAISON, FACTURATION ET TELEPHONE.
//   Aucune adresse postale n'etait demandee : on ne savait pas ou envoyer les livres
//   (constat du 29/09). Checkout demande desormais :
//     · l'adresse de livraison, FRANCE UNIQUEMENT (le code FR de Stripe couvre la
//       metropole et la Corse ; Monaco et les DOM-TOM ont leur propre code et sont
//       donc refuses) ;
//     · l'adresse de facturation (obligatoire) ;
//     · le telephone (obligatoire : Stripe ne propose pas de champ facultatif),
//       utile au transporteur.
//   Un message au-dessus de l'adresse annonce la zone de livraison et la
//   possibilite de la modifier plus tard dans « Mon abonnement ».
//   Client Stripe deja connu (deuxieme enfant, reabonnement) : customer_update
//   enregistre l'adresse saisie sur sa fiche Stripe, qui la pre-remplira ensuite.
//   L'adresse devient celle de la famille via stripe-webhook (table
//   shipping_addresses, adresse_livraison_v1.sql).
//   Rien d'autre ne change : dates, report du prelevement au 10, message de paiement,
//   codes promo, metadonnees, verifications.
//
// create-checkout v2.1 — 11/08/2026
//
// Changelog v2.1 : message de la page de paiement reformule.
//   Stripe intitule la periode « X jours gratuits » et le bouton « Demarrer la
//   periode d'essai » — libelles non modifiables. Un essai gratuit sous-entend
//   qu'on utilise le produit sans payer ; ici le client ne recoit RIEN pendant
//   ces jours-la, il attend. La question qu'il se pose est « gratuit pour
//   quoi ? ». Le message y repond explicitement : aucun livre n'est envoye
//   avant le premier prelevement, et ce temps sert a personnaliser l'histoire.
//
// create-checkout v2.0 — 11/08/2026
//
// Changelog v2.0 :
//
//   [1] SEUIL 20 -> 10. Ce fichier portait encore l'ancienne regle, et son
//       message s'affiche SUR LA PAGE DE PAIEMENT STRIPE. Un client du 11 aout
//       y lisait « debut septembre » alors que le site, l'email et la page de
//       confirmation annoncaient tous octobre. La contradiction tombait a
//       l'ecran ou elle coute le plus cher.
//
//   [2] BUG DE DEBORDEMENT corrige. setMonth() conserve le JOUR du mois : un
//       abonnement du 31 decembre donnait « 31 fevrier » -> 3 mars, et le
//       client se voyait annoncer mars au lieu de fevrier. On vise desormais
//       le 1er du mois cible, jour qui existe toujours.
//
//   [3] REPORT DU PREMIER PRELEVEMENT AU 10, via subscription_data.trial_end.
//       Tout le monde est preleve le 10 — le jour ou la personnalisation se
//       ferme et ou le livre part en fabrication. Personne ne paie pour un
//       livre qu'il n'a pas pu personnaliser.
//       Sans ce report, un abonne du 11 aout etait debite le 11 aout PUIS le
//       11 septembre — 59,98 € — avant de recevoir son livre debut octobre.
//       Un abonne du 5 aout, lui, ne payait qu'une fois. La regle est
//       desormais la meme pour tous : un prelevement, ~3 semaines avant le
//       livre, et une seule date de facturation dans tout le portefeuille.
//
//   ⚠️ STRIPE PRESENTE CETTE PERIODE COMME UN « ESSAI GRATUIT ».
//      C'est inevitable et visible par le client sur la page de paiement.
//      `custom_text.submit.message` est le seul endroit ou l'on peut expliquer
//      de quoi il s'agit reellement : il annonce donc la date de prelevement.
//      Les mails Stripe « votre essai se termine bientot » sont a DESACTIVER
//      dans Reglages -> Facturation -> Abonnements et e-mails.
//
//   La carte est collectee ET validee pendant la periode : comportement par
//   defaut de Checkout, non desactive. `payment_method_collection` reste donc
//   implicite (`always`).
//
//   Le reste du fichier est inchange : authentification, validation du
//   priceId, verification que l'enfant appartient bien a l'utilisateur,
//   recherche du customer, metadonnees et messages d'erreur.
// ============================================================================

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ALLOWED_PRICE_IDS = [
  'price_1SLPZIBm2xG2OMOvLXjO6KqM', // Monthly 29,99€
  'price_1TPk8lBm2xG2OMOvTmJ1KQzT', // Yearly 299,99€
];

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

const getSafeErrorMessage = (errorMessage: string): string => {
  if (errorMessage.includes('not authenticated') || errorMessage.includes('authorization')) {
    return 'Authentication required';
  }
  if (errorMessage.includes('STRIPE') || errorMessage.includes('Stripe') || errorMessage.includes('configuré')) {
    return 'Payment service temporarily unavailable';
  }
  if (errorMessage.includes('Invalid price')) {
    return 'Invalid subscription selection';
  }
  if (errorMessage.includes('unauthorized child') || errorMessage.includes('Invalid or unauthorized')) {
    return 'Invalid selection';
  }
  return 'An unexpected error occurred. Please try again.';
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { priceId, childId } = await req.json();

    if (!priceId) throw new Error("Price ID is required");
    if (!ALLOWED_PRICE_IDS.includes(priceId)) {
      logStep("Invalid price ID attempted", { priceId });
      throw new Error("Invalid price selection");
    }
    logStep("Price ID validated", { priceId, childId });

    if (childId) {
      const { data: childProfile, error: childError } = await supabaseClient
        .from('child_profiles')
        .select('id')
        .eq('id', childId)
        .eq('user_id', user.id)
        .single();

      if (childError || !childProfile) {
        logStep("Invalid or unauthorized child ID", { childId, error: childError?.message });
        throw new Error("Invalid or unauthorized child profile");
      }
      logStep("Child ID validated", { childId });
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("Missing STRIPE_SECRET_KEY");
      throw new Error("Stripe n'est pas configuré (clé manquante)");
    }
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      logStep("No existing customer, will create at checkout");
    }

    const origin = req.headers.get("origin") || "http://localhost:5173";

    // ═══════════════════════════════════════════════════════════════════════
    // v2.0 — DATES : mois de livraison + report du premier prélèvement au 10
    // ═══════════════════════════════════════════════════════════════════════
    // Jour de clôture de la personnalisation. Contrainte imprimeur.
    // ⚠️ CETTE RÈGLE EXISTE À QUATRE ENDROITS, dans quatre exécutions
    //    différentes. Elles doivent rester d'accord :
    //      1. SQL   generate_book_requests_for_child -> personalization_deadline
    //      2. front src/utils/deliveryMonth.ts       -> mois annoncé sur le site
    //      3. n8n   MCF_Email_Confirmation           -> mois annoncé dans l'email
    //      4. ICI                                    -> message sur la page Stripe
    const PERSONALIZATION_DEADLINE_DAY = 10;

    const today = new Date();
    const day = today.getDate();

    // Règle produit : souscription APRÈS le 10 -> pas de livre en N+1, le
    // premier arrive en N+2. Le jour du seuil lui-même reste inclus.
    const deliveryOffset = day > PERSONALIZATION_DEADLINE_DAY ? 2 : 1;

    // v2.0 [2] — on vise le 1er du mois cible plutôt que de décaler la date du
    // jour : le 1er existe dans tous les mois, donc aucun débordement possible.
    const deliveryDate = new Date(today.getFullYear(), today.getMonth() + deliveryOffset, 1);
    const deliveryMonth = deliveryDate.toLocaleDateString('fr-FR', { month: 'long' });

    // ── v2.0 [3] — Report du premier prélèvement au prochain 10 ────────────
    // Celui de ce mois si on ne l'a pas dépassé, sinon celui du mois suivant.
    // Midi UTC : loin des bascules d'heure d'été, et le prélèvement tombe dans
    // la journée du 10, pendant que la personnalisation est encore ouverte.
    const nextDeadline = new Date(Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth() + (day > PERSONALIZATION_DEADLINE_DAY ? 1 : 0),
      PERSONALIZATION_DEADLINE_DAY,
      12, 0, 0,
    ));

    // Garde de sécurité : Stripe refuse un trial_end trop proche. En deçà de
    // 48 h on prélève immédiatement — l'écart avec le 10 est d'un jour ou deux,
    // sans conséquence, alors qu'une session refusée bloquerait la vente.
    const MIN_TRIAL_MS = 48 * 60 * 60 * 1000;
    const useTrial = nextDeadline.getTime() - today.getTime() >= MIN_TRIAL_MS;
    const trialEndUnix = Math.floor(nextDeadline.getTime() / 1000);
    const deadlineLabel = nextDeadline.toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', timeZone: 'UTC',
    });

    // Message affiché juste au-dessus du bouton de paiement Stripe.
    // Stripe présentera la période comme un « essai gratuit » : ce texte est le
    // seul endroit où l'on peut expliquer de quoi il s'agit réellement.
    const deliveryMessage = useTrial
      ? `Aucun livre n'est envoyé pendant cette période : elle vous laisse jusqu'au ${deadlineLabel} pour personnaliser l'histoire. Premier prélèvement le ${deadlineLabel}, livre livré début ${deliveryMonth}.`
      : `Votre premier livre sera livré début ${deliveryMonth}.`;

    logStep("Dates computed", {
      day, deliveryOffset, deliveryMonth,
      useTrial, trialEnd: useTrial ? nextDeadline.toISOString() : null,
    });

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      allow_promotion_codes: true, // permet la saisie d'un code promo (ex : FRIENDSFAMILY) au checkout
      metadata: {
        child_id: childId || "",
      },
      subscription_data: {
        metadata: {
          child_id: childId || "",
        },
        // v2.0 [3] — la carte est collectée ET validée pendant la période :
        // comportement par défaut de Checkout, on ne le désactive pas.
        ...(useTrial ? { trial_end: trialEndUnix } : {}),
      },
      // v2.2 — adresse de livraison (France uniquement), facturation, telephone.
      shipping_address_collection: { allowed_countries: ["FR"] },
      billing_address_collection: "required",
      phone_number_collection: { enabled: true },
      // v2.2 — client deja connu : l'adresse saisie est enregistree sur sa fiche
      // Stripe (et la pre-remplira la prochaine fois). Parametre refuse par Stripe
      // sans `customer`, d'ou la condition.
      ...(customerId ? { customer_update: { shipping: "auto", address: "auto", name: "auto" } } : {}),
      custom_text: {
        // v2.2 — zone de livraison, affichee au-dessus de l'adresse.
        shipping_address: {
          message: "Livraison en France métropolitaine et en Corse. Vous pourrez modifier cette adresse à tout moment depuis votre espace, rubrique « Mon abonnement ».",
        },
        submit: {
          message: deliveryMessage,
        },
      },
      success_url: `${origin}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/abonnement?canceled=true`,
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: getSafeErrorMessage(errorMessage) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
