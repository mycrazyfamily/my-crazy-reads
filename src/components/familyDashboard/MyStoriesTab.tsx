// MyStoriesTab v3.5
// Changelog v3.5 (LIVRAISON : « 1 septembre » -> « début septembre ») :
//   La date exacte d'arrivée du colis ne se maîtrise pas — impression, poste,
//   jour ouvré. Annoncer « Livraison prévue le 1 septembre » crée une attente
//   au jour près que rien ne garantit. On annonce désormais une fenêtre.
//   `delivery_month` reste le 1er du mois en base : seul l'AFFICHAGE change.
//   Cinq endroits touchés, dont trois tournures : « prévue LE début septembre »
//   n'est pas français, le « le » disparaît là où il précédait la date.
//   L'en-tête de carte devient « Livraison en début de mois » : le mois est
//   déjà donné juste avant par monthLabel, le répéter était redondant.
// MyStoriesTab v3.4
// Changelog v3.4 (compteur « N configurés » aligné sur les badges) :
//   Régression introduite par la v3.2. Le compteur d'en-tête lisait le statut
//   EN BASE (`timelineRows`), alors que la v3.2 fait basculer l'AFFICHAGE en
//   « configuré » dès que la deadline est passée, sans toucher au statut en
//   base qui reste `pending_choice`. Résultat visible sur bazzoka 1 :
//   septembre portait le badge « Configuré » pendant que l'en-tête annonçait
//   « 0 configuré ».
//   Ce n'était pas anecdotique : chaque mois, tous les livres non configurés
//   par les parents passent leur deadline et affichent « Configuré » — aucun
//   n'aurait été compté.
//   Le compteur lit désormais `months`, c'est-à-dire les statuts RÉELLEMENT
//   affichés. Badge et compteur ne peuvent plus diverger, par construction.
// MyStoriesTab v3.3
// Changelog v3.3 (libellé du badge `to_personalize`) :
//   « Votre livre est prêt » contredisait la ligne affichée juste en dessous
//   — « encore N jours pour ajouter votre touche ». Le badge annonçait un
//   état terminé alors qu'il signale au contraire une fenêtre d'action encore
//   ouverte : le thème du mois est arrêté, le livre partira ainsi si le parent
//   ne fait rien, et il lui reste jusqu'à la deadline pour y ajouter sa touche.
//   « Bientôt en fabrication » décrit cet état sans le contredire, et conserve
//   l'accent visuel orange qui distingue « c'est maintenant » de « c'est pour
//   plus tard » dans une liste de douze mois.
//   Aucun autre changement : couleurs, icône, bordure et logique de statut
//   sont inchangées.
// MyStoriesTab v3.2
// Changelog v3.2 (DEADLINE : blocage en amont + message d'erreur utile) :
//   [1] Le front ne décidait de l'éditabilité que sur `status`. Un livre dont
//       la deadline était passée mais que `lock-overdue-books` n'avait pas
//       encore basculé (le cron ne tourne qu'une fois par jour, et tournait
//       auparavant une fois par MOIS) affichait encore « Ajouter votre
//       touche ». Le parent allait au bout du parcours pour se faire refuser
//       l'écriture par la policy RLS — frustrant et incompréhensible.
//       Désormais la deadline fait foi côté affichage aussi : passée, le mois
//       bascule en « en cours de préparation », comme s'il était verrouillé.
//       La policy RLS reste la garantie dure ; ceci n'est que le confort.
//       `daysLeft < 0` et non `<= 0` : le jour même de la deadline reste
//       ouvert, exactement comme `lock-overdue-books` qui filtre sur
//       `personalization_deadline < today`.
//   [2] Le handler d'erreur reniflait le message pour détecter un refus de
//       deadline (`msg.includes('locked')` / `'deadline'`). Le message de
//       useSaveBookChoice v1.1 étant rédigé en français — « la date limite …
//       est dépassée » — aucun des deux mots-clés n'y figurait : le parent
//       recevait « Une erreur est survenue, réessaie. » sans rien comprendre.
//       On teste désormais un CODE (`BOOK_NOT_EDITABLE`, posé par le hook
//       v1.2), insensible à la langue. Le reniflage est conservé en repli
//       pour les erreurs remontées directement par Postgres.
// MyStoriesTab v3.1
// Changelog v3.1 (le « y » ne déclenche plus l'élision) :
//   La v2.9 avait mis le « y » dans VOWEL_START. Conséquence : « Anniversaire
//   d'Yann », qui est fautif. Le y se comporte comme le « h » déjà exclu : voyelle
//   dans Yves (d'Yves), consonne dans Yann / Yasmine / Yohan (de Yann). Indécidable
//   sur un prénom, et la majorité penche vers « de ». Un caractère retiré de la
//   classe. Seul `withDe` lit VOWEL_START, donc le périmètre est strictement celui
//   de l'élision — aucun autre comportement touché.
//   Décision produit associée : les puces de la timeline restent « Anniversaire
//   Emma », sans « de » ni « d' ». Plus court, et aucune faute possible.
//   Le « De » majuscule en début de phrase n'est volontairement PAS élidé
//   (regex sensible à la casse) : « De Emma » est jugé acceptable, aucun thème du
//   catalogue n'est concerné à ce jour.
// MyStoriesTab v3.0
// Changelog v3.0 (ÉLISION sur le titre en dur des cartes anniversaire) :
//   En prod : « Anniversaire de Emma » sur la carte « Option spéciale MCF » de la
//   feuille de choix. La v2.9 avait bien introduit l'élision, mais uniquement à
//   l'intérieur de `injectName`, qui n'agit QUE devant un jeton du catalogue
//   (« de [Fratrie] », « de [Prénom] »). Or ce titre-là est un template écrit en
//   dur — `Anniversaire de ${personName}` — sans aucun jeton. Trou de couverture,
//   pas régression.
//   1) Nouveau helper `withDe(name)` : renvoie « d'Emma » ou « de Jules ». Extrait
//      de `injectName`, qui l'appelle désormais — comportement inchangé, mêmes
//      règles, même exclusion volontaire du « h ».
//   2) Le titre de la carte anniversaire passe par `withDe`.
//   Le libellé des puces de la timeline (`buildAlternativeLabel`) est délibérément
//   laissé tel quel : il s'écrit « Anniversaire Emma », SANS « de », donc aucune
//   élision n'a lieu d'être. Les deux formulations diffèrent depuis toujours.
// MyStoriesTab v2.9
// Changelog v2.9 (ÉLISION des prénoms injectés) :
//   « dans celles de [Fratrie] » affichait « dans celles de Emma ». En français il
//   faut « d'Emma ». Le défaut touche tout prénom à initiale vocalique — donc aussi
//   [Prénom] et [Animal] : « Les premiers pas de Alice », « la gamelle de Oscar ».
//   Nouveau helper `injectName` : élide « de <jeton> » en « d'<prénom> » quand le
//   prénom commence par une voyelle, puis remplace normalement. L'élision ne
//   s'applique QUE devant le jeton, jamais au reste du texte.
//   Le « h » est exclu volontairement : « d'Hugo » serait correct, « d'Hollande »
//   non, et rien ne distingue h muet et h aspiré sur un prénom.
// MyStoriesTab v2.8
// Changelog v2.8 (FIX « Anniversaire » abusif sur les cartes fratrie et animal) :
//   Le RPC v4 renseigne substitute_person_name pour substitute_pet et
//   substitute_sibling, qui ne sont PAS des anniversaires. buildAlternativeLabel
//   posait « Anniversaire {prénom} » dès qu'un prénom existait -> en prod,
//   « Anniversaire Jules » s'affichait sur « Le jeu du hochet lancé », et le même
//   prénom revenait sur deux mois pour deux raisons distinctes (sa fête en octobre,
//   un livre fratrie en septembre). Le libellé « Anniversaire » est désormais
//   conditionné à `substitute_condition` commençant par `birthday_`.
//   Les autres cartes affichent le titre du thème, comme milestone et Noël.
//   (La feuille de choix avait déjà le bon test `isBirthday` : commentaire ajouté
//   pour que les deux endroits restent alignés.)
// MyStoriesTab v2.7
// Changelog v2.7 (JETONS [Animal] / [Fratrie] + genre de la personne dédiée) :
//   Prépare l'activation des branches substitute_pet / substitute_sibling du RPC.
//   Aucun effet visible tant que ces branches n'existent pas : les nouveaux champs
//   lus (substitute_person_gender) sont simplement absents et le code retombe sur
//   le comportement v2.6. À déployer AVANT le RPC v4, jamais après.
//   1) `applyPersonTokens` : [Animal] et [Fratrie] -> substitute_person_name.
//      Si le prénom manque, le jeton est laissé TEL QUEL plutôt que remplacé par du
//      vide : « Le nom de [Animal] » signale un défaut de câblage, « Le nom de »
//      produirait une phrase cassée sans indice sur la cause.
//   2) formatTitle accepte `personName` (3 sites d'appel mis à jour).
//   3) formatSummary accepte `personName` ET `personGender` — DEUX genres au lieu
//      d'un. Correction d'un bug de fond : tous les jetons s'accordaient sur le genre
//      de l'ENFANT, y compris ceux qui décrivent quelqu'un d'autre. « [son/sa]
//      cousin(e) » donnait « sa cousine » pour une fille dont le cousin est un
//      garçon. Les jetons sont désormais répartis en deux familles explicites.
//      Repli sur le genre de l'enfant si personGender est absent -> zéro régression.
//   4) Ajout de [frère/sœur] (accordé sur la personne dédiée) et de [e] (suffixe
//      d'accord du héros, « tout seul[e] ») — ce dernier existe au catalogue depuis
//      toujours sans avoir jamais été implémenté.
//   ⚠️ [e] reste à corriger EN BASE : le node 5A du Book Factory injecte
//   resume_narratif brut dans le prompt Gemini, le jeton y partirait non résolu.
// MyStoriesTab v2.6
// Changelog v2.6 (FIX « Anniversaire null » sur les puces de la timeline) :
//   Le fix v2.4/v2.5 ne couvrait que la modale de choix de thème. Les PUCES affichées
//   sous chaque mois de la timeline avaient le même défaut, à deux endroits distincts
//   (mapTimelineRow et alternativesByBookRequestId — deux implémentations dupliquées) :
//   le libellé était `Anniversaire ${substitute_person_name}` pour toute condition
//   commençant par `birthday_`. Or le RPC v3 expose `birthday_child`, dont le
//   substitute_person_name vaut NULL → « Anniversaire null » (vu chez Shimer 9).
//   1) Nouveau helper `buildAlternativeLabel` : prénom si présent, sinon titre du thème.
//   2) Les deux blocs dupliqués l'utilisent — plus de divergence possible entre eux.
//   3) TOUTES les conditions de substitution génèrent désormais une puce, pas seulement
//      `birthday_*` et `milestone_*`. Noël (et plus tard halloween / pet / sibling)
//      était invisible sur la timeline alors qu'il apparaissait dans la modale.
//      Icône : PartyPopper pour les `birthday_*`, Sparkles pour le reste.
// MyStoriesTab v2.5
// Changelog v2.5 (RÉSUMÉ DES OPTIONS SPÉCIALES — nécessite le RPC v2) :
//   Complète le fix v2.4. Le RPC get_child_book_timeline expose désormais
//   `substitute_theme_resume` dans chaque objet de substitute_options (migration SQL
//   rpc_get_child_book_timeline_v2.sql). La carte « Option spéciale MCF » affiche donc
//   le vrai résumé narratif du thème, à parité avec la carte « Livre du mois ».
//   1) MockMonth.substituteOptions : nouveau champ `substituteThemeResume`.
//   2) mapTimelineRow : alimente ce champ via formatSummary(..., childName, gender) —
//      formaté ici et pas dans la feuille, car `gender` n'est pas disponible dans
//      ThemeSelectionSheet (même approche que standardSummary).
//   3) ThemeSelectionSheet : la description devient le résumé du thème pour TOUTES les
//      options spéciales. Si le résumé est absent (donnée en cache, RPC pas encore
//      migré), repli sur l'ancienne phrase d'anniversaire quand elle a du sens —
//      sinon aucune description.
//   4) Le titre passe par formatTitle (remplacement global de [Prénom]) au lieu d'un
//      .replace non global qui ne traitait que la première occurrence.
//   ⚠️ DÉPENDANCE : déployer le SQL AVANT ce fichier. Sans le RPC v2, le comportement
//   retombe exactement sur v2.4 (pas de régression, juste pas de résumé).
// MyStoriesTab v2.4
// Changelog v2.4 (FIX « null » dans le sélecteur de thème) : dans ThemeSelectionSheet, la
//   description des cartes « Option spéciale MCF » était la phrase d'anniversaire
//   (« Ce mois-ci, X fête son anniversaire… ») rendue INCONDITIONNELLEMENT pour toutes les
//   options de substitution. Or substitute_person_name est légitimement null pour les thèmes
//   de type milestone_* (ex. « Le premier "maman" ou "papa" de [Prénom] ») → le mot « null »
//   s'affichait dans l'UI. Correctifs :
//   1) La phrase d'anniversaire n'est produite que si l'option est bien de condition
//      `birthday_*` ET que substitutePersonName est non vide. Sinon, aucune description
//      n'est affichée (le titre du thème se suffit à lui-même) — pas de texte inventé.
//   2) Garde défensive symétrique sur le TITRE : une option `birthday_*` sans prénom ne
//      produit plus « Anniversaire de null » mais retombe sur substituteThemeTitre.
//   3) OptionCard.description devient optionnelle et n'est plus rendue si vide — supprime
//      aussi le <p> vide qui apparaissait quand standardSummary/bookSummary valaient ''.
//   Aucun autre comportement modifié. Le mapping RPC, les flows et le wizard sont inchangés.
// MyStoriesTab v2.3
// Changelog v2.3 (D1) : le badge de statut n'est plus affiché pour `to_plan` (« Bientôt
//   disponible »). Raisons : (a) redondant — la ligne « Ajoutez votre touche avant le … ·
//   Livraison … » sous la carte porte déjà l'info ; (b) sur iPhone il débordait, étant en
//   whitespace-nowrap à côté du mois et du bouton dans un conteneur min-w-0. Tous les autres
//   statuts (à personnaliser, configuré, en création, en impression, expédié, livré) sont
//   inchangés. Appliqué aux deux cartes qui rendaient ce badge.
// MyStoriesTab v2.2
// Changelog v2.2 (MOBILE — B6) : ajout de .pb-safe (padding-bottom safe-area, défini dans index.css)
//   sur la zone scrollable du wizard plein écran → le dernier bouton ne se colle plus à la barre
//   Safari du bas / au home indicator (l'overlay fixed inset-0 n'est pas atteint par la marge
//   globale du body). Desktop inchangé.
// MyStoriesTab v2.1
// Changelog v2.1 (MOBILE UNIQUEMENT — desktop strictement inchangé) :
//   1) VRAI fix du "scroll dans le vide" (v2.0 s'était trompé de cause). Sur une page courte, le
//      contenu du panneau tient sans scroller → le doigt faisait défiler la PAGE DU DASHBOARD
//      derrière le panneau opaque. Correctif : verrou de scroll du body pendant l'ouverture
//      (position:fixed iOS-safe + restauration de la position), comme le font Radix/vaul.
//   2) Le sélecteur de thème (ThemeSelectionSheet) passe aussi en PLEIN ÉCRAN.
//   3) Factorisation : nouveau composant partagé MobileFullScreenSheet (panneau + croix + portal +
//      verrou de scroll), utilisé par le Wizard ET le ThemeSelectionSheet. Import Drawer retiré
//      (plus aucun bottom drawer sur mobile).
// MyStoriesTab v2.0
// Changelog v2.0 (MOBILE UNIQUEMENT — desktop strictement inchangé) : nettoyage post-plein-écran.
// En plein écran, iOS remonte NATIVEMENT le champ actif au-dessus du clavier (comme sur une page
// normale) : tout le bricolage clavier de v1.7 était devenu inutile ET nuisible. Sur iOS,
// window.innerHeight est instable (barre Safari) donc le padding = hauteur du clavier ne se
// remettait pas toujours à 0 après fermeture du clavier → bande vide scrollable en bas des pages
// courtes (note, histoire inédite). Retiré : le state keyboardInset, l'effet visualViewport, le
// style paddingBottom du panneau, et les 2 onFocus scrollIntoView. Résultat : plus de scroll dans
// le vide, comportement clavier laissé au natif. Aucun autre changement.
// MyStoriesTab v1.9
// Changelog v1.9 (MOBILE UNIQUEMENT — desktop strictement inchangé) : le wizard passe en PLEIN
// ÉCRAN sur mobile au lieu du bottom drawer vaul. Motif : le drawer était structurellement mauvais
// sur mobile (clavier iOS qui l'éjectait hors écran, fermetures accidentelles au drag/tap, scroll
// bloqué quand iOS zoomait au focus). Changements :
//   1) Branche mobile du Wizard : <Drawer> vaul → panneau fixed inset-0 plein écran, rendu via
//      createPortal(document.body). Fermeture UNIQUEMENT via la croix (✕) en haut à droite (plus de
//      glisser/tap-extérieur pour fermer → fini les pertes de saisie accidentelles).
//   2) Zoom iOS au focus supprimé : les 3 champs texte (récit, note, lieu précis) forcés à 16px sur
//      mobile via "text-base md:text-sm" (iOS zoome dès que la police < 16px). 14px conservé desktop.
//   3) On garde le padding = hauteur du clavier (v1.7) sur la zone scrollable comme filet de
//      sécurité pour les champs du bas. Le repositionInputs de v1.8 disparaît avec le drawer.
// ThemeSelectionSheet (aucun champ texte) laissé en drawer volontairement. Import X + createPortal.
// MyStoriesTab v1.8
// Changelog v1.8 (MOBILE UNIQUEMENT) : le clavier iOS "propulsait" le drawer vaul hors écran par
// le haut (bug vaul connu et OUVERT — tickets #503/#514/#619). Cause : vaul repositionne lui-même
// le drawer à l'ouverture du clavier, et sur un drawer haut (90vh) il le pousse trop loin. Notre
// code visualViewport v1.7 se battait avec ce repositionnement. Correctif : repositionInputs={false}
// sur le <Drawer> mobile → vaul cesse de repositionner, et le mécanisme v1.7 (padding = hauteur du
// clavier + recentrage du champ actif) reprend la main. Concerne les 3 champs texte du wizard
// (récit, note, lieu précis). Desktop inchangé. Si insuffisant : bascule mobile en Dialog plein
// écran ancré en haut (voie 2).
// MyStoriesTab v1.7
// Changelog v1.7 (MOBILE UNIQUEMENT) : vrai fix du clavier iOS dans le wizard (le v1.6 visait la
// mauvaise couche). Le problème n'était pas le scroll interne mais le drawer vaul (position:fixed)
// que le clavier iOS pousse hors écran par le haut. Correctif : on écoute window.visualViewport
// (qui rétrécit à l'ouverture du clavier) → on ajoute au conteneur scrollable un padding-bottom
// égal à la hauteur du clavier (donne la place de remonter le champ au-dessus du clavier), puis on
// recentre le champ actif. Gated isMobile + open. Les onFocus scrollIntoView (récit + note) sont
// conservés comme premier nudge. Desktop inchangé (branche Dialog).
// Changelog v1.6 (MOBILE UNIQUEMENT) : fix clavier iOS sur les champs texte du wizard. Au focus,
// iOS sur-scrollait le champ au-dessus de la zone visible (on voyait le bouton mais plus ce qu'on
// tapait). Correctif : onFocus → scrollIntoView({ block: 'center' }) après ~300ms (temps que le
// clavier monte), gated sur isMobile. Appliqué au champ récit (Histoire inédite) et au champ note.
// Champ destination libre laissé tel quel (fonctionne déjà). Desktop inchangé.
// Changelog v1.5 (MOBILE UNIQUEMENT) : fix scroll bloqué dans le wizard « Ajouter votre touche »
// sur mobile (Drawer vaul). Le scroll était porté par le DrawerContent lui-même (élément draggable
// de vaul) → le geste de drag interceptait le scroll tactile iOS, impossible d'atteindre les
// personnages du bas ni « Suivant ». Correctif : contenu enveloppé dans un conteneur scrollable
// interne (flex-1 min-h-0 overflow-y-auto + overscroll-contain), DrawerContent en flex flex-col.
// Desktop inchangé (branche Dialog). Même pattern que ThemeSelectionSheet qui scrollait déjà.
// Changelog v1.4 (AFFICHAGE UNIQUEMENT) : dans le wizard « Où se passe l'histoire ? », les lieux
// INACTIFS (is_active === false, « on n'y vit plus ») sont désormais AFFICHÉS grisés + non
// cliquables (badge « Nous n'y vivons plus »), au lieu d'être masqués. Cohérent avec le wizard de
// création d'enfant. Requête familyPlaces : ne filtre plus les inactifs (garde l'exclusion
// destination_libre), tri actifs d'abord. Aucune écriture DB modifiée.
// MyStoriesTab v1.3
// Changelog v1.3 : vrai fix du message de plafond — gère maintenant les 4 combinaisons (aucun /
// animaux / doudous / les deux) À LA FOIS pour le plafond partiel ET le plafond total. Avant,
// le plafond total affichait toujours "et animaux" même si seuls des doudous (ou aucun des deux)
// étaient en cause.
// Changelog v1.2 : message de plafond corrigé pour distinguer/combiner animaux et doudous — si
// les deux plafonds sont atteints en même temps, affiche désormais "animaux et doudous" au lieu
// de n'afficher que "animaux" (les deux blocs dupliqués — flow standard et flow custom — mis à
// jour identiquement). Le message du plafond TOTAL (non demandé) n'a pas changé.
// Changelog v1.1 : doudous ajoutés au wizard de sélection de personnages (choix "Qui accompagne
// [enfant] dans [livre] ?"). Nouveau type 'comforter' sur WizardCharacter, plafond dédié
// MAX_TOYS=2 (même mécanique que MAX_PETS, INDÉPENDANT — pas partagé avec les animaux ; c'est une
// règle différente du budget d'image de référence Book Factory qui, lui, partage un seul slot
// non-humain par page). Construit depuis activeChild.toys (désormais correctement filtré par
// enfant grâce au fix useFamilyData v2.0). Statut "Perdu" grisé comme pour les animaux "N'est
// plus avec nous". Note : la partie n8n (Book Factory) doit reconnaître type:"comforter" dans
// selected_characters pour que la sélection ait un effet visuel/narratif complet — à
// confirmer/aligner à la Phase 3. La "règle random" quand les parents ne personnalisent pas vit
// côté n8n (ex: shuffledPets dans 4A_Build_Context_Client) — pas modifiable depuis ce fichier.
import React, { useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useQueries, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, ArrowLeft, Calendar, ChevronRight, ChevronDown, Loader2, MapPin, AlertTriangle, PartyPopper, Cake, BookOpen, Library, Truck, Check, User, X } from 'lucide-react';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { useFamilyData, type FamilyChild } from '@/hooks/useFamilyData';
import { useBookTimeline, type BookTimelineRow } from '@/hooks/useBookTimeline';
import { useSaveBookChoice, type CharacterChoice } from '@/hooks/useSaveBookChoice';
import { differenceInCalendarDays, format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Child {
  id: string;
  firstName: string;
  age: string;
  avatar: string | null;
  personalityEmoji: string;
}

interface MyStoriesTabProps {
  children?: Child[];
}

// ---------- Mock data ----------

type MonthStatus =
  | 'to_personalize'
  | 'configured'
  | 'in_creation'
  | 'in_printing'
  | 'shipped'
  | 'delivered'
  | 'to_plan';

interface MockMonth {
  monthIndex: number;
  monthLabel: string;
  deliveryDate: string;
  deliveryShort: string;
  status: MonthStatus;
  bookTitle: string;
  bookSummary: string;
  standardTitle?: string;
  standardSummary?: string;
  bookTags: string[];
  // contextual
  deadline?: string;
  daysLeft?: number;
  configuredOn?: string;
  configuredCharacters?: string[];
  bookRequestId?: string;
  themeId?: string | null;
  configuredSummary?: string;
  savedNote?: string;
  savedLocationId?: string | null;
  savedLocationLabel?: string | null;
  substituteOptions?: Array<{
    substituteThemeId: string;
    substituteThemeTitre: string;
    substituteThemeResume?: string;
    substituteCondition: string;
    substitutePersonName: string;
  }>;
  selectedThemeType?: string | null;
  selectedThemeId?: string | null;
  originalThemeInstructions?: string | null;
  dedicatedPersonName?: string | null;
  isPreparing?: boolean;
  alternatives?: Array<
    | { type: 'birthday'; label: string; substituteIndex: number; substituteThemeId: string }
    | { type: 'milestone'; label: string; substituteIndex: number; substituteThemeId: string }
    | { type: 'custom'; label: string }
  >;
}

const MOCK_MONTHS: MockMonth[] = [
  {
    monthIndex: 0,
    monthLabel: 'Juin 2026',
    deliveryDate: '15 juin 2026',
    deliveryShort: '15 juin',
    status: 'to_personalize',
    bookTitle: "L'île du temps",
    bookSummary: "Manon découvre une île mystérieuse où chaque grain de sable raconte une histoire. Un voyage poétique pour comprendre le temps qui passe.",
    bookTags: ['32 pages', '6–7 ans', 'Résolution de problème'],
    deadline: '20 mai',
    daysLeft: 14,
    substituteOptions: [
      {
        substituteThemeId: 'sub-1',
        substituteThemeTitre: "L'anniversaire de Jules",
        substituteCondition: 'birthday',
        substitutePersonName: 'Jules',
      },
    ],
  },
  {
    monthIndex: 1,
    monthLabel: 'Juillet 2026',
    deliveryDate: '15 juillet 2026',
    deliveryShort: '15 juillet',
    status: 'configured',
    bookTitle: 'Les vacances au bout du monde',
    bookSummary: "Une grande aventure familiale où Manon explore des paysages extraordinaires.",
    bookTags: ['28 pages', '6–7 ans', 'Découverte'],
    configuredOn: '3 mai',
    configuredCharacters: ['Jules', 'Papa'],
  },
  {
    monthIndex: 2,
    monthLabel: 'Août 2026',
    deliveryDate: '15 août 2026',
    deliveryShort: '15 août',
    status: 'in_creation',
    bookTitle: 'La porte des grands',
    bookSummary: "Manon franchit une porte magique vers le monde des grands.",
    bookTags: ['32 pages', '6–7 ans', 'Confiance en soi'],
  },
  {
    monthIndex: 3,
    monthLabel: 'Septembre 2026',
    deliveryDate: '1er septembre 2026',
    deliveryShort: '1er septembre',
    status: 'in_printing',
    bookTitle: 'La classe des explorateurs du savoir',
    bookSummary: "Manon entre dans une école pas comme les autres.",
    bookTags: ['36 pages', '6–7 ans', 'Curiosité'],
  },
  ...[
    ['Octobre 2026', '15 octobre 2026', '15 octobre', "Le carnaval des étoiles"],
    ['Novembre 2026', '15 novembre 2026', '15 novembre', "Le secret de la rivière"],
    ['Décembre 2026', '15 décembre 2026', '15 décembre', "Un Noël hors du temps"],
    ['Janvier 2027', '15 janvier 2027', '15 janvier', "La forêt des murmures"],
    ['Février 2027', '15 février 2027', '15 février', "Le grand défi du courage"],
    ['Mars 2027', '15 mars 2027', '15 mars', "Le printemps des inventeurs"],
    ['Avril 2027', '15 avril 2027', '15 avril', "Le carnet des mille rêves"],
    ['Mai 2027', '15 mai 2027', '15 mai', "Le voyage du dernier dragon"],
  ].map(([label, date, short, title], i): MockMonth => ({
    monthIndex: 4 + i,
    monthLabel: label,
    deliveryDate: date,
    deliveryShort: short,
    status: 'to_plan',
    bookTitle: title,
    bookSummary: `Une nouvelle aventure attend Manon dans ${title.toLowerCase()}.`,
    bookTags: ['32 pages', '6–7 ans', 'Imagination'],
    deadline: '—',
  })),
];

const MOCK_CHARACTERS = [
  { id: 'maman', label: 'Maman', emoji: '👩' },
  { id: 'papa', label: 'Papa', emoji: '👨' },
  { id: 'jules', label: 'Jules', emoji: '🧒' },
  { id: 'valentine', label: 'Valentine', emoji: '👧' },
  { id: 'broski', label: 'Broski', emoji: '🐶' },
  { id: 'mamie', label: 'Grand-mère', emoji: '👵' },
];

// ---------- Status badge config ----------

const STATUS_CONFIG: Record<MonthStatus, { label: string; Icon?: React.ElementType; badgeClass: string; borderClass: string; secondaryClass: string }> = {
  to_personalize: {
    // v3.3 — décrit la fenêtre d'action, pas un état terminé.
    label: 'Bientôt en fabrication',
    Icon: Sparkles,
    badgeClass: 'bg-orange-100 text-orange-700 border-orange-200',
    borderClass: 'border-l-[3px] border-l-orange-400',
    secondaryClass: 'text-orange-600',
  },
  configured: {
    label: 'Configuré',
    badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    borderClass: 'border-l-[3px] border-l-transparent',
    secondaryClass: 'text-muted-foreground',
  },
  in_creation: {
    label: 'En création',
    badgeClass: 'bg-violet-100 text-violet-700 border-violet-200',
    borderClass: 'border-l-[3px] border-l-transparent',
    secondaryClass: 'text-muted-foreground',
  },
  in_printing: {
    label: 'En impression',
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
    borderClass: 'border-l-[3px] border-l-transparent',
    secondaryClass: 'text-muted-foreground',
  },
  to_plan: {
    label: 'Bientôt disponible',
    badgeClass: 'bg-gray-50 text-gray-400 border-gray-100',
    borderClass: 'border-l-[3px] border-l-transparent',
    secondaryClass: 'text-muted-foreground/60',
  },
  shipped: {
    label: 'Expédié',
    Icon: Truck,
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
    borderClass: 'border-l-[3px] border-l-transparent',
    secondaryClass: 'text-muted-foreground',
  },
  delivered: {
    label: 'Livré',
    Icon: Check,
    badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    borderClass: 'border-l-[3px] border-l-transparent',
    secondaryClass: 'text-muted-foreground',
  },
};

const PRIMARY_VIOLET = '#534AB7';

// Avatar with shimmer skeleton until image loads
const WizardAvatar: React.FC<{ avatarUrl?: string; emoji: string; name: string }> = ({ avatarUrl, emoji, name }) => {
  const [loaded, setLoaded] = useState(false);
  if (!avatarUrl) {
    return <span className="text-3xl">{emoji}</span>;
  }
  return (
    <div className={`w-12 h-12 rounded-full overflow-hidden bg-muted flex items-center justify-center flex-shrink-0 ${loaded ? '' : 'animate-pulse'}`}>
      <img
        src={avatarUrl}
        alt={name}
        className="w-full h-full object-cover"
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; setLoaded(true); }}
      />
    </div>
  );
};

