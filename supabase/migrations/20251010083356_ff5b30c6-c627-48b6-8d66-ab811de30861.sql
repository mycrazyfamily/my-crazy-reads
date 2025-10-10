-- Supprimer la colonne child_id inutilisée de la table family_members
-- Cette colonne n'est plus utilisée car les liens sont gérés via child_family_members

ALTER TABLE public.family_members 
DROP COLUMN IF EXISTS child_id;