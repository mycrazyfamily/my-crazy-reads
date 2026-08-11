// ============================================================================
// Dashboard (admin — Livres) v1.6 — 11/08/2026
//
// Changelog v1.6 — ÉCHEC DE PAIEMENT VISIBLE AVANT LA FABRICATION
//   Le badge « Actif » ne regardait que `cancel_at`. Une carte refusée
//   laissait la ligne en vert : le livre était généré (~3,55 € de Gemini),
//   relu, envoyé à l'imprimeur — pour un abonnement impayé.
//   La colonne « Statut abo » lit désormais AUSSI `stripe_status` et
//   `payment_failed_at`, alimentés par stripe-webhook v2.2.
//   Nouvel état rouge « Impayé (n) », n = numéro de la tentative Stripe. Les
//   relances intelligentes s'étalent sur ~2 à 3 semaines : une tentative 1 est
//   un incident récent, une tentative 4 est un abonnement quasi perdu.
//   Le bouton de lancement est DÉSACTIVÉ dans cet état — c'est la seule
//   protection réelle contre une fabrication non payée.
//   Requiert migration_payment_failures_v1.sql.
// ============================================================================
// Dashboard (admin — Livres) v1.5 — 10/08/2026
//
// Changelog v1.5 — SUPPRESSION DES BADGES « prévu » ET « auto »
//   Ils répondaient à la question « qui a décidé du thème, le parent ou le
//   système ? » — une question que le dashboard ne posait pas. L'information
//   était en outre DÉJÀ lisible sur la même ligne :
//     · la colonne Type dit la nature du thème : Standard / Spécial / Inédit
//     · la colonne Statut livre dit où en est le livre : pending_choice /
//       configured / Généré, et `pending_choice` implique que le parent n'a
//       rien choisi.
//   Deux badges pour une information déjà présente deux fois : on retire.
//   Le repli de la colonne Thème sur `generated_theme_id` puis sur le thème
//   PRÉVU (RPC get_child_book_timeline) est CONSERVÉ — c'est lui qui remplit
//   la colonne, et c'est ce qui permet de relire un thème avant de dépenser
//   une génération. Seuls les badges disparaissent.
//   Le badge rouge « Mismatch » est CONSERVÉ : il ne décrit pas un type mais
//   une ANOMALIE — le parent a choisi un thème et un autre a servi.
// ============================================================================
// Dashboard (admin — Livres) v1.4 — 07/08/2026
//
// Changelog v1.4 — THÈME PRÉVU AVANT GÉNÉRATION
//   Asymétrie constatée : le SITE FAMILLE affiche le thème d'un mois non
//   configuré (il appelle `get_child_book_timeline`, qui CALCULE le thème
//   standard), alors que ce dashboard affichait « — ». L'admin en voyait donc
//   moins que ses clients, et ne pouvait pas relire un thème AVANT de dépenser
//   une génération — ce qui est précisément le moment utile (cf. le thème de
//   Béline en octobre, corrigé le 06/08 alors qu'il était déjà planifié).
//   La même RPC est désormais appelée, un appel par enfant, en parallèle.
//   Trois états distincts dans la colonne Thème :
//     · sans badge  -> `selected_theme_id` : le PARENT a choisi
//     · badge auto  -> `generated_theme_id` : la FABRICATION a décidé
//     · badge prévu -> thème standard calculé, rien n'est encore fabriqué
//   Bloc NON bloquant : si la RPC échoue ou ne renvoie rien (RLS, enfant d'une
//   autre famille), la colonne retombe sur « — » et le tableau s'affiche
//   normalement. Même principe que l'enrichissement « Retirés ».
// ============================================================================
// Dashboard (admin — Livres) v1.3 — 06/08/2026
//
// Changelog v1.3 — TRAÇABILITÉ DE LA FABRICATION
//   [1] Colonne « Thème » : retombe sur `generated_theme_id` quand
//       `selected_theme_id` est NULL. Le Book Factory choisit le thème tout
//       seul dès que le parent n'a rien configuré (cas par défaut : le
//       standard est automatique, le substitut est opt-in) et n'en gardait
//       aucune trace. La ligne affichait « — » alors qu'un thème avait servi.
//       Le thème auto est signalé par le suffixe « (auto) » pour ne pas le
//       confondre avec un choix du parent.
//   [2] Colonne « Statut livre » : nouvel état « Interrompu » quand
//       `production_status = 'generating'` depuis plus de 30 minutes. Avant,
//       une génération plantée en route était indistinguable d'une jamais
//       lancée — slides_url était NULL dans les deux cas.
//   [3] Badge « Mismatch » quand `generated_theme_source` vaut
//       `fallback_standard_SILENT_MISMATCH` : le choix du parent n'a pas été
//       retrouvé par 4C3 et le standard a servi à la place. C'était jusqu'ici
//       un console.log qui vivait 24 h.
//   Requiert migration_tracabilite_v1.sql + Book Factory (node 7 v2 et
//   1A_bis_Mark_Generating).
//
// ============================================================================
// Dashboard (admin — Livres) v1.2 — 06/08/2026
//
// Changelog v1.2 :
//   [1] FILTRE is_active MANQUANT sur la requête principale. Elle écartait les
//       lignes ARCHIVÉES (archived_at) mais pas les DÉSACTIVÉES. 24 lignes en
//       base sont dans cet état (is_active = false, archived_at NULL) et
//       s'affichaient comme des livres à générer.
//       Symptômes constatés : Béline apparaissait deux fois pour septembre 2026
//       (une ligne fantôme du 17/06 en pending_choice + la vraie ligne
//       configurée du 22/07), et Jules figurait dans la liste alors que son
//       abonnement est résilié depuis le 05/06.
//       Aucun workflow n8n ne pose jamais is_active = false : ce drapeau vient
//       du front ou d'une action manuelle, et signifie sans ambiguïté
//       « ne pas traiter ».
//
//   [2] BADGE « Actif » MENSONGER. Il ne testait que l'absence de cancel_at :
//       un enfant SANS AUCUN abonnement chargé s'affichait en vert. C'est ce
//       qui se produisait sur les 5 lignes des autres familles, invisibles
//       faute de policy RLS (corrigé par migration_rls_admin_v1.sql).
//       Nouvel état explicite « Non chargé » quand aucun abonnement n'est
//       trouvé pour l'enfant.
//
//   Aucune autre modification : requêtes d'enrichissement, gate des
//   personnages retirés, génération et rendu inchangés.
// ============================================================================

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { firstOfMonth, toIsoDate } from "@/lib/bookStatus";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { BookOpen, LogOut, Rocket, Loader2, RefreshCw, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// ─── Personnages retirés (miroir du gate 4A_Build_Context_Client v2.6) ───
type RemovedTone = "deceased" | "estranged" | "lost";
interface RemovedChar {
  name: string;
  label: string;
  tone: RemovedTone;
}

const REMOVED_TONE_CLASS: Record<RemovedTone, string> = {
  deceased: "border-red-300 bg-red-100 text-red-700 hover:bg-red-100",
  estranged: "border-amber-300 bg-amber-100 text-amber-700 hover:bg-amber-100",
  lost: "border-slate-300 bg-slate-100 text-slate-600 hover:bg-slate-100",
};

// Normalise selected_characters (peut être un tableau, un objet, ou null)
const normChars = (raw: any): any[] =>
  Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object"
    ? Object.values(raw)
    : [];

const charName = (c: any): string =>
  c?.name ?? c?.first_name ?? c?.firstName ?? c?.prenom ?? "Sans nom";

interface Row {
  childId: string;
  childFirstName: string;
  familyId: string;
  familyName: string;
  subscriptionType: string;
  cancelAt: string | null;
  hasSubscription: boolean; // v1.2 [2] — distingue « aucun abonnement chargé » de « actif »
  bookRequestId: string | null;
  status: string | null;
  keptCharacters: string[];
  removedCharacters: RemovedChar[];
  selectedLocationLabel: string | null;
  message: string | null;
  originalThemeInstructions: string | null;
  bookTitle: string | null;
  themeTitre: string | null;
  productionStatus: string | null;   // v1.3
  themeMismatch: boolean;            // v1.3 — 4C3 n'a pas retrouvé le choix du parent
  stalled: boolean;                  // v1.3 — génération partie et jamais terminée
  themeType: string | null;
  slidesUrl: string | null;
}

const MONTHS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const now = new Date();
  const [year, setYear] = useState(now.getUTCFullYear());
  const [month, setMonth] = useState(now.getUTCMonth());
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [launching, setLaunching] = useState<Record<string, boolean>>({});

  const targetMonth = useMemo(() => firstOfMonth(year, month), [year, month]);
  const targetMonthIso = toIsoDate(targetMonth);

  // ─── Fetch : requête directe sur book_requests par delivery_month ───
  // Plus besoin de passer par computeDeliveryMonth — les book_requests existent
  // dès l'inscription pour les 12 prochains mois
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. book_requests du mois sélectionné (non archivés)
      const { data: requests, error: reqErr } = await supabase
        .from("book_requests")
        .select(
          "id, child_id, family_id, delivery_month, selected_characters, message, " +
          "original_theme_instructions, status, book_title, selected_theme_type, selected_theme_id, slides_url, " +
          "selected_location_label, selected_location_id, " +
          // v1.3 — traçabilité de la fabrication
          "generated_theme_id, generated_theme_source, production_status, generated_at, updated_at"
        )
        .eq("delivery_month", targetMonthIso)
        // v1.2 [1] — Écarter aussi les lignes DÉSACTIVÉES, pas seulement les
        // archivées. Sans ce filtre, les vestiges (is_active = false,
        // archived_at NULL) apparaissaient comme des livres à générer.
        .eq("is_active", true)
        .is("archived_at", null);

      if (reqErr) throw reqErr;

      if (!requests || requests.length === 0) {
        setRows([]);
        return;
      }

      const childIds = [...new Set(requests.map((r: any) => r.child_id))];
      const familyIds = [...new Set(requests.map((r: any) => r.family_id).filter(Boolean))];
      // v1.3 — charger AUSSI les thèmes réellement utilisés par la fabrication
      const themeIds = [...new Set(
        requests.flatMap((r: any) => [r.selected_theme_id, r.generated_theme_id]).filter(Boolean)
      )];

      // ─── Collecte des refs de personnages pour rejouer le gate d'éligibilité ───
      const memberIds = new Set<string>();
      const petRefIds = new Set<string>();
      const siblingIds = new Set<string>();
      const comforterIds = new Set<string>(); // v1.1 — doudous
      for (const req of requests as any[]) {
        for (const c of normChars(req.selected_characters)) {
          if (!c || typeof c !== "object") continue;
          if (c.type === "family_member") {
            if (c.id) memberIds.add(c.id);
          } else if (c.type === "pet") {
            if (c.id) petRefIds.add(c.id);
            if (c.pet_id) petRefIds.add(c.pet_id);
          } else if (c.type === "child") {
            if (c.id) siblingIds.add(c.id);
          } else if (c.type === "comforter") {
            if (c.id) comforterIds.add(c.id);
          }
        }
      }
      const memberIdArr = [...memberIds];
      const petRefArr = [...petRefIds];
      const comforterIdArr = [...comforterIds]; // v1.1
      // child_profiles à charger = enfants du mois + fratrie citée dans les casts
      const allChildIds = [...new Set([...childIds, ...siblingIds])];

      const themesRes = themeIds.length
        ? await supabase.from("story_themes").select("id, titre").in("id", themeIds)
        : ({ data: [], error: null } as any);
      if (themesRes.error) throw themesRes.error;
      const themeMap = new Map((themesRes.data ?? []).map((t: any) => [t.id, t]));

      // 2. Données CENTRALES (doivent réussir) : enfants (nom/famille), familles, abonnements
      const [childrenRes, familiesRes, subsRes] = await Promise.all([
        supabase
          .from("child_profiles")
          .select("id, first_name, family_id")
          .in("id", allChildIds),
        familyIds.length
          ? supabase.from("families").select("id, name").in("id", familyIds)
          : Promise.resolve({ data: [], error: null } as any),
        supabase
          .from("subscriptions")
          .select("id, child_id, type, cancel_at, is_active, stripe_status, payment_failed_at, payment_attempt_count")
          .in("child_id", childIds),
      ]);

      if (childrenRes.error) throw childrenRes.error;
      if (familiesRes.error) throw familiesRes.error;
      if (subsRes.error) throw subsRes.error;

      const childMap = new Map<string, any>((childrenRes.data ?? []).map((c: any) => [c.id, c]));

      // ─── v1.4 — THÈME PRÉVU (non bloquant) ───────────────────────────────
      // Même source que le site famille : get_child_book_timeline calcule le
      // thème standard du mois (gamme 1 sur l'âge en mois, gamme 2 sur mois
      // calendaire + année). On ne réimplémente pas cette logique ici — deux
      // copies finiraient par diverger.
      // Toute erreur est absorbée : la colonne Thème retombe sur « — ».
      const plannedThemeByRequest = new Map<string, string>();
      try {
        const timelines = await Promise.all(
          childIds.map((cid: string) =>
            supabase.rpc("get_child_book_timeline", { p_child_id: cid }),
          ),
        );
        for (const tl of timelines) {
          if (tl.error || !Array.isArray(tl.data)) continue;
          for (const row of tl.data as any[]) {
            if (row?.book_request_id && row?.titre) {
              plannedThemeByRequest.set(row.book_request_id, row.titre);
            }
          }
        }
      } catch (planErr) {
        console.warn(
          "[Thème prévu] get_child_book_timeline indisponible — colonne Thème sans repli :",
          planErr,
        );
      }
      const familyMap = new Map((familiesRes.data ?? []).map((f: any) => [f.id, f]));
      // Garder l'abonnement actif par enfant (is_active = true en priorité)
      const subMap = new Map<string, any>();
      for (const s of (subsRes.data ?? []) as any[]) {
        const existing = subMap.get(s.child_id);
        if (!existing || s.is_active) subMap.set(s.child_id, s);
      }

      // 3. ENRICHISSEMENT « Retirés » — NON bloquant.
      //    Statuts décès / brouille / animal parti. Toute erreur ici (colonne absente,
      //    RLS, table indisponible…) est absorbée : les livres s'affichent quand même,
      //    la colonne « Retirés » reste simplement vide. select("*") => jamais d'erreur
      //    de colonne inconnue. Fallback : tout le cast est « conservé » (comportement
      //    d'origine de la colonne Personnages).
      let resolveCharacters = (raw: any, _childId: string): { kept: string[]; removed: RemovedChar[] } => ({
        kept: normChars(raw).map(charName),
        removed: [],
      });

      try {
        const [membersRes, cfmRes, childPetsRes, siblingsRes, comfortersRes] = await Promise.all([
          memberIdArr.length
            ? supabase.from("family_members").select("*").in("id", memberIdArr)
            : Promise.resolve({ data: [], error: null } as any),
          memberIdArr.length
            ? supabase
                .from("child_family_members")
                .select("*")
                .in("child_id", childIds)
                .in("family_member_id", memberIdArr)
            : Promise.resolve({ data: [], error: null } as any),
          petRefArr.length
            ? supabase.from("child_pets").select("*").in("id", petRefArr)
            : Promise.resolve({ data: [], error: null } as any),
          siblingIds.size
            ? supabase.from("child_profiles").select("*").in("id", [...siblingIds])
            : Promise.resolve({ data: [], error: null } as any),
          // v1.1 — doudous : schéma 1 doudou = 1 enfant, résolution directe par id
          comforterIdArr.length
            ? supabase.from("comforters").select("*").in("id", comforterIdArr)
            : Promise.resolve({ data: [], error: null } as any),
        ]);

        if (membersRes.error) throw membersRes.error;
        if (cfmRes.error) throw cfmRes.error;
        if (childPetsRes.error) throw childPetsRes.error;
        if (siblingsRes.error) throw siblingsRes.error;
        if (comfortersRes.error) throw comfortersRes.error;

        // pets : résolus par id d'entité (via junction child_pets ou ref directe)
        const childPetRows = (childPetsRes.data ?? []) as any[];
        const petEntityIds = new Set<string>(petRefArr);
        for (const cp of childPetRows) if (cp.pet_id) petEntityIds.add(cp.pet_id);
        const petEntityArr = [...petEntityIds];
        const petsRes = petEntityArr.length
          ? await supabase.from("pets").select("*").in("id", petEntityArr)
          : ({ data: [], error: null } as any);
        if (petsRes.error) throw petsRes.error;

        // ─── Maps de statut ───
        const memberMap = new Map<string, any>((membersRes.data ?? []).map((m: any) => [m.id, m]));
        const linkedSet = new Set<string>();
        const linkActiveMap = new Map<string, boolean>();
        for (const l of (cfmRes.data ?? []) as any[]) {
          const key = `${l.child_id}::${l.family_member_id}`;
          linkedSet.add(key);
          linkActiveMap.set(key, l.is_active !== false);
        }
        const childPetByRef = new Map<string, any>();
        for (const cp of childPetRows) childPetByRef.set(cp.id, cp);
        const petMap = new Map<string, any>((petsRes.data ?? []).map((p: any) => [p.id, p]));
        const siblingDeceasedMap = new Map<string, boolean>(
          (siblingsRes.data ?? []).map((s: any) => [s.id, !!s.is_deceased]),
        );

        // v1.1 — doudous : « Perdu » = is_active === false (pas de notion de décès pour un objet)
        const comforterMap = new Map<string, any>(
          (comfortersRes.data ?? []).map((cf: any) => [cf.id, cf]),
        );

        // Rejoue applyEligibilityGate (4A) : protagoniste conservé, retire décès /
        // brouille / parti, conserve tout ce qui n'est pas résolu en base.
        resolveCharacters = (raw: any, childId: string) => {
          const kept: string[] = [];
          const removed: RemovedChar[] = [];
          for (const c of normChars(raw)) {
            if (!c || typeof c !== "object") continue;
            const nm = charName(c);

            // Protagoniste : toujours conservé (4A ligne 70)
            if (c.id && c.id === childId) {
              kept.push(nm);
              continue;
            }

            if (c.type === "pet") {
              const refs = [c.id, c.pet_id].filter(Boolean);
              let pet: any = undefined;
              let junctionInactive = false;
              let found = false;
              for (const ref of refs) {
                const cp = childPetByRef.get(ref);
                if (cp && cp.is_active === false) junctionInactive = true;
                const p = petMap.get(cp?.pet_id ?? ref);
                if (p) {
                  pet = p;
                  found = true;
                }
              }
              if (!found) {
                kept.push(nm); // non résolu → conservé (p ? … : true)
                continue;
              }
              const deceased = !!pet.is_deceased;
              const active = pet.is_active !== false && !junctionInactive;
              if (deceased) removed.push({ name: nm, label: "Décédé(e)", tone: "deceased" });
              else if (!active) removed.push({ name: nm, label: "Parti·perdu", tone: "lost" });
              else kept.push(nm);
              continue;
            }

            if (c.type === "family_member") {
              const m = memberMap.get(c.id);
              if (!m) {
                kept.push(nm); // non résolu → conservé
                continue;
              }
              const key = `${childId}::${c.id}`;
              const deceased = !!m.is_deceased;
              const linked = linkedSet.has(key);
              const linkActive = linkActiveMap.get(key) !== false; // absent → true
              const eligible = linked && linkActive && !deceased;
              if (eligible) kept.push(nm);
              else if (deceased) removed.push({ name: nm, label: "Décédé(e)", tone: "deceased" });
              else removed.push({ name: nm, label: "Brouille", tone: "estranged" });
              continue;
            }

            if (c.type === "child") {
              if (!siblingDeceasedMap.has(c.id)) {
                kept.push(nm); // non résolu → conservé
                continue;
              }
              if (siblingDeceasedMap.get(c.id)) removed.push({ name: nm, label: "Décédé(e)", tone: "deceased" });
              else kept.push(nm);
              continue;
            }

            if (c.type === "comforter") {
              // v1.1 — miroir de isComforterEligible (4A) : cf ? cf.is_active !== false : true
              const cf = comforterMap.get(c.id);
              if (!cf) {
                kept.push(nm); // non résolu → conservé
                continue;
              }
              if (cf.is_active === false) removed.push({ name: nm, label: "Perdu", tone: "lost" });
              else kept.push(nm);
              continue;
            }

            kept.push(nm); // types inconnus (parents, etc.) → conservés (4A ligne 74)
          }
          return { kept, removed };
        };
      } catch (enrichErr) {
        console.warn(
          "[Retirés] enrichissement indisponible — livres affichés sans annotation de retrait :",
          enrichErr,
        );
      }

      const built: Row[] = (requests as any[]).map((req) => {
        const child = childMap.get(req.child_id) as any;
        const familyId = req.family_id ?? child?.family_id ?? null;
        const family = familyId ? (familyMap.get(familyId) as any) : null;
        const sub = subMap.get(req.child_id);
        let kept: string[] = [];
        let removed: RemovedChar[] = [];
        try {
          ({ kept, removed } = resolveCharacters(req.selected_characters, req.child_id));
        } catch {
          kept = normChars(req.selected_characters).map(charName);
          removed = [];
        }

        return {
          childId: req.child_id,
          childFirstName: child?.first_name ?? "—",
          familyId,
          familyName: family?.name ?? "—",
          subscriptionType: sub?.type ?? "—",
          cancelAt: sub?.cancel_at ?? null,
          hasSubscription: !!sub, // v1.2 [2]
          // v1.6 — un abonnement peut être ACTIF et IMPAYÉ : `status`/`is_active`
          // disent s'il couvre le mois, `stripe_status` s'il est payé.
          paymentFailed:
            !!sub?.payment_failed_at ||
            ["past_due", "unpaid", "incomplete"].includes(sub?.stripe_status ?? ""),
          paymentAttempt: sub?.payment_attempt_count ?? null,
          bookRequestId: req.id,
          status: req.status ?? null,
          keptCharacters: kept,
          removedCharacters: removed,
          selectedLocationLabel: req.selected_location_label ?? null,
          message: req.message ?? null,
          originalThemeInstructions: req.original_theme_instructions ?? null,
          bookTitle: req.book_title ?? null,
          // v1.3 — repli sur le thème réellement utilisé par la fabrication.
          themeTitre: req.selected_theme_id
            ? ((themeMap.get(req.selected_theme_id) as any)?.titre ?? null)
            : req.generated_theme_id
            ? ((themeMap.get(req.generated_theme_id) as any)?.titre ?? null)
            : req.original_theme_instructions
            ? "Histoire inédite"
            // v1.4 — dernier repli : le thème standard prévu pour ce mois.
            : (plannedThemeByRequest.get(req.id) ?? null),
          productionStatus: req.production_status ?? null,
          themeMismatch: req.generated_theme_source === "fallback_standard_SILENT_MISMATCH",
          // Une fabrication normale dure quelques minutes : au-delà de 30, elle est plantée.
          stalled:
            req.production_status === "generating" &&
            !!req.updated_at &&
            Date.now() - new Date(req.updated_at).getTime() > 30 * 60 * 1000,
          themeType: req.selected_theme_type ?? null,
          slidesUrl: req.slides_url ?? null,
        };
      });

      built.sort((a, b) => a.familyName.localeCompare(b.familyName));
      setRows(built);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message ?? "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

  const launch = async (row: Row) => {
    if (!user) return;
    const launchKey = row.bookRequestId ?? row.childId;
    setLaunching((p) => ({ ...p, [launchKey]: true }));
    try {
      let bookRequestId = row.bookRequestId;

      // Créer le book_request s'il n'existe pas encore (cas rare)
      if (!bookRequestId) {
        const { data: inserted, error } = await supabase
          .from("book_requests")
          .insert({
            child_id: row.childId,
            family_id: row.familyId,
            created_by: user.id,
            delivery_month: targetMonthIso,
            request_type: "subscription",
            is_active: true,
            message: "Livre généré automatiquement depuis le dashboard admin",
          })
          .select("id")
          .single();
        if (error) throw error;
        bookRequestId = inserted.id;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Session expirée, veuillez vous reconnecter");

      const res = await fetch(
        "https://rjbmhcoctpwmlqndzybm.supabase.co/functions/v1/trigger-book-factory",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ book_request_id: bookRequestId }),
        },
      );

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`trigger-book-factory: ${res.status} ${txt}`);
      }

      toast.success(`Livre lancé pour ${row.childFirstName}`);
      setRows((prev) =>
        prev.map((r) =>
          r.childId === row.childId
            ? { ...r, bookRequestId, status: "generating" }
            : r,
        ),
      );
    } catch (e: any) {
      console.error(e);
      toast.error(e.message ?? "Erreur lors du lancement");
    } finally {
      setLaunching((p) => ({ ...p, [launchKey]: false }));
    }
  };

  const counts = useMemo(() => {
    const total = rows.length;
    const toGenerate = rows.filter((r) => !r.slidesUrl).length;
    const generated = rows.filter((r) => !!r.slidesUrl).length;
    return { total, toGenerate, generated };
  }, [rows]);

  const years = [
    now.getUTCFullYear() - 1,
    now.getUTCFullYear(),
    now.getUTCFullYear() + 1,
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-tight">My Crazy Family</h1>
              <p className="text-xs text-muted-foreground">Dashboard Livres</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] space-y-6 px-6 py-8">
        {/* Filtres */}
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="mr-auto text-2xl font-bold tracking-tight">
            Livres de {MONTHS_FR[month]} {year}
          </h2>
          <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
            <SelectTrigger className="w-[160px] bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS_FR.map((m, i) => (
                <SelectItem key={m} value={String(i)}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
            <SelectTrigger className="w-[110px] bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Compteurs */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <CounterCard label="Total ce mois" value={counts.total} accent="primary" />
          <CounterCard label="À générer" value={counts.toGenerate} accent="muted" />
          <CounterCard label="Générés" value={counts.generated} accent="success" />
        </div>

        {/* Tableau */}
        <Card className="overflow-hidden">
          <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Enfant</TableHead>
                <TableHead>Famille</TableHead>
                <TableHead>Thème</TableHead>
                <TableHead>Titre</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Mois de livraison</TableHead>
                <TableHead>Abonnement</TableHead>
                <TableHead>Statut abo</TableHead>
                <TableHead>Statut livre</TableHead>
                <TableHead>Personnages</TableHead>
                <TableHead>Retirés</TableHead>
                <TableHead>Lieu</TableHead>
                <TableHead>Note parent</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={14} className="h-32 text-center text-muted-foreground">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={14} className="h-32 text-center text-muted-foreground">
                    Aucun livre prévu pour ce mois.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r) => {
                  const launchKey = r.bookRequestId ?? r.childId;
                  const isLaunching = !!launching[launchKey];

                  // Statut en cours de génération — bouton désactivé
                  const isGenerating = r.status === "generating";

                  // Livre déjà généré (a un PDF / slides)
                  const isGenerated = !!r.slidesUrl;

                  const autoMsg = "Livre généré automatiquement depuis le dashboard admin";
                  const hasMsg =
                    !!r.message && r.message.trim() !== "" && r.message !== autoMsg;
                  const hasInstr =
                    !!r.originalThemeInstructions && r.originalThemeInstructions.trim() !== "";

                  const charNames = r.keptCharacters.join(", ");

                  const themeBadge =
                    r.themeType === "original"
                      ? { label: "Inédit", className: "border-purple-300 bg-purple-100 text-purple-700 hover:bg-purple-100" }
                      : r.themeType === "substitute"
                      ? { label: "Spécial", className: "border-blue-300 bg-blue-100 text-blue-700 hover:bg-blue-100" }
                      : { label: "Standard", className: "border-border bg-muted text-muted-foreground hover:bg-muted" };

                  return (
                    <TableRow key={r.childId}>
                      <TableCell className="font-medium">{r.childFirstName}</TableCell>
                      <TableCell>{r.familyName}</TableCell>
                      <TableCell className="max-w-[180px] whitespace-normal break-words text-sm">
                        {r.themeTitre ?? "—"}
                        {/* v1.5 — seule anomalie signalée : le choix du parent n'a pas été retrouvé */}
                        {r.themeMismatch && (
                          <Badge variant="outline" className="ml-1 border-red-300 bg-red-100 text-[10px] text-red-700">
                            Mismatch
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[200px] whitespace-normal break-words text-sm">{r.bookTitle ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={themeBadge.className}>
                          {themeBadge.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize">
                        {format(targetMonth, "MMMM yyyy", { locale: fr })}
                      </TableCell>
                      <TableCell className="capitalize">{r.subscriptionType}</TableCell>
                      <TableCell>
                        {/* v1.2 [2] — « Actif » n'est plus le repli par défaut :
                            aucun abonnement chargé donne un état explicite. */}
                        {!r.hasSubscription ? (
                          <Badge className="border-slate-300 bg-slate-100 text-slate-600 hover:bg-slate-100">
                            Non chargé
                          </Badge>
                        ) : r.paymentFailed ? (
                          /* v1.6 — prioritaire sur tout le reste : impayé = ne pas fabriquer */
                          <Badge className="border-red-300 bg-red-100 text-red-700 hover:bg-red-100">
                            Impayé{r.paymentAttempt ? ` (${r.paymentAttempt})` : ""}
                          </Badge>
                        ) : r.cancelAt ? (
                          <Badge className="border-warning/30 bg-warning/10 text-warning hover:bg-warning/10">
                            Se termine le {format(new Date(r.cancelAt), "dd/MM/yyyy")}
                          </Badge>
                        ) : (
                          <Badge className="border-success/30 bg-success/10 text-success hover:bg-success/10">
                            Actif
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {r.stalled ? (
                          /* v1.3 — génération partie et jamais terminée : à investiguer dans n8n */
                          <Badge variant="outline" className="border-red-300 bg-red-100 text-red-700 hover:bg-red-100">
                            Interrompu
                          </Badge>
                        ) : r.productionStatus === "generating" ? (
                          <Badge variant="outline" className="border-warning/30 bg-warning/10 text-warning">
                            Fabrication…
                          </Badge>
                        ) : isGenerated ? (
                          <a
                            href={r.slidesUrl!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 hover:opacity-80"
                          >
                            <Badge variant="outline" className="border-green-300 bg-green-100 text-green-800 hover:bg-green-100">
                              Généré
                            </Badge>
                            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                          </a>
                        ) : isGenerating ? (
                          <Badge variant="outline" className="text-muted-foreground">
                            En cours…
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-border bg-muted text-muted-foreground">
                            {r.status ?? "À générer"}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {charNames || <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="max-w-[220px] text-sm">
                        {r.removedCharacters.length ? (
                          <div className="flex flex-col gap-1">
                            {r.removedCharacters.map((rc, i) => (
                              <div key={`${rc.name}-${i}`} className="flex items-center gap-1.5">
                                <span className="text-muted-foreground line-through">{rc.name}</span>
                                <Badge variant="outline" className={REMOVED_TONE_CLASS[rc.tone]}>
                                  {rc.label}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {r.selectedLocationLabel ?? <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="max-w-[260px] text-sm">
                        {hasMsg || hasInstr ? (
                          <div className="space-y-1">
                            {hasMsg && <div>{r.message}</div>}
                            {hasInstr && (
                              <div className="italic text-muted-foreground">
                                {r.originalThemeInstructions}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {/* Admin peut toujours lancer/relancer sauf si génération en cours */}
                        {isGenerating ? (
                          <Button size="sm" variant="outline" disabled>
                            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                            En cours…
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => launch(r)}
                            /* v1.6 — seule protection réelle contre une fabrication non payée */
                            disabled={isLaunching || r.paymentFailed}
                            title={r.paymentFailed ? "Paiement en échec — ne pas lancer la fabrication" : undefined}
                          >
                            {isLaunching ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Rocket className="mr-1.5 h-4 w-4" />
                                {isGenerated ? "Relancer" : "Lancer"}
                              </>
                            )}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          </div>
        </Card>
      </main>
    </div>
  );
}

function CounterCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "primary" | "muted" | "warning" | "success";
}) {
  const accentClass = {
    primary: "text-primary",
    muted: "text-muted-foreground",
    warning: "text-warning",
    success: "text-success",
  }[accent];
  return (
    <Card className="p-5">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${accentClass}`}>{value}</p>
    </Card>
  );
}
