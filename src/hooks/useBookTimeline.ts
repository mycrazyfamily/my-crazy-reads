import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BookTimelineRow {
  book_request_id: string;
  delivery_month: string;
  fabrication_month: string;
  personalization_deadline: string;
  status: string;
  selected_theme_type: string | null;
  is_original: boolean;
  selected_characters: any;
  original_theme_instructions: string | null;
  titre: string | null;
  resume_narratif: string | null;
  logique_pedagogique: string | null;
  theme_cast: any;
  theme_id: string | null;
  saved_note: string | null;
  production_status: string | null;
  pdf_url: string | null;
  substitute_options: Array<{
    substitute_theme_id: string;
    substitute_theme_titre: string;
    substitute_condition: string;
    substitute_person_name: string;
  }> | null;
  selected_theme_titre: string | null;
  selected_theme_resume: string | null;
  selected_theme_id: string | null;
  show_custom_story: boolean;
  selected_location_id: string | null;
  selected_location_label: string | null;
}

export function useBookTimeline(childId: string | null) {
  return useQuery({
    queryKey: ['book-timeline', childId],
    queryFn: async () => {
      if (!childId) return [] as BookTimelineRow[];
      const { data, error } = await supabase.rpc('get_child_book_timeline', {
        p_child_id: childId,
      });
      if (error) throw error;
      return (data ?? []) as unknown as BookTimelineRow[];
    },
    enabled: !!childId,
    staleTime: 1000 * 60 * 5,
  });
}
