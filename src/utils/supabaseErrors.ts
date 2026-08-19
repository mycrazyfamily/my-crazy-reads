// supabaseErrors v1.0
// Extrait de useAuthForm v1.4, où la fonction s'appelait `mapSupabaseSignupError`
// et vivait en local, non exportée. ResetPassword ne pouvait donc pas s'en servir
// et affichait le message brut de Supabase, en anglais. Constaté le 19/08 sur
// « New password should be different from the old password. »
//
// Deux corrections au passage :
//
//   (a) LE CODE D'ERREUR EST LU, PAS SEULEMENT LE MESSAGE. La table d'origine
//       mélangeait des fragments de message (« For security purposes ») et des
//       codes d'erreur (`same_password`, `invalid_email`, `rate_limit`,
//       `over_email_send_rate_limit`). Or la comparaison ne portait que sur
//       `error.message`. Ces quatre entrées ne pouvaient donc JAMAIS matcher :
//       Supabase renvoie le code dans `error.code`, pas dans le message. C'est
//       la raison exacte pour laquelle `same_password` était présent dans la
//       table et le parent voyait quand même l'anglais.
//
//   (b) L'ORDRE VA DU PLUS PRÉCIS AU PLUS GÉNÉRAL. `rate_limit` est un
//       sous-ensemble de `over_email_send_rate_limit` : placé avant, il
//       l'interceptait et renvoyait un message moins juste. Les entrées larges
//       sont désormais en fin de liste.
//
// Toute nouvelle traduction s'ajoute ICI, pas dans un composant. C'est la leçon
// de l'année de vie recopiée neuf fois : une règle, un endroit.

type ErreurSupabase = { message?: string | null; code?: string | null } | string | null | undefined;

// Du plus précis au plus général. Chaque entrée est cherchée dans le message
// ET dans le code, la première qui matche gagne.
const CORRESPONDANCES: ReadonlyArray<readonly [string, string]> = [
  // Mot de passe
  ['New password should be different from the old password', "Ce mot de passe est identique à l'ancien. Choisissez-en un autre."],
  ['same_password', "Ce mot de passe est identique à l'ancien. Choisissez-en un autre."],
  ['Password should be at least 6 characters', 'Le mot de passe doit contenir au moins 6 caractères.'],

  // Session et lien
  ['Auth session missing', "Votre lien a expiré pendant la saisie. Demandez-en un nouveau depuis la page de connexion."],
  ['Token has expired or is invalid', "Ce lien a expiré ou a déjà été utilisé. Demandez-en un nouveau."],
  ['otp_expired', "Ce lien a expiré ou a déjà été utilisé. Demandez-en un nouveau."],

  // Compte
  ['User already exists', 'Un compte existe déjà avec cette adresse email.'],
  ['Invalid login credentials', 'Les identifiants sont invalides.'],
  ['Email not confirmed', "Votre adresse n'a pas encore été confirmée. Cherchez notre email de confirmation, y compris dans vos indésirables."],
  ['invalid_email', 'Adresse email invalide. Veuillez vérifier votre saisie.'],

  // Limitation. « For security purposes ... after 50 seconds » s'affichait en
  // anglais sur la page de connexion le 18/08.
  ['For security purposes', "Vous venez de faire cette demande. Patientez une minute avant de réessayer."],
  ['over_email_send_rate_limit', "Trop de messages envoyés. Patientez quelques minutes avant de réessayer."],
  ['Email rate limit exceeded', "Trop de messages envoyés. Patientez quelques minutes avant de réessayer."],
  // v1.0 (b) : le plus large en dernier, il masquait les deux précédents.
  ['rate_limit', 'Trop de tentatives. Veuillez réessayer plus tard.'],
];

/**
 * Traduit une erreur Supabase en une phrase que le parent peut comprendre.
 * Accepte l'objet d'erreur complet, ce qui permet de lire le code, ou une
 * simple chaîne pour les appels historiques.
 */
export const messageErreurSupabase = (erreur: ErreurSupabase): string => {
  const message = typeof erreur === 'string' ? erreur : (erreur?.message || '');
  const code = typeof erreur === 'string' ? '' : (erreur?.code || '');
  const aChercher = `${message} ${code}`;

  for (const [cle, traduction] of CORRESPONDANCES) {
    if (aChercher.includes(cle)) return traduction;
  }

  return message
    ? `Une erreur inattendue est survenue : ${message}`
    : "Une erreur inattendue est survenue.";
};
