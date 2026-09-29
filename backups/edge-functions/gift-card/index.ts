// ============================================================================
// gift-card v1.1 — 29/09/2026
//
// v1.1 : LE DEGRADE DE LA CARTE EST UNE SEULE IMAGE. En v1.0, il etait peint en 240
//   bandes horizontales. Apercu (macOS) lisse le bord de chaque bande separement et
//   laissait voir de fines lignes blanches entre elles, invisibles dans d'autres
//   lecteurs. Une image unique (4 x 1024 pixels, memes couleurs), etiree a la taille
//   de la carte et decoupee aux coins arrondis, ne peut plus presenter de jointure.
//
// gift-card v1.0 — 28/09/2026
//
// CARTE CADEAU EN PDF, et image du nuage pour le mail cadeau.
//
// Pourquoi une Edge Function : la carte doit etre la meme sur la page de
// confirmation (bouton « Telecharger ») et en piece jointe du mail (n8n). Un seul
// rendu, un seul endroit a modifier.
//
// Trois usages :
//   GET  ?image=nuage              -> le nuage de la carte, en PNG transparent.
//        Les messageries n'affichent pas les nuages dessines en code de la page :
//        le mail les affiche en image. Public : c'est un decor, sans donnee.
//   GET  ?session_id=...           -> le PDF, pour la page de confirmation
//        (affiche dans le navigateur ; &download=1 pour le telecharger).
//   POST { session_id }            -> le PDF, meme usage, en POST.
//        Meme protection que get-gift-by-session : l'identifiant de session
//        Stripe est impossible a deviner.
//   POST avec l'en-tete X-MCF-Secret et { code, durationMonths,
//        purchaserName, giftMessage } -> le PDF, pour n8n (mail cadeau).
//        Secret N8N_WEBHOOK_SECRET, celui de la Book Factory et du mail cadeau.
//
// Verification du JWT : A DESACTIVER pour cette fonction. Les messageries
// chargent l'image sans jeton, et n8n appelle avec son secret. Les controles sont
// faits dans le code ci-dessus.
//
// Le PDF : A4 portrait, a imprimer ou a transmettre. La carte reprend celle de la
// page de confirmation (degrade bleu, quatre nuages, cadre interieur), avec le
// code, « De la part de », le petit mot. SANS PRIX. En dessous, la marche a suivre
// adressee a la personne qui RECOIT la carte, et l'adresse du site.
// Polices standard du PDF (Times, Helvetica, Courier) : elles couvrent les
// accents francais ; tout caractere hors de leur jeu (emoji...) est retire du nom
// et du message plutot que de faire echouer le document.
// ============================================================================

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import {
  PDFDocument, StandardFonts, rgb, pushGraphicsState, popGraphicsState, clip, endPath,
  moveTo, lineTo, appendBezierCurve, closePath, setCharacterSpacing,
} from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-mcf-secret",
};

// Nuage de la carte (96 x 48, dessine a 2x) : memes formes que le composant Cloud
// de CadeauConfirmation.tsx, blanc a 92 % d'opacite.
// v1.1 : degrade de la carte (4 x 1024, #5AA0EA -> #4A90E2 a 55 % -> #3B82D6).
const FOND_PNG_BASE64 = "iVBORw0KGgoAAAANSUhEUgAAAAQAAAQACAIAAABJTW8sAAAArElEQVR42u3WQQ5AQAxG4RKndDrnc4laSWwkEkz/ts+uS755OtO67XY+s12easPibk3e1MxhZICRGjFlgJEaOdcwkiaMDDBSI2nCSI0wMsBImjBSIzViyvCtz/0Z9fanV4zkoQ8/riASMazS2q9JqmGFaP+oANa4MEaF3rUszxh6NSwxhZCyxDZ6aZL4snJu9KZYaZZ415hc+Rskof8Wq+36kLqtszHkbuvVSA5fqlsVCwCIaAAAAABJRU5ErkJggg==";

const NUAGE_PNG_BASE64 = "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";

type DonneesCarte = {
  code: string;
  durationMonths: number;
  purchaserName: string | null;
  giftMessage: string | null;
};

// ─── Couleurs ────────────────────────────────────────────────────────────────
type Couleur = [number, number, number];
const hex = (h: string): Couleur => [
  parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255,
];
const melange = (a: Couleur, b: Couleur, t: number): Couleur => [
  a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t,
];
const vers = (c: Couleur) => rgb(c[0], c[1], c[2]);
const BLANC: Couleur = [1, 1, 1];
const DEGRADE: Array<[number, Couleur]> = [[0, hex("#5AA0EA")], [0.55, hex("#4A90E2")], [1, hex("#3B82D6")]];
const couleurDegrade = (t: number): Couleur => {
  for (let i = 1; i < DEGRADE.length; i++) {
    const [t1, c1] = DEGRADE[i];
    const [t0, c0] = DEGRADE[i - 1];
    if (t <= t1) return melange(c0, c1, (t - t0) / (t1 - t0));
  }
  return DEGRADE[DEGRADE.length - 1][1];
};

