// ModifierDoudou v2.0
// Changelog v2.0 : (a) simplification architecturale — requête directe sur comforters par id
// (child_id direct, plus de jonction child_comforters, plus de logique "famille vs enfant
// courant") ; (b) ChildrenSelector retiré — un doudou appartient à un seul enfant, affiché en
// lecture seule ; (c) bouton "Enregistrer" déplacé en bas de page (après Statut), même pattern
// que ModifierAnimal/ModifierProche — corrige la confusion UX où le bouton semblait "ne rien
// faire" quand on cliquait Perdu après coup.
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
  const [currentToyData, setCurrentToyData] = useState<ToyData | null>(null);
  const [childName, setChildName] = useState<string>('');
  const [toyStatus, setToyStatus] = useState<ToyStatus>('active');

  useEffect(() => {
    loadToyData();
  }, [comforterId]);

  const loadToyData = async () => {
    if (!comforterId) return;

    try {
      setLoading(true);

      // 1 doudou = 1 enfant : requête directe sur comforters, plus de jonction à démêler.
      const { data, error } = await supabase
        .from('comforters')
        .select('id, label, emoji, is_active, child_id, appearance, roles, relation_label')
        .eq('id', comforterId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const predefinedTypes = ['plush', 'blanket', 'doll', 'miniCar', 'figurine', 'other'];
        const storedType = data.relation_label;
        const isCustomType = !!storedType && !predefinedTypes.includes(storedType);

        const toy: ToyData = {
          id: data.id,
          name: data.label || '',
          type: isCustomType ? 'other' : ((storedType as ToyType) || 'plush'),
          otherType: isCustomType ? storedType : undefined,
          appearance: data.appearance || '',
          roles: (data.roles ? String(data.roles).split(',').filter(Boolean) : []) as ToyRole[],
          isActive: data.is_active !== false,
          comforterId: data.id
        };
        setToyData(toy);
        setToyStatus(data.is_active === false ? 'lost' : 'active');

        // Nom de l'enfant propriétaire (affichage seul, plus de sélection multi-enfant)
        if (data.child_id) {
          const { data: childRow } = await supabase
            .from('child_profiles')
            .select('first_name')
            .eq('id', data.child_id)
            .maybeSingle();
          setChildName(childRow?.first_name || '');
        }
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

  const handleCancel = () => {
    navigate('/espace-famille');
  };

  const handleDataChange = (updated: ToyData) => {
    setCurrentToyData(updated);
  };

  const handleSubmitClick = () => {
    if (!currentToyData) {
      toast.error("Aucune donnée à enregistrer");
      return;
    }
    if (!currentToyData.name?.trim()) {
      toast.error("Veuillez renseigner le prénom du doudou");
      return;
    }
    if (currentToyData.type === 'other' && !currentToyData.otherType?.trim()) {
      toast.error("Veuillez préciser le type d'objet");
      return;
    }
    handleSave(currentToyData);
  };

  const handleSave = async (updatedToy: ToyData) => {
    if (!comforterId) return;

    try {
      const finalType = updatedToy.type === 'other' && updatedToy.otherType
        ? updatedToy.otherType
        : updatedToy.type;
      const emoji = emojiForToyType(updatedToy.type);

      const { error: updateError } = await supabase
        .from('comforters')
        .update({
          label: splitCamelCase(updatedToy.name),
          emoji,
          appearance: updatedToy.appearance?.trim() || '',
          roles: Array.isArray(updatedToy.roles) ? updatedToy.roles.join(',') : (updatedToy.roles as any) || '',
          relation_label: finalType,
          is_active: toyStatus !== 'lost',
          updated_at: new Date().toISOString()
        })
        .eq('id', comforterId);

      if (updateError) throw updateError;

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
          {childName && (
            <p className="text-sm text-muted-foreground">
              Doudou de <span className="font-medium text-mcf-primary">{childName}</span>
            </p>
          )}

          <ToyForm
            toy={toyData}
            onSave={handleSave}
            onCancel={handleCancel}
            showButtons={false}
            onDataChange={handleDataChange}
          />

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

          {/* Bouton unique, en bas, après tout — même pattern que ModifierAnimal/ModifierProche */}
          <div className="flex justify-between pt-4">
            <Button
              type="button"
              onClick={handleCancel}
              variant="outline"
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleSubmitClick}
              className="bg-mcf-primary hover:bg-mcf-primary-dark text-white"
            >
              Enregistrer les modifications
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ModifierDoudou;
