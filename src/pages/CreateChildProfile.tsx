
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import FormSteps from '@/components/childProfile/FormSteps';
import { ChildProfileFormProvider } from '@/contexts/ChildProfileFormContext';
import { useChildProfileSubmit } from '@/hooks/useChildProfileSubmit';
import 'react-datepicker/dist/react-datepicker.css';
import type { ChildProfileFormData } from '@/types/childProfile';

type CreateChildProfileProps = {
  isGiftMode?: boolean;
  familyCode?: string;
  nextPath?: string;
  initialStep?: number;
  editMode?: boolean;
  editChildId?: string;
  useSavedDraft?: boolean;
};

const CreateChildProfile = ({ 
  isGiftMode = false, 
  familyCode, 
  nextPath,
  initialStep,
  editMode = false,
  editChildId,
  useSavedDraft = true,
}: CreateChildProfileProps) => {
  const navigate = useNavigate();
  const { handleSubmit } = useChildProfileSubmit({ isGiftMode, nextPath });
  const location = useLocation();
  const locationState = location.state as { targetStep?: number } | null;
  
  const handleFormSubmit = async (data: ChildProfileFormData) => {
    if (editMode && editChildId) {
      // Mode édition : mettre à jour le profil existant dans child_profiles
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        
        // Mettre à jour child_profiles
        const { error: updateError } = await supabase
          .from('child_profiles')
          .update({
            first_name: data.firstName,
            nickname: data.nickname?.type === 'custom' ? data.nickname.custom : 
                     data.nickname?.type !== 'none' ? data.nickname?.type : null,
            birth_date: data.birthDate ? data.birthDate.toISOString().split('T')[0] : null,
            gender: data.gender,
            height: data.height,
            appearance: {
              skinColor: data.skinColor,
              eyeColor: data.eyeColor,
              hairColor: data.hairColor,
              hairType: data.hairType,
              hairTypeCustom: data.hairTypeCustom,
              glasses: data.glasses
            },
            updated_at: new Date().toISOString()
          })
          .eq('id', editChildId);

        if (updateError) throw updateError;
        
        // Mettre à jour les relations (traits, passions, challenges, etc.)
        // Supprimer puis réinsérer pour simplifier
        await supabase.from('child_traits').delete().eq('child_id', editChildId);
        await supabase.from('child_passions').delete().eq('child_id', editChildId);
        await supabase.from('child_challenges').delete().eq('child_id', editChildId);
        await supabase.from('child_universes').delete().eq('child_id', editChildId);
        await supabase.from('child_discoveries').delete().eq('child_id', editChildId);
        
        if (data.superpowers?.length) {
          await supabase.from('child_traits').insert(
            data.superpowers.map(t => ({ child_id: editChildId, trait_id: t }))
          );
        }
        if (data.passions?.length) {
          await supabase.from('child_passions').insert(
            data.passions.map(p => ({ child_id: editChildId, passion_id: p }))
          );
        }
        if (data.challenges?.length) {
          await supabase.from('child_challenges').insert(
            data.challenges.map(c => ({ child_id: editChildId, challenge_id: c }))
          );
        }
        if (data.worlds?.favoriteWorlds?.length) {
          await supabase.from('child_universes').insert(
            data.worlds.favoriteWorlds.map(w => ({ child_id: editChildId, universe_id: w }))
          );
        }
        if (data.worlds?.discoveries?.length) {
          await supabase.from('child_discoveries').insert(
            data.worlds.discoveries.map(d => ({ child_id: editChildId, discovery_id: d }))
          );
        }

        toast.success("Profil modifié avec succès !");
        navigate('/espace-famille');
      } catch (error) {
        console.error('Error updating child profile:', error);
        toast.error("Erreur lors de la mise à jour");
      }
    } else {
      // Mode création : utiliser la logique normale
      await handleSubmit(data);
    }
  };
  
  // Use either the prop or the location state
  const effectiveInitialStep = initialStep !== undefined ? initialStep : locationState?.targetStep;
  
  console.log("CreateChildProfile - effectiveInitialStep:", effectiveInitialStep);

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:max-w-4xl">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 text-mcf-orange-dark">
        {editMode ? "Modifier le profil de l'enfant" : (isGiftMode ? "Profil de l'enfant pour son livre cadeau 🎁" : "Créer le profil de l'enfant")}
      </h1>
      <p className="text-center text-gray-600 mb-8">
        {editMode 
          ? "Modifiez les informations de votre enfant pour mettre à jour son profil"
          : (isGiftMode 
            ? "Pour offrir une histoire vraiment personnalisée, remplissez ces informations sur l'enfant"
            : "Personnalisez l'aventure magique de votre enfant en nous parlant de lui/elle")
        }
      </p>

      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-mcf-mint">
        <ChildProfileFormProvider 
          familyCode={familyCode} 
          onSubmit={handleFormSubmit}
          initialStep={effectiveInitialStep}
          editMode={editMode}
          editChildId={editChildId}
          useSavedDraft={useSavedDraft}
        >
          <FormSteps 
            isGiftMode={isGiftMode} 
            nextButtonText={isGiftMode ? "Continuer vers le choix du thème →" : undefined}
            onFormSubmit={isGiftMode ? () => {} : undefined}
            editMode={editMode}
          />
        </ChildProfileFormProvider>
      </div>
    </div>
  );
};

export default CreateChildProfile;
