import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import CreateChildProfile from './CreateChildProfile';
import 'react-datepicker/dist/react-datepicker.css';

const NouvelEnfant: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    // Try to go back to previous page, fallback to family dashboard if no history
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/espace-famille');
    }
  };

  return (
    <div>
      <div className="container mx-auto px-4 pt-4">
        <Button 
          variant="ghost" 
          onClick={handleGoBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-mcf-primary hover:bg-mcf-mint/10 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
      </div>
      <CreateChildProfile 
        isGiftMode={false} 
        nextPath="/start-adventure"
        initialStep={0}
      />
    </div>
  );
};

export default NouvelEnfant;