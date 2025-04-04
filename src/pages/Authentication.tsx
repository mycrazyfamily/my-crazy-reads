
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Mail, Lock, ArrowLeft, LogIn, UserPlus } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Authentication: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { from } = location.state || { from: { pathname: '/espace-famille' } };
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulating API call
    setTimeout(() => {
      setIsLoading(false);
      // Fake successful login for demonstration
      toast.success("Connexion réussie !");
      localStorage.setItem('mcf_user', JSON.stringify({ email: formData.email, isAuthenticated: true }));
      navigate(from);
    }, 1500);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }
    
    setIsLoading(true);
    
    // Simulating API call
    setTimeout(() => {
      setIsLoading(false);
      // Fake successful registration for demonstration
      toast.success("Compte créé avec succès !");
      localStorage.setItem('mcf_user', JSON.stringify({ email: formData.email, isAuthenticated: true }));
      navigate(from);
    }, 1500);
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Veuillez saisir une adresse email valide.");
      return;
    }
    
    setIsLoading(true);
    
    // Simulating API call
    setTimeout(() => {
      setIsLoading(false);
      setMagicLinkSent(true);
      toast.success("Un lien de connexion a été envoyé à votre adresse email.");
    }, 1500);
  };

  const handleSkip = () => {
    localStorage.setItem('mcf_user', JSON.stringify({ email: 'guest', isAuthenticated: true, isTemporary: true }));
    toast.success("Compte temporaire créé. Vous pourrez le sauvegarder plus tard.");
    navigate(from);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-mcf-cream">
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
        
        {magicLinkSent ? (
          <Card className="mx-auto max-w-md">
            <CardHeader>
              <CardTitle className="text-center">Lien de connexion envoyé !</CardTitle>
              <CardDescription className="text-center">
                Vérifiez votre boîte de réception
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-4">
                Nous avons envoyé un lien magique de connexion à <strong>{formData.email}</strong>. 
                Cliquez sur ce lien pour vous connecter automatiquement.
              </p>
              <Button onClick={() => setMagicLinkSent(false)} variant="outline">
                Retour
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="mx-auto max-w-md">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Se connecter</TabsTrigger>
                <TabsTrigger value="register">Créer un compte</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle>Connexion</CardTitle>
                    <CardDescription>
                      Connectez-vous pour accéder à votre espace famille
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Adresse email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input 
                            id="email" 
                            name="email"
                            type="email" 
                            placeholder="votre@email.com" 
                            className="pl-10"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Mot de passe</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input 
                            id="password" 
                            name="password"
                            type="password" 
                            className="pl-10"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-mcf-orange hover:bg-mcf-orange-dark"
                        disabled={isLoading}
                      >
                        {isLoading ? "Connexion en cours..." : "Se connecter"}
                        <LogIn className="ml-2 h-4 w-4" />
                      </Button>
                    </form>
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-4">
                    <div className="relative w-full">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-300" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-500">Ou</span>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleMagicLink} 
                      variant="outline" 
                      className="w-full"
                      disabled={isLoading}
                    >
                      Connexion par lien magique
                      <Mail className="ml-2 h-4 w-4" />
                    </Button>
                    
                    <Button 
                      onClick={handleSkip} 
                      variant="ghost" 
                      className="w-full text-gray-500"
                    >
                      Continuer sans compte
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="register">
                <Card>
                  <CardHeader>
                    <CardTitle>Créer un compte</CardTitle>
                    <CardDescription>
                      Rejoignez l'aventure My Crazy Family
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-email">Adresse email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input 
                            id="register-email" 
                            name="email"
                            type="email" 
                            placeholder="votre@email.com" 
                            className="pl-10"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-password">Mot de passe</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input 
                            id="register-password" 
                            name="password"
                            type="password" 
                            className="pl-10"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input 
                            id="confirm-password" 
                            name="confirmPassword"
                            type="password" 
                            className="pl-10"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-mcf-orange hover:bg-mcf-orange-dark"
                        disabled={isLoading}
                      >
                        {isLoading ? "Création en cours..." : "Créer mon compte"}
                        <UserPlus className="ml-2 h-4 w-4" />
                      </Button>
                    </form>
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-4">
                    <div className="relative w-full">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-300" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-500">Ou</span>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleMagicLink} 
                      variant="outline" 
                      className="w-full"
                      disabled={isLoading}
                    >
                      Inscription par lien magique
                      <Mail className="ml-2 h-4 w-4" />
                    </Button>
                    
                    <Button 
                      onClick={handleSkip} 
                      variant="ghost" 
                      className="w-full text-gray-500"
                    >
                      Continuer sans compte
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Authentication;
