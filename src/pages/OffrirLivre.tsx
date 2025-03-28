import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Gift, User, Sparkles, Key, ArrowLeft } from 'lucide-react';
import { toast } from "sonner";
import { useState } from 'react';

const OffrirLivre = () => {
  const [familyCode, setFamilyCode] = useState('');
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/');
  };

  const handleNoCodeContinue = () => {
    navigate('/offrir/profil-enfant');
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!familyCode.trim()) {
      toast.error("Veuillez saisir un code famille");
      return;
    }
    
    // Simulating code validation - would need to integrate with backend
    if (familyCode.startsWith('MCF-')) {
      navigate('/offrir/profil-enfant', { 
        state: { familyCode: familyCode } 
      });
    } else {
      toast.error("Code famille invalide. Vérifiez le format (ex: MCF-ROBIN)");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-mcf-cream to-white py-12">
      <div className="container px-4 mx-auto max-w-4xl">
        {/* Bouton retour */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={handleGoBack}
            className="flex items-center gap-2 text-gray-600 hover:text-mcf-orange-dark hover:bg-mcf-amber/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l'accueil
          </Button>
        </div>

        {/* En-tête */}
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-mcf-orange-dark mb-4">
            🎁 Offrir un livre personnalisé
          </h1>
          <p className="text-xl text-gray-700 mb-6 max-w-3xl mx-auto">
            Offrir un cadeau magique et personnalisé à un enfant ?<br />
            Créez son profil pour qu'il vive une aventure unique 🧡
          </p>
        </div>

        {/* Les deux options */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Option 1: Sans code */}
          <Card className="border-2 border-mcf-amber overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl">
            <CardHeader className="bg-mcf-amber/20 border-b border-mcf-amber/30">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl text-mcf-orange-dark">
                <User className="h-5 w-5" /> Je n'ai pas de code famille
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 pb-4">
              <div className="text-center mb-6">
                <div className="flex justify-center">
                  <div className="bg-mcf-orange/10 p-6 rounded-full">
                    <BookOpen className="h-12 w-12 text-mcf-orange" />
                  </div>
                </div>
                <h3 className="font-bold text-lg mt-4 text-mcf-orange-dark">Créer un nouveau profil</h3>
                <p className="text-gray-600 mt-2">
                  Vous allez créer le profil complet de l'enfant pour personnaliser son histoire magique.
                </p>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-mcf-orange shrink-0" />
                  <span>Remplir toutes les sections du profil</span>
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-mcf-orange shrink-0" />
                  <span>Prénom, personnalité, famille, passions...</span>
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-mcf-orange shrink-0" />
                  <span>Choisir un thème d'histoire</span>
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-mcf-orange shrink-0" />
                  <span>Ajouter une dédicace personnelle</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="pt-2 pb-6">
              <Button 
                className="w-full bg-mcf-orange hover:bg-mcf-orange-dark text-white font-semibold py-3 rounded-full"
                onClick={handleNoCodeContinue}
              >
                Commencer sans code
              </Button>
            </CardFooter>
          </Card>

          {/* Option 2: Avec code */}
          <Card className="border-2 border-mcf-orange overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl">
            <CardHeader className="bg-mcf-orange/20 border-b border-mcf-orange/30">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl text-mcf-orange-dark">
                <Key className="h-5 w-5" /> J'ai un code famille
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 pb-4">
              <div className="text-center mb-6">
                <div className="flex justify-center">
                  <div className="bg-mcf-orange/10 p-6 rounded-full">
                    <Gift className="h-12 w-12 text-mcf-orange" />
                  </div>
                </div>
                <h3 className="font-bold text-lg mt-4 text-mcf-orange-dark">Utiliser un code famille</h3>
                <p className="text-gray-600 mt-2">
                  Le profil de l'enfant est déjà créé ! Certaines informations seront pré-remplies.
                </p>
              </div>
              
              <form onSubmit={handleCodeSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="family-code">Entrez le code famille</Label>
                  <Input 
                    id="family-code" 
                    placeholder="Ex: MCF-ROBIN" 
                    className="text-center text-lg py-6"
                    value={familyCode}
                    onChange={(e) => setFamilyCode(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 italic text-center">
                    Ce code est fourni par la famille de l'enfant
                  </p>
                </div>
                <Button 
                  type="submit"
                  className="w-full bg-mcf-orange hover:bg-mcf-orange-dark text-white font-semibold py-3 rounded-full mt-4"
                >
                  Utiliser ce code
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Note de bas de page */}
        <div className="text-center text-gray-600 animate-fade-in animation-delay-300">
          <p>
            Prix unique d'un livre personnalisé : <span className="font-bold">18,90€</span>, livraison incluse
          </p>
          <p className="mt-2 text-sm">
            <Link to="/" className="text-mcf-orange hover:underline">
              Revenir à l'accueil
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OffrirLivre;
