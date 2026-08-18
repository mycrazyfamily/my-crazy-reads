// passwordRules v1.0
//
// POURQUOI CE FICHIER
//   Les règles de mot de passe vivaient à DEUX endroits, sous deux formes
//   différentes : useAuthForm laissait faire Supabase (6 caractères, aucune
//   contrainte de composition) et ResetPassword vérifiait `length < 6` à la main.
//   Un parent pouvait donc créer « azerty » à l'inscription, et le même mot de
//   passe passait à la réinitialisation. Deux endroits, deux occasions de
//   diverger : la règle vit désormais ici, les deux écrans l'appellent.
//
// LES RÈGLES, arrêtées le 18/08 : 8 caractères, une minuscule, une majuscule,
//   un chiffre, un caractère spécial.

export type RegleMotDePasse = {
  cle: string;
  libelle: string;
  verifie: (v: string) => boolean;
};

export const REGLES_MOT_DE_PASSE: RegleMotDePasse[] = [
  { cle: 'longueur',  libelle: '8 caractères minimum',   verifie: (v) => v.length >= 8 },
  { cle: 'minuscule', libelle: 'une lettre minuscule',   verifie: (v) => /[a-z]/.test(v) },
  { cle: 'majuscule', libelle: 'une lettre majuscule',   verifie: (v) => /[A-Z]/.test(v) },
  { cle: 'chiffre',   libelle: 'un chiffre',             verifie: (v) => /[0-9]/.test(v) },
  { cle: 'special',   libelle: 'un caractère spécial',   verifie: (v) => /[^A-Za-z0-9]/.test(v) },
];

/** Renvoie les règles NON respectées, dans l'ordre de déclaration. */
export function reglesManquantes(motDePasse: string): RegleMotDePasse[] {
  return REGLES_MOT_DE_PASSE.filter((r) => !r.verifie(motDePasse || ''));
}

export function motDePasseValide(motDePasse: string): boolean {
  return reglesManquantes(motDePasse).length === 0;
}

/**
 * Message d'erreur listant ce qui manque. Utilisé en dernier recours, à la
 * soumission : l'affichage en direct sous le champ reste le canal principal,
 * il évite au parent de découvrir la règle après coup.
 */
export function messageMotDePasse(motDePasse: string): string {
  const manquantes = reglesManquantes(motDePasse);
  if (manquantes.length === 0) return '';
  return `Votre mot de passe doit contenir ${manquantes.map((r) => r.libelle).join(', ')}.`;
}
