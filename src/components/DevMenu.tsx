
import React from 'react';
import { useChildProfileForm } from '@/contexts/ChildProfileFormContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

type DevMenuProps = {
  visible?: boolean;
};

const DevMenu: React.FC<DevMenuProps> = ({ visible = true }) => {
  const navigate = useNavigate();
  
  // On utilise try/catch car useChildProfileForm lance une erreur si on n'est pas dans le contexte
  let childProfileFormContext = null;
  try {
    childProfileFormContext = useChildProfileForm();
  } catch (error) {
    // Le contexte n'est pas disponible, ce qui est normal sur certaines pages
  }
  
  if (!visible) return null;
  
  const goToStep = (step: number) => {
    if (childProfileFormContext) {
      // Si nous sommes déjà dans le contexte du formulaire, utiliser la fonction directe
      childProfileFormContext.handleGoToStep(step);
      toast.success(`Navigation vers l'étape ${step + 1}`);
    } else {
      // Si nous ne sommes pas dans le contexte du formulaire, naviguer vers la page appropriée
      console.log(`Navigating to /creer-profil-enfant with targetStep: ${step}`);
      navigate('/creer-profil-enfant', { 
        state: { targetStep: step } 
      });
      toast.info(`Redirection vers l'étape ${step + 1}...`);
    }
  };

  const goToPage = (path: string, label: string) => {
    navigate(path);
    toast.success(`Navigation vers ${label}`);
  };
  
  return (
    <Card className="fixed bottom-4 right-4 z-50 shadow-lg border-2 border-mcf-amber bg-white/95 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Menu Développeur</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 grid grid-cols-2 gap-2">
        <Button size="sm" variant="outline" onClick={() => goToPage('/', 'Accueil')}>
          Accueil
        </Button>
        <Button size="sm" variant="outline" onClick={() => goToPage('/creer-profil-enfant', 'Création de profil')}>
          Créer Profil
        </Button>
        <Button size="sm" variant="outline" onClick={() => goToStep(0)}>
          1. Infos de base
        </Button>
        <Button size="sm" variant="outline" onClick={() => goToStep(1)}>
          2. Personnalité
        </Button>
        <Button size="sm" variant="outline" onClick={() => goToStep(2)}>
          3. Famille
        </Button>
        <Button size="sm" variant="outline" onClick={() => goToStep(3)}>
          4. Animaux
        </Button>
        <Button size="sm" variant="outline" onClick={() => goToStep(4)} className="bg-mcf-amber/20">
          5. Doudous
        </Button>
        <Button size="sm" variant="outline" onClick={() => goToStep(5)}>
          6. Mondes
        </Button>
        <Button size="sm" variant="outline" onClick={() => goToStep(6)}>
          7. Résumé
        </Button>
      </CardContent>
    </Card>
  );
};

export default DevMenu;
