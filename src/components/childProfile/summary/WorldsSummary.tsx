
import React from 'react';
import type { ChildProfileFormData, FavoriteWorldType, DiscoveryType } from '@/types/childProfile';
import { FAVORITE_WORLD_OPTIONS, DISCOVERY_OPTIONS } from '@/constants/worldOptions';

type WorldsSummaryProps = {
  data: ChildProfileFormData;
};

const WorldsSummary: React.FC<WorldsSummaryProps> = ({ data }) => {
  const { favoriteWorlds, discoveries, customWorlds, customDiscoveries } = data.worlds;

  return (
    <div className="space-y-5">
      {/* Univers préférés */}
      <div>
        <h4 className="font-medium text-gray-600 mb-2">Univers préférés:</h4>
        {(!favoriteWorlds || favoriteWorlds.length === 0) ? (
          <p className="text-gray-500">Aucun univers préféré n'a été sélectionné.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
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
              const worldOption = FAVORITE_WORLD_OPTIONS.find(option => option.value === world);
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
        <h4 className="font-medium text-gray-600 mb-2">Découvertes:</h4>
        {(!discoveries || discoveries.length === 0) ? (
          <p className="text-gray-500">Aucune découverte n'a été sélectionnée.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
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
                    label="Pas de préférence particulière"
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
    <span className="bg-mcf-amber/10 text-mcf-orange-dark px-3 py-1 rounded-full text-sm flex items-center gap-1">
      {icon && <span>{icon}</span>}
      <span>{label}</span>
    </span>
  );
};

// Fonction helper pour obtenir l'icône d'un monde
const getWorldIcon = (world: FavoriteWorldType | string): string => {
  if (world === 'other1' || world === 'other2') return '✨';
  
  const worldOption = FAVORITE_WORLD_OPTIONS.find(option => option.value === world);
  return worldOption?.icon || '🌍';
};

export default WorldsSummary;
