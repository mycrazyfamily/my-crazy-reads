import { useState, useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { consumeAvatarRegeneration, clearAvatarRegeneration, signalAvatarRegeneration } from '@/utils/avatarRegenerationSignal';
import { clearAvatarRegenerating, isAvatarRegenerating } from '@/utils/avatarRegeneratingFlag';
import { FAMILY_DATA_KEY } from '@/hooks/useFamilyData';

let instanceCounter = 0;

// v+comforters : ajout de 'comforters' pour l'avatar des doudous (EditAvatarHeader).
// Realtime n'est pas actif sur cette table → le polling (RULE 3) prend le relais.
type AvatarTable = 'child_profiles' | 'family_members' | 'pets' | 'comforters';

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
  const queryClient = useQueryClient();
  const normalizedInitial = normalizeAvatarUrl(initialAvatarUrl);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(normalizedInitial);
  const [isNew, setIsNew] = useState(false);
  const [hasError, setHasError] = useState(false);
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

    if (consumeAvatarRegeneration(id) || isAvatarRegenerating(id)) {
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

      // Ne considérer comme « nouvel avatar arrivé » qu'une transition d'une URL EXISTANTE vers une
      // autre. La transition initiale null→URL (chargement de la référence, ex. fetch async de
      // EditAvatarHeader) ne doit PAS couper le shimmer.
      const avatarActuallyChanged = !!previousKnownUrl && incoming !== previousKnownUrl;
      if (avatarActuallyChanged) {
        setIsRegenerating(false);
        clearAvatarRegeneration(id);   // signal éphémère (sessionStorage)
        clearAvatarRegenerating(id);   // flag persistant (localStorage)
      }
    }
  }, [initialAvatarUrl, id]);

  // ─── Apply a genuinely NEW url from Realtime or polling ───
  const applyNewUrl = useCallback((newUrl: string | null) => {
    const normalized = normalizeAvatarUrl(newUrl);
    if (normalized && normalized !== knownUrlRef.current) {
      knownUrlRef.current = normalized;
      setAvatarUrl(normalized);
      setHasError(false);
      setIsNew(true);
      // ─── New avatar arrived → end regeneration ───
      setIsRegenerating(false);
      if (id) {
        clearAvatarRegeneration(id);   // signal sessionStorage (cartes dashboard)
        clearAvatarRegenerating(id);   // flag persistant localStorage (écran de modif)
      }
      // Réaligne le cache React Query. Sans ça, useFamilyData resterait sur l'ancienne image / âge /
      // caractéristiques (staleTime 5 min) → on reverrait l'ancien avatar au retour sur la page tant
      // qu'on n'a pas fait de F5. L'invalidation force un refetch de la ligne complète (avatar + âge).
      queryClient.invalidateQueries({ queryKey: [FAMILY_DATA_KEY] });
    }
  }, [id, queryClient]);

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

  // ─── RULE 3: Smart Polling — isolated per instance via useRef ───
  useEffect(() => {
    // Clear any previous polling for this instance
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    // On poll tant qu'un avatar est attendu :
    //  - régénération explicite (isRegenerating), OU
    //  - aucun avatar affichable (!avatarUrl) : cas d'un profil fraîchement créé dont l'image est
    //    générée avec un délai côté n8n, où le realtime peut rater l'événement (carte montée trop
    //    tard, ou cache useFamilyData resservi avec avatar_url null). Le polling relit avatar_url en
    //    direct dans Supabase et s'arrête dès qu'une URL arrive → pas de flag, pas de shimmer bloqué.
    const shouldPoll = isRegenerating || !avatarUrl;
    if (!id || !table || !shouldPoll) return;

    let attempts = 0;
    const MAX_ATTEMPTS = 15;

    const interval = setInterval(async () => {
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
            clearInterval(interval);
            pollingIntervalRef.current = null;
            return;
          }
        }
      } catch {
        // Ignore polling errors
      }

      if (attempts >= MAX_ATTEMPTS) {
        clearInterval(interval);
        pollingIntervalRef.current = null;
      }
    }, 10_000);

    pollingIntervalRef.current = interval;

    return () => {
      clearInterval(interval);
      if (pollingIntervalRef.current === interval) {
        pollingIntervalRef.current = null;
      }
    };
  }, [table, id, isRegenerating, avatarUrl, applyNewUrl]);

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

  // Pas de cache-bust : les URLs sont déjà uniques par génération (timestamp dans le nom de fichier).
  // On sert l'URL telle quelle → le navigateur peut mettre l'image en cache, et une nouvelle
  // génération (nouvelle URL) déclenche naturellement le rechargement.
  const imgSrc = avatarUrl;

  const isLoading = !avatarUrl;

  return { avatarUrl, isNew, isLoading, hasError, isRegenerating, onImageError, onImageLoad, imgSrc, startRegeneration };
}
