// nameBlocklist v2.0
// Changelog v2.0 — LA LISTE NE SERT PLUS QU'AUX NOMS.
//   Elle avait été écrite pour des prénoms, donc pour repérer des insultes. Elle
//   couvre désormais aussi les CHAMPS LIBRES DE DESCRIPTION (détails physiques,
//   tenue, apparence d'un doudou, métier d'un proche…), où le registre à risque
//   est différent : c'est l'anatomie explicite qui fait échouer la génération.
//
//   Mesure du 17/08, avant cette version : sur « Slip avec dessin de sexe »,
//   « pénis », « vagin », « nichons », « tétons », la liste ne bloquait RIEN.
//   Le mot qui avait fait refuser l'avatar par Gemini passait sans encombre.
//
//   Une seule liste pour tout le site : dupliquer les mots par usage garantirait
//   qu'un ajout soit fait d'un côté et oublié de l'autre.
//
// LES MOTS VOLONTAIREMENT ABSENTS, et pourquoi :
//   nu / nue / nus / nues        « elle est pieds nus » apparaît dans vos propres
//                                 descriptions de tenue générées.
//   sein / seins                 légitime en contexte familial (allaitement).
//   slip / culotte               vêtements, pas des grossièretés. C'est « sexe »
//                                 qui a fait échouer la génération, pas « slip ».
//   arme / couteau / épée        un chevalier a une épée, un pirate un sabre.
//
// La détection est insensible à la casse et aux accents, et se fait par MOT
// ENTIER : « cul » ne matche pas « culotte », « bite » ne matche pas « habite ».

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
  // v2.0 — Anatomie explicite et sexualité.
  // C'est ce registre, absent jusqu'ici, qui fait refuser un avatar par le
  // contrôle de contenu de Gemini. Retirez librement une entrée qui vous
  // paraîtrait excessive : la liste est faite pour être ajustée.
  'sexe', 'sexes', 'penis', 'pénis', 'vagin', 'vulve', 'testicule', 'testicules',
  'teton', 'téton', 'tetons', 'tétons', 'nichon', 'nichons', 'zizi', 'zezette',
  'zézette', 'zboub', 'fesse', 'fesses', 'anus', 'sodomie', 'fellation',
  'porno', 'pornographie', 'pornographique', 'erotique', 'érotique',
  'masturbation', 'orgasme', 'prostituee', 'prostituée', 'strip', 'striptease',
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
 * v2.0 — Renvoie les mots interdits TROUVÉS, pas seulement un booléen.
 *
 * Sur un champ de description, dire « ce texte contient un mot interdit » sans
 * dire lequel oblige le parent à deviner. Sur un prénom d'un seul mot la
 * question ne se posait pas ; sur « Slip avec dessin de sexe », si.
 */
export function findForbiddenWords(value: string | null | undefined): string[] {
  if (!value || typeof value !== 'string') return [];
  const tokens = normalize(value).split(/[^a-z0-9]+/).filter(Boolean);
  return [...new Set(tokens.filter((t) => NORMALIZED_BLOCKLIST.includes(t)))];
}

/**
 * v2.0 — Contrôle un LOT de champs libres d'un seul coup.
 *
 * Pensé pour être appelé une fois dans la fonction de sauvegarde de chaque
 * écran, plutôt qu'une fois par champ : c'est le seul endroit par entité où
 * tous les champs libres sont réunis. Accepte indifféremment une chaîne ou une
 * liste de chaînes, puisque les détails physiques sont un tableau.
 *
 * Renvoie les libellés des champs fautifs et les mots trouvés, dans l'ordre de
 * déclaration, pour construire un message précis.
 */
export function checkFreeTextFields(
  fields: Record<string, string | string[] | null | undefined>,
): { ok: boolean; champs: string[]; mots: string[] } {
  const champs: string[] = [];
  const mots: string[] = [];

  for (const [libelle, contenu] of Object.entries(fields)) {
    const valeurs = Array.isArray(contenu) ? contenu : [contenu];
    const trouves = valeurs.flatMap((v) => findForbiddenWords(v));
    if (trouves.length > 0) {
      champs.push(libelle);
      mots.push(...trouves);
    }
  }

  return { ok: champs.length === 0, champs, mots: [...new Set(mots)] };
}

/**
 * Message d'erreur standard à afficher sous un champ invalide.
 */
export const FORBIDDEN_NAME_ERROR =
  "Ce nom n'est pas autorisé pour un livre jeunesse";

/**
 * v2.0 — Message pour un champ de DESCRIPTION, pas un nom.
 *
 * Le ton évite d'accuser : un parent qui écrit un mot cru le fait presque
 * toujours par plaisanterie, pas par malveillance. C'est le même registre que
 * le message affiché après un échec de génération (voir avatarStatus.ts).
 */
export function forbiddenContentError(mots: string[]): string {
  const liste = mots.map((m) => `« ${m} »`).join(', ');
  return mots.length === 1
    ? `Le mot ${liste} ne peut pas figurer dans un livre pour jeunes enfants. Reformulez pour continuer.`
    : `Les mots ${liste} ne peuvent pas figurer dans un livre pour jeunes enfants. Reformulez pour continuer.`;
}
