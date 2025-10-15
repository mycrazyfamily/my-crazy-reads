
import React from 'react';
import type { ToyData } from '@/types/childProfile';
import { toyTypeOptions, toyRoleOptions } from '@/constants/toyOptions';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Pencil, Archive, ArchiveRestore } from "lucide-react";

type ToysListProps = {
  toys: ToyData[];
  onEditToy: (toy: ToyData) => void;
  onDeleteToy: (id: string) => void;
  onToggleActive?: (id: string) => void;
};

const ToysList: React.FC<ToysListProps> = ({ toys, onEditToy, onDeleteToy, onToggleActive }) => {
  // Séparer les doudous actifs et inactifs
  const activeToys = toys.filter(toy => toy.isActive !== false);
  const inactiveToys = toys.filter(toy => toy.isActive === false);
  
  if (toys.length === 0) {
    return (
      <div className="text-center p-4 bg-mcf-amber/10 rounded-lg italic text-gray-500">
        Ajoutez un doudou ou un objet fétiche pour le voir apparaître ici
      </div>
    );
  }

  const getToyTypeEmoji = (type: string) => {
    const foundType = toyTypeOptions.find(option => option.value === type);
    return foundType ? foundType.emoji : "📦";
  };

  const getToyTypeName = (type: string, otherType?: string) => {
    if (type === "other" && otherType) {
      return otherType;
    }
    const foundType = toyTypeOptions.find(option => option.value === type);
    return foundType ? foundType.label : "Autre";
  };

  const getToyRoleNames = (roles: string[]) => {
    return roles.map(role => {
      const foundRole = toyRoleOptions.find(option => option.value === role);
      return foundRole ? `${foundRole.emoji} ${foundRole.label}` : role;
    }).join(", ");
  };

  const renderToyCard = (toy: ToyData, isInactive: boolean = false) => (
    <div 
      key={toy.id} 
      className={`bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow ${
        isInactive ? 'border-gray-300 opacity-70' : 'border-mcf-amber/30'
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-2xl" role="img" aria-label={getToyTypeName(toy.type)}>
            {getToyTypeEmoji(toy.type)}
          </span>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-lg text-mcf-orange-dark">{toy.name}</h4>
              {isInactive && (
                <Badge variant="secondary" className="text-xs">
                  Perdu / Non utilisé
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onEditToy(toy)}
            className="h-8 w-8 p-0 text-gray-500 hover:text-mcf-orange"
          >
            <Pencil size={16} />
            <span className="sr-only">Modifier</span>
          </Button>
          {onToggleActive && (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onToggleActive(toy.id)}
                    className="h-8 w-8 p-0 text-gray-500 hover:text-amber-600"
                  >
                    {isInactive ? <ArchiveRestore size={16} /> : <Archive size={16} />}
                    <span className="sr-only">
                      {isInactive ? "Marquer comme utilisé" : "Marquer comme perdu"}
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isInactive ? "Marquer comme utilisé" : "Marquer comme perdu/non utilisé"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
      
      <div className="mt-2 text-sm">
        <p><span className="font-medium">Type:</span> {getToyTypeName(toy.type, toy.otherType)}</p>
        <p><span className="font-medium">Apparence:</span> {toy.appearance}</p>
        {toy.roles.length > 0 && (
          <p><span className="font-medium">Rôle:</span> {getToyRoleNames(toy.roles)}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {activeToys.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-mcf-orange">Doudous ajoutés</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeToys.map(toy => renderToyCard(toy, false))}
          </div>
        </div>
      )}
      
      {inactiveToys.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-500 flex items-center gap-2">
            <Archive size={18} />
            Doudous perdus / Non utilisés
          </h3>
          <p className="text-sm text-gray-500 italic">
            Ces doudous ne seront pas utilisés dans les histoires mais restent sauvegardés
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inactiveToys.map(toy => renderToyCard(toy, true))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ToysList;