// Helper: replace [Prénom] placeholder with real child name
// v2.9 — Injection d'un prénom AVEC ÉLISION.
// « dans celles de [Fratrie] » donnait « dans celles de Emma ». En français il faut
// « d'Emma ». Le cas touche tout prénom commençant par une voyelle (Emma, Alice,
// Inès, Owen, Élise, Antoine…), et donc aussi [Prénom] : « Les premiers pas de
// Alice ». L'élision est appliquée UNIQUEMENT devant le jeton, jamais sur le reste
// du texte — pas de « d'après-midi » transformé par erreur.
// Le « h » est volontairement exclu : « de Hugo » devrait donner « d'Hugo » mais
// « de Hollande » non, et rien ne permet de distinguer un h muet d'un h aspiré sur
// un prénom. Mieux vaut une élision manquante qu'une élision fautive.
// v3.1 — Le « y » est exclu pour EXACTEMENT la même raison que le « h ».
// « d'Yves » est correct, « de Yann », « de Yasmine », « de Yohan » le sont aussi.
// Le y est tantôt voyelle, tantôt consonne (yod), et rien sur un prénom ne permet
// de trancher. La majorité des prénoms en Y prend « de » -> on ne l'élide plus.
const VOWEL_START = /^[aeiouàâäéèêëíîïóôöúùûü]/i;

