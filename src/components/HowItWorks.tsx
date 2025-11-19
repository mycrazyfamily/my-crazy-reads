import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const HowItWorks: React.FC = () => {
  const { user } = useAuth();

  // Détermine la destination selon l'état de connexion
  const getDestinationPath = () => {
    return user ? '/espace-famille' : '/creer-profil-enfant';
  };

  // Détermine le texte du bouton selon l'état de connexion
  const getButtonText = () => {
    return user ? 'Gérer mon abonnement' : 'J\'abonne ma famille';
  };

  const steps = [
    {
      number: "1",
      icon: "👨‍👩‍👧‍👦",
      title: "Créez votre famille",
      description: "Personnalisez les profils de vos enfants et de votre famille pour une histoire unique."
    },
    {
      number: "2", 
      icon: "✨",
      title: "Personnalisez l'histoire",
      description: "Choisissez les thèmes, les personnages et les aventures qui plairont à votre enfant."
    },
    {
      number: "3",
      icon: "📚",
      title: "Recevez votre livre chaque mois",
      description: "Un livre de qualité imprimé et personnalisé livré directement chez vous."
    }
  ];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-mcf-primary mb-6">
            Comment ça marche
          </h2>
          <p className="text-lg md:text-xl text-mcf-text/70 max-w-3xl mx-auto">
            Trois étapes simples pour offrir des aventures personnalisées à votre enfant
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto mb-12">
          {steps.map((step, index) => (
            <div key={index} className="text-center group">
              {/* Numéro de l'étape */}
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto bg-mcf-primary text-white text-2xl font-bold rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  {step.number}
                </div>
                {/* Ligne de connexion (sauf pour le dernier) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-1/2 w-32 h-0.5 bg-mcf-secondary transform translate-x-full"></div>
                )}
              </div>
              
              {/* Icône */}
              <div className="text-4xl mb-4">{step.icon}</div>
              
              {/* Titre */}
              <h3 className="text-xl md:text-2xl font-bold text-mcf-text mb-4">
                {step.title}
              </h3>
              
              {/* Description */}
              <p className="text-mcf-text/70 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
        
        {/* CTA final */}
        <div className="text-center">
          <Link 
            to={getDestinationPath()} 
            className="bg-mcf-primary hover:bg-mcf-secondary text-white font-bold py-4 px-10 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-xl text-lg shadow-lg"
          >
            {getButtonText()}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;