
import React from 'react';
import { Button } from "@/components/ui/button";

type NavigationButtonsProps = {
  handlePreviousStep: () => void;
  handleContinue: () => void;
};

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  handlePreviousStep,
  handleContinue
}) => {
  return (
    <div className="pt-6 flex justify-between">
      <Button 
        type="button" 
        onClick={handlePreviousStep}
        variant="outline"
        className="font-semibold"
      >
        ← Retour
      </Button>
      
      <Button 
        type="button" 
        onClick={handleContinue}
        className="bg-mcf-orange hover:bg-mcf-orange-dark text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
      >
        Continuer l'aventure →
      </Button>
    </div>
  );
};

export default NavigationButtons;
