DELETE FROM notifications
WHERE type = 'age_threshold'
AND id::text NOT IN (
  SELECT MIN(id::text) FROM notifications
  WHERE type = 'age_threshold'
  GROUP BY user_id, title
);