import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Book, Heart, Sparkles, Users, Award, MessageCircle, Brain, Palette, GraduationCap, Zap, Leaf, Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const NosHistoires: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const getDestinationPath = () => {
    return isAuthenticated ? '/espace-famille' : '/creer-profil-enfant';
  };

  const getButtonText = () => {
    return isAuthenticated ? 'Continuer l\'aventure' : 'Commencer l\'aventure';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="relative">
        {/* SECTION 1 - Hero Section */}
        <section className="relative h-[70vh] md:h-[80vh] flex items-center justify-center overflow-hidden pt-20 md:pt-24">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-mcf-primary/20 via-mcf-mint/30 to-mcf-secondary/20">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1532012197267-da84d127e765?w=1200')] bg-cover bg-center opacity-30 mix-blend-overlay" />
          </div>
          
          {/* Hero Content */}
          <div className="relative z-10 container mx-auto px-4 md:px-6 text-center animate-fade-in">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-mcf-primary mb-6 drop-shadow-sm">
              Des histoires uniques<br />pour chaque enfant
            </h1>
            <p className="text-lg md:text-2xl text-mcf-text/90 leading-relaxed max-w-3xl mx-auto mb-10 font-light">
              Chez My Crazy Family, chaque livre est plus qu'un récit : c'est une expérience personnalisée, 
              conçue pour nourrir l'imaginaire, la confiance en soi et l'expression des enfants de 0 à 10 ans.
            </p>
            <Link
              to={getDestinationPath()}
              className="inline-flex items-center gap-2 bg-mcf-primary text-white font-bold text-lg px-12 py-5 rounded-full hover:bg-mcf-secondary transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
            >
              <Sparkles className="w-5 h-5" />
              {getButtonText()}
            </Link>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-16 md:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-mcf-primary/50 rounded-full flex items-start justify-center p-2">
              <div className="w-1.5 h-3 bg-mcf-primary/50 rounded-full" />
            </div>
          </div>
        </section>

        {/* SECTION 2 - Nos livres en images */}
        <section className="py-24 bg-gradient-to-br from-mcf-secondary/5 via-transparent to-mcf-mint/5 animate-fade-in">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Palette className="w-10 h-10 text-mcf-secondary" />
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-mcf-primary mb-4">
                Nos livres en images
              </h2>
              <p className="text-xl text-mcf-text/70 mb-3">
                Made in France 🇫🇷
              </p>
            </div>
            
            {/* Ligne 1 - Thématique familiale et émotionnelle */}
            <div className="mb-12">
              <div className="grid md:grid-cols-3 gap-8 mb-6">
                {/* Livre 1 - Les super-parents d'Ambre */}
                <Card className="border-2 border-mcf-mint/20 hover:border-mcf-mint transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group overflow-hidden">
                  <div className="aspect-square overflow-hidden">
                    <img 
                      src="/lovable-uploads/book-ambre.png" 
                      alt="Les super-parents d'Ambre"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="pt-6 pb-8">
                    <h3 className="text-xl font-bold text-mcf-primary mb-2">
                      Les super-parents d'Ambre
                    </h3>
                    <p className="text-sm text-mcf-secondary font-semibold mb-3">0-3 ans</p>
                    <p className="text-mcf-text/80 mb-4 leading-relaxed">
                      Une histoire tendre pour construire la sécurité affective
                    </p>
                  </CardContent>
                </Card>

                {/* Livre 2 - Les aventures de Gabriel et Biscuit */}
                <Card className="border-2 border-mcf-mint/20 hover:border-mcf-mint transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group overflow-hidden">
                  <div className="aspect-square overflow-hidden">
                    <img 
                      src="/lovable-uploads/book-gabriel.png" 
                      alt="Les aventures de Gabriel et Biscuit"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="pt-6 pb-8">
                    <h3 className="text-xl font-bold text-mcf-primary mb-2">
                      Les aventures de Gabriel et Biscuit
                    </h3>
                    <p className="text-sm text-mcf-secondary font-semibold mb-3">3-6 ans</p>
                    <p className="text-mcf-text/80 mb-4 leading-relaxed">
                      Un lien unique entre enfant et animal pour grandir ensemble
                    </p>
                  </CardContent>
                </Card>

                {/* Livre 3 - Le Noël des petits lutins */}
                <Card className="border-2 border-mcf-mint/20 hover:border-mcf-mint transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group overflow-hidden">
                  <div className="aspect-square overflow-hidden">
                    <img 
                      src="/lovable-uploads/book-noel.png" 
                      alt="Le Noël des petits lutins"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="pt-6 pb-8">
                    <h3 className="text-xl font-bold text-mcf-primary mb-2">
                      Le Noël des petits lutins
                    </h3>
                    <p className="text-sm text-mcf-secondary font-semibold mb-3">4-7 ans</p>
                    <p className="text-mcf-text/80 mb-4 leading-relaxed">
                      Une magie de Noël où aider compte autant que recevoir
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              {/* Intentions éducatives ligne 1 */}
              <div className="bg-gradient-to-r from-mcf-mint/10 to-mcf-secondary/10 rounded-2xl p-6 border border-mcf-mint/30">
                <p className="text-center text-mcf-text/80 font-medium">
                  💖 Sécurité affective • 🐾 Lien affectif enfant-animal • 🎁 Entraide et participation
                </p>
              </div>
            </div>

            {/* Ligne 2 - Engagement, culture et imagination */}
            <div>
              <div className="grid md:grid-cols-3 gap-8 mb-6">
                {/* Livre 4 - Jules et les protecteurs */}
                <Card className="border-2 border-mcf-secondary/20 hover:border-mcf-secondary transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group overflow-hidden">
                  <div className="aspect-square overflow-hidden">
                    <img 
                      src="/lovable-uploads/book-jules.png" 
                      alt="Jules et les protecteurs de la planète bleue"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="pt-6 pb-8">
                    <h3 className="text-xl font-bold text-mcf-primary mb-2">
                      Jules et les protecteurs de la planète bleue
                    </h3>
                    <p className="text-sm text-mcf-secondary font-semibold mb-3">6-9 ans</p>
                    <p className="text-mcf-text/80 mb-4 leading-relaxed">
                      Une mission pour sauver la planète, ensemble
                    </p>
                  </CardContent>
                </Card>

                {/* Livre 5 - Léna et le mystère */}
                <Card className="border-2 border-mcf-secondary/20 hover:border-mcf-secondary transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group overflow-hidden">
                  <div className="aspect-square overflow-hidden">
                    <img 
                      src="/lovable-uploads/book-lena.png" 
                      alt="Léna et le mystère de la pyramide endormie"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="pt-6 pb-8">
                    <h3 className="text-xl font-bold text-mcf-primary mb-2">
                      Léna et le mystère de la pyramide endormie
                    </h3>
                    <p className="text-sm text-mcf-secondary font-semibold mb-3">6-10 ans</p>
                    <p className="text-mcf-text/80 mb-4 leading-relaxed">
                      Une plongée dans l'Égypte ancienne pour les petits explorateurs
                    </p>
                  </CardContent>
                </Card>

                {/* Livre 6 - Les secrets de la forêt */}
                <Card className="border-2 border-mcf-secondary/20 hover:border-mcf-secondary transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group overflow-hidden">
                  <div className="aspect-square overflow-hidden">
                    <img 
                      src="/lovable-uploads/book-foret.png" 
                      alt="Les secrets de la forêt endormie"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="pt-6 pb-8">
                    <h3 className="text-xl font-bold text-mcf-primary mb-2">
                      Les secrets de la forêt endormie
                    </h3>
                    <p className="text-sm text-mcf-secondary font-semibold mb-3">4-8 ans</p>
                    <p className="text-mcf-text/80 mb-4 leading-relaxed">
                      Réveiller la nature avec des rires et des histoires
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              {/* Intentions éducatives ligne 2 */}
              <div className="bg-gradient-to-r from-mcf-secondary/10 to-mcf-primary/10 rounded-2xl p-6 border border-mcf-secondary/30">
                <p className="text-center text-mcf-text/80 font-medium">
                  🌱 Écologie et responsabilité collective • 🔍 Curiosité historique • 👥 Coopération joyeuse avec la nature
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3 - Fonctionnement & méthode */}
        <section className="py-24 bg-gradient-to-br from-mcf-mint/10 via-mcf-secondary/5 to-transparent animate-fade-in">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <div className="text-center mb-16 animate-fade-in">
              <h2 className="text-3xl md:text-5xl font-bold text-mcf-primary mb-4">
                Une collection pensée par des spécialistes de l'enfance
              </h2>
              <p className="text-lg text-mcf-text/70 max-w-2xl mx-auto">
                Des histoires élaborées avec rigueur et passion
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {/* Psychologues */}
              <Card className="border-2 border-mcf-mint/20 hover:border-mcf-mint transition-all duration-300 hover:shadow-xl hover:-translate-y-2 bg-white/80 backdrop-blur">
                <CardContent className="pt-8 text-center">
                  <div className="w-16 h-16 bg-mcf-mint/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-8 h-8 text-mcf-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-mcf-primary mb-2">Psychologues</h3>
                  <p className="text-mcf-text/70">de l'enfance</p>
                </CardContent>
              </Card>

              {/* Chercheurs */}
              <Card className="border-2 border-mcf-secondary/20 hover:border-mcf-secondary transition-all duration-300 hover:shadow-xl hover:-translate-y-2 bg-white/80 backdrop-blur">
                <CardContent className="pt-8 text-center">
                  <div className="w-16 h-16 bg-mcf-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-mcf-secondary" />
                  </div>
                  <h3 className="text-xl font-bold text-mcf-primary mb-2">Chercheurs</h3>
                  <p className="text-mcf-text/70">en développement personnel</p>
                </CardContent>
              </Card>

              {/* Enseignants */}
              <Card className="border-2 border-mcf-primary/20 hover:border-mcf-primary transition-all duration-300 hover:shadow-xl hover:-translate-y-2 bg-white/80 backdrop-blur">
                <CardContent className="pt-8 text-center">
                  <div className="w-16 h-16 bg-mcf-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <GraduationCap className="w-8 h-8 text-mcf-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-mcf-primary mb-2">Enseignants</h3>
                  <p className="text-mcf-text/70">& auteurs jeunesse</p>
                </CardContent>
              </Card>
            </div>

            <div className="max-w-4xl mx-auto space-y-6 text-center">
              <p className="text-lg text-mcf-text/80 leading-relaxed">
                Chaque livre repose sur un <strong className="text-mcf-primary">tronc commun narratif</strong>, 
                spécifiquement adapté à chaque tranche d'âge de 0 à 10 ans.
              </p>
              <p className="text-lg text-mcf-text/80 leading-relaxed">
                Elles sont relues par des <strong className="text-mcf-primary">auteurs jeunesse</strong> pour 
                un rythme et un ton parfaitement adaptés.
              </p>
              
              <div className="bg-gradient-to-r from-mcf-mint/20 to-mcf-secondary/20 border-2 border-mcf-mint/40 p-8 rounded-2xl mt-8">
                <p className="text-xl font-bold text-mcf-primary flex items-center justify-center gap-2 mb-3">
                  <Sparkles className="w-6 h-6" />
                  Notre objectif
                </p>
                <p className="text-lg text-mcf-text/80">
                  Renforcer la confiance, stimuler la curiosité, encourager l'expression de soi.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4 - Ce qui rend My Crazy Family unique */}
        <section className="py-24 bg-gradient-to-br from-mcf-mint/10 via-transparent to-mcf-secondary/10 animate-fade-in">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Award className="w-10 h-10 text-mcf-primary" />
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-mcf-primary mb-4">
                Ce qui rend My Crazy Family unique
              </h2>
              <p className="text-lg text-mcf-text/70">
                Des livres d'exception, des valeurs fortes
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
              {/* Bloc 1 - Qualité premium */}
              <Card className="relative overflow-hidden border-2 border-mcf-mint/30 hover:border-mcf-mint transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-mcf-mint to-mcf-secondary" />
                <CardContent className="pt-10 pb-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-mcf-mint/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Sparkles className="w-8 h-8 text-mcf-mint" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-mcf-secondary">
                      Qualité premium
                    </h3>
                  </div>
                  <ul className="space-y-4 text-mcf-text/80">
                    <li className="flex items-start gap-3 hover:translate-x-1 transition-transform">
                      <span className="text-mcf-mint text-2xl">•</span>
                      <span className="text-base">Livres <strong className="text-mcf-primary">imprimés en France</strong></span>
                    </li>
                    <li className="flex items-start gap-3 hover:translate-x-1 transition-transform">
                      <span className="text-mcf-mint text-2xl">•</span>
                      <span className="text-base"><strong className="text-mcf-primary">Bel objet</strong> pour les bibliothèques</span>
                    </li>
                    <li className="flex items-start gap-3 hover:translate-x-1 transition-transform">
                      <span className="text-mcf-mint text-2xl">•</span>
                      <span className="text-base">Papier épais, formats adaptés, finitions haut de gamme</span>
                    </li>
                    <li className="flex items-start gap-3 hover:translate-x-1 transition-transform">
                      <span className="text-mcf-mint text-2xl">•</span>
                      <span className="text-base">Justifie pleinement le prix</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Bloc 2 - Contenus engagés */}
              <Card className="relative overflow-hidden border-2 border-mcf-secondary/30 hover:border-mcf-secondary transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-mcf-secondary to-mcf-primary" />
                <CardContent className="pt-10 pb-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-mcf-secondary/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Globe className="w-8 h-8 text-mcf-secondary" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-mcf-primary">
                      Contenus engagés
                    </h3>
                  </div>
                  <ul className="space-y-4 text-mcf-text/80">
                    <li className="flex items-start gap-3 hover:translate-x-1 transition-transform">
                      <span className="text-mcf-secondary text-2xl">•</span>
                      <span className="text-base">Thèmes responsables : <strong className="text-mcf-primary">écologie, diversité, civilisations, émotions…</strong></span>
                    </li>
                    <li className="flex items-start gap-3 hover:translate-x-1 transition-transform">
                      <span className="text-mcf-secondary text-2xl">•</span>
                      <span className="text-base">Outils de sensibilisation pour enfants et parents</span>
                    </li>
                    <li className="flex items-start gap-3 hover:translate-x-1 transition-transform">
                      <span className="text-mcf-secondary text-2xl">•</span>
                      <span className="text-base"><strong className="text-mcf-primary">Morale et résumé pédagogique</strong> à la fin de chaque histoire</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* SECTION 5 - Call-to-action */}
        <section className="py-24 bg-white animate-fade-in">
          <div className="container mx-auto px-4 md:px-6 max-w-5xl">
            <div className="relative overflow-hidden bg-gradient-to-br from-mcf-primary via-mcf-secondary to-mcf-mint rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl">
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mt-32 blur-3xl" />
              <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-40 -mb-40 blur-3xl" />
              
              <div className="relative z-10">
                <Sparkles className="w-12 h-12 mx-auto mb-6 opacity-90" />
                <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                  Prêt à créer des souvenirs magiques ?
                </h2>
                <p className="text-lg md:text-2xl mb-10 opacity-95 max-w-3xl mx-auto font-light leading-relaxed">
                  Rejoignez les familles qui offrent à leurs enfants des histoires uniques, 
                  créées rien que pour eux.
                </p>
                <Link
                  to={getDestinationPath()}
                  className="inline-flex items-center gap-3 bg-white text-mcf-primary font-bold text-lg md:text-xl px-12 py-5 rounded-full hover:bg-mcf-mint hover:text-white transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl"
                >
                  <Heart className="w-5 h-5" />
                  {getButtonText()}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default NosHistoires;
