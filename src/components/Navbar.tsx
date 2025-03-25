
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
          <div className="hidden md:flex space-x-8 items-center">
            <Link to="/" className="font-medium hover:text-mcf-orange transition-colors">
              Accueil
            </Link>
            <Link to="/histoires" className="font-medium hover:text-mcf-orange transition-colors">
              Nos Histoires
            </Link>
            <Link to="/fonctionnement" className="font-medium hover:text-mcf-orange transition-colors">
              Comment ça marche
            </Link>
            <Link to="/abonnement" className="font-medium hover:text-mcf-orange transition-colors">
              Abonnement
            </Link>
            <Link 
              to="/commencer" 
              className="bg-mcf-orange text-white font-medium px-6 py-2 rounded-full hover:bg-mcf-orange-dark transition-colors"
            >
              Commencer
            </Link>
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
          <div className="flex flex-col space-y-4">
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
            <Link 
              to="/commencer" 
              className="bg-mcf-orange text-white font-medium px-6 py-2 rounded-full hover:bg-mcf-orange-dark transition-colors text-center"
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
