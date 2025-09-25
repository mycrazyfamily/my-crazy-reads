
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { BookOpen, ArrowLeft, MapPin, Castle, Ship, School, Star } from 'lucide-react';
import { toast } from "sonner";

const THEME_OPTIONS = [
  { value: "fairy-tale", label: "Conte de fées", icon: <Castle className="h-5 w-5 text-mcf-orange" /> },
  { value: "adventure", label: "Aventure", icon: <Ship className="h-5 w-5 text-mcf-orange" /> },
  { value: "travel", label: "Voyage", icon: <MapPin className="h-5 w-5 text-mcf-orange" /> },
  { value: "school", label: "École & émotions", icon: <School className="h-5 w-5 text-mcf-orange" /> },
  { value: "magic", label: "Magie & fantastique", icon: <Star className="h-5 w-5 text-mcf-orange" /> },
];

const OffrirTheme = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const childProfile = location.state?.childProfile;
  
  const [selectedTheme, setSelectedTheme] = useState('');
  const [customPlace, setCustomPlace] = useState('');

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleContinue = () => {
    if (!selectedTheme) {
      toast.error("Veuillez sélectionner un thème d'histoire");
      return;
    }

    navigate('/offrir/message', { 
      state: { 
        childProfile,
        theme: selectedTheme,
        customPlace
      } 
    });
  };

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container px-4 mx-auto max-w-3xl">
        {/* En-tête */}
        <div className="mb-8">
          <button 
            onClick={handleBackClick}
            className="flex items-center text-gray-600 hover:text-mcf-orange mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour
          </button>
          
          <h1 className="text-3xl md:text-4xl font-bold text-mcf-orange-dark mb-2">
            Choisir le thème de l'histoire 📚
          </h1>
          <p className="text-gray-700">
            Quel univers souhaitez-vous offrir à {childProfile?.firstName || "l'enfant"} ?
          </p>
        </div>

        {/* Sélection du thème */}
        <Card className="mb-8 border border-mcf-amber/30">
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div>
                <Label className="text-lg font-semibold mb-4 block">
                  Thème principal de l'histoire
                </Label>
                
                <RadioGroup
                  value={selectedTheme}
                  onValueChange={setSelectedTheme}
                  className="space-y-3"
                >
                  {THEME_OPTIONS.map((theme) => (
                    <div 
                      key={theme.value}
                      className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedTheme === theme.value 
                          ? 'border-mcf-orange bg-mcf-amber/10' 
                          : 'border-gray-200 hover:border-mcf-amber/50'
                      }`}
                    >
                      <RadioGroupItem 
                        value={theme.value} 
                        id={theme.value} 
                        className="mr-3"
                      />
                      <Label 
                        htmlFor={theme.value} 
                        className="flex items-center cursor-pointer flex-1"
                      >
                        <span className="mr-3">{theme.icon}</span>
                        <span>{theme.label}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              <div className="space-y-3 pt-2">
                <Label htmlFor="custom-place" className="text-lg font-semibold">
                  Un lieu ou contexte particulier ? (facultatif)
                </Label>
                <Input
                  id="custom-place"
                  value={customPlace}
                  onChange={(e) => setCustomPlace(e.target.value)}
                  placeholder="Ex: La forêt, l'espace, une ferme, à la mer..."
                  className="w-full"
                />
                <p className="text-sm text-gray-500 italic">
                  Cela nous aidera à créer une histoire encore plus personnalisée
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bouton de continuation */}
        <div className="flex justify-center">
          <Button 
            onClick={handleContinue}
            className="bg-mcf-orange hover:bg-mcf-orange-dark text-white font-bold py-5 px-8 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 w-full md:w-auto md:min-w-64 text-lg flex items-center justify-center gap-2"
          >
            <BookOpen className="h-5 w-5" /> 
            Ajouter un message personnel →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OffrirTheme;
