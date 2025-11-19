
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Sparkles } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Card } from "@/components/ui/card";

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
