-- Create places table
CREATE TABLE public.places (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  type text CHECK (type IN ('maison_principale', 'maison_secondaire', 'autre_parent', 'vacances')),
  description text,
  emoji text,
  address text,
  city text,
  country text,
  details jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id),
  family_id uuid REFERENCES public.families(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Create child_places pivot table
CREATE TABLE public.child_places (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  place_id uuid NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
  label text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(child_id, place_id)
);

-- Enable RLS on places
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;

-- RLS policies for places
CREATE POLICY "Users can view places of their family"
ON public.places
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = auth.uid()
    AND up.family_id = places.family_id
  )
);

CREATE POLICY "Users can insert places for their family"
ON public.places
FOR INSERT
WITH CHECK (
  auth.uid() = created_by
  AND EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = auth.uid()
    AND up.family_id = places.family_id
  )
);

CREATE POLICY "Users can update places of their family"
ON public.places
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = auth.uid()
    AND up.family_id = places.family_id
  )
);

CREATE POLICY "Users can delete places of their family"
ON public.places
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = auth.uid()
    AND up.family_id = places.family_id
  )
);

-- Enable RLS on child_places
ALTER TABLE public.child_places ENABLE ROW LEVEL SECURITY;

-- RLS policies for child_places
CREATE POLICY "Users can view child_places for their family"
ON public.child_places
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM child_profiles cp
    JOIN user_profiles up ON up.id = auth.uid()
    WHERE cp.id = child_places.child_id
    AND (cp.family_id = up.family_id OR cp.user_id = up.id)
  )
);

CREATE POLICY "Users can insert child_places for their family"
ON public.child_places
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM child_profiles cp
    JOIN user_profiles up ON up.id = auth.uid()
    WHERE cp.id = child_places.child_id
    AND (cp.family_id = up.family_id OR cp.user_id = up.id)
  )
);

CREATE POLICY "Users can delete child_places for their family"
ON public.child_places
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM child_profiles cp
    JOIN user_profiles up ON up.id = auth.uid()
    WHERE cp.id = child_places.child_id
    AND (cp.family_id = up.family_id OR cp.user_id = up.id)
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_places_updated_at
BEFORE UPDATE ON public.places
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();