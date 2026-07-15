// useFamilyData v2.1
// Changelog v2.1 : (a) refetchOnMount 'always' → l'enfant/entités fraîchement créés apparaissent
// sans F5 au retour sur l'espace famille ; (b) refetchInterval conditionnel → tant qu'au moins un
// avatar est manquant (profil venant d'être créé, image générée avec un délai côté n8n),
// la query se rafraîchit toutes les 8 s, puis s'arrête d'elle-même quand tous les avatars sont là.
// Remplace le polling par-carte (peu fiable). N'tourne que si l'espace famille est monté.
// Changelog v2.0 : BUG CORRIGÉ — relatives/pets/toys étaient chargés family-wide et assignés
// IDENTIQUES à chaque enfant (au lieu d'être filtrés par les vraies jonctions), contrairement à
// places qui était déjà correct. Chaque enfant n'affiche désormais que SES proches/animaux/
// doudous réels, via child_family_members/child_pets/comforters.child_id (respectivement).
// Adaptation au nouveau schéma doudou : comforters.child_id direct, plus de jonction
// child_comforters (1 doudou = 1 enfant).
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const FAMILY_DATA_KEY = 'family-data';

const calculateExactAge = (birthDate: string | Date) => {
  if (!birthDate) return '';
  const today = new Date();
  const birth = new Date(birthDate);
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  const days = today.getDate() - birth.getDate();
  if (days < 0) months--;
  if (months < 0) { years--; months += 12; }
  let ageString = "";
  if (years > 0) {
    ageString += `${years} an${years > 1 ? 's' : ''}`;
    if (months > 0) ageString += ` et ${months} mois`;
  } else if (months > 0) {
    ageString = `${months} mois`;
  } else {
    ageString = "moins d'un mois";
  }
  return ageString;
};

export interface FamilyChild {
  id: string;
  firstName: string;
  age: string;
  gender: string | null;
  avatar: string | null;
  personalityEmoji: string;
  relatives: any[];
  pets: any[];
  places: any[];
  toys: any[];
  toysCount: number;
  preferencesCount: number;
  hasPets: number;
  birthDate: string | null;
  isDeceased: boolean;
  siblings: Array<{ id: string; firstName: string; avatar_url: string | null; is_deceased?: boolean }>;
  estrangedRelativeIds: string[];
}

