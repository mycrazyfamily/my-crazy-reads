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
          .select('id, family_id')
          .eq('id', userId)
          .maybeSingle();

        if (profileError) {
          console.error('Erreur lors de la récupération du profil:', profileError);
          return;
        }

        // Créer le user_profile s'il n'existe pas
        if (!userProfile) {
          const { error: insertError } = await supabase
            .from('user_profiles')
            .insert({ id: userId })
            .select('id')
            .maybeSingle();
          if (insertError) {
            console.error('Erreur lors de la création du user_profile:', insertError);
            return;
          }
          console.log('✅ user_profile créé');
        }

        // Si le user a déjà un family_id, pas besoin de synchroniser
        if (userProfile?.family_id) {
          console.log('family_id déjà défini:', userProfile.family_id);
          return;
        }

        // 2. Chercher un enfant existant avec un family_id depuis child_profiles (user_id = user)
        const { data: childProfiles, error: childError } = await supabase
          .from('child_profiles')
          .select('family_id')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (childError) {
          console.error('Erreur lors de la récupération des enfants:', childError);
        }

        // 3. Extraire le family_id du premier enfant trouvé
        let familyIdFromAnySource = childProfiles?.family_id || null;

        // 4. Si toujours introuvable, tenter via families (created_by = user)
        if (!familyIdFromAnySource) {
          const { data: familyRow, error: familyError } = await supabase
            .from('families')
            .select('id')
            .eq('created_by', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          if (familyError) {
            console.error('Erreur lors de la récupération de la famille:', familyError);
          }
          if (familyRow?.id) {
            familyIdFromAnySource = familyRow.id;
            console.log('✅ family_id récupéré depuis families.created_by:', familyIdFromAnySource);
          }
        }

        // 5. Synchroniser le user_profile si on a un family_id
        if (familyIdFromAnySource) {
          const { error: updateError } = await supabase
            .from('user_profiles')
            .update({ family_id: familyIdFromAnySource })
            .eq('id', userId);

          if (updateError) {
            console.error('Erreur lors de la synchronisation du family_id:', updateError);
          } else {
            console.log('✅ family_id synchronisé:', familyIdFromAnySource);
          }
        } else {
          console.log('Aucun family_id trouvé ni via child_profiles ni via families');
        }
      } catch (error) {
        console.error('Erreur lors de la synchronisation du family_id:', error);
      }
    };

    syncFamilyId();
  }, [supabaseSession?.user?.id]);
};
