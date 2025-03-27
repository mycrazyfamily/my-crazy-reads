
import React from 'react';
import type { ChildProfileFormData } from '@/types/childProfile';

type PersonalitySummaryProps = {
  data: ChildProfileFormData;
};

const PersonalitySummary: React.FC<PersonalitySummaryProps> = ({ data }) => {
  // Fonction pour obtenir le libellé de la taille
  const getHeightLabel = () => {
    switch (data.height) {
      case 'small': return 'Petit(e)';
      case 'medium': return 'Moyen(ne)';
      case 'tall': return 'Grand(e)';
      default: return 'Non spécifiée';
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <h4 className="font-medium text-gray-600 mb-1">Taille:</h4>
        <p>{getHeightLabel()}</p>
      </div>
      
      {data.superpowers && data.superpowers.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-600 mb-1">Super-pouvoirs:</h4>
          <div className="flex flex-wrap gap-2">
            {data.superpowers.map((power, index) => (
              <span 
                key={index} 
                className="bg-mcf-amber/10 text-mcf-orange-dark px-3 py-1 rounded-full text-sm"
              >
                {power}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {data.passions && data.passions.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-600 mb-1">Centres d'intérêt:</h4>
          <div className="flex flex-wrap gap-2">
            {data.passions.map((passion, index) => (
              <span 
                key={index} 
                className="bg-mcf-amber/10 text-mcf-orange-dark px-3 py-1 rounded-full text-sm"
              >
                {passion}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {data.challenges && data.challenges.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-600 mb-1">Défis personnels:</h4>
          <div className="flex flex-wrap gap-2">
            {data.challenges.map((challenge, index) => (
              <span 
                key={index} 
                className="bg-mcf-amber/10 text-mcf-orange-dark px-3 py-1 rounded-full text-sm"
              >
                {challenge}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalitySummary;
