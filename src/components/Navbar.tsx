// Navbar.tsx v1.5
// Changelog v1.5 (MOBILE — D2 + D3) :
//   D2 : la cloche de notifications sort du menu burger et remonte dans le header, à gauche du
//        bouton burger. Elle porte une pastille de non-lus qui, enfouie dans le menu, n'était
//        visible qu'après ouverture — les notifications n'alertaient donc personne sur mobile.
//   D3 : le menu mobile sépare désormais la navigation du site et le bloc « Mon compte »
//        (séparateur + intitulé + style neutre). Avant, « Espace famille » (bleu) et
//        « Déconnexion » (rouge) ressemblaient à des boutons et concurrençaient le CTA du bas.
//        Le seul élément coloré du menu est maintenant le CTA. Desktop strictement inchangé.
// Navbar.tsx v1.4
// v1.4 (A4 — menu burger mobile) : le menu ne se fermait pas au clic sur « Continuer/Commencer
//   l'aventure » (getActionButton) — seul lien du menu mobile sans onClick de fermeture. Fix :
//   (1) getActionButton accepte un onClick optionnel, appelé uniquement en mobile pour fermer le
//   menu ; (2) ceinture-bretelles — useEffect qui ferme le menu à CHAQUE changement de route
//   (couvre ce bouton + tout futur lien oublié). Desktop inchangé.
// v1.3: header raccourci en « Offrir » (garde « Abonnement » en avant ; footer reste « Offrir un abonnement »)
// v1.2: libellé « Cadeau » → « Offrir un abonnement » (desktop + mobile), cohérence avec le footer
// v1.1: ajout du lien « Cadeau » (/cadeau) à côté d'Abonnement, en desktop et mobile
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, Bell, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import NotificationsBell from './NotificationsBell';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, hasActiveSubscription, user, logout } = useAuth();
  const location = useLocation();

  // v1.4 (ceinture-bretelles) : ferme le menu mobile à chaque changement de route, quel que soit
  // le lien cliqué — couvre le bouton d'action et tout futur lien qu'on oublierait de câbler.
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = async () => {
    try {
      console.log('▶︎ logout: clicked in Navbar');
      await logout();
      console.log('▶︎ logout: completed, redirect should occur');
    } catch (e) {
      console.error('❌ logout error:', e);
    }
  };
  const handleHomeClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getActionButton = (onClick?: () => void) => {
    const destinationPath = isAuthenticated ? '/espace-famille' : '/creer-profil-enfant';
    const buttonText = isAuthenticated ? 'Continuer l\'aventure' : 'Commencer l\'aventure';
    return (
      <Link 
        to={destinationPath} 
        onClick={onClick}
        className="bg-mcf-primary text-white font-bold px-8 py-3 rounded-full hover:bg-mcf-secondary transition-all duration-300 transform hover:scale-105 shadow-lg"
      >
        {buttonText}
      </Link>
    );
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glassmorphism py-3' : 'bg-white py-5'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link 
            to="/" 
            className="text-2xl font-display font-bold text-mcf-primary tracking-tight"
            onClick={handleHomeClick}
          >
            My Crazy Family
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-4 items-center">
            <Link to="/" className="font-medium hover:text-mcf-primary transition-colors px-3 py-2" onClick={handleHomeClick}>
              Accueil
            </Link>
            <Link to="/histoires" className="font-medium hover:text-mcf-primary transition-colors px-3 py-2">
              Comment ça marche
            </Link>
            <Link to="/abonnement" className="font-medium hover:text-mcf-primary transition-colors px-3 py-2">
              Abonnement
            </Link>
            <Link to="/cadeau" className="font-medium hover:text-mcf-primary transition-colors px-3 py-2">
              Offrir
            </Link>
            
            
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <NotificationsBell />
                <Link 
                  to="/espace-famille" 
                  className="font-medium text-mcf-primary hover:text-mcf-secondary transition-colors flex items-center gap-1 px-3 py-2"
                >
                  <User size={18} />
                  Espace famille
                </Link>
              </div>
            ) : (
              <>
                <Link 
                  to="/authentification" 
                  className="font-medium text-mcf-primary hover:text-mcf-secondary transition-colors px-3 py-2"
                >
                  Se connecter
                </Link>
              </>
            )}
            {getActionButton()}
          </div>

          {/* Zone droite mobile : cloche (D2) + bouton burger */}
          <div className="flex items-center gap-1 md:hidden">
            {/* D2 : la cloche sort du menu burger et vient ici. Elle porte une pastille rouge de
                non-lus : enfouie dans le menu, cette pastille n'était visible qu'après ouverture,
                donc les notifications n'alertaient personne sur mobile. NotificationsBell ne rend
                rien si l'utilisateur n'est pas connecté → aucun impact pour un visiteur. */}
            <NotificationsBell />

            <button
              className="text-mcf-primary"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden glassmorphism mt-3 py-4 px-4">
          <div className="flex flex-col space-y-2">
            <Link 
              to="/" 
              className="font-medium hover:text-mcf-primary transition-colors px-2 py-2"
              onClick={() => {
                handleHomeClick();
                setIsMenuOpen(false);
              }}
            >
              Accueil
            </Link>
            <Link 
              to="/histoires" 
              className="font-medium hover:text-mcf-primary transition-colors px-2 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Comment ça marche
            </Link>
            <Link 
              to="/abonnement" 
              className="font-medium hover:text-mcf-primary transition-colors px-2 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Abonnement
            </Link>
            <Link 
              to="/cadeau" 
              className="font-medium hover:text-mcf-primary transition-colors px-2 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Offrir
            </Link>
            
            
            {/* D3 — Bloc « Mon compte », séparé de la navigation du site.
                Avant, les entrées de compte étaient colorées (bleu / rouge) et se mélangeaient aux
                liens de navigation : elles ressemblaient à des boutons d'action et entraient en
                concurrence visuelle avec le vrai CTA du bas. Désormais : un séparateur, un intitulé
                de section, et le même style neutre que les liens de nav. Le seul élément coloré du
                menu reste le CTA en bas → hiérarchie lisible. */}
            <div className="pt-2 mt-1 border-t border-border" />
            <p className="px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Mon compte
            </p>

            {isAuthenticated ? (
              <>
                <Link 
                  to="/espace-famille" 
                  className="font-medium hover:text-mcf-primary transition-colors flex items-center gap-2 px-2 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User size={18} />
                  Espace famille
                </Link>
                
                {/* Déconnexion : action rare et destructrice → volontairement discrète (le rouge
                    n'apparaît qu'au survol/appui), pour ne pas attirer l'œil en premier. */}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="font-medium text-muted-foreground hover:text-destructive transition-colors flex items-center gap-2 px-2 py-2 text-left"
                >
                  <LogOut size={18} />
                  Déconnexion
                </button>
              </>
            ) : (
              <Link 
                to="/authentification" 
                className="font-medium hover:text-mcf-primary transition-colors flex items-center gap-2 px-2 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <User size={18} />
                Se connecter
              </Link>
            )}
            
            <div className="pt-2">
              {getActionButton(() => setIsMenuOpen(false))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
