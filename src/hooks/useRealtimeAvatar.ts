import { useState, useEffect, useCallback } from 'react';
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
 * and provides states for skeleton, fade-in, "new" badge, and error fallback.
 */
export function useRealtimeAvatar({ table, id, initialAvatarUrl }: UseRealtimeAvatarOptions): UseRealtimeAvatarResult {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl ?? null);
  const [isNew, setIsNew] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Sync when prop changes (e.g. parent re-fetch)
  useEffect(() => {
    setAvatarUrl(initialAvatarUrl ?? null);
    if (initialAvatarUrl) {
      setHasError(false);
      setImageLoaded(false);
    }
  }, [initialAvatarUrl]);

  // Realtime subscription
  useEffect(() => {
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
          if (newUrl && newUrl !== avatarUrl) {
            setAvatarUrl(newUrl);
            setHasError(false);
            setImageLoaded(false);
            setIsNew(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // Only re-subscribe when table/id changes, not avatarUrl
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, id]);

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
