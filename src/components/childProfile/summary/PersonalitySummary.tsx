
import React from 'react';
import type { ChildProfileFormData } from '@/types/childProfile';
import { 
  SUPERPOWERS_OPTIONS, 
  PASSIONS_OPTIONS, 
  CHALLENGES_OPTIONS 
} from '@/constants/childProfileOptions';

type PersonalitySummaryProps = {
  data: ChildProfileFormData;
};

const PersonalitySummary: React.FC<PersonalitySummaryProps> = ({ data }) => {
  // Fonction pour obtenir le libellé de la taille accordé au genre
  const getHeightLabel = () => {
    const gender = data.gender || 'neutral';
    
    switch (data.height) {
      case 'small': 
        return gender === 'girl' ? 'Petite' : gender === 'boy' ? 'Petit' : 'Petit(e)';
      case 'medium': 
        return gender === 'girl' ? 'Moyenne' : gender === 'boy' ? 'Moyen' : 'Moyen(ne)';
      case 'tall': 
        return gender === 'girl' ? 'Grande' : gender === 'boy' ? 'Grand' : 'Grand(e)';
      default: 
        return 'Non spécifiée';
    }
  };

  // Fonction pour obtenir le label français à partir de la valeur, en accord avec le genre
  const getLabelFromValue = (value: string, options: any[]) => {
    const option = options.find(opt => opt.value === value);
    if (!option) return value;
    
    const label = option.label;
    const gender = data.gender || 'neutral';
    
    // Si le label contient un point (ex: "Aventurier.e"), on adapte selon le genre
    if (label.includes('.')) {
      if (gender === 'girl') {
        // Pour le féminin, on remplace ".e" par "e", ".se" par "se", etc.
        return label.replace(/\.\w+/g, match => match.substring(1));
      } else if (gender === 'boy') {
        // Pour le masculin, on supprime tout ce qui suit le point
        return label.replace(/\.\w+/g, '');
      }
      // Si neutre ou non spécifié, on laisse le label tel quel
      return label;
    }
    
    return label;
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
                {getLabelFromValue(power, SUPERPOWERS_OPTIONS)}
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
                {getLabelFromValue(passion, PASSIONS_OPTIONS)}
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
                {getLabelFromValue(challenge, CHALLENGES_OPTIONS)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalitySummary;
