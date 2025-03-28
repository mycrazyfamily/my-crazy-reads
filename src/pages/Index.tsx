import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import BenefitCard from '../components/BenefitCard';
import Footer from '../components/Footer';

const Index: React.FC = () => {
  const [heroError, setHeroError] = useState<boolean>(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    // Ajouter une classe au body pour s'assurer que la couleur de fond est appliquée
    document.body.classList.add('bg-mcf-cream');
    
    // Nettoyer l'effet lorsque le composant est démonté
    return () => {
      document.body.classList.remove('bg-mcf-cream');
    };
  }, []);

  const benefits = [
    {
      title: "Une aventure magique chaque mois",
      description: "Des histoires enchanteresses qui nourrissent l'imagination de votre enfant et renforcent votre lien familial.",
      icon: "📖",
      delay: "animation-delay-100"
    },
    {
      title: "Des livres imprimés de qualité à garder",
      description: "Des ouvrages soigneusement imprimés, conçus pour résister au temps et devenir de précieux souvenirs familiaux.",
      icon: "📚",
      delay: "animation-delay-200"
    },
    {
      title: "Des thèmes essentiels et éducatifs",
      description: "Découvrez des aventures abordant l'écologie, les émotions, la culture et bien d'autres sujets important pour l'épanouissement de votre enfant.",
      icon: "🌍",
      delay: "animation-delay-300"
    },
    {
      title: "Un cadeau touchant et original",
      description: "Offrez une expérience unique qui se renouvelle chaque mois et crée des moments privilégiés en famille.",
      icon: "🎁",
      delay: "animation-delay-400"
    }
  ];

  console.log("Index page rendering");

  return (
    <div className="min-h-screen flex flex-col bg-mcf-cream">
      <Navbar />
      
      <main className="flex-grow">
        {heroError ? (
          <div className="min-h-screen flex items-center justify-center pt-16 pb-10 hero-gradient">
            <div className="container mx-auto px-4 md:px-6 text-center">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-mcf-orange-dark leading-tight mb-4">
                Bienvenue dans My Crazy Family
              </h1>
              <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
                Chaque mois, une nouvelle histoire imprimée personnalisée, pour vivre des aventures magiques en famille.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
                <Link 
                  to="/creer-profil-enfant" 
                  className="bg-mcf-orange hover:bg-mcf-orange-dark text-white font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg text-lg"
                >
                  Commencer l'aventure
                </Link>
                <Link 
                  to="/offrir-livre" 
                  className="bg-white hover:bg-mcf-amber text-mcf-orange-dark font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg border-2 border-mcf-orange text-lg"
                >
                  Offrir un livre
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <React.Suspense fallback={<div>Chargement...</div>}>
            <ErrorBoundary onError={() => setHeroError(true)}>
              <Hero />
            </ErrorBoundary>
          </React.Suspense>
        )}
        
        <section className="py-20 px-4 bg-white">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-mcf-orange-dark mb-6 opacity-0 animate-fade-in">
              Pourquoi choisir My Crazy Family ?
            </h2>
            <p className="text-lg text-gray-700 text-center max-w-3xl mx-auto mb-12 opacity-0 animate-fade-in animation-delay-100">
              Plus qu'un simple livre personnalisé, My Crazy Family est une invitation à créer des souvenirs durables avec votre enfant.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
        
        <section className="py-20 px-4 hero-gradient">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-mcf-orange-dark mb-6 opacity-0 animate-fade-in">
              Commencez votre voyage littéraire aujourd'hui
            </h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-8 opacity-0 animate-fade-in animation-delay-100">
              Rejoignez des milliers de familles qui ont déjà embarqué pour cette aventure unique de lecture partagée et de découverte.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 opacity-0 animate-fade-in animation-delay-200">
              <Link 
                to="/creer-profil-enfant" 
                className="bg-mcf-orange hover:bg-mcf-orange-dark text-white font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg text-lg"
              >
                Commencer l'aventure
              </Link>
              <Link 
                to="/offrir-livre" 
                className="bg-white hover:bg-mcf-amber text-mcf-orange-dark font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg border-2 border-mcf-orange text-lg"
              >
                Offrir un livre
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto glassmorphism rounded-2xl overflow-hidden card-shadow p-8 md:p-12 bg-gradient-to-br from-mcf-cream to-white">
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 mb-6 md:mb-0 md:pr-8">
                  <h3 className="text-2xl md:text-3xl font-bold text-mcf-orange-dark mb-4">
                    L'aventure continue mois après mois
                  </h3>
                  <p className="text-gray-700">
                    My Crazy Family n'est pas qu'un livre, c'est une tradition familiale qui grandit avec votre enfant. Chaque nouvelle histoire enrichit sa bibliothèque personnelle et renforce votre lien à travers des moments privilégiés de lecture partagée.
                  </p>
                </div>
                <div className="md:w-1/2 flex justify-center">
                  <div className="w-full max-w-sm h-64 bg-mcf-beige rounded-lg flex items-center justify-center text-5xl animate-float">
                    📚
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

// Composant ErrorBoundary simple pour capturer les erreurs
class ErrorBoundary extends React.Component<{ children: React.ReactNode; onError: () => void }> {
  componentDidCatch(error: Error) {
    console.error("Error in component:", error);
    this.props.onError();
  }

  render() {
    return this.props.children;
  }
}

export default Index;
