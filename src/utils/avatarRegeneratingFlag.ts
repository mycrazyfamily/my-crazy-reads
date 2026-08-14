// avatarRegeneratingFlag v1.1
// Changelog v1.1 : ajout de getAvatarRegeneratingSince — l'ÂGE du drapeau, pas
//   seulement sa présence. Voir le commentaire de la fonction.
// avatarRegeneratingFlag v1.0
// Flag PERSISTANT (localStorage) « avatar en cours de régénération », par profil, avec TTL de sécurité.
// Complète avatarRegenerationSignal (sessionStorage, à usage unique consommé par les cartes du
// dashboard) : ce flag-ci survit à la navigation et permet à l'écran de modification d'afficher
// « en création » + de verrouiller le bouton, même après que le dashboard a consommé le signal.
// Il est posé au clic (markAvatarRegenerating) et levé dès l'arrivée du nouvel avatar
// (clearAvatarRegenerating, appelé par useRealtimeAvatar) ; le TTL est un simple filet si le
// workflow échoue et ne lève jamais le flag.
const PREFIX = 'avatarRegen:';
const TTL_MS = 5 * 60 * 1000; // 5 min

export function markAvatarRegenerating(id: string): void {
  if (!id) return;
  try {
    localStorage.setItem(PREFIX + id, String(Date.now()));
  } catch {
    /* stockage indisponible (mode privé, quota) : on dégrade sans bloquer */
  }
}

/**
 * v1.1 — Depuis QUAND le drapeau est-il posé ? (millisecondes epoch, ou null)
 *
 * isAvatarRegenerating() répond « oui / non » sur une fenêtre de 5 minutes. C'est
 * trop grossier pour l'affichage : un drapeau vieux de trois minutes, laissé par une
 * génération déjà terminée EN ÉCHEC, faisait réafficher « Création… » à chaque retour
 * sur la liste des personnages. Le hook a besoin de l'ÂGE du drapeau pour distinguer
 * une demande qui vient d'être faite d'un simple vestige.
 */
export function getAvatarRegeneratingSince(id: string): number | null {
  if (!id) return null;
  try {
    const raw = localStorage.getItem(PREFIX + id);
    if (!raw) return null;
    const ts = Number(raw);
    if (!Number.isFinite(ts) || Date.now() - ts > TTL_MS) {
      localStorage.removeItem(PREFIX + id);
      return null;
    }
    return ts;
  } catch {
    return null;
  }
}

export function isAvatarRegenerating(id: string): boolean {
  if (!id) return false;
  try {
    const raw = localStorage.getItem(PREFIX + id);
    if (!raw) return false;
    const ts = Number(raw);
    if (!Number.isFinite(ts) || Date.now() - ts > TTL_MS) {
      localStorage.removeItem(PREFIX + id);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function clearAvatarRegenerating(id: string): void {
  if (!id) return;
  try {
    localStorage.removeItem(PREFIX + id);
  } catch {
    /* noop */
  }
}
