import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Renvoie UNIQUEMENT les champs d'affichage de la carte (jamais l'email acheteur / paiement).
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_id } = await req.json();
    if (!session_id) throw new Error("session_id required");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data } = await supabaseAdmin
      .from("gift_codes")
      .select("code, duration_months, purchaser_name, gift_message")
      .eq("stripe_checkout_session_id", session_id)
      .maybeSingle();

    // Le webhook est asynchrone : tant que la ligne n'existe pas, on répond "pas prêt".
    if (!data) {
      return new Response(JSON.stringify({ ready: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    return new Response(
      JSON.stringify({
        ready: true,
        code: data.code,
        durationMonths: data.duration_months,
        purchaserName: data.purchaser_name,
        giftMessage: data.gift_message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
