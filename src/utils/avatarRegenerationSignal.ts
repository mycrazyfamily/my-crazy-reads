import { markAvatarRegenerating } from './avatarRegeneratingFlag';

const STORAGE_KEY = 'avatar_regenerating';

/**
 * Marque un profil comme « en régénération ». Point d'entrée UNIQUE : pose deux marqueurs.
 *  - Signal éphémère (sessionStorage) : consommé une fois par les cartes du dashboard au montage.
 *  - Flag PERSISTANT (localStorage, via markAvatarRegenerating) : survit à la navigation et est
 *    relu par l'écran de modif ET par les cartes tant que le nouvel avatar n'est pas arrivé.
 * Centralisé ici pour que TOUT déclencheur de régénération (reset OU modification OU création)
 * active automatiquement le shimmer partout, sans avoir à y penser dans chaque écran.
 */
export function signalAvatarRegeneration(id: string): void {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const ids: Record<string, number> = raw ? JSON.parse(raw) : {};
    ids[id] = Date.now();
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
  markAvatarRegenerating(id); // flag persistant (localStorage) — gère sa propre erreur en interne
}

/** Check if a profile was marked as regenerating (within last 5 min). Consommation à usage unique. */
export function consumeAvatarRegeneration(id: string): boolean {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const ids: Record<string, number> = JSON.parse(raw);
    const ts = ids[id];
    if (!ts) return false;
    // Expire after 5 minutes
    if (Date.now() - ts > 300_000) {
      delete ids[id];
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/** Clear regeneration signal for a profile (signal éphémère uniquement). */
export function clearAvatarRegeneration(id: string): void {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const ids: Record<string, number> = JSON.parse(raw);
    delete ids[id];
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}
