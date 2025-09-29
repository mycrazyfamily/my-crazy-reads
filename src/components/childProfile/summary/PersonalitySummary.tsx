
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
    if (!option) return { label: value, icon: '' };
    
    const label = option.label;
    const icon = option.icon || '';
    const gender = data.gender || 'neutral';
    
    let adaptedLabel = label;
    
    // Si le label contient un point (ex: "Aventurier.e" ou "Curieux.se"), on adapte selon le genre
    if (label.includes('.')) {
      if (gender === 'girl') {
        // Pour le féminin
        if (label.includes('.se')) {
          // Cas spécial pour les adjectifs en -eux/-euse (Curieux.se -> Curieuse)
          adaptedLabel = label.replace(/x\.se/g, 'se');
        } else {
          // Cas général: on ajoute ce qui suit le point (Aventurier.e -> Aventurière)
          adaptedLabel = label.replace(/\.(\w+)/g, '$1');
        }
      } else if (gender === 'boy') {
        // Pour le masculin, on supprime tout ce qui suit le point
        adaptedLabel = label.replace(/\.\w+/g, '');
      } else {
        // Si neutre ou non spécifié, on laisse le label tel quel
        adaptedLabel = label;
      }
    }
    
    return { label: adaptedLabel, icon };
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-gray-500">Taille:</span>
        <span className="text-sm text-gray-700">{getHeightLabel()}</span>
      </div>
      
      {data.superpowers && data.superpowers.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-gray-500 mb-1.5">Super-pouvoirs:</h4>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {data.superpowers.map((power, index) => {
              const { label, icon } = getLabelFromValue(power, SUPERPOWERS_OPTIONS);
              return (
                <span 
                  key={index} 
                  className="bg-mcf-amber/10 text-mcf-orange-dark px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1"
                >
                  {icon && <span>{icon}</span>}
                  <span>{label}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}
      
      {data.passions && data.passions.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-gray-500 mb-1.5">Centres d'intérêt:</h4>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {data.passions.map((passion, index) => {
              const { label, icon } = getLabelFromValue(passion, PASSIONS_OPTIONS);
              return (
                <span 
                  key={index} 
                  className="bg-mcf-amber/10 text-mcf-orange-dark px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1"
                >
                  {icon && <span>{icon}</span>}
                  <span>{label}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}
      
      {data.challenges && data.challenges.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-gray-500 mb-1.5">Défis personnels:</h4>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {data.challenges.map((challenge, index) => {
              const { label, icon } = getLabelFromValue(challenge, CHALLENGES_OPTIONS);
              return (
                <span 
                  key={index} 
                  className="bg-mcf-amber/10 text-mcf-orange-dark px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1"
                >
                  {icon && <span>{icon}</span>}
                  <span>{label}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalitySummary;
