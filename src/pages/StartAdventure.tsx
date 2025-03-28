import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GiftIcon, BookOpen, Sparkles, Package, Gift, Check, BookOpenCheck, BookText, Users, Star, ArrowLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { ChildProfileFormData } from '@/types/childProfile';

const StartAdventure = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const childProfile = location.state?.childProfile as ChildProfileFormData | undefined;

  useEffect(() => {
    if (childProfile) {
      console.log("Child profile data received on StartAdventure page:", childProfile);
    }
  }, [childProfile]);

  const handleSubscribe = () => {
    navigate('/finaliser-abonnement', { 
      state: { childProfile: childProfile } 
    });
  };

  const handleGoBack = () => {
    navigate('/creer-profil-enfant');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-mcf-cream to-white py-12">
      <div className="container px-4 mx-auto max-w-5xl">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={handleGoBack}
            className="flex items-center gap-2 text-gray-600 hover:text-mcf-orange-dark hover:bg-mcf-amber/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        </div>
        
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-mcf-orange-dark mb-4">
            🎉 Prêt à démarrer l'aventure !
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-2 max-w-3xl mx-auto">
            Votre profil est prêt… il ne manque plus qu'un livre magique ✨
          </p>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choisissez comment commencer l'aventure avec votre enfant :
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="border-2 border-mcf-orange overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-fade-in animation-delay-200 relative">
            <CardHeader className="bg-mcf-amber/20 border-b border-mcf-amber/30">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl text-mcf-orange-dark">
                <BookOpen className="h-6 w-6" /> Abonnement MCF
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 pb-4">
              <div className="mb-6 flex justify-center">
                <img 
                  src="/placeholder.svg" 
                  alt="Illustration d'un livre personnalisé" 
                  className="w-40 h-40 object-cover rounded-lg shadow-md"
                />
              </div>
              <ul className="space-y-3 mb-6">
                <FeatureItem icon={<BookText />} text="1 livre personnalisé par mois" />
                <FeatureItem icon={<Gift />} text="Histoire sur-mesure selon l'âge, les passions, les personnages" />
                <FeatureItem icon={<Sparkles />} text="Thèmes éducatifs, magiques, culturels" />
                <FeatureItem icon={<Star />} text="Accès à des éditions spéciales (cadeaux)" />
                <FeatureItem icon={<Package />} text="Un bel objet imprimé, illustré, à recevoir chez soi" />
                <FeatureItem icon={<Users />} text="Possibilité d'ajouter d'autres enfants de la famille" />
              </ul>
              <div className="bg-mcf-amber/10 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-center text-mcf-orange-dark mb-2">Formule</h4>
                <div className="flex flex-col sm:flex-row justify-center gap-4 text-center">
                  <div className="flex-1 bg-white p-3 rounded-lg shadow-sm">
                    <p className="font-bold text-lg text-mcf-orange-dark">9,90€/mois</p>
                    <p className="text-sm text-gray-600">Sans engagement</p>
                  </div>
                  <div className="flex-1 bg-white p-3 rounded-lg shadow-sm border-2 border-mcf-orange">
                    <p className="font-bold text-lg text-mcf-orange-dark">99€/an</p>
                    <Badge className="bg-mcf-orange text-white">2 mois offerts</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center pb-6">
              <Button
                className="bg-mcf-orange hover:bg-mcf-orange-dark text-white font-bold py-5 px-8 rounded-full shadow-lg hover:shadow-xl transition-all w-full"
                size="lg"
                onClick={handleSubscribe}
              >
                <BookOpen className="mr-2 h-5 w-5" /> Je m'abonne à My Crazy Family 📚
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-2 border-mcf-amber/30 overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-fade-in animation-delay-300">
            <CardHeader className="bg-mcf-amber/10 border-b border-mcf-amber/20">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl text-mcf-orange-dark">
                <GiftIcon className="h-6 w-6" /> Livre à l'unité
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 pb-4">
              <div className="mb-6 flex justify-center">
                <img 
                  src="/placeholder.svg" 
                  alt="Livre personnalisé à l'unité" 
                  className="w-40 h-40 object-cover rounded-lg shadow-md"
                />
              </div>
              <ul className="space-y-3 mb-6">
                <FeatureItem icon={<Gift />} text="Idéal pour offrir un livre personnalisé" />
                <FeatureItem icon={<BookOpenCheck />} text="Possibilité d'utiliser le profil déjà rempli" />
                <FeatureItem icon={<Check />} text="Paiement en une fois" />
                <FeatureItem icon={<Sparkles />} text="Parfait pour tester ou offrir un moment magique" />
              </ul>
              <div className="bg-mcf-amber/10 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-center text-mcf-orange-dark mb-2">Prix unique</h4>
                <div className="flex justify-center">
                  <div className="bg-white p-3 rounded-lg shadow-sm min-w-40 text-center">
                    <p className="font-bold text-lg text-mcf-orange-dark">19,90€</p>
                    <p className="text-sm text-gray-600">Livraison incluse</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center pb-6">
              <Button
                variant="outline"
                className="border-mcf-orange text-mcf-orange-dark hover:bg-mcf-amber/20 font-bold py-5 px-8 rounded-full shadow-lg hover:shadow-xl transition-all w-full"
                size="lg"
                asChild
              >
                <Link to="/offrir-livre">
                  <GiftIcon className="mr-2 h-5 w-5" /> Je choisis un livre à l'unité 🎁
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="text-center animate-fade-in animation-delay-400">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="link" className="text-gray-600 hover:text-mcf-orange-dark">
                Voir un exemple d'histoire avant de choisir 👀
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle className="text-xl text-mcf-orange-dark">Aperçu d'une histoire personnalisée</DialogTitle>
                <DialogDescription>
                  Voici un exemple d'histoire que votre enfant pourrait recevoir.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <img 
                  src="/placeholder.svg" 
                  alt="Exemple de page d'histoire" 
                  className="w-full h-auto rounded-lg shadow-md"
                />
                <div className="space-y-4">
                  <h3 className="font-bold text-mcf-orange-dark">Les aventures magiques de [Prénom]</h3>
                  <p className="text-gray-700">
                    Dans ce livre personnalisé, votre enfant devient le héros d'une aventure extraordinaire 
                    où tous les éléments de son profil sont intégrés: ses proches, ses passions, 
                    ses animaux de compagnie et bien plus encore!
                  </p>
                  <p className="text-gray-700">
                    Chaque livre est imprimé avec soin et relié pour créer un objet précieux 
                    que votre enfant gardera longtemps.
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

const FeatureItem = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
  <li className="flex items-start gap-3">
    <div className="text-mcf-orange shrink-0 mt-0.5">
      {icon}
    </div>
    <span className="text-gray-700">{text}</span>
  </li>
);

export default StartAdventure;
