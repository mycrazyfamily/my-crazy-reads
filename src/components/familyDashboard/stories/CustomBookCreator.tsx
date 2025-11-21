import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Users, 
  MapPin, 
  Tag,
  CheckCircle2,
  Lightbulb,
  BookOpen
} from 'lucide-react';
import { CustomBookRequest } from '@/types/bookTimeline';

interface CustomBookCreatorProps {
  childId: string;
  childName: string;
  monthIndex: number;
  isSelected: boolean;
  onSaveCustomBook?: (data: CustomBookRequest) => void;
  existingData?: CustomBookRequest;
}

const CustomBookCreator: React.FC<CustomBookCreatorProps> = ({
  childId,
  childName,
  monthIndex,
  isSelected,
  onSaveCustomBook,
  existingData,
}) => {
  const [storyIdea, setStoryIdea] = useState(existingData?.storyIdea || '');
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>(
    existingData?.selectedCharacters || []
  );
  const [selectedPlaces, setSelectedPlaces] = useState<string[]>(
    existingData?.selectedPlaces || []
  );
  const [specialRequests, setSpecialRequests] = useState(
    existingData?.specialRequests || ''
  );
  const [themes, setThemes] = useState<string[]>(existingData?.themes || []);
  const [newTheme, setNewTheme] = useState('');
  
  // Mock data - à remplacer par de vraies données depuis la DB
  const availableCharacters = [
    'Maman', 'Papa', 'Grand-mère', 'Grand-père', 
    'Frère', 'Sœur', 'Tante', 'Oncle', 'Cousin'
  ];
  
  const availablePlaces = [
    'La maison', 'L\'école', 'Le parc', 'La plage',
    'La montagne', 'La forêt', 'Le zoo', 'La ferme'
  ];
  
  const suggestedThemes = [
    'Aventure', 'Magie', 'Animaux', 'Espace', 'Pirates',
    'Fées', 'Dragons', 'Océan', 'Dinosaures', 'Robots'
  ];
  
  const toggleCharacter = (character: string) => {
    setSelectedCharacters(prev =>
      prev.includes(character)
        ? prev.filter(c => c !== character)
        : [...prev, character]
    );
  };
  
  const togglePlace = (place: string) => {
    setSelectedPlaces(prev =>
      prev.includes(place)
        ? prev.filter(p => p !== place)
        : [...prev, place]
    );
  };
  
  const toggleTheme = (theme: string) => {
    setThemes(prev =>
      prev.includes(theme)
        ? prev.filter(t => t !== theme)
        : [...prev, theme]
    );
  };
  
  const addCustomTheme = () => {
    if (newTheme.trim() && !themes.includes(newTheme.trim())) {
      setThemes(prev => [...prev, newTheme.trim()]);
      setNewTheme('');
    }
  };
  
  const handleSave = () => {
    const data: CustomBookRequest = {
      childId,
      monthIndex,
      storyIdea,
      selectedCharacters,
      selectedPlaces,
      specialRequests,
      themes,
    };
    onSaveCustomBook?.(data);
  };
  
  const isValid = storyIdea.trim().length > 20;
  
  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 border border-primary/20">
        <div className="flex items-start gap-3">
          <Sparkles className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-bold text-foreground mb-1">
              Créez une histoire 100% unique pour {childName}
            </h4>
            <p className="text-sm text-muted-foreground">
              Partagez votre idée et nous créerons un livre personnalisé sur mesure, 
              avec les personnages, lieux et thèmes de votre choix.
            </p>
          </div>
        </div>
      </div>
      
      {/* Idée principale */}
      <div>
        <label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
          <BookOpen className="h-4 w-4" />
          Votre idée d'histoire *
        </label>
        <p className="text-xs text-muted-foreground mb-3">
          Décrivez l'histoire que vous souhaitez (minimum 20 caractères)
        </p>
        <Textarea
          value={storyIdea}
          onChange={(e) => setStoryIdea(e.target.value)}
          placeholder={`Exemple : "Une aventure où ${childName} part à la recherche d'un trésor perdu avec ses grands-parents dans une forêt magique..."`}
          className="min-h-[120px] resize-none"
        />
        <p className="text-xs text-muted-foreground mt-1">
          {storyIdea.length} caractères
        </p>
      </div>
      
      {/* Personnages */}
      <div>
        <label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
          <Users className="h-4 w-4" />
          Personnages à inclure
        </label>
        <p className="text-xs text-muted-foreground mb-3">
          Sélectionnez les personnages qui apparaîtront dans l'histoire
        </p>
        <div className="flex flex-wrap gap-2">
          {availableCharacters.map((character) => (
            <Button
              key={character}
              variant={selectedCharacters.includes(character) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleCharacter(character)}
            >
              {selectedCharacters.includes(character) && (
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
              )}
              {character}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Lieux */}
      <div>
        <label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
          <MapPin className="h-4 w-4" />
          Lieux de l'histoire
        </label>
        <p className="text-xs text-muted-foreground mb-3">
          Où se déroule l'histoire ?
        </p>
        <div className="flex flex-wrap gap-2">
          {availablePlaces.map((place) => (
            <Button
              key={place}
              variant={selectedPlaces.includes(place) ? "default" : "outline"}
              size="sm"
              onClick={() => togglePlace(place)}
            >
              {selectedPlaces.includes(place) && (
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
              )}
              {place}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Thèmes */}
      <div>
        <label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
          <Tag className="h-4 w-4" />
          Thèmes et univers
        </label>
        <p className="text-xs text-muted-foreground mb-3">
          Choisissez des thèmes pour l'ambiance du livre
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          {suggestedThemes.map((theme) => (
            <Button
              key={theme}
              variant={themes.includes(theme) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleTheme(theme)}
            >
              {themes.includes(theme) && (
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
              )}
              {theme}
            </Button>
          ))}
        </div>
        
        {/* Thème personnalisé */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newTheme}
            onChange={(e) => setNewTheme(e.target.value)}
            placeholder="Ajouter un thème personnalisé..."
            className="flex-1 px-3 py-2 text-sm border rounded-md bg-background"
            onKeyPress={(e) => e.key === 'Enter' && addCustomTheme()}
          />
          <Button size="sm" onClick={addCustomTheme}>
            Ajouter
          </Button>
        </div>
        
        {themes.filter(t => !suggestedThemes.includes(t)).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            <p className="text-xs font-medium text-foreground w-full">Vos thèmes :</p>
            {themes.filter(t => !suggestedThemes.includes(t)).map((theme) => (
              <Badge
                key={theme}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => toggleTheme(theme)}
              >
                {theme}
                <span className="ml-2">×</span>
              </Badge>
            ))}
          </div>
        )}
      </div>
      
      {/* Demandes spéciales */}
      <div>
        <label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
          <Lightbulb className="h-4 w-4" />
          Demandes ou précisions supplémentaires
        </label>
        <Textarea
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
          placeholder="Détails additionnels, style souhaité, valeurs à transmettre, niveau de complexité..."
          className="min-h-[100px] resize-none"
        />
      </div>
      
      {/* Bouton de sauvegarde */}
      <Button
        className="w-full"
        size="lg"
        onClick={handleSave}
        disabled={!isValid}
        variant={isSelected ? "secondary" : "default"}
      >
        {isSelected ? (
          <>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Livre personnalisé enregistré
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            Créer ce livre sur mesure
          </>
        )}
      </Button>
      
      {!isValid && storyIdea.length > 0 && (
        <p className="text-xs text-destructive text-center">
          Veuillez décrire votre idée plus en détail (min. 20 caractères)
        </p>
      )}
    </div>
  );
};

export default CustomBookCreator;
