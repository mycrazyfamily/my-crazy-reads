
import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, MailOpen } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

const CheckEmail = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Vérifie ton email - MyCrazyFamily";
  }, []);

  return (
    <>
      <head>
        <meta name="description" content="Vérifie ton email pour activer ton compte MyCrazyFamily et commencer l'aventure avec ta famille." />
      </head>
      
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-mcf-cream to-mcf-beige p-4">
        <div className="max-w-md w-full space-y-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-mcf-orange-dark hover:bg-mcf-amber/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Revenir à l'accueil
          </Button>
          
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-none">
            <CardContent className="pt-6 px-6 pb-8 space-y-6">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <Mail className="h-16 w-16 text-mcf-orange animate-float" />
                  <MailOpen className="h-16 w-16 text-mcf-orange-dark absolute top-0 left-0 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
              
              <div className="text-center space-y-4">
                <h1 className="text-2xl font-bold text-mcf-orange-dark mb-4">
                  📬 Vérifie ta boîte mail !
                </h1>
                <p className="text-gray-600 leading-relaxed">
                  Nous t'avons envoyé un lien de confirmation à ton adresse email. 
                  Clique dessus pour finaliser ton inscription et commencer l'aventure avec ta famille.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default CheckEmail;
