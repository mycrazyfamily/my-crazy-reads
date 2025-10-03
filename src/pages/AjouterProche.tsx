import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import RelativeForm from '@/components/childProfile/RelativeForm';
import type { RelativeData } from '@/types/childProfile';
import { v4 as uuidv4 } from 'uuid';

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  relatives?: any[];
}

export default function AjouterProche() {
  const navigate = useNavigate();
  const { childId } = useParams();
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(childId || null);
  const [loading, setLoading] = useState(true);

  // Formulaire vide pour un nouveau proche
  const emptyRelative: RelativeData = {
    id: uuidv4(),
    type: 'father',
    firstName: '',
    age: '',
    job: '',
    gender: 'male',
    nickname: { type: 'none' },
    skinColor: { type: 'light' },
    hairColor: { type: 'brown' },
    hairType: 'straight',
    glasses: false,
    traits: [],
    customTraits: {}
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('drafts')
        .select('id, data')
        .eq('type', 'child_profile')
        .eq('created_by', (user as any).id);

      if (error) throw error;

      const mappedChildren = (data || []).map((draft: any) => ({
        id: draft.id,
        firstName: draft.data?.firstName || 'Enfant',
        lastName: draft.data?.lastName || '',
        relatives: draft.data?.family?.relatives || []
      }));

      setChildren(mappedChildren);
      
      // Si un seul enfant et pas de childId spécifique, le sélectionner automatiquement
      if (mappedChildren.length === 1 && !childId) {
        setSelectedChildId(mappedChildren[0].id);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des enfants:', error);
      toast.error('Erreur lors de la récupération des enfants');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRelative = async (relativeData: RelativeData) => {
    if (!selectedChildId) {
      toast.error('Veuillez sélectionner un enfant');
      return;
    }

    try {
      // Récupérer le profil enfant actuel
      const { data: currentChild, error: fetchError } = await supabase
        .from('drafts')
        .select('data')
        .eq('id', selectedChildId)
        .single();

      if (fetchError) throw fetchError;

      const childData = currentChild.data as any;
      const currentRelatives = childData?.family?.relatives || [];
      
      // Ajouter le nouveau proche aux proches existants
      const updatedRelatives = [...currentRelatives, relativeData];

      // Mettre à jour le profil enfant
      const { error: updateError } = await supabase
        .from('drafts')
        .update({ 
          data: {
            ...childData,
            family: {
              ...(childData?.family || {}),
              relatives: updatedRelatives
            }
          } as any
        })
        .eq('id', selectedChildId);

      if (updateError) throw updateError;

      toast.success('Proche ajouté avec succès !');
      navigate('/espace-famille');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du proche:', error);
      toast.error('Erreur lors de l\'ajout du proche');
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
            onClick={() => navigate('/espace-famille')}
            className="border-mcf-orange/30 text-mcf-orange-dark hover:bg-mcf-amber/10"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold text-mcf-orange-dark">Ajouter un proche</h1>
        </div>

        {/* Sélection de l'enfant si plusieurs enfants */}
        {children.length > 1 && !childId && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-mcf-orange-dark">Pour quel enfant souhaitez-vous ajouter un proche ?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {children.map((child) => (
                  <Button
                    key={child.id}
                    variant={selectedChildId === child.id ? "default" : "outline"}
                    className={`justify-start gap-2 ${selectedChildId === child.id 
                      ? 'bg-mcf-orange hover:bg-mcf-orange-dark text-white' 
                      : 'border-mcf-orange/30 text-mcf-orange-dark hover:bg-mcf-amber/10'
                    }`}
                    onClick={() => setSelectedChildId(child.id)}
                  >
                    {child.firstName} {child.lastName}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Formulaire d'ajout de proche */}
        {selectedChildId && (
          <Card>
            <CardHeader>
              <CardTitle className="text-mcf-orange-dark flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Nouveau proche
                {children.length === 1 && (
                  <span className="text-sm font-normal text-gray-600">
                    pour {children.find(c => c.id === selectedChildId)?.firstName}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RelativeForm 
                relative={emptyRelative}
                onSave={handleAddRelative} 
                onCancel={() => navigate('/espace-famille')} 
              />
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
                Vous devez d'abord créer le profil d'un enfant pour pouvoir lui ajouter des proches.
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
      </main>
    </div>
  );
}
