// EditProfileSkeleton v1.0
// Squelette de chargement pour les écrans de modification (enfant / proche / animal / doudou).
// Mime la carte : avatar rond + quelques champs + boutons. Affiché tant que les données du profil
// ne sont pas prêtes, pour éviter l'effet « champs vides qui se remplissent ».
import React from 'react';

const Bar: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-gray-200 rounded ${className}`} />
);

const EditProfileSkeleton: React.FC = () => {
  return (
    <div
      className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-mcf-mint space-y-6 animate-pulse"
      aria-hidden="true"
    >
      {/* Avatar rond + libellé */}
      <div className="flex flex-col items-center gap-3 pb-2">
        <div className="h-24 w-24 rounded-full bg-gray-200" />
        <Bar className="h-3 w-44" />
      </div>

      {/* Champ 1 : label + input */}
      <div className="space-y-2">
        <Bar className="h-4 w-24" />
        <Bar className="h-10 w-full" />
      </div>

      {/* Grille d'options (type / choix) */}
      <div className="space-y-2">
        <Bar className="h-4 w-32" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Bar className="h-16" />
          <Bar className="h-16" />
          <Bar className="h-16" />
          <Bar className="h-16" />
        </div>
      </div>

      {/* Champ 2 : label + input */}
      <div className="space-y-2">
        <Bar className="h-4 w-28" />
        <Bar className="h-10 w-full" />
      </div>

      {/* Puces (traits / suggestions) */}
      <div className="space-y-2">
        <Bar className="h-4 w-40" />
        <div className="flex flex-wrap gap-2">
          <Bar className="h-8 w-24" />
          <Bar className="h-8 w-20" />
          <Bar className="h-8 w-28" />
          <Bar className="h-8 w-16" />
          <Bar className="h-8 w-24" />
        </div>
      </div>

      {/* Boutons */}
      <div className="flex justify-between pt-4">
        <Bar className="h-10 w-24" />
        <Bar className="h-10 w-52" />
      </div>
    </div>
  );
};

export default EditProfileSkeleton;
