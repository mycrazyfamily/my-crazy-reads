
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';

import { useAuthForm } from '@/hooks/useAuthForm';

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
  const {
    formData,
    isLoading,
    handleInputChange,
    handleLogin,
    handleRegister,
    handleResetPassword
  } = useAuthForm();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-24 max-w-4xl">
        <Button 
          variant="ghost" 
          onClick={handleGoBack}
          className="flex items-center gap-2 text-gray-600 hover:text-mcf-orange-dark hover:bg-mcf-amber/10 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 text-mcf-orange-dark">
          Mon compte My Crazy Family
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Connectez-vous ou créez un compte pour accéder à votre espace famille
        </p>
        
        <div className="mx-auto max-w-md">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Se connecter</TabsTrigger>
              <TabsTrigger value="register">Créer un compte</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <LoginForm
                formData={formData}
                isLoading={isLoading}
                onInputChange={handleInputChange}
                onSubmit={handleLogin}
                onResetPassword={handleResetPassword}
              />
            </TabsContent>
            
            <TabsContent value="register">
              <RegisterForm
                formData={formData}
                isLoading={isLoading}
                onInputChange={handleInputChange}
                onSubmit={handleRegister}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Authentication;
