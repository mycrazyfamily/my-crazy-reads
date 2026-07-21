import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, MessageCircle, Sparkles, Brain, GraduationCap, BookOpen, Library, Globe, Gift, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Navbar from '../components/Navbar';
import NewHero from '../components/NewHero';
import ExpertQuote from '../components/ExpertQuote';
import BenefitCard from '../components/BenefitCard';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';
import { useAuth } from '../hooks/useAuth';

const NewIndex: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const st = location.state as { scrollTo?: string } | null;
    if (!st?.scrollTo) {
      window.scrollTo(0, 0);
    }
    document.body.classList.add('bg-white');

    return () => {
      document.body.classList.remove('bg-white');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll vers une section après navigation inter-pages (ex: Footer "Nos Histoires").
  // Dormant tant qu'aucune navigation ne passe location.state.scrollTo.
  useEffect(() => {
    const st = location.state as { scrollTo?: string } | null;
    if (st?.scrollTo) {
      const id = st.scrollTo;
      const timer = setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location]);

  // Détermine la destination selon l'état de connexion
  const getDestinationPath = () => {
    return isAuthenticated ? '/espace-famille' : '/creer-profil-enfant';
  };

  // Détermine le texte du bouton selon l'état de connexion
  const getButtonText = () => {
    return isAuthenticated ? 'Continuer l\'aventure' : 'Commencer l\'aventure';
  };

  const benefits = [
    {
      title: "Une aventure magique chaque mois",
      description: "Des histoires enchanteresses qui nourrissent l'imagination de votre enfant et renforcent votre lien familial.",
      icon: <BookOpen className="w-12 h-12 text-mcf-primary" />,
      delay: "animation-delay-100"
    },
    {
      title: "Des livres imprimés de qualité à garder",
      description: "Des ouvrages soigneusement imprimés, conçus pour résister au temps et devenir de précieux souvenirs familiaux.",
      icon: <Library className="w-12 h-12 text-mcf-primary" />,
      delay: "animation-delay-200"
    },
    {
      title: "Des thèmes essentiels et éducatifs",
      description: "Découvrez des aventures abordant l'écologie, les émotions, la culture et bien d'autres sujets important pour l'épanouissement de votre enfant.",
      icon: <Globe className="w-12 h-12 text-mcf-primary" />,
      delay: "animation-delay-300"
    },
    {
      title: "Un cadeau touchant et original",
      description: "Offrez une expérience unique qui se renouvelle chaque mois et crée des moments privilégiés en famille.",
      icon: <Gift className="w-12 h-12 text-mcf-primary" />,
      delay: "animation-delay-400"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <NewHero />

        {/* Citation Experte */}
        <ExpertQuote />

        {/* Quelques exemples d'histoires personnalisées (6 livres) — section ancrable */}
        <section id="nos-histoires" className="py-24 bg-gradient-to-br from-mcf-secondary/5 via-transparent to-mcf-mint/5 animate-fade-in">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold text-mcf-primary mb-4 flex items-center justify-center gap-3">
                <Sparkles className="w-10 h-10" />
                Quelques exemples d'histoires personnalisées
              </h2>
              <p className="text-xl text-mcf-text/70 mb-6">
                🇫🇷 <em>Made in France</em>
              </p>
            </div>

            {/* Galerie de livres */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {/* Livre 1 - Les super-parents d'Ambre */}
              <Card className="border-2 border-mcf-mint/20 hover:border-mcf-mint transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group overflow-hidden">
                <div className="aspect-square overflow-hidden">
                  <img src="/lovable-uploads/book-ambre.png" alt="Les super-parents d'Ambre" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <CardContent className="pt-6 pb-8">
                  <h3 className="text-xl font-bold text-mcf-primary mb-3">
                    Les super-parents d'Ambre
                  </h3>
                  <p className="text-mcf-text/80 mb-3 leading-relaxed">
                    Une histoire tendre pour valoriser le lien parent-enfant
                  </p>
                  <p className="text-sm text-mcf-secondary font-semibold">
                    Sécurité affective
                  </p>
                </CardContent>
              </Card>

              {/* Livre 2 - Les aventures de Gabriel et Biscuit */}
              <Card className="border-2 border-mcf-mint/20 hover:border-mcf-mint transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group overflow-hidden">
                <div className="aspect-square overflow-hidden">
                  <img src="/lovable-uploads/book-gabriel.png" alt="Les aventures de Gabriel et Biscuit" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <CardContent className="pt-6 pb-8">
                  <h3 className="text-xl font-bold text-mcf-primary mb-3">
                    Les aventures de Gabriel et Biscuit
                  </h3>
                  <p className="text-mcf-text/80 mb-3 leading-relaxed">
                    Un lien unique entre enfant et animal pour grandir ensemble
                  </p>
                  <p className="text-sm text-mcf-secondary font-semibold">
                    Lien enfant-animal
                  </p>
                </CardContent>
              </Card>

              {/* Livre 3 - Le Noël des petits lutins */}
              <Card className="border-2 border-mcf-mint/20 hover:border-mcf-mint transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group overflow-hidden">
                <div className="aspect-square overflow-hidden">
                  <img src="/lovable-uploads/book-noel.png" alt="Le Noël des petits lutins" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <CardContent className="pt-6 pb-8">
                  <h3 className="text-xl font-bold text-mcf-primary mb-3">
                    Le Noël des petits lutins
                  </h3>
                  <p className="text-mcf-text/80 mb-3 leading-relaxed">
                    Une magie de Noël où aider compte autant que recevoir
                  </p>
                  <p className="text-sm text-mcf-secondary font-semibold">
                    Entraide et participation
                  </p>
                </CardContent>
              </Card>

              {/* Livre 4 - Jules et les protecteurs */}
              <Card className="border-2 border-mcf-secondary/20 hover:border-mcf-secondary transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group overflow-hidden">
                <div className="aspect-square overflow-hidden">
                  <img src="/__l5e/assets-v1/284e3252-6987-46d3-89b0-23eb30d00174/book-jules-corrige.png" alt="Jules et les protecteurs de la planète bleue" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <CardContent className="pt-6 pb-8">
                  <h3 className="text-xl font-bold text-mcf-primary mb-3">
                    Jules et les protecteurs de la planète bleue
                  </h3>
                  <p className="text-mcf-text/80 mb-3 leading-relaxed">
                    Une aventure écologique pour sauver la planète, ensemble
                  </p>
                  <p className="text-sm text-mcf-secondary font-semibold">
                    Éveil à la nature &amp; responsabilité collective
                  </p>
                </CardContent>
              </Card>

              {/* Livre 5 - Léna et le mystère */}
              <Card className="border-2 border-mcf-secondary/20 hover:border-mcf-secondary transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group overflow-hidden">
                <div className="aspect-square overflow-hidden">
                  <img src="/lovable-uploads/book-lena.png" alt="Léna et le mystère de la pyramide endormie" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <CardContent className="pt-6 pb-8">
                  <h3 className="text-xl font-bold text-mcf-primary mb-3">
                    Léna et le mystère de la pyramide endormie
                  </h3>
                  <p className="text-mcf-text/80 mb-3 leading-relaxed">
                    Une plongée dans l'Égypte ancienne pour les petits explorateurs
                  </p>
                  <p className="text-sm text-mcf-secondary font-semibold">
                    Curiosité historique &amp; esprit d'équipe
                  </p>
                </CardContent>
              </Card>

              {/* Livre 6 - Les secrets de la forêt */}
              <Card className="border-2 border-mcf-secondary/20 hover:border-mcf-secondary transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group overflow-hidden">
                <div className="aspect-square overflow-hidden">
                  <img src="/lovable-uploads/book-foret.png" alt="Les secrets de la forêt endormie" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <CardContent className="pt-6 pb-8">
                  <h3 className="text-xl font-bold text-mcf-primary mb-3">
                    Les secrets de la forêt endormie
                  </h3>
                  <p className="text-mcf-text/80 mb-3 leading-relaxed">
                    Réveiller la nature avec des rires et des histoires
                  </p>
                  <p className="text-sm text-mcf-secondary font-semibold">
                    Coopération joyeuse avec la nature
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Une collection pensée par des spécialistes de l'enfance */}
        <section className="py-24 bg-gradient-to-br from-mcf-primary/95 via-mcf-mint/90 to-mcf-secondary/95 animate-fade-in">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <div className="text-center mb-16 animate-fade-in">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg">
                Une collection pensée par des spécialistes de l'enfance
              </h2>
              <p className="text-xl md:text-2xl text-white/95 max-w-2xl mx-auto font-light drop-shadow-md">
                Des histoires élaborées avec rigueur et passion
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {/* Psychologues */}
              <Card className="border-2 border-white/50 hover:border-white transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 bg-white/95 backdrop-blur shadow-lg">
                <CardContent className="pt-8 pb-8 text-center">
                  <div className="w-20 h-20 bg-mcf-mint/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                    <Brain className="w-10 h-10 text-mcf-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-mcf-primary mb-2">Psychologues</h3>
                  <p className="text-mcf-text/70">de l'enfance</p>
                </CardContent>
              </Card>

              {/* Chercheurs */}
              <Card className="border-2 border-white/50 hover:border-white transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 bg-white/95 backdrop-blur shadow-lg">
                <CardContent className="pt-8 pb-8 text-center">
                  <div className="w-20 h-20 bg-mcf-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                    <Sparkles className="w-10 h-10 text-mcf-secondary" />
                  </div>
                  <h3 className="text-xl font-bold text-mcf-primary mb-2">Chercheurs</h3>
                  <p className="text-mcf-text/70">en développement personnel</p>
                </CardContent>
              </Card>

              {/* Enseignants */}
              <Card className="border-2 border-white/50 hover:border-white transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 bg-white/95 backdrop-blur shadow-lg">
                <CardContent className="pt-8 pb-8 text-center">
                  <div className="w-20 h-20 bg-mcf-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                    <GraduationCap className="w-10 h-10 text-mcf-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-mcf-primary mb-2">Enseignants</h3>
                  <p className="text-mcf-text/70">&amp; auteurs jeunesse</p>
                </CardContent>
              </Card>
            </div>

            <div className="max-w-4xl mx-auto space-y-8 text-center">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-10 md:p-12 space-y-6 shadow-lg border border-white/50">
                <p className="text-lg md:text-xl text-mcf-text/90 leading-relaxed">
                  Chaque histoire suit un <strong className="text-mcf-primary font-semibold">tronc narratif structuré</strong>,
                  conçu avec des spécialistes de l'enfance et spécifiquement adapté à chaque tranche d'âge de 0 à 10 ans.
                </p>
                <p className="text-lg md:text-xl text-mcf-text/90 leading-relaxed">
                  Elles sont relues et enrichies par des <strong className="text-mcf-primary font-semibold">auteurs jeunesse</strong> pour
                  assurer un ton et un rythme parfaitement adaptés.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-10 shadow-xl border-2 border-mcf-primary/20">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-mcf-mint/20 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-7 h-7 text-mcf-primary" />
                  </div>
                  <p className="text-2xl font-bold text-mcf-primary">
                    Notre objectif
                  </p>
                </div>
                <p className="text-lg md:text-xl text-mcf-text/90 leading-relaxed">
                  Renforcer la confiance, stimuler la curiosité, encourager l'expression de soi.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pourquoi choisir MCF */}
        <section className="py-24 bg-gradient-to-br from-mcf-secondary/5 via-transparent to-mcf-mint/5 animate-fade-in">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Heart className="w-10 h-10 text-mcf-primary" />
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-mcf-primary mb-4">
                Pourquoi choisir My Crazy Family ?
              </h2>
              <p className="text-lg text-mcf-text/70">
                Un abonnement qui grandit avec votre famille
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {benefits.map((benefit, index) => (
                <BenefitCard
                  key={index}
                  title={benefit.title}
                  description={benefit.description}
                  icon={benefit.icon}
                  delay={benefit.delay}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Témoignages */}
        <section className="py-24 bg-gradient-to-br from-mcf-mint via-mcf-primary to-mcf-secondary animate-fade-in">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-4">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ils ont adopté My Crazy Family
              </h2>
              <p className="text-lg text-white/90">
                Les témoignages de nos familles heureuses
              </p>
            </div>
            <Testimonials />
          </div>
        </section>

        {/* CTA final - Prêt à créer des souvenirs magiques */}
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
                {/* Anti-flash A3 : tant que l'auth n'est pas résolue (isLoading), on affiche un
                    placeholder non-cliquable au lieu du bouton — sinon « Commencer l'aventure »
                    flashe pour un utilisateur connecté et un clic pendant ce court instant le
                    renvoie vers le login (via le RouteGuard de /creer-profil-enfant). */}
                {isLoading ? (
                  <span className="inline-flex items-center gap-3 bg-white text-mcf-primary font-bold text-lg md:text-xl px-12 py-5 rounded-full shadow-2xl opacity-70 cursor-default">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Chargement…
                  </span>
                ) : (
                  <Link to={getDestinationPath()} className="inline-flex items-center gap-3 bg-white text-mcf-primary font-bold text-lg md:text-xl px-12 py-5 rounded-full hover:bg-mcf-mint hover:text-white transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl">
                    <Heart className="w-5 h-5" />
                    {getButtonText()}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default NewIndex;