async function fetchFamilyData(userId: string): Promise<FamilyChild[]> {
  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('family_id')
    .eq('id', userId)
    .maybeSingle();

  // Fetch family-wide : uniquement les enfants (pour les fratries). Relatives/pets/toys sont
  // désormais chargés PAR ENFANT via leurs jonctions respectives (comme places l'était déjà) —
  // corrige le bug où tous les enfants d'une même famille affichaient les MÊMES proches/animaux/
  // doudous, qu'ils y soient réellement liés ou non.
  const familyId = userProfile?.family_id;
  const { data: siblingProfiles } = familyId
    ? await supabase
        .from('child_profiles')
        .select('id, first_name, avatar_url, birth_date, is_deceased')
        .eq('family_id', familyId)
    : { data: [] as any[] };

  const baseSelect = `id, first_name, birth_date, gender, created_at, family_id, user_id, avatar_url, is_deceased`;

  const qByUser = supabase.from('child_profiles').select(baseSelect).eq('user_id', userId);
  const qByFamily = userProfile?.family_id
    ? supabase.from('child_profiles').select(baseSelect).eq('family_id', userProfile.family_id)
    : null;

  const [{ data: byUser }, famRes] = await Promise.all([
    qByUser.order('created_at', { ascending: false }),
    qByFamily ? qByFamily.order('created_at', { ascending: false }) : Promise.resolve({ data: [], error: null }),
  ] as const);

  const byFamily = famRes?.data as any[] | undefined;
  const rows = [...(byFamily || []), ...(byUser || [])];
  const seen = new Set<string>();
  const uniqueRows = rows.filter(r => (seen.has(r.id) ? false : (seen.add(r.id), true)));

  const children: FamilyChild[] = uniqueRows.map((profile: any) => ({
    id: profile.id,
    firstName: profile.first_name || 'Enfant',
    age: profile.birth_date ? calculateExactAge(profile.birth_date) : '',
    gender: profile.gender || null,
    avatar: profile.avatar_url || null,
    personalityEmoji: '🧒',
    relatives: [],
    pets: [],
    places: [],
    toys: [],
    toysCount: 0,
    preferencesCount: 0,
    hasPets: 0,
    birthDate: profile.birth_date || null,
    isDeceased: profile.is_deceased ?? false,
    siblings: (siblingProfiles || [])
      .filter((s: any) => s.id !== profile.id)
      .map((s: any) => ({
        id: s.id,
        firstName: s.first_name,
        avatar_url: s.avatar_url,
        is_deceased: s.is_deceased ?? false,
      })),
    estrangedRelativeIds: [],
  }));

  await Promise.all(
    uniqueRows.map(async (profile: any, index: number) => {
      try {
        const [{ data: childPlaces }, superpowersRes, likesRes, challengesRes, universesRes, discoveriesRes, { data: childRelativeLinks }, { data: childPetLinks }, { data: childToys }] = await Promise.all([
          supabase.from('child_places').select(`label, places:place_id (id, label, type, emoji, address, city, country, description, details, is_active)`).eq('child_id', profile.id),
          supabase.from('child_superpowers').select('superpowers(label, emoji)').eq('child_id', profile.id),
          supabase.from('child_likes').select('likes(label, emoji)').eq('child_id', profile.id),
          supabase.from('child_challenges').select('challenges(label, emoji)').eq('child_id', profile.id),
          supabase.from('child_universes').select('universes(label, emoji)').eq('child_id', profile.id),
          supabase.from('child_discoveries').select('discoveries(label, emoji)').eq('child_id', profile.id),
          supabase.from('child_family_members').select('family_member_id, is_active, family_members(id, name, role, avatar_url, details, is_deceased)').eq('child_id', profile.id),
          supabase.from('child_pets').select('pet_id, pets(id, name, type, emoji, avatar_url, breed, is_deceased, is_active, inactive_reason)').eq('child_id', profile.id),
          // Nouveau schéma : 1 doudou = 1 enfant, child_id direct sur comforters (plus de jonction)
          supabase.from('comforters').select('id, label, emoji, avatar_url, is_active, appearance, roles, relation_label').eq('child_id', profile.id),
        ]);

        const prefsTotal = (superpowersRes.data?.length || 0) + (likesRes.data?.length || 0) + (challengesRes.data?.length || 0) + (universesRes.data?.length || 0) + (discoveriesRes.data?.length || 0);

        const placesEnriched = (childPlaces || []).map((cp: any) => {
          const placeInfo = cp.places;
          if (!placeInfo) return null;
          return { id: placeInfo.id, label: placeInfo.label, type: placeInfo.type, emoji: placeInfo.emoji, address: placeInfo.address, city: placeInfo.city, country: placeInfo.country, description: placeInfo.description, details: placeInfo.details, is_active: placeInfo.is_active ?? true };
        }).filter((p: any) => p && p.type !== 'destination_libre');

        const estrangedRelativeIds = (childRelativeLinks || [])
          .filter((l: any) => l.is_active === false)
          .map((l: any) => l.family_member_id);

        const relativesEnriched = (childRelativeLinks || []).map((link: any) => {
          const fm = link.family_members;
          if (!fm) return null;
          return {
            id: fm.id,
            firstName: fm.name,
            type: fm.role,
            nickname: null,
            avatar_url: fm.avatar_url,
            is_deceased: fm.is_deceased ?? false,
          };
        }).filter(Boolean);

        const petsEnriched = (childPetLinks || []).map((link: any) => {
          const p = link.pets;
          if (!p) return null;
          return {
            id: p.id,
            name: p.name,
            type: p.type,
            emoji: p.emoji,
            avatar_url: p.avatar_url,
            is_deceased: p.is_deceased ?? false,
            is_active: p.is_active ?? true,
            inactive_reason: p.inactive_reason ?? null,
          };
        }).filter(Boolean);

        const toysEnriched = (childToys || []).map((c: any) => ({
          id: c.id,
          name: c.label,
          type: c.relation_label || 'plush',
          appearance: c.appearance || '',
          roles: c.roles ? String(c.roles).split(',').map((r: string) => r.trim()).filter(Boolean) : [],
          emoji: c.emoji,
          avatar_url: c.avatar_url,
          is_active: c.is_active ?? true,
        }));

        children[index] = {
          ...children[index],
          places: placesEnriched,
          relatives: relativesEnriched,
          pets: petsEnriched,
          hasPets: petsEnriched.length,
          toys: toysEnriched,
          toysCount: toysEnriched.length,
          preferencesCount: prefsTotal,
          estrangedRelativeIds,
        };
      } catch (e) {
        console.error('Error enriching child data', e);
      }
    })
  );

  return children;
}

// Un avatar est « attendu » tant qu'une entité VISIBLE (active) n'a pas d'avatar_url. On ignore les
// entités inactives (décédées / perdues / brouillées) pour ne pas boucler sur des cas légitimes.
function hasMissingAvatar(children: FamilyChild[] | undefined): boolean {
  if (!children || children.length === 0) return false;
  return children.some((child) =>
    (!child.isDeceased && !child.avatar) ||
    (child.relatives || []).some((r: any) => r?.is_deceased !== true && !r?.avatar_url) ||
    (child.pets || []).some((p: any) => p?.is_deceased !== true && p?.is_active !== false && !p?.avatar_url) ||
    (child.toys || []).some((t: any) => t?.is_active !== false && !t?.avatar_url)
  );
}

export function useFamilyData() {
  const { supabaseSession } = useAuth();
  const userId = supabaseSession?.user?.id;

  return useQuery({
    queryKey: [FAMILY_DATA_KEY, userId],
    queryFn: () => fetchFamilyData(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    // Rafraîchit à chaque arrivée sur l'espace famille (retour depuis l'abonnement après création,
    // etc.) → l'enfant et les entités fraîchement créés apparaissent sans F5.
    refetchOnMount: 'always',
    // Tant qu'un avatar manque (image générée avec un délai côté n8n), on refetch toutes les 8 s ;
    // dès que tous les avatars visibles sont là, on s'arrête. Ne tourne que si l'espace famille est
    // monté (pas de refetch en arrière-plan).
    refetchInterval: (query) => (hasMissingAvatar(query.state.data as FamilyChild[] | undefined) ? 8000 : false),
    refetchIntervalInBackground: false,
  });
}

export function useInvalidateFamilyData() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: [FAMILY_DATA_KEY] });
}
