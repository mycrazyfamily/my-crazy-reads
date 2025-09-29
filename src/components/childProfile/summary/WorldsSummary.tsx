
import React from 'react';
import type { ChildProfileFormData, FavoriteWorldType, DiscoveryType } from '@/types/childProfile';
import { FAVORITE_WORLDS_OPTIONS, DISCOVERY_OPTIONS } from '@/constants/worldOptions';

type WorldsSummaryProps = {
  data: ChildProfileFormData;
};

const WorldsSummary: React.FC<WorldsSummaryProps> = ({ data }) => {
  // Check if data.worlds exists before accessing its properties
  if (!data.worlds) {
    return <p className="text-gray-500">Aucune information sur les univers préférés n'est disponible.</p>;
  }

  const { favoriteWorlds, discoveries, customWorlds, customDiscoveries } = data.worlds;

  return (
    <div className="space-y-3">
      {/* Univers préférés */}
      <div>
        <h4 className="text-xs font-medium text-gray-500 mb-1.5">Univers préférés:</h4>
        {(!favoriteWorlds || favoriteWorlds.length === 0) ? (
          <p className="text-xs text-gray-400">Aucun univers sélectionné</p>
        ) : (
          <div className="flex flex-wrap gap-1.5 justify-center">
            {favoriteWorlds.map((world) => {
              // Pour les options personnalisées
              if (world === 'other1' || world === 'other2') {
                const customValue = world === 'other1' 
                  ? customWorlds?.other1 
                  : customWorlds?.other2;
                
                if (!customValue) return null;
                
                return (
                  <WorldTag 
                    key={world} 
                    label={customValue}
                    icon={getWorldIcon(world)}
                  />
                );
              }
              
              // Pour les options prédéfinies
              const worldOption = FAVORITE_WORLDS_OPTIONS.find(option => option.value === world);
              return worldOption ? (
                <WorldTag 
                  key={world} 
                  label={worldOption.label}
                  icon={worldOption.icon}
                />
              ) : null;
            })}
          </div>
        )}
      </div>
      
      {/* Découvertes */}
      <div>
        <h4 className="text-xs font-medium text-gray-500 mb-1.5">Découvertes:</h4>
        {(!discoveries || discoveries.length === 0) ? (
          <p className="text-xs text-gray-400">Aucune découverte sélectionnée</p>
        ) : (
          <div className="flex flex-wrap gap-1.5 justify-center">
            {discoveries.map((discovery) => {
              // Pour les options personnalisées
              if (discovery === 'other1' || discovery === 'other2') {
                const customValue = discovery === 'other1' 
                  ? customDiscoveries?.other1 
                  : customDiscoveries?.other2;
                
                if (!customValue) return null;
                
                return (
                  <WorldTag 
                    key={discovery} 
                    label={customValue}
                    icon="🔎"
                  />
                );
              }
              
              // Pour l'option "rien"
              if (discovery === 'nothing') {
                return (
                  <WorldTag 
                    key={discovery} 
                    label="Pas de préférence"
                    icon="🤔"
                  />
                );
              }
              
              // Pour les options prédéfinies
              const discoveryOption = DISCOVERY_OPTIONS.find(option => option.value === discovery);
              return discoveryOption ? (
                <WorldTag 
                  key={discovery} 
                  label={discoveryOption.label}
                  icon={discoveryOption.icon}
                />
              ) : null;
            })}
          </div>
        )}
      </div>
    </div>
  );
};

type WorldTagProps = {
  label: string;
  icon?: string;
};

const WorldTag: React.FC<WorldTagProps> = ({ label, icon }) => {
  return (
    <span className="bg-mcf-amber/10 text-mcf-orange-dark px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
      {icon && <span className="text-xs">{icon}</span>}
      <span>{label}</span>
    </span>
  );
};

// Fonction helper pour obtenir l'icône d'un monde
const getWorldIcon = (world: FavoriteWorldType | string): string => {
  if (world === 'other1' || world === 'other2') return '✨';
  
  const worldOption = FAVORITE_WORLDS_OPTIONS.find(option => option.value === world);
  return worldOption?.icon || '🌍';
};

export default WorldsSummary;
