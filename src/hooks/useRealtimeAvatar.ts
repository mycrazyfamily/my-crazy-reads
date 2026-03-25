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
  const normalizedInitialAvatarUrl = normalizeAvatarUrl(initialAvatarUrl);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(normalizedInitialAvatarUrl);
  const [isNew, setIsNew] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(Boolean(normalizedInitialAvatarUrl));
  const [cacheBustVersion, setCacheBustVersion] = useState(() => Date.now());
  const [isRegenerating, setIsRegenerating] = useState(false);

  const knownUrlRef = useRef<string | null>(normalizedInitialAvatarUrl);

  // On mount, check sessionStorage for pending regeneration signal
  useEffect(() => {
    if (!id) return;

    if (knownUrlRef.current) {
      clearAvatarRegeneration(id);
      setIsRegenerating(false);
      return;
    }

    if (consumeAvatarRegeneration(id)) {
      setIsRegenerating(true);
    }
  }, [id]);

  // Sync when prop changes (e.g. parent re-fetch)
  useEffect(() => {
    const incoming = normalizeAvatarUrl(initialAvatarUrl);
    setAvatarUrl(incoming);
    knownUrlRef.current = incoming;
    if (incoming) {
      setHasError(false);
      setImageLoaded(true);
      setIsRegenerating(false);
      if (id) clearAvatarRegeneration(id);
    } else {
      setImageLoaded(false);
    }
  }, [initialAvatarUrl, id]);

  const applyNewUrl = useCallback((newUrl: string | null) => {
    const normalizedUrl = normalizeAvatarUrl(newUrl);

    if (normalizedUrl && normalizedUrl !== knownUrlRef.current) {
      knownUrlRef.current = normalizedUrl;
      setAvatarUrl(normalizedUrl);
      setCacheBustVersion(Date.now());
      setHasError(false);
      setImageLoaded(true);
      setIsNew(true);
      // End regeneration state
      setIsRegenerating(false);
      if (id) clearAvatarRegeneration(id);
    }
  }, [id]);

  const startRegeneration = useCallback(() => {
    setIsRegenerating(true);
    if (id) signalAvatarRegeneration(id);
  }, [id]);

  // Realtime subscription
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

  // Polling fallback — always runs until a change is detected or 5 min timeout
  useEffect(() => {
    if (!id || !table) return;

    let stopped = false;

    const interval = setInterval(async () => {
      if (stopped) return;
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
            clearInterval(interval);
          }
        }
      } catch {
        // Ignore polling errors
      }
    }, 3000);

    // Stop after 5 minutes max
    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 300000);

    return () => {
      stopped = true;
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [table, id, applyNewUrl]);

  // Clear "new" badge after 10 seconds
  useEffect(() => {
    if (!isNew) return;
    const timer = setTimeout(() => setIsNew(false), 10000);
    return () => clearTimeout(timer);
  }, [isNew]);

  const onImageError = useCallback(() => setHasError(true), []);
  const onImageLoad = useCallback(() => setImageLoaded(true), []);

  const imgSrc = avatarUrl
    ? `${avatarUrl}${avatarUrl.includes('?') ? '&' : '?'}v=${cacheBustVersion}`
    : null;

  const isLoading = !avatarUrl;

  return { avatarUrl, isNew, isLoading, hasError, isRegenerating, onImageError, onImageLoad, imgSrc, startRegeneration };
}
