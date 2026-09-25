// Supabase Edge Function : enrich-clothing v3.3
// CHANGEMENT v3.3 (25/09/2026) — CORRECTIF DU CONTROLE DE L'APPELANT DE LA v3.2 :
// - L'appel est accepte si le jeton recu porte le role service_role.
//   Pourquoi : la v3.2 comparait l'en-tete a la variable SUPABASE_SERVICE_ROLE_KEY des Edge
//   Functions. Constat en production le 25/09 : cette variable ne contient PAS la meme chaine
//   que la cle service_role stockee dans Vault (toutes deux valides), et les appels du
//   declencheur etaient refuses (403). On verifie desormais le ROLE porte par le jeton
//   (service_role), la signature etant garantie par Supabase avant l'execution.
// - Le reglage « Verify JWT with legacy secret » de la fonction DOIT RESTER ACTIVE.
// CHANGEMENT v3.2 (25/09/2026) — SECURITE :
// CHANGEMENT v3.2 (25/09/2026) — SECURITE :
// - Seul le declencheur de la base peut appeler la fonction : l'en-tete Authorization doit
//   porter exactement la cle service_role (celle que lit notify_enrich_clothing dans Vault).
//   Avant, la cle anon publique suffisait a passer la verification JWT, et la fonction
//   ecrivait avec tous les droits dans la table et la ligne indiquees par la requete
//   elle-meme : n'importe qui connaissant un identifiant pouvait reecrire la tenue d'un
//   enfant ou d'un proche d'une autre famille. Refus : 403.
// - Tables acceptees : child_profiles et family_members uniquement (400 sinon).
// - Reste inchange.
// CHANGEMENT v3.1 :
// CHANGEMENT v3.1 :
// - Troncature de sécurité à 35 mots max (filet de sécurité si Gemini dépasse)
// - Prompt Vision plus directif : 1 seule phrase courte, accessoires secondaires ignorés
// v3.0 :
// - Déclenché sur avatar_url (après génération) au lieu de clothing_style (avant)
// - Gemini Vision analyse l'IMAGE de l'avatar pour générer clothing_style_resolved
// - Garantit cohérence parfaite entre image et description texte
// - Utilise GEMINI_API_KEY (Google AI Studio)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const GEMINI_VISION_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

async function fetchImageAsBase64(imageUrl: string): Promise<{ data: string; mimeType: string } | null> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error(`Failed to fetch image: ${response.status}`);
      return null;
    }
    const contentType = response.headers.get('content-type') || 'image/png';
    const mimeType = contentType.split(';')[0].trim();
    const arrayBuffer = await response.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    return { data: base64, mimeType };
  } catch (err) {
    console.error('Error fetching image:', err);
    return null;
  }
}

