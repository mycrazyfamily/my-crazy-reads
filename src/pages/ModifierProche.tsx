// ModifierProche v1.2 (08/10/2026)
// Changelog v1.2 : VERROU ANTI DOUBLE CLIC.
//   Test du 08/10 : un double tap sur mobile lancait DEUX enregistrements, donc deux
//   generations d'avatar. Le garde existant lisait un etat React, qui ne change qu'au
//   rafraichissement suivant : un second tap rapide passait. Un ref, lu et ecrit sans attendre,
//   bloque desormais des le premier tap. En cas de succes, le bouton RESTE verrouille jusqu'au
//   depart de la page (avant, il se reactivait pendant la navigation). En cas d'erreur ou de
//   saisie refusee, il se libere pour permettre de corriger.
//   Le ref est pose juste avant la premiere ecriture : les verifications qui precedent sont
//   toutes synchrones, aucun second tap ne peut s'intercaler avant lui.
// ModifierProche v1.1
// Changelog v1.1 : plus d'alerte « Quitter le site ? » apres l'enregistrement. Le garde-fou
//   de sortie (useLeaveFormGuard v1.2) est libere juste avant le rechargement vers l'espace
//   famille : Chrome avertissait d'une perte de modifications pourtant enregistrees.
//   Premiere numerotation : la version precedente, sans numero, est la v1.0.
// ModifierProche  (chantier D2)
// Changelog D2 : avertissement avant de quitter la page de modification.
//   Aucun brouillon n'existe ici : une modification en cours et non enregistree est perdue
//   des qu'on quitte. Une modale previent donc avant de partir, variante 'perte' de
//   LeaveFormDialog. Elle couvre les boutons de sortie de la page ET le bouton
//   « Précédent » du navigateur, via useLeaveFormGuard.
//   La modale est inseree apres CHAQUE bouton de sortie : ces pages ont plusieurs branches
//   de rendu (chargement, erreur, formulaire) et une seule est montee a la fois.
// ModifierProche v1.9
// Changelog v1.9 (chantier C1a, correctif) : le drapeau obsolete noPhysicalDetails cassait
//   DEUX choses sur les proches, mesure du 25/08 sur la fiche Babette.
//   [1] ECRITURE. `physical_details: noPhysicalDetails ? [""] : ...` ecrivait [""] quoi que le
//       parent saisisse. La case ayant disparu en v1.8, plus rien ne pouvait remettre le
//       drapeau a false : la saisie etait perdue a chaque enregistrement.
//   [2] DETECTION. relativeAvatarSignature neutralisait la liste par le meme drapeau, donc la
//       signature ne bougeait jamais et aucun avatar n'etait regenere.
//   Le drapeau n'est plus ni lu ni ecrit. n8n ne l'a jamais lu : 2C3_Merge_Pets_Logic documente
//   deja la convention « tableau vide = aucun detail ». La cle noPhys sort aussi de la signature,
//   sans effet de bord : les deux cotes de la comparaison utilisent la meme formule.
// ModifierProche v1.8
// Changelog v1.8 (chantier C1a) : retrait de la validation « au moins un detail physique OU
//   case cochee ». Voir PhysicalDetailsInput v3.0 et BasicInfoForm v1.3. Details physiques
//   desormais facultatifs.
// ModifierProche v1.7
// Changelog v1.7 :
//   `role` SORT de relativeAvatarSignature. Mesure du 21/08 : passer un proche de pere a oncle
//   declenchait une generation d'image complete. Le rendu etait visuellement identique, ce qui est
//   attendu, mais l'appel n'aurait jamais du partir.
//   POURQUOI CE CHAMP N'A RIEN A FAIRE DANS UNE SIGNATURE D'APPARENCE. Le role ne decrit pas un
//   physique, il decrit un lien de parente. Mere vers tante, grand-mere vers mere, pere vers oncle :
//   ni le genre ni l'age ne bougent (l'age vient de birthDate), donc le physique en base reste
//   exact. Cote n8n, le role n'apparait que comme etiquette entre parentheses dans la description du
//   node d'edition, « a woman character (mother) », et 3_Build_Master_Prompt ne le lit meme pas.
//   Le garder faisait payer une generation d'image, donc du temps et du cout Gemini, a chaque
//   correction de lien de parente. C'est la meme raison qui avait fait sortir `traits` en v1.4.
//   CE QUI RESTE COUVERT. `gender` demeure dans la signature : pere vers mere continue de declencher,
//   et 3_Build_Edit_Prompt v6.8 y leve bodyOverride pour redessiner le personnage au bon genre. Les
//   ecrans basculent souvent role et genre ensemble, mais c'est le genre qui porte la decision.
//   AUCUN IMPACT AILLEURS. Le role reste ecrit en base et reste envoye au workflow : seule la
//   DETECTION de changement cesse de le prendre en compte. Un proche dont on corrige le lien garde
//   son avatar existant, et la prochaine generation, quelle qu'en soit la cause, utilisera le
//   nouveau role dans sa description.
// ModifierProche v1.6
// Changelog v1.6 :
//   LOT E, ETAPE 3 — envoie previous_avatar_fields au webhook edit-avatar-mcf, a cote de
//   previous_birth_date deja present. C'est la chaine JSON deja calculee par
//   initialAvatarSigRef pour decider s'il faut regenerer : l'etat d'origine complet, avant
//   modification. Aucun nouveau calcul, la valeur existe deja au moment de l'appel.
//   POURQUOI. Le node 3_Build_Edit_Prompt disait « Wear the NEW clothing » de facon
//   INCONDITIONNELLE a chaque edition, meme quand le parent n'avait pas touche a la tenue.
//   Combine au label brut ("Boheme nature", deux mots depuis le fix v3.2 du node, au lieu de la
//   description detaillee d'avant), cela faisait REINVENTER la tenue a chaque fois : changer une
//   couleur d'yeux suffisait a remplacer une blouse et une jupe par une robe.
//   Avec ce champ, le node compare l'etat d'origine aux valeurs relues en base apres sauvegarde.
//   Tenue inchangee => il renvoie a l'image de reference sans aucune description, donc zero
//   derive. Tenue changee => comportement actuel conserve.
//   GARDE DE SURETE cote n8n : si le champ est absent, le node se comporte exactement comme
//   avant. Le front et le back peuvent donc etre deployes dans n'importe quel ordre.
//   Deja en place sur ModifierAnimal v3.4, valide en production le 20/08.
// Changelog v1.5 : LOT F3 — fin du double encodage des colonnes jsonb.
//   Les colonnes physical_details et clothing_style, sur child_profiles, family_members et pets,
//   sont toutes de type jsonb (verifie sur information_schema le 20/08). Passer une CHAINE
//   produite par JSON.stringify fait stocker a Postgres une valeur JSON de type chaine, et non un
//   tableau : la base contenait "[\"Collier rouge\"]" la ou physical_details contenait proprement
//   ["Poil blanc"]. Le client Supabase serialise deja, il faut lui donner la valeur NATIVE.
//   Consequence mesuree : 4D2_Enrich_Context du Book Factory utilise clothing_style en fallback
//   direct quand clothing_style_resolved est absent, SANS le deballer. Le livre recevait alors la
//   chaine brute avec ses guillemets et ses antislashs.
//   Les fonctions de LECTURE qui deballent jusqu'a 3 niveaux sont volontairement CONSERVEES : les
//   lignes deja en base restent doublement encodees et doivent rester lisibles. On corrige
//   l'ecriture, on ne casse pas la lecture.
//   Deux lignes fautives ici : physical_details ET clothing_style.
// Changelog v1.4 : LOT F1 — les TRAITS DE CARACTERE sortent de relativeAvatarSignature.
//   Mesure du 20/08 : changer un trait declenchait une regeneration complete de l'avatar, alors
//   qu'AUCUN trait n'entre dans un prompt, ni a la creation ni a l'edition. Verifie sur les deux
//   constructeurs 3_Build_Master_Prompt et 3_Build_Edit_Prompt : les seules occurrences du mot
//   "traits" y sont "no masculine traits" et "physical traits", sans rapport. Le prompt produit
//   apres un changement de trait etait donc strictement identique au precedent : une generation
//   Gemini image depensee pour rien. Meme correction que ModifierAnimal v3.5.
//   Deux cles retirees : `traits` (les traits predefinis) et `customTraits` (le champ « Autre »).
//   Les deux restent INCHANGES dans le formulaire, en base et dans la validation blocklist :
//   seul leur pouvoir de declencher une regeneration disparait.
//   `phys` et `noPhys` restent : ils decrivent bien l'apparence et sont lus par le back.
// ModifierProche v1.3
// Changelog v1.3 (AFFICHAGE UNIQUEMENT — alignement sur le patron ModifierAnimal) :
//   • Avatar passé en PROPS à EditAvatarHeader : loadRelativeData charge avatar_url + family_id
//     (avatar_url ajouté aux deux select ; family_id déjà présent) et les transmet (initialAvatarUrl
//     + familyId) → plus de 2ᵉ fetch interne, donc plus de flash « 🎨 Création… » à l'ouverture. NB :
//     la colonne d'affichage vivante est `avatar_url` (utilisée par le pipeline + le realtime) ; la
//     colonne `avatar` déjà présente au select restait un doublon legacy jamais lu.
//   • Écran de chargement : EditProfileSkeleton (carte fantôme) au lieu du spinner « Chargement… »,
//     dans le même habillage que ModifierAnimal (Navbar + main + back + titre + skeleton).
//   Aucune donnée ni logique métier modifiée.
// Changelog v1.2 : EditAvatarHeader monté en tête (avatar + « Générer une autre proposition ») ;
//                  ancien ResetAvatarButton du pied de page retiré (désormais porté par le header).
// Changelog v1.1 : ajout de la validation birthDate obligatoire dans handleSave (jamais vérifiée jusqu'ici)
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import LeaveFormDialog from '@/components/childProfile/LeaveFormDialog';
import { useLeaveFormGuard } from '@/hooks/useLeaveFormGuard';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ArrowLeft, Heart } from 'lucide-react';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { signalAvatarRegeneration } from '@/utils/avatarRegenerationSignal';
import { useInvalidateFamilyData } from '@/hooks/useFamilyData';
import { splitCamelCase } from '@/utils/nameFormatter';
import { FORBIDDEN_NAME_ERROR, checkFreeTextFields, containsForbiddenWord, forbiddenFieldsError } from '@/utils/nameBlocklist';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RelativeBasicInfoSection from '@/components/childProfile/relatives/RelativeBasicInfoSection';
import RelativeNicknameSection from '@/components/childProfile/relatives/RelativeNicknameSection';
import RelativeAppearanceSection from '@/components/childProfile/relatives/RelativeAppearanceSection';
import RelativeTraitsSection from '@/components/childProfile/relatives/RelativeTraitsSection';
import ChildrenSelector from '@/components/childProfile/ChildrenSelector';
import type { RelativeType, RelativeGender } from '@/types/childProfile';
import EditAvatarHeader from '@/components/familyDashboard/EditAvatarHeader';
import EditProfileSkeleton from '@/components/familyDashboard/EditProfileSkeleton';

