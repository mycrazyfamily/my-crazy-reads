-- Supprimer Stormy des drafts de Robin
UPDATE drafts
SET data = jsonb_set(
  data,
  '{pets,pets}',
  '[]'::jsonb
)
WHERE type = 'child_profile' 
  AND data->>'firstName' = 'Robin'
  AND data->'pets'->'pets' @> '[{"name": "Stormy"}]'::jsonb;