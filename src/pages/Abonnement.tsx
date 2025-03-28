
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Abonnement: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-mcf-cream flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-12 px-4">
        <div className="container mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-mcf-orange-dark mb-6 opacity-0 animate-fade-in">
            Nos formules d'abonnement
          </h1>
          
          <div className="max-w-5xl mx-auto mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Formule mensuelle */}
              <div className="border border-mcf-amber rounded-xl p-6 shadow-md bg-white hover:shadow-lg transition-shadow duration-300 opacity-0 animate-fade-in animation-delay-100">
                <h2 className="text-2xl font-bold text-mcf-orange-dark mb-3">Abonnement mensuel</h2>
                <p className="text-3xl font-bold text-mcf-orange mb-4">9,90€<span className="text-base font-normal text-gray-600">/mois</span></p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <span className="text-mcf-orange">✓</span>
                    <span>Un livre personnalisé chaque mois</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-mcf-orange">✓</span>
                    <span>Sans engagement de durée</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-mcf-orange">✓</span>
                    <span>Livraison gratuite</span>
                  </li>
                </ul>
                <button 
                  onClick={() => navigate('/pret-a-demarrer')}
                  className="w-full bg-mcf-orange hover:bg-mcf-orange-dark text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                  Choisir cette formule
                </button>
              </div>
              
              {/* Formule annuelle */}
              <div className="border border-mcf-orange rounded-xl p-6 shadow-md bg-white hover:shadow-lg transition-shadow duration-300 opacity-0 animate-fade-in animation-delay-200">
                <div className="bg-mcf-amber text-mcf-orange-dark text-sm font-bold py-1 px-3 rounded-full inline-block mb-3">
                  ÉCONOMIE DE 20%
                </div>
                <h2 className="text-2xl font-bold text-mcf-orange-dark mb-3">Abonnement annuel</h2>
                <p className="text-3xl font-bold text-mcf-orange mb-4">99€<span className="text-base font-normal text-gray-600">/an</span></p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <span className="text-mcf-orange">✓</span>
                    <span>Un livre personnalisé chaque mois</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-mcf-orange">✓</span>
                    <span>Cadeau de bienvenue offert</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-mcf-orange">✓</span>
                    <span>2 mois gratuits</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-mcf-orange">✓</span>
                    <span>Livraison gratuite</span>
                  </li>
                </ul>
                <button 
                  onClick={() => navigate('/pret-a-demarrer')}
                  className="w-full bg-mcf-orange-dark hover:bg-mcf-orange text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                  Choisir cette formule
                </button>
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <h3 className="text-xl font-semibold text-mcf-orange-dark mb-3">Vous souhaitez offrir un livre unique ?</h3>
              <button 
                onClick={() => navigate('/offrir-livre')}
                className="inline-flex items-center bg-white border-2 border-mcf-orange text-mcf-orange-dark hover:bg-mcf-amber/20 font-bold py-2 px-6 rounded-full transition-all duration-300"
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
