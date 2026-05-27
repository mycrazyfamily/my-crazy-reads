DROP FUNCTION IF EXISTS public.get_child_book_timeline(uuid);

CREATE OR REPLACE FUNCTION public.get_child_book_timeline(p_child_id uuid)
 RETURNS TABLE(book_request_id uuid, delivery_month date, fabrication_month date, personalization_deadline date, status text, selected_theme_type text, is_original boolean, selected_characters jsonb, original_theme_instructions text, saved_note text, theme_id uuid, titre text, resume_narratif text, logique_pedagogique text, theme_cast jsonb, production_status text, pdf_url text, substitute_options jsonb, selected_theme_titre text, selected_theme_resume text, selected_theme_id uuid, show_custom_story boolean, selected_location_id uuid, selected_location_label text)
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
DECLARE
  v_birth_date date;
  v_family_id uuid;
BEGIN
  SELECT cp.birth_date, cp.family_id
  INTO v_birth_date, v_family_id
  FROM public.child_profiles cp
  WHERE cp.id = p_child_id;

  RETURN QUERY
  SELECT
    br.id,
    br.delivery_month,
    br.fabrication_month,
    br.personalization_deadline,
    br.status,
    br.selected_theme_type,
    br.is_original,
    br.selected_characters,
    br.original_theme_instructions,
    br.message AS saved_note,
    st.id AS theme_id,
    st.titre,
    st.resume_narratif,
    st.logique_pedagogique,
    to_jsonb(st.cast_suggested) AS theme_cast,
    mbp.status::text AS production_status,
    mbp.pdf_url,
    COALESCE((
      SELECT jsonb_agg(option_row ORDER BY option_row->>'priority')
      FROM (
        SELECT jsonb_build_object(
          'substitute_theme_id', sub.id,
          'substitute_theme_titre', sub.titre,
          'substitute_condition', bday.substitute_condition,
          'substitute_person_name', bday.person_name,
          'priority', bday.priority::text
        ) AS option_row
        FROM (
          SELECT
            fm.name AS person_name,
            CASE fm.role
              WHEN 'mother'       THEN 'birthday_mother'
              WHEN 'father'       THEN 'birthday_father'
              WHEN 'grandmother'  THEN 'birthday_grandmother'
              WHEN 'grandfather'  THEN 'birthday_grandfather'
              WHEN 'brother'      THEN 'birthday_sibling'
              WHEN 'sister'       THEN 'birthday_sibling'
              WHEN 'cousin'       THEN 'birthday_cousin'
              WHEN 'bestFriend'   THEN 'birthday_bestfriend'
              WHEN 'other'        THEN 'birthday_other'
              ELSE NULL
            END AS substitute_condition,
            CASE fm.role
              WHEN 'mother'      THEN 1
              WHEN 'father'      THEN 2
              WHEN 'grandmother' THEN 3
              WHEN 'grandfather' THEN 4
              WHEN 'brother'     THEN 5
              WHEN 'sister'      THEN 5
              WHEN 'cousin'      THEN 6
              WHEN 'bestFriend'  THEN 7
              WHEN 'other'       THEN 8
              ELSE 9
            END AS priority
          FROM public.family_members fm
          WHERE fm.family_id = v_family_id
            AND fm.details->>'birthDate' IS NOT NULL
            AND (fm.details->>'birthDate') != ''
            AND EXTRACT(MONTH FROM (fm.details->>'birthDate')::date)
                = EXTRACT(MONTH FROM br.delivery_month)
            AND fm.role IN (
              'mother','father','grandmother','grandfather',
              'brother','sister','cousin','bestFriend','other'
            )
        ) bday
        JOIN public.story_themes sub
          ON sub.is_substitute = true
          AND sub.substitute_condition = bday.substitute_condition
          AND (
            CASE
              WHEN (
                EXTRACT(YEAR FROM AGE(br.delivery_month, v_birth_date)) * 12
                + EXTRACT(MONTH FROM AGE(br.delivery_month, v_birth_date))
              ) < 36
              THEN sub.gamme = 1
              ELSE
                sub.gamme = 2
                AND sub.annee = EXTRACT(YEAR FROM AGE(br.delivery_month, v_birth_date)) + 1
            END
          )
        WHERE bday.substitute_condition IS NOT NULL

        UNION ALL

        SELECT jsonb_build_object(
          'substitute_theme_id', ms.id,
          'substitute_theme_titre', ms.titre,
          'substitute_condition', ms.substitute_condition,
          'substitute_person_name', NULL,
          'priority', '10'
        ) AS option_row
        FROM public.story_themes ms
        WHERE ms.is_substitute = true
          AND ms.substitute_condition LIKE 'milestone_%'
          AND ms.gamme = 1
          AND (
            EXTRACT(YEAR FROM AGE(br.delivery_month, v_birth_date)) * 12
            + EXTRACT(MONTH FROM AGE(br.delivery_month, v_birth_date))
          ) BETWEEN ms.age_months_min AND ms.age_months_max
          AND NOT EXISTS (
            SELECT 1 FROM public.book_requests br2
            WHERE br2.child_id = p_child_id
              AND br2.selected_theme_id = ms.id
              AND br2.is_active = true
              AND br2.id != br.id
          )
      ) options
    ), '[]'::jsonb) AS substitute_options,
    sel_theme.titre AS selected_theme_titre,
    sel_theme.resume_narratif AS selected_theme_resume,
    br.selected_theme_id,
    (('x' || substring(br.id::text, 1, 8))::bit(32)::int % 6 = 0) AS show_custom_story,
    br.selected_location_id,
    br.selected_location_label
  FROM public.book_requests br
  LEFT JOIN public.story_themes st
    ON st.is_substitute = false
    AND (
      CASE
        WHEN (
          EXTRACT(YEAR FROM AGE(br.delivery_month, v_birth_date)) * 12
          + EXTRACT(MONTH FROM AGE(br.delivery_month, v_birth_date))
        ) < 36
        THEN
          st.gamme = 1
          AND st.age_months_min <= (
            EXTRACT(YEAR FROM AGE(br.delivery_month, v_birth_date)) * 12
            + EXTRACT(MONTH FROM AGE(br.delivery_month, v_birth_date))
          )
          AND st.age_months_max >= (
            EXTRACT(YEAR FROM AGE(br.delivery_month, v_birth_date)) * 12
            + EXTRACT(MONTH FROM AGE(br.delivery_month, v_birth_date))
          )
        ELSE
          st.gamme = 2
          AND st.calendar_month = EXTRACT(MONTH FROM br.delivery_month)
          AND st.annee = EXTRACT(YEAR FROM AGE(br.delivery_month, v_birth_date)) + 1
      END
    )
  LEFT JOIN public.story_themes sel_theme
    ON br.selected_theme_id IS NOT NULL
    AND sel_theme.id = br.selected_theme_id
  LEFT JOIN public.mcf_book_productions mbp ON mbp.book_request_id = br.id
  WHERE br.child_id = p_child_id
    AND br.is_active = true
    AND br.archived_at IS NULL
    AND (
      NOT EXISTS (
        SELECT 1 FROM public.subscriptions s
        WHERE s.child_id = p_child_id
          AND s.is_active = true
          AND s.cancel_at IS NOT NULL
      )
      OR
      br.delivery_month <= (
        SELECT s.end_date
        FROM public.subscriptions s
        WHERE s.child_id = p_child_id
          AND s.is_active = true
          AND s.cancel_at IS NOT NULL
        ORDER BY s.end_date DESC
        LIMIT 1
      )
    )
  ORDER BY br.delivery_month ASC;
END;
$function$;