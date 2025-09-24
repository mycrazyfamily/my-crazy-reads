import React from 'react';
import { Link } from 'react-router-dom';

const NewHero: React.FC = () => {
  return (
    <section className="bg-white">
      {/* Section de présentation avec texte sur fond blanc */}
      <div className="bg-white pt-32 pb-16">
        <div className="container mx-auto px-4 md:px-6 text-center">
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
                className="bg-[#4A90E2] hover:bg-[#357ABD] text-white font-bold py-4 px-10 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-xl text-lg shadow-lg"
              >
                Commencer l'aventure
              </Link>
              
              <Link 
                to="/histoires" 
                className="text-mcf-text hover:text-mcf-primary font-medium text-lg underline underline-offset-4 hover:no-underline transition-all duration-300"
              >
                Découvrir nos histoires
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Image hero en ratio 16:9 */}
      <div className="relative w-full">
        <div className="aspect-video w-full">
          <img 
            src="/lovable-uploads/4fb09cd5-3654-42ad-b9c8-4399702f5a15.png" 
            alt="Famille lisant ensemble un livre personnalisé My Crazy Family"
            className="w-full h-full object-cover object-center"
          />
        </div>
      </div>
    </section>
  );
};

export default NewHero;