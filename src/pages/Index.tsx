import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import NewHero from '../components/NewHero';
import HowItWorks from '../components/HowItWorks';
import BenefitCard from '../components/BenefitCard';
import Footer from '../components/Footer';
import { useAuth } from '../hooks/useAuth';

const NewIndex: React.FC = () => {
  const { user } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.classList.add('bg-white');
    
    return () => {
      document.body.classList.remove('bg-white');
    };
  }, []);

  // Détermine la destination selon l'état de connexion
  const getDestinationPath = () => {
    return user ? '/famille-dashboard' : '/creer-profil-enfant';
  };

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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <NewHero />
        
        {/* Comment ça marche */}
        <HowItWorks />
        
        {/* Pourquoi choisir MCF */}
        <section className="py-20 px-4 bg-mcf-gradient-start/30">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-mcf-text mb-6">
              Pourquoi choisir My Crazy Family ?
            </h2>
            <p className="text-lg md:text-xl text-mcf-text/70 text-center max-w-3xl mx-auto mb-12">
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
        
        {/* Section finale - Profitez pleinement */}
        <section className="py-20 px-4 bg-white">
          <div className="container mx-auto text-center">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-mcf-text mb-8">
                Profitez de l'expérience MCF
              </h2>
              <p className="text-lg md:text-xl text-mcf-text/70 max-w-3xl mx-auto mb-12">
                Abonnez votre enfant et recevez chaque mois son livre personnalisé.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <Link 
                  to={getDestinationPath()} 
                  className="bg-mcf-primary hover:bg-mcf-secondary text-white font-bold py-4 px-10 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-xl text-lg shadow-lg"
                >
                  Commencer l'aventure
                </Link>
                
                <Link 
                  to="/offrir-livre" 
                  className="bg-white hover:bg-mcf-gradient-start/20 text-mcf-text font-medium py-4 px-10 rounded-full border-2 border-mcf-secondary hover:border-mcf-primary transition-all duration-300 transform hover:scale-105 text-lg"
                >
                  Offrir un livre
                </Link>
              </div>
              
              {/* Éléments décoratifs */}
              <div className="mt-16 relative">
                <div className="absolute -top-8 -left-8 w-24 h-24 bg-mcf-secondary/30 rounded-full animate-float"></div>
                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-mcf-gradient-end/40 rounded-full animate-float animation-delay-300"></div>
                
                <div className="relative bg-gradient-to-br from-mcf-gradient-start to-mcf-gradient-end/20 rounded-2xl p-8 md:p-12 shadow-lg">
                  <div className="text-6xl mb-6">📖✨</div>
                  <p className="text-xl md:text-2xl font-medium text-mcf-text">
                    Embarquez dans cette aventure familiale exceptionnelle !
                  </p>
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

export default NewIndex;