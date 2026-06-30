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
  toysCount: number;
  preferencesCount: number;
  hasPets: number;
  birthDate: string | null;
  siblings: Array<{ id: string; firstName: string; avatar_url: string | null }>;
}

async function fetchFamilyData(userId: string): Promise<FamilyChild[]> {
  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('family_id')
    .eq('id', userId)
    .maybeSingle();

  // Global family-level fetch: ALL members & pets of the family
  const familyId = userProfile?.family_id;
  const [{ data: allFamilyMembers }, { data: allFamilyPets }, { data: siblingProfiles }] = await Promise.all([
    familyId
      ? supabase
          .from('family_members')
          .select('id, name, role, avatar_url, details, is_deceased')
          .eq('family_id', familyId)
      : Promise.resolve({ data: [] as any[], error: null }),
    familyId
      ? supabase
          .from('pets')
          .select('id, name, type, emoji, avatar_url, breed, is_deceased, is_active, inactive_reason')
          .eq('family_id', familyId)
      : Promise.resolve({ data: [] as any[], error: null }),
    familyId
      ? supabase
          .from('child_profiles')
          .select('id, first_name, avatar_url, birth_date')
          .eq('family_id', familyId)
      : Promise.resolve({ data: [] as any[], error: null }),
  ] as const);

  const baseSelect = `id, first_name, birth_date, gender, created_at, family_id, user_id, avatar_url`;

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
    relatives: (allFamilyMembers || []).map((fm: any) => ({
      id: fm.id,
      firstName: fm.name,
      type: fm.role,
      nickname: null,
      avatar_url: fm.avatar_url,
      is_deceased: fm.is_deceased ?? false,
    })),
    pets: (allFamilyPets || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      type: p.type,
      emoji: p.emoji,
      avatar_url: p.avatar_url,
      is_deceased: p.is_deceased ?? false,
      is_active: p.is_active ?? true,
      inactive_reason: p.inactive_reason ?? null,
    })),
    places: [],
    toysCount: 0,
    preferencesCount: 0,
    hasPets: (allFamilyPets || []).length,
    birthDate: profile.birth_date || null,
    siblings: (siblingProfiles || [])
      .filter((s: any) => s.id !== profile.id)
      .map((s: any) => ({
        id: s.id,
        firstName: s.first_name,
        avatar_url: s.avatar_url,
      })),
  }));

  await Promise.all(
    uniqueRows.map(async (profile: any, index: number) => {
      try {
        const [{ data: childPlaces }, superpowersRes, likesRes, challengesRes, universesRes, discoveriesRes] = await Promise.all([
          supabase.from('child_places').select(`label, places:place_id (id, label, type, emoji, address, city, country, description, details, is_active)`).eq('child_id', profile.id),
          supabase.from('child_superpowers').select('superpowers(label, emoji)').eq('child_id', profile.id),
          supabase.from('child_likes').select('likes(label, emoji)').eq('child_id', profile.id),
          supabase.from('child_challenges').select('challenges(label, emoji)').eq('child_id', profile.id),
          supabase.from('child_universes').select('universes(label, emoji)').eq('child_id', profile.id),
          supabase.from('child_discoveries').select('discoveries(label, emoji)').eq('child_id', profile.id),
        ]);

        const prefsTotal = (superpowersRes.data?.length || 0) + (likesRes.data?.length || 0) + (challengesRes.data?.length || 0) + (universesRes.data?.length || 0) + (discoveriesRes.data?.length || 0);

        const placesEnriched = (childPlaces || []).map((cp: any) => {
          const placeInfo = cp.places;
          if (!placeInfo) return null;
          return { id: placeInfo.id, label: placeInfo.label, type: placeInfo.type, emoji: placeInfo.emoji, address: placeInfo.address, city: placeInfo.city, country: placeInfo.country, description: placeInfo.description, details: placeInfo.details };
        }).filter((p: any) => p && p.type !== 'destination_libre');

        children[index] = {
          ...children[index],
          places: placesEnriched,
          preferencesCount: prefsTotal,
        };
      } catch (e) {
        console.error('Error enriching child data', e);
      }
    })
  );

  return children;
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
  });
}

export function useInvalidateFamilyData() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: [FAMILY_DATA_KEY] });
}
