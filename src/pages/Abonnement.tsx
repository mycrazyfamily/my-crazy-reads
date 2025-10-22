import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Abonnement: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-12 px-4">
        <div className="container mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 text-mcf-primary animate-fade-in">
            Nos formules d'abonnement
          </h1>
          
          <div className="max-w-5xl mx-auto mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Formule mensuelle */}
              <div className="border border-mcf-mint rounded-xl p-6 shadow-md bg-white hover:shadow-lg transition-shadow duration-300 animate-fade-in animation-delay-100">
                <h2 className="text-2xl font-bold mb-3 text-mcf-primary">Abonnement mensuel</h2>
                <p className="text-3xl font-bold mb-4 text-mcf-secondary">19,99€<span className="text-base font-normal text-muted-foreground">/mois</span></p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <span className="text-mcf-secondary font-bold">✓</span>
                    <span>Un livre personnalisé chaque mois</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-mcf-secondary font-bold">✓</span>
                    <span>Sans engagement de durée</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-mcf-secondary font-bold">✓</span>
                    <span>Livraison incluse</span>
                  </li>
                </ul>
                <button 
                  onClick={() => navigate('/pret-a-demarrer')}
                  className="w-full bg-mcf-primary hover:bg-mcf-primary-dark text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 hover:scale-105"
                >
                  Choisir cette formule
                </button>
              </div>
              
              {/* Formule annuelle */}
              <div className="border border-mcf-secondary rounded-xl p-6 shadow-md bg-white hover:shadow-lg transition-shadow duration-300 animate-fade-in animation-delay-200">
                <div className="text-sm font-bold py-1 px-3 rounded-full inline-block mb-3 bg-mcf-mint text-mcf-primary">
                  ÉCONOMIE DE 20%
                </div>
                <h2 className="text-2xl font-bold mb-3 text-mcf-primary">Abonnement annuel</h2>
                <p className="text-3xl font-bold mb-4 text-mcf-secondary">219,99€<span className="text-base font-normal text-muted-foreground">/an</span></p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <span className="text-mcf-secondary font-bold">✓</span>
                    <span>Un livre personnalisé chaque mois</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-mcf-secondary font-bold">✓</span>
                    <span>Cadeau de bienvenue offert</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-mcf-secondary font-bold">✓</span>
                    <span>1 mois gratuit</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-mcf-secondary font-bold">✓</span>
                    <span>Livraison incluse</span>
                  </li>
                </ul>
                <button 
                  onClick={() => navigate('/pret-a-demarrer')}
                  className="w-full bg-mcf-secondary hover:bg-mcf-secondary-light text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 hover:scale-105"
                >
                  Choisir cette formule
                </button>
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <h3 className="text-xl font-semibold mb-3 text-mcf-primary">Vous souhaitez offrir un livre unique ?</h3>
              <button 
                onClick={() => navigate('/offrir-livre')}
                className="inline-flex items-center bg-white border-2 border-mcf-secondary hover:bg-mcf-mint text-mcf-primary font-bold py-2 px-6 rounded-full transition-all duration-300 hover:scale-105"
              >
                Découvrir nos livres cadeaux
              </button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Abonnement;