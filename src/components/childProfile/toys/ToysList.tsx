
import React from 'react';
import type { ToyData } from '@/types/childProfile';
import { toyTypeOptions, toyRoleOptions } from '@/constants/toyOptions';
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

type ToysListProps = {
  toys: ToyData[];
  onEditToy: (toy: ToyData) => void;
  onDeleteToy: (id: string) => void;
};

const ToysList: React.FC<ToysListProps> = ({ toys, onEditToy, onDeleteToy }) => {
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

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-mcf-orange">Doudous ajoutés</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {toys.map(toy => (
          <div 
            key={toy.id} 
            className="bg-white border border-mcf-amber/30 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span className="text-2xl" role="img" aria-label={getToyTypeName(toy.type)}>
                  {getToyTypeEmoji(toy.type)}
                </span>
                <h4 className="font-bold text-lg text-mcf-orange-dark">{toy.name}</h4>
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
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onDeleteToy(toy.id)}
                  className="h-8 w-8 p-0 text-gray-500 hover:text-red-500"
                >
                  <Trash2 size={16} />
                  <span className="sr-only">Supprimer</span>
                </Button>
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
        ))}
      </div>
    </div>
  );
};

export default ToysList;
