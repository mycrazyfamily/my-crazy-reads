
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { 
  Baby, Book, Gift, User, Clock, Truck, Edit, Plus, Settings, 
  LogOut, Home, Heart, HelpCircle, Copy, ExternalLink, MessageSquarePlus,
  ShoppingBag
} from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { toast } from "sonner";
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChildProfileCard from '@/components/familyDashboard/ChildProfileCard';
import BookTimeline from '@/components/familyDashboard/BookTimeline';
import FamilyCodeShare from '@/components/familyDashboard/FamilyCodeShare';
import StoryCustomizationForm from '@/components/familyDashboard/StoryCustomizationForm';
import SubscriptionSummary from '@/components/familyDashboard/SubscriptionSummary';

const FamilyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  
  // Real data - will be fetched from API in production
  const children = []; // Empty for new users
  const books = []; // Empty for new users
  const familyCode = null; // Will be generated when first child is added
  const subscription = null; // Will be set when user subscribes
  
  const handleLogout = () => {
    logout();
    toast.success("Vous avez été déconnecté avec succès.");
    navigate('/');
  };
  
  console.log('🏠 FamilyDashboard: Composant chargé pour user:', user);
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-20 max-w-5xl">
        <div className="flex items-center justify-between mb-8 mt-10">
          <div className="flex items-center gap-3">
            <div className="bg-mcf-amber/20 p-2.5 rounded-full">
              <Home className="h-7 w-7 text-mcf-orange" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-mcf-orange-dark">Mon Espace Famille</h1>
          </div>
          
          {/* Menu Paramètres */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="border-mcf-orange/30 text-mcf-orange-dark hover:bg-mcf-amber/10">
                <Settings className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle className="text-mcf-orange-dark">Paramètres</SheetTitle>
                <SheetDescription>
                  Gérez votre compte et vos préférences
                </SheetDescription>
              </SheetHeader>
              
              <div className="mt-6 space-y-4">
                <div className="p-4 bg-mcf-cream/50 rounded-lg">
                  <div className="text-sm font-medium text-mcf-orange-dark mb-1">Adresse email</div>
                  <div className="text-sm text-gray-600 select-text">{user?.email || "Ma famille"}</div>
                </div>
                
                <Button 
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full justify-start gap-2 border-red-200 text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        
        <div className="grid gap-8">
          {/* Quick action buttons */}
          <section className="animate-fade-in">
            <div className="flex flex-wrap gap-3 mb-6">
              {/* 1. Ajouter un nouvel enfant - toujours visible */}
              <Button 
                className="bg-mcf-orange hover:bg-mcf-orange-dark text-white gap-2"
                onClick={() => navigate('/creer-profil-enfant')}
              >
                <Plus className="h-4 w-4" /> Ajouter un nouvel enfant
              </Button>
              
              {/* 2. Ajouter un proche - désactivé si pas d'enfant */}
              <div className="relative">
                <Button 
                  className={`gap-2 ${children.length === 0 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300' 
                    : 'bg-mcf-primary hover:bg-mcf-primary/90 text-white'
                  }`}
                  onClick={children.length > 0 ? () => navigate('/ajouter-proche') : undefined}
                  disabled={children.length === 0}
                >
                  <User className="h-4 w-4" /> Ajouter un proche
                </Button>
                {children.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1 absolute whitespace-nowrap">
                    Ajoutez d'abord un enfant pour pouvoir renseigner ses proches.
                  </p>
                )}
              </div>
              
              {/* 3. Offrir un nouveau livre - désactivé si pas d'enfant */}
              <div className="relative">
                <Button 
                  className={`gap-2 ${children.length === 0 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300' 
                    : 'bg-mcf-secondary hover:bg-mcf-secondary/90 text-white'
                  }`}
                  onClick={children.length > 0 ? () => navigate('/offrir/profil-enfant') : undefined}
                  disabled={children.length === 0}
                >
                  <ShoppingBag className="h-4 w-4" /> Offrir un nouveau livre
                </Button>
                {children.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1 absolute whitespace-nowrap">
                    Créez d'abord le profil d'un enfant pour lui offrir un livre personnalisé.
                  </p>
                )}
              </div>
            </div>
          </section>
          
          {/* Section 1: Children Profiles */}
          <section className="animate-fade-in">
            <h2 className="flex items-center gap-2 text-2xl font-bold mb-4 text-mcf-orange-dark">
              <Baby className="h-6 w-6" /> Mes enfants
            </h2>
            
            {children.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  {children.map((child) => (
                    <ChildProfileCard key={child.id} child={child} />
                  ))}
                </div>
                
                <Button 
                  className="bg-mcf-orange hover:bg-mcf-orange-dark text-white gap-2 mt-2"
                  onClick={() => navigate('/creer-profil-enfant')}
                >
                  <Plus className="h-4 w-4" /> Ajouter un nouvel enfant
                </Button>
              </>
            ) : (
              <Card className="p-8 text-center bg-gradient-to-br from-mcf-mint/10 to-mcf-cream/50 border-mcf-mint">
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-mcf-mint/20 p-4 rounded-full">
                    <Baby className="h-8 w-8 text-mcf-primary" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-mcf-orange-dark">
                      Vous n'avez encore ajouté aucun enfant.
                    </p>
                    <p className="text-gray-600">
                      Cliquez sur le bouton ci-dessous pour commencer.
                    </p>
                  </div>
                  <Button 
                    className="bg-mcf-primary hover:bg-mcf-primary/90 text-white gap-2 text-lg px-6 py-3 mt-2"
                    onClick={() => navigate('/creer-profil-enfant')}
                  >
                    <Plus className="h-5 w-5" /> Ajouter mon premier enfant
                  </Button>
                </div>
              </Card>
            )}
          </section>
          
          {/* Section 2: Books */}
          <section className="animate-fade-in animation-delay-100">
            <h2 className="flex items-center gap-2 text-2xl font-bold mb-4 text-mcf-orange-dark">
              <Book className="h-6 w-6" /> Mes livres MCF
            </h2>
            
            {books.length > 0 ? (
              <BookTimeline />
            ) : (
              <Card className="p-8 text-center bg-gradient-to-br from-mcf-secondary/10 to-mcf-cream/50 border-mcf-secondary">
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-mcf-secondary/20 p-4 rounded-full">
                    <Book className="h-8 w-8 text-mcf-secondary" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-mcf-orange-dark">
                      Aucune histoire n'a encore été créée pour vos enfants.
                    </p>
                    <p className="text-gray-600">
                      Les histoires que vous lirez avec vos enfants apparaîtront ici.
                    </p>
                  </div>
                  {children.length > 0 && (
                    <Button 
                      className="bg-mcf-secondary hover:bg-mcf-secondary/90 text-white gap-2 text-lg px-6 py-3 mt-2"
                      onClick={() => navigate('/personnaliser-histoire')}
                    >
                      <MessageSquarePlus className="h-5 w-5" /> Créer ma première histoire
                    </Button>
                  )}
                </div>
              </Card>
            )}
          </section>
          
          {/* Section 3: Family Code Sharing */}
          <section className="animate-fade-in animation-delay-200">
            <h2 className="flex items-center gap-2 text-2xl font-bold mb-4 text-mcf-orange-dark">
              <Gift className="h-6 w-6" /> Offrir un livre avec mon code famille
            </h2>
            
            {familyCode ? (
              <FamilyCodeShare familyCode={familyCode} />
            ) : (
              <Card className={`p-8 text-center bg-gradient-to-br from-mcf-amber/10 to-mcf-cream/50 border-mcf-mint ${children.length === 0 ? 'opacity-60' : ''}`}>
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-mcf-amber/20 p-4 rounded-full">
                    <Gift className="h-8 w-8 text-mcf-orange" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-mcf-orange-dark">
                      {children.length === 0 
                        ? "Ajoutez un enfant pour générer votre code famille et offrir un livre à vos proches."
                        : "Votre code famille sera généré automatiquement."
                      }
                    </p>
                    <p className="text-gray-600">
                      Partagez la magie des histoires personnalisées avec votre famille.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </section>
          
          {/* Section 4: Story Customization - Only show if user has children */}
          {children.length > 0 && (
            <section className="animate-fade-in animation-delay-300">
              <h2 className="flex items-center gap-2 text-2xl font-bold mb-4 text-mcf-orange-dark">
                <MessageSquarePlus className="h-6 w-6" /> Personnaliser encore plus les prochaines histoires
              </h2>
              
              <StoryCustomizationForm />
            </section>
          )}
          
          {/* Section 5: Subscription Management */}
          {subscription && (
            <section className="animate-fade-in animation-delay-400">
              <h2 className="flex items-center gap-2 text-2xl font-bold mb-4 text-mcf-orange-dark">
                <Settings className="h-6 w-6" /> Mon abonnement
              </h2>
              
              <SubscriptionSummary subscription={subscription} />
            </section>
          )}
        </div>
        
        {/* Footer Actions */}
        <div className="mt-12 pb-8 border-t border-mcf-amber/30 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="border-mcf-orange/30 text-mcf-orange-dark hover:bg-mcf-amber/10 gap-2"
              onClick={() => navigate('/')}
            >
              <Home className="h-4 w-4" /> Retour à l'accueil
            </Button>
            
            <Button 
              variant="outline" 
              className="border-mcf-orange/30 text-mcf-orange-dark hover:bg-mcf-amber/10 gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" /> Déconnexion
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            className="text-mcf-orange-dark hover:bg-mcf-amber/10 gap-2"
            onClick={() => navigate('/contact')}
          >
            <HelpCircle className="h-4 w-4" /> Besoin d'aide ? Contactez-nous
          </Button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default FamilyDashboard;
