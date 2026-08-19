// StoryCustomizationForm v1.1
// Changelog v1.1 (chantier icones IA, lot 2) : pastille orange, Sparkles -> Feather. Le bloc
//   invite le parent a raconter un evenement recent pour l'integrer a la prochaine histoire :
//   le sens porte est l'ecriture et la personnalisation.
//   NOTE : ce fichier ne portait aucune banniere de version avant aujourd'hui. Son handleSubmit
//   ne fait qu'un console.log, rien n'est enregistre en base, a verifier avant mise en
//   production.

import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Feather } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const StoryCustomizationForm: React.FC = () => {
  const { toast } = useToast();
  const [customDetail, setCustomDetail] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const tags = [
    "Voyage", "École", "Nouveau copain", "Peur du noir", 
    "Déménagement", "Sport", "Anniversaire", "Saisons", "Rêve"
  ];
  
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customDetail && selectedTags.length === 0) {
      toast({
        title: "Information requise",
        description: "Veuillez ajouter un détail ou sélectionner au moins un tag.",
      });
      return;
    }
    
    console.log({
      customDetail,
      selectedTags
    });
    
    toast({
      title: "Détails enregistrés !",
      description: "Nous avons bien reçu vos informations pour la prochaine histoire.",
    });
    
    setCustomDetail('');
    setSelectedTags([]);
  };
  
  return (
    <Card className="border-mcf-amber/30 shadow-md overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="bg-mcf-orange/20 p-3 rounded-full flex-shrink-0">
            <Feather className="h-6 w-6 text-mcf-orange" />
          </div>
          
          <div className="flex-grow">
            <p className="text-mcf-orange-dark font-medium mb-4">
              Votre enfant a vécu quelque chose récemment ? Aime un nouveau jouet ? A un rêve ? 
              Racontez-le nous, on l'ajoutera à la prochaine aventure 🧡
            </p>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="customDetail" className="block font-medium mb-1 text-gray-700">
                  Détail à intégrer (facultatif)
                </label>
                <textarea
                  id="customDetail"
                  className="w-full px-3 py-2 border border-mcf-amber/30 rounded-md focus:outline-none focus:ring-2 focus:ring-mcf-orange resize-none min-h-24"
                  placeholder="Ex: Emma adore son nouveau vélo rouge qu'elle a reçu pour son anniversaire..."
                  value={customDetail}
                  onChange={(e) => setCustomDetail(e.target.value)}
                />
              </div>
              
              <div className="mb-4">
                <p className="font-medium mb-2 text-gray-700">Ou sélectionnez un ou plusieurs thèmes :</p>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      className={`px-3 py-1.5 rounded-full text-sm ${
                        selectedTags.includes(tag) 
                          ? 'bg-mcf-orange text-white' 
                          : 'bg-mcf-amber/20 text-mcf-orange-dark hover:bg-mcf-amber/40'
                      }`}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              
              <Button 
                type="submit"
                className="bg-mcf-orange hover:bg-mcf-orange-dark text-white"
              >
                Enregistrer pour la prochaine histoire
              </Button>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StoryCustomizationForm;
