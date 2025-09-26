
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

  const handleLogout = () => {
    logout();
    toast.success('Vous avez été déconnecté avec succès');
  };

  const handleHomeClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getActionButton = () => {
    const destinationPath = isAuthenticated ? '/espace-famille' : '/creer-profil-enfant';
    const buttonText = isAuthenticated ? 'Continuer l\'aventure' : 'Commencer l\'aventure';
    return (
      <Link 
        to={destinationPath} 
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
              Nos Histoires
            </Link>
            <Link to="/abonnement" className="font-medium hover:text-mcf-primary transition-colors px-3 py-2">
              Abonnement
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

          {/* Mobile Menu Button */}
      <button 
        className="md:hidden text-mcf-primary" 
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
      >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
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
              Nos Histoires
            </Link>
            <Link 
              to="/abonnement" 
              className="font-medium hover:text-mcf-primary transition-colors px-2 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Abonnement
            </Link>
            
            
            {isAuthenticated ? (
              <>
                <div className="px-2 py-2">
                  <NotificationsBell />
                </div>
                <Link 
                  to="/espace-famille" 
                  className="font-medium text-mcf-primary hover:text-mcf-secondary transition-colors flex items-center gap-2 px-2 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User size={18} />
                  Espace famille
                </Link>
                
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="font-medium text-destructive hover:text-destructive/80 transition-colors flex items-center gap-2 px-2 py-2"
                >
                  <LogOut size={18} />
                  Déconnexion
                </button>
              </>
            ) : (
              <Link 
                to="/authentification" 
                className="font-medium text-mcf-primary hover:text-mcf-secondary transition-colors px-2 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Se connecter
              </Link>
            )}
            
            <div className="pt-2">
              {getActionButton()}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
