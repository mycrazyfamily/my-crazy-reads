// physicalDetailsOptions v1.0
//
// POURQUOI CE FICHIER
//   PetPhysicalDetailsInput était un copier-coller du composant humain, liste de
//   suggestions comprise. Un parent qui décrivait son chien se voyait proposer
//   « fossettes », « appareil dentaire » et « boucles d'oreilles ». Seul le
//   placeholder avait été corrigé en v1.3, pas les suggestions.
//
//   Les listes vivent désormais ici, côte à côte : la prochaine fois qu'on en
//   ajustera une, on verra les autres et on saura si le changement les concerne.
//
// TROIS LISTES ANIMALES PLUTÔT QU'UNE
//   Un chien et un chat n'ont pas les mêmes marques distinctives, et un
//   perroquet encore moins. La liste générique reste volontairement large : elle
//   sert aux poissons, reptiles, oiseaux et à tout ce qu'un enfant peut avoir.

export const PHYSICAL_DETAILS_HUMAN: string[] = [
  'Taches de rousseur',
  'Grain de beauté',
  'Fossettes',
  'Cicatrice',
  'Appareil dentaire',
  "Boucles d'oreilles",
  'Mèche colorée',
  'Grande taille',
  'Petite taille',
  'Tache de naissance',
];

export const PHYSICAL_DETAILS_DOG: string[] = [
  'Oreilles tombantes',
  'Oreilles dressées',
  'Museau blanc',
  'Tache sur le poitrail',
  'Une patte blanche',
  'Queue touffue',
  'Poil long',
  'Poil frisé',
  'Collier coloré',
  'Cicatrice',
];

export const PHYSICAL_DETAILS_CAT: string[] = [
  'Yeux vairons',
  'Robe tachetée',
  'Robe tigrée',
  'Museau blanc',
  'Chaussettes blanches',
  'Bout de la queue blanc',
  'Poil long',
  'Oreille repliée',
  'Collier coloré',
  'Cicatrice',
];

export const PHYSICAL_DETAILS_PET_GENERIC: string[] = [
  'Tache de couleur',
  'Bec clair',
  'Museau clair',
  'Grande taille',
  'Petite taille',
  'Marque sur la tête',
  'Écailles brillantes',
  'Plumes colorées',
  'Queue longue',
  'Collier ou bague',
  'Cicatrice',
];

/**
 * Choisit la liste selon l'espèce. La valeur vient de pets.type, qui contient
 * 'dog', 'cat', 'rabbit', 'bird', 'fish', 'reptile' ou 'other'.
 * Toute valeur inconnue retombe sur la liste générique : mieux vaut des
 * suggestions un peu larges que des suggestions humaines sur une fiche animal.
 */
export function petPhysicalDetails(petType?: string | null): string[] {
  switch (String(petType || '').toLowerCase()) {
    case 'dog':
    case 'chien':
      return PHYSICAL_DETAILS_DOG;
    case 'cat':
    case 'chat':
      return PHYSICAL_DETAILS_CAT;
    default:
      return PHYSICAL_DETAILS_PET_GENERIC;
  }
}
