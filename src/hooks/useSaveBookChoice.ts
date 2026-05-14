import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CharacterChoice {
  type: 'child' | 'family_member' | 'pet';
  id: string;
  name: string;
}

export interface SaveBookChoiceParams {
  bookRequestId: string;
  selectedThemeType: 'standard' | 'substitute' | 'original';
  selectedCharacters: CharacterChoice[];
  originalThemeInstructions?: string;
  selectedThemeId?: string;
  note?: string;
}

export function useSaveBookChoice(childId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: SaveBookChoiceParams) => {
      const { error } = await supabase
        .from('book_requests')
        .update({
          status: 'configured',
          selected_theme_type: params.selectedThemeType,
          selected_characters: params.selectedCharacters as any,
          original_theme_instructions: params.originalThemeInstructions ?? null,
          selected_theme_id: params.selectedThemeId ?? null,
          message: params.note ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.bookRequestId);

      if (error) throw error;
    },
    onSuccess: () => {
      if (childId) {
        queryClient.invalidateQueries({ queryKey: ['book-timeline', childId] });
      }
    },
  });
}
