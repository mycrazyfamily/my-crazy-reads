import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const webhookSecret = Deno.env.get("N8N_WEBHOOK_SECRET");
    if (!webhookSecret) throw new Error("N8N_WEBHOOK_SECRET non configuré");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { book_request_id } = await req.json();

    if (!book_request_id) {
      return new Response(
        JSON.stringify({ error: "book_request_id requis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Récupère le book_request complet
    const { data: record, error } = await supabase
      .from("book_requests")
      .select("*")
      .eq("id", book_request_id)
      .single();

    if (error || !record) {
      return new Response(
        JSON.stringify({ error: "book_request introuvable" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Triggering n8n for book_request_id:", book_request_id);

    // Fire and forget
    fetch(
      "https://mcf-automation-n8n.jnow9f.easypanel.host/webhook/6ca684eb-00f6-4646-8651-a5c0abc69292",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-MCF-Secret": webhookSecret,
        },
        body: JSON.stringify({ record }),
      }
    ).catch((err) => console.error("n8n fetch error:", err));

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", String(error));
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});