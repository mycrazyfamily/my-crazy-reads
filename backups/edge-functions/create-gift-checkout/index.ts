import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Durée cadeau -> prix (paiement unique) + coupon (100% off N mois, restreint au produit MENSUEL)
const GIFT_PLANS: Record<number, { priceId: string; couponId: string }> = {
  3:  { priceId: "price_1TuC3sBm2xG2OMOvWaVyVwuC", couponId: "khCorpda" },
  6:  { priceId: "price_1TuC53Bm2xG2OMOvNkwWVTo0", couponId: "dI7RWO2H" },
  12: { priceId: "price_1TuC59Bm2xG2OMOvrzypwfqy", couponId: "UsMjr8lX" },
};

const MAX_NAME = 40;
const MAX_MESSAGE = 120;

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CREATE-GIFT-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Pas d'authentification requise : Paul (l'acheteur) peut offrir en invité.
    const { durationMonths, purchaserName, giftMessage } = await req.json();

    const plan = GIFT_PLANS[Number(durationMonths)];
    if (!plan) {
      logStep("Invalid gift duration", { durationMonths });
      throw new Error("Invalid gift duration");
    }

    // Sécurise et tronque les champs libres avant de les envoyer à Stripe (metadata)
    const name = String(purchaserName ?? "").trim().slice(0, MAX_NAME);
    const message = String(giftMessage ?? "").trim().slice(0, MAX_MESSAGE);

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("Missing STRIPE_SECRET_KEY");
      throw new Error("Stripe n'est pas configuré (clé manquante)");
    }
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    const origin = req.headers.get("origin") || "http://localhost:5173";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: plan.priceId, quantity: 1 }],
      // Stripe capte l'email de l'acheteur au checkout -> récupéré dans le webhook.
      metadata: {
        gift: "true",
        duration_months: String(Number(durationMonths)),
        coupon_id: plan.couponId,
        purchaser_name: name,
        gift_message: message,
      },
      success_url: `${origin}/cadeau/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cadeau?canceled=true`,
    });

    logStep("Gift checkout session created", {
      sessionId: session.id,
      durationMonths: Number(durationMonths),
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-gift-checkout", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: "Impossible de créer le paiement du cadeau. Veuillez réessayer." }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
