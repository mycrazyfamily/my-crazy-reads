import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';

type NavigationButtonsProps = {
  handlePreviousStep: () => void;
  handleContinue: () => void;
  continueButtonText?: string;
  isSubmitButton?: boolean;
};

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  handlePreviousStep,
  handleContinue,
  continueButtonText,
  isSubmitButton = false
}) => {
  return (
    <div className="pt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
      <Button 
        type="button" 
        onClick={handlePreviousStep}
        variant="outline"
        className="font-semibold flex items-center gap-2 w-full sm:w-auto"
      >
        <ArrowLeft className="h-4 w-4" /> Retour
      </Button>
      
      <Button 
        type={isSubmitButton ? "submit" : "button"}
        onClick={handleContinue}
        className="bg-mcf-primary hover:bg-mcf-primary-dark text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 w-full sm:w-auto h-auto whitespace-normal sm:whitespace-nowrap leading-tight"
      >
        {continueButtonText || "Continuer l'aventure →"}
      </Button>
    </div>
  );
};

export default NavigationButtons;
