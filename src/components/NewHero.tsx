import React from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
const NewHero: React.FC = () => {
  const { user, isLoading } = useAuth();
  // Détermine la destination selon l'état de connexion
  const getDestinationPath = () => {
    return user ? '/espace-famille' : '/creer-profil-enfant';
  };
  // Détermine le texte du bouton selon l'état de connexion
  const getButtonText = () => {
    return user ? 'Continuer l\'aventure' : 'Commencer l\'aventure';
  };
  // Scroll local vers la section des exemples de livres (présente sur l'accueil)
  const scrollToStories = () => {
    document.getElementById('nos-histoires')?.scrollIntoView({ behavior: 'smooth' });
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
                  Abonnez votre enfant à sa propre aventure
                </h1>
                
                {/* Sous-titre */}
                <p className="text-base md:text-lg lg:text-xl text-white/90 mb-8 max-w-3xl mx-auto drop-shadow-md animate-fade-in animation-delay-200">
                  Chaque mois, un livre personnalisé où sa famille, ses amis et son monde deviennent les héros de l'histoire.
                </p>
                
                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in animation-delay-300">
                  {/* Anti-flash A3 : tant que l'auth n'est pas résolue, placeholder non-cliquable
                      au lieu de « Commencer l'aventure » (qui, cliqué pendant ce court instant par
                      un utilisateur connecté, le renvoyait au login via le RouteGuard). */}
                  {isLoading ? (
                    <span className="inline-flex items-center gap-2 bg-mcf-primary text-white font-bold py-3 px-8 rounded-full text-base shadow-lg opacity-70 cursor-default">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Chargement…
                    </span>
                  ) : (
                    <Link 
                      to={getDestinationPath()} 
                      className="bg-mcf-primary hover:bg-mcf-primary-dark text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-xl text-base shadow-lg"
                    >
                      {getButtonText()}
                    </Link>
                  )}
                  
                  <button 
                    type="button"
                    onClick={scrollToStories}
                    className="text-white/90 hover:text-white font-medium text-base underline underline-offset-4 hover:no-underline transition-all duration-300 drop-shadow-md"
                  >
                    Découvrir nos histoires
                  </button>
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
