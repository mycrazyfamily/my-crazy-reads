const STORAGE_KEY = 'avatar_regenerating';

/** Mark a profile as regenerating (persists across navigation) */
export function signalAvatarRegeneration(id: string): void {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const ids: Record<string, number> = raw ? JSON.parse(raw) : {};
    ids[id] = Date.now();
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

/** Check if a profile was marked as regenerating (within last 5 min) */
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

/** Clear regeneration signal for a profile */
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
