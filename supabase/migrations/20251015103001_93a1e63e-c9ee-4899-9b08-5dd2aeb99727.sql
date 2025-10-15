
-- Nettoyer les doublons et limiter à 3 par enfant pour toutes les tables concernées

-- 1. Nettoyer child_discoveries (garder seulement les 3 plus anciennes par enfant)
WITH ranked_discoveries AS (
  SELECT id, child_id,
    ROW_NUMBER() OVER (PARTITION BY child_id ORDER BY created_at ASC) as rn
  FROM child_discoveries
)
DELETE FROM child_discoveries
WHERE id IN (
  SELECT id FROM ranked_discoveries WHERE rn > 3
);

-- 2. Nettoyer child_universes (garder seulement les 3 plus anciennes par enfant)
WITH ranked_universes AS (
  SELECT id, child_id,
    ROW_NUMBER() OVER (PARTITION BY child_id ORDER BY created_at ASC) as rn
  FROM child_universes
)
DELETE FROM child_universes
WHERE id IN (
  SELECT id FROM ranked_universes WHERE rn > 3
);

-- 3. Nettoyer child_likes (garder seulement les 3 plus anciennes par enfant)
WITH ranked_likes AS (
  SELECT id, child_id,
    ROW_NUMBER() OVER (PARTITION BY child_id ORDER BY created_at ASC) as rn
  FROM child_likes
)
DELETE FROM child_likes
WHERE id IN (
  SELECT id FROM ranked_likes WHERE rn > 3
);

-- 4. Nettoyer child_superpowers (garder seulement les 3 plus anciennes par enfant)
WITH ranked_superpowers AS (
  SELECT id, child_id,
    ROW_NUMBER() OVER (PARTITION BY child_id ORDER BY created_at ASC) as rn
  FROM child_superpowers
)
DELETE FROM child_superpowers
WHERE id IN (
  SELECT id FROM ranked_superpowers WHERE rn > 3
);

-- 5. Nettoyer child_challenges (garder seulement les 3 plus anciennes par enfant)
WITH ranked_challenges AS (
  SELECT id, child_id,
    ROW_NUMBER() OVER (PARTITION BY child_id ORDER BY created_at ASC) as rn
  FROM child_challenges
)
DELETE FROM child_challenges
WHERE id IN (
  SELECT id FROM ranked_challenges WHERE rn > 3
);
