
import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const CheckEmail = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-mcf-cream p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-mcf-orange-dark hover:bg-mcf-amber/10"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à l'accueil
        </Button>
        
        <div className="bg-white p-8 rounded-lg shadow-md space-y-4">
          <h1 className="text-2xl font-bold text-mcf-orange-dark">
            📬 Vérifiez votre boîte mail
          </h1>
          <p className="text-gray-600">
            Nous vous avons envoyé un lien pour confirmer votre inscription.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckEmail;

