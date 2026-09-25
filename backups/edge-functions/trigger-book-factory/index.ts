// ============================================================================
// trigger-book-factory v1.1 — 24/09/2026
//
// SECURITE : SEUL L'ADMINISTRATEUR PEUT LANCER UNE FABRICATION.
//   Constat : la verification du JWT de Supabase (« Verify JWT with legacy
//   secret ») laisse passer n'importe quel JWT signe par le projet, y compris
//   la cle anon, publique, lisible dans le code du site. La fonction ne
//   regardait pas QUI appelait : n'importe quel parent connecte, ou n'importe
//   qui muni de la cle anon, pouvait lancer la fabrication d'un livre dont il
//   connaissait l'identifiant, en contournant le blocage « Impaye » du
//   dashboard admin, pour environ 3,55 EUR par lancement.
//
//   Correctif : avant toute lecture, la fonction appelle public.is_mcf_admin()
//   AU NOM DE L'APPELANT (client cree avec la cle anon et le jeton recu). C'est
//   la regle deja utilisee par les policies RLS de l'admin : une seule
//   definition de l'administrateur, en base. Refus :
//     401 si aucun jeton ;
//     403 si le jeton n'est pas celui de l'administrateur (cle anon seule,
//         parent connecte, et aussi la cle service_role, pour laquelle
//         auth.uid() est vide).
//   Seul appelant legitime connu : le bouton « Lancer » de mcf-book-magic, qui
//   envoie la session de l'administrateur. Il n'est pas modifie.
//
//   Inchange : le reglage JWT de la fonction (active), la lecture du
//   book_request, l'appel a n8n avec l'en-tete X-MCF-Secret, les reponses.
//
//   Premiere banniere de ce fichier. La version precedente, sans numero, est
//   la v1.0 conservee dans backups/edge-functions/trigger-book-factory/.
// ============================================================================
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
    // v1.1 — Controle de l'appelant, AVANT toute lecture ou tout appel a n8n.
    const supabaseUrlAuth = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrlAuth || !anonKey) throw new Error("SUPABASE_URL ou SUPABASE_ANON_KEY non configuré");

    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!token) {
      return new Response(
        JSON.stringify({ error: "Authentification requise" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // is_mcf_admin() lit auth.uid() : elle doit etre appelee AU NOM de
    // l'appelant, d'ou ce client a part, porteur de son jeton.
    const callerClient = createClient(supabaseUrlAuth, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false },
    });
    const { data: isAdmin, error: adminError } = await callerClient.rpc("is_mcf_admin");
    if (adminError || isAdmin !== true) {
      console.warn("Refused: caller is not MCF admin", adminError ? String(adminError.message) : "");
      return new Response(
        JSON.stringify({ error: "Accès réservé à l'administrateur" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
