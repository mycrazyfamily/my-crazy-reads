import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from 'lucide-react';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RelativeBasicInfoSection from '@/components/childProfile/relatives/RelativeBasicInfoSection';
import RelativeNicknameSection from '@/components/childProfile/relatives/RelativeNicknameSection';
import RelativeAppearanceSection from '@/components/childProfile/relatives/RelativeAppearanceSection';
import RelativeTraitsSection from '@/components/childProfile/relatives/RelativeTraitsSection';
import ChildrenSelector from '@/components/childProfile/ChildrenSelector';
import type { RelativeType, RelativeGender } from '@/types/childProfile';

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
              details
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
          .select('id, name, role, avatar, family_id, details')
          .eq('id', relativeId)
          .maybeSingle();
        if (relErr) throw relErr;
        relative = relativeDirect;
      }

      if (relative) {
        // Récupérer toutes les infos depuis family_members.details si présent
        setType((relative.role as RelativeType) || 'father');
        setFirstName(relative.name || '');
        const details = (relative as any).details || {};

        // Pré-remplir les champs basiques (avec compatibilité pour anciens enregistrements)
        setGender(details.gender || 'male');
        setAge(details.age || '');
        const birthDateRaw = details.birthDate ?? details.birthdate ?? details.birth_date ?? null;
        setBirthDate(birthDateRaw ? new Date(birthDateRaw) : undefined);
        setJob(details.job ?? details.profession ?? details.occupation ?? '');
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

    setSaving(true);
    try {
      // Mettre à jour dans family_members
      const updatePayload: any = {
        name: firstName,
        role: type,
        details: {
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
          job,
          gender
        }
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

      toast.success("Proche modifié avec succès !");
      navigate('/espace-famille');
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

        <div className="flex gap-3 mt-8">
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
      </main>
      
      <Footer />
    </div>
  );
};

export default ModifierProche;