// ─── Carte ───────────────────────────────────────────────────────────────────
export async function construireCartePdf(g: DonneesCarte): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle("Carte cadeau My Crazy Family");
  pdf.setAuthor("My Crazy Family");
  const page = pdf.addPage([595.28, 841.89]);
  const L = page.getWidth();
  const H = page.getHeight();

  const times = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const helv = await pdf.embedFont(StandardFonts.Helvetica);
  const helvGras = await pdf.embedFont(StandardFonts.HelveticaBold);
  const helvItal = await pdf.embedFont(StandardFonts.HelveticaOblique);
  const courier = await pdf.embedFont(StandardFonts.CourierBold);

  // Retire les caracteres que la police ne sait pas ecrire (emoji...).
  // deno-lint-ignore no-explicit-any
  const filtrer = (font: any, s: string) =>
    Array.from(s).filter((ch) => { try { font.encodeText(ch); return true; } catch { return false; } }).join("").trim();

  // deno-lint-ignore no-explicit-any
  const largeur = (font: any, s: string, taille: number, espacement = 0) =>
    font.widthOfTextAtSize(s, taille) + espacement * Math.max(0, Array.from(s).length - 1);

  // deno-lint-ignore no-explicit-any
  const texteCentre = (s: string, font: any, taille: number, yHaut: number, couleur: Couleur, espacement = 0) => {
    const w = largeur(font, s, taille, espacement);
    if (espacement) page.pushOperators(setCharacterSpacing(espacement));
    page.drawText(s, { x: L / 2 - w / 2, y: yHaut - taille * 0.8, size: taille, font, color: vers(couleur) });
    if (espacement) page.pushOperators(setCharacterSpacing(0));
  };

  // deno-lint-ignore no-explicit-any
  const couper = (font: any, s: string, taille: number, max: number): string[] => {
    const lignes: string[] = [];
    let courante = "";
    for (const mot of s.split(/\s+/).filter(Boolean)) {
      const essai = courante ? courante + " " + mot : mot;
      if (largeur(font, essai, taille) <= max) { courante = essai; continue; }
      if (courante) lignes.push(courante);
      courante = mot;
      while (largeur(font, courante, taille) > max && courante.length > 1) {
        let n = courante.length - 1;
        while (n > 1 && largeur(font, courante.slice(0, n), taille) > max) n--;
        lignes.push(courante.slice(0, n));
        courante = courante.slice(n);
      }
    }
    if (courante) lignes.push(courante);
    return lignes;
  };

  // Rayon borne a la moitie du cote le plus court, comme border-radius en CSS.
  const rectArrondi = (w: number, h: number, rDemande: number) => {
    const r = Math.min(rDemande, w / 2, h / 2);
    return (
    `M ${r},0 H ${w - r} A ${r},${r} 0 0 1 ${w},${r} V ${h - r} A ${r},${r} 0 0 1 ${w - r},${h} H ${r} A ${r},${r} 0 0 1 0,${h - r} V ${r} A ${r},${r} 0 0 1 ${r},0 Z`
    );
  };

  // Donnees nettoyees
  const nom = g.purchaserName ? filtrer(helv, g.purchaserName) : "";
  const mot = g.giftMessage ? filtrer(helvItal, g.giftMessage) : "";
  const code = filtrer(courier, g.code);

  // Mise en page de la carte (proportions de la page de confirmation, 520 -> 440)
  const k = 440 / 520;
  const CW = 440;
  const x0 = (L - CW) / 2;
  const yHautCarte = H - 70;
  const lignesMot = mot ? couper(helvItal, "« " + mot + " »", 13, 330) : [];
  const lignesNom = nom ? couper(helv, `Un cadeau de la part de ${nom}`, 13, 360) : [];
  let hauteur = 40 + 26 + 6 + 12 + 22 + 38 + 20 + 11 + 8 + 50 + 22;
  if (lignesNom.length) hauteur += lignesNom.length * 17 + 4;
  hauteur += lignesMot.length * 19;
  hauteur += 52;
  const CH = hauteur;
  const yBasCarte = yHautCarte - CH;
  const rCarte = 24 * k;

  // Degrade, decoupe aux coins arrondis de la carte
  const K = 0.5523 * rCarte;
  const xg = x0, xd = x0 + CW, yb = yBasCarte, yh = yHautCarte;
  page.pushOperators(
    pushGraphicsState(),
    moveTo(xg + rCarte, yb), lineTo(xd - rCarte, yb),
    appendBezierCurve(xd - rCarte + K, yb, xd, yb + rCarte - K, xd, yb + rCarte),
    lineTo(xd, yh - rCarte),
    appendBezierCurve(xd, yh - rCarte + K, xd - rCarte + K, yh, xd - rCarte, yh),
    lineTo(xg + rCarte, yh),
    appendBezierCurve(xg + rCarte - K, yh, xg, yh - rCarte + K, xg, yh - rCarte),
    lineTo(xg, yb + rCarte),
    appendBezierCurve(xg, yb + rCarte - K, xg + rCarte - K, yb, xg + rCarte, yb),
    closePath(), clip(), endPath(),
  );
  // v1.1 : une seule image etiree, au lieu de 240 bandes (jointures visibles dans Apercu).
  const fond = await pdf.embedPng(Uint8Array.from(atob(FOND_PNG_BASE64), (c) => c.charCodeAt(0)));
  page.drawImage(fond, { x: x0, y: yBasCarte, width: CW, height: CH });
  page.pushOperators(popGraphicsState());

  // Nuages : couleur pleine = blanc melange au fond local (pas de chevauchement visible)
  const nuage = (gauche: number | null, droite: number | null, haut: number | null, bas: number | null, echelle: number, opacite: number) => {
    const s = echelle * k;
    const w = 96 * s, h = 48 * s;
    const xN = gauche !== null ? x0 + gauche * k : x0 + CW - droite! * k - w;
    const yHautN = haut !== null ? yHautCarte - haut * k : yBasCarte + bas! * k + h;
    const tCentre = Math.min(1, Math.max(0, (yHautCarte - (yHautN - h / 2)) / CH));
    const c = melange(couleurDegrade(tCentre), BLANC, 0.92 * opacite);
    const rond = (x: number, y: number, d: number) =>
      page.drawEllipse({ x: xN + (x + d / 2) * s, y: yHautN - (y + d / 2) * s, xScale: (d / 2) * s, yScale: (d / 2) * s, color: vers(c) });
    rond(27, 4, 42); rond(56, 14, 28); rond(10, 16, 28);
    page.drawSvgPath(rectArrondi(84 * s, 18 * s, 14 * s), { x: xN + 6 * s, y: yHautN - 28 * s, color: vers(c) });
  };
  nuage(28, null, 16, null, 1, 0.9);
  nuage(null, 24, 12, null, 0.85, 0.85);
  nuage(22, null, null, 16, 0.8, 0.8);
  nuage(null, 28, null, 12, 0.95, 0.82);

  // Cadre interieur
  const marge = 12 * k;
  page.drawSvgPath(rectArrondi(CW - 2 * marge, CH - 2 * marge, 16 * k), {
    x: x0 + marge, y: yHautCarte - marge, borderColor: vers(melange(couleurDegrade(0.5), BLANC, 0.35)), borderWidth: 0.8,
  });

  // Textes de la carte
  let y = yHautCarte - 40;
  texteCentre("My Crazy Family", times, 22, y, BLANC); y -= 26 + 6;
  texteCentre("Carte cadeau", helv, 11, y, hex("#DCEBFB"), 2.6); y -= 12 + 22;
  texteCentre(`${g.durationMonths} mois offerts`, helv, 34, y, BLANC); y -= 38 + 20;
  texteCentre("Code cadeau", helv, 10, y, hex("#DCEBFB"), 1.3); y -= 11 + 8;
  const wBoite = 280;
  page.drawSvgPath(rectArrondi(wBoite, 50, 10), { x: L / 2 - wBoite / 2, y, color: rgb(1, 1, 1) });
  texteCentre(code, courier, 21, y - 15, hex("#185FA5"), 0.4); y -= 50 + 22;
  for (const ligne of lignesNom) { texteCentre(ligne, helv, 13, y, BLANC); y -= 17; }
  if (lignesNom.length) y -= 4;
  for (const ligne of lignesMot) { texteCentre(ligne, helvItal, 13, y, hex("#E6F1FB")); y -= 19; }

  // Mode d'emploi, adresse a la personne qui recoit la carte
  let yb2 = yBasCarte - 46;
  const gauche = 92;
  page.drawText("Comment utiliser cette carte ?", { x: gauche, y: yb2, size: 15, font: helvGras, color: vers(hex("#2F6FC4")) });
  yb2 -= 28;
  const etapes = [
    "Rendez-vous sur www.mycrazyfamily.com et créez votre compte.",
    "Ajoutez votre enfant.",
    `Au moment de vous abonner, choisissez la formule mensuelle et saisissez le code ci-dessus : vos ${g.durationMonths} premiers mois sont offerts.`,
  ];
  etapes.forEach((etape, i) => {
    page.drawEllipse({ x: gauche + 9, y: yb2 + 4, xScale: 9, yScale: 9, color: vers(hex("#4A90E2")) });
    const n = String(i + 1);
    page.drawText(n, { x: gauche + 9 - largeur(helvGras, n, 10) / 2, y: yb2 + 0.5, size: 10, font: helvGras, color: rgb(1, 1, 1) });
    const lignes = couper(helv, etape, 11.5, L - gauche - 28 - 80);
    lignes.forEach((l, j) => page.drawText(l, { x: gauche + 28, y: yb2 - j * 16, size: 11.5, font: helv, color: vers(hex("#3F4A5A")) }));
    yb2 -= lignes.length * 16 + 14;
  });
  yb2 -= 4;
  page.drawText("Un livre personnalisé chaque mois, livraison incluse.", { x: gauche, y: yb2, size: 11.5, font: helvItal, color: vers(hex("#5B6778")) });

  // Pied de page
  texteCentre("www.mycrazyfamily.com", helvGras, 13, 72, hex("#2F6FC4"));
  texteCentre("My Crazy Family · Merci d'offrir une aventure magique.", helv, 9, 52, hex("#9AA6B6"));

  return await pdf.save();
}

