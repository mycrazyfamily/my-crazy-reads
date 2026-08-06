// ============================================================================
// useSaveBookChoice v1.1 — 06/08/2026
//
// Changelog v1.1 — ÉCHEC SILENCIEUX (bug 2)
//   La v1.0 testait `error`, ce qui ne suffit pas sous RLS : quand aucune
//   policy n'autorise l'UPDATE, la ligne est simplement INVISIBLE à la
//   requête. PostgREST renvoie 204, zéro ligne modifiée, et `error` vaut
//   `null`. Le hook déclenchait `onSuccess`, invalidait le cache, et la
//   timeline se rechargeait… inchangée. Aucun message, aucune trace.
//
//   Correctif : `.select('id')` renvoie les lignes RÉELLEMENT modifiées. Zéro
//   ligne devient une erreur explicite.
//
//   Deux causes possibles, désormais distinguées dans le message :
//     · deadline de personnalisation dépassée, ou livre verrouillé
//       (`theme_locked`) — la policy RLS refuse l'écriture ;
//     · le livre n'appartient pas à l'utilisateur connecté.
//
//   Requiert la policy « Users can update their own book requests »
//   (migration_bugs_config_v1.sql, section 2). Sans elle, TOUTE configuration
//   par un parent non-admin échoue — et échouera désormais bruyamment, ce qui
//   est le comportement voulu.
// ============================================================================

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CharacterChoice {
  type: 'child' | 'family_member' | 'pet' | 'comforter';
  id: string;
  name: string;
  dedicated?: boolean;
}

export interface SaveBookChoiceParams {
  bookRequestId: string;
  selectedThemeType: 'standard' | 'substitute' | 'original';
  selectedCharacters: CharacterChoice[];
  originalThemeInstructions?: string;
  selectedThemeId?: string;
  note?: string;
  locationId?: string | null;
  locationLabel?: string | null;
}

export function useSaveBookChoice(childId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: SaveBookChoiceParams) => {
      const updatePayload: Record<string, any> = {
        status: 'configured',
        selected_theme_type: params.selectedThemeType,
        selected_characters: params.selectedCharacters as any,
        original_theme_instructions: params.originalThemeInstructions ?? null,
        selected_theme_id: params.selectedThemeId ?? null,
        message: params.note ?? '',
        updated_at: new Date().toISOString(),
      };
      if (params.locationId !== undefined) {
        updatePayload.selected_location_id = params.locationId;
      }
      if (params.locationLabel !== undefined) {
        updatePayload.selected_location_label = params.locationLabel;
      }

      // v1.1 — `.select('id')` : indispensable pour connaître le nombre de
      // lignes réellement modifiées. Sans lui, un refus RLS est indiscernable
      // d'un succès.
      const { data, error } = await supabase
        .from('book_requests')
        .update(updatePayload)
        .eq('id', params.bookRequestId)
        .select('id');

      if (error) throw error;

      if (!data || data.length === 0) {
        // Aucune ligne modifiée : soit la deadline est dépassée ou le livre est
        // verrouillé (la policy RLS refuse), soit il appartient à quelqu'un
        // d'autre. On ne peut pas distinguer les deux depuis le client — RLS
        // ne dit jamais POURQUOI il refuse — d'où un message qui couvre le cas
        // de loin le plus probable.
        throw new Error(
          "Ce livre ne peut plus être modifié : la date limite de personnalisation est dépassée, ou sa fabrication a déjà commencé.",
        );
      }
    },
    onSuccess: () => {
      if (childId) {
        queryClient.invalidateQueries({ queryKey: ['book-timeline', childId] });
      }
    },
  });
}
