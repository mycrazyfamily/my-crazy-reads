-- Ajouter une valeur par défaut pour created_at dans child_pets
ALTER TABLE public.child_pets 
ALTER COLUMN created_at SET DEFAULT now();

-- Mettre à jour les enregistrements existants qui ont created_at à NULL
UPDATE public.child_pets 
SET created_at = now() 
WHERE created_at IS NULL;