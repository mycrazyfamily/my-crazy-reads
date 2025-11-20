import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import NewHero from '../components/NewHero';
import ExpertQuote from '../components/ExpertQuote';
import HowItWorks from '../components/HowItWorks';
import BenefitCard from '../components/BenefitCard';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';
import { useAuth } from '../hooks/useAuth';
import { Users, Heart, Zap, MessageCircle } from 'lucide-react';

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
    return user ? '/espace-famille' : '/authentification';
  };

  // Détermine le texte du bouton selon l'état de connexion
  const getButtonText = () => {
    return user ? 'Continuer l\'aventure' : 'Commencer l\'aventure';
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
        
        {/* Citation Experte */}
        <ExpertQuote />
        
        {/* Comment ça marche */}
        <HowItWorks />
        
        {/* Deux façons de vivre l'aventure */}
        <section className="py-24 bg-gradient-to-br from-mcf-primary/95 via-mcf-mint/90 to-mcf-secondary/95 animate-fade-in">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Users className="w-10 h-10 text-white drop-shadow-md" />
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg">
                Deux façons de vivre l'aventure
              </h2>
              <p className="text-xl md:text-2xl text-white/95 font-light drop-shadow-md">
                Choisissez le niveau d'implication qui vous convient
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-5xl mx-auto">
              {/* Option 1 - Guidé */}
              <div className="relative overflow-hidden border-2 border-white/50 hover:border-white transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-2 group bg-white/95 rounded-lg">
                <div className="absolute top-0 right-0 w-32 h-32 bg-mcf-mint/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                <div className="pt-10 p-8 relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-20 h-20 bg-mcf-mint/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform text-4xl shadow-md">
                      🪄
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-mcf-primary">
                        Mode "guidé"
                      </h3>
                      <p className="text-base text-mcf-secondary/90 font-semibold mt-1">
                        Pour ceux qui préfèrent la simplicité
                      </p>
                    </div>
                  </div>
                  <ul className="space-y-4 text-mcf-text/80 mt-6">
                    <li className="flex items-start gap-3">
                      <span className="text-mcf-mint text-xl mt-0.5">✓</span>
                      <span className="text-base">Vous suivez le thème proposé par My Crazy Family et nos spécialistes de l'enfance chaque mois</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-mcf-mint text-xl mt-0.5">✓</span>
                      <span className="text-base">Le livre reste 100 % personnalisé (prénoms, proches, lieux, animaux…)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-mcf-mint text-xl mt-0.5">✓</span>
                      <span className="text-base">Vous pouvez ajouter des détails ou simplement vous laisser porter</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Option 2 - Créatif */}
              <div className="relative overflow-hidden border-2 border-white/50 hover:border-white transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-2 group bg-white/95 rounded-lg">
                <div className="absolute top-0 right-0 w-32 h-32 bg-mcf-secondary/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                <div className="pt-10 p-8 relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-20 h-20 bg-mcf-secondary/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform text-4xl shadow-md">
                      🎨
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-mcf-primary">
                        Mode "créatif"
                      </h3>
                      <p className="text-base text-mcf-secondary/90 font-semibold mt-1">
                        Pour ceux qui veulent façonner l'histoire
                      </p>
                    </div>
                  </div>
                  <ul className="space-y-4 text-mcf-text/80 mt-6">
                    <li className="flex items-start gap-3">
                      <span className="text-mcf-secondary text-xl mt-0.5">✓</span>
                      <span className="text-base">Vous proposez un thème ou une idée totalement différente chaque mois où vous le souhaitez</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-mcf-secondary text-xl mt-0.5">✓</span>
                      <span className="text-base">L'équipe crée un livre personnalisé sur mesure, selon votre demande</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-center bg-white rounded-2xl p-10 max-w-4xl mx-auto shadow-xl border-2 border-mcf-primary/20">
              <p className="text-xl md:text-2xl font-semibold text-mcf-primary italic leading-relaxed">
                Que vous ayez envie de simplicité ou de créer votre propre histoire, <br className="hidden md:block" />
                chaque mois devient une aventure personnalisée pour vous et votre enfant ✨
              </p>
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
            <Testimonials />
          </div>
        </section>
        
        {/* Section finale - Profitez pleinement */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Zap className="w-10 h-10 text-mcf-primary" />
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-mcf-primary mb-8">
                Profitez de l'expérience MCF
              </h2>
              <p className="text-lg md:text-xl text-mcf-text/70 max-w-3xl mx-auto mb-12">
                Abonnez votre enfant et recevez chaque mois son livre personnalisé.
              </p>
              
              <div className="flex justify-center">
                <Link 
                  to={getDestinationPath()} 
                  className="bg-mcf-primary hover:bg-mcf-secondary text-white font-bold py-4 px-10 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-xl text-lg shadow-lg"
                >
                  {getButtonText()}
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