import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { consumeAvatarRegeneration, clearAvatarRegeneration, signalAvatarRegeneration } from '@/utils/avatarRegenerationSignal';

let instanceCounter = 0;

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

  // Unique instance ID for channel naming — stable for the lifetime of this hook
  const instanceIdRef = useRef<number>(++instanceCounter);
  // Polling interval ref — isolated per instance
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Channel ref for cleanup
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // The URL we're "watching" — when it changes, we know a new avatar arrived
  const knownUrlRef = useRef<string | null>(normalizedInitial);

  // ─── RULE 1: Base fait loi au montage ───
  // On mount, if there's a sessionStorage signal, enter regenerating state
  // (works for BOTH new avatars and modifications of existing ones).
  // If no signal, display any existing URL immediately.
  useEffect(() => {
    if (!id) return;

    if (consumeAvatarRegeneration(id)) {
      // Signal found → show shimmer (full if no URL, overlay if URL exists)
      setIsRegenerating(true);
    } else {
      // No signal → display existing URL normally
      setIsRegenerating(false);
    }
  }, [id]);

  // Sync when parent re-fetches and passes a new initialAvatarUrl
  useEffect(() => {
    const incoming = normalizeAvatarUrl(initialAvatarUrl);
    const previousKnownUrl = knownUrlRef.current;

    setAvatarUrl(incoming);
    knownUrlRef.current = incoming;

    if (incoming) {
      setHasError(false);

      const avatarActuallyChanged = incoming !== previousKnownUrl;
      if (avatarActuallyChanged) {
        setIsRegenerating(false);
        clearAvatarRegeneration(id);
      }
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

  // ─── Realtime subscription (isolated per instance) ───
  useEffect(() => {
    if (!id) return;

    const channelName = `avatar-${table}-${id}-${instanceIdRef.current}`;
    const channel = supabase
      .channel(channelName)
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

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      if (channelRef.current === channel) {
        channelRef.current = null;
      }
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
