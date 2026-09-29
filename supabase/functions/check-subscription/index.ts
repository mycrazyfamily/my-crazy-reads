// ============================================================================
// check-subscription v1.1 — 11/08/2026
//
// CORRECTIF : les abonnements en periode d'essai n'etaient pas reconnus.
//
//   La requete Stripe filtrait sur `status: "active"`. Or `active` et
//   `trialing` sont deux statuts DISTINCTS chez Stripe : un abonnement en
//   essai n'apparaissait tout simplement pas dans la liste.
//
//   Le defaut etait dormant jusqu'au 11/08/2026. Depuis create-checkout v2.0,
//   tout abonnement souscrit apres le 10 du mois s'ouvre en `trialing` — le
//   premier prelevement est reporte au 10, jour de cloture de la
//   personnalisation. Le filtre a donc commence a exclure une part croissante
//   des abonnes.
//
//   Consequence observee : l'abonne payait, sa carte etait enregistree,
//   `subscriptions` en base portait bien status='active' — mais l'application
//   le declarait NON abonne et lui reproposait de s'abonner. « Shimer finale »
//   s'est ainsi retrouve avec DEUX abonnements le meme jour.
//
//   Ce n'etait pas la base qui mentait, mais la question posee a Stripe.
//
// CHANGEMENT UNIQUE : on recupere tous les abonnements (`status: "all"`) et on
// filtre soi-meme sur les statuts qui valent couverture. Le reste du fichier
// est inchange : authentification, recherche du customer, forme de la reponse.
//
// ⚠️ Tout nouveau statut Stripe valant couverture devra etre ajoute a
//    COVERING_STATUSES. Voir aussi stripe-webhook v2.2, qui stocke le statut
//    brut dans subscriptions.stripe_status.
// ============================================================================

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

const getSafeErrorMessage = (errorMessage: string): string => {
  if (errorMessage.includes('not authenticated') || errorMessage.includes('authorization')) {
    return 'Authentication required';
  }
  if (errorMessage.includes('STRIPE') || errorMessage.includes('Stripe')) {
    return 'Payment service temporarily unavailable';
  }
  return 'An unexpected error occurred. Please try again.';
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) throw new Error(`Authentication error: ${userError?.message || 'Invalid token'}`);

    const userEmail = userData.user.email;
    if (!userEmail) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: userData.user.id, email: userEmail });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });

    if (customers.data.length === 0) {
      logStep("No customer found, returning unsubscribed state");
      return new Response(JSON.stringify({ subscribed: false, subscriptions: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // v1.1 — On ne filtre PLUS sur status:"active" côté Stripe.
    // `active` et `trialing` sont deux statuts DISTINCTS chez Stripe. Depuis
    // create-checkout v2.0, tout abonnement souscrit après le 10 s'ouvre en
    // `trialing` (premier prélèvement reporté au 10). Le filtre les excluait :
    // l'abonné payait, sa carte était enregistrée, et l'application le croyait
    // NON abonné — au point de lui proposer de se réabonner. Constaté le
    // 11/08/2026 sur « Shimer finale », abonné deux fois de suite.
    //
    // On récupère donc TOUS les abonnements et on filtre nous-mêmes sur les
    // statuts qui valent couverture. Volontairement exclus :
    //   · past_due / unpaid  -> impayés, traités par stripe-webhook v2.2 et
    //                           signalés en rouge au dashboard admin
    //   · incomplete         -> paiement initial jamais abouti
    //   · canceled / paused  -> plus de couverture
    const COVERING_STATUSES = ["active", "trialing"];

    const allSubscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 100,
    });
    const subscriptions = {
      data: allSubscriptions.data.filter((s) => COVERING_STATUSES.includes(s.status)),
    };

    logStep("Subscriptions fetched", {
      total: allSubscriptions.data.length,
      covering: subscriptions.data.length,
      statuses: allSubscriptions.data.map((s) => s.status),
    });

    const hasActiveSub = subscriptions.data.length > 0;
    let productId = null;
    let subscriptionEnd = null;
    let priceId = null;

    const detailedSubs = subscriptions.data.map((subscription) => {
      const price = subscription.items.data[0].price;
      const pid = typeof price.product === 'string' ? price.product : price.product?.id;
      return {
        subscription_id: subscription.id,
        child_id: (subscription.metadata && subscription.metadata.child_id) || null,
        product_id: pid,
        price_id: price.id,
        subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
        status: subscription.status,
        cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
      };
    });

    if (hasActiveSub) {
      const first = detailedSubs[0];
      productId = first.product_id;
      priceId = first.price_id;
      subscriptionEnd = first.subscription_end;
      logStep("Active subscription(s) found", { count: detailedSubs.length });
    } else {
      logStep("No active subscription found");
    }

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      product_id: productId,
      price_id: priceId,
      subscription_end: subscriptionEnd,
      subscriptions: detailedSubs
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: getSafeErrorMessage(errorMessage) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
