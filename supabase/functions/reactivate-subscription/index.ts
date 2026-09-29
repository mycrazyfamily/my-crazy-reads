// ============================================================================
// reactivate-subscription v1.1 — 11/08/2026
//
// CORRECTIF : symetrique de cancel-subscription v1.1.
//   La v1.0 remettait cancel_at a NULL sur TOUTES les lignes actives de
//   l'enfant, sans regarder quel abonnement Stripe etait reactive. Un enfant
//   portant deux abonnements voyait les deux reactives ; sans child_id dans les
//   metadonnees, c'etait toute la famille.
//   Le sens est ici plus grave que pour l'annulation : on RETIRE une
//   resiliation programmee. Un parent qui reactive un abonnement pouvait ainsi
//   en reactiver un autre a son insu, et se voir facturer.
//
//   On cible desormais par stripe_subscription_id, avec repli sur
//   (child_id, created_by). Si rien ne correspond, on n'ecrit pas.
//
// Le reste du fichier est inchange.
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
  console.log(`[REACTIVATE-SUBSCRIPTION] ${step}${detailsStr}`);
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

    const { subscription_id } = await req.json();
    if (!subscription_id) throw new Error("subscription_id is required");
    logStep("Subscription ID received", { subscription_id });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Vérification ownership
    const subscription = await stripe.subscriptions.retrieve(subscription_id);
    const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;

    if (customer.email !== user.email) {
      logStep("Unauthorized reactivation attempt", { userId: user.id });
      throw new Error("Unauthorized: subscription does not belong to this user");
    }
    logStep("Ownership verified", { customerId: customer.id });

    // Réactivation — annule la résiliation programmée
    await stripe.subscriptions.update(subscription_id, {
      cancel_at_period_end: false,
    });

    logStep("Subscription reactivated successfully", { subscription_id });

    // Mise à jour Supabase — remet cancel_at à null
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
          cancel_at: null,
          updated_at: new Date().toISOString(),
        })
        .in('id', targetIds);

      if (updateError) {
        logStep("Error updating cancel_at", { error: updateError.message });
      } else {
        logStep("cancel_at updated in Supabase", { rows: targetIds.length });
      }
    }

    return new Response(JSON.stringify({ success: true }), {
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
