
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();

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

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glassmorphism py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link 
            to="/" 
            className="text-2xl font-display font-bold text-mcf-orange-dark tracking-tight"
          >
            My Crazy Family
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-4 items-center">
            <Link to="/" className="font-medium hover:text-mcf-orange transition-colors px-3 py-2">
              Accueil
            </Link>
            <Link to="/histoires" className="font-medium hover:text-mcf-orange transition-colors px-3 py-2">
              Nos Histoires
            </Link>
            <Link to="/fonctionnement" className="font-medium hover:text-mcf-orange transition-colors px-3 py-2">
              Comment ça marche
            </Link>
            <Link to="/abonnement" className="font-medium hover:text-mcf-orange transition-colors px-3 py-2">
              Abonnement
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to="/espace-famille" 
                  className="font-medium text-mcf-orange-dark hover:text-mcf-orange transition-colors flex items-center gap-1 px-3 py-2"
                >
                  <User size={18} />
                  Espace famille
                </Link>
                <Link 
                  to="/creer-profil-enfant" 
                  className="bg-mcf-orange text-white font-medium px-6 py-2 rounded-full hover:bg-mcf-orange-dark transition-colors"
                >
                  Commencer
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/authentification" 
                  className="font-medium text-mcf-orange-dark hover:text-mcf-orange transition-colors px-3 py-2"
                >
                  Se connecter
                </Link>
                <Link 
                  to="/creer-profil-enfant" 
                  className="bg-mcf-orange text-white font-medium px-6 py-2 rounded-full hover:bg-mcf-orange-dark transition-colors"
                >
                  Commencer
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-mcf-orange-dark" 
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
              className="font-medium hover:text-mcf-orange transition-colors px-2 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Accueil
            </Link>
            <Link 
              to="/histoires" 
              className="font-medium hover:text-mcf-orange transition-colors px-2 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Nos Histoires
            </Link>
            <Link 
              to="/fonctionnement" 
              className="font-medium hover:text-mcf-orange transition-colors px-2 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Comment ça marche
            </Link>
            <Link 
              to="/abonnement" 
              className="font-medium hover:text-mcf-orange transition-colors px-2 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Abonnement
            </Link>
            
            {isAuthenticated && (
              <Link 
                to="/espace-famille" 
                className="font-medium text-mcf-orange-dark hover:text-mcf-orange transition-colors flex items-center gap-2 px-2 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <User size={18} />
                Espace famille
              </Link>
            )}
            
            {!isAuthenticated && (
              <Link 
                to="/authentification" 
                className="font-medium text-mcf-orange-dark hover:text-mcf-orange transition-colors px-2 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Se connecter
              </Link>
            )}
            
            <Link 
              to="/creer-profil-enfant" 
              className="bg-mcf-orange text-white font-medium px-6 py-2 rounded-full hover:bg-mcf-orange-dark transition-colors text-center mt-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Commencer
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