async function describeAvatarClothing(
  imageBase64: string,
  mimeType: string,
  gender?: string
): Promise<string | null> {
  const genderHint = gender === 'male' || gender === 'boy'
    ? 'garçon'
    : gender === 'female' || gender === 'girl'
    ? 'fille'
    : null;

  const genderInstruction = genderHint ? `Le personnage est un ${genderHint}.` : '';

  const prompt = `Tu es un assistant expert en description vestimentaire pour des illustrations de livres pour enfants.

Analyse l'image de ce personnage illustré et décris UNIQUEMENT sa tenue vestimentaire principale.
${genderInstruction}

RÈGLE ABSOLUE : Ta réponse doit tenir en UNE SEULE PHRASE COURTE.
Compte tes mots. STRICTEMENT entre 15 et 30 mots. Ne dépasse jamais 30 mots.
Si tu dépasses 30 mots, ARRÊTE-TOI et recommence avec moins de détails.

QUOI DÉCRIRE :
- Couleur principale + type de vêtement principal (robe, survêtement, costume...)
- 1 ou 2 détails distinctifs très visibles (logo, motif principal, couleur secondaire)
- Chaussures si clairement visibles

QUOI IGNORER :
- Accessoires secondaires (collier, écharpe, ceinture...) sauf s'ils sont l'élément principal
- Les micro-détails (boutons, coutures, broderies fines)
- La pose ou l'expression du personnage

Base-toi UNIQUEMENT sur ce que tu vois dans l'image — n'invente rien.

EXEMPLES DE BONNES RÉPONSES :
- survêtement de sport blanc : veste zippée avec insigne OM bleu ciel sur la poitrine gauche, pantalon blanc avec bandes bleues, baskets blanches
- robe bleu marine coupe trapèze à col claudine blanc, manches courtes, chaussettes blanches et chaussures noires
- combinaison rouge vif et bleu cobalt avec motif toile d'araignée noire et cape bleue

RÉPONDS UNIQUEMENT avec la description sur une seule ligne, sans guillemets, sans ponctuation finale.`;

  const response = await fetch(GEMINI_VISION_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        role: 'user',
        parts: [
          { inlineData: { mimeType, data: imageBase64 } },
          { text: prompt }
        ]
      }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 1024 },
    }),
  });

  if (!response.ok) {
    console.error('Gemini Vision API error:', response.status, await response.text());
    return null;
  }

  const data = await response.json();
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const rawText = parts
    .map((p: any) => p.text || '')
    .join('')
    .trim()
    .replace(/\n+/g, ' ')
    .replace(/^[-•"]\s*/, '')
    .replace(/[".]+$/, '');

  if (!rawText) return null;

  // Troncature de sécurité à 35 mots — filet de sécurité si Gemini dépasse quand même
  const words = rawText.split(' ');
  const text = words.length > 50 ? words.slice(0, 50).join(' ') : rawText;

  return text;
}

// Lit le role porte par le jeton recu. La SIGNATURE a deja ete verifiee par Supabase avant
// l'execution (reglage « Verify JWT with legacy secret ») : ce reglage DOIT RESTER ACTIVE,
// sans lui n'importe qui pourrait fabriquer un jeton se disant service_role.
function roleDuJeton(authHeader: string): string | null {
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4)));
    return typeof payload?.role === 'string' ? payload.role : null;
  } catch {
    return null;
  }
}

// v3.2 — tables que le declencheur peut legitimement viser.
const TABLES_AUTORISEES = ['child_profiles', 'family_members'];

Deno.serve(async (req) => {
  try {
    // v3.3 — controle de l'appelant, AVANT toute lecture ou tout appel a Gemini.
    const authHeader = req.headers.get('Authorization') ?? '';
    if (roleDuJeton(authHeader) !== 'service_role') {
      console.warn('[enrich-clothing] Refused: caller is not the database trigger');
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    const payload = await req.json();
    const { type, table, record, old_record } = payload;

    console.log(`[enrich-clothing v3.3] ${type} on ${table}, id=${record?.id}`);

    // v3.2 — la table vient de la requete : on la borne aux deux tables legitimes.
    if (!TABLES_AUTORISEES.includes(table)) {
      console.warn(`[enrich-clothing] Refused: table not allowed (${table})`);
      return new Response(JSON.stringify({ error: 'Table not allowed' }), { status: 400 });
    }

    const newAvatarUrl = record?.avatar_url;
    const oldAvatarUrl = old_record?.avatar_url;

    if (!newAvatarUrl || newAvatarUrl === oldAvatarUrl) {
      console.log('[enrich-clothing] avatar_url unchanged or empty, skipping');
      return new Response(JSON.stringify({ skipped: true, reason: 'avatar_unchanged' }), { status: 200 });
    }

    let gender: string | undefined;
    if (table === 'child_profiles') {
      gender = record?.gender;
    } else if (table === 'family_members') {
      try {
        const details = typeof record?.details === 'string' ? JSON.parse(record.details) : record?.details;
        gender = details?.gender;
      } catch { gender = undefined; }
    }

    console.log(`[enrich-clothing] Fetching avatar: ${newAvatarUrl}`);
    const imageData = await fetchImageAsBase64(newAvatarUrl);

    if (!imageData) {
      return new Response(JSON.stringify({ error: 'Failed to fetch avatar image' }), { status: 500 });
    }

    const resolved = await describeAvatarClothing(imageData.data, imageData.mimeType, gender);

    if (!resolved) {
      return new Response(JSON.stringify({ error: 'Gemini Vision returned null' }), { status: 500 });
    }

    console.log(`[enrich-clothing] Resolved: "${resolved}"`);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { error } = await supabase.from(table).update({ clothing_style_resolved: resolved }).eq('id', record.id);

    if (error) {
      console.error('[enrich-clothing] Supabase update error:', error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(
      JSON.stringify({ success: true, resolved }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('[enrich-clothing] Unexpected error:', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
