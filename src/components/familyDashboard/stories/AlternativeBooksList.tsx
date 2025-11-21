import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Book, CheckCircle2 } from 'lucide-react';
import { AlternativeBook } from '@/types/bookTimeline';

interface AlternativeBooksListProps {
  books: AlternativeBook[];
  selectedBookId?: string;
  onSelectBook: (bookId: string) => void;
}

const AlternativeBooksList: React.FC<AlternativeBooksListProps> = ({
  books,
  selectedBookId,
  onSelectBook,
}) => {
  if (books.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Book className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p>Aucune alternative disponible pour ce mois</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground mb-4">
        Choisissez parmi ces {books.length} alternative{books.length > 1 ? 's' : ''} au livre suggéré
      </p>
      
      {books.map((book) => {
        const isSelected = selectedBookId === book.id;
        
        return (
          <div
            key={book.id}
            className={`
              p-4 rounded-lg border-2 transition-all
              ${isSelected 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50 bg-card'
              }
            `}
          >
            <div className="flex gap-4">
              {/* Miniature */}
              {book.coverImageUrl ? (
                <div className="flex-shrink-0 w-20 h-28 rounded-md overflow-hidden shadow-sm bg-muted">
                  <img 
                    src={book.coverImageUrl} 
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex-shrink-0 w-20 h-28 rounded-md bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shadow-sm">
                  <Book className="h-8 w-8 text-primary/40" />
                </div>
              )}
              
              {/* Contenu */}
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-foreground">
                    {book.title}
                  </h4>
                  <Badge variant="secondary" className="flex-shrink-0 text-xs">
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
                
                <Button
                  className="mt-2"
                  variant={isSelected ? "secondary" : "default"}
                  size="sm"
                  onClick={() => onSelectBook(book.id)}
                >
                  {isSelected ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                      Sélectionné
                    </>
                  ) : (
                    'Choisir ce livre'
                  )}
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AlternativeBooksList;
