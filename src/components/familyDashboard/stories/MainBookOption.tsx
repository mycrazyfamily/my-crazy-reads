import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Book, 
  Target, 
  Users, 
  MessageCircle, 
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Lightbulb
} from 'lucide-react';
import { MainBook } from '@/types/bookTimeline';

interface MainBookOptionProps {
  book: MainBook;
  childName: string;
  isSelected: boolean;
  onSelect: () => void;
  onSaveDetails?: (details: any) => void;
  existingDetails?: {
    selectedCharacters?: string[];
    customQuestions?: string[];
    additionalNotes?: string;
  };
}

const MainBookOption: React.FC<MainBookOptionProps> = ({
  book,
  childName,
  isSelected,
  onSelect,
  onSaveDetails,
  existingDetails,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>(
    existingDetails?.selectedCharacters || []
  );
  const [customQuestions, setCustomQuestions] = useState<string[]>(
    existingDetails?.customQuestions || []
  );
  const [additionalNotes, setAdditionalNotes] = useState(
    existingDetails?.additionalNotes || ''
  );
  const [newQuestion, setNewQuestion] = useState('');
  
  const handleSave = () => {
    onSaveDetails?.({
      selectedCharacters,
      customQuestions,
      additionalNotes,
    });
  };
  
  const toggleCharacter = (character: string) => {
    setSelectedCharacters(prev =>
      prev.includes(character)
        ? prev.filter(c => c !== character)
        : [...prev, character]
    );
  };
  
  const addQuestion = () => {
    if (newQuestion.trim()) {
      setCustomQuestions(prev => [...prev, newQuestion.trim()]);
      setNewQuestion('');
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Image et infos principales */}
      <div className="flex gap-4">
        {book.coverImageUrl ? (
          <div className="flex-shrink-0 w-32 h-40 rounded-lg overflow-hidden shadow-md bg-muted">
            <img 
              src={book.coverImageUrl} 
              alt={book.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="flex-shrink-0 w-32 h-40 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shadow-md">
            <Book className="h-16 w-16 text-primary/40" />
          </div>
        )}
        
        <div className="flex-1 space-y-2">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <h4 className="text-lg font-bold text-foreground mb-1">
                {book.title}
              </h4>
              {book.subtitle && (
                <p className="text-sm text-muted-foreground mb-2">
                  {book.subtitle}
                </p>
              )}
            </div>
            <Badge variant="secondary" className="flex-shrink-0">
              {book.theme.emoji} {book.theme.label}
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground">
            {book.description}
          </p>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{book.estimatedPages} pages</span>
            <span>•</span>
            <span>{book.theme.ageRange}</span>
          </div>
        </div>
      </div>
      
      {/* Objectifs pédagogiques */}
      <div className="bg-secondary/30 rounded-lg p-4">
        <div className="flex items-start gap-2 mb-2">
          <Target className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h5 className="font-semibold text-sm text-foreground mb-2">
              Objectifs pédagogiques
            </h5>
            <p className="text-sm text-muted-foreground">
              {book.pedagogicalSummary}
            </p>
          </div>
        </div>
        
        {book.theme.pedagogicalGoals.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {book.theme.pedagogicalGoals.map((goal, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {goal}
              </Badge>
            ))}
          </div>
        )}
      </div>
      
      {/* Bouton pour afficher/masquer la personnalisation */}
      {book.canCustomize && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? (
            <>
              <ChevronUp className="h-4 w-4 mr-2" />
              Masquer la personnalisation
            </>
          ) : (
            <>
              <Lightbulb className="h-4 w-4 mr-2" />
              Personnaliser cette histoire
            </>
          )}
        </Button>
      )}
      
      {/* Section de personnalisation */}
      {showDetails && book.canCustomize && (
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
          {/* Personnages suggérés */}
          {book.suggestedCharacters && book.suggestedCharacters.length > 0 && (
            <div>
              <label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
                <Users className="h-4 w-4" />
                Qui peut apparaître dans l'histoire ?
              </label>
              <p className="text-xs text-muted-foreground mb-3">
                Sélectionnez les personnages de la famille de {childName} qui apparaîtront dans le livre
              </p>
              <div className="flex flex-wrap gap-2">
                {book.suggestedCharacters.map((character) => (
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
          )}
          
          {/* Questions suggérées */}
          {book.suggestedQuestions && book.suggestedQuestions.length > 0 && (
            <div>
              <label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
                <MessageCircle className="h-4 w-4" />
                Questions à aborder
              </label>
              <p className="text-xs text-muted-foreground mb-3">
                Ajoutez ou sélectionnez des questions/thématiques pour enrichir l'histoire
              </p>
              <div className="space-y-2">
                {book.suggestedQuestions.map((question, idx) => (
                  <div key={idx} className="text-sm p-2 bg-background rounded border">
                    {question}
                  </div>
                ))}
              </div>
              
              {/* Ajouter une question personnalisée */}
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Ajouter votre propre question..."
                  className="flex-1 px-3 py-2 text-sm border rounded-md bg-background"
                  onKeyPress={(e) => e.key === 'Enter' && addQuestion()}
                />
                <Button size="sm" onClick={addQuestion}>
                  Ajouter
                </Button>
              </div>
              
              {customQuestions.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-medium text-foreground">Vos questions :</p>
                  {customQuestions.map((q, idx) => (
                    <div key={idx} className="text-sm p-2 bg-primary/5 rounded border border-primary/20 flex justify-between items-center">
                      <span>{q}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCustomQuestions(prev => prev.filter((_, i) => i !== idx))}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Notes additionnelles */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">
              Notes ou idées supplémentaires
            </label>
            <Textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Événements récents, centres d'intérêt actuels, anecdotes à inclure..."
              className="min-h-[100px] resize-none"
            />
          </div>
          
          <Button 
            className="w-full" 
            onClick={handleSave}
          >
            Enregistrer la personnalisation
          </Button>
        </div>
      )}
      
      {/* Bouton de sélection principal */}
      <Button
        className="w-full"
        variant={isSelected ? "secondary" : "default"}
        size="lg"
        onClick={onSelect}
      >
        {isSelected ? (
          <>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Livre sélectionné
          </>
        ) : (
          <>
            Choisir ce livre
          </>
        )}
      </Button>
    </div>
  );
};

export default MainBookOption;
