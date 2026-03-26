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
  avatar: string | null;
  personalityEmoji: string;
  relatives: any[];
  pets: any[];
  places: any[];
  toysCount: number;
  preferencesCount: number;
  hasPets: number;
  birthDate: string | null;
}

async function fetchFamilyData(userId: string): Promise<FamilyChild[]> {
  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('family_id')
    .eq('id', userId)
    .maybeSingle();

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
    avatar: profile.avatar_url || null,
    personalityEmoji: '🧒',
    relatives: [],
    pets: [],
    places: [],
    toysCount: 0,
    preferencesCount: 0,
    hasPets: 0,
    birthDate: profile.birth_date || null,
  }));

  await Promise.all(
    uniqueRows.map(async (profile: any, index: number) => {
      try {
        const [{ data: childPets }, { data: childFamilyMembers }, { data: childPlaces }, superpowersRes, likesRes, challengesRes, universesRes, discoveriesRes] = await Promise.all([
          supabase.from('child_pets').select(`name, traits, relation_label, pets:pet_id (id, name, type, breed, physical_details, emoji, avatar_url)`).eq('child_id', profile.id),
          supabase.from('child_family_members').select(`relation_label, family_members:family_member_id (id, name, role, avatar, avatar_url, details)`).eq('child_id', profile.id),
          supabase.from('child_places').select(`label, places:place_id (id, label, type, emoji, address, city, country, description, details)`).eq('child_id', profile.id),
          supabase.from('child_superpowers').select('superpowers(label, emoji)').eq('child_id', profile.id),
          supabase.from('child_likes').select('likes(label, emoji)').eq('child_id', profile.id),
          supabase.from('child_challenges').select('challenges(label, emoji)').eq('child_id', profile.id),
          supabase.from('child_universes').select('universes(label, emoji)').eq('child_id', profile.id),
          supabase.from('child_discoveries').select('discoveries(label, emoji)').eq('child_id', profile.id),
        ]);

        const prefsTotal = (superpowersRes.data?.length || 0) + (likesRes.data?.length || 0) + (challengesRes.data?.length || 0) + (universesRes.data?.length || 0) + (discoveriesRes.data?.length || 0);

        const petsEnriched = (childPets || []).map((cp: any) => {
          const petInfo = cp.pets;
          if (!petInfo) return null;
          return { id: petInfo.id, name: cp.name || petInfo.name, type: petInfo.type, breed: petInfo.breed, traits: cp.traits, relationLabel: cp.relation_label, emoji: petInfo.emoji, avatar_url: petInfo.avatar_url };
        }).filter(Boolean);

        const relativesEnriched = (childFamilyMembers || []).map((cfm: any) => {
          const fm = cfm.family_members;
          if (!fm) return null;
          return { id: fm.id, firstName: fm.name, type: fm.role, nickname: cfm.relation_label, avatar: fm.avatar, avatar_url: fm.avatar_url, details: fm.details };
        }).filter(Boolean);

        const placesEnriched = (childPlaces || []).map((cp: any) => {
          const placeInfo = cp.places;
          if (!placeInfo) return null;
          return { id: placeInfo.id, label: placeInfo.label, type: placeInfo.type, emoji: placeInfo.emoji, address: placeInfo.address, city: placeInfo.city, country: placeInfo.country, description: placeInfo.description, details: placeInfo.details };
        }).filter(Boolean);

        children[index] = {
          ...children[index],
          relatives: relativesEnriched,
          pets: petsEnriched,
          places: placesEnriched,
          preferencesCount: prefsTotal,
          hasPets: petsEnriched.length,
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