// ─── Serveur ─────────────────────────────────────────────────────────────────
const reponseJson = (corps: unknown, status: number) =>
  new Response(JSON.stringify(corps), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const reponsePdf = (octets: Uint8Array, telechargement: boolean) =>
  new Response(octets, {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/pdf",
      "Content-Disposition": `${telechargement ? "attachment" : "inline"}; filename="carte-cadeau-my-crazy-family.pdf"`,
    },
  });

// La carte d'un achat, relue en base par son identifiant de session Stripe.
const carteParSession = async (sessionId: string): Promise<DonneesCarte | null> => {
  const admin = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
  const { data } = await admin
    .from("gift_codes")
    .select("code, duration_months, purchaser_name, gift_message")
    .eq("stripe_checkout_session_id", sessionId)
    .maybeSingle();
  if (!data) return null;
  return {
    code: data.code, durationMonths: data.duration_months,
    purchaserName: data.purchaser_name, giftMessage: data.gift_message,
  };
};

const CODE_VALIDE = /^MCF-CADO-[A-Z0-9]{6}$/;
const DUREES = [3, 6, 12];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);

    if (req.method === "GET" && url.searchParams.get("image") === "nuage") {
      const octets = Uint8Array.from(atob(NUAGE_PNG_BASE64), (c) => c.charCodeAt(0));
      return new Response(octets, {
        headers: { ...corsHeaders, "Content-Type": "image/png", "Cache-Control": "public, max-age=31536000, immutable" },
      });
    }
    // Lien direct depuis la page de confirmation : la carte s'ouvre dans le navigateur.
    if (req.method === "GET" && url.searchParams.get("session_id")) {
      const lue = await carteParSession(url.searchParams.get("session_id")!);
      if (!lue) return reponseJson({ error: "Carte introuvable" }, 404);
      return reponsePdf(await construireCartePdf(lue), url.searchParams.get("download") === "1");
    }
    if (req.method !== "POST") return reponseJson({ error: "Méthode non acceptée" }, 405);

    const corps = await req.json().catch(() => ({}));
    let donnees: DonneesCarte;

    const secretRecu = req.headers.get("X-MCF-Secret");
    if (secretRecu !== null) {
      // Appel de n8n : donnees fournies, protegees par le secret partage.
      const secret = Deno.env.get("N8N_WEBHOOK_SECRET");
      if (!secret || secretRecu !== secret) return reponseJson({ error: "Accès refusé" }, 403);
      const duree = Number(corps.durationMonths);
      if (!CODE_VALIDE.test(String(corps.code ?? "")) || !DUREES.includes(duree)) {
        return reponseJson({ error: "Données de carte invalides" }, 400);
      }
      donnees = {
        code: String(corps.code), durationMonths: duree,
        purchaserName: corps.purchaserName ? String(corps.purchaserName).slice(0, 40) : null,
        giftMessage: corps.giftMessage ? String(corps.giftMessage).slice(0, 120) : null,
      };
    } else if (corps.session_id) {
      // Appel de la page de confirmation : on relit la carte en base.
      const lue = await carteParSession(String(corps.session_id));
      if (!lue) return reponseJson({ error: "Carte introuvable" }, 404);
      donnees = lue;
    } else {
      return reponseJson({ error: "session_id requis" }, 400);
    }

    return reponsePdf(await construireCartePdf(donnees), true);
  } catch (e) {
    console.error("[gift-card] Erreur :", String(e));
    return reponseJson({ error: "Impossible de générer la carte" }, 500);
  }
});
