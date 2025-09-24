import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Baby, BookOpen, Brain, Cat, Users, Rabbit, Sparkles, Globe, Pencil, Gift } from 'lucide-react';
import type { ChildProfileFormData } from '@/types/childProfile';
import BasicInfoSummary from '@/components/childProfile/summary/BasicInfoSummary';
import PersonalitySummary from '@/components/childProfile/summary/PersonalitySummary';
import FamilySummary from '@/components/childProfile/summary/FamilySummary';
import PetsSummary from '@/components/childProfile/summary/PetsSummary';
import ToysSummary from '@/components/childProfile/summary/ToysSummary';
import WorldsSummary from '@/components/childProfile/summary/WorldsSummary';

type FinalSummaryProps = {
  handlePreviousStep: () => void;
  handleGoToStep: (step: number) => void;
  handleSubmit: () => void;
  isGiftMode?: boolean;
  nextButtonText?: string;
};

const FinalSummary: React.FC<FinalSummaryProps> = ({
  handlePreviousStep,
  handleGoToStep,
  handleSubmit,
  isGiftMode = false,
  nextButtonText
}) => {
  const form = useFormContext<ChildProfileFormData>();
  const formData = form.getValues();
  
  const handleStartAdventure = () => {
    console.log("Starting adventure button clicked");
    handleSubmit();
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-mcf-primary-dark mb-2">
          {isGiftMode 
            ? "Parfait ! Le profil est prêt ✨"
            : "C'est prêt ! Voici le profil de votre enfant ✨"
          }
        </h2>
        <p className="text-gray-600">
          {isGiftMode
            ? "Vérifiez les informations avant de choisir le thème de l'histoire"
            : "Vous pouvez encore modifier un détail si besoin, sinon… place à l'imaginaire ! 🧠📚"
          }
        </p>
      </div>

      <div className="space-y-6">
        <SummaryBlock 
          title="L'enfant"
          icon={<Baby className="h-6 w-6 text-mcf-primary" />}
          onEdit={() => handleGoToStep(0)}
        >
          <BasicInfoSummary data={formData} />
        </SummaryBlock>

        <SummaryBlock 
          title="Personnalité & passions" 
          icon={<Brain className="h-6 w-6 text-mcf-primary" />}
          onEdit={() => handleGoToStep(1)}
        >
          <PersonalitySummary data={formData} />
        </SummaryBlock>

        <SummaryBlock 
          title="Famille & entourage" 
          icon={<Users className="h-6 w-6 text-mcf-primary" />}
          onEdit={() => handleGoToStep(2)}
        >
          <FamilySummary data={formData} />
        </SummaryBlock>

        {formData.pets && formData.pets.hasPets && (
          <SummaryBlock 
            title="Animaux de compagnie" 
            icon={<Cat className="h-6 w-6 text-mcf-primary" />}
            onEdit={() => handleGoToStep(3)}
          >
            <PetsSummary data={formData} />
          </SummaryBlock>
        )}

        {formData.toys && formData.toys.hasToys && (
          <SummaryBlock 
            title="Doudous & objets magiques" 
            icon={<Sparkles className="h-6 w-6 text-mcf-primary" />}
            onEdit={() => handleGoToStep(4)}
          >
            <ToysSummary data={formData} />
          </SummaryBlock>
        )}

        <SummaryBlock 
          title="Univers préféré & culture" 
          icon={<Globe className="h-6 w-6 text-mcf-primary" />}
          onEdit={() => handleGoToStep(5)}
        >
          <WorldsSummary data={formData} />
        </SummaryBlock>
      </div>

      <div className="flex flex-col gap-4 mt-10 items-center">
        <Button 
          type="submit"
          onClick={handleStartAdventure}
          className="bg-mcf-primary hover:bg-mcf-primary-dark text-white font-bold py-5 px-8 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 w-full md:w-auto md:min-w-64 text-lg flex items-center justify-center gap-2"
        >
          {isGiftMode ? <Gift className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
          {nextButtonText || (isGiftMode 
            ? "Continuer vers le choix du thème →" 
            : "Tout est prêt, on démarre l'aventure !"
          )}
        </Button>
        
        <Button 
          variant="outline" 
          type="button"
          onClick={handlePreviousStep}
          className="text-gray-600 hover:text-gray-800"
        >
          ← Revenir à l'étape précédente
        </Button>
      </div>
    </div>
  );
};

type SummaryBlockProps = {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onEdit: () => void;
};

const SummaryBlock: React.FC<SummaryBlockProps> = ({ 
  title, 
  icon, 
  children, 
  onEdit 
}) => {
  return (
    <Card className="overflow-hidden border border-mcf-amber/30 hover:shadow-md transition-shadow">
      <div className="bg-mcf-amber/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-mcf-primary-dark">
          {icon}
          <h3>{title}</h3>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onEdit}
          className="flex items-center gap-1 text-xs text-gray-600 hover:text-mcf-primary"
        >
          <Pencil className="h-3 w-3" /> 
          Modifier
        </Button>
      </div>
      <div className="p-4">
        {children}
      </div>
    </Card>
  );
};

export default FinalSummary;
