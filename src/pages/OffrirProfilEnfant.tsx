
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CreateChildProfile from './CreateChildProfile';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import 'react-datepicker/dist/react-datepicker.css';

const OffrirProfilEnfant = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const familyCode = location.state?.familyCode;
  // Préserver targetStep s'il existe dans l'état de navigation
  const targetStep = location.state?.targetStep;

  const handleGoBack = () => {
    navigate('/offrir-livre');
  };

  return (
    <div>
      <div className="container mx-auto px-4 pt-4">
        <Button 
          variant="ghost" 
          onClick={handleGoBack}
          className="flex items-center gap-2 text-gray-600 hover:text-mcf-orange-dark hover:bg-mcf-amber/10 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
      </div>
      <CreateChildProfile 
        isGiftMode={true} 
        familyCode={familyCode} 
        nextPath="/offrir/theme"
        // Transmettre le targetStep s'il existe
        initialStep={targetStep}
      />
    </div>
  );
};

export default OffrirProfilEnfant;
