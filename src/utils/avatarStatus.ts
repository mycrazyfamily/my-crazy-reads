// avatarStatus v1.1
// Changelog v1.1 — on n'écrit plus « vous n'avez rien à faire » tout court.
//   Sur une panne technique, relancer soi-même marche souvent : le message
//   propose donc « Générer une autre proposition », qui reste ACTIF dans ce cas
//   (EditAvatarHeader ne le masque que sur un refus de contenu, où régénérer
//   reprendrait le même mot interdit). On garde la déculpabilisation — ce n'est
//   pas la faute du parent — tout en lui donnant une porte de sortie immédiate.
// avatarStatus v1.0
// Source UNIQUE des textes montrés au parent quand un avatar échoue.
//
// POURQUOI ICI ET PAS EN BASE
//   mcf_mark_avatar_failed stocke des CLÉS machine (`content_blocked`,
//   `clothing_style,physical_details`) et pose une notification volontairement
//   courte. Tout le texte détaillé vit ici : une seule phrase, un seul endroit.
//   Si le message doit changer, il change une fois.
//
// UTILISÉ PAR
//   AvatarDisplay (infobulle), les cartes du dashboard, EditAvatarHeader.

export type AvatarStatus = 'pending' | 'ready' | 'failed' | null;

/**
 * Traduction des clés de champ écrites par 6A_Classify_Avatar_Error.
 * Toute clé inconnue est ignorée plutôt qu'affichée brute : mieux vaut une
 * liste incomplète qu'un « pet_type_other » sous les yeux d'un parent.
 */
export const AVATAR_FIELD_LABELS: Record<string, string> = {
  physical_details: 'les détails physiques',
  clothing_style: 'la tenue',
  nickname: 'le surnom',
  job: 'le métier',
  breed: 'la race',
  pet_type_other: "le type d'animal",
  appearance: 'la description',
  toy_type_other: "le type d'objet",
};

/**
 * « la tenue, les détails physiques et le surnom »
 * Énumération française correcte : virgules puis « et » avant le dernier.
 */
export function formatAvatarErrorFields(fields?: string | null): string {
  const labels = String(fields || '')
    .split(',')
    .map((k) => AVATAR_FIELD_LABELS[k.trim()])
    .filter(Boolean);

  if (labels.length === 0) return '';
  if (labels.length === 1) return labels[0];
  return `${labels.slice(0, -1).join(', ')} et ${labels[labels.length - 1]}`;
}

export interface AvatarErrorMessage {
  /** Titre court, utilisable en badge ou en en-tête d'encart. */
  title: string;
  /** Explication complète, deux à trois phrases. */
  body: string;
  /** Le parent peut-il corriger lui-même ? Pilote l'affichage d'un appel à l'action. */
  canFix: boolean;
  /** Libellé très court pour une carte ou une pastille. */
  badge: string;
}

/**
 * Construit le message montré au parent.
 *
 * `content_blocked` : sa saisie a été refusée, il peut corriger. Le ton évite
 * d'accuser — un parent qui a écrit « slip » n'a rien fait de mal.
 * `internal` (ou tout autre cas) : panne de notre côté, il n'a rien à faire.
 */
export function buildAvatarErrorMessage(
  errorCode?: string | null,
  errorFields?: string | null,
  name?: string | null,
): AvatarErrorMessage {
  const who = (name || '').trim() || 'ce personnage';

  if (errorCode === 'content_blocked') {
    const champs = formatAvatarErrorFields(errorFields);
    const ou = champs
      ? `Reprenez ${champs}, reformulez, puis enregistrez.`
      : 'Reprenez sa description, reformulez, puis enregistrez.';

    return {
      title: `L'avatar de ${who} n'a pas pu être créé`,
      body:
        "Un mot ou une expression de sa description n'a pas passé notre contrôle de contenu. "
        + "Nos livres s'adressent à de jeunes enfants : les termes grossiers, sexuels ou violents "
        + "sont refusés, même employés sans mauvaise intention ou par plaisanterie. "
        + `${ou} La création repartira toute seule.`,
      canFix: true,
      badge: 'Avatar à corriger',
    };
  }

  return {
    title: `L'avatar de ${who} arrive avec du retard`,
    body:
      "Un incident technique de notre côté a interrompu sa création — rien à voir avec ce que "
      + "vous avez saisi. Notre équipe est prévenue et s'en occupe. Si vous ne voulez pas "
      + "attendre, ouvrez sa fiche et utilisez « Générer une autre proposition » : cela relance "
      + 'la création immédiatement.',
    canFix: false,
    badge: 'Avatar en retard',
  };
}

/** Un avatar est-il en cours de fabrication ? (statut base, hors drapeau client) */
export function isAvatarPending(status?: AvatarStatus | string | null): boolean {
  return status === 'pending';
}

/** Un avatar a-t-il échoué ? */
export function hasAvatarFailed(status?: AvatarStatus | string | null): boolean {
  return status === 'failed';
}
