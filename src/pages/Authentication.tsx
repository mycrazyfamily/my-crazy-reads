// Authentication v1.2
// Changelog v1.2 :
//   (a) Sparkles était IMPORTÉ SANS ÊTRE UTILISÉ : import retiré.
//   (b) Branchement du panneau de confirmation après « Mot de passe oublié »
//       (resetEmailSent / clearResetEmailSent, voir useAuthForm v1.3).
// Authentication v1.1
// Changelog v1.1 (D4 — seconde couche) : rien n'empêchait un utilisateur DÉJÀ CONNECTÉ de voir
//   cette page (route publique, sans RouteGuard dans App.tsx) — par retour arrière ou en tapant
//   l'URL. Il tombait alors sur un formulaire de connexion vide et se croyait déconnecté.
//   Désormais : s'il est authentifié, on le renvoie vers l'espace famille (en `replace`, pour ne
//   pas créer d'aller-retour dans l'historique). Tant que la session n'est pas résolue
//   (isLoading), on affiche un état de chargement plutôt que le formulaire — sinon celui-ci
//   apparaîtrait brièvement au rechargement d'un utilisateur connecté, exactement l'effet qu'on
//   cherche à supprimer. Un visiteur non connecté voit la page normalement.
import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Card } from "@/components/ui/card";

import { useAuthForm } from '@/hooks/useAuthForm';
import { useAuth } from '@/hooks/useAuth';

/**
 * TODO: Important - Authentication Flow
 * --------------------------------------
 * Le trigger 'on_auth_user_created' et la fonction 'handle_new_user()' sont temporairement 
 * désactivés pour déboguer les problèmes d'inscription.
 * 
 * L'inscription est maintenant gérée dans le code client avec la création manuelle 
 * du profil utilisateur dans la table user_profiles et la génération d'un family_id
 * via crypto.randomUUID().
 * 
 * Une fois le flux d'inscription stable :
 * 1. Revoir et corriger la fonction handle_new_user()
 * 2. Réactiver le trigger
 * 3. Tester le flux d'authentification complet avec création du profil utilisateur
 */

const Authentication: React.FC = () => {
  const navigate = useNavigate();
  // Alias : `isLoading` est déjà pris par useAuthForm (chargement du FORMULAIRE). Ici il s'agit de
  // la résolution de la SESSION — deux notions distinctes, d'où le renommage.
  const { isAuthenticated, isLoading: isSessionLoading } = useAuth();
  const {
    formData,
    isLoading,
    handleInputChange,
    handleLogin,
    handleRegister,
    handleResetPassword,
    resetEmailSent,
    clearResetEmailSent
  } = useAuthForm();

  const handleGoBack = () => {
    navigate(-1);
  };

  // D4 — on attend que la session soit résolue avant de décider quoi afficher.
  if (isSessionLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-mcf-primary" aria-label="Chargement" />
        </main>
        <Footer />
      </div>
    );
  }

  // D4 — un utilisateur déjà connecté n'a rien à faire sur la page de connexion.
  if (isAuthenticated) {
    return <Navigate to="/espace-famille" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-16">

        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Button 
            variant="ghost" 
            onClick={handleGoBack}
            className="flex items-center gap-2 text-mcf-primary hover:text-mcf-secondary hover:bg-mcf-mint/20 mb-8 font-semibold"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          
          <div className="mx-auto max-w-md">
            <Card className="border-2 border-mcf-mint/30 shadow-xl overflow-hidden animate-fade-in">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 rounded-none border-b-2 border-mcf-mint/20 bg-gradient-to-r from-mcf-mint/10 to-mcf-secondary/10 p-1">
                  <TabsTrigger 
                    value="login" 
                    className="data-[state=active]:bg-white data-[state=active]:text-mcf-primary data-[state=active]:shadow-md data-[state=active]:border-2 data-[state=active]:border-mcf-mint/50 rounded-lg font-bold transition-all"
                  >
                    Se connecter
                  </TabsTrigger>
                  <TabsTrigger 
                    value="register"
                    className="data-[state=active]:bg-white data-[state=active]:text-mcf-primary data-[state=active]:shadow-md data-[state=active]:border-2 data-[state=active]:border-mcf-mint/50 rounded-lg font-bold transition-all"
                  >
                    Créer un compte
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="p-6">
                  <LoginForm
                    formData={formData}
                    isLoading={isLoading}
                    onInputChange={handleInputChange}
                    onSubmit={handleLogin}
                    onResetPassword={handleResetPassword}
                    resetEmailSent={resetEmailSent}
                    onBackFromReset={clearResetEmailSent}
                  />
                </TabsContent>
                
                <TabsContent value="register" className="p-6">
                  <RegisterForm
                    formData={formData}
                    isLoading={isLoading}
                    onInputChange={handleInputChange}
                    onSubmit={handleRegister}
                  />
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Authentication;
