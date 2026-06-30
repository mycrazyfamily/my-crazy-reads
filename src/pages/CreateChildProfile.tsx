import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { signalAvatarRegeneration } from '@/utils/avatarRegenerationSignal';
import FormSteps from '@/components/childProfile/FormSteps';
import { ChildProfileFormProvider } from '@/contexts/ChildProfileFormContext';
import { useChildProfileSubmit } from '@/hooks/useChildProfileSubmit';
import 'react-datepicker/dist/react-datepicker.css';
import type { ChildProfileFormData } from '@/types/childProfile';
import { CHALLENGES_OPTIONS } from '@/constants/childProfileOptions';
import { FAVORITE_WORLDS_OPTIONS, DISCOVERY_OPTIONS } from '@/constants/worldOptions';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Heart, Loader2 } from 'lucide-react';

// --- Signature d'apparence avatar (gate de régénération) ---------------------
function normalizePhysList(raw: any): string[] {
  let v: any = raw;
  for (let i = 0; i < 3 && typeof v === 'string'; i++) {
    const str = v.trim();
    if (!str) return [];
    try { v = JSON.parse(str); } catch { return [str]; }
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
function normalizeClothing(raw: any): string {
  let v: any = raw;
  for (let i = 0; i < 3 && typeof v === 'string'; i++) {
    const str = v.trim();
    if (!str) return '';
    try { v = JSON.parse(str); } catch { return str; }
  }
  if (Array.isArray(v)) return String(v[0] ?? '').trim();
  if (typeof v === 'string') return v.trim();
  return '';
}
function ymdLocal(d: any): string {
  if (!d) return '';
  const dt = (d instanceof Date) ? d : new Date(d);
  if (isNaN(dt.getTime())) return (typeof d === 'string' ? d.slice(0, 10) : '');
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function colorSig(c: any): [string, string] {
  if (!c) return ['', ''];
  if (typeof c === 'string') return [c, ''];
  return [String(c.type ?? ''), String(c.custom ?? '')];
}
function childAvatarSig(input: {
  skinColor: any; eyeColor: any; hairColor: any;
  hairType: any; hairTypeCustom: any; glasses: any;
  physicalDetails: any; clothingStyle: any; birthDate: any;
}): string {
  return JSON.stringify({
    skin: colorSig(input.skinColor),
    eye: colorSig(input.eyeColor),
    hairColor: colorSig(input.hairColor),
    hairType: String(input.hairType ?? ''),
    hairTypeCustom: String(input.hairTypeCustom ?? '').trim(),
    glasses: !!input.glasses,
    phys: normalizePhysList(input.physicalDetails),
    clothing: normalizeClothing(input.clothingStyle),
    birth: ymdLocal(input.birthDate),
  });
}

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
  
  // Protection contre la double soumission
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [originalBirthDate, setOriginalBirthDate] = React.useState<string | null>(null);
  // Signature d'apparence au chargement : ne régénère l'avatar que si le visuel change
  const initialAvatarSigRef = React.useRef<string>('');
  // Statut de l'enfant (décès) — mode édition uniquement
  const [childFirstName, setChildFirstName] = React.useState<string>('');
  const [isDeceased, setIsDeceased] = React.useState<boolean>(false);
  const [initialIsDeceased, setInitialIsDeceased] = React.useState<boolean>(false);
  const [savingStatus, setSavingStatus] = React.useState(false);
  const [statusOpen, setStatusOpen] = React.useState(false);
  const queryClient = useQueryClient();

  // Charger birth_date + apparence + statut une seule fois à l'ouverture en mode édition
  React.useEffect(() => {
    if (editMode && editChildId) {
      (async () => {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data } = await supabase
          .from('child_profiles')
          .select('birth_date, appearance, physical_details, clothing_style, first_name, is_deceased')
          .eq('id', editChildId)
          .maybeSingle();
        setOriginalBirthDate(data?.birth_date || null);
        const ap: any = (data?.appearance as any) || {};
        initialAvatarSigRef.current = childAvatarSig({
          skinColor: ap.skinColor,
          eyeColor: ap.eyeColor,
          hairColor: ap.hairColor,
          hairType: ap.hairType,
          hairTypeCustom: ap.hairTypeCustom,
          glasses: ap.glasses,
          physicalDetails: data?.physical_details,
          clothingStyle: data?.clothing_style,
          birthDate: data?.birth_date,
        });
        setChildFirstName(data?.first_name || '');
        setIsDeceased(!!data?.is_deceased);
        setInitialIsDeceased(!!data?.is_deceased);
      })();
    }
  }, [editMode, editChildId]);

  // Écrit is_deceased ; le trigger DB renseigne deceased_recorded_at automatiquement.
  // L'abonnement Stripe n'est PAS résilié ici : le parent le gère lui-même à son rythme.
  const persistStatus = async (deceased: boolean) => {
    if (!editChildId) return;
    setSavingStatus(true);
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { error } = await supabase
        .from('child_profiles')
        .update({ is_deceased: deceased })
        .eq('id', editChildId);
      if (error) throw error;
      setInitialIsDeceased(deceased);
      setIsDeceased(deceased);
      queryClient.invalidateQueries({ queryKey: ['family-data'] });
      queryClient.invalidateQueries({ queryKey: ['book-timeline'] });
      toast.success(
        deceased
          ? `Le statut de ${childFirstName || "l'enfant"} a été mis à jour.`
          : `Le profil de ${childFirstName || "l'enfant"} est de nouveau actif.`
      );
      setStatusOpen(false);
      setTimeout(() => { navigate('/espace-famille', { replace: true }); }, 600);
    } catch (e: any) {
      toast.error(`Une erreur est survenue : ${e?.message || 'Erreur inconnue'}`);
    } finally {
      setSavingStatus(false);
    }
  };
  
  const handleFormSubmit = async (data: ChildProfileFormData) => {
    if (isSubmitting) {
      console.log('⚠️ Submission already in progress, ignoring duplicate');
      return;
    }
    
    console.log('🎯 [FORM-SUBMIT] Starting form submission');
    console.log('🎯 [FORM-SUBMIT] Edit mode:', editMode, 'Edit child ID:', editChildId);
    console.log('🎯 [FORM-SUBMIT] Form data:', JSON.stringify(data, null, 2));
    
    setIsSubmitting(true);
    if (editMode && editChildId) {
      // Mode édition : mettre à jour le profil existant dans child_profiles
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        
        console.log('🔄 Mode édition - Données reçues du formulaire:', {
          superpowers: data.superpowers,
          passions: data.passions,
          challenges: data.challenges,
          favoriteWorlds: data.worlds?.favoriteWorlds,
          discoveries: data.worlds?.discoveries
        });
        
        // Mettre à jour child_profiles
        console.log('[SAVE] clothing_style value before update:', data.clothingStyle);
        
        const { error: updateError } = await supabase
          .from('child_profiles')
          .update({
            first_name: data.firstName.trim(),
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
            physical_details: data.noPhysicalDetails 
              ? [''] 
              : (data.physicalDetails && data.physicalDetails.length > 0 
                ? data.physicalDetails 
                : []),
            clothing_style: data.clothingStyle 
              ? JSON.stringify([data.clothingStyle]) 
              : JSON.stringify([]),
            updated_at: new Date().toISOString()
          })
          .eq('id', editChildId);

        console.log('[SAVE] Supabase response:', updateError ? updateError.message : '✅ success');
        
        if (updateError) throw updateError;
        
        // Mettre à jour les relations (sélections multiples)
        // Supprimer puis réinsérer pour simplifier (et vérifier les erreurs RLS)
        const deleteResults = await Promise.all([
          supabase.from('child_superpowers').delete().eq('child_id', editChildId),
          supabase.from('child_likes').delete().eq('child_id', editChildId),
          supabase.from('child_challenges').delete().eq('child_id', editChildId),
          supabase.from('child_universes').delete().eq('child_id', editChildId),
          supabase.from('child_discoveries').delete().eq('child_id', editChildId),
        ] as const);

        const deleteErrors = deleteResults.map(r => r.error).filter(Boolean);
        if (deleteErrors.length) {
          console.error('❌ Pivot delete errors:', deleteErrors);
          throw deleteErrors[0];
        }
        // Utils de nettoyage
        const uniq = <T,>(arr: T[]) => Array.from(new Set((arr || []).filter(Boolean)));
        const top3 = (arr: string[]) => uniq(arr).slice(0, 3);

        // Super-pouvoirs (max 3)
        const selectedSP = top3(data.superpowers || []);
        if (selectedSP.length) {
          const { data: sp, error: spLookupError } = await supabase
            .from('superpowers')
            .select('id, value')
            .in('value', selectedSP);
          if (!spLookupError && sp?.length) {
            await supabase.from('child_superpowers').insert(
              sp.map(s => ({ child_id: editChildId, superpower_id: s.id }))
            );
          }
        }

        // Ce que l'enfant aime (likes) (max 3)
        const selectedLikes = top3(data.passions || []);
        if (selectedLikes.length) {
          const { data: likes, error: likesLookupError } = await supabase
            .from('likes')
            .select('id, value')
            .in('value', selectedLikes);
          if (!likesLookupError && likes?.length) {
            await supabase.from('child_likes').insert(
              likes.map(l => ({ child_id: editChildId, like_id: l.id }))
            );
          }
        }

        // Défis (max 3) (map value to label for DB lookup)
        const selectedChallenges = top3(data.challenges || []);
        if (selectedChallenges.length) {
          const challengeLabels = selectedChallenges
            .map(v => CHALLENGES_OPTIONS.find(o => o.value === v)?.label)
            .filter(Boolean) as string[];
          if (challengeLabels.length) {
            const { data: challenges, error: challengesLookupError } = await supabase
              .from('challenges')
              .select('id, label')
              .in('label', challengeLabels);
            if (!challengesLookupError && challenges?.length) {
              await supabase.from('child_challenges').insert(
                challenges.map(c => ({ child_id: editChildId, challenge_id: c.id }))
              );
            }
          }
        }

        // Univers favoris (max 3) (ignorer "Autre*")
        const worldsRaw = (data.worlds?.favoriteWorlds || []).filter(w => !String(w).startsWith('other'));
        const selectedWorlds = top3(worldsRaw.map(v => String(v)));
        if (selectedWorlds.length) {
          const labels = selectedWorlds.map(v => FAVORITE_WORLDS_OPTIONS.find(o => o.value === v)?.label || String(v));
          const { data: universes, error: universesLookupError } = await supabase
            .from('universes')
            .select('id, label')
            .in('label', labels);
          if (!universesLookupError && universes?.length) {
            await supabase.from('child_universes').insert(
              universes.map(u => ({ child_id: editChildId, universe_id: u.id }))
            );
          }
        }

        // Découvertes (ignorer "Autre*" et "nothing") - déduplication + limit à 3
        const discoveriesToAdd = top3(uniq((data.worlds?.discoveries || []).filter(d => !String(d).startsWith('other') && d !== 'nothing').map(d => String(d))));
        if (discoveriesToAdd.length) {
          const labels = discoveriesToAdd.map(v => DISCOVERY_OPTIONS.find(o => o.value === v)?.label || String(v));
          const { data: discoveries, error: discoveriesLookupError } = await supabase
            .from('discoveries')
            .select('id, label')
            .in('label', labels);
          if (!discoveriesLookupError && discoveries?.length) {
            await supabase.from('child_discoveries').insert(
              discoveries.map(d => ({ child_id: editChildId, discovery_id: d.id }))
            );
          }
        }

        // Gérer les doudous (comforters) - mise à jour et création
        if (data.toys?.toys && data.toys.toys.length > 0) {
          console.log('🧸 Updating/Creating comforters:', data.toys.toys);
          
          // Récupérer les liens existants dans child_comforters
          const { data: existingComforterLinks } = await supabase
            .from('child_comforters')
            .select('*')
            .eq('child_id', editChildId);
          
          // Pour chaque doudou dans le formulaire
          for (const toy of data.toys.toys) {
            console.log(`Processing toy: ${toy.name}, comforterId: ${toy.comforterId}, isActive: ${toy.isActive}`);
            
            if (toy.comforterId) {
              // CAS 1: Mise à jour d'un doudou existant
              // 1. Mettre à jour le statut isActive dans la table comforters
              const emoji = toy.type === 'plush' ? '🧸' : toy.type === 'blanket' ? '🧣' : toy.type === 'doll' ? '🧍' : toy.type === 'miniCar' ? '🚗' : toy.type === 'figurine' ? '🦸' : '✨';
              const { error: updateComforterError } = await supabase
                .from('comforters')
                .update({ 
                  is_active: toy.isActive !== false,
                  label: toy.name,
                  emoji,
                  updated_at: new Date().toISOString()
                })
                .eq('id', toy.comforterId);
              
              if (updateComforterError) {
                console.error('❌ Error updating comforter:', updateComforterError);
              }
              
              // 2. Mettre à jour les détails (appearance, roles) dans child_comforters
              const existingLink = existingComforterLinks?.find(link => link.comforter_id === toy.comforterId);
              
              if (existingLink) {
                const { error: updateLinkError } = await supabase
                  .from('child_comforters')
                  .update({
                    name: toy.name,
                    appearance: toy.appearance?.trim() || '',
                    roles: Array.isArray(toy.roles) ? toy.roles.join(',') : (toy.roles as any) || '',
                    relation_label: toy.type === 'other' ? (toy.otherType?.trim() || 'other') : toy.type
                  })
                  .eq('id', existingLink.id);
                
                if (updateLinkError) {
                  console.error('❌ Error updating child_comforters:', updateLinkError);
                } else {
                  console.log(`✅ Updated comforter details for ${toy.name}`);
                }
              }
            } else {
              // CAS 2: Création d'un nouveau doudou
              console.log(`🆕 Creating new comforter: ${toy.name}`);
              const emoji = toy.type === 'plush' ? '🧸' : toy.type === 'blanket' ? '🧣' : toy.type === 'doll' ? '🧍' : toy.type === 'miniCar' ? '🚗' : toy.type === 'figurine' ? '🦸' : '✨';
              
              // 1. Créer le comforter dans la table comforters
              const { supabase: supabaseClient } = await import('@/integrations/supabase/client');
              const userId = (await supabaseClient.auth.getUser()).data.user?.id;
              
              const { data: createdComforter, error: createComforterError } = await supabase
                .from('comforters')
                .insert([{
                  label: toy.name,
                  emoji,
                  created_by: userId,
                  is_active: toy.isActive !== false
                }])
                .select()
                .maybeSingle();
              
              if (createComforterError || !createdComforter) {
                console.error('❌ Error creating comforter:', createComforterError);
                continue;
              }
              
              console.log(`✅ Created comforter with ID: ${createdComforter.id}`);
              
              // 2. Créer le lien dans child_comforters
              const { error: createLinkError } = await supabase
                .from('child_comforters')
                .insert([{
                  child_id: editChildId,
                  comforter_id: createdComforter.id,
                  name: toy.name,
                  appearance: toy.appearance?.trim() || '',
                  roles: Array.isArray(toy.roles) ? toy.roles.join(',') : (toy.roles as any) || '',
                  relation_label: toy.type === 'other' ? (toy.otherType?.trim() || 'other') : toy.type
                }]);
              
              if (createLinkError) {
                console.error('❌ Error creating child_comforters link:', createLinkError);
              } else {
                console.log(`✅ Created comforter link for ${toy.name}`);
              }
            }
          }
        }

        // Gérer les animaux (pets) - mise à jour
        if (data.pets?.pets && data.pets.pets.length > 0) {
          // Récupérer les liens existants
          const { data: existingLinks } = await supabase
            .from('child_pets')
            .select('*')
            .eq('child_id', editChildId);

          // Pour chaque animal dans le formulaire
          for (const pet of data.pets.pets) {
            const existingLink = existingLinks?.find(link => link.pet_id === pet.id);
            
            if (existingLink) {
              // Mettre à jour le lien existant
              await supabase
                .from('child_pets')
                .update({
                  name: pet.name,
                  traits: pet.traits?.join(', '),
                  relation_label: pet.type
                })
                .eq('id', existingLink.id);
            }
          }
        }

        // Gérer les lieux de vie (places) - création et mise à jour
        if (data.places?.places && data.places.places.length > 0) {
          console.log('📍 Saving places in edit mode:', data.places.places);
          
          // Récupérer le family_id et le user_id de l'enfant
          const { data: childData } = await supabase
            .from('child_profiles')
            .select('family_id, user_id')
            .eq('id', editChildId)
            .maybeSingle();
          
          if (!childData?.family_id) {
            console.error('❌ No family_id found for child');
            toast.error("Erreur : impossible de trouver la famille de l'enfant");
          } else {
            // DIFF (et non DELETE global) : préserve les created_at d'apparition
            // et ne déclenche pas le guard maison_principale. On n'insère que les
            // liens manquants ; le retrait d'un lieu se gère sur la page ModifierLieu.
            const { data: existingChildPlaces } = await supabase
              .from('child_places')
              .select('place_id')
              .eq('child_id', editChildId);
            const existingPlaceIds = new Set((existingChildPlaces || []).map((l: any) => l.place_id));
            
            // Pour chaque lieu dans le formulaire
            for (const place of data.places.places) {
              let placeId: string;
              
              if (place.id) {
                // CAS 1: Mise à jour d'un lieu existant
                console.log(`🔄 Updating existing place: ${place.label} (${place.id})`);
                const { error: updateError } = await supabase
                  .from('places')
                  .update({
                    label: place.label,
                    type: place.type,
                    description: place.description || null,
                    emoji: place.emoji || null,
                    address: place.address || null,
                    city: place.city || null,
                    country: place.country || null,
                    details: place.details || {},
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', place.id);
                
                if (updateError) {
                  console.error('❌ Error updating place:', updateError);
                  toast.warning(`Erreur lors de la mise à jour du lieu ${place.label}`);
                  continue;
                }
                
                placeId = place.id;
                console.log(`✅ Updated place: ${place.label}`);
              } else {
                // CAS 2: Création d'un nouveau lieu
                console.log(`🆕 Creating new place: ${place.label}`);
                const { data: createdPlace, error: createError } = await supabase
                  .from('places')
                  .insert([{
                    label: place.label,
                    type: place.type,
                    description: place.description || null,
                    emoji: place.emoji || null,
                    address: place.address || null,
                    city: place.city || null,
                    country: place.country || null,
                    details: place.details || {},
                    created_by: childData.user_id,
                    family_id: childData.family_id,
                    is_active: true
                  }])
                  .select()
                  .maybeSingle();
                
                if (createError || !createdPlace) {
                  console.error('❌ Error creating place:', createError);
                  toast.warning(`Erreur lors de la création du lieu ${place.label}`);
                  continue;
                }
                
                placeId = createdPlace.id;
                console.log(`✅ Created place: ${place.label} with ID: ${placeId}`);
              }
              
              // Créer le lien child_places (seulement s'il n'existe pas déjà)
              if (!existingPlaceIds.has(placeId)) {
                const { error: linkError } = await supabase
                  .from('child_places')
                  .insert([{
                    child_id: editChildId,
                    place_id: placeId,
                    label: place.childLabel || null
                  }]);
                
                if (linkError) {
                  console.error('❌ Error linking place to child:', linkError);
                  toast.warning(`Erreur lors de l'association du lieu ${place.label}`);
                } else {
                  existingPlaceIds.add(placeId);
                  console.log(`✅ Linked place ${place.label} to child`);
                }
              }
            }
            
            // Gérer les lieux existants sélectionnés (sans les créer dans places)
            const existingPlacesData = (data as any).existingPlacesData;
            if (existingPlacesData && existingPlacesData.length > 0) {
              console.log('📍 Linking existing places to child in edit mode:', existingPlacesData);
              
              for (const place of existingPlacesData) {
                if (existingPlaceIds.has(place.id)) continue;
                const { error: linkError } = await supabase
                  .from('child_places')
                  .insert([{
                    child_id: editChildId,
                    place_id: place.id,
                    label: null // Peut être enrichi plus tard
                  }]);
                
                if (linkError) {
                  console.error('❌ Error linking existing place:', linkError);
                  toast.warning(`Erreur lors de l'association du lieu ${place.label}`);
                } else {
                  existingPlaceIds.add(place.id);
                  console.log(`✅ Linked existing place ${place.label} to child`);
                }
              }
            }
          }
        }
        
        // L'avatar n'est régénéré QUE si un champ d'apparence a réellement changé
        // (éditer goûts, doudous, lieux… ne doit PAS relancer la fabrique d'avatar).
        const currentAvatarSig = childAvatarSig({
          skinColor: data.skinColor,
          eyeColor: data.eyeColor,
          hairColor: data.hairColor,
          hairType: data.hairType,
          hairTypeCustom: data.hairTypeCustom,
          glasses: data.glasses,
          physicalDetails: data.noPhysicalDetails ? [] : data.physicalDetails,
          clothingStyle: data.clothingStyle,
          birthDate: data.birthDate,
        });
        const avatarRelevantChanged = currentAvatarSig !== initialAvatarSigRef.current;

        if (avatarRelevantChanged) {
          // Récupérer l'avatar_url actuel avant de déclencher la regénération
          const { data: childRow } = await supabase
            .from('child_profiles')
            .select('avatar_url')
            .eq('id', editChildId)
            .maybeSingle();

          // Appel webhook pour regénérer l'avatar
          try {
            await fetch('https://mcf-automation-n8n.jnow9f.easypanel.host/webhook/edit-avatar-mcf', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                profile_id: editChildId,
                type: 'child',
                current_avatar_url: childRow?.avatar_url || null,
                previous_birth_date: originalBirthDate
              })
            });
          } catch (webhookErr) {
            console.error('Webhook avatar error:', webhookErr);
          }

          if (editChildId) signalAvatarRegeneration(editChildId);
        }

        // Message de succès général après toutes les mises à jour
        toast.success('Profil modifié avec succès !');
        queryClient.invalidateQueries({ queryKey: ['book-timeline'] });
        queryClient.invalidateQueries({ queryKey: ['family-data'] });
        
        // Petit délai pour laisser le toast s'afficher avant la navigation
        // Remplace l'entrée du formulaire dans l'historique pour que le bouton précédent du navigateur
        // ne ramène pas vers le profil édité après l'enregistrement.
        setTimeout(() => {
          navigate('/espace-famille', { replace: true });
        }, 500);
      } catch (error: any) {
        console.error('❌ [CREATE-CHILD] Error updating child profile:', error);
        console.error('❌ [CREATE-CHILD] Error details:', {
          message: error?.message,
          code: error?.code,
          details: error?.details,
          hint: error?.hint,
          stack: error?.stack
        });
        toast.error(`Une erreur est survenue lors de l'enregistrement: ${error?.message || 'Erreur inconnue'}`);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Mode création : utiliser la logique normale
      console.log('🚀 [CREATE-CHILD] Calling handleSubmit in creation mode');
      console.log('🚀 [CREATE-CHILD] Data being submitted:', JSON.stringify(data, null, 2));
      try {
        await handleSubmit(data);
      } catch (error: any) {
        console.error('❌ [CREATE-CHILD] Error in handleSubmit:', error);
        console.error('❌ [CREATE-CHILD] Error details:', {
          message: error?.message,
          code: error?.code,
          details: error?.details,
          hint: error?.hint,
          stack: error?.stack
        });
        toast.error(`Une erreur est survenue lors de l'enregistrement: ${error?.message || 'Erreur inconnue'}`);
      } finally {
        setIsSubmitting(false);
      }
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
            editChildId={editChildId}
            isSubmitting={isSubmitting}
          />
        </ChildProfileFormProvider>
      </div>

      {/* Déclencheur discret : le statut n'est pas affiché en permanence (évite l'anxiété) */}
      {editMode && editChildId && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => { setIsDeceased(initialIsDeceased); setStatusOpen(true); }}
            className="text-sm text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
          >
            Gérer le statut du profil
          </button>
        </div>
      )}

      {/* Modale unique : choix + rappel abonnement intégré, réversible */}
      <Dialog
        open={statusOpen}
        onOpenChange={(o) => {
          if (savingStatus) return;
          if (!o) setIsDeceased(initialIsDeceased);
          setStatusOpen(o);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-mcf-orange" />
              Statut du profil
            </DialogTitle>
            <DialogDescription>
              Indiquez si {childFirstName || "l'enfant"} est toujours avec vous.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <RadioGroup
              value={isDeceased ? 'deceased' : 'alive'}
              onValueChange={(v) => setIsDeceased(v === 'deceased')}
              className="gap-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="alive" id="status-alive" />
                <Label htmlFor="status-alive" className="cursor-pointer font-normal">
                  Avec nous
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="deceased" id="status-deceased" />
                <Label htmlFor="status-deceased" className="cursor-pointer font-normal">
                  Décédé
                </Label>
              </div>
            </RadioGroup>

            {isDeceased && !initialIsDeceased && (
              <div className="rounded-md bg-mcf-amber/10 border border-mcf-amber/20 px-3 py-2.5 text-sm text-gray-600 space-y-2">
                <p>
                  {childFirstName || 'Votre enfant'} sera conservé en mémoire et n'apparaîtra plus
                  dans la création de nouvelles histoires.
                </p>
                <p>
                  L'abonnement n'est pas résilié automatiquement : vous pourrez le faire à tout moment,
                  à votre rythme, depuis « Gérer mes abonnements ».
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
            <Button
              variant="ghost"
              onClick={() => { setIsDeceased(initialIsDeceased); setStatusOpen(false); }}
              disabled={savingStatus}
            >
              Annuler
            </Button>
            <Button
              onClick={() => persistStatus(isDeceased)}
              disabled={savingStatus || isDeceased === initialIsDeceased}
              className="bg-mcf-primary hover:bg-mcf-primary-dark text-white flex items-center gap-2"
            >
              {savingStatus ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateChildProfile;
