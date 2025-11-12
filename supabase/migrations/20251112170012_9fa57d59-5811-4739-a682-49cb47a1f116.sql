-- Ajouter le champ birth_month_year à la table child_pets
ALTER TABLE child_pets 
ADD COLUMN birth_month_year TEXT;

COMMENT ON COLUMN child_pets.birth_month_year IS 'Date de naissance de l''animal au format YYYY-MM (ex: 2025-11)';