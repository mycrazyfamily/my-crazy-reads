
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Abonnement: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FFFBEB' }}>
      <Navbar />
      
      <main className="flex-grow py-12 px-4">
        <div className="container mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-6" 
              style={{ color: '#F97316', opacity: 1, animation: 'fade-in 0.8s ease-out forwards' }}>
            Nos formules d'abonnement
          </h1>
          
          <div className="max-w-5xl mx-auto mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Formule mensuelle */}
              <div className="border rounded-xl p-6 shadow-md bg-white hover:shadow-lg transition-shadow duration-300" 
                   style={{ borderColor: '#FCD34D', opacity: 1, animation: 'fade-in 0.8s ease-out forwards', animationDelay: '0.1s' }}>
                <h2 className="text-2xl font-bold mb-3" style={{ color: '#F97316' }}>Abonnement mensuel</h2>
                <p className="text-3xl font-bold mb-4" style={{ color: '#FB923C' }}>9,90€<span className="text-base font-normal text-gray-600">/mois</span></p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <span style={{ color: '#FB923C' }}>✓</span>
                    <span>Un livre personnalisé chaque mois</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span style={{ color: '#FB923C' }}>✓</span>
                    <span>Sans engagement de durée</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span style={{ color: '#FB923C' }}>✓</span>
                    <span>Livraison gratuite</span>
                  </li>
                </ul>
                <button 
                  onClick={() => navigate('/pret-a-demarrer')}
                  className="w-full text-white font-bold py-3 px-4 rounded-lg transition-colors"
                  style={{ backgroundColor: '#FB923C' }}
                >
                  Choisir cette formule
                </button>
              </div>
              
              {/* Formule annuelle */}
              <div className="border rounded-xl p-6 shadow-md bg-white hover:shadow-lg transition-shadow duration-300" 
                   style={{ borderColor: '#FB923C', opacity: 1, animation: 'fade-in 0.8s ease-out forwards', animationDelay: '0.2s' }}>
                <div className="text-sm font-bold py-1 px-3 rounded-full inline-block mb-3" 
                     style={{ backgroundColor: '#FCD34D', color: '#F97316' }}>
                  ÉCONOMIE DE 20%
                </div>
                <h2 className="text-2xl font-bold mb-3" style={{ color: '#F97316' }}>Abonnement annuel</h2>
                <p className="text-3xl font-bold mb-4" style={{ color: '#FB923C' }}>99€<span className="text-base font-normal text-gray-600">/an</span></p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <span style={{ color: '#FB923C' }}>✓</span>
                    <span>Un livre personnalisé chaque mois</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span style={{ color: '#FB923C' }}>✓</span>
                    <span>Cadeau de bienvenue offert</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span style={{ color: '#FB923C' }}>✓</span>
                    <span>2 mois gratuits</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span style={{ color: '#FB923C' }}>✓</span>
                    <span>Livraison gratuite</span>
                  </li>
                </ul>
                <button 
                  onClick={() => navigate('/pret-a-demarrer')}
                  className="w-full text-white font-bold py-3 px-4 rounded-lg transition-colors"
                  style={{ backgroundColor: '#F97316' }}
                >
                  Choisir cette formule
                </button>
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <h3 className="text-xl font-semibold mb-3" style={{ color: '#F97316' }}>Vous souhaitez offrir un livre unique ?</h3>
              <button 
                onClick={() => navigate('/offrir-livre')}
                className="inline-flex items-center bg-white border-2 font-bold py-2 px-6 rounded-full transition-all duration-300"
                style={{ borderColor: '#FB923C', color: '#F97316' }}
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
