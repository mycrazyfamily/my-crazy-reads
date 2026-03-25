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

export function useRealtimeAvatar({ table, id, initialAvatarUrl }: UseRealtimeAvatarOptions): UseRealtimeAvatarResult {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl ?? null);
  const [isNew, setIsNew] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [cacheBustVersion, setCacheBustVersion] = useState(() => Date.now());
  const [isRegenerating, setIsRegenerating] = useState(false);

  const knownUrlRef = useRef<string | null>(initialAvatarUrl ?? null);

  // On mount, check sessionStorage for pending regeneration signal
  useEffect(() => {
    if (id && consumeAvatarRegeneration(id)) {
      setIsRegenerating(true);
    }
  }, [id]);

  // Sync when prop changes (e.g. parent re-fetch)
  useEffect(() => {
    const incoming = initialAvatarUrl ?? null;
    setAvatarUrl(incoming);
    knownUrlRef.current = incoming;
    if (incoming) {
      setHasError(false);
      setImageLoaded(false);
    }
  }, [initialAvatarUrl]);

  const applyNewUrl = useCallback((newUrl: string | null) => {
    if (newUrl && newUrl !== knownUrlRef.current) {
      knownUrlRef.current = newUrl;
      setAvatarUrl(newUrl);
      setCacheBustVersion(Date.now());
      setHasError(false);
      setImageLoaded(false);
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
    let unchangedCount = 0;

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
          } else if (fetchedUrl && fetchedUrl === knownUrlRef.current) {
            // URL exists but hasn't changed — if we're still "regenerating",
            // the URL was already set before we started watching.
            unchangedCount++;
            if (unchangedCount >= 3) {
              // After ~9s of no change with a valid URL, clear stale regenerating state
              setIsRegenerating((prev) => {
                if (prev) clearAvatarRegeneration(id);
                return false;
              });
            }
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
  const onImageLoad = useCallback(() => {
    setImageLoaded(true);
    // If the image loaded successfully while we thought it was regenerating,
    // it means the URL was already valid — clear the stale regenerating flag.
    setIsRegenerating((prev) => {
      if (prev && id) clearAvatarRegeneration(id);
      return false;
    });
  }, [id]);

  const imgSrc = avatarUrl
    ? `${avatarUrl}${avatarUrl.includes('?') ? '&' : '?'}v=${cacheBustVersion}`
    : null;

  // Show as loading if regenerating (shimmer over old avatar) OR if image not yet loaded
  const isLoading = isRegenerating || (!!avatarUrl && !hasError && !imageLoaded);

  return { avatarUrl, isNew, isLoading, hasError, isRegenerating, onImageError, onImageLoad, imgSrc, startRegeneration };
}
