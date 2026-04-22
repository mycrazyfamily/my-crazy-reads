/**
 * Blocklist de mots interdits pour les noms/prénoms/surnoms saisis
 * dans les formulaires (enfants, proches, animaux, doudous).
 *
 * La détection est insensible à la casse et aux accents.
 */

export const FORBIDDEN_NAME_WORDS: string[] = [
  // Vulgarités françaises
  'merde', 'putain', 'pute', 'salope', 'salaud', 'connard', 'connasse',
  'enculé', 'encule', 'enfoiré', 'enfoire', 'bite', 'couille', 'couilles',
  'chatte', 'cul', 'foutre', 'bordel', 'pédé', 'pede', 'tapette',
  'bâtard', 'batard', 'nique', 'niquer', 'ntm',
  // Vulgarités anglaises
  'fuck', 'fucker', 'shit', 'bitch', 'asshole', 'bastard', 'dick',
  'cunt', 'pussy', 'whore', 'slut', 'motherfucker',
  // Insultes racistes / haineuses
  'nègre', 'negre', 'nigger', 'negro', 'bougnoule', 'youpin', 'chinetoque',
  // Figures historiques haineuses
  'hitler', 'nazi', 'nazis', 'führer', 'fuhrer', 'staline', 'mussolini',
  'daesh', 'isis',
  // Drogues / contenus inappropriés
  'cocaine', 'cocaïne', 'heroine', 'héroïne', 'crack',
];

/**
 * Normalise une chaîne : minuscules, sans accents, espaces normalisés.
 */
function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // retire les diacritiques
    .trim();
}

const NORMALIZED_BLOCKLIST = FORBIDDEN_NAME_WORDS.map(normalize);

/**
 * Renvoie true si la valeur contient un mot interdit (match par "mot entier"
 * délimité par non-lettres, insensible à la casse et aux accents).
 */
export function containsForbiddenWord(value: string | null | undefined): boolean {
  if (!value || typeof value !== 'string') return false;
  const normalized = normalize(value);
  if (!normalized) return false;

  // Découpe en "mots" (lettres/chiffres) pour matcher les tokens entiers
  const tokens = normalized.split(/[^a-z0-9]+/).filter(Boolean);
  return tokens.some((token) => NORMALIZED_BLOCKLIST.includes(token));
}

/**
 * Message d'erreur standard à afficher sous un champ invalide.
 */
export const FORBIDDEN_NAME_ERROR =
  "Ce nom n'est pas autorisé pour un livre jeunesse";
