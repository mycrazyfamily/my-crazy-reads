import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { consumeAvatarRegeneration, clearAvatarRegeneration, signalAvatarRegeneration } from '@/utils/avatarRegenerationSignal';

type AvatarTable = 'child_profiles' | 'family_members' | 'pets';

interface UseRealtimeAvatarOptions {
  table: AvatarTable;
  id: string;
  initialAvatarUrl?: string | null;
}

interface UseRealtimeAvatarResult {
  avatarUrl: string | null;
  isNew: boolean;
  isLoading: boolean;
  hasError: boolean;
  isRegenerating: boolean;
  onImageError: () => void;
  onImageLoad: () => void;
  imgSrc: string | null;
  startRegeneration: () => void;
}

const normalizeAvatarUrl = (url?: string | null): string | null => {
  const normalized = url?.trim();
  return normalized ? normalized : null;
};

export function useRealtimeAvatar({ table, id, initialAvatarUrl }: UseRealtimeAvatarOptions): UseRealtimeAvatarResult {
  const normalizedInitial = normalizeAvatarUrl(initialAvatarUrl);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(normalizedInitial);
  const [isNew, setIsNew] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [cacheBustVersion, setCacheBustVersion] = useState(() => Date.now());
  const [isRegenerating, setIsRegenerating] = useState(false);

  // The URL we're "watching" — when it changes, we know a new avatar arrived
  const knownUrlRef = useRef<string | null>(normalizedInitial);

  // ─── RULE 1: Base fait loi au montage ───
  // On mount, if there's already an avatar_url, display it immediately.
  // Only enter regenerating state if there's a sessionStorage signal AND no URL.
  useEffect(() => {
    if (!id) return;

    if (knownUrlRef.current) {
      // URL exists → show it, clear any stale signal
      clearAvatarRegeneration(id);
      setIsRegenerating(false);
    } else {
      // No URL → check if we should show the spinner
      if (consumeAvatarRegeneration(id)) {
        setIsRegenerating(true);
      }
    }
  }, [id]);

  // Sync when parent re-fetches and passes a new initialAvatarUrl
  useEffect(() => {
    const incoming = normalizeAvatarUrl(initialAvatarUrl);
    setAvatarUrl(incoming);
    knownUrlRef.current = incoming;
    if (incoming) {
      setHasError(false);
      setIsRegenerating(false);
      clearAvatarRegeneration(id);
    }
  }, [initialAvatarUrl, id]);

  // ─── Apply a genuinely NEW url from Realtime or polling ───
  const applyNewUrl = useCallback((newUrl: string | null) => {
    const normalized = normalizeAvatarUrl(newUrl);
    if (normalized && normalized !== knownUrlRef.current) {
      knownUrlRef.current = normalized;
      setAvatarUrl(normalized);
      setCacheBustVersion(Date.now());
      setHasError(false);
      setIsNew(true);
      // ─── New avatar arrived → end regeneration ───
      setIsRegenerating(false);
      if (id) clearAvatarRegeneration(id);
    }
  }, [id]);

  // ─── RULE 2: startRegeneration — spinner stays indefinitely ───
  const startRegeneration = useCallback(() => {
    setIsRegenerating(true);
    if (id) signalAvatarRegeneration(id);
  }, [id]);

  // ─── Realtime subscription (standard) ───
  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`avatar-${table}-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table,
          filter: `id=eq.${id}`,
        },
        (payload) => {
          const newUrl = (payload.new as Record<string, unknown>).avatar_url as string | null;
          applyNewUrl(newUrl);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, id, applyNewUrl]);

  // ─── RULE 3: Smart Polling — only when regenerating ───
  // Poll every 10s, max 15 attempts. Spinner continues visually even after polling stops.
  useEffect(() => {
    if (!id || !table || !isRegenerating) return;

    let attempts = 0;
    const MAX_ATTEMPTS = 15;
    let stopped = false;

    const interval = setInterval(async () => {
      if (stopped) return;
      attempts++;

      try {
        const { data } = await supabase
          .from(table)
          .select('avatar_url')
          .eq('id', id)
          .single();

        if (data) {
          const fetchedUrl = (data as Record<string, unknown>).avatar_url as string | null;
          if (fetchedUrl && fetchedUrl !== knownUrlRef.current) {
            applyNewUrl(fetchedUrl);
            stopped = true;
            clearInterval(interval);
            return;
          }
        }
      } catch {
        // Ignore polling errors
      }

      if (attempts >= MAX_ATTEMPTS) {
        // Stop polling to save resources, but do NOT clear isRegenerating
        stopped = true;
        clearInterval(interval);
      }
    }, 10_000);

    return () => {
      stopped = true;
      clearInterval(interval);
    };
  }, [table, id, isRegenerating, applyNewUrl]);

  // Clear "new" badge after 10 seconds
  useEffect(() => {
    if (!isNew) return;
    const timer = setTimeout(() => setIsNew(false), 10000);
    return () => clearTimeout(timer);
  }, [isNew]);

  const onImageError = useCallback(() => setHasError(true), []);
  const onImageLoad = useCallback(() => {
    /* no-op — we don't gate display on image load */
  }, []);

  const imgSrc = avatarUrl
    ? `${avatarUrl}${avatarUrl.includes('?') ? '&' : '?'}v=${cacheBustVersion}`
    : null;

  const isLoading = !avatarUrl;

  return { avatarUrl, isNew, isLoading, hasError, isRegenerating, onImageError, onImageLoad, imgSrc, startRegeneration };
}
