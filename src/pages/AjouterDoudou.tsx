// AjouterDoudou v2.1
// Changelog v2.1 : signale la régénération d'avatar à la création (récupère l'id du comforter via
// .select('id').single()) → shimmer « en création » sur la carte du dashboard jusqu'à l'arrivée.
// Changelog v2.0 : simplification architecturale — 1 doudou = 1 enfant (plus de multi-sélection,
// plus d'insert dans child_comforters). Sélection d'un SEUL enfant, insert direct dans
// comforters avec child_id + appearance + roles + relation_label.
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useFamilyIdSync } from '@/hooks/useFamilyIdSync';
import { splitCamelCase } from '@/utils/nameFormatter';
import { toast } from 'sonner';
import { useInvalidateFamilyData } from '@/hooks/useFamilyData';
import { signalAvatarRegeneration } from '@/utils/avatarRegenerationSignal';
import ToyForm from '@/components/childProfile/toys/ToyForm';
import ChildSelectionCard from '@/components/childProfile/ChildSelectionCard';
import FormProgressIndicator from '@/components/FormProgressIndicator';
import type { ToyData } from '@/types/childProfile';

interface Child {
  id: string;
  firstName: string;
  lastName?: string;
  birthDate?: string;
  gender?: string;
}

function emojiForToyType(type: string): string {
  switch (type) {
    case 'plush': return '🧸';
    case 'blanket': return '🧣';
    case 'doll': return '🧍';
    case 'miniCar': return '🚗';
    case 'figurine': return '🦸';
    default: return '✨';
  }
}

