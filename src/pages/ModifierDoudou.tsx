// ModifierDoudou v1.0
// Nouveau fichier — calqué sur ModifierAnimal.tsx pour la parité CRUD.
// Point important repris dès le départ : requête par comforter_id à l'échelle FAMILLE (pas
// child_id), même correctif que celui déjà appliqué à ModifierAnimal (bug "Animal non trouvé"
// quand l'entité n'a pas de jonction avec l'enfant du contexte courant).
// Pas de ResetAvatarButton ni d'avatar_url ici : Avatar Factory ne génère pas encore d'avatar
// pour les doudous (chantier à venir) — ajouté quand cette phase sera prête.
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useInvalidateFamilyData } from '@/hooks/useFamilyData';
import { splitCamelCase } from '@/utils/nameFormatter';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ToyForm from '@/components/childProfile/toys/ToyForm';
import ChildrenSelector from '@/components/childProfile/ChildrenSelector';
import type { ToyData, ToyType, ToyRole } from '@/types/childProfile';

type ToyStatus = 'active' | 'lost';

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

const ModifierDoudou: React.FC = () => {
  const { childId, comforterId } = useParams<{ childId: string; comforterId: string }>();
  const navigate = useNavigate();
  const invalidateFamilyData = useInvalidateFamilyData();

  const [loading, setLoading] = useState(true);
  const [toyData, setToyData] = useState<ToyData | null>(null);
  const [existingChildren, setExistingChildren] = useState<Array<{ id: string; first_name: string }>>([]);
  const [selectedChildrenIds, setSelectedChildrenIds] = useState<string[]>([]);
  const [toyStatus, setToyStatus] = useState<ToyStatus>('active');

  useEffect(() => {
    loadToyData();
  }, [childId, comforterId]);

  const loadToyData = async () => {
    if (!childId || !comforterId) return;

    try {
      setLoading(true);

      // Charger le doudou par comforter_id (échelle FAMILLE, pas enfant) — même logique que
      // ModifierAnimal : un doudou peut être lié à d'AUTRES enfants que celui du contexte
      // courant. On récupère toutes les jonctions child_comforters, puis on privilégie la ligne
      // de l'enfant courant si elle existe, sinon la première disponible.
      const { data: toyRows, error } = await supabase
        .from('child_comforters')
        .select(`
          *,
          comforters (
            id,
            label,
            emoji,
            family_id,
            is_active
          )
        `)
        .eq('comforter_id', comforterId);

      if (error) throw error;

      const data =
        (toyRows || []).find(r => r.child_id === childId) ||
        (toyRows || [])[0] ||
        null;

      if (data && data.comforters) {
        const predefinedTypes = ['plush', 'blanket', 'doll', 'miniCar', 'figurine', 'other'];
        const storedType = data.relation_label;
        const isCustomType = !!storedType && !predefinedTypes.includes(storedType);

        const toy: ToyData = {
          id: data.comforters.id,
          name: data.name || data.comforters.label,
          type: isCustomType ? 'other' : ((storedType as ToyType) || 'plush'),
          otherType: isCustomType ? storedType : undefined,
          appearance: data.appearance || '',
          roles: (data.roles ? String(data.roles).split(',').filter(Boolean) : []) as ToyRole[],
          isActive: data.comforters.is_active !== false,
          comforterId: data.comforters.id
        };
        setToyData(toy);
        setToyStatus(data.comforters.is_active === false ? 'lost' : 'active');

        // Charger tous les enfants de la famille
        const { data: childrenData, error: childrenError } = await supabase
          .from('child_profiles')
          .select('id, first_name')
          .eq('family_id', data.comforters.family_id)
          .order('first_name');

        if (childrenError) throw childrenError;
        setExistingChildren(childrenData || []);

        // Charger les enfants liés à ce doudou
        const { data: linkedChildren, error: linkedError } = await supabase
          .from('child_comforters')
          .select('child_id')
          .eq('comforter_id', comforterId);

        if (linkedError) throw linkedError;
        setSelectedChildrenIds(linkedChildren?.map(c => c.child_id) || []);
      } else {
        toast.error("Doudou non trouvé");
        navigate('/espace-famille');
      }
    } catch (error) {
      console.error('Error loading toy data:', error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleChild = (childIdToToggle: string) => {
    setSelectedChildrenIds(prev =>
      prev.includes(childIdToToggle)
        ? prev.filter(id => id !== childIdToToggle)
        : [...prev, childIdToToggle]
    );
  };

  const handleCancel = () => {
    navigate('/espace-famille');
  };

  const handleSave = async (updatedToy: ToyData) => {
    if (!comforterId) return;

    // Garde-fou : au moins un enfant associé (ToyForm ne le vérifie pas lui-même,
    // c'est géré ici car ChildrenSelector est en dehors de ToyForm).
    if (selectedChildrenIds.length === 0) {
      toast.error("Veuillez associer au moins un enfant à ce doudou");
      return;
    }

    try {
      const finalType = updatedToy.type === 'other' && updatedToy.otherType
        ? updatedToy.otherType
        : updatedToy.type;
      const emoji = emojiForToyType(updatedToy.type);

      const { error: updateComforterError } = await supabase
        .from('comforters')
        .update({
          label: splitCamelCase(updatedToy.name),
          emoji,
          is_active: toyStatus !== 'lost',
          updated_at: new Date().toISOString()
        })
        .eq('id', comforterId);

      if (updateComforterError) throw updateComforterError;

      // Charger les relations existantes pour ce doudou
      const { data: existingRelations, error: fetchError } = await supabase
        .from('child_comforters')
        .select('id, child_id')
        .eq('comforter_id', comforterId);

      if (fetchError) throw fetchError;

      const existingChildIds = existingRelations?.map(r => r.child_id) || [];
      const childComforterUpdates = {
        name: splitCamelCase(updatedToy.name),
        appearance: updatedToy.appearance?.trim() || '',
        roles: Array.isArray(updatedToy.roles) ? updatedToy.roles.join(',') : (updatedToy.roles as any) || '',
        relation_label: finalType
      };

      const childIdsToRemove = existingChildIds.filter(id => !selectedChildrenIds.includes(id));
      const childIdsToUpdate = selectedChildrenIds.filter(id => existingChildIds.includes(id));
      const childIdsToCreate = selectedChildrenIds.filter(id => !existingChildIds.includes(id));

      if (childIdsToRemove.length > 0) {
        const { error: deleteError } = await supabase
          .from('child_comforters')
          .delete()
          .eq('comforter_id', comforterId)
          .in('child_id', childIdsToRemove);
        if (deleteError) throw deleteError;
      }

      if (childIdsToUpdate.length > 0) {
        for (const cid of childIdsToUpdate) {
          const { error: updateError } = await supabase
            .from('child_comforters')
            .update(childComforterUpdates)
            .eq('comforter_id', comforterId)
            .eq('child_id', cid);
          if (updateError) throw updateError;
        }
      }

      if (childIdsToCreate.length > 0) {
        const childComfortersData = childIdsToCreate.map(cid => ({
          child_id: cid,
          comforter_id: comforterId,
          ...childComforterUpdates
        }));
        const { error: insertError } = await supabase
          .from('child_comforters')
          .insert(childComfortersData);
        if (insertError) throw insertError;
      }

      invalidateFamilyData();
      toast.success('Doudou modifié avec succès !');
      setTimeout(() => {
        navigate('/espace-famille');
      }, 500);
    } catch (error) {
      console.error('Error saving toy:', error);
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <p className="text-center">Chargement...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!toyData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="container mx-auto px-4 py-20 max-w-3xl">
        <Button
          variant="ghost"
          onClick={handleCancel}
          className="flex items-center gap-2 text-muted-foreground hover:text-mcf-primary hover:bg-mcf-mint/10 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à l'espace famille
        </Button>

        <h1 className="text-3xl font-bold text-mcf-orange-dark mb-6">
          Modifier le doudou
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-mcf-mint space-y-6">
          <ToyForm
            toy={toyData}
            onSave={handleSave}
            onCancel={handleCancel}
          />

          {existingChildren.length > 0 && (
            <ChildrenSelector
              children={existingChildren}
              selectedChildrenIds={selectedChildrenIds}
              onToggleChild={handleToggleChild}
              label="Enfants associés à ce doudou"
            />
          )}

          {/* Statut du doudou */}
          <div className="space-y-3 pt-4 border-t border-mcf-mint/40">
            <Label className="text-base font-medium">Statut</Label>
            <RadioGroup
              value={toyStatus}
              onValueChange={(v) => setToyStatus(v as ToyStatus)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="active" id="toy-status-active" />
                <Label htmlFor="toy-status-active" className="cursor-pointer font-normal">Avec nous</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="lost" id="toy-status-lost" />
                <Label htmlFor="toy-status-lost" className="cursor-pointer font-normal">Perdu</Label>
              </div>
            </RadioGroup>
            {toyStatus === 'lost' && (
              <p className="text-xs text-muted-foreground">
                {toyData?.name} n'apparaîtra plus dans les histoires. Vous pourrez revenir en arrière à tout moment.
              </p>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ModifierDoudou;
