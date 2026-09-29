// ============================================================================
// cancel-subscription v1.1 — 11/08/2026
//
// CORRECTIF : la mise a jour Supabase ne ciblait pas le bon abonnement.
//   La v1.0 posait cancel_at sur TOUTES les lignes actives de l'enfant, sans
//   jamais regarder quel abonnement Stripe etait reellement annule. Un enfant
//   portant deux abonnements actifs voyait les deux marques — dont celui qu'on
//   voulait garder. Cas reel constate le 11/08/2026 sur « Shimer finale ».
//   Et si child_id manquait des metadonnees Stripe, la requete retombait sur
//   created_by seul : TOUS les abonnements de la famille etaient touches.
//
//   On cible desormais par stripe_subscription_id (appariement fort), avec
//   repli sur (child_id, created_by) pour les lignes anterieures au 06/08 qui
//   n'ont pas cette colonne renseignee. Si rien ne correspond, on n'ecrit PAS :
//   mieux vaut une ligne non mise a jour qu'une ecriture sur le mauvais
//   abonnement. MCF_Stripe_Reconcile detectera l'ecart la nuit suivante.
//
//   Meme motif que stripe-webhook v2.1.
//
// Note : cancel_at_period_end fonctionne aussi sur un abonnement en periode
// d'essai (create-checkout v2.0). Dans ce cas current_period_end vaut la fin
// de l'essai : annuler pendant l'essai ne declenche aucun prelevement et aucun
// livre. Comportement voulu.
//
// Le reste du fichier est inchange : authentification, verification que
// l'abonnement appartient bien a l'utilisateur, appel Stripe, feedback.
// ============================================================================

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CANCEL-SUBSCRIPTION] ${step}${detailsStr}`);
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

    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) throw new Error("User not authenticated");
    const user = userData.user;
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { subscription_id, reason, comment } = await req.json();
    if (!subscription_id) throw new Error("subscription_id is required");
    logStep("Request received", { subscription_id, reason });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Vérification ownership
    const subscription = await stripe.subscriptions.retrieve(subscription_id);
    const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;

    if (customer.email !== user.email) {
      logStep("Unauthorized cancellation attempt", { userId: user.id });
      throw new Error("Unauthorized: subscription does not belong to this user");
    }
    logStep("Ownership verified", { customerId: customer.id });

    // Annulation à la fin de la période
    const updatedSubscription = await stripe.subscriptions.update(subscription_id, {
      cancel_at_period_end: true,
    });

    const cancelAt = new Date(updatedSubscription.current_period_end * 1000).toISOString();
    logStep("Subscription scheduled for cancellation", { subscription_id, cancelAt });

    // Mise à jour Supabase
    const childId = subscription.metadata?.child_id || null;

    // ── v1.1 — CIBLAGE FORT PAR stripe_subscription_id ────────────────────
    // La v1.0 mettait a jour TOUTES les lignes actives de l'enfant :
    //     .eq('child_id', childId).eq('created_by', user.id).eq('is_active', true)
    // Un enfant portant deux abonnements actifs — cas reel du 11/08/2026 sur
    // « Shimer finale » — voyait donc les DEUX modifies, dont celui qu'on
    // voulait garder. Et si child_id manquait des metadonnees, la requete
    // retombait sur created_by seul et touchait TOUS les abonnements de la
    // famille.
    // Meme motif que stripe-webhook v2.1 : appariement fort d'abord, repli
    // ensuite. La colonne stripe_subscription_id existe depuis le 06/08.
    let targetIds: string[] = [];

    const { data: strongMatch } = await supabaseClient
      .from('subscriptions')
      .select('id')
      .eq('stripe_subscription_id', subscription_id)
      .eq('is_active', true);

    if (strongMatch && strongMatch.length > 0) {
      targetIds = strongMatch.map((r: any) => r.id);
      logStep("Matched by stripe_subscription_id", { count: targetIds.length });
    } else if (childId) {
      // Repli : lignes anterieures au 06/08, sans stripe_subscription_id.
      const { data: fallback } = await supabaseClient
        .from('subscriptions')
        .select('id')
        .eq('child_id', childId)
        .eq('created_by', user.id)
        .eq('is_active', true);
      targetIds = (fallback ?? []).map((r: any) => r.id);
      logStep("Fallback match by child_id", { count: targetIds.length });
    }

    if (targetIds.length === 0) {
      // On n'ecrit PAS a l'aveugle : mieux vaut une ligne non mise a jour
      // qu'une mise a jour sur le mauvais abonnement. Stripe reste la source
      // de verite, et MCF_Stripe_Reconcile detectera l'ecart la nuit suivante.
      logStep("No matching row in Supabase — nothing updated", { subscription_id, childId });
    } else {
      const { error: updateError } = await supabaseClient
        .from('subscriptions')
        .update({
          cancel_at: cancelAt,
          updated_at: new Date().toISOString(),
        })
        .in('id', targetIds);

      if (updateError) {
        logStep("Error updating cancel_at", { error: updateError.message });
      } else {
        logStep("cancel_at updated in Supabase", { rows: targetIds.length });
      }
    }

    // Enregistrement du feedback de résiliation
    if (reason) {
      const { error: feedbackError } = await supabaseClient
        .from('cancellation_feedback')
        .insert({
          subscription_id,
          child_id: childId,
          user_id: user.id,
          reason,
          comment: comment || null,
        });

      if (feedbackError) {
        logStep("Error saving cancellation feedback", { error: feedbackError.message });
      } else {
        logStep("Cancellation feedback saved", { reason });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      cancel_at: cancelAt,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
