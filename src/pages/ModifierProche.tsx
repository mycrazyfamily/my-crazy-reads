import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from 'lucide-react';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { signalAvatarRegeneration } from '@/utils/avatarRegenerationSignal';
import { useInvalidateFamilyData } from '@/hooks/useFamilyData';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RelativeBasicInfoSection from '@/components/childProfile/relatives/RelativeBasicInfoSection';
import RelativeNicknameSection from '@/components/childProfile/relatives/RelativeNicknameSection';
import RelativeAppearanceSection from '@/components/childProfile/relatives/RelativeAppearanceSection';
import RelativeTraitsSection from '@/components/childProfile/relatives/RelativeTraitsSection';
import ChildrenSelector from '@/components/childProfile/ChildrenSelector';
import type { RelativeType, RelativeGender } from '@/types/childProfile';
import ResetAvatarButton from '@/components/familyDashboard/ResetAvatarButton';

const ModifierProche: React.FC = () => {
  const navigate = useNavigate();
  const { childId, relativeId } = useParams<{ childId: string; relativeId: string }>();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [childData, setChildData] = useState<any>(null);
  const [existingChildren, setExistingChildren] = useState<Array<{ id: string; first_name: string }>>([]);
  const [selectedChildrenIds, setSelectedChildrenIds] = useState<string[]>([]);
  
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
  const [selectedHairColor, setSelectedHairColor] = useState('brown');
  const [hairColorCustomValue, setHairColorCustomValue] = useState<string | undefined>(undefined);
  const [hairType, setHairType] = useState('straight');
  const [hairTypeCustom, setHairTypeCustom] = useState('');
  const [glasses, setGlasses] = useState(false);
  
  // Traits
  const [traits, setTraits] = useState<string[]>([]);
  const [customTraits, setCustomTraits] = useState<Record<string, string>>({});
  const [physicalDetails, setPhysicalDetails] = useState<string[]>([]);
  const [noPhysicalDetails, setNoPhysicalDetails] = useState<boolean>(false);
  const [clothingStyle, setClothingStyle] = useState<string>('');

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
              family_id,
              details,
              physical_details,
              clothing_style
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
          .select('id, name, role, avatar, family_id, details, physical_details, clothing_style')
          .eq('id', relativeId)
          .maybeSingle();
        if (relErr) throw relErr;
        relative = relativeDirect;
      }

      if (relative) {
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
        if (birthDateRaw) {
          try {
            setBirthDate(new Date(birthDateRaw));
            setOriginalBirthDate(typeof birthDateRaw === 'string' ? birthDateRaw : new Date(birthDateRaw).toISOString().split('T')[0]);
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

        const hairColorType = details.hairColor?.type || 'brown';
        setSelectedHairColor(hairColorType);
        setHairColorCustomValue(details.hairColor?.custom || undefined);

        setHairType(details.hairType || 'straight');
        setHairTypeCustom(details.hairTypeCustom || '');
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

        setChildData({ loaded: true });

        // Charger tous les enfants de la famille
        const { data: childrenData, error: childrenError } = await supabase
          .from('child_profiles')
          .select('id, first_name')
          .eq('family_id', relative.family_id)
          .order('first_name');

        if (childrenError) throw childrenError;
        setExistingChildren(childrenData || []);

        // Charger les enfants liés à ce proche
        const { data: linkedChildren, error: linkedError } = await supabase
          .from('child_family_members')
          .select('child_id')
          .eq('family_member_id', relativeId);

        if (linkedError) throw linkedError;
        setSelectedChildrenIds(linkedChildren?.map(c => c.child_id) || []);
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
  };

  const handleSave = async () => {
    if (!childData) return;

    // Validation des champs obligatoires
    const errors: string[] = [];

    if (!firstName?.trim()) errors.push("le prénom");
    if (!type) errors.push("le type de relation");
    if (type === 'other' && !otherTypeName?.trim()) {
      errors.push("la description du type de relation personnalisé");
    }
    
    // Gender must always be male or female
    if (gender !== 'male' && gender !== 'female') {
      errors.push("le genre (Homme / Femme)");
    }
    
    // Couleur de peau
    if (!selectedSkinColor) errors.push("la couleur de peau");
    if (selectedSkinColor === 'custom' && !skinColorCustomValue?.trim()) {
      errors.push("la couleur de peau personnalisée");
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

    // Vérifier les détails physiques : au moins un détail OU la case "aucun détail" cochée
    const hasPhysicalDetails = physicalDetails.length > 0 && physicalDetails.some(d => d.trim() !== '');
    if (!hasPhysicalDetails && !noPhysicalDetails) {
      errors.push("un détail physique marquant (ou cochez 'Aucun détail physique particulier')");
    }

    // Validation de la sélection des enfants
    if (selectedChildrenIds.length === 0) {
      errors.push("au moins un enfant associé à ce proche");
    }

    if (errors.length > 0) {
      toast.error(`Veuillez renseigner : ${errors.join(', ')}`);
      return;
    }

    setSaving(true);
    try {
      // Mettre à jour dans family_members
      const detailsPayload = {
        nickname: { type: selectedNickname, custom: nicknameCustomValue },
        skinColor: { type: selectedSkinColor, custom: skinColorCustomValue },
        hairColor: { type: selectedHairColor, custom: hairColorCustomValue },
        hairType: hairType,
        hairTypeCustom,
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
        name: firstName,
        role: type,
        physical_details: noPhysicalDetails
          ? JSON.stringify([""])
          : (physicalDetails.length > 0 ? JSON.stringify(physicalDetails) : JSON.stringify([])),
        clothing_style: clothingStyle ? JSON.stringify([clothingStyle]) : JSON.stringify([]),
        details: detailsPayload
      };

      const { error } = await supabase
        .from('family_members')
        .update(updatePayload)
        .eq('id', relativeId);

      if (error) throw error;

      // Supprimer toutes les anciennes relations
      const { error: deleteError } = await supabase
        .from('child_family_members')
        .delete()
        .eq('family_member_id', relativeId);

      if (deleteError) throw deleteError;

      // Créer les nouvelles relations
      if (selectedChildrenIds.length > 0) {
        const childFamilyMembersData = selectedChildrenIds.map(childId => ({
          child_id: childId,
          family_member_id: relativeId,
          relation_label: type
        }));

        const { error: insertError } = await supabase
          .from('child_family_members')
          .insert(childFamilyMembersData);

        if (insertError) throw insertError;
      }
      
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
            previous_birth_date: originalBirthDate
          })
        });
      } catch (webhookErr) {
        console.error('Webhook avatar error:', webhookErr);
      }

      if (relativeId) signalAvatarRegeneration(relativeId);
      toast.success('Proche modifié avec succès !');
      setTimeout(() => {
        navigate('/espace-famille');
      }, 500);
    } catch (e) {
      console.error('Error saving relative:', e);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mcf-orange mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-20 max-w-3xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/espace-famille')}
          className="mb-6 text-mcf-orange-dark hover:bg-mcf-amber/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à l'espace famille
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-mcf-orange-dark mb-2">
            Modifier {firstName || 'le proche'}
          </h1>
          <p className="text-gray-600">
            Mettez à jour les informations de ce proche
          </p>
        </div>

        <Card className="p-6 space-y-6 border-mcf-mint">
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
            selectedHairColor={selectedHairColor}
            setSelectedHairColor={setSelectedHairColor}
            hairColorCustomValue={hairColorCustomValue}
            setHairColorCustomValue={setHairColorCustomValue}
            hairType={hairType}
            setHairType={setHairType}
            hairTypeCustom={hairTypeCustom}
            setHairTypeCustom={setHairTypeCustom}
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
            />
          )}
        </Card>

        <div className="flex flex-col gap-3 mt-8">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/espace-famille')}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-mcf-primary hover:bg-mcf-primary/90 text-white"
            >
              {saving ? 'Sauvegarde...' : 'Enregistrer les modifications'}
            </Button>
          </div>
          <div className="flex justify-center">
            <ResetAvatarButton
              profileId={relativeId!}
              profileType="relative"
              profileName={firstName}
            />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ModifierProche;
