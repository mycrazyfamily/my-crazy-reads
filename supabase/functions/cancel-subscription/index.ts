import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CANCEL-SUBSCRIPTION] ${step}${detailsStr}`);
};

const safeError = (msg: string) => {
  if (msg.includes("authorization") || msg.includes("authenticated")) return "Authentication required";
  if (msg.toLowerCase().includes("stripe")) return "Payment service temporarily unavailable";
  if (msg.includes("not found") || msg.includes("forbidden")) return "Subscription not found";
  return "An unexpected error occurred. Please try again.";
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) throw new Error("No authorization header provided");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) throw new Error("Authentication error");

    const userEmail = claimsData.claims.email as string;
    if (!userEmail) throw new Error("User not authenticated");
    logStep("User authenticated", { email: userEmail });

    const body = await req.json().catch(() => ({}));
    const subscriptionId = body?.subscription_id;
    if (!subscriptionId || typeof subscriptionId !== "string" || !subscriptionId.startsWith("sub_")) {
      return new Response(JSON.stringify({ error: "Invalid subscription_id" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Verify ownership: subscription's customer email must match the authenticated user
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
    const customer = await stripe.customers.retrieve(customerId);
    const customerEmail = (customer as any)?.email;
    if (!customerEmail || customerEmail.toLowerCase() !== userEmail.toLowerCase()) {
      logStep("Ownership mismatch", { customerEmail, userEmail });
      throw new Error("forbidden");
    }

    const updated = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
    logStep("Subscription set to cancel at period end", { id: updated.id });

    const cancelAt = updated.cancel_at
      ? new Date(updated.cancel_at * 1000).toISOString()
      : new Date(updated.current_period_end * 1000).toISOString();

    return new Response(JSON.stringify({
      success: true,
      subscription_id: updated.id,
      cancel_at: cancelAt,
      cancel_at_period_end: updated.cancel_at_period_end,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: safeError(msg) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
