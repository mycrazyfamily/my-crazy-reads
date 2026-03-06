import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  onImageError: () => void;
  onImageLoad: () => void;
  imgSrc: string | null;
}

/**
 * Hook that subscribes to Supabase Realtime for avatar_url updates
 * with polling fallback if Realtime fails.
 *
 * Covers:
 *  - Case 1: initialAvatarUrl is null → waits for first avatar_url
 *  - Case 2: initialAvatarUrl exists → detects changes to avatar_url
 */
export function useRealtimeAvatar({ table, id, initialAvatarUrl }: UseRealtimeAvatarOptions): UseRealtimeAvatarResult {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl ?? null);
  const [isNew, setIsNew] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Track the "known" URL so we can detect real changes
  const knownUrlRef = useRef<string | null>(initialAvatarUrl ?? null);
  const realtimeActiveRef = useRef(false);

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

  // Helper to apply a new URL
  const applyNewUrl = useCallback((newUrl: string | null) => {
    if (newUrl && newUrl !== knownUrlRef.current) {
      knownUrlRef.current = newUrl;
      setAvatarUrl(newUrl);
      setHasError(false);
      setImageLoaded(false);
      setIsNew(true);
    }
  }, []);

  // Realtime subscription + polling fallback
  useEffect(() => {
    if (!id) return;

    realtimeActiveRef.current = false;
    let pollingTimer: ReturnType<typeof setInterval> | null = null;
    let stopped = false;

    // --- Realtime ---
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
          realtimeActiveRef.current = true;
          const newUrl = (payload.new as Record<string, unknown>).avatar_url as string | null;
          applyNewUrl(newUrl);
          // Realtime is working → stop polling if running
          if (pollingTimer) {
            clearInterval(pollingTimer);
            pollingTimer = null;
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          realtimeActiveRef.current = true;
        }
        // If subscription fails, start polling fallback
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          startPolling();
        }
      });

    // Start polling as a safety net after a short delay
    // (in case Realtime silently doesn't fire)
    const fallbackTimeout = setTimeout(() => {
      if (!realtimeActiveRef.current && !stopped) {
        startPolling();
      }
    }, 5000);

    function startPolling() {
      if (pollingTimer || stopped) return;
      pollingTimer = setInterval(async () => {
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
              // Change detected → stop polling
              if (pollingTimer) {
                clearInterval(pollingTimer);
                pollingTimer = null;
              }
            }
          }
        } catch {
          // Ignore polling errors
        }
      }, 3000);
    }

    return () => {
      stopped = true;
      clearTimeout(fallbackTimeout);
      if (pollingTimer) clearInterval(pollingTimer);
      supabase.removeChannel(channel);
    };
  }, [table, id, applyNewUrl]);

  // Clear "new" badge after 10 seconds
  useEffect(() => {
    if (!isNew) return;
    const timer = setTimeout(() => setIsNew(false), 10000);
    return () => clearTimeout(timer);
  }, [isNew]);

  const onImageError = useCallback(() => {
    setHasError(true);
  }, []);

  const onImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  // Append cache-busting param
  const imgSrc = avatarUrl
    ? `${avatarUrl}${avatarUrl.includes('?') ? '&' : '?'}v=${Date.now()}`
    : null;

  const isLoading = !!avatarUrl && !hasError && !imageLoaded;

  return { avatarUrl, isNew, isLoading, hasError, onImageError, onImageLoad, imgSrc };
}
