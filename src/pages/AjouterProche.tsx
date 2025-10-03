import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import RelativeForm from '@/components/childProfile/RelativeForm';
import ChildSelectionCard from '@/components/childProfile/ChildSelectionCard';
import type { RelativeData } from '@/types/childProfile';
import { v4 as uuidv4 } from 'uuid';

interface Child {
  id: string;
  firstName: string;
  lastName?: string;
  birthDate?: string;
  gender?: string;
}

export default function AjouterProche() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildIds, setSelectedChildIds] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
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
    if (user) {
      fetchChildren();
    }
  }, [user]);

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
        birthDate: draft.data?.birthDate,
        gender: draft.data?.gender
      }));

      setChildren(mappedChildren);
    } catch (error) {
      console.error('Erreur lors de la récupération des enfants:', error);
      toast.error('Erreur lors de la récupération des enfants');
    } finally {
      setLoading(false);
    }
  };

  const toggleChildSelection = (childId: string) => {
    setSelectedChildIds(prev => 
      prev.includes(childId) 
        ? prev.filter(id => id !== childId)
        : [...prev, childId]
    );
  };

  const handleContinue = () => {
    if (selectedChildIds.length === 0) {
      toast.error('Veuillez sélectionner au moins un enfant');
      return;
    }
    setShowForm(true);
  };

  const handleAddRelative = async (relativeData: RelativeData) => {
    if (selectedChildIds.length === 0) {
      toast.error('Veuillez sélectionner au moins un enfant');
      return;
    }

    try {
      // 1. Créer le membre de famille
      const { data: familyMember, error: familyError } = await supabase
        .from('family_members')
        .insert({
          name: relativeData.firstName,
          role: relativeData.type,
          avatar: null
        })
        .select()
        .single();

      if (familyError) throw familyError;

      // 2. Lier le proche à chaque enfant sélectionné
      const childFamilyMemberRecords = selectedChildIds.map(childId => ({
        child_id: childId,
        family_member_id: familyMember.id,
        relation_label: relativeData.type
      }));

      const { error: linkError } = await supabase
        .from('child_family_members')
        .insert(childFamilyMemberRecords);

      if (linkError) throw linkError;

      toast.success(`Proche ajouté avec succès pour ${selectedChildIds.length} enfant(s) !`);
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
            onClick={() => showForm ? setShowForm(false) : navigate('/espace-famille')}
            className="border-mcf-orange/30 text-mcf-orange-dark hover:bg-mcf-amber/10"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold text-mcf-orange-dark">Ajouter un proche</h1>
        </div>

        {!showForm ? (
          <>
            {/* Sélection des enfants */}
            {children.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-mcf-orange-dark">
                    Sélectionnez le(s) enfant(s) concerné(s)
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Vous pouvez sélectionner plusieurs enfants pour leur ajouter le même proche
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {children.map((child) => (
                      <ChildSelectionCard
                        key={child.id}
                        child={child}
                        selected={selectedChildIds.includes(child.id)}
                        onToggle={toggleChildSelection}
                      />
                    ))}
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      {selectedChildIds.length} enfant(s) sélectionné(s)
                    </p>
                    <Button
                      onClick={handleContinue}
                      disabled={selectedChildIds.length === 0}
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
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-mcf-orange-dark flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Nouveau proche
                <span className="text-sm font-normal text-gray-600">
                  pour {selectedChildIds.map(id => children.find(c => c.id === id)?.firstName).join(', ')}
                </span>
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
      </main>
    </div>
  );
}
