
export const SUPERPOWERS_OPTIONS = [
  { value: "curious", label: "Curieux.se", icon: "🧐" },
  { value: "adventurer", label: "Aventurier.e", icon: "🌍" },
  { value: "dreamer", label: "Rêveur.se", icon: "💭" },
  { value: "funny", label: "Drôle", icon: "😆" },
  { value: "brave", label: "Courageux.se", icon: "🛡️" },
  { value: "emotional", label: "Émotif.ve", icon: "💖" },
  { value: "sporty", label: "Sportif.ve", icon: "⚽" },
  { value: "mischievous", label: "Malicieux.se", icon: "🐒" },
  { value: "calm", label: "Calme", icon: "🌿" },
];

export const PASSIONS_OPTIONS = [
  { value: "dinosaurs", label: "Dinosaures", icon: "🦖" },
  { value: "animals", label: "Animaux", icon: "🐶" },
  { value: "space", label: "Espace", icon: "🚀" },
  { value: "pirates", label: "Pirates", icon: "🏴‍☠️" },
  { value: "magic", label: "Magie", icon: "✨" },
  { value: "fairy_tales", label: "Contes de fées", icon: "🏰" },
  { value: "nature", label: "Nature", icon: "🌳" },
  { value: "vehicles", label: "Véhicules", icon: "🚒" },
  { value: "robots", label: "Robots", icon: "🤖" },
  { value: "unicorns", label: "Licornes", icon: "🦄" },
  { value: "ghosts", label: "Fantômes", icon: "👻" },
  { value: "superheroes", label: "Super-héros", icon: "🦸‍♀️" },
  { value: "wizards", label: "Sorciers", icon: "🧙" },
  { value: "princesses", label: "Princesses", icon: "👑" },
  { value: "food", label: "Nourriture", icon: "🍔" },
  { value: "games", label: "Jeux", icon: "🎲" },
];

export const CHALLENGES_OPTIONS = [
  { value: "darkness", label: "Braver l'obscurité", icon: "🌙" },
  { value: "monsters", label: "Affronter des monstres imaginaires", icon: "👹" },
  { value: "sleep", label: "S'endormir seul", icon: "🛏️" },
  { value: "focus", label: "Se concentrer", icon: "🧠" },
  { value: "energy", label: "Canaliser son énergie", icon: "⚡" },
  { value: "emotions", label: "Gérer ses émotions", icon: "💬" },
  { value: "confidence", label: "Prendre confiance en soi", icon: "🌟" },
  { value: "openness", label: "S'ouvrir aux autres", icon: "👫" },
  { value: "express", label: "Dire ce qu'il/elle ressent", icon: "🗣️" },
  { value: "perseverance", label: "Persévérer face à l'échec", icon: "🔁" },
  { value: "frustration", label: "Accepter la frustration", icon: "😤" },
];

export const CHARACTER_TRAITS_OPTIONS = [
  { value: "funny", label: "Drôle", icon: "😆" },
  { value: "generous", label: "Généreux.se", icon: "❤️" },
  { value: "calm", label: "Calme", icon: "🌿" },
  { value: "dynamic", label: "Dynamique", icon: "⚡" },
  { value: "adventurous", label: "Aventurier.e", icon: "🌍" },
  { value: "protective", label: "Protecteur.trice", icon: "🛡️" },
  { value: "organized", label: "Organisé.e", icon: "📅" },
  { value: "sensitive", label: "Sensible", icon: "💖" },
  { value: "talkative", label: "Bavard.e", icon: "🗣️" },
  { value: "stubborn", label: "Têtu.e", icon: "🐏" },
  { value: "other1", label: "Autre", icon: "✨" },
  { value: "other2", label: "Autre", icon: "✨" },
  { value: "other3", label: "Autre", icon: "✨" },
];

