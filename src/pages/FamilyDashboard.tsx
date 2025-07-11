
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
  
  // Example data - in a real application, this would come from an API
  const mockChildren = [
    {
      id: "child1",
      firstName: "Thomas",
      age: "7",
      avatar: null,
      personalityEmoji: "🦸‍♂️",
      relatives: 3,
      hasToys: true,
      hasPets: 2
    },
    {
      id: "child2",
      firstName: "Léa",
      age: "5",
      avatar: null,
      personalityEmoji: "🧚",
      relatives: 2,
      hasToys: true,
      hasPets: 1
    }
  ];

  const mockFamilyCode = "MCF-THOMAS";
  
  const mockSubscription = {
    type: "Mensuel",
    price: "9,90€/mois",
    nextPayment: "15/06/2024",
    address: "123 Rue de la Magie, 75001 Paris"
  };
  
  const handleLogout = () => {
    logout();
    toast.success("Vous avez été déconnecté avec succès.");
    navigate('/');
  };
  
  console.log('🏠 FamilyDashboard: Composant chargé pour user:', user);
  return (
    <div className="min-h-screen bg-gradient-to-b from-mcf-cream via-mcf-cream to-white">
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
              <Button 
                className="bg-mcf-orange hover:bg-mcf-orange-dark text-white gap-2"
                onClick={() => navigate('/creer-profil-enfant')}
              >
                <Plus className="h-4 w-4" /> Nouvel enfant
              </Button>
              
              <Button 
                className="bg-mcf-orange hover:bg-mcf-orange-dark text-white gap-2"
                onClick={() => navigate('/offrir/profil-enfant')}
              >
                <ShoppingBag className="h-4 w-4" /> Offrir un nouveau livre
              </Button>
            </div>
          </section>
          
          {/* Section 1: Children Profiles */}
          <section className="animate-fade-in">
            <h2 className="flex items-center gap-2 text-2xl font-bold mb-4 text-mcf-orange-dark">
              <Baby className="h-6 w-6" /> Mes enfants
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              {mockChildren.map((child) => (
                <ChildProfileCard key={child.id} child={child} />
              ))}
            </div>
            
            <Button 
              className="bg-mcf-orange hover:bg-mcf-orange-dark text-white gap-2 mt-2"
              onClick={() => navigate('/creer-profil-enfant')}
            >
              <Plus className="h-4 w-4" /> Ajouter un nouvel enfant
            </Button>
          </section>
          
          {/* Section 2: Books */}
          <section className="animate-fade-in animation-delay-100">
            <h2 className="flex items-center gap-2 text-2xl font-bold mb-4 text-mcf-orange-dark">
              <Book className="h-6 w-6" /> Mes livres MCF
            </h2>
            
            <BookTimeline />
          </section>
          
          {/* Section 3: Family Code Sharing */}
          <section className="animate-fade-in animation-delay-200">
            <h2 className="flex items-center gap-2 text-2xl font-bold mb-4 text-mcf-orange-dark">
              <Gift className="h-6 w-6" /> Offrir un livre avec mon code famille
            </h2>
            
            <FamilyCodeShare familyCode={mockFamilyCode} />
          </section>
          
          {/* Section 4: Story Customization */}
          <section className="animate-fade-in animation-delay-300">
            <h2 className="flex items-center gap-2 text-2xl font-bold mb-4 text-mcf-orange-dark">
              <MessageSquarePlus className="h-6 w-6" /> Personnaliser encore plus les prochaines histoires
            </h2>
            
            <StoryCustomizationForm />
          </section>
          
          {/* Section 5: Subscription Management */}
          <section className="animate-fade-in animation-delay-400">
            <h2 className="flex items-center gap-2 text-2xl font-bold mb-4 text-mcf-orange-dark">
              <Settings className="h-6 w-6" /> Mon abonnement
            </h2>
            
            <SubscriptionSummary subscription={mockSubscription} />
          </section>
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