export default function AjouterDoudou() {
  const navigate = useNavigate();
  const invalidateFamilyData = useInvalidateFamilyData();
  const { user, supabaseSession } = useAuth();

  // Synchroniser automatiquement le family_id
  useFamilyIdSync();

  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (supabaseSession?.user) {
      fetchChildren();
    }
  }, [supabaseSession]);

  const fetchChildren = async () => {
    if (!supabaseSession?.user) return;

    try {
      const { data, error } = await supabase
        .from('child_profiles')
        .select('id, first_name, birth_date, gender, created_at')
        .eq('user_id', supabaseSession.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedChildren = (data || []).map((profile: any) => ({
        id: profile.id,
        firstName: profile.first_name || 'Enfant',
        lastName: '',
        birthDate: profile.birth_date,
        gender: profile.gender
      }));

      setChildren(mappedChildren);
      // Un seul enfant → le sélectionner automatiquement, pas besoin de le demander
      if (mappedChildren.length === 1) {
        setSelectedChildId(mappedChildren[0].id);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des enfants:', error);
      toast.error('Erreur lors de la récupération des enfants');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChild = (childId: string) => {
    setSelectedChildId(childId);
  };

  const handleContinue = () => {
    if (!selectedChildId) {
      toast.error('Veuillez sélectionner un enfant');
      return;
    }
    setShowForm(true);
  };

  const handleAddToy = async (toyData: ToyData) => {
    if (isSubmitting) return;
    if (!selectedChildId) {
      toast.error('Veuillez sélectionner un enfant');
      return;
    }
    setIsSubmitting(true);
    try {
      let familyId: string | null = null;

      // 1. D'abord, essayer de récupérer le family_id depuis le profil enfant (child_profiles)
      const { data: childProfile, error: childError } = await supabase
        .from('child_profiles')
        .select('family_id')
        .eq('id', selectedChildId)
        .maybeSingle();

      if (!childError && childProfile?.family_id) {
        familyId = childProfile.family_id;
      }

      // 2. Si pas de family_id trouvé dans l'enfant, vérifier le user_profile
      if (!familyId) {
        const { data: userProfile, error: profileError } = await supabase
          .from('user_profiles')
          .select('family_id')
          .eq('id', supabaseSession!.user.id)
          .maybeSingle();

        if (profileError) {
          toast.error('Impossible de récupérer les informations de famille');
          return;
        }

        familyId = userProfile.family_id;
      }

      // 3. Si toujours pas de family_id, en créer une nouvelle (cas rare)
      if (!familyId) {
        const { data: newFamily, error: familyError } = await supabase
          .from('families')
          .insert([{
            name: 'Ma famille',
            created_by: supabaseSession!.user.id
          }])
          .select()
          .single();

        if (familyError) {
          console.error('Error creating family:', familyError);
          toast.error('Erreur lors de la création de la famille');
          return;
        }

        familyId = newFamily.id;
      }

      // 4. Synchroniser user_profiles.family_id si nécessaire
      const { data: currentProfile } = await supabase
        .from('user_profiles')
        .select('family_id')
        .eq('id', supabaseSession!.user.id)
        .maybeSingle();

      if (currentProfile && currentProfile.family_id !== familyId) {
        await supabase
          .from('user_profiles')
          .update({ family_id: familyId })
          .eq('id', supabaseSession!.user.id);
      }

      // Synchroniser child_profiles.family_id si nécessaire
      const { data: child } = await supabase
        .from('child_profiles')
        .select('family_id')
        .eq('id', selectedChildId)
        .maybeSingle();

      if (child && child.family_id !== familyId) {
        await supabase
          .from('child_profiles')
          .update({ family_id: familyId })
          .eq('id', selectedChildId);
      }

      // 5. Créer le doudou directement dans comforters, lié à cet enfant (1 doudou = 1 enfant)
      const finalType = toyData.type === 'other' && toyData.otherType
        ? toyData.otherType
        : toyData.type;
      const emoji = emojiForToyType(toyData.type);

      const { data: createdComforter, error: comforterError } = await supabase
        .from('comforters')
        .insert({
          label: splitCamelCase(toyData.name),
          emoji,
          family_id: familyId,
          child_id: selectedChildId,
          appearance: toyData.appearance?.trim() || '',
          roles: Array.isArray(toyData.roles) ? toyData.roles.join(',') : (toyData.roles as any) || '',
          relation_label: finalType,
          created_by: supabaseSession!.user.id,
          is_active: toyData.isActive !== false
        })
        .select('id')
        .single();

      if (comforterError) throw comforterError;

      // L'avatar est généré côté n8n (trigger à l'INSERT). On signale la régénération pour que la
      // carte du dashboard affiche « en création » jusqu'à l'arrivée du nouvel avatar (polling,
      // realtime étant désactivé sur comforters).
      if (createdComforter?.id) signalAvatarRegeneration(createdComforter.id);

      toast.success('Doudou ajouté avec succès !');
      invalidateFamilyData();
      navigate('/espace-famille');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du doudou:', error);
      toast.error('Erreur lors de l\'ajout du doudou');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mcf-orange mx-auto mb-4"></div>
          <p className="text-mcf-orange-dark">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => showForm ? setShowForm(false) : navigate('/espace-famille')}
            className="border-mcf-orange/30 text-mcf-orange-dark hover:bg-mcf-amber/10"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold text-mcf-orange-dark">Ajouter un doudou</h1>
        </div>

        <FormProgressIndicator
          currentStep={showForm ? 1 : 0}
          totalSteps={2}
          stepLabels={['Sélection', 'Informations']}
        />

        {!showForm ? (
          <>
            {/* Sélection de l'enfant — un seul, un doudou appartient à un enfant précis */}
            {children.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-mcf-orange-dark">
                    Sélectionnez l'enfant concerné
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Un doudou appartient à un seul enfant
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {children.map((child) => (
                      <ChildSelectionCard
                        key={child.id}
                        child={child}
                        selected={selectedChildId === child.id}
                        onToggle={() => handleSelectChild(child.id)}
                      />
                    ))}
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      {selectedChildId ? '1 enfant sélectionné' : 'Aucun enfant sélectionné'}
                    </p>
                    <Button
                      onClick={handleContinue}
                      disabled={!selectedChildId}
                      className="bg-mcf-orange hover:bg-mcf-orange-dark text-white gap-2"
                    >
                      Continuer <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {children.length === 0 && (
              <Card className="p-8 text-center">
                <div className="space-y-4">
                  <p className="text-lg font-medium text-mcf-orange-dark">
                    Aucun enfant trouvé
                  </p>
                  <p className="text-gray-600">
                    Vous devez d'abord créer le profil d'un enfant pour pouvoir lui ajouter un doudou.
                  </p>
                  <Button
                    className="bg-mcf-orange hover:bg-mcf-orange-dark text-white gap-2"
                    onClick={() => navigate('/creer-profil-enfant')}
                  >
                    <Plus className="h-4 w-4" /> Créer le profil d'un enfant
                  </Button>
                </div>
              </Card>
            )}
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-mcf-orange-dark flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Nouveau doudou
                <span className="text-sm font-normal text-gray-600">
                  pour {children.find(c => c.id === selectedChildId)?.firstName}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ToyForm onSave={handleAddToy} onCancel={() => navigate('/espace-famille')} isDisabled={isSubmitting} />
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
