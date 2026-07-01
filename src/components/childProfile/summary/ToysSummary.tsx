import React from 'react';
import type { ChildProfileFormData, ToyData, ToyType, ToyRole } from '@/types/childProfile';

type ToysSummaryProps = {
  data: ChildProfileFormData;
};

// Première lettre en majuscule (saisie utilisateur), sans toucher au reste.
const capitalizeFirst = (s?: string | null): string => {
  const str = (s ?? '').trim();
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
};

const ToysSummary: React.FC<ToysSummaryProps> = ({ data }) => {
  // Check if data.toys exists before accessing its properties
  if (!data.toys) {
    return <p className="text-gray-500">Aucune information sur les doudous n'est disponible.</p>;
  }
  const { toys, hasToys } = data.toys;
  if (!hasToys || !toys || toys.length === 0) {
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
      other: capitalizeFirst(toy.otherType) || 'Autre'
    };
    return labels[type] || type;
  };
  // Obtenir le libellé du rôle du doudou avec son emoji
  const getToyRoleLabelWithIcon = (role: ToyRole): { label: string; icon: string } => {
    const roleData: Record<ToyRole, { label: string; icon: string }> = {
      sleepGuardian: { label: 'Gardien du sommeil', icon: '🌙' },
      invisibleFriend: { label: 'Ami invisible', icon: '👻' },
      magicProtector: { label: 'Protecteur magique', icon: '🛡️' },
      secretHero: { label: 'Héros secret', icon: '🦸' },
      playmate: { label: 'Compagnon de jeu', icon: '🎮' },
      noSpecificRole: { label: 'Pas de rôle particulier', icon: '✨' },
      otherRole1: { label: toy.customRoles?.otherRole1 || 'Autre rôle 1', icon: '✏️' },
      otherRole2: { label: toy.customRoles?.otherRole2 || 'Autre rôle 2', icon: '✏️' }
    };
    return roleData[role] || { label: role, icon: '❓' };
  };
  // Valeurs techniques à ne pas afficher
  const technicalValues = ['plush', 'blanket', 'doll', 'miniCar', 'figurine', 'other'];
  const shouldShowAppearance = toy.appearance && !technicalValues.includes(toy.appearance);
  return (
    <div className="p-4 border rounded-lg bg-mcf-amber/5 text-center">
      <div>
        <h4 className="font-semibold">{capitalizeFirst(toy.name)}</h4>
        <p className="text-sm text-gray-600">{getToyTypeLabel(toy.type)}</p>
      </div>

      {shouldShowAppearance && (
        <p className="mt-2 text-sm text-gray-700">{capitalizeFirst(toy.appearance)}</p>
      )}

      {toy.roles && toy.roles.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-gray-500 mb-1.5">Rôles imaginaires:</p>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {toy.roles.map((role, index) => {
              const { label, icon } = getToyRoleLabelWithIcon(role);
              return (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 text-xs bg-mcf-amber/10 text-mcf-orange-dark px-2 py-0.5 rounded-full font-medium"
                >
                  <span>{icon}</span>
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

export default ToysSummary;
