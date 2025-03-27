
import React from 'react';
import type { ChildProfileFormData, ToyData, ToyType, ToyRole } from '@/types/childProfile';

type ToysSummaryProps = {
  data: ChildProfileFormData;
};

const ToysSummary: React.FC<ToysSummaryProps> = ({ data }) => {
  const { toys } = data.toys;

  if (!data.toys.hasToys || !toys || toys.length === 0) {
    return <p className="text-gray-500">Aucun doudou ou objet magique n'a été ajouté.</p>;
  }

  return (
    <div className="space-y-4">
      {toys.map((toy) => (
        <ToyCard key={toy.id} toy={toy} />
      ))}
    </div>
  );
};

type ToyCardProps = {
  toy: ToyData;
};

const ToyCard: React.FC<ToyCardProps> = ({ toy }) => {
  // Obtenir le libellé du type de doudou
  const getToyTypeLabel = (type: ToyType) => {
    const labels: Record<ToyType, string> = {
      plush: 'Peluche',
      blanket: 'Doudou / Couverture',
      doll: 'Poupée',
      miniCar: 'Petite voiture',
      figurine: 'Figurine',
      other: toy.otherType || 'Autre'
    };
    return labels[type] || type;
  };

  // Obtenir le libellé du rôle du doudou
  const getToyRoleLabel = (role: ToyRole) => {
    const labels: Record<ToyRole, string> = {
      sleepGuardian: 'Gardien du sommeil',
      invisibleFriend: 'Ami invisible',
      magicProtector: 'Protecteur magique',
      secretHero: 'Héros secret',
      playmate: 'Compagnon de jeu',
      noSpecificRole: 'Pas de rôle particulier',
      otherRole1: toy.customRoles?.otherRole1 || 'Autre rôle 1',
      otherRole2: toy.customRoles?.otherRole2 || 'Autre rôle 2'
    };
    return labels[role] || role;
  };

  return (
    <div className="p-4 border rounded-lg bg-mcf-amber/5">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold">{toy.name}</h4>
          <p className="text-sm text-gray-600">{getToyTypeLabel(toy.type)}</p>
        </div>
      </div>
      
      <p className="mt-2 text-sm">{toy.appearance}</p>
      
      {toy.roles && toy.roles.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-gray-500 mb-1">Rôles imaginaires:</p>
          <div className="flex flex-wrap gap-1">
            {toy.roles.map((role, index) => (
              <span 
                key={index} 
                className="inline-flex text-xs bg-mcf-amber/15 text-gray-700 px-2 py-0.5 rounded-full"
              >
                {getToyRoleLabel(role)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ToysSummary;
