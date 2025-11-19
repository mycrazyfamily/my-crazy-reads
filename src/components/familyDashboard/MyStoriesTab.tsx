import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Book, Calendar, Package, CheckCircle2, Clock, Sparkles, MessageSquare, ChevronRight } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface Child {
  id: string;
  firstName: string;
  avatar: string | null;
  personalityEmoji: string;
}

interface MyStoriesTabProps {
  children: Child[];
}

const MyStoriesTab: React.FC<MyStoriesTabProps> = ({ children }) => {
  // Mock data pour les livres (à remplacer par de vraies données depuis la DB)
  const getChildBooks = (childId: string) => [
    {
      id: '1',
      title: 'L\'aventure magique de Noël',
      status: 'received',
      deliveryDate: '15 novembre 2025',
      imageUrl: '/lovable-uploads/book-noel.png',
      canAddDetails: false,
      theme: 'Noël et magie',
    },
    {
      id: '2',
      title: 'À définir',
      status: 'pending_choice',
      deliveryDate: '15 décembre 2025',
      imageUrl: null,
      canAddDetails: false,
      needsChoice: true,
      proposedThemes: ['Pirates', 'Espace'],
    },
    {
      id: '3',
      title: 'À personnaliser',
      status: 'needs_details',
      deliveryDate: '15 janvier 2026',
      imageUrl: null,
      canAddDetails: true,
      theme: 'Au choix',
    },
    {
      id: '4',
      title: 'En préparation',
      status: 'validated',
      deliveryDate: '15 février 2026',
      imageUrl: null,
      canAddDetails: false,
      theme: 'Animaux de la ferme',
    },
  ];

  const statusConfig = {
    received: {
      label: 'Reçu',
      icon: CheckCircle2,
      color: 'bg-green-100 text-green-700 border-green-200',
      iconColor: 'text-green-600',
    },
    printing: {
      label: 'En impression',
      icon: Package,
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      iconColor: 'text-blue-600',
    },
    validated: {
      label: 'Validé',
      icon: CheckCircle2,
      color: 'bg-purple-100 text-purple-700 border-purple-200',
      iconColor: 'text-purple-600',
    },
    needs_details: {
      label: 'À personnaliser',
      icon: MessageSquare,
      color: 'bg-orange-100 text-orange-700 border-orange-200',
      iconColor: 'text-orange-600',
    },
    pending_choice: {
      label: 'Choix de thème',
      icon: Sparkles,
      color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      iconColor: 'text-yellow-600',
    },
    in_progress: {
      label: 'En cours',
      icon: Clock,
      color: 'bg-gray-100 text-gray-700 border-gray-200',
      iconColor: 'text-gray-600',
    },
  };

  if (children.length === 0) {
    return (
      <Card className="p-12 text-center border-2 border-dashed border-mcf-mint/50 bg-gradient-to-br from-mcf-cream/30 to-white">
        <div className="flex flex-col items-center gap-6">
          <div className="p-6 rounded-full bg-mcf-primary/10">
            <Book className="h-16 w-16 text-mcf-primary" strokeWidth={1.5} />
          </div>
          <div className="space-y-2 max-w-md">
            <h3 className="text-2xl font-bold text-mcf-orange-dark">
              Commencez votre aventure
            </h3>
            <p className="text-gray-600">
              Ajoutez le profil de votre enfant pour créer ses premières histoires personnalisées
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-12">
      {children.map((child) => {
        const books = getChildBooks(child.id);
        
        return (
          <div key={child.id} className="space-y-6">
            {/* En-tête enfant */}
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-mcf-primary/20 to-mcf-mint/20 flex items-center justify-center text-3xl border-2 border-mcf-primary/30">
                {child.personalityEmoji || child.firstName.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-mcf-orange-dark">
                  Les histoires de {child.firstName}
                </h2>
                <p className="text-gray-600">12 prochains mois • {books.length} livres</p>
              </div>
            </div>

            {/* Timeline des livres */}
            <div className="space-y-4">
              {books.map((book, index) => {
                const config = statusConfig[book.status];
                const StatusIcon = config.icon;
                const isFirst = index === 0;

                return (
                  <Card 
                    key={book.id}
                    className={`
                      overflow-hidden border-2 transition-all duration-300
                      ${isFirst 
                        ? 'border-mcf-primary shadow-lg scale-[1.02]' 
                        : 'border-gray-200 hover:border-mcf-primary/50 hover:shadow-md'
                      }
                    `}
                  >
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        {/* Partie gauche : info livre */}
                        <div className="flex-1 p-6 space-y-4">
                          {/* Statut et date */}
                          <div className="flex items-center justify-between flex-wrap gap-3">
                            <Badge className={`${config.color} border px-3 py-1`}>
                              <StatusIcon className="h-3.5 w-3.5 mr-1.5" />
                              {config.label}
                            </Badge>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span>Livraison prévue : {book.deliveryDate}</span>
                            </div>
                          </div>

                          {/* Titre et thème */}
                          <div>
                            <h3 className="text-xl font-bold text-mcf-orange-dark mb-1">
                              {book.title}
                            </h3>
                            {book.theme && (
                              <p className="text-sm text-gray-600">
                                Thème : {book.theme}
                              </p>
                            )}
                          </div>

                          {/* Image aperçu si disponible */}
                          {book.imageUrl && (
                            <div className="w-32 h-32 rounded-lg overflow-hidden shadow-md">
                              <img 
                                src={book.imageUrl} 
                                alt={book.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                        </div>

                        {/* Partie droite : actions */}
                        <div className="md:w-80 bg-gradient-to-br from-mcf-cream/30 to-mcf-mint/10 p-6 border-t md:border-t-0 md:border-l-2 border-gray-200">
                          {book.status === 'received' && (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                              <CheckCircle2 className="h-12 w-12 text-green-500" />
                              <p className="text-sm font-medium text-gray-700">
                                Livre déjà reçu
                              </p>
                            </div>
                          )}

                          {book.status === 'needs_details' && (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <label className="text-sm font-semibold text-mcf-orange-dark flex items-center gap-2">
                                  <Sparkles className="h-4 w-4" />
                                  Ajouter des détails
                                </label>
                                <Textarea
                                  placeholder="Ajoutez des éléments personnalisés : un événement récent, un nouveau centre d'intérêt, une anecdote..."
                                  className="min-h-[120px] resize-none border-2 focus:border-mcf-primary"
                                />
                              </div>
                              <Button className="w-full bg-mcf-primary hover:bg-mcf-primary/90 shadow-md">
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Enregistrer mes idées
                              </Button>
                            </div>
                          )}

                          {book.status === 'pending_choice' && book.needsChoice && (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <label className="text-sm font-semibold text-mcf-orange-dark flex items-center gap-2">
                                  <Sparkles className="h-4 w-4" />
                                  Choisissez un thème
                                </label>
                                <p className="text-xs text-gray-600">
                                  Sélectionnez l'univers pour la prochaine histoire
                                </p>
                              </div>
                              <div className="space-y-2">
                                {book.proposedThemes?.map((theme) => (
                                  <Button
                                    key={theme}
                                    variant="outline"
                                    className="w-full justify-between border-2 hover:border-mcf-primary hover:bg-mcf-primary/5"
                                  >
                                    <span>{theme}</span>
                                    <ChevronRight className="h-4 w-4" />
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}

                          {(book.status === 'validated' || book.status === 'printing' || book.status === 'in_progress') && (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                              <Clock className="h-12 w-12 text-mcf-primary animate-pulse" />
                              <p className="text-sm font-medium text-gray-700">
                                {book.status === 'printing' 
                                  ? 'Votre livre est en cours d\'impression'
                                  : 'Histoire en préparation'
                                }
                              </p>
                              <p className="text-xs text-gray-600">
                                Vous serez notifié à chaque étape
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MyStoriesTab;
