import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const NewHero: React.FC = () => {
  const { user } = useAuth();

  // Détermine la destination selon l'état de connexion
  const getDestinationPath = () => {
    return user ? '/famille-dashboard' : '/creer-profil-enfant';
  };

  return (
    <section className="bg-white">
      {/* Image hero avec texte superposé */}
      <div className="relative w-full pt-20">
        <div className="aspect-video w-full">
          <img 
            src="/lovable-uploads/4fb09cd5-3654-42ad-b9c8-4399702f5a15.png" 
            alt="Famille lisant ensemble un livre personnalisé My Crazy Family"
            className="w-full h-full object-cover object-center"
          />
          
          {/* Overlay avec dégradé pour la lisibilité */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40"></div>
          
          {/* Contenu texte superposé */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="container mx-auto px-4 md:px-6 text-center">
              <div className="max-w-4xl mx-auto">
                {/* Titre principal */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 text-white drop-shadow-lg animate-fade-in">
                  Abonnez votre enfant à sa propre aventure{' '}
                  <span className="inline-block animate-float">✨</span>
                </h1>
                
                {/* Sous-titre */}
                <p className="text-base md:text-lg lg:text-xl text-white/90 mb-8 max-w-3xl mx-auto drop-shadow-md animate-fade-in animation-delay-200">
                  Chaque mois, un livre personnalisé avec sa famille et ses héros préférés.
                </p>
                
                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in animation-delay-300">
                  <Link 
                    to={getDestinationPath()} 
                    className="bg-mcf-primary hover:bg-mcf-primary-dark text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-xl text-base shadow-lg"
                  >
                    Commencer l'aventure
                  </Link>
                  
                  <Link 
                    to="/histoires" 
                    className="text-white/90 hover:text-white font-medium text-base underline underline-offset-4 hover:no-underline transition-all duration-300 drop-shadow-md"
                  >
                    Découvrir nos histoires
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewHero;