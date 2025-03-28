import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Book, Clock, Truck, Tag, FileText, Calendar, 
  Sparkles, Globe, Brain, Flame
} from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

const BookTimeline: React.FC = () => {
  // Mock data - in a real app this would come from an API
  const books = [
    {
      id: "book1",
      status: "in-progress",
      title: "Thomas et le Trésor de la Forêt Enchantée",
      estimatedDelivery: "15 juin 2024",
      cover: null,
      theme: "dragons",
      themeIcon: <Flame className="h-4 w-4" />
    },
    {
      id: "book2",
      status: "delivered",
      title: "L'Aventure de Thomas au Pays des Étoiles",
      deliveryDate: "15 mai 2024",
      cover: null,
      theme: "emotions",
      themeIcon: <Brain className="h-4 w-4" />
    },
    {
      id: "book3",
      status: "delivered",
      title: "Thomas et les Animaux Parlants",
      deliveryDate: "15 avril 2024",
      cover: null,
      theme: "geography",
      themeIcon: <Globe className="h-4 w-4" />
    }
  ];
  
  // Theme suggestions state
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [customTheme, setCustomTheme] = useState('');
  
  const themeOptions = [
    "Océan", "Dinosaures", "Espace", "Fée", "Superhéros", 
    "École", "Animaux", "Sports", "Musique", "Voyage"
  ];
  
  const toggleTheme = (theme: string) => {
    if (selectedThemes.includes(theme)) {
      setSelectedThemes(selectedThemes.filter(t => t !== theme));
    } else {
      setSelectedThemes([...selectedThemes, theme]);
    }
  };
  
  const handleSuggestTheme = () => {
    console.log("Suggested themes:", [...selectedThemes, customTheme].filter(Boolean));
    // Close sheet and show toast
  };
  
  return (
    <div className="space-y-6">
      {/* Upcoming book */}
      {books.filter(book => book.status === "in-progress").map(book => (
        <Card key={book.id} className="border-mcf-amber/30 shadow-md bg-gradient-to-r from-mcf-beige to-white">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-mcf-orange font-semibold mb-2">
              <Truck className="h-5 w-5" /> EN PRÉPARATION
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-mcf-orange-dark mb-2">{book.title}</h3>
                
                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <Clock className="h-4 w-4" /> 
                  <span>Livraison prévue autour du {book.estimatedDelivery}</span>
                </div>
                
                <div className="inline-flex items-center px-3 py-1 bg-mcf-amber/20 text-mcf-orange-dark rounded-full text-sm gap-1.5 mb-4">
                  {book.themeIcon}
                  <span>Thème: {book.theme === "dragons" ? "Dragons" : book.theme === "emotions" ? "Émotions" : "Géographie"}</span>
                </div>
              </div>
              
              <div className="flex-shrink-0 w-24 h-32 bg-mcf-amber/30 rounded-lg flex items-center justify-center">
                {book.cover ? (
                  <img src={book.cover} alt={book.title} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <Book className="h-10 w-10 text-mcf-orange" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {/* Theme suggestion button */}
      <div className="flex justify-end">
        <Sheet>
          <SheetTrigger asChild>
            <Button className="bg-mcf-amber hover:bg-mcf-orange text-mcf-orange-dark hover:text-white gap-2">
              <Tag className="h-4 w-4" /> Suggérer un thème
            </Button>
          </SheetTrigger>
          <SheetContent className="bg-white">
            <SheetHeader>
              <SheetTitle className="text-mcf-orange-dark">Suggérer un thème</SheetTitle>
              <SheetDescription>
                Aidez-nous à personnaliser la prochaine histoire ! Qu'aimerait découvrir votre enfant ?
              </SheetDescription>
            </SheetHeader>
            
            <div className="mt-6">
              <h4 className="font-medium mb-2">Choisissez parmi nos thèmes:</h4>
              <div className="flex flex-wrap gap-2 mb-4">
                {themeOptions.map(theme => (
                  <button
                    key={theme}
                    className={`px-3 py-1.5 rounded-full text-sm ${
                      selectedThemes.includes(theme) 
                        ? 'bg-mcf-orange text-white' 
                        : 'bg-mcf-amber/20 text-mcf-orange-dark hover:bg-mcf-amber/40'
                    }`}
                    onClick={() => toggleTheme(theme)}
                  >
                    {theme}
                  </button>
                ))}
              </div>
              
              <div className="mb-4">
                <label htmlFor="customTheme" className="block font-medium mb-1">Ou proposez un thème personnalisé:</label>
                <input
                  id="customTheme"
                  type="text"
                  className="w-full px-3 py-2 border border-mcf-amber/30 rounded-md focus:outline-none focus:ring-2 focus:ring-mcf-orange"
                  placeholder="Ex: Les sports d'hiver"
                  value={customTheme}
                  onChange={(e) => setCustomTheme(e.target.value)}
                />
              </div>
              
              <Button 
                className="w-full bg-mcf-orange hover:bg-mcf-orange-dark text-white"
                onClick={handleSuggestTheme}
              >
                Envoyer ma suggestion
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Past books timeline */}
      <div className="border-l-2 border-mcf-amber/40 pl-6 ml-3 space-y-6 mt-10">
        <h3 className="text-lg font-semibold text-mcf-orange-dark -ml-9 mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" /> Histoires précédentes
        </h3>
        
        {books.filter(book => book.status === "delivered").map(book => (
          <div key={book.id} className="relative">
            <div className="absolute -left-9 mt-1 w-4 h-4 rounded-full bg-mcf-orange"></div>
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-shrink-0 w-20 h-28 bg-mcf-amber/20 rounded-lg flex items-center justify-center">
                {book.cover ? (
                  <img src={book.cover} alt={book.title} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <Book className="h-8 w-8 text-mcf-orange/70" />
                )}
              </div>
              
              <div>
                <span className="text-sm text-gray-500">{book.deliveryDate}</span>
                <h4 className="text-lg font-semibold text-mcf-orange-dark mb-1">{book.title}</h4>
                <div className="inline-flex items-center px-2.5 py-0.5 bg-mcf-amber/20 text-mcf-orange-dark rounded-full text-sm gap-1.5 mb-2">
                  {book.themeIcon}
                  <span>{book.theme === "emotions" ? "Émotions" : "Géographie"}</span>
                </div>
                <div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-mcf-orange border-mcf-amber/30 hover:bg-mcf-amber/10 gap-1"
                  >
                    <FileText className="h-3.5 w-3.5" /> Relire l'histoire
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        <div className="flex justify-center mt-4">
          <Button 
            variant="ghost" 
            className="text-mcf-orange-dark hover:bg-mcf-amber/10 gap-2"
          >
            <Sparkles className="h-4 w-4" /> Voir l'évolution de l'enfant à travers ses livres
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookTimeline;
