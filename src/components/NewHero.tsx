// NewHero v1.2
// Changelog v1.2 (chargement de l'image) : l'image du hero est l'élément le plus lourd de la page
//   d'accueil et le premier vu — son apparition tardive donne une mauvaise première impression.
//   (a) `decoding="async"` + `loading="eager"` : priorité au chargement, décodage non bloquant ;
//   (b) le conteneur reçoit un fond dégradé de la charte, visible pendant le chargement, pour
//   éviter le rectangle blanc puis l'apparition brutale. NB : ces réglages améliorent le RESSENTI ;
//   la vraie réduction du temps de chargement passe par le poids du fichier (voir note de session)
//   et par la mise en cache HTTP, qui ne se pilotent pas depuis React.
// NewHero v1.1
// Changelog v1.1 (C-Home, MOBILE) : le titre passait derrière la navbar. Deux causes cumulées,
//   toutes deux corrigées sur le conteneur de l'image : (a) il n'était pas `relative`, donc les
//   overlays et le bloc de texte en `absolute inset-0` se calaient sur le parent (qui inclut les
//   80px de pt-20 de la navbar) → texte centré trop haut ; (b) en 16/9 l'image est trop courte sur
//   mobile (~219px) pour un contenu d'environ 350px → débordement vers le haut. Ratio 4/5 sur
//   mobile, 16/9 dès sm:. Desktop strictement inchangé.
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
        {/* C-Home — deux corrections liées :
            1) `relative` : sans lui, ce conteneur n'était pas positionné, donc les trois `absolute
               inset-0` (2 dégradés + le bloc de texte) se calaient sur le div PARENT, qui inclut
               les 80px de `pt-20` réservés à la navbar. Le texte était donc centré sur
               (navbar + image) et remontait ~40px trop haut, sous la navbar.
            2) ratio mobile : en 16/9 sur un écran de 390px, l'image ne fait que ~219px de haut
               alors que le contenu (titre 3 lignes + sous-titre 4 lignes + 2 CTA empilés) en
               mesure ~350px → il débordait au-dessus, derrière la navbar. En 4/5 l'image fait
               ~487px, le contenu tient largement. Desktop inchangé (sm: repasse en 16/9). */}
        <div className="relative w-full aspect-[4/5] sm:aspect-video bg-gradient-to-br from-mcf-gradient-start to-mcf-gradient-end">
          <img 
            src="/lovable-uploads/4fb09cd5-3654-42ad-b9c8-4399702f5a15.png" 
            alt="Famille lisant ensemble un livre personnalisé My Crazy Family"
            loading="eager"
            decoding="async"
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