// Options for child creation wizard (includes parent/sibling types)
export const RELATIVE_TYPE_OPTIONS = [
  { value: "mother", label: "Maman", icon: "👩" },
  { value: "father", label: "Papa", icon: "👨" },
  { value: "otherParent", label: "Autre figure parentale", icon: "🏡" },
  { value: "sister", label: "Sœur", icon: "👧" },
  { value: "brother", label: "Frère", icon: "👦" },
  { value: "grandmother", label: "Grand-mère", icon: "👵" },
  { value: "grandfather", label: "Grand-père", icon: "👴" },
  { value: "uncle", label: "Oncle", icon: "👨" },
  { value: "aunt", label: "Tante", icon: "👩" },
  { value: "cousin", label: "Cousin", icon: "👦" },
  { value: "bestFriend", label: "Meilleur ami", icon: "👬" },
  { value: "partner", label: "Petit copain / Petite copine", icon: "💑" },
  { value: "teacher", label: "Maître / Maîtresse", icon: "👨‍🏫" },
  { value: "babysitter", label: "Baby-sitter", icon: "👶" },
  { value: "nanny", label: "Nounou", icon: "👶" },
  { value: "other", label: "➕ Autre", icon: "✨" },
];

// Options for standalone add/edit relative forms (gendered split for ambiguous roles)
export type RelativeRoleOption = {
  key: string;
  role: string;
  label: string;
  icon: string;
  gender: "male" | "female" | null;
};

export const STANDALONE_RELATIVE_ROLE_OPTIONS: RelativeRoleOption[] = [
  { key: "grandfather",      role: "grandfather", label: "Grand-père",      icon: "👴",    gender: "male" },
  { key: "grandmother",      role: "grandmother", label: "Grand-mère",      icon: "👵",    gender: "female" },
  { key: "uncle",             role: "uncle",       label: "Oncle",           icon: "👨",    gender: "male" },
  { key: "aunt",              role: "aunt",        label: "Tante",           icon: "👩",    gender: "female" },
  { key: "cousin_male",      role: "cousin",      label: "Cousin",          icon: "👦",    gender: "male" },
  { key: "cousin_female",    role: "cousin",      label: "Cousine",         icon: "👧",    gender: "female" },
  { key: "bestFriend_male",  role: "bestFriend",  label: "Meilleur ami",    icon: "👬",    gender: "male" },
  { key: "bestFriend_female",role: "bestFriend",  label: "Meilleure amie",  icon: "👭",    gender: "female" },
  { key: "partner_male",     role: "partner",     label: "Petit copain",    icon: "💑",    gender: "male" },
  { key: "partner_female",   role: "partner",     label: "Petite copine",   icon: "💑",    gender: "female" },
  { key: "teacher_male",     role: "teacher",     label: "Maître",          icon: "👨‍🏫", gender: "male" },
  { key: "teacher_female",   role: "teacher",     label: "Maîtresse",       icon: "👩‍🏫", gender: "female" },
  { key: "babysitter",       role: "babysitter",  label: "Baby-sitter",     icon: "👶",    gender: null },
  { key: "nanny",            role: "nanny",       label: "Nounou",          icon: "👶",    gender: "female" },
  { key: "other",            role: "other",       label: "➕ Autre",        icon: "✨",    gender: null },
];

// Helper: reconstruct a UI key from a role + gender (for edit prefill)
export function getRoleKeyFromRoleAndGender(role: string, gender: string | null | undefined): string {
  // Legacy mappings
  if (role === 'femaleCousin') return 'cousin_female';
  if (role === 'maleCousin') return 'cousin_male';
  if (role === 'femaleFriend') return 'bestFriend_female';
  if (role === 'maleFriend') return 'bestFriend_male';
  
  const sharedRoles = ['cousin', 'bestFriend', 'partner', 'teacher'];
  if (sharedRoles.includes(role) && (gender === 'male' || gender === 'female')) {
    return `${role}_${gender}`;
  }
  return role;
}

// Helper: check if a role requires a manual gender selector
export function roleNeedsGenderSelector(roleKey: string): boolean {
  const option = STANDALONE_RELATIVE_ROLE_OPTIONS.find(o => o.key === roleKey);
  return option ? option.gender === null : false;
}
