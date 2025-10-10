-- Create superpowers table
CREATE TABLE IF NOT EXISTS public.superpowers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  value text UNIQUE NOT NULL,
  emoji text,
  created_at timestamp with time zone DEFAULT now()
);

-- Create child_superpowers pivot table
CREATE TABLE IF NOT EXISTS public.child_superpowers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid REFERENCES public.child_profiles(id) ON DELETE CASCADE NOT NULL,
  superpower_id uuid REFERENCES public.superpowers(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now()
);

-- Create likes table
CREATE TABLE IF NOT EXISTS public.likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  value text UNIQUE NOT NULL,
  emoji text,
  created_at timestamp with time zone DEFAULT now()
);

-- Create child_likes pivot table
CREATE TABLE IF NOT EXISTS public.child_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid REFERENCES public.child_profiles(id) ON DELETE CASCADE NOT NULL,
  like_id uuid REFERENCES public.likes(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.superpowers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_superpowers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for superpowers (public read like traits)
CREATE POLICY "Anyone can read superpowers"
ON public.superpowers
FOR SELECT
USING (true);

-- RLS Policies for likes (public read like passions)
CREATE POLICY "Anyone can read likes"
ON public.likes
FOR SELECT
USING (true);

-- RLS Policies for child_superpowers (same pattern as child_traits)
CREATE POLICY "Users can view superpowers for their children"
ON public.child_superpowers
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM child_profiles cp
    WHERE cp.id = child_superpowers.child_id
    AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert superpowers for their children"
ON public.child_superpowers
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM child_profiles cp
    WHERE cp.id = child_superpowers.child_id
    AND cp.user_id = auth.uid()
  )
);

-- RLS Policies for child_likes (same pattern as child_passions)
CREATE POLICY "Users can view likes for their children"
ON public.child_likes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM child_profiles cp
    WHERE cp.id = child_likes.child_id
    AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert likes for their children"
ON public.child_likes
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM child_profiles cp
    WHERE cp.id = child_likes.child_id
    AND cp.user_id = auth.uid()
  )
);