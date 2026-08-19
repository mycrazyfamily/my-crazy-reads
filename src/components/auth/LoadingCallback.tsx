// LoadingCallback v1.1
// Première version numérotée, le fichier n'en portait pas.
// Changelog v1.1 :
//   (a) SUPERPOSITION CORRIGÉE. Trois calques étaient empilés : un Loader2 dans
//       le flux, un cercle plein que le `-inset-2` décalait de 8px vers le haut
//       et la gauche parce que sa taille restait fixée à `h-12 w-12`, et une
//       icône Mail en `opacity-20` par-dessus le tout. À l'écran, cela passait
//       pour un défaut d'affichage. Une seule icône désormais, dans une pastille,
//       même parti pris que CheckEmail depuis sa v2.0.
//   (b) L'import de `Mail` est retiré, l'icône n'étant plus utilisée.
//   (c) Le console.log de mise au point est retiré : ce composant s'affiche en
//       production, sur le parcours d'inscription.
// LoadingCallback v1.0

import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingCallback = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-mcf-cream to-mcf-beige">
      <div className="p-8 rounded-xl bg-card backdrop-blur-sm shadow-lg text-center max-w-md mx-4">
        <div className="flex flex-col items-center gap-6">
          {/* v1.1 : trois calques étaient empilés ici, un Loader2 dans le flux,
              un cercle plein décalé de 8px par le `-inset-2` combiné à une taille
              fixe `h-12 w-12`, et une icône Mail en `opacity-20` par-dessus. Le
              résultat ressemblait à un défaut d'affichage. Une seule icône
              désormais, dans une pastille, comme sur CheckEmail depuis la v2.0. */}
          <div className="w-16 h-16 rounded-2xl bg-mcf-primary/10 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-mcf-primary animate-spin" />
          </div>
          
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-mcf-primary">
              Bienvenue dans l'aventure !
            </h1>
            <p className="text-muted-foreground">
              Nous finalisons ton inscription... Quelques secondes de patience ⏳
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingCallback;
