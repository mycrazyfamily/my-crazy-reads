
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

  const getActionButton = () => {
    if (!isAuthenticated) {
      return (
        <Link 
          to="/creer-profil-enfant" 
          className="bg-mcf-orange text-white font-medium px-6 py-2 rounded-full hover:bg-mcf-orange-dark transition-colors"
        >
          Commencer
        </Link>
      );
    } else if (!hasActiveSubscription) {
      return (
        <Link 
          to="/offrir-livre" 
          className="bg-mcf-orange text-white font-medium px-6 py-2 rounded-full hover:bg-mcf-orange-dark transition-colors"
        >
          Offrir un livre
        </Link>
      );
    } else {
      return (
        <Link 
          to="/creer-profil-enfant" 
          className="bg-mcf-orange text-white font-medium px-6 py-2 rounded-full hover:bg-mcf-orange-dark transition-colors"
        >
          Commander un livre
        </Link>
      );
    }
  };

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
            
            {(isAuthenticated && !hasActiveSubscription) && (
              <Link to="/abonnement" className="font-medium hover:text-mcf-orange transition-colors px-3 py-2">
                Abonnement
              </Link>
            )}
            
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <NotificationsBell />
                <Link 
                  to="/espace-famille" 
                  className="font-medium text-mcf-orange-dark hover:text-mcf-orange transition-colors flex items-center gap-1 px-3 py-2"
                >
                  <User size={18} />
                  Espace famille
                </Link>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="border-2 border-mcf-amber rounded-full p-0.5 hover:border-mcf-orange transition-colors">
                      <Avatar className="h-8 w-8">
                        {user?.avatarUrl ? (
                          <AvatarImage src={user.avatarUrl} alt="Photo de profil" />
                        ) : (
                          <AvatarFallback className="bg-mcf-amber text-mcf-orange-dark">
                            {user?.firstName?.charAt(0) ?? user?.email?.charAt(0).toUpperCase() ?? "👨‍👩‍👧‍👦"}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                      {user?.firstName ?? user?.email ?? "Ma famille"}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/espace-famille" className="flex items-center gap-2 cursor-pointer">
                        <User size={16} />
                        <span>Espace famille</span>
                      </Link>
                    </DropdownMenuItem>
                    {hasActiveSubscription && (
                      <DropdownMenuItem asChild>
                        <Link to="/abonnement" className="flex items-center gap-2 cursor-pointer">
                          <Bell size={16} />
                          <span>Gérer mon abonnement</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 cursor-pointer text-red-500">
                      <LogOut size={16} />
                      <span>Déconnexion</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <Link 
                  to="/authentification" 
                  className="font-medium text-mcf-orange-dark hover:text-mcf-orange transition-colors px-3 py-2"
                >
                  Se connecter
                </Link>
              </>
            )}
            {getActionButton()}
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
            
            {(isAuthenticated && !hasActiveSubscription) && (
              <Link 
                to="/abonnement" 
                className="font-medium hover:text-mcf-orange transition-colors px-2 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Abonnement
              </Link>
            )}
            
            {isAuthenticated ? (
              <>
                <div className="px-2 py-2">
                  <NotificationsBell />
                </div>
                <Link 
                  to="/espace-famille" 
                  className="font-medium text-mcf-orange-dark hover:text-mcf-orange transition-colors flex items-center gap-2 px-2 py-2"
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
                  className="font-medium text-red-500 hover:text-red-600 transition-colors flex items-center gap-2 px-2 py-2"
                >
                  <LogOut size={18} />
                  Déconnexion
                </button>
              </>
            ) : (
              <Link 
                to="/authentification" 
                className="font-medium text-mcf-orange-dark hover:text-mcf-orange transition-colors px-2 py-2"
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
