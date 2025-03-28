
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FamilyCodeShareProps {
  familyCode: string;
}

const FamilyCodeShare: React.FC<FamilyCodeShareProps> = ({ familyCode }) => {
  const { toast } = useToast();
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText(familyCode);
    toast({
      title: "Code copié !",
      description: "Le code famille a été copié dans le presse-papier.",
    });
  };
  
  return (
    <Card className="border-mcf-amber border-2 shadow-md bg-gradient-to-r from-mcf-cream to-mcf-beige/70">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="bg-mcf-orange/20 p-3 rounded-full flex-shrink-0">
            <LinkIcon className="h-6 w-6 text-mcf-orange" />
          </div>
          
          <div className="flex-grow">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-mcf-orange-dark mb-1">Votre code famille:</h3>
              <div className="bg-white px-4 py-2.5 rounded-md border border-mcf-amber/40 text-center font-mono text-lg font-bold text-mcf-orange-dark tracking-wide">
                {familyCode}
              </div>
            </div>
            
            <p className="text-gray-700 mb-4">
              Partagez ce code avec vos proches pour leur permettre d'offrir un livre à votre enfant 
              sans refaire tout le formulaire !
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                className="bg-mcf-orange hover:bg-mcf-orange-dark text-white gap-2 flex-1"
                onClick={handleCopyCode}
              >
                <Copy className="h-4 w-4" /> Copier le code
              </Button>
              
              <Button 
                variant="outline"
                className="border-mcf-amber text-mcf-orange-dark hover:bg-mcf-amber/10 gap-2 flex-1"
                onClick={() => window.location.href = "/offrir"}
              >
                <ExternalLink className="h-4 w-4" /> Offrir un livre maintenant
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FamilyCodeShare;
