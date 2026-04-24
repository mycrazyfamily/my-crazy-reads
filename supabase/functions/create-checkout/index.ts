import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Whitelist of allowed price IDs for the application
const ALLOWED_PRICE_IDS = [
  'price_1SLPZIBm2xG2OMOvLXjO6KqM', // Monthly subscription
  'price_1TPk8lBm2xG2OMOvTmJ1KQzT', // Yearly subscription
];

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

// Helper to sanitize error messages for client response
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

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { priceId, childId } = await req.json();
    
    // Validate priceId against whitelist
    if (!priceId) throw new Error("Price ID is required");
    if (!ALLOWED_PRICE_IDS.includes(priceId)) {
      logStep("Invalid price ID attempted", { priceId });
      throw new Error("Invalid price selection");
    }
    logStep("Price ID validated", { priceId, childId });

    // Validate childId ownership if provided
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
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    // Verify the price details from Stripe to ensure correct configuration
    const priceDetails = await stripe.prices.retrieve(priceId);
    logStep("Stripe price details", { 
      priceId, 
      amount: priceDetails.unit_amount, 
      currency: priceDetails.currency,
      interval: priceDetails.recurring?.interval,
      product: priceDetails.product
    });
    
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      logStep("No existing customer, will create at checkout");
    }

    const origin = req.headers.get("origin") || "http://localhost:5173";
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      subscription_data: {
        metadata: {
          child_id: childId || "",
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
    // Log full error server-side for debugging
    logStep("ERROR in create-checkout", { message: errorMessage });
    // Return sanitized error to client
    return new Response(JSON.stringify({ error: getSafeErrorMessage(errorMessage) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
