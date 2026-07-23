// Navbar.tsx v1.7
// Changelog v1.7 : libellé du bouton principal du TIROIR MOBILE corrigé pour un utilisateur
//   connecté. La v1.6 avait supprimé le doublon vers /espace-famille sur mobile, mais avait gardé
//   le libellé marketing « Continuer l'aventure » — une formule faite pour convaincre un visiteur,
//   pas pour orienter quelqu'un qui navigue. Sur desktop le problème ne se pose pas : le menu
//   contient à la fois « Espace famille » (navigation) et « Continuer l'aventure » (CTA). Sur
//   mobile il ne restait que le second. Désormais : « Commencer l'aventure » pour un visiteur
//   (acquisition, inchangé), « Mon espace famille » pour un connecté (navigation). Le libellé
//   desktop n'est pas modifié.
// Navbar.tsx v1.6
// Changelog v1.6 (MOBILE — D5 + D7 + D8) :
//   D7 : le menu mobile devient un TIROIR LATÉRAL (panneau droit ~85% + fond assombri cliquable)
//        au lieu d'un déroulant sous le header. Texte aligné à gauche, sections intitulées,
//        séparateurs, cibles tactiles généreuses. Rendu via createPortal(document.body) : la nav
//        prend la classe `glassmorphism` (backdrop-filter) au scroll, ce qui crée un bloc conteneur
//        et casserait un enfant `position: fixed`. Verrou de scroll iOS-safe + fermeture par Échap,
//        par tap sur le fond, par la croix, et au changement de route (v1.4).
//   D7 : ordre conditionnel — connecté, l'accès à l'espace famille est en tête (c'est LA
//        destination) ; visiteur, la navigation de vente reste en premier.
//   D7 : suppression d'un doublon — pour un connecté, « Continuer l'aventure » ET « Espace famille »
//        pointaient tous deux vers /espace-famille. Une seule entrée désormais, ce qui supprime
//        aussi l'impression de « clic sans effet » quand on est déjà sur le dashboard.
//   D5 : la cloche du header mobile est grisée et plus petite que le burger (elle captait trop
//        l'attention face à un burger bien plus important). La pastille rouge reste inchangée.
//   D8 : plus de mélange centré/aligné à gauche — tout le menu est aligné à gauche.
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
import { createPortal } from 'react-dom';
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

  // v1.6 (D7) : tant que le tiroir est ouvert, on verrouille le scroll de la page derrière.
  // `overflow: hidden` seul ne suffit pas sur iOS Safari → on fige le body en position fixed et on
  // restaure la position exacte à la fermeture. Échap ferme aussi le tiroir (accessibilité).
  useEffect(() => {
    if (!isMenuOpen) return;

    const scrollY = window.scrollY;
    const body = document.body;
    const previous = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow,
    };

    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
    body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.width = previous.width;
      body.style.overflow = previous.overflow;
      window.scrollTo(0, scrollY);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isMenuOpen]);

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

  // v1.6 : destination et libellé du CTA sortis de getActionButton pour être réutilisés tels quels
  // dans le tiroir mobile (avec un habillage pleine largeur), sans dupliquer la logique.
  const actionPath = isAuthenticated ? '/espace-famille' : '/creer-profil-enfant';
  const actionText = isAuthenticated ? 'Continuer l\'aventure' : 'Commencer l\'aventure';
  // v1.7 : dans le tiroir mobile, un connecté navigue vers son espace — un libellé de destination
  // est plus juste qu'une accroche marketing. Le desktop garde `actionText` (il dispose déjà d'un
  // lien « Espace famille » distinct, donc le CTA peut rester une accroche).
  const drawerActionText = isAuthenticated ? 'Mon espace famille' : actionText;

  const getActionButton = (onClick?: () => void) => {
    return (
      <Link 
        to={actionPath} 
        onClick={onClick}
        className="bg-mcf-primary text-white font-bold px-8 py-3 rounded-full hover:bg-mcf-secondary transition-all duration-300 transform hover:scale-105 shadow-lg"
      >
        {actionText}
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
                rien si l'utilisateur n'est pas connecté → aucun impact pour un visiteur.
                D5 : ici seulement, l'icône est grisée et réduite à 18px pour rester en retrait
                derrière le burger (24px, bleu), qui est de loin l'élément le plus important. On
                habille depuis l'extérieur plutôt que de modifier NotificationsBell → le rendu
                desktop reste strictement inchangé. La pastille rouge n'est pas touchée. */}
            <div className="[&_svg]:h-[18px] [&_svg]:w-[18px] [&_svg]:text-muted-foreground">
              <NotificationsBell />
            </div>

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

      {/* ============================ TIROIR MOBILE (D7) ============================
          Rendu via createPortal(document.body) : au scroll, la <nav> reçoit la classe
          `glassmorphism` (backdrop-filter), qui crée un bloc conteneur — un enfant en
          `position: fixed` se calerait alors sur la nav et non sur l'écran. Le portal évite ça.
          Fermeture : croix, tap sur le fond, touche Échap, changement de route. */}
      {isMenuOpen && createPortal(
        <div className="md:hidden fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Menu">
          {/* Fond assombri — garde la page visible derrière (repère rassurant) et sert de zone
              de fermeture au tap, comportement attendu sur un tiroir. */}
          <div
            className="absolute inset-0 bg-black/40 animate-overlay-in"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Panneau */}
          <div className="absolute inset-y-0 right-0 w-[85%] max-w-sm bg-white shadow-2xl flex flex-col animate-slide-in-right">
            {/* En-tête du panneau */}
            <div className="flex items-center justify-between px-5 py-4 border-t-0 border-b border-border flex-shrink-0">
              <span className="text-lg font-display font-bold text-mcf-primary">
                My Crazy Family
              </span>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                aria-label="Fermer le menu"
                className="-mr-2 p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Contenu — scrollable, avec marge basse safe-area (B6) */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-4 pb-safe">

              {/* Connecté : l'accès à l'espace famille passe en TÊTE (c'est la destination
                  principale d'un abonné) et c'est la SEULE entrée vers /espace-famille — avant,
                  « Continuer l'aventure » et « Espace famille » y menaient tous les deux. */}
              {isAuthenticated && (
                <div className="mb-5">
                  <Link
                    to={actionPath}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full bg-mcf-primary text-white font-bold px-6 py-3.5 rounded-full shadow-lg hover:bg-mcf-secondary transition-colors text-center"
                  >
                    <User size={18} />
                    {drawerActionText}
                  </Link>
                </div>
              )}

              <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Navigation
              </p>

              <Link
                to="/"
                className="block px-3 py-3.5 rounded-lg text-base font-medium hover:bg-muted transition-colors"
                onClick={() => {
                  handleHomeClick();
                  setIsMenuOpen(false);
                }}
              >
                Accueil
              </Link>
              <Link
                to="/histoires"
                className="block px-3 py-3.5 rounded-lg text-base font-medium hover:bg-muted transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Comment ça marche
              </Link>
              <Link
                to="/abonnement"
                className="block px-3 py-3.5 rounded-lg text-base font-medium hover:bg-muted transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Abonnement
              </Link>
              <Link
                to="/cadeau"
                className="block px-3 py-3.5 rounded-lg text-base font-medium hover:bg-muted transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Offrir
              </Link>

              <div className="my-3 border-t border-border" />

              <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Mon compte
              </p>

              {isAuthenticated ? (
                /* Déconnexion : action rare et destructrice → volontairement discrète, le rouge
                   n'apparaît qu'au survol/appui. */
                <button
                  type="button"
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full text-left px-3 py-3.5 rounded-lg text-base font-medium text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
                >
                  <LogOut size={18} />
                  Déconnexion
                </button>
              ) : (
                <>
                  <Link
                    to="/authentification"
                    className="flex items-center gap-2 px-3 py-3.5 rounded-lg text-base font-medium hover:bg-muted transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User size={18} />
                    Se connecter
                  </Link>

                  {/* Visiteur : la navigation de vente reste en premier, le CTA d'acquisition
                      conclut le menu. */}
                  <div className="mt-5 px-3">
                    <Link
                      to={actionPath}
                      onClick={() => setIsMenuOpen(false)}
                      className="block w-full bg-mcf-primary text-white font-bold px-6 py-3.5 rounded-full shadow-lg hover:bg-mcf-secondary transition-colors text-center"
                    >
                      {drawerActionText}
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </nav>
  );
};

export default Navbar;
