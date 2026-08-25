export const placeTypeOptions = [
  // C3 : la mention « (obligatoire) » n'apparait QUE dans le menu deroulant de PlaceForm.
// PlacesList, la seule autre consommatrice, ne lit que `emoji` : aucune fiche deja creee
// n'affichera ce suffixe.
  { value: 'maison_principale', label: '🏠 Maison principale ou appartement (obligatoire)', emoji: '🏠' },
  { value: 'maison_secondaire', label: '🏡 Maison secondaire', emoji: '🏡' },
  { value: 'autre_parent', label: '👨‍👩‍👧 Maison de l\'autre parent', emoji: '👨‍👩‍👧' },
  { value: 'vacances', label: '🏕️ Lieu de vacances fréquent', emoji: '🏕️' },
];

export const habitatTypeOptions = [
  { value: 'Maison', label: 'Maison' },
  { value: 'Appartement', label: 'Appartement' },
  { value: 'Autre', label: 'Autre' },
];

export const luminositeOptions = [
  { value: 'lumineux', label: 'Lumineux' },
  { value: 'sombre', label: 'Sombre' },
];

export const frequenceUtilisationOptions = [
  { value: 'Toute l\'année', label: 'Toute l\'année' },
  { value: '1 week-end sur 2', label: '1 week-end sur 2' },
  { value: 'Vacances uniquement', label: 'Vacances uniquement' },
  { value: 'Occasionnel', label: 'Occasionnel' },
];

export const typeVacancesOptions = [
  { value: 'Camping', label: 'Camping' },
  { value: 'Hôtel', label: 'Hôtel' },
  { value: 'Maison de vacances', label: 'Maison de vacances' },
  { value: 'Gîte', label: 'Gîte' },
  { value: 'Autre', label: 'Autre' },
];

export const repasOuOptions = [
  { value: 'Dans l\'hébergement', label: 'Dans l\'hébergement' },
  { value: 'Cantine', label: 'Cantine' },
  { value: 'Au restaurant', label: 'Au restaurant' },
  { value: 'Mixte', label: 'Mixte' },
];
