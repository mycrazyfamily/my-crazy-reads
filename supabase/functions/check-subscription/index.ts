import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
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
    logStep("Authenticating user with token");

    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) throw new Error(`Authentication error: ${claimsError?.message || 'Invalid token'}`);

    const userId = claimsData.claims.sub;
    const userEmail = claimsData.claims.email as string;
    if (!userEmail) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId, email: userEmail });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });

    if (customers.data.length === 0) {
      logStep("No customer found, updating unsubscribed state");
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 100,
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