// Statut « entité inactive » du proche : seul le décès est un fait global d'entité.
// La brouille (« plus en contact ») est gérée PAR ENFANT via la junction child_family_members.
type RelativeStatus = 'active' | 'deceased';

/**
 * Déballe une liste de détails physiques quel que soit son encodage en base :
 * tableau, chaîne JSON, chaîne JSON doublement encodée, ou tableau d'objets {value/label}.
 * Indispensable pour comparer l'apparence « avant / après » sans faux positif.
 */
function normalizePhysList(raw: any): string[] {
  let v = raw;
  for (let i = 0; i < 3 && typeof v === 'string'; i++) {
    const s = v.trim();
    if (!s) return [];
    try { v = JSON.parse(s); } catch { return [s]; }
  }
  if (!Array.isArray(v)) return [];
  return v
    .map((d: any) => {
      if (typeof d === 'string') return d.trim();
      if (d && typeof d === 'object') return String(d.value ?? d.label ?? d.text ?? '').trim();
      return '';
    })
    .filter((d: string) => d.length > 0);
}

/** Normalise une date en 'YYYY-MM-DD' sur le jour LOCAL (évite un décalage d'un jour dû à l'UTC). */
function ymd(d: any): string {
  if (!d) return '';
  const dt = (d instanceof Date) ? d : new Date(d);
  if (isNaN(dt.getTime())) return (typeof d === 'string' ? d.slice(0, 10) : '');
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Signature des champs qui influencent l'AVATAR (apparence physique).
 * Sert à n'appeler MCF_Avatar_Factory que si l'apparence a réellement changé —
 * pas pour un simple changement de statut (décès) ni de liens / brouille enfants.
 * Le nom, le surnom et l'âge textuel sont volontairement EXCLUS (non visuels / dérivés).
 * Le RÔLE aussi depuis v1.7 : c'est un lien de parenté, pas un physique.
 */
function relativeAvatarSignature(i: any): string {
  // v1.9 : le drapeau noPhysicalDetails ne neutralise plus la liste. Il restait a true en
  // base sur les fiches anciennes et, la case ayant disparu, plus rien ne pouvait le remettre
  // a false : la signature voyait donc toujours phys=[] et aucune edition ne declenchait de
  // regeneration. Convention retenue, celle que n8n applique deja : tableau vide = aucun detail.
  const phys = normalizePhysList(i?.physicalDetails);
  return JSON.stringify({
    // v1.7 : `role` retire. Un lien de parente n'est pas un trait physique : le changer ne doit
    // pas declencher de generation. `gender` reste, c'est lui qui porte la decision visuelle.
    gender: i?.gender || '',
    skin: [i?.skinColorType || '', (i?.skinColorCustom || '').trim()],
    eye: [i?.eyeColorType || '', (i?.eyeColorCustom || '').trim()],
    hairColor: [i?.hairColorType || '', (i?.hairColorCustom || '').trim()],
    hairType: i?.hairType || '',
    hairTypeCustom: (i?.hairTypeCustom || '').trim(),
    hairLength: i?.hairLength || '',
    glasses: !!i?.glasses,
    phys,
    clothing: (i?.clothingStyle || '').trim(),
    birth: ymd(i?.birthDate),
    // v1.4 : `traits` et `customTraits` retires — aucun trait de caractere n'entre dans un
    // prompt, les garder ici faisait payer une generation d'image a chaque changement d'humeur
    // declaree. Les champs eux-memes ne bougent pas, seule la detection de changement change.
  });
}

const ModifierProche: React.FC = () => {
  const navigate = useNavigate();

  // D2 : garde-fou de sortie. Toujours actif : toute modification non enregistree est perdue.
  const {
    confirmationOuverte,
    setConfirmationOuverte,
    demanderSortie,
    confirmerSortie,
    libererSortie, // v1.1
  } = useLeaveFormGuard({ actif: true });

  const handleSortie = () => demanderSortie(() => navigate('/espace-famille'));

  const invalidateFamilyData = useInvalidateFamilyData();
  const { childId, relativeId } = useParams<{ childId: string; relativeId: string }>();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false); // v1.2 : verrou synchrone anti double clic
  const [childData, setChildData] = useState<any>(null);
  const [existingChildren, setExistingChildren] = useState<Array<{ id: string; first_name: string }>>([]);
  const [selectedChildrenIds, setSelectedChildrenIds] = useState<string[]>([]);
  // Enfants avec lesquels ce proche est « plus en contact » (brouille) — sous-ensemble de selectedChildrenIds
  const [estrangedChildIds, setEstrangedChildIds] = useState<string[]>([]);
  // v1.3 : avatar + family_id chargés avec le profil → passés en props à EditAvatarHeader
  // (supprime le 2ᵉ fetch interne + le flash « Création… »).
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [familyId, setFamilyId] = useState<string | null>(null);
  
  // État pour toutes les informations du proche
  const [type, setType] = useState<RelativeType>('father');
  const [firstName, setFirstName] = useState('');
  const [otherTypeName, setOtherTypeName] = useState<string | undefined>(undefined);
  const [age, setAge] = useState('');
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);
  const [originalBirthDate, setOriginalBirthDate] = useState<string | null>(null);
  const [job, setJob] = useState('');
  const [gender, setGender] = useState<RelativeGender>('male');
  
  // Surnom
  const [selectedNickname, setSelectedNickname] = useState('none');
  const [nicknameCustomValue, setNicknameCustomValue] = useState<string | undefined>(undefined);
  
  // Apparence
  const [selectedSkinColor, setSelectedSkinColor] = useState('light');
  const [skinColorCustomValue, setSkinColorCustomValue] = useState<string | undefined>(undefined);
  const [selectedEyeColor, setSelectedEyeColor] = useState('');
  const [eyeColorCustomValue, setEyeColorCustomValue] = useState<string | undefined>(undefined);
  const [selectedHairColor, setSelectedHairColor] = useState('brown');
  const [hairColorCustomValue, setHairColorCustomValue] = useState<string | undefined>(undefined);
  const [hairType, setHairType] = useState('straight');
  const [hairTypeCustom, setHairTypeCustom] = useState('');
  const [hairLength, setHairLength] = useState('');
  const [glasses, setGlasses] = useState(false);
  
  // Traits
  const [traits, setTraits] = useState<string[]>([]);
  const [customTraits, setCustomTraits] = useState<Record<string, string>>({});
  const [physicalDetails, setPhysicalDetails] = useState<string[]>([]);
  const [noPhysicalDetails, setNoPhysicalDetails] = useState<boolean>(false);
  const [clothingStyle, setClothingStyle] = useState<string>('');

  // Statut (décès) + confirmation
  const [relativeStatus, setRelativeStatus] = useState<RelativeStatus>('active');
  const [pendingDeceased, setPendingDeceased] = useState(false);

  // Signature d'apparence au chargement — pour ne régénérer l'avatar QUE si l'apparence change
  const initialAvatarSigRef = useRef<string>('');
  // Snapshot initial des liens (child_id -> is_active) et du type, pour un diff qui préserve les dates au save
  const initialLinksRef = useRef<Map<string, boolean>>(new Map());
  const initialTypeRef = useRef<string>('father');

  useEffect(() => {
    window.scrollTo(0, 0);
    loadRelativeData();
  }, [childId, relativeId]);

  const loadRelativeData = async () => {
    try {
      // Charger le proche depuis la relation; fallback direct si nécessaire
      const { data, error } = await supabase
        .from('child_family_members')
        .select(`
          relation_label,
            family_members (
              id,
              name,
              role,
              avatar,
              avatar_url,
              family_id,
              details,
              physical_details,
              clothing_style,
              is_deceased
            )
        `)
        .eq('child_id', childId)
        .eq('family_member_id', relativeId)
        .maybeSingle();

      if (error) throw error;

      // Fallback: si la jointure ne renvoie pas le membre, charger directement
      let relative: any = data?.family_members;
      if (!relative) {
        const { data: relativeDirect, error: relErr } = await supabase
          .from('family_members')
          .select('id, name, role, avatar, avatar_url, family_id, details, physical_details, clothing_style, is_deceased')
          .eq('id', relativeId)
          .maybeSingle();
        if (relErr) throw relErr;
        relative = relativeDirect;
      }

      if (relative) {
        // v1.3 : colonne vivante avatar_url (pas `avatar`) + family_id → props EditAvatarHeader
        setAvatarUrl((relative as any).avatar_url ?? null);
        setFamilyId((relative as any).family_id ?? null);
        // Récupérer toutes les infos depuis family_members.details si présent
        setType((relative.role as RelativeType) || 'father');
        setFirstName(relative.name || '');
        // Supporte le cas où details est une chaîne JSON
        let details: any = (relative as any).details ?? {};
        if (typeof details === 'string') {
          try { details = JSON.parse(details); } catch { details = {}; }
        }
        console.log('Loaded relative details:', details);

        // Pré-remplir les champs basiques (avec compatibilité pour anciens enregistrements)
        setGender(details.gender || 'male');
        setAge(details.age || '');
        
        // birthDate: support multiple formats
        const birthDateRaw = details.birthDate ?? details.birthdate ?? details.birth_date ?? null;
        console.log('birthDateRaw from details:', birthDateRaw);
        let computedOriginalBirthDate: string | null = null;
        if (birthDateRaw) {
          try {
            setBirthDate(new Date(birthDateRaw));
            computedOriginalBirthDate = typeof birthDateRaw === 'string' ? birthDateRaw : new Date(birthDateRaw).toISOString().split('T')[0];
            setOriginalBirthDate(computedOriginalBirthDate);
          } catch {
            console.error('Failed to parse birthDate:', birthDateRaw);
            setBirthDate(undefined);
            setOriginalBirthDate(null);
          }
        } else {
          setBirthDate(undefined);
          setOriginalBirthDate(null);
        }
        
        // job: support multiple aliases
        const jobValue = details.job ?? details.profession ?? details.occupation ?? '';
        console.log('job from details:', jobValue);
        setJob(jobValue);
        setOtherTypeName(details.otherTypeName || undefined);

        // Pré-remplir le surnom
        const nicknameType = details.nickname?.type || 'none';
        setSelectedNickname(nicknameType);
        setNicknameCustomValue(details.nickname?.custom || undefined);

        // Pré-remplir l'apparence
        const skinColorType = details.skinColor?.type || 'light';
        setSelectedSkinColor(skinColorType);
        setSkinColorCustomValue(details.skinColor?.custom || undefined);

        const eyeColorType = details.eyeColor?.type || '';
        setSelectedEyeColor(eyeColorType);
        setEyeColorCustomValue(details.eyeColor?.custom || undefined);

        const hairColorType = details.hairColor?.type || 'brown';
        setSelectedHairColor(hairColorType);
        setHairColorCustomValue(details.hairColor?.custom || undefined);

        setHairType(details.hairType || 'straight');
        setHairTypeCustom(details.hairTypeCustom || '');
        const hairLengthValue = details.hairLength || '';
        setHairLength(hairLengthValue);
        setGlasses(!!details.glasses);

        // Pré-remplir les traits
        setTraits(details.traits || []);
        setCustomTraits(details.customTraits || {});

        // Charger les physical_details depuis la colonne dédiée (avec fallback sur details)
        let physicalDetailsData: string[] = [];
        if (relative.physical_details) {
          try {
            physicalDetailsData = typeof relative.physical_details === 'string' 
              ? JSON.parse(relative.physical_details) 
              : relative.physical_details;
          } catch {
            physicalDetailsData = [];
          }
        } else if (details.physicalDetails) {
          physicalDetailsData = details.physicalDetails;
        }
        setPhysicalDetails(physicalDetailsData);
        
        // Déterminer le flag "aucun détail" à partir de details.noPhysicalDetails OU du format [""] en base
        const computedNoPhysical = (details.noPhysicalDetails === true) || (Array.isArray(physicalDetailsData) && physicalDetailsData.length === 1 && physicalDetailsData[0] === "");
        setNoPhysicalDetails(computedNoPhysical);

        // Charger le clothing_style depuis la colonne dédiée (avec fallback sur details)
        let clothingStyleData = '';
        if (relative.clothing_style) {
          try {
            const parsed = typeof relative.clothing_style === 'string' 
              ? JSON.parse(relative.clothing_style) 
              : relative.clothing_style;
            clothingStyleData = Array.isArray(parsed) ? (parsed[0] || '') : '';
          } catch {
            clothingStyleData = '';
          }
        } else if (details.clothingStyle) {
          clothingStyleData = details.clothingStyle;
        }
        setClothingStyle(clothingStyleData);

        // Statut (décès) — fait global d'entité
        setRelativeStatus(relative.is_deceased === true ? 'deceased' : 'active');

        // Mémoriser la signature d'apparence initiale (pour le gate avatar au save)
        initialAvatarSigRef.current = relativeAvatarSignature({
          role: (relative.role as RelativeType) || 'father',
          gender: details.gender || 'male',
          skinColorType: skinColorType,
          skinColorCustom: details.skinColor?.custom,
          eyeColorType: eyeColorType,
          eyeColorCustom: details.eyeColor?.custom,
          hairColorType: hairColorType,
          hairColorCustom: details.hairColor?.custom,
          hairType: details.hairType || 'straight',
          hairTypeCustom: details.hairTypeCustom || '',
          hairLength: hairLengthValue,
          glasses: !!details.glasses,
          physicalDetails: physicalDetailsData,
          noPhysicalDetails: computedNoPhysical,
          clothingStyle: clothingStyleData,
          birthDate: computedOriginalBirthDate || '',
          age: details.age || '',
          traits: details.traits || [],
          customTraits: details.customTraits || {},
        });

        setChildData({ loaded: true });

        // Charger tous les enfants de la famille
        const { data: childrenData, error: childrenError } = await supabase
          .from('child_profiles')
          .select('id, first_name')
          .eq('family_id', relative.family_id)
          .order('first_name');

        if (childrenError) throw childrenError;
        setExistingChildren(childrenData || []);

        // Charger les enfants liés à ce proche (+ état de brouille par enfant)
        const { data: linkedChildren, error: linkedError } = await supabase
          .from('child_family_members')
          .select('child_id, is_active, inactive_reason')
          .eq('family_member_id', relativeId);

        if (linkedError) throw linkedError;
        setSelectedChildrenIds((linkedChildren || []).map((c: any) => c.child_id));
        setEstrangedChildIds(
          (linkedChildren || [])
            .filter((c: any) => c.is_active === false)
            .map((c: any) => c.child_id)
        );
        // Snapshot initial pour le diff au save (préservation des dates)
        initialLinksRef.current = new Map(
          (linkedChildren || []).map((c: any) => [c.child_id, c.is_active !== false])
        );
        initialTypeRef.current = (relative.role as string) || 'father';
      } else {
        toast.error("Proche non trouvé");
        navigate('/espace-famille');
      }
    } catch (e) {
      console.error('Error loading relative data:', e);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };
  
  const handleTraitToggle = (trait: string) => {
    if (traits.includes(trait)) {
      setTraits(traits.filter(t => t !== trait));
    } else if (traits.length < 3) {
      setTraits([...traits, trait]);
    } else {
      toast.error("Maximum 3 traits sélectionnables");
    }
  };

  const handleToggleChild = (childIdToToggle: string) => {
    setSelectedChildrenIds(prev =>
      prev.includes(childIdToToggle)
        ? prev.filter(id => id !== childIdToToggle)
        : [...prev, childIdToToggle]
    );
    // Si on retire le lien, on retire aussi une éventuelle brouille (cohérence)
    setEstrangedChildIds(prev => prev.filter(id => id !== childIdToToggle));
  };

  const handleToggleEstrangement = (childIdToToggle: string) => {
    // La brouille n'a de sens que pour un enfant lié
    if (!selectedChildrenIds.includes(childIdToToggle)) return;
    setEstrangedChildIds(prev =>
      prev.includes(childIdToToggle)
        ? prev.filter(id => id !== childIdToToggle)
        : [...prev, childIdToToggle]
    );
  };

  const handleStatusChange = (value: RelativeStatus) => {
    // Confirmation explicite pour le décès (action sensible)
    if (value === 'deceased' && relativeStatus !== 'deceased') {
      setPendingDeceased(true);
      return;
    }
    setRelativeStatus(value);
  };

  const handleSave = async () => {
    if (!childData) return;

    // Validation des champs obligatoires
    const errors: string[] = [];

    if (!firstName?.trim()) errors.push("le prénom");

    // Blocklist : prénom et surnom personnalisé
    if (containsForbiddenWord(firstName)) {
      toast.error(FORBIDDEN_NAME_ERROR);
      return;
    }
    if (selectedNickname === 'custom' && containsForbiddenWord(nicknameCustomValue)) {
      toast.error(FORBIDDEN_NAME_ERROR);
      return;
    }

    // v2.0 — blocklist étendue à TOUS les champs libres, en un seul appel : c'est
    // le seul endroit de l'écran où ils sont tous réunis.
    const champsLibres = checkFreeTextFields({
      'les détails physiques': physicalDetails,
      'la tenue': clothingStyle,
      'le métier': job,
      'le type de relation': otherTypeName,
      'le type de cheveux': hairTypeCustom,
      'la couleur des cheveux': hairColorCustomValue,
      'la couleur de peau': skinColorCustomValue,
      'la couleur des yeux': eyeColorCustomValue,
      'les traits de caractère': Object.values(customTraits || {})
        .filter((v) => typeof v === 'string') as string[],
    });
    if (!champsLibres.ok) {
      toast.error(forbiddenFieldsError(champsLibres));
      return;
    }

    if (!type) errors.push("le type de relation");
    if (type === 'other' && !otherTypeName?.trim()) {
      errors.push("la description du type de relation personnalisé");
    }
    
    // Gender must always be male or female
    if (gender !== 'male' && gender !== 'female') {
      errors.push("le genre (Homme / Femme)");
    }

    // Date de naissance
    if (!birthDate) {
      errors.push("la date de naissance");
    }
    
    // Couleur de peau
    if (!selectedSkinColor) errors.push("la couleur de peau");
    if (selectedSkinColor === 'custom' && !skinColorCustomValue?.trim()) {
      errors.push("la couleur de peau personnalisée");
    }

    // Couleur des yeux
    if (!selectedEyeColor) errors.push("la couleur des yeux");
    if (selectedEyeColor === 'custom' && !eyeColorCustomValue?.trim()) {
      errors.push("la couleur des yeux personnalisée");
    }
    
    // Couleur des cheveux
    if (!selectedHairColor) errors.push("la couleur des cheveux");
    if (selectedHairColor === 'custom' && !hairColorCustomValue?.trim()) {
      errors.push("la couleur des cheveux personnalisée");
    }
    
    // Type de cheveux
    if (!hairType) errors.push("le type de cheveux");
    if (hairType === 'custom' && !hairTypeCustom?.trim()) {
      errors.push("le type de cheveux personnalisé");
    }

    // Longueur des cheveux (obligatoire sauf si Chauve)
    if (hairType !== 'bald' && !hairLength) {
      errors.push("la longueur des cheveux");
    }
    
    // Lunettes
    if (glasses === null || glasses === undefined) {
      errors.push("si le proche porte des lunettes (Oui/Non)");
    }
    
    // Surnom
    if (selectedNickname === 'custom' && !nicknameCustomValue?.trim()) {
      errors.push("le surnom personnalisé");
    }
    
    // Au moins un trait de caractère
    if (traits.length === 0) {
      errors.push("au moins un trait de caractère");
    }
    
    // Validation des traits personnalisés
    for (const traitKey of Object.keys(customTraits)) {
      if (!customTraits[traitKey]?.trim()) {
        errors.push(`le trait personnalisé "${traitKey}"`);
      }
    }

    // v3.0 (chantier C1a) : détails physiques facultatifs, voir PhysicalDetailsInput v3.0.

    // Validation de la sélection des enfants
    if (selectedChildrenIds.length === 0) {
      errors.push("au moins un enfant associé à ce proche");
    }

    if (errors.length > 0) {
      toast.error(`Veuillez renseigner : ${errors.join(', ')}`);
      return;
    }

    // Longueur des cheveux : forcée à null si Chauve (cohérence donnée/avatar)
    const resolvedHairLength = hairType === 'bald' ? null : (hairLength || null);

    // L'avatar n'est régénéré QUE si l'apparence a changé (pas pour le statut ni les liens / brouille enfants).
    const currentAvatarSig = relativeAvatarSignature({
      role: type,
      gender,
      skinColorType: selectedSkinColor,
      skinColorCustom: skinColorCustomValue,
      eyeColorType: selectedEyeColor,
      eyeColorCustom: eyeColorCustomValue,
      hairColorType: selectedHairColor,
      hairColorCustom: hairColorCustomValue,
      hairType,
      hairTypeCustom,
      hairLength: resolvedHairLength || '',
      glasses,
      physicalDetails,
      noPhysicalDetails,
      clothingStyle,
      birthDate: birthDate || '',
      age,
      traits,
      customTraits,
    });
    const avatarRelevantChanged = currentAvatarSig !== initialAvatarSigRef.current;

    if (savingRef.current) return; // v1.2 : verrou synchrone
    savingRef.current = true;
    setSaving(true);
    let reussi = false; // v1.2
    try {
      // Mettre à jour dans family_members
      const detailsPayload = {
        nickname: {
          type: selectedNickname,
          custom: nicknameCustomValue ? splitCamelCase(nicknameCustomValue) : nicknameCustomValue,
        },
        skinColor: { type: selectedSkinColor, custom: skinColorCustomValue },
        eyeColor: { type: selectedEyeColor, custom: eyeColorCustomValue },
        hairColor: { type: selectedHairColor, custom: hairColorCustomValue },
        hairType: hairType,
        hairTypeCustom,
        hairLength: resolvedHairLength,
        glasses,
        traits,
        customTraits,
        age,
        birthDate: birthDate ? new Date(birthDate).toISOString().split('T')[0] : null,
        job: job || null,
        gender,
        otherTypeName: otherTypeName || null,
        noPhysicalDetails: noPhysicalDetails
      };

      const updatePayload: any = {
        name: splitCamelCase(firstName),
        role: type,
        // v1.9 : ecriture directe. La branche noPhysicalDetails ecrivait [""] quoi que le
        // parent ait saisi, ce qui perdait silencieusement la saisie sur toute fiche dont le
        // drapeau valait deja true.
        physical_details: physicalDetails.length > 0 ? physicalDetails : [],
        clothing_style: clothingStyle ? [clothingStyle] : [],
        details: detailsPayload,
        // Statut (décès) — fait global d'entité ; le trigger DB horodate deceased_recorded_at automatiquement.
        is_deceased: relativeStatus === 'deceased'
      };

      const { error } = await supabase
        .from('family_members')
        .update(updatePayload)
        .eq('id', relativeId);

      if (error) throw error;

      // Synchronisation des liens enfant↔proche en DIFF ciblé (insert / delete / flip de brouille)
      // pour PRÉSERVER les dates : created_at = date d'apparition, inactive_at = date de disparition.
      // Un DELETE+INSERT global réinitialiserait created_at à chaque sauvegarde.
      const nowIso = new Date().toISOString();
      const initialLinks = initialLinksRef.current; // child_id -> is_active (au chargement)
      const initialIds = new Set(initialLinks.keys());

      const desiredActive = new Map<string, boolean>();
      selectedChildrenIds.forEach((cid) => desiredActive.set(cid, !estrangedChildIds.includes(cid)));

      const toInsert = selectedChildrenIds.filter((cid) => !initialIds.has(cid));
      const toDelete = [...initialIds].filter((cid) => !desiredActive.has(cid));
      const conserved = selectedChildrenIds.filter((cid) => initialIds.has(cid));
      const flipToInactive = conserved.filter((cid) => initialLinks.get(cid) === true && desiredActive.get(cid) === false);
      const flipToActive = conserved.filter((cid) => initialLinks.get(cid) === false && desiredActive.get(cid) === true);

      // 1) Liens retirés (enfant décoché) → suppression
      if (toDelete.length > 0) {
        const { error: delErr } = await supabase
          .from('child_family_members')
          .delete()
          .eq('family_member_id', relativeId)
          .in('child_id', toDelete);
        if (delErr) throw delErr;
      }

      // 2) Nouveaux liens → insertion (created_at = date d'apparition, posée automatiquement par la DB).
      //    Le trigger ne se déclenche pas sur INSERT : on pose inactive_at explicitement si brouillé dès la création.
      if (toInsert.length > 0) {
        const rows = toInsert.map((cid) => {
          const active = desiredActive.get(cid) !== false;
          return {
            child_id: cid,
            family_member_id: relativeId,
            relation_label: type,
            is_active: active,
            inactive_reason: active ? null : 'estranged',
            inactive_at: active ? null : nowIso,
          };
        });
        const { error: insErr } = await supabase
          .from('child_family_members')
          .insert(rows);
        if (insErr) throw insErr;
      }

      // 3) Passage en brouille (actif → inactif) → le trigger pose inactive_at = date de disparition
      if (flipToInactive.length > 0) {
        const { error: offErr } = await supabase
          .from('child_family_members')
          .update({ is_active: false, inactive_reason: 'estranged' })
          .eq('family_member_id', relativeId)
          .in('child_id', flipToInactive);
        if (offErr) throw offErr;
      }

      // 4) Reprise de contact (inactif → actif) → le trigger efface inactive_at + inactive_reason
      if (flipToActive.length > 0) {
        const { error: onErr } = await supabase
          .from('child_family_members')
          .update({ is_active: true })
          .eq('family_member_id', relativeId)
          .in('child_id', flipToActive);
        if (onErr) throw onErr;
      }

      // 5) Si le type de relation a changé, resynchroniser relation_label sur les liens conservés
      //    (sans toucher is_active → ne déclenche pas le trigger, donc inactive_at préservé)
      if (conserved.length > 0 && type !== initialTypeRef.current) {
        const { error: lblErr } = await supabase
          .from('child_family_members')
          .update({ relation_label: type })
          .eq('family_member_id', relativeId)
          .in('child_id', conserved);
        if (lblErr) throw lblErr;
      }
      
      // L'avatar n'est régénéré QUE si l'apparence a changé.
      // Un changement de statut (décès) ou de liens / brouille enfants ne doit PAS
      // déclencher MCF_Avatar_Factory (coût de génération + risque d'altération non voulue).
      if (avatarRelevantChanged) {
        // Récupérer l'avatar_url actuel avant de déclencher la regénération
        const { data: relativeRow } = await supabase
          .from('family_members')
          .select('avatar_url')
          .eq('id', relativeId)
          .maybeSingle();

        // Appel webhook pour regénérer l'avatar
        try {
          await fetch('https://mcf-automation-n8n.jnow9f.easypanel.host/webhook/edit-avatar-mcf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              profile_id: relativeId,
              type: 'relative',
              current_avatar_url: relativeRow?.avatar_url || null,
              previous_birth_date: originalBirthDate,
              // v1.6 : snapshot de l'etat d'origine, deja calcule pour decider s'il faut
              // regenerer. Permet au back de savoir CE QUI a change et de ne decrire que ca.
              previous_avatar_fields: initialAvatarSigRef.current
            })
          });
        } catch (webhookErr) {
          console.error('Webhook avatar error:', webhookErr);
        }

        if (relativeId) signalAvatarRegeneration(relativeId);
      }

      invalidateFamilyData();
      toast.success('Proche modifié avec succès !');
      libererSortie(); // v1.1 : enregistrement reussi, on part sans avertissement
      reussi = true; // v1.2 : verrou garde pendant le rechargement de la page
      window.location.href = '/espace-famille';
    } catch (e) {
      console.error('Error saving relative:', e);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      if (!reussi) { // v1.2
        savingRef.current = false;
        setSaving(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />

        <main className="container mx-auto px-4 py-20 max-w-3xl">
          <Button
            variant="ghost"
            onClick={handleSortie}
            className="mb-6 text-mcf-orange-dark hover:bg-mcf-amber/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'espace famille
          </Button>
        <LeaveFormDialog
          open={confirmationOuverte}
          onOpenChange={setConfirmationOuverte}
          onConfirm={confirmerSortie}
          variante="perte"
        />


          <div className="mb-8">
            <h1 className="text-3xl font-bold text-mcf-orange-dark mb-2">
              Modifier {firstName || 'le proche'}
            </h1>
            <p className="text-gray-600">
              Mettez à jour les informations de ce proche
            </p>
          </div>

          <EditProfileSkeleton />
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-20 max-w-3xl">
        <Button
          variant="ghost"
          onClick={handleSortie}
          className="mb-6 text-mcf-orange-dark hover:bg-mcf-amber/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à l'espace famille
        </Button>
        <LeaveFormDialog
          open={confirmationOuverte}
          onOpenChange={setConfirmationOuverte}
          onConfirm={confirmerSortie}
          variante="perte"
        />


        <div className="mb-8">
          <h1 className="text-3xl font-bold text-mcf-orange-dark mb-2">
            Modifier {firstName || 'le proche'}
          </h1>
          <p className="text-gray-600">
            Mettez à jour les informations de ce proche
          </p>
        </div>

        <Card className="p-6 space-y-6 border-mcf-mint">
          <EditAvatarHeader profileId={relativeId!} profileType="relative" profileName={firstName} initialAvatarUrl={avatarUrl} familyId={familyId} />

          <RelativeBasicInfoSection
            type={type}
            setType={setType}
            firstName={firstName}
            setFirstName={setFirstName}
            otherTypeName={otherTypeName}
            setOtherTypeName={setOtherTypeName}
            age={age}
            setAge={setAge}
            birthDate={birthDate}
            setBirthDate={setBirthDate}
            job={job}
            setJob={setJob}
            gender={gender}
            setGender={setGender}
          />

          <RelativeNicknameSection
            selectedNickname={selectedNickname}
            setSelectedNickname={setSelectedNickname}
            nicknameCustomValue={nicknameCustomValue}
            setNicknameCustomValue={setNicknameCustomValue}
            relativeType={type}
          />

          <RelativeAppearanceSection
            selectedSkinColor={selectedSkinColor}
            setSelectedSkinColor={setSelectedSkinColor}
            skinColorCustomValue={skinColorCustomValue}
            setSkinColorCustomValue={setSkinColorCustomValue}
            selectedEyeColor={selectedEyeColor}
            setSelectedEyeColor={setSelectedEyeColor}
            eyeColorCustomValue={eyeColorCustomValue}
            setEyeColorCustomValue={setEyeColorCustomValue}
            selectedHairColor={selectedHairColor}
            setSelectedHairColor={setSelectedHairColor}
            hairColorCustomValue={hairColorCustomValue}
            setHairColorCustomValue={setHairColorCustomValue}
            hairType={hairType}
            setHairType={setHairType}
            hairTypeCustom={hairTypeCustom}
            setHairTypeCustom={setHairTypeCustom}
            hairLength={hairLength}
            setHairLength={setHairLength}
            glasses={glasses}
            setGlasses={setGlasses}
            gender={gender}
            physicalDetails={physicalDetails}
            setPhysicalDetails={setPhysicalDetails}
            clothingStyle={clothingStyle}
            setClothingStyle={setClothingStyle}
            noPhysicalDetails={noPhysicalDetails}
            setNoPhysicalDetails={setNoPhysicalDetails}
          />

          <RelativeTraitsSection
            traits={traits}
            handleTraitToggle={handleTraitToggle}
            customTraits={customTraits}
            setCustomTraits={setCustomTraits}
            gender={gender}
          />

          {existingChildren.length > 0 && (
            <ChildrenSelector
              children={existingChildren}
              selectedChildrenIds={selectedChildrenIds}
              onToggleChild={handleToggleChild}
              label="Enfants associés à ce proche"
              estrangedChildIds={estrangedChildIds}
              onToggleEstrangement={handleToggleEstrangement}
            />
          )}

          {/* Statut du proche (décès) */}
          <div className="space-y-3 pt-4 border-t border-mcf-mint/40">
            <Label className="text-base font-medium">Statut</Label>
            <RadioGroup
              value={relativeStatus}
              onValueChange={(v) => handleStatusChange(v as RelativeStatus)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="active" id="relative-status-active" />
                <Label htmlFor="relative-status-active" className="cursor-pointer font-normal">Avec nous</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="deceased" id="relative-status-deceased" />
                <Label htmlFor="relative-status-deceased" className="cursor-pointer font-normal">Décédé</Label>
              </div>
            </RadioGroup>
            {relativeStatus === 'deceased' && (
              <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                <Heart className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                <span>
                  {firstName} n'apparaîtra plus dans les histoires ni les suggestions d'anniversaire. Vous pourrez revenir en arrière à tout moment.
                </span>
              </p>
            )}
          </div>
        </Card>

        <div className="flex flex-col gap-3 mt-8">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleSortie}
              className="flex-1"
            >
              Annuler
            </Button>
        <LeaveFormDialog
          open={confirmationOuverte}
          onOpenChange={setConfirmationOuverte}
          onConfirm={confirmerSortie}
          variante="perte"
        />

            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-mcf-primary hover:bg-mcf-primary/90 text-white"
            >
              {saving ? 'Sauvegarde...' : 'Enregistrer les modifications'}
            </Button>
          </div>
        </div>

        {/* Confirmation décès (action sensible) */}
        <Dialog open={pendingDeceased} onOpenChange={(o) => { if (!o) setPendingDeceased(false); }}>
          <DialogContent className="bg-white max-w-sm">
            <div className="text-center space-y-4 py-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-mcf-mint/20 flex items-center justify-center">
                <Heart className="h-6 w-6 text-mcf-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-mcf-orange-dark">
                  Marquer « {firstName} » comme décédé ?
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Il restera en mémoire dans vos données, mais n'apparaîtra plus dans les histoires ni les suggestions. Vous pourrez revenir en arrière à tout moment.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setPendingDeceased(false)}>
                  Annuler
                </Button>
                <Button
                  className="flex-1 bg-mcf-primary hover:bg-mcf-primary-dark text-white"
                  onClick={() => { setRelativeStatus('deceased'); setPendingDeceased(false); }}
                >
                  Confirmer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
      
      <Footer />
    </div>
  );
};

export default ModifierProche;