// v3.0 — L'élision devient réutilisable HORS du contexte des jetons.
// Elle était enfermée dans injectName, qui n'agit que devant un jeton du catalogue
// (« de [Fratrie] »). Les titres construits par template en dur — « Anniversaire de
// {prénom} » — ne contiennent aucun jeton et échappaient donc totalement à la v2.9.
// Ce n'était pas une régression mais un trou de couverture.
const withDe = (name: string) => (VOWEL_START.test(name) ? `d'${name}` : `de ${name}`);

const injectName = (text: string, token: string, name: string) => {
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text
    .replace(new RegExp(`\\bde ${escaped}`, 'g'), withDe(name))
    .replace(new RegExp(escaped, 'g'), name);
};

// `personName` = prénom de la personne (ou de l'animal) à qui le livre est dédié,
// c'est-à-dire substitute_person_name. Les jetons [Animal] et [Fratrie] désignent tous
// deux ce même champ ; deux noms distincts sont conservés pour que les rédactrices de
// thèmes sachent de quoi elles parlent en écrivant.
// Si personName est absent, le jeton est laissé TEL QUEL et non remplacé par du vide :
// « Le nom de [Animal] » signale un défaut de câblage, « Le nom de » produirait une
// phrase cassée sans qu'on sache pourquoi.
const applyPersonTokens = (text: string, personName?: string | null) => {
  const name = typeof personName === 'string' && personName.trim() ? personName.trim() : null;
  if (!name) return text;
  return injectName(injectName(text, '[Animal]', name), '[Fratrie]', name);
};

const formatTitle = (text: string | null, firstName: string, personName?: string | null) =>
  text ? applyPersonTokens(injectName(text, '[Prénom]', firstName), personName) : '';
// v2.6 — Libellé d'une puce d'alternative sur la timeline.
// substitute_person_name n'est renseigné QUE pour les anniversaires de proches et de
// la fratrie. Il est NULL pour birthday_child, christmas, halloween et milestone_* :
// dans ce cas on affiche le titre du thème plutôt que « Anniversaire null ».
// v2.8 — Le libellé « Anniversaire X » est réservé aux conditions `birthday_*`.
// Le v2.7 le posait dès qu'un prénom était présent, or le RPC v4 renseigne aussi
// substitute_person_name pour `substitute_pet` et `substitute_sibling`, qui ne sont
// PAS des anniversaires. Résultat en prod : « Anniversaire Jules » affiché pour
// « Le jeu du hochet lancé », un livre sur la fratrie sans rapport avec une fête —
// et le même prénom apparaissant sur deux mois pour deux raisons différentes.
const buildAlternativeLabel = (opt: any, firstName: string): string => {
  const cond = typeof opt?.substitute_condition === 'string' ? opt.substitute_condition : '';
  const person =
    typeof opt?.substitute_person_name === 'string' && opt.substitute_person_name.trim()
      ? opt.substitute_person_name.trim()
      : null;
  if (person && cond.startsWith('birthday_')) return `Anniversaire ${person}`;
  return formatTitle(opt?.substitute_theme_titre ?? null, firstName, opt?.substitute_person_name);
};

// v2.7 — DEUX genres, pas un seul.
//   `gender`       = genre de l'ENFANT héros.
//   `personGender` = genre de la personne à qui le livre est dédié (le cousin, la
//                    grand-mère, le frère, l'animal). Vient de substitute_person_gender.
// Certains jetons décrivent le héros, d'autres la personne dédiée. Les accorder tous
// sur l'enfant était un bug : « [son/sa] cousin(e) » donnait « sa cousine » pour une
// fille dont le cousin est un garçon. Quand personGender est absent, on retombe sur le
// genre de l'enfant — comportement d'avant, donc aucune régression.
const formatSummary = (
  text: string | null,
  firstName: string,
  gender?: string,
  personName?: string | null,
  personGender?: string,
) => {
  if (!text) return '';
  const isFemale = gender === 'girl' || gender === 'female';
  // Genre de la personne dédiée ; repli sur celui de l'enfant si non fourni.
  const other = personGender ?? gender;
  const otherIsFemale = other === 'girl' || other === 'female';
  const out = injectName(text, '[Prénom]', firstName)
    // ── Jetons décrivant la PERSONNE DÉDIÉE ──────────────────────────────
    // Le possessif « son/sa » s'accorde avec le nom qui suit, donc avec le genre
    // de la personne dédiée — pas avec celui du héros.
    .replace(/\[son\/sa\] \[ami\/amie\]/g, otherIsFemale ? 'son amie' : 'son ami')
    .replace(/\[son\/sa\] \[cousin\/cousine\]/g, otherIsFemale ? 'sa cousine' : 'son cousin')
    .replace(/\[son\/sa\] cousin\(e\)/g, otherIsFemale ? 'sa cousine' : 'son cousin')
    .replace(/\[ami\/amie\]/g, otherIsFemale ? 'amie' : 'ami')
    .replace(/\[cousin\/cousine\]/g, otherIsFemale ? 'cousine' : 'cousin')
    .replace(/\[cousine\/cousin\]/g, otherIsFemale ? 'cousine' : 'cousin')
    .replace(/cousin\(e\)/g, otherIsFemale ? 'cousine' : 'cousin')
    .replace(/\[frère\/sœur\]/g, otherIsFemale ? 'sœur' : 'frère')
    .replace(/\[frère\/soeur\]/g, otherIsFemale ? 'sœur' : 'frère')
    // ── Jetons décrivant l'ENFANT héros ──────────────────────────────────
    .replace(/\[le\/la\]/g, isFemale ? 'la' : 'le')
    .replace(/\[lui\/elle\]/g, isFemale ? 'elle' : 'lui')
    .replace(/\[il\/elle\]/g, isFemale ? 'elle' : 'il')
    .replace(/\[son\/sa\]/g, isFemale ? 'sa' : 'son')
    .replace(/\[Curieux\/Curieuse\]/g, isFemale ? 'Curieuse' : 'Curieux')
    .replace(/Curieux\/se/g, isFemale ? 'Curieuse' : 'Curieux')
    // Suffixe d'accord : « tout seul[e] » -> « tout seul » / « toute seule ».
    // Présent une fois au catalogue, jamais implémenté jusqu'ici.
    .replace(/\[e\]/g, isFemale ? 'e' : '');
  return applyPersonTokens(out, personName);
};

// ---------- Supabase row → MockMonth shape ----------

const PLACEHOLDER_TITLE = 'Thème à venir';

function mapTimelineRow(row: BookTimelineRow, idx: number, childName: string, childId: string, gender?: string): MockMonth {
  console.log('DEBUG dedicated:', {
    selected_theme_id: row.selected_theme_id,
    selected_theme_type: row.selected_theme_type,
    substitute_options: row.substitute_options,
    is_array: Array.isArray(row.substitute_options)
  });
  const delivery = parseISO(row.delivery_month);
  const deadline = row.personalization_deadline ? parseISO(row.personalization_deadline) : null;
  const daysLeft = deadline ? differenceInCalendarDays(deadline, new Date()) : undefined;

  // v3.2 [1] — La deadline fait foi, sans attendre le passage de
  // lock-overdue-books. `< 0` : le jour même de la deadline reste ouvert.
  const deadlinePassed = daysLeft !== undefined && daysLeft < 0;

  let status: MonthStatus = 'to_plan';
  if (row.status === 'pending_choice') {
    status = deadlinePassed
      ? 'configured'   // plus modifiable : partira avec le thème standard
      : daysLeft !== undefined && daysLeft <= 14 ? 'to_personalize' : 'to_plan';
  } else if (row.status === 'configured' || row.status === 'locked') {
    status = row.production_status === 'printing' ? 'in_printing' : 'configured';
  } else if (row.status === 'generating' || row.production_status === 'generating') {
    status = 'in_creation';
  } else if (row.status === 'printing' || row.production_status === 'printing') {
    status = 'in_printing';
  } else if (row.status === 'shipped') {
    status = 'shipped';
  } else if (row.status === 'delivered') {
    status = 'delivered';
  }

  const monthLabel = format(delivery, 'LLLL yyyy', { locale: fr }).replace(/^./, (c) => c.toUpperCase());
  // v3.5 — fenêtre de livraison plutôt que jour exact.
  const deliveryDate = `début ${format(delivery, "MMMM yyyy", { locale: fr })}`;
  const deliveryShort = `début ${format(delivery, "MMMM", { locale: fr })}`;
  const deadlineShort = deadline ? format(deadline, 'd MMMM', { locale: fr }) : '';

  return {
    monthIndex: idx,
    monthLabel,
    deliveryDate,
    deliveryShort,
    status,
    // v3.2 [1] — un mois dont la deadline est passée est « en préparation »
    // même si son statut en base est resté à pending_choice.
    isPreparing:
      ['locked', 'generating', 'printing', 'shipped', 'delivered'].includes(row.status) ||
      (row.status === 'pending_choice' && deadlinePassed),
    bookTitle: (() => {
      if (row.selected_theme_type === 'original')
        return 'Histoire inédite';
      if (row.selected_theme_titre)
        return formatTitle(row.selected_theme_titre, childName);
      if (row.titre)
        return formatTitle(row.titre, childName);
      return PLACEHOLDER_TITLE;
    })(),
    bookSummary: (() => {
      if (row.selected_theme_type === 'original') {
        if (row.original_theme_instructions)
          return row.original_theme_instructions;
        return 'Votre histoire est en cours de préparation…';
      }
      if (row.selected_theme_resume)
        return formatSummary(row.selected_theme_resume, childName, gender);
      if (row.resume_narratif)
        return formatSummary(row.resume_narratif, childName, gender);
      return '';
    })(),
    standardTitle: row.titre ? formatTitle(row.titre, childName) : PLACEHOLDER_TITLE,
    standardSummary: row.resume_narratif ? formatSummary(row.resume_narratif, childName, gender) : '',
    bookTags: [],
    deadline: deadlineShort,
    daysLeft: daysLeft !== undefined && daysLeft >= 0 ? daysLeft : undefined,
    bookRequestId: row.book_request_id,
    themeId: row.theme_id ?? null,
    savedNote: row.saved_note || '',
    savedLocationId: row.selected_location_id ?? null,
    savedLocationLabel: row.selected_location_label ?? null,
    substituteOptions: (row.substitute_options || []).map((s: any) => ({
      substituteThemeId: s.substitute_theme_id,
      substituteThemeTitre: s.substitute_theme_titre,
      // v2.5 : formaté ici (et pas dans la feuille) car `gender` n'y est pas disponible
      substituteThemeResume: s.substitute_theme_resume
        ? formatSummary(
            s.substitute_theme_resume,
            childName,
            gender,
            s.substitute_person_name,
            s.substitute_person_gender,
          )
        : '',
      substituteCondition: s.substitute_condition,
      substitutePersonName: s.substitute_person_name,
    })),
    selectedThemeType: row.selected_theme_type ?? null,
    selectedThemeId: row.selected_theme_id ?? null,
    originalThemeInstructions: row.original_theme_instructions ?? null,
    dedicatedPersonName: (() => {
      if (!row.selected_characters || !Array.isArray(row.selected_characters)) return null;
      const found = (row.selected_characters as any[]).find((c: any) => c?.dedicated === true);
      return found?.name ?? null;
    })(),
    configuredCharacters: (() => {
      if (!row.selected_characters || !Array.isArray(row.selected_characters)) return [];
      return (row.selected_characters as any[])
        .filter((c: any) => c.id !== childId)
        .map((c: any) => c.name);
    })(),
    configuredSummary: (() => {
      const parts: string[] = [];
      if (row.selected_characters && Array.isArray(row.selected_characters)) {
        const names = (row.selected_characters as any[])
          .filter((c: any) => c.id !== childId)
          .map((c: any) => c.name);
        if (names.length > 0) parts.push(`Avec ${names.join(', ')}`);
      }
      if (row.saved_note && row.saved_note.trim()) {
        parts.push(`"${row.saved_note.slice(0, 40)}${row.saved_note.length > 40 ? '…' : ''}"`);
      }
      return parts.join(' · ') || undefined;
    })(),
    alternatives: (() => {
      const alts: NonNullable<MockMonth['alternatives']> = [];
      (row.substitute_options || []).forEach((o: any, idx: number) => {
        const cond = typeof o?.substitute_condition === 'string' ? o.substitute_condition : '';
        if (!cond) return;
        const label = buildAlternativeLabel(o, childName);
        if (!label) return;
        const altType: 'birthday' | 'milestone' = cond.startsWith('birthday_')
          ? 'birthday'
          : 'milestone';
        alts.push({
          type: altType,
          label,
          substituteIndex: idx,
          substituteThemeId: o.substitute_theme_id,
        });
      });
      if (row.show_custom_story) {
        alts.push({ type: 'custom', label: 'Histoire inédite' });
      }
      return alts;
    })(),
  };
}

