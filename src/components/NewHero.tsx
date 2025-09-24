import React from 'react';
import { Link } from 'react-router-dom';

const NewHero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 pb-10 bg-mcf-cream overflow-hidden">
      {/* Placeholder pour l'image de fond */}
      <div className="absolute inset-0 bg-gradient-to-br from-mcf-cream via-mcf-mint/20 to-mcf-amber/30">
        <div className="absolute inset-0 bg-white/60"></div>
      </div>
      
      {/* Éléments décoratifs flottants */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-mcf-amber/40 rounded-full animate-float"></div>
      <div className="absolute bottom-32 right-16 w-16 h-16 bg-mcf-mint/50 rounded-full animate-float animation-delay-200"></div>
      <div className="absolute top-1/3 right-20 w-12 h-12 bg-mcf-orange/30 rounded-full animate-float animation-delay-400"></div>
      
      <div className="relative container mx-auto px-4 md:px-6 text-center z-10">
        <div className="max-w-4xl mx-auto">
          {/* Titre principal */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 text-mcf-text animate-fade-in">
            Abonnez votre enfant à sa propre aventure{' '}
            <span className="inline-block animate-float">✨</span>
          </h1>
          
          {/* Sous-titre */}
          <p className="text-lg md:text-xl lg:text-2xl text-mcf-text/80 mb-10 max-w-3xl mx-auto animate-fade-in animation-delay-200">
            Chaque mois, un livre personnalisé avec sa famille et ses héros préférés.
          </p>
          
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in animation-delay-300">
            <Link 
              to="/creer-profil-enfant" 
              className="bg-mcf-orange hover:bg-mcf-orange-dark text-white font-bold py-4 px-10 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-xl text-lg shadow-lg"
            >
              Commencer l'aventure
            </Link>
            
            <Link 
              to="/histoires" 
              className="text-mcf-text hover:text-mcf-orange font-medium text-lg underline underline-offset-4 hover:no-underline transition-all duration-300"
            >
              Découvrir nos histoires
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewHero;