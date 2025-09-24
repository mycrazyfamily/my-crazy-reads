import React from 'react';
import { Link } from 'react-router-dom';

const NewHero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 pb-10 overflow-hidden">
      {/* Image de fond avec ratio 16:9 */}
      <div className="absolute inset-0 w-full h-full">
        <div className="relative w-full h-full aspect-video">
          <img 
            src="/lovable-uploads/4fb09cd5-3654-42ad-b9c8-4399702f5a15.png" 
            alt="Famille lisant ensemble un livre personnalisé My Crazy Family"
            className="w-full h-full object-cover object-center"
          />
          {/* Overlay dégradé pour la lisibilité du texte */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30"></div>
        </div>
      </div>
      
      <div className="relative container mx-auto px-4 md:px-6 text-center z-10">
        <div className="max-w-4xl mx-auto">
          {/* Titre principal */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 text-white drop-shadow-lg animate-fade-in">
            Abonnez votre enfant à sa propre aventure{' '}
            <span className="inline-block animate-float">✨</span>
          </h1>
          
          {/* Sous-titre */}
          <p className="text-lg md:text-xl lg:text-2xl text-white/90 mb-10 max-w-3xl mx-auto drop-shadow-md animate-fade-in animation-delay-200">
            Chaque mois, un livre personnalisé avec sa famille et ses héros préférés.
          </p>
          
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in animation-delay-300">
            <Link 
              to="/creer-profil-enfant" 
              className="bg-[#4A90E2] hover:bg-[#357ABD] text-white font-bold py-4 px-10 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-xl text-lg shadow-lg"
            >
              Commencer l'aventure
            </Link>
            
            <Link 
              to="/histoires" 
              className="text-white/90 hover:text-white font-medium text-lg underline underline-offset-4 hover:no-underline transition-all duration-300 drop-shadow-md"
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