// ---------- Mobile full-screen sheet (shared) ----------
// Panneau plein écran mobile réutilisé par le Wizard et le ThemeSelectionSheet.
// Remplace le bottom drawer vaul (mauvais sur mobile : clavier, fermetures accidentelles, scroll).
// - Rendu via createPortal(document.body) → insensible à un ancêtre transformé.
// - Fermeture UNIQUEMENT via la croix (✕) en haut à droite (convention : quitter = à droite).
// - VERROU DE SCROLL DU BODY pendant l'ouverture (technique iOS-safe : position:fixed sur le body
//   + restauration de la position au close). Sans ça, sur une page courte le contenu tient sans
//   scroller et le doigt fait défiler la page du dashboard DERRIÈRE le panneau (scroll dans le vide).
const MobileFullScreenSheet: React.FC<{
  open: boolean;
  onClose: () => void;
  closeDisabled?: boolean;
  children: React.ReactNode;
}> = ({ open, onClose, closeDisabled, children }) => {
  React.useEffect(() => {
    if (!open) return;
    const body = document.body;
    const scrollY = window.scrollY;
    const prev = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
    };
    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
    return () => {
      body.style.overflow = prev.overflow;
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.width = prev.width;
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Barre supérieure : fermeture explicite */}
      <div className="flex items-center justify-end h-12 px-3 flex-shrink-0 border-b border-border/60">
        <button
          type="button"
          onClick={onClose}
          disabled={closeDisabled}
          aria-label="Fermer"
          className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      {/* Zone scrollable */}
      <div className="flex-1 overflow-y-auto overscroll-contain min-h-0 pb-safe">
        {children}
      </div>
    </div>,
    document.body,
  );
};

// ---------- Wizard ----------

type FlowType = 'monthly' | 'special' | 'custom';

interface WizardCharacter {
  type: 'child' | 'family_member' | 'pet' | 'comforter';
  id: string;
  name: string;
  emoji: string;
  avatarUrl?: string;
  locked?: boolean; // locked = always selected, cannot be unchecked
  inactive?: boolean;
  inactiveLabel?: string;
}

interface WizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  childName: string;
  childAge?: number | null;
  flow: FlowType;
  bookTitle: string;
  characters: WizardCharacter[];
  isSaving: boolean;
  savedCharacters?: CharacterChoice[];
  savedNote?: string;
  savedLocationId?: string | null;
  savedLocationLabel?: string | null;
  onSubmit: (payload: { selectedCharacters: CharacterChoice[]; storyIdea?: string; note?: string; locationId?: string | null; locationLabel?: string | null }) => void;
  onBackToThemeSheet?: () => void;
  autoSelectedIds?: string[];
  dedicatedName?: string | null;
  initialCustomStory?: string;
  familyPlaces?: Array<{ id: string; label: string; type: string; city?: string; is_active?: boolean }>;
  locationPresets?: Array<{ id: string; label: string; details: any }>;
  onLocationSelect?: (locationId: string | null, locationLabel: string | null) => void;
  childId?: string | null;
  bookRequestId?: string | null;
}

const Wizard: React.FC<WizardProps> = ({ open, onOpenChange, childName, childAge, flow, bookTitle, characters, isSaving, savedCharacters, savedNote, savedLocationId, savedLocationLabel, onSubmit, onBackToThemeSheet, autoSelectedIds, dedicatedName, initialCustomStory, familyPlaces, locationPresets, childId, bookRequestId }) => {
  const isMobile = useIsMobile();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [customStory, setCustomStory] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [selectedLocationLabel, setSelectedLocationLabel] = useState<string | null>(null);
  const [customDestSelected, setCustomDestSelected] = useState(false);
  const [customDestText, setCustomDestText] = useState('');
  const [isPreparingDest, setIsPreparingDest] = useState(false);
  const [destError, setDestError] = useState<string | null>(null);
  const isSubmittingRef = useRef<boolean>(false);

  // Selection caps based on child's age
  const MAX_TOTAL = (typeof childAge === 'number' && childAge < 4) ? 5 : 6;
  const MAX_PETS = 2;
  const MAX_TOYS = 2;
  const selectedPetsCount = characters.filter((c) => c.type === 'pet' && selected.includes(c.id)).length;
  const selectedToysCount = characters.filter((c) => c.type === 'comforter' && selected.includes(c.id)).length;
  const totalCapReached = selected.length >= MAX_TOTAL;
  const petsCapReached = selectedPetsCount >= MAX_PETS;
  const toysCapReached = selectedToysCount >= MAX_TOYS;

  // When the wizard opens, initialize all values; on close, leave state as-is to avoid flash
  React.useEffect(() => {
    if (open) {
      const lockedIds = characters.filter((c) => c.locked).map((c) => c.id);
      const isSpecial = typeof flow === 'string' && flow.startsWith('special');
      const savedIds = (savedCharacters || [])
        .filter((c: any) => {
          if (!isSpecial) return true;
          if (c?.dedicated && c?.name !== dedicatedName) return false;
          return true;
        })
        .map((c: any) => c.id);
      const autoIds = autoSelectedIds || [];
      const inactiveIds = new Set(characters.filter((c) => c.inactive).map((c) => c.id));
      setSelected([...new Set([...lockedIds, ...savedIds, ...autoIds])].filter((id) => !inactiveIds.has(id)));
      setNote(savedNote || '');
      setCustomStory(initialCustomStory || '');
      setSelectedLocationId(savedLocationId ?? null);
      setSelectedLocationLabel(savedLocationLabel ?? null);
      setCustomDestSelected(false);
      setCustomDestText('');
      setIsPreparingDest(false);
      setDestError(null);
      setStep(1);
      // Rehydrate custom destination ("Un lieu précis…") if the saved location
      // points to a places row of type 'destination_libre'.
      if (savedLocationId) {
        (async () => {
          try {
            const { data: placeRow } = await supabase
              .from('places')
              .select('type')
              .eq('id', savedLocationId)
              .maybeSingle();
            if (placeRow?.type === 'destination_libre') {
              setCustomDestSelected(true);
              setCustomDestText(savedLocationLabel ?? '');
            }
          } catch {
            // ignore — fall back to default (no custom selection)
          }
        })();
      }
    }
  }, [open]);

  const handleClose = (o: boolean) => {
    if (!o && isSaving) return;
    isSubmittingRef.current = false;
    onOpenChange(o);
  };

  const toggle = (id: string) => {
    const target = characters.find((c) => c.id === id);
    if (target?.locked || target?.inactive) return;
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_TOTAL) return prev;
      if (target?.type === 'pet' && selectedPetsCount >= MAX_PETS) return prev;
      if (target?.type === 'comforter' && selectedToysCount >= MAX_TOYS) return prev;
      return [...prev, id];
    });
  };

  const handleValidate = () => {
    isSubmittingRef.current = true;
    const selectedChars: CharacterChoice[] = characters
      .filter((c) => selected.includes(c.id))
      .map((c) => ({ type: c.type, id: c.id, name: c.name }));
    onSubmit({
      selectedCharacters: selectedChars,
      storyIdea: isCustom ? customStory.trim() : undefined,
      note: !isCustom ? note.trim() || undefined : undefined,
      locationId: selectedLocationId,
      locationLabel: selectedLocationLabel,
    });
  };

  const isCustom = flow === 'custom';
  const charactersStepTitle = isCustom
    ? `Qui est dans cette histoire ?`
    : `Qui accompagne ${childName} dans ${bookTitle} ?`;
  const validateLabel = isCustom ? 'Valider mon histoire inédite' : 'Valider mon livre';

  const Content = (
    <div className="px-5 pb-6 pt-2 sm:px-8 sm:pt-6 relative">
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <div
          className="h-2 rounded-full transition-all"
          style={{
            width: step === 1 ? 28 : 8,
            backgroundColor: step === 1 ? PRIMARY_VIOLET : '#E5E7EB',
          }}
        />
        <div
          className="h-2 rounded-full transition-all"
          style={{
            width: step === 2 ? 28 : 8,
            backgroundColor: step === 2 ? PRIMARY_VIOLET : '#E5E7EB',
          }}
        />
        <div
          className="h-2 rounded-full transition-all"
          style={{
            width: step === 3 ? 28 : 8,
            backgroundColor: step === 3 ? PRIMARY_VIOLET : '#E5E7EB',
          }}
        />
      </div>

      {/* Custom flow: step 1 = story idea */}
      {isCustom && step === 1 && (
        <>
          <h3 className="text-xl font-bold text-foreground text-center mb-1">
            Quelle aventure imaginez-vous pour {childName} ?
          </h3>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Décrivez librement : le lieu, les personnages, l'ambiance, un souvenir… On s'occupe du reste.
          </p>

          <div className="relative mb-6">
            <Textarea
              value={customStory}
              onChange={(e) => setCustomStory(e.target.value)}
              placeholder={`Ex : ${childName} part explorer une grotte sous-marine avec son grand-père, elle découvre un coffre rempli de photos de famille…`}
              className="min-h-40 text-base md:text-sm"
            />
            <div className="absolute bottom-2 right-3 text-xs text-muted-foreground">
              {customStory.length < 30
                ? `Encore ${30 - customStory.length} car. minimum`
                : <span className="inline-flex items-center gap-0.5">{customStory.length} caractères <Check className="h-3 w-3" /></span>}
            </div>
          </div>

          <Button
            onClick={() => setStep(2)}
            disabled={customStory.trim().length < 30}
            className="w-full text-white hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: PRIMARY_VIOLET }}
          >
            Suivant →
          </Button>
        </>
      )}

      {/* Standard flow: step 1 = characters */}
      {!isCustom && step === 1 && (
        <>
          {onBackToThemeSheet && flow !== 'monthly' && (
            <button
              type="button"
              onClick={onBackToThemeSheet}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Choisir un autre thème
            </button>
          )}
          <h3 className="text-xl font-bold text-foreground text-center mb-1">
            {charactersStepTitle}
          </h3>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Sélectionne les personnages qui apparaîtront dans le livre
          </p>

          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted mb-4 text-sm text-muted-foreground">
            <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span><strong>{childName}</strong> est toujours dans l'histoire</span>
          </div>

          {dedicatedName && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted mb-4 text-sm text-muted-foreground">
              <Cake className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span><strong>{dedicatedName}</strong> est la star de ce livre</span>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 mb-8">
            {characters.filter((c) => !c.locked).map((c) => {
              const isSel = selected.includes(c.id);
              const disabledByCap = !isSel && (totalCapReached || (c.type === 'pet' && petsCapReached) || (c.type === 'comforter' && toysCapReached));
              const isInactive = !!c.inactive;
              const isDisabled = c.locked || disabledByCap || isInactive;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => !isDisabled && toggle(c.id)}
                  disabled={isDisabled}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all"
                  style={{
                    borderColor: isSel ? PRIMARY_VIOLET : '#E5E7EB',
                    backgroundColor: isSel ? `${PRIMARY_VIOLET}10` : 'white',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    opacity: isInactive ? 0.45 : disabledByCap ? 0.4 : 1,
                  }}
                >
                  <WizardAvatar avatarUrl={c.avatarUrl} emoji={c.emoji} name={c.name} />
                  <span className="text-sm font-medium" style={{ color: isSel ? PRIMARY_VIOLET : '#374151' }}>
                    {c.name}
                  </span>
                  {isInactive && c.inactiveLabel && (
                    <span className="text-[10px] font-medium text-muted-foreground leading-tight text-center">
                      {c.inactiveLabel}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="text-center mb-4">
            <p className="text-sm font-medium text-foreground">
              {selected.length} / {MAX_TOTAL} personnages
            </p>
            {(() => {
              let capMessage: string | null = null;
              if (totalCapReached) {
                if (petsCapReached && toysCapReached) capMessage = "Nombre maximum de personnages, animaux et doudous atteint";
                else if (petsCapReached) capMessage = "Nombre maximum de personnages et animaux atteint";
                else if (toysCapReached) capMessage = "Nombre maximum de personnages et doudous atteint";
                else capMessage = "Nombre maximum de personnages atteint";
              } else if (petsCapReached && toysCapReached) {
                capMessage = "Nombre maximum d'animaux et de doudous atteint";
              } else if (petsCapReached) {
                capMessage = "Nombre maximum d'animaux atteint";
              } else if (toysCapReached) {
                capMessage = "Nombre maximum de doudous atteint";
              }
              return capMessage ? (
                <p className="text-xs text-muted-foreground mt-1">{capMessage}</p>
              ) : null;
            })()}
          </div>

          <Button
            onClick={() => setStep(2)}
            className="w-full text-white hover:opacity-90"
            style={{ backgroundColor: PRIMARY_VIOLET }}
          >
            Suivant →
          </Button>
        </>
      )}

      {/* Step 3 (custom) — characters */}
      {isCustom && step === 3 && (
        <>
          <button
            type="button"
            onClick={() => setStep(2)}
            className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-full hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Précédent</span>
          </button>
          <h3 className="text-xl font-bold text-foreground text-center mb-1">
            {charactersStepTitle}
          </h3>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Sélectionne les personnages qui apparaîtront dans le livre
          </p>

          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted mb-4 text-sm text-muted-foreground">
            <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span><strong>{childName}</strong> est toujours dans l'histoire</span>
          </div>

          {dedicatedName && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted mb-4 text-sm text-muted-foreground">
              <Cake className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span><strong>{dedicatedName}</strong> est la star de ce livre</span>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 mb-8">
            {characters.filter((c) => !c.locked).map((c) => {
              const isSel = selected.includes(c.id);
              const disabledByCap = !isSel && (totalCapReached || (c.type === 'pet' && petsCapReached) || (c.type === 'comforter' && toysCapReached));
              const isInactive = !!c.inactive;
              const isDisabled = c.locked || disabledByCap || isInactive;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => !isDisabled && toggle(c.id)}
                  disabled={isDisabled}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all"
                  style={{
                    borderColor: isSel ? PRIMARY_VIOLET : '#E5E7EB',
                    backgroundColor: isSel ? `${PRIMARY_VIOLET}10` : 'white',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    opacity: isInactive ? 0.45 : disabledByCap ? 0.4 : 1,
                  }}
                >
                  <WizardAvatar avatarUrl={c.avatarUrl} emoji={c.emoji} name={c.name} />
                  <span className="text-sm font-medium" style={{ color: isSel ? PRIMARY_VIOLET : '#374151' }}>
                    {c.name}
                  </span>
                  {isInactive && c.inactiveLabel && (
                    <span className="text-[10px] font-medium text-muted-foreground leading-tight text-center">
                      {c.inactiveLabel}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="text-center mb-4">
            <p className="text-sm font-medium text-foreground">
              {selected.length} / {MAX_TOTAL} personnages
            </p>
            {(() => {
              let capMessage: string | null = null;
              if (totalCapReached) {
                if (petsCapReached && toysCapReached) capMessage = "Nombre maximum de personnages, animaux et doudous atteint";
                else if (petsCapReached) capMessage = "Nombre maximum de personnages et animaux atteint";
                else if (toysCapReached) capMessage = "Nombre maximum de personnages et doudous atteint";
                else capMessage = "Nombre maximum de personnages atteint";
              } else if (petsCapReached && toysCapReached) {
                capMessage = "Nombre maximum d'animaux et de doudous atteint";
              } else if (petsCapReached) {
                capMessage = "Nombre maximum d'animaux atteint";
              } else if (toysCapReached) {
                capMessage = "Nombre maximum de doudous atteint";
              }
              return capMessage ? (
                <p className="text-xs text-muted-foreground mt-1">{capMessage}</p>
              ) : null;
            })()}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleValidate} disabled={isSaving} className="flex-1">
              Passer
            </Button>
            <Button
              onClick={handleValidate}
              disabled={isSaving}
              className="flex-1 text-white hover:opacity-90"
              style={{ backgroundColor: PRIMARY_VIOLET }}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isSaving ? 'Enregistrement…' : validateLabel}
            </Button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-full hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Précédent</span>
          </button>
          <h3 className="text-xl font-bold text-foreground text-center mb-1">
            Où se passe l'histoire ?
          </h3>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Optionnel : par défaut l'histoire se déroule chez vous
          </p>

          {familyPlaces && familyPlaces.length > 0 && (
            <>
              <p className="text-sm font-semibold text-foreground mb-2">Vos lieux</p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {familyPlaces.map((place) => {
                  const isInactive = (place as any).is_active === false;
                  const isSel = !isInactive && !customDestSelected && selectedLocationId === place.id;
                  return (
                    <button
                      key={place.id}
                      type="button"
                      disabled={isInactive}
                      aria-disabled={isInactive}
                      onClick={() => {
                        if (isInactive) return;
                        setCustomDestSelected(false);
                        setCustomDestText('');
                        setDestError(null);
                        setSelectedLocationId(place.id);
                        setSelectedLocationLabel(place.label);
                      }}
                      className="flex flex-col items-start gap-1 p-3 rounded-xl border-2 transition-all text-left"
                      style={{
                        borderColor: isSel ? PRIMARY_VIOLET : '#E5E7EB',
                        backgroundColor: isSel ? `${PRIMARY_VIOLET}10` : 'white',
                        opacity: isInactive ? 0.45 : 1,
                        cursor: isInactive ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <span
                        className="text-sm font-medium"
                        style={{ color: isSel ? PRIMARY_VIOLET : '#374151' }}
                      >
                        {place.label}
                      </span>
                      {place.city && (
                        <span className="text-xs text-muted-foreground">{place.city}</span>
                      )}
                      {isInactive && (
                        <span className="text-[10px] font-medium text-muted-foreground leading-tight">
                          Nous n'y vivons plus
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <p className="text-sm font-semibold text-foreground mb-2">Ailleurs</p>
          <div className="grid grid-cols-4 gap-2 mb-8">
            {(locationPresets ?? []).map((preset) => {
              const isSel = !customDestSelected && selectedLocationId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setCustomDestSelected(false);
                    setCustomDestText('');
                    setDestError(null);
                    setSelectedLocationId(preset.id);
                    setSelectedLocationLabel(preset.label);
                  }}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all"
                  style={{
                    borderColor: isSel ? PRIMARY_VIOLET : '#E5E7EB',
                    backgroundColor: isSel ? `${PRIMARY_VIOLET}10` : 'white',
                  }}
                >
                  <span className="text-2xl">{preset.details?.emoji || '📍'}</span>
                  <span
                    className="text-[11px] font-medium text-center leading-tight"
                    style={{ color: isSel ? PRIMARY_VIOLET : '#374151' }}
                  >
                    {preset.label}
                  </span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => {
                setCustomDestSelected(true);
                setDestError(null);
                setSelectedLocationId(null);
                setSelectedLocationLabel(null);
              }}
              className="flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all"
              style={{
                borderColor: customDestSelected ? PRIMARY_VIOLET : '#E5E7EB',
                backgroundColor: customDestSelected ? `${PRIMARY_VIOLET}10` : 'white',
              }}
            >
              <span className="text-2xl">📍</span>
              <span
                className="text-[11px] font-medium text-center leading-tight"
                style={{ color: customDestSelected ? PRIMARY_VIOLET : '#374151' }}
              >
                Un lieu précis…
              </span>
            </button>
          </div>

          {customDestSelected && (
            <div className="mb-6 -mt-4">
              <Input
                type="text"
                maxLength={80}
                value={customDestText}
                onChange={(e) => {
                  setCustomDestText(e.target.value);
                  setDestError(null);
                }}
                placeholder='Ex: "Koh Tao", "la jungle amazonienne", "New York"'
                disabled={isPreparingDest}
                className="text-base md:text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Indique une seule ville ou un seul décor, par exemple "Koh Tao", "la jungle amazonienne", "New York"
              </p>
              {destError && (
                <p className="text-xs mt-2" style={{ color: '#DC2626' }}>
                  {destError}
                </p>
              )}
              {isPreparingDest && (
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Préparation de la destination…</span>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setCustomDestSelected(false);
                setCustomDestText('');
                setDestError(null);
                setSelectedLocationId(null);
                setSelectedLocationLabel(null);
                setStep(3);
              }}
              disabled={isPreparingDest}
              className="flex-1"
            >
              Passer
            </Button>
            <Button
              onClick={async () => {
                if (!customDestSelected) {
                  setStep(3);
                  return;
                }
                const text = customDestText.trim();
                if (!text) {
                  setDestError('Veuillez indiquer un lieu.');
                  return;
                }
                // If the text matches the already-saved custom destination,
                // skip creating a new place row and just proceed.
                if (
                  savedLocationId &&
                  selectedLocationId === savedLocationId &&
                  text === (savedLocationLabel ?? '').trim()
                ) {
                  setStep(3);
                  return;
                }
                if (!childId) {
                  setDestError('Impossible de préparer cette destination pour le moment, réessaie');
                  return;
                }
                setIsPreparingDest(true);
                setDestError(null);
                let createdPlaceId: string | null = null;
                try {
                  // Resolve family_id + user
                  const { data: authData } = await supabase.auth.getUser();
                  const uid = authData?.user?.id;
                  if (!uid) throw new Error('not_auth');
                  const { data: profile } = await supabase
                    .from('user_profiles')
                    .select('family_id')
                    .eq('id', uid)
                    .maybeSingle();
                  let familyId = profile?.family_id as string | null | undefined;
                  if (!familyId) {
                    const { data: cp } = await supabase
                      .from('child_profiles')
                      .select('family_id')
                      .eq('id', childId)
                      .maybeSingle();
                    familyId = cp?.family_id ?? null;
                  }
                  if (!familyId) throw new Error('no_family');

                  // 1) Insert place row
                  const { data: placeRow, error: placeErr } = await supabase
                    .from('places')
                    .insert({
                      family_id: familyId,
                      label: text,
                      type: 'destination_libre',
                      is_preset: false,
                      is_active: true,
                      details: {},
                      created_by: uid,
                    })
                    .select('id')
                    .single();
                  if (placeErr || !placeRow) throw placeErr || new Error('insert_failed');
                  createdPlaceId = placeRow.id;

                  // 2) Poll for destination_status (every 800ms up to 12s)
                  const deadline = Date.now() + 12000;
                  let status: string | null = null;
                  let reason: string | null = null;
                  while (Date.now() < deadline) {
                    await new Promise((r) => setTimeout(r, 800));
                    const { data: row } = await supabase
                      .from('places')
                      .select('details')
                      .eq('id', createdPlaceId)
                      .maybeSingle();
                    const det: any = row?.details ?? {};
                    if (det && det.destination_status) {
                      status = det.destination_status;
                      reason = det.destination_reason ?? null;
                      break;
                    }
                  }

                  if (status === 'ok') {
                    // 3) Insert child_places
                    await supabase
                      .from('child_places')
                      .insert({ child_id: childId, place_id: createdPlaceId });
                    // Update book_request
                    if (bookRequestId) {
                      await supabase
                        .from('book_requests')
                        .update({
                          selected_location_id: createdPlaceId,
                          selected_location_label: text,
                        })
                        .eq('id', bookRequestId);
                    }
                    setSelectedLocationId(createdPlaceId);
                    setSelectedLocationLabel(text);
                    setIsPreparingDest(false);
                    setStep(3);
                    return;
                  }

                  if (status === 'rejected') {
                    // 4) Delete the place row
                    await supabase.from('places').delete().eq('id', createdPlaceId);
                    setDestError(reason || 'Destination non acceptée.');
                    setIsPreparingDest(false);
                    return;
                  }

                  // 5) Timeout
                  await supabase.from('places').delete().eq('id', createdPlaceId);
                  setDestError('Impossible de préparer cette destination pour le moment, réessaie');
                  setIsPreparingDest(false);
                } catch (e) {
                  if (createdPlaceId) {
                    await supabase.from('places').delete().eq('id', createdPlaceId);
                  }
                  setDestError('Impossible de préparer cette destination pour le moment, réessaie');
                  setIsPreparingDest(false);
                }
              }}
              disabled={isPreparingDest || (customDestSelected && !customDestText.trim())}
              className="flex-1 text-white hover:opacity-90"
              style={{ backgroundColor: PRIMARY_VIOLET }}
            >
              {isPreparingDest ? 'Préparation…' : 'Suivant →'}
            </Button>
          </div>
        </>
      )}

      {!isCustom && step === 3 && (
        <>
          <button
            type="button"
            onClick={() => setStep(2)}
            className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-full hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Précédent</span>
          </button>
          <h3 className="text-xl font-bold text-foreground text-center mb-1">
            Votre touche secrète
          </h3>
          <p className="text-sm text-muted-foreground text-center mb-2">
            Un détail qui rendra cette histoire unique pour {childName} <span className="text-muted-foreground">(optionnel)</span>
          </p>
          <p className="text-sm text-center italic text-muted-foreground mb-6">
            Pour le livre : « {bookTitle} »
          </p>

          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={`Ex : ${childName} adore les montres en ce moment…`}
            className="min-h-32 mb-6 text-base md:text-sm"
          />

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleValidate}
              disabled={isSaving}
              className="flex-1"
            >
              Passer
            </Button>
            <Button
              onClick={handleValidate}
              disabled={isSaving}
              className="flex-1 text-white hover:opacity-90"
              style={{ backgroundColor: PRIMARY_VIOLET }}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isSaving ? 'Enregistrement…' : validateLabel}
            </Button>
          </div>
        </>
      )}
    </div>
  );

  // Sur mobile : panneau plein écran partagé (voir MobileFullScreenSheet). Desktop : Dialog inchangé.
  if (isMobile) {
    return (
      <MobileFullScreenSheet open={open} onClose={() => handleClose(false)} closeDisabled={isSaving}>
        {Content}
      </MobileFullScreenSheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-white max-w-md p-0 max-h-[90vh] overflow-y-auto">
        {Content}
      </DialogContent>
    </Dialog>
  );
};

// ---------- Focus view ----------

interface FocusViewProps {
  month: MockMonth;
  childName: string;
  onBack: () => void;
  onConfigure: () => void;
  onChooseTheme: () => void;
}

const FocusView: React.FC<FocusViewProps> = ({ month, childName, onBack, onConfigure, onChooseTheme }) => {
  const [noteExpanded, setNoteExpanded] = useState(false);
  const isConfigured = month.status === 'configured' || month.status === 'in_creation'
    || month.status === 'in_printing' || month.status === 'shipped' || month.status === 'delivered';
  const isLocked = month.status === 'in_creation' || month.status === 'in_printing'
    || month.status === 'shipped' || month.status === 'delivered';
  const AUTO_MESSAGE = 'Livre généré automatiquement depuis le dashboard admin';
  const hasCharacters = !!(month.configuredCharacters && month.configuredCharacters.length > 0);
  const noteText = (month.savedNote ?? '').trim();
  const hasNote = noteText.length > 0 && noteText !== AUTO_MESSAGE;
  const locationLabel = (month.savedLocationLabel ?? '').trim();
  const hasLocation = locationLabel.length > 0 || !!month.savedLocationId;
  const showConfig = hasCharacters || hasNote || hasLocation;
  const isPreparing = !!month.isPreparing;
  const statusCfg = STATUS_CONFIG[month.status];
  const StatusIcon = statusCfg.Icon;

  return (
    <div className="space-y-4 animate-fade-in">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </button>

      <Card className="border-2 border-border overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Colonne gauche — infos livre */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                {/* v3.5 — monthLabel donne déjà le mois : on n'annonce que la fenêtre */}
                {month.monthLabel} · Livraison en début de mois
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                {month.bookTitle}
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed mb-4">
                {month.bookSummary}
              </p>
              {month.deadline && !isConfigured && (
                <div className="flex items-center gap-2 text-sm text-orange-600 mt-2">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  <span>Ajoutez votre touche avant le {month.deadline} (optionnel)</span>
                </div>
              )}
            </div>

            {/* Séparateur vertical desktop */}
            <div className="hidden lg:block w-px bg-border flex-shrink-0" />

            {/* Colonne droite — configuration */}
            <div className="lg:w-72 flex-shrink-0 space-y-4">
              {/* D1 : idem — pas de badge « Bientôt disponible » pour to_plan. */}
              {month.status !== 'to_plan' && (
                <div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border inline-flex items-center gap-1 ${statusCfg.badgeClass}`}>
                    {StatusIcon && <StatusIcon className="h-3 w-3" />}
                    {statusCfg.label}
                  </span>
                </div>
              )}
              {!isConfigured && !isLocked && (
              <p className="text-sm italic text-muted-foreground">
                  Votre histoire est déjà personnalisée, ce détail la rendra unique.
                </p>
              )}

              {isConfigured && showConfig && (
                <div className="space-y-3 p-4 rounded-xl bg-muted/50 border border-border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Votre configuration
                  </p>
                  {month.dedicatedPersonName && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '12px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      backgroundColor: '#F3F0FF'
                    }}>
                      <Cake style={{ width: 20, height: 20, color: '#534AB7', flexShrink: 0 }} />
                      <div>
                        <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>
                          Livre dédié à
                        </p>
                        <p style={{ fontSize: '14px', fontWeight: 700, color: '#534AB7', margin: 0 }}>
                          {month.dedicatedPersonName}
                        </p>
                      </div>
                    </div>
                  )}
                  {hasCharacters && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Personnages</p>
                      <p className="text-sm font-medium text-foreground">
                        {[...month.configuredCharacters!]
                          .sort((a, b) =>
                            a === month.dedicatedPersonName ? -1 :
                            b === month.dedicatedPersonName ? 1 : 0
                          )
                          .join(', ')}
                      </p>
                    </div>
                  )}
                  {hasNote && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Votre note</p>
                      <p className="text-sm text-foreground italic">
                        "{noteExpanded || noteText.length <= 80
                          ? noteText
                          : noteText.slice(0, 80) + '…'}"
                      </p>
                      {noteText.length > 80 && (
                        <button
                          type="button"
                          onClick={() => setNoteExpanded(!noteExpanded)}
                          className="text-xs mt-1 underline-offset-2 underline text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {noteExpanded ? 'Réduire' : 'Voir tout'}
                        </button>
                      )}
                    </div>
                  )}
                  {hasLocation && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Lieu</p>
                      <p className="text-sm text-foreground inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                        {locationLabel || 'Lieu sélectionné'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {isPreparing ? (
                <p className="text-sm text-muted-foreground italic">
                  Votre livre est en cours de préparation
                </p>
              ) : !isLocked && (
                <>
                  <Button
                    onClick={onConfigure}
                    className="w-full text-white hover:opacity-90 h-11 text-sm font-semibold"
                    style={{ backgroundColor: PRIMARY_VIOLET }}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {isConfigured ? 'Ajuster votre touche' : 'Ajouter votre touche'}
                  </Button>
                  <button
                    type="button"
                    onClick={onChooseTheme}
                    className="block w-full text-center text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
                  >
                    Choisir un autre thème pour ce mois
                  </button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ---------- Month list row ----------

interface MonthRowProps {
  month: MockMonth;
  onClick: () => void;
  onConfigure: (e: React.MouseEvent) => void;
  alternatives?: NonNullable<MockMonth['alternatives']>;
  onAlternativeClick?: (
    bookRequestId: string,
    alternativeType: 'birthday' | 'milestone' | 'custom',
    substituteIndex?: number,
  ) => void;
}

const MonthRow: React.FC<MonthRowProps> = ({ month, onClick, onConfigure, alternatives, onAlternativeClick }) => {
  const cfg = STATUS_CONFIG[month.status];
  const StatusIcon = cfg.Icon;
  const showConfigureButton = month.status === 'to_personalize' || month.status === 'to_plan';
  const alts = alternatives ?? month.alternatives ?? [];
  const showAlternatives = alts.length > 0;

  return (
    <Card
      onClick={onClick}
      className={`${cfg.borderClass} cursor-pointer hover:shadow-md transition-all bg-white`}
    >
      <CardContent className="p-4 sm:p-5">
        {/* Top row */}
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <span className="font-bold text-foreground text-base sm:text-lg whitespace-nowrap">
              {month.monthLabel}
            </span>
            {/* D1 : pas de badge pour to_plan — « Bientôt disponible » n'apportait aucune info
                (la ligne « Ajoutez votre touche avant le … · Livraison … » juste en dessous le dit
                déjà) et, en whitespace-nowrap à côté du mois + du bouton, il débordait sur iPhone.
                Un badge uniquement quand il y a quelque chose à dire. */}
            {month.status !== 'to_plan' && (
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full border inline-flex items-center gap-1 ${cfg.badgeClass} whitespace-nowrap`}>
                {StatusIcon && <StatusIcon className="h-3 w-3" />}
                {cfg.label}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`hidden sm:block text-sm truncate max-w-[180px] md:max-w-[260px] ${month.bookTitle === PLACEHOLDER_TITLE ? 'italic text-muted-foreground/70' : 'text-muted-foreground'}`}>
              {month.bookTitle}
            </span>
            {showConfigureButton ? (
              <Button
                size="sm"
                onClick={onConfigure}
                className="text-white hover:opacity-90"
                style={{ backgroundColor: PRIMARY_VIOLET }}
              >
                Ajouter votre touche
              </Button>
            ) : (
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Mobile-only book title line */}
        <p className={`sm:hidden text-sm truncate mb-1 ${month.bookTitle === PLACEHOLDER_TITLE ? 'italic text-muted-foreground/70' : 'text-muted-foreground'}`}>
          {month.bookTitle}
        </p>

        {/* Secondary info line */}
        <div className={`flex items-center gap-1.5 text-xs sm:text-sm ${cfg.secondaryClass}`}>
          {month.status === 'to_personalize' && (
            <>
              <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
              <span>
                {month.daysLeft === 0
                  ? 'Dernière chance d\'ajouter votre touche !'
                  : month.daysLeft !== undefined
                    ? `Ajoutez votre touche avant le ${month.deadline} (optionnel) · encore ${month.daysLeft} jour${month.daysLeft > 1 ? 's' : ''} pour ajouter votre touche`
                    : `Ajoutez votre touche avant le ${month.deadline} (optionnel)`}
              </span>
            </>
          )}
          {/* v3.5 — « prévue LE début septembre » n'est pas français */}
          {month.status === 'configured' && (
            <span>Livre configuré · Livraison prévue {month.deliveryShort}</span>
          )}
          {month.status === 'in_creation' && <span>Livre en cours de génération</span>}
          {month.status === 'in_printing' && <span>Livraison prévue {month.deliveryShort}</span>}
          {month.status === 'shipped' && <span>Votre livre est en route</span>}
          {month.status === 'delivered' && <span>Votre livre est arrivé</span>}
          {month.status === 'to_plan' && (
            <>
              <Calendar className="h-3.5 w-3.5" />
              <span>{month.deadline ? `Ajoutez votre touche avant le ${month.deadline} (optionnel) · Livraison ${month.deliveryShort}` : `Livraison prévue ${month.deliveryShort}`}</span>
            </>
          )}
        </div>

        {(() => {
          const isConfiguredOrLater = ['configured', 'in_creation', 'in_printing', 'shipped', 'delivered'].includes(month.status);
          const hasChars = !!(month.configuredCharacters && month.configuredCharacters.length > 0);
          const AUTO_MESSAGE = 'Livre généré automatiquement depuis le dashboard admin';
          const note = (month.savedNote ?? '').trim();
          const showNote = note.length > 0 && note !== AUTO_MESSAGE;
          const showLoc = !!month.savedLocationId || !!(month.savedLocationLabel ?? '').trim();
          if (!isConfiguredOrLater || (!hasChars && !showLoc && !showNote)) return null;
          return (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {hasChars && month.configuredCharacters!.map((name, i) => (
                <span
                  key={`${name}-${i}`}
                  className="text-xs px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground border border-muted-foreground/20"
                >
                  {name}
                </span>
              ))}
              {showLoc && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground border border-muted-foreground/20 inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {month.savedLocationLabel || 'Lieu'}
                </span>
              )}
              {showNote && (
                <span className="text-xs text-muted-foreground italic truncate max-w-full">
                  « {note} »
                </span>
              )}
            </div>
          );
        })()}

        {showAlternatives && (
          <div className="mt-3 flex flex-wrap gap-2">
            {alts.map((alt, i) => {
              const AltIcon = alt.type === 'birthday' ? PartyPopper : alt.type === 'milestone' ? Sparkles : BookOpen;
              return (
                <button
                  key={`${alt.type}-${i}`}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!onAlternativeClick || !month.bookRequestId) return;
                    onAlternativeClick(
                      month.bookRequestId,
                      alt.type,
                      alt.type === 'custom' ? undefined : alt.substituteIndex,
                    );
                  }}
                  className="text-xs px-2.5 py-1 rounded-full border font-medium transition-opacity whitespace-nowrap inline-flex items-center gap-1 hover:opacity-80"
                  style={{ backgroundColor: `${PRIMARY_VIOLET}1A`, borderColor: `${PRIMARY_VIOLET}59`, color: PRIMARY_VIOLET }}
                >
                  <AltIcon className="h-3 w-3" />
                  {alt.label}
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ---------- Main component ----------

// ---------- Theme selection sheet ----------

interface ThemeSelectionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  month: MockMonth | null;
  childName: string;
  onChoose: (flow: FlowType, selectedThemeId?: string) => void;
  currentSelectedThemeId?: string;
  currentDedicatedName?: string;
}

const OptionCard: React.FC<{
  value: FlowType;
  icon: React.ReactNode;
  label: string;
  badge?: string;
  title?: string;
  description?: string;
  selected: FlowType;
  onSelect: (value: FlowType) => void;
}> = ({ value, icon, label, badge, title, description, selected, onSelect }) => {
  const isSel = selected === value;
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className="w-full text-left p-4 rounded-xl border-2 transition-all"
      style={{
        borderColor: isSel ? PRIMARY_VIOLET : '#E5E7EB',
        backgroundColor: isSel ? `${PRIMARY_VIOLET}0D` : 'white',
      }}
    >
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-semibold text-foreground">{label}</span>
            {badge && (
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${PRIMARY_VIOLET}1A`, color: PRIMARY_VIOLET }}
              >
                {badge}
              </span>
            )}
          </div>
          {title && <p className="text-sm font-bold text-foreground mb-0.5">{title}</p>}
          {description && (
            <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
          )}
        </div>
      </div>
    </button>
  );
};

// ---------- Archived books section ----------

interface ArchivedBook {
  id: string;
  delivery_month: string;
  title: string | null;
  book_title: string | null;
  selected_theme_type: string | null;
  selected_characters: any;
  message: string | null;
  original_theme_instructions: string | null;
  selected_location_label: string | null;
  selected_location_id: string | null;
  story_themes: { titre: string | null } | null;
}

const ArchivedBooksSection: React.FC<{ books: ArchivedBook[]; childFirstName: string }> = ({ books, childFirstName }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-8">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-border bg-white hover:bg-muted/30 transition-all"
      >
        <span className="font-semibold text-foreground inline-flex items-center gap-2">
          <Library className="h-4 w-4" />
          Livres précédents ({books.length})
        </span>
        <ChevronDown
          className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="space-y-3 mt-3 animate-fade-in">
          {books.map((book) => {
            const AUTO_MESSAGE = 'Livre généré automatiquement depuis le dashboard admin';
            const deliveryDate = parseISO(book.delivery_month);
            const monthLabel = format(deliveryDate, 'LLLL yyyy', { locale: fr }).replace(/^./, (c) => c.toUpperCase());
            const otherNames: string[] = Array.isArray(book.selected_characters)
              ? (book.selected_characters as any[])
                  .map((c: any) => c?.name)
                  .filter((n: any) => typeof n === 'string' && n && n !== childFirstName)
              : [];
            const rawThemeTitle = book.story_themes?.titre ?? null;
            const displayTitle =
              book.book_title ??
              (rawThemeTitle ? rawThemeTitle.replace(/\[Prénom\]/g, childFirstName) : null);
            let noteText: string | null = null;
            if (book.selected_theme_type !== 'original' && book.message && book.message.trim() && book.message.trim() !== AUTO_MESSAGE) {
              const t = book.message.trim();
              noteText = `"${t.slice(0, 40)}${t.length > 40 ? '…' : ''}"`;
            }
            const showLoc = !!book.selected_location_id || !!(book.selected_location_label ?? '').trim();
            return (
              <Card key={book.id} className="border border-border bg-white">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm font-medium text-foreground">{monthLabel}</span>
                    <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-700 border-emerald-200">
                      <Check className="h-3 w-3" />
                      Livré
                    </span>
                    {displayTitle && (
                      <span className="text-sm text-muted-foreground ml-auto truncate">
                        {displayTitle}
                      </span>
                    )}
                  </div>
                  {(otherNames.length > 0 || showLoc || noteText) && (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {otherNames.map((name, i) => (
                        <span
                          key={`${name}-${i}`}
                          className="text-xs px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground border border-muted-foreground/20"
                        >
                          {name}
                        </span>
                      ))}
                      {showLoc && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground border border-muted-foreground/20 inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {book.selected_location_label || 'Lieu'}
                        </span>
                      )}
                      {noteText && (
                        <span className="text-xs text-muted-foreground italic truncate max-w-full">
                          {noteText}
                        </span>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

const ThemeSelectionSheet: React.FC<ThemeSelectionSheetProps> = ({ open, onOpenChange, month, childName, onChoose, currentSelectedThemeId, currentDedicatedName }) => {
  const isMobile = useIsMobile();
  const [selected, setSelected] = useState<FlowType>('monthly');

  React.useEffect(() => {
    if (open && month) {
      // Pre-select special option if currently configured with a substitute theme
      if (month.status === 'configured' && currentSelectedThemeId) {
        const matchIdx = (month.substituteOptions || []).findIndex(
          (opt) => opt.substituteThemeId === currentSelectedThemeId
        );
        if (matchIdx >= 0) {
          setSelected(`special_${matchIdx}` as FlowType);
          return;
        }
      }
      setSelected('monthly');
    }
  }, [open, month, currentSelectedThemeId]);

  if (!month) return null;

  const handleClose = (o: boolean) => onOpenChange(o);

  const handleContinue = () => {
    let substituteThemeId: string | undefined;
    if (typeof selected === 'string' && selected.startsWith('special_')) {
      const idx = parseInt(selected.split('_')[1], 10);
      substituteThemeId = month?.substituteOptions?.[idx]?.substituteThemeId;
    }
    onChoose(selected, substituteThemeId);
  };


  const Content = (
    <div className="px-5 pb-6 pt-2 sm:px-8 sm:pt-6 relative">
      <h3 className="text-xl font-bold text-foreground text-center mb-1 mt-2">
        Choisir le thème de ce livre
      </h3>
      <p className="text-sm text-muted-foreground text-center mb-6">
        Ce choix remplacera le livre prévu pour ce mois
      </p>

      <div className="space-y-3 mb-6 max-h-[60vh] overflow-y-auto">
        <OptionCard
          value="monthly"
          icon={<BookOpen className="h-6 w-6" style={{ color: PRIMARY_VIOLET }} />}
          label="Livre du mois"
          badge="Recommandé par MCF"
          title={month.standardTitle ?? month.bookTitle}
          description={month.standardSummary ?? month.bookSummary}
          selected={selected}
          onSelect={setSelected}
        />

        {(month.substituteOptions || []).map((opt, idx) => {
          const isBirthday =
            typeof opt.substituteCondition === 'string' &&
            opt.substituteCondition.startsWith('birthday_');
          // v2.4 : substitutePersonName est légitimement null hors thèmes birthday_*
          const personName =
            typeof opt.substitutePersonName === 'string' && opt.substitutePersonName.trim()
              ? opt.substitutePersonName.trim()
              : null;
          const themeTitle = formatTitle(opt.substituteThemeTitre ?? null, childName, personName);
          // v2.8 : idem buildAlternativeLabel — « Anniversaire de X » uniquement pour
          // les conditions birthday_*. substitute_pet et substitute_sibling portent eux
          // aussi un substitute_person_name sans être des anniversaires.
          // v3.0 : élision. « Anniversaire de Emma » -> « Anniversaire d'Emma ».
          // Ce template est écrit en dur, sans jeton : injectName ne pouvait pas
          // l'atteindre. On passe donc par withDe directement.
          const title =
            isBirthday && personName ? `Anniversaire ${withDe(personName)}` : themeTitle;
          // v2.5 : résumé du thème pour toutes les options spéciales (parité avec
          // « Livre du mois »). Repli sur l'ancienne phrase si le RPC v2 n'est pas déployé.
          const description =
            opt.substituteThemeResume ||
            (isBirthday && personName
              ? `Ce mois-ci, ${personName} fête son anniversaire, on lui dédie ce livre !`
              : undefined);
          return (
            <OptionCard
              key={idx}
              value={`special_${idx}` as FlowType}
              icon={<PartyPopper className="h-6 w-6" style={{ color: PRIMARY_VIOLET }} />}
              label="Option spéciale MCF"
              badge={currentDedicatedName && personName === currentDedicatedName ? 'Choix actuel' : undefined}
              title={title}
              description={description}
              selected={selected}
              onSelect={setSelected}
            />
          );
        })}

        <OptionCard
          value="custom"
          icon={<Sparkles className="h-6 w-6" style={{ color: PRIMARY_VIOLET }} />}
          label="Histoire inédite"
          description={`Vous imaginez, nous créons. Décrivez l'histoire de vos rêves pour ${childName}.`}
          selected={selected}
          onSelect={setSelected}
        />
      </div>

      <Button
        onClick={handleContinue}
        className="w-full text-white hover:opacity-90"
        style={{ backgroundColor: PRIMARY_VIOLET }}
      >
        Continuer avec ce choix →
      </Button>

      <button
        type="button"
        onClick={() => handleClose(false)}
        className="block mx-auto mt-3 text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
      >
        Annuler
      </button>
    </div>
  );

  if (isMobile) {
    return (
      <MobileFullScreenSheet open={open} onClose={() => handleClose(false)}>
        {Content}
      </MobileFullScreenSheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-white max-w-md p-0 max-h-[90vh] overflow-y-auto">{Content}</DialogContent>
    </Dialog>
  );
};

// ---------- Main component ----------

const MyStoriesTab: React.FC<MyStoriesTabProps> = () => {
  // 1. Real children from Supabase (via shared hook)
  const { data: familyChildren, isLoading: isLoadingChildren } = useFamilyData();
  const rawList: FamilyChild[] = familyChildren ?? [];
  const navigate = useNavigate();

  // Fetch timelines for all children in parallel to compute ordering
  const timelineQueries = useQueries({
    queries: rawList.map((c) => ({
      queryKey: ['book-timeline', c.id],
      queryFn: async () => {
        const { data, error } = await supabase.rpc('get_child_book_timeline', { p_child_id: c.id });
        if (error) throw error;
        return (data ?? []) as unknown as BookTimelineRow[];
      },
      staleTime: 1000 * 60 * 5,
    })),
  });

  const timelinesByChild = useMemo(() => {
    const map: Record<string, BookTimelineRow[]> = {};
    rawList.forEach((c, i) => {
      map[c.id] = (timelineQueries[i]?.data as BookTimelineRow[] | undefined) ?? [];
    });
    return map;
  }, [rawList, timelineQueries]);

  const list: FamilyChild[] = useMemo(() => {
    const sorted = [...rawList].sort((a, b) => {
      const tA = timelinesByChild[a.id] ?? [];
      const tB = timelinesByChild[b.id] ?? [];
      const hasActiveA = tA.length > 0;
      const hasActiveB = tB.length > 0;
      if (hasActiveA && !hasActiveB) return -1;
      if (!hasActiveA && hasActiveB) return 1;

      const now = new Date();
      const isUrgent = (rows: BookTimelineRow[]) =>
        rows.some((m) => {
          if (m.status !== 'pending_choice' || !m.personalization_deadline) return false;
          const days = differenceInCalendarDays(parseISO(m.personalization_deadline), now);
          return days <= 14;
        });
      const urgentA = isUrgent(tA);
      const urgentB = isUrgent(tB);
      if (urgentA && !urgentB) return -1;
      if (!urgentA && urgentB) return 1;

      // Younger first → most recent birth date first
      const dA = a.birthDate ? new Date(a.birthDate).getTime() : 0;
      const dB = b.birthDate ? new Date(b.birthDate).getTime() : 0;
      return dB - dA;
    });
    return sorted;
  }, [rawList, timelinesByChild]);

  const [activeChildId, setActiveChildId] = useState<string | null>(null);

  // Auto-select first child once loaded
  React.useEffect(() => {
    if (!activeChildId && list.length > 0) {
      setActiveChildId(list[0].id);
    }
  }, [list, activeChildId]);

  const activeChild = useMemo(
    () => list.find((c) => c.id === activeChildId) ?? list[0] ?? null,
    [list, activeChildId]
  );

  // 2. Real timeline from RPC
  const { data: timelineRows, isLoading: isLoadingTimeline, isError: isTimelineError } =
    useBookTimeline(activeChildId);

  // 2b. Archived books
  const { data: archivedBooks } = useQuery({
    queryKey: ['archived-books', activeChildId],
    queryFn: async () => {
      if (!activeChildId) return [] as ArchivedBook[];
      const { data, error } = await supabase
        .from('book_requests')
        .select('id, delivery_month, title, book_title, selected_theme_type, selected_characters, message, original_theme_instructions, selected_location_label, selected_location_id, story_themes:selected_theme_id (titre)')
        .eq('child_id', activeChildId)
        .not('archived_at', 'is', null)
        .order('delivery_month', { ascending: false });
      if (error) throw error;
      return (data ?? []) as ArchivedBook[];
    },
    enabled: !!activeChildId,
    staleTime: 1000 * 60 * 5,
  });

  const months: MockMonth[] = useMemo(
    () => (timelineRows ?? []).map((r, i) => mapTimelineRow(r, i, activeChild?.firstName ?? '', activeChild?.id ?? '', activeChild?.gender)),
    [timelineRows, activeChild?.firstName, activeChild?.gender]
  );

  // Proactive suggestions derived from timelineRows
  type Suggestion =
    | {
        type: 'birthday';
        personName: string;
        substituteThemeId: string;
        substituteThemeTitre: string;
        bookRequestId: string;
        substituteIndex: number;
      }
    | {
        type: 'milestone';
        substituteThemeId: string;
        substituteThemeTitre: string;
        bookRequestId: string;
        substituteIndex: number;
      }
    | { type: 'custom'; bookRequestId: string };

  const suggestions: Suggestion[] = useMemo(() => {
    const rows = timelineRows ?? [];
    const out: Suggestion[] = [];

    // Birthdays: only the closest upcoming month that has any birthday_ option
    for (const row of rows) {
      const opts = row.substitute_options || [];
      const birthdays = opts
        .map((o, idx) => ({ o, idx }))
        .filter(({ o }) => typeof o.substitute_condition === 'string' && o.substitute_condition.startsWith('birthday_'));
      if (birthdays.length > 0) {
        for (const { o, idx } of birthdays) {
          out.push({
            type: 'birthday',
            personName: o.substitute_person_name,
            substituteThemeId: o.substitute_theme_id,
            substituteThemeTitre: o.substitute_theme_titre,
            bookRequestId: row.book_request_id,
            substituteIndex: idx,
          });
        }
        break;
      }
    }

    // Milestones: across all rows
    for (const row of rows) {
      const opts = row.substitute_options || [];
      opts.forEach((o, idx) => {
        if (typeof o.substitute_condition === 'string' && o.substitute_condition.startsWith('milestone_')) {
          out.push({
            type: 'milestone',
            substituteThemeId: o.substitute_theme_id,
            substituteThemeTitre: o.substitute_theme_titre,
            bookRequestId: row.book_request_id,
            substituteIndex: idx,
          });
        }
      });
    }

    // Custom story: first row that allows it
    const customRow = rows.find((r) => r.show_custom_story === true);
    if (customRow) {
      out.push({ type: 'custom', bookRequestId: customRow.book_request_id });
    }

    return out;
  }, [timelineRows]);

  const monthIndexByBookRequestId = useMemo(() => {
    const map = new Map<string, number>();
    months.forEach((m) => {
      if (m.bookRequestId) map.set(m.bookRequestId, m.monthIndex);
    });
    return map;
  }, [months]);

  const alternativesByBookRequestId = useMemo(() => {
    const map = new Map<string, NonNullable<MockMonth['alternatives']>>();
    const childName = activeChild?.firstName ?? '';
    (timelineRows ?? []).forEach((row) => {
      const alts: NonNullable<MockMonth['alternatives']> = [];
      (row.substitute_options || []).forEach((o: any, idx: number) => {
        const cond = typeof o?.substitute_condition === 'string' ? o.substitute_condition : '';
        if (!cond) return;
        const label = buildAlternativeLabel(o, childName);
        if (!label) return;
        const altType: 'birthday' | 'milestone' = cond.startsWith('birthday_')
          ? 'birthday'
          : 'milestone';
        alts.push({
          type: altType,
          label,
          substituteIndex: idx,
          substituteThemeId: o.substitute_theme_id,
        });
      });
      if (row.show_custom_story) {
        alts.push({ type: 'custom', label: 'Histoire inédite' });
      }
      if (row.book_request_id) map.set(row.book_request_id, alts);
    });
    console.log('[MyStoriesTab] alternativesByBookRequestId', Array.from(map.entries()));
    return map;
  }, [timelineRows, activeChild?.firstName]);

  const handleSuggestionClick = (s: Suggestion) => {
    const monthIndex = monthIndexByBookRequestId.get(s.bookRequestId);
    if (monthIndex === undefined) return;
    setFocusedMonthIndex(monthIndex);
    if (s.type === 'custom') {
      setActiveFlow('custom');
      setActiveSubstituteThemeId(undefined);
      setWizardOpen(true);
    } else {
      setActiveFlow(`special_${s.substituteIndex}` as FlowType);
      setActiveSubstituteThemeId(s.substituteThemeId);
      setThemeSheetOpen(true);
    }
  };

  const handleAlternativeClick = (
    bookRequestId: string,
    alternativeType: 'birthday' | 'milestone' | 'custom',
    substituteIndex?: number,
  ) => {
    const monthIndex = monthIndexByBookRequestId.get(bookRequestId);
    if (monthIndex === undefined) return;
    setFocusedMonthIndex(monthIndex);
    if (alternativeType === 'custom') {
      setActiveFlow('custom');
      setActiveSubstituteThemeId(undefined);
      setWizardOpen(true);
      return;
    }
    if (substituteIndex === undefined) return;
    const target = months.find((m) => m.monthIndex === monthIndex);
    const opt = target?.substituteOptions?.[substituteIndex];
    setActiveFlow(`special_${substituteIndex}` as FlowType);
    setActiveSubstituteThemeId(opt?.substituteThemeId);
    setThemeSheetOpen(true);
  };

  const totalPlanned = months.length;
  // v3.4 — compter les statuts AFFICHÉS et non ceux en base : depuis la v3.2,
  // un mois dont la deadline est passée s'affiche « configuré » alors qu'il
  // vaut encore `pending_choice` en base. `months` porte le statut calculé,
  // celui-là même qui alimente les badges.
  const configuredCount = months.filter((m) => m.status === 'configured').length;

  const { data: activeSubscription } = useQuery({
    queryKey: ['subscription', activeChildId],
    queryFn: async () => {
      if (!activeChildId) return null;
      const { data } = await supabase
        .from('subscriptions')
        .select('cancel_at, end_date, status')
        .eq('child_id', activeChildId)
        .eq('is_active', true)
        .maybeSingle();
      return data;
    },
    enabled: !!activeChildId,
  });

  const [focusedMonthIndex, setFocusedMonthIndex] = useState<number | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [themeSheetOpen, setThemeSheetOpen] = useState(false);
  const [activeFlow, setActiveFlow] = useState<FlowType>('monthly');
  const [activeSubstituteThemeId, setActiveSubstituteThemeId] = useState<string | undefined>(undefined);
  const [autoSelectedMemberId, setAutoSelectedMemberId] = useState<string | undefined>(undefined);

  const focusedMonth =
    focusedMonthIndex !== null
      ? months.find((m) => m.monthIndex === focusedMonthIndex) ?? null
      : null;

  // 3. Save mutation
  const { mutate: saveChoice, isPending: isSaving } = useSaveBookChoice(activeChildId);

  // Family places for the wizard location step
  const { data: familyPlaces } = useQuery({
    queryKey: ['family-places', activeChild?.id],
    queryFn: async () => {
      if (!activeChild?.id) return [];
      const { data } = await supabase
        .from('child_places')
        .select('places(id, label, type, city, is_active)')
        .eq('child_id', activeChild.id);
      return (data ?? [])
        .map((r: any) => r.places)
        .filter((p: any) => p && p.type !== 'destination_libre')
        .sort((a: any, b: any) => (a?.is_active === false ? 1 : 0) - (b?.is_active === false ? 1 : 0));
    },
    enabled: !!activeChild?.id,
  });

  // Location presets for the wizard "Ailleurs" step
  const { data: locationPresets } = useQuery({
    queryKey: ['location-presets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('places')
        .select('id, label, details')
        .eq('is_preset', true)
        .order('label', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 1000 * 60 * 60,
  });

  // 4. Build characters list from real family data
  const wizardCharacters: WizardCharacter[] = useMemo(() => {
    if (!activeChild) return [];
    const child: WizardCharacter = {
      type: 'child',
      id: activeChild.id,
      name: activeChild.firstName,
      emoji: '🧒',
      locked: true,
    };
    const estrangedIds = new Set<string>(((activeChild as any).estrangedRelativeIds ?? []));
    const members: WizardCharacter[] = (activeChild.relatives ?? []).map((m: any) => {
      const role = (m.type ?? '').toLowerCase();
      const emoji =
        role.includes('maman') || role === 'mere' || role === 'mère'
          ? '👩'
          : role.includes('papa') || role === 'pere' || role === 'père'
          ? '👨'
          : role.includes('mamie') || role.includes('grand-mère') || role.includes('grand-mere')
          ? '👵'
          : role.includes('papi') || role.includes('grand-père') || role.includes('grand-pere')
          ? '👴'
          : role.includes('frère') || role.includes('frere')
          ? '👦'
          : role.includes('sœur') || role.includes('soeur')
          ? '👧'
          : '👤';
      const isDeceased = m.is_deceased === true;
      const isEstranged = !isDeceased && estrangedIds.has(m.id);
      return {
        type: 'family_member',
        id: m.id,
        name: m.firstName || 'Proche',
        emoji,
        avatarUrl: m.avatar_url || undefined,
        inactive: isDeceased || isEstranged,
        inactiveLabel: isDeceased ? 'En mémoire' : isEstranged ? 'Plus en contact' : undefined,
      };
    });
    const pets: WizardCharacter[] = (activeChild.pets ?? []).map((p: any) => {
      const isDeceased = p.is_deceased === true;
      const isGone = !isDeceased && p.is_active === false;
      return {
        type: 'pet',
        id: p.id,
        name: p.name || 'Animal',
        emoji: p.emoji || '🐾',
        avatarUrl: p.avatar_url || undefined,
        inactive: isDeceased || isGone,
        inactiveLabel: isDeceased ? 'En mémoire' : isGone ? "N'est plus avec nous" : undefined,
      };
    });
    const toys: WizardCharacter[] = (activeChild.toys ?? []).map((t: any) => {
      const isLost = t.is_active === false;
      return {
        type: 'comforter',
        id: t.id,
        name: t.name || 'Doudou',
        emoji: t.emoji || '🧸',
        avatarUrl: t.avatar_url || undefined,
        inactive: isLost,
        inactiveLabel: isLost ? 'Perdu' : undefined,
      };
    });
    const siblings: WizardCharacter[] = ((activeChild as any).siblings ?? []).map((s: any) => {
      const isDeceased = s.is_deceased === true;
      return {
        type: 'child' as const,
        id: s.id,
        name: s.firstName || 'Enfant',
        emoji: '🧒',
        avatarUrl: s.avatar_url || undefined,
        locked: false,
        inactive: isDeceased,
        inactiveLabel: isDeceased ? 'En mémoire' : undefined,
      };
    });
    return [child, ...siblings, ...members, ...pets, ...toys];
  }, [activeChild]);

  const dedicatedName = (() => {
    if (!(typeof activeFlow === 'string' && activeFlow.startsWith('special_'))) return null;
    const idx = parseInt(activeFlow.split('_')[1]);
    return focusedMonth?.substituteOptions?.[idx]?.substitutePersonName ?? null;
  })();

  const wizardCharactersWithLock = wizardCharacters.map(c => ({
    ...c,
    locked: c.locked || (dedicatedName !== null && c.name === dedicatedName),
  }));

  const handleWizardSubmit = (payload: { selectedCharacters: CharacterChoice[]; storyIdea?: string; note?: string; locationId?: string | null; locationLabel?: string | null }) => {
    if (!focusedMonth?.bookRequestId) {
      toast.error('Livre introuvable, réessaie.');
      return;
    }
    const isSpecial = typeof activeFlow === 'string' && activeFlow.startsWith('special');
    const themeType: 'standard' | 'substitute' | 'original' =
      activeFlow === 'custom' ? 'original' : isSpecial ? 'substitute' : 'standard';

    const selectedCharacters =
      themeType === 'substitute' && dedicatedName
        ? payload.selectedCharacters.map((c) => {
            const { dedicated: _omit, ...rest } = c as any;
            return rest.name === dedicatedName ? { ...rest, dedicated: true } : rest;
          })
        : payload.selectedCharacters.map((c) => {
            const { dedicated: _omit, ...rest } = c as any;
            return rest;
          });

    saveChoice(
      {
        bookRequestId: focusedMonth.bookRequestId,
        selectedThemeType: themeType,
        selectedCharacters,
        originalThemeInstructions: themeType === 'original' ? payload.storyIdea : undefined,
        selectedThemeId: activeFlow === 'monthly'
          ? (focusedMonth?.themeId ?? undefined)
          : isSpecial
          ? activeSubstituteThemeId
          : undefined,
        note: payload.note,
        locationId: payload.locationId,
        locationLabel: payload.locationLabel,
      },
      {
        onSuccess: () => {
          setWizardOpen(false);
          setFocusedMonthIndex(null);
          if (themeType === 'original') {
            toast.success('Votre idée a bien été enregistrée !', { icon: <PartyPopper className="h-4 w-4" /> });
          } else {
            toast.success('Livre configuré !', { icon: <PartyPopper className="h-4 w-4" /> });
          }
        },
        onError: (err: any) => {
          // v3.2 [2] — on teste d'abord un CODE, insensible à la langue du
          // message. Le reniflage textuel reste en repli pour les erreurs
          // remontées directement par Postgres.
          const msg = (err?.message || '').toLowerCase();
          if (err?.code === 'BOOK_NOT_EDITABLE' || msg.includes('locked') || msg.includes('deadline')) {
            toast.error('La deadline est dépassée, ce livre ne peut plus être modifié.');
          } else {
            toast.error('Une erreur est survenue, réessaie.');
          }
        },
      }
    );
  };

  const wizardBookTitle = (() => {
    if (!focusedMonth) return '';
    if (typeof activeFlow === 'string' && activeFlow.startsWith('special')) {
      const opt = (focusedMonth.substituteOptions || []).find(
        (o) => o.substituteThemeId === activeSubstituteThemeId,
      );
      if (opt?.substituteThemeTitre) {
        return opt.substituteThemeTitre.replace('[Prénom]', activeChild?.firstName ?? '');
      }
    }
    return focusedMonth.standardTitle ?? focusedMonth.bookTitle;
  })();

  return (
    <div className="space-y-6">
      {/* 1. Children chips */}
      {isLoadingChildren ? (
        <div className="flex items-center gap-2 sm:gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-10 w-28 rounded-full" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucun enfant n'a encore été ajouté à votre famille.</p>
      ) : (
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-center gap-2 sm:gap-3 pb-1 min-w-max sm:min-w-0 sm:flex-wrap">
          {list.map((child) => {
            const isActive = child.id === activeChildId;
            return (
              <button
                key={child.id}
                onClick={() => {
                  setActiveChildId(child.id);
                  setFocusedMonthIndex(null);
                }}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-all border-2"
                style={{
                  backgroundColor: isActive ? PRIMARY_VIOLET : 'white',
                  borderColor: isActive ? PRIMARY_VIOLET : '#E5E7EB',
                  color: isActive ? 'white' : '#374151',
                }}
              >
                <Avatar className="h-6 w-6 border border-white/30">
                  {child.avatar ? (
                    <AvatarImage src={child.avatar} alt={child.firstName} />
                  ) : (
                    <AvatarFallback className="text-xs bg-white/20">
                      {child.personalityEmoji}
                    </AvatarFallback>
                  )}
                </Avatar>
                {child.firstName}
              </button>
            );
          })}
        </div>
      </div>
      )}

      {/* 2. Child header */}
      {activeChild && (
      <Card className="border-2 border-border bg-gradient-to-br from-white to-muted/30">
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-4 border-white shadow-md flex-shrink-0">
              {activeChild.avatar ? (
                <AvatarImage src={activeChild.avatar} alt={activeChild.firstName} />
              ) : (
                <AvatarFallback className="bg-muted text-3xl">
                  {activeChild.personalityEmoji}
                </AvatarFallback>
              )}
            </Avatar>

            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1 truncate">
                {activeChild.firstName}
              </h2>
              <p className="text-sm text-muted-foreground">
                {activeChild.age} · Timeline sur 12 mois
              </p>
            </div>

            <div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0">
              <div className="text-sm">
                <span className="font-bold text-foreground">{totalPlanned}</span>
                <span className="text-muted-foreground ml-1">prochains livres</span>
              </div>
              <div className="text-sm">
                <span className="font-bold" style={{ color: PRIMARY_VIOLET }}>{configuredCount}</span>
                <span className="text-muted-foreground ml-1">configuré{configuredCount > 1 ? 's' : ''}</span>
              </div>
              {activeSubscription?.cancel_at && totalPlanned <= 2 && (
                <p className="text-xs text-orange-500 mt-1 text-right">
                  Abonnement jusqu'au {format(parseISO(activeSubscription.cancel_at), 'd MMMM yyyy', { locale: fr })}
                </p>
              )}
            </div>
          </div>

          {/* Mobile counters */}
          <div className="sm:hidden flex items-center gap-4 mt-4 pt-4 border-t border-border text-sm">
            <div>
              <span className="font-bold text-foreground">{totalPlanned}</span>
              <span className="text-muted-foreground ml-1">prochains livres</span>
            </div>
            <div>
              <span className="font-bold" style={{ color: PRIMARY_VIOLET }}>{configuredCount}</span>
              <span className="text-muted-foreground ml-1">configuré{configuredCount > 1 ? 's' : ''}</span>
            </div>
          </div>
          {activeSubscription?.cancel_at && totalPlanned <= 2 && (
            <p className="sm:hidden text-xs text-orange-500 mt-2">
              Abonnement jusqu'au {format(parseISO(activeSubscription.cancel_at), 'd MMMM yyyy', { locale: fr })}
            </p>
          )}
        </CardContent>
      </Card>
      )}

      {/* 3. List view OR Focus view */}
      {!activeChildId ? null : focusedMonth ? (
        <FocusView
          month={focusedMonth}
          childName={activeChild?.firstName ?? ''}
          onBack={() => setFocusedMonthIndex(null)}
          onConfigure={() => {
            if (focusedMonth.selectedThemeType === 'original') {
              setActiveFlow('custom');
              setActiveSubstituteThemeId(undefined);
            } else if (
              focusedMonth.selectedThemeType === 'substitute' &&
              focusedMonth.selectedThemeId
            ) {
              const dedicatedFromChars = focusedMonth.dedicatedPersonName;
              const opts = focusedMonth.substituteOptions || [];
              let idx = -1;
              if (dedicatedFromChars) {
                idx = opts.findIndex((opt) => opt.substitutePersonName === dedicatedFromChars);
              }
              if (idx < 0) {
                idx = opts.findIndex((opt) => opt.substituteThemeId === focusedMonth.selectedThemeId);
              }
              if (idx >= 0) {
                setActiveFlow(`special_${idx}` as FlowType);
                setActiveSubstituteThemeId(focusedMonth.selectedThemeId);
              } else {
                setActiveFlow('monthly');
                setActiveSubstituteThemeId(undefined);
              }
            } else {
              setActiveFlow('monthly');
              setActiveSubstituteThemeId(undefined);
            }
            setWizardOpen(true);
          }}
          onChooseTheme={() => setThemeSheetOpen(true)}
        />
      ) : isLoadingTimeline ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : isTimelineError ? (
        <Card className="border-2 border-dashed border-border">
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            Une erreur est survenue lors du chargement de la timeline.
          </CardContent>
        </Card>
      ) : months.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '2.5rem 1.5rem',
            border: '0.5px solid hsl(var(--border))',
            borderRadius: '0.75rem',
            background: 'hsl(var(--background))',
          }}
        >
          <Library style={{ width: 40, height: 40, margin: '0 auto 12px', color: 'hsl(var(--muted-foreground))' }} strokeWidth={1.5} />
          <p style={{ fontWeight: 500, fontSize: 16, marginBottom: 8 }}>
            {activeChild?.firstName} n'a pas encore d'abonnement
          </p>
          <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: 13, marginBottom: 20 }}>
            Abonne-toi pour découvrir les 12 livres personnalisés prévus pour {activeChild?.firstName}
          </p>
          <button
            onClick={() => navigate('/abonnement')}
            style={{
              background: '#534AB7',
              color: '#EEEDFE',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '10px 24px',
              fontSize: 14,
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Découvrir les abonnements →
          </button>
        </div>
      ) : (
        <div className="space-y-3 animate-fade-in">
          {months.map((m) => (
            <MonthRow
              key={m.monthIndex}
              month={m}
              onClick={() => setFocusedMonthIndex(m.monthIndex)}
              onConfigure={(e) => {
                e.stopPropagation();
                setFocusedMonthIndex(m.monthIndex);
              }}
              alternatives={m.bookRequestId ? alternativesByBookRequestId.get(m.bookRequestId) ?? [] : []}
              onAlternativeClick={handleAlternativeClick}
            />
          ))}
        </div>
      )}

      {/* Archived books accordion */}
      {archivedBooks && archivedBooks.length > 0 && (
        <ArchivedBooksSection books={archivedBooks} childFirstName={activeChild?.firstName ?? ''} />
      )}

      {/* Wizard */}
      <Wizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        childName={activeChild?.firstName ?? ''}
        childAge={(() => {
          const bd = (activeChild as any)?.birthDate;
          if (!bd) return null;
          const d = new Date(bd);
          if (isNaN(d.getTime())) return null;
          const now = new Date();
          let age = now.getFullYear() - d.getFullYear();
          const m = now.getMonth() - d.getMonth();
          if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
          return age;
        })()}
        flow={activeFlow}
        bookTitle={wizardBookTitle}
        characters={wizardCharactersWithLock}
        isSaving={isSaving}
        savedCharacters={
          focusedMonth?.bookRequestId
            ? ((timelineRows?.find((r) => r.book_request_id === focusedMonth.bookRequestId)?.selected_characters as CharacterChoice[]) ?? [])
            : []
        }
        savedNote={
          timelineRows?.find((r) => r.book_request_id === focusedMonth?.bookRequestId)
            ?.saved_note ?? ''
        }
        savedLocationId={
          timelineRows?.find((r) => r.book_request_id === focusedMonth?.bookRequestId)
            ?.selected_location_id ?? null
        }
        savedLocationLabel={
          timelineRows?.find((r) => r.book_request_id === focusedMonth?.bookRequestId)
            ?.selected_location_label ?? null
        }
        onSubmit={handleWizardSubmit}
        onBackToThemeSheet={() => {
          setWizardOpen(false);
          setThemeSheetOpen(true);
        }}
        autoSelectedIds={autoSelectedMemberId ? [autoSelectedMemberId] : []}
        dedicatedName={dedicatedName}
        initialCustomStory={
          focusedMonth?.selectedThemeType === 'original'
            ? (focusedMonth?.originalThemeInstructions ?? '')
            : ''
        }
        familyPlaces={familyPlaces ?? []}
        locationPresets={locationPresets ?? []}
        childId={activeChild?.id ?? null}
        bookRequestId={focusedMonth?.bookRequestId ?? null}
      />

      {/* Theme selection sheet */}
      <ThemeSelectionSheet
        open={themeSheetOpen}
        onOpenChange={setThemeSheetOpen}
        month={focusedMonth}
        childName={activeChild?.firstName ?? ''}
        currentSelectedThemeId={
          timelineRows?.find(r => r.book_request_id === focusedMonth?.bookRequestId)
            ?.selected_theme_id ?? undefined
        }
        currentDedicatedName={
          (timelineRows?.find(r => r.book_request_id === focusedMonth?.bookRequestId)
            ?.selected_characters as any[] | undefined)
            ?.find((c: any) => c?.dedicated)?.name ?? undefined
        }
        onChoose={(flow, selectedThemeId) => {
          setActiveFlow(flow);
          setActiveSubstituteThemeId(selectedThemeId);
          if (flow.startsWith('special') && focusedMonth) {
            const idxStr = flow.split('_')[1];
            const idx = idxStr ? parseInt(idxStr, 10) : NaN;
            const opt = !isNaN(idx) ? (focusedMonth.substituteOptions || [])[idx] : undefined;
            const personName = opt?.substitutePersonName;
            const member = personName
              ? wizardCharacters.find(
                  (c) => c.name?.toLowerCase() === personName.toLowerCase(),
                )
              : undefined;
            setAutoSelectedMemberId(member?.id);
          } else {
            setAutoSelectedMemberId(undefined);
          }
          setThemeSheetOpen(false);
          setWizardOpen(true);
        }}
      />
    </div>
  );
};

export default MyStoriesTab;
