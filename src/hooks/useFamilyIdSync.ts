import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

/**
 * Hook pour synchroniser automatiquement le family_id du user_profile
 * avec celui des enfants existants
 */
export const useFamilyIdSync = () => {
  const { supabaseSession } = useAuth();

  useEffect(() => {
    const syncFamilyId = async () => {
      if (!supabaseSession?.user?.id) return;

      const userId = supabaseSession.user.id;

      try {
        // 1. Vérifier le family_id actuel dans user_profiles
        const { data: userProfile, error: profileError } = await supabase
          .from('user_profiles')
          .select('family_id')
          .eq('id', userId)
          .maybeSingle();

        if (profileError) {
          console.error('Erreur lors de la récupération du profil:', profileError);
          return;
        }

        // Si le user a déjà un family_id, pas besoin de synchroniser
        if (userProfile?.family_id) {
          console.log('family_id déjà défini:', userProfile.family_id);
          return;
        }

        // 2. Chercher un enfant existant avec un family_id depuis child_profiles
        const { data: childProfiles, error: childError } = await supabase
          .from('child_profiles')
          .select('family_id')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (childError) {
          console.error('Erreur lors de la récupération des enfants:', childError);
          return;
        }

        // 3. Extraire le family_id du premier enfant trouvé
        const familyIdFromChild = childProfiles?.family_id || null;

        // 4. Si un family_id a été trouvé, synchroniser le user_profile
        if (familyIdFromChild) {
          const { error: updateError } = await supabase
            .from('user_profiles')
            .update({ family_id: familyIdFromChild })
            .eq('id', userId);

          if (updateError) {
            console.error('Erreur lors de la synchronisation du family_id:', updateError);
          } else {
            console.log('✅ family_id synchronisé depuis l\'enfant:', familyIdFromChild);
          }
        } else {
          console.log('Aucun family_id trouvé dans les enfants existants');
        }
      } catch (error) {
        console.error('Erreur lors de la synchronisation du family_id:', error);
      }
    };

    syncFamilyId();
  }, [supabaseSession?.user?.id]);
};
