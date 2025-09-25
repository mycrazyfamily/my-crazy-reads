
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-mcf-gradient-start py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="text-2xl font-display font-bold text-mcf-primary mb-4 block">
              My Crazy Family
            </Link>
            <p className="text-muted-foreground mb-4">
              Des histoires personnalisées pour vivre des aventures magiques en famille.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Navigation</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-mcf-primary transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/histoires" className="text-muted-foreground hover:text-mcf-primary transition-colors">
                  Nos Histoires
                </Link>
              </li>
              <li>
                <Link to="/fonctionnement" className="text-muted-foreground hover:text-mcf-primary transition-colors">
                  Comment ça marche
                </Link>
              </li>
              <li>
                <Link to="/abonnement" className="text-muted-foreground hover:text-mcf-primary transition-colors">
                  Abonnement
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Informations</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/a-propos" className="text-muted-foreground hover:text-mcf-primary transition-colors">
                  À propos de nous
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-muted-foreground hover:text-mcf-primary transition-colors">
                  Foire aux questions
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-mcf-primary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-muted-foreground hover:text-mcf-primary transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Légal</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/conditions-generales" className="text-muted-foreground hover:text-mcf-primary transition-colors">
                  Conditions générales
                </Link>
              </li>
              <li>
                <Link to="/confidentialite" className="text-muted-foreground hover:text-mcf-primary transition-colors">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link to="/livraison" className="text-muted-foreground hover:text-mcf-primary transition-colors">
                  Livraison
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-mcf-secondary mt-8 pt-8 text-center">
          <p className="text-muted-foreground">
            &copy; {new Date().getFullYear()} My Crazy Family. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
