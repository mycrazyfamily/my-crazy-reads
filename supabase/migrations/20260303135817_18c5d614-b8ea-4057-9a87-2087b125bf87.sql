DELETE FROM notifications
WHERE type = 'age_threshold'
AND id NOT IN (
  SELECT (MIN(id::text))::uuid FROM notifications
  WHERE type = 'age_threshold'
  GROUP BY user_id, title
);