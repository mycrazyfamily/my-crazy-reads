import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Baby, BookOpen, Brain, Cat, Users, Rabbit, Sparkles, Globe, Pencil, Gift, Loader2 } from 'lucide-react';
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
  isSubmitting?: boolean;
};

const FinalSummary: React.FC<FinalSummaryProps> = ({
  handlePreviousStep,
  handleGoToStep,
  handleSubmit,
  isGiftMode = false,
  nextButtonText,
  isSubmitting = false
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <SummaryBlock 
          title="L'enfant"
          icon={<Baby className="h-5 w-5 text-mcf-primary" />}
          onEdit={() => handleGoToStep(0)}
          className="lg:col-span-1"
        >
          <BasicInfoSummary data={formData} />
        </SummaryBlock>

        <SummaryBlock 
          title="Personnalité & passions" 
          icon={<Brain className="h-5 w-5 text-mcf-primary" />}
          onEdit={() => handleGoToStep(1)}
          className="lg:col-span-1"
        >
          <PersonalitySummary data={formData} />
        </SummaryBlock>

        <SummaryBlock 
          title="Famille & entourage" 
          icon={<Users className="h-5 w-5 text-mcf-primary" />}
          onEdit={() => handleGoToStep(2)}
          className="lg:col-span-1"
        >
          <FamilySummary data={formData} />
        </SummaryBlock>

        {formData.pets && formData.pets.hasPets && (
          <SummaryBlock 
            title="Animaux de compagnie" 
            icon={<Cat className="h-5 w-5 text-mcf-primary" />}
            onEdit={() => handleGoToStep(3)}
            className="lg:col-span-1"
          >
            <PetsSummary data={formData} />
          </SummaryBlock>
        )}

        {formData.toys && formData.toys.hasToys && (
          <SummaryBlock 
            title="Doudous & objets magiques" 
            icon={<Sparkles className="h-5 w-5 text-mcf-primary" />}
            onEdit={() => handleGoToStep(4)}
            className="lg:col-span-1"
          >
            <ToysSummary data={formData} />
          </SummaryBlock>
        )}

        <SummaryBlock 
          title="Univers préféré & culture" 
          icon={<Globe className="h-5 w-5 text-mcf-primary" />}
          onEdit={() => handleGoToStep(5)}
          className={`${(!formData.pets?.hasPets && !formData.toys?.hasToys) ? 'lg:col-span-1' : 'lg:col-span-2'}`}
        >
          <WorldsSummary data={formData} />
        </SummaryBlock>
      </div>

      <div className="flex flex-col gap-4 mt-10 items-center">
        <Button 
          type="submit"
          onClick={handleStartAdventure}
          disabled={isSubmitting}
          className="bg-mcf-primary hover:bg-mcf-primary-dark text-white font-bold py-5 px-8 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 w-full md:w-auto md:min-w-64 text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Enregistrement en cours...
            </>
          ) : (
            <>
              {isGiftMode ? <Gift className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
              {nextButtonText || (isGiftMode 
                ? "Continuer vers le choix du thème →" 
                : "Tout est prêt, on démarre l'aventure !"
              )}
            </>
          )}
        </Button>
        
        <Button 
          variant="outline" 
          type="button"
          onClick={handlePreviousStep}
          disabled={isSubmitting}
          className="text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
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
  className?: string;
};

const SummaryBlock: React.FC<SummaryBlockProps> = ({ 
  title, 
  icon, 
  children, 
  onEdit,
  className 
}) => {
  return (
    <Card className={`overflow-hidden border border-mcf-amber/30 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] animate-fade-in h-fit ${className || ''}`}>
      <div className="bg-gradient-to-r from-mcf-amber/10 to-mcf-amber/5 px-3 py-2.5 flex items-center justify-between border-b border-mcf-amber/20">
        <div className="flex items-center gap-2 font-semibold text-mcf-primary-dark">
          {icon}
          <h3 className="text-sm font-bold">{title}</h3>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onEdit}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-mcf-primary hover:bg-mcf-amber/10 h-7 px-2 rounded-md transition-colors"
        >
          <Pencil className="h-3 w-3" /> 
          Modifier
        </Button>
      </div>
      <div className="p-3">
        {children}
      </div>
    </Card>
  );
};

export default FinalSummary;
