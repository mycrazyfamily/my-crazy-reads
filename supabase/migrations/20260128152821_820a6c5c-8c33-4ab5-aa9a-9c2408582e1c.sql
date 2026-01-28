-- Add user ownership check to sync_user_profile_family_on_child_insert function
-- This adds defense-in-depth by verifying the user owns the operation

CREATE OR REPLACE FUNCTION public.sync_user_profile_family_on_child_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify the user owns this operation (defense-in-depth)
  IF NEW.user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: user_id mismatch';
  END IF;
  
  UPDATE public.user_profiles up
  SET family_id = NEW.family_id
  WHERE up.id = NEW.user_id
    AND (up.family_id IS NULL OR up.family_id <> NEW.family_id);
  RETURN NEW;
END;
$$;

-- Also fix the other functions with mutable search_path
CREATE OR REPLACE FUNCTION public.set_user_and_family_ids()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
declare
  existing_family_id uuid;
begin
  -- Ensure user_id is set from JWT
  if NEW.user_id is null then
    NEW.user_id := auth.uid();
  end if;

  -- Look up existing family on the user's profile (user_profiles.id is the user id)
  select family_id into existing_family_id
  from public.user_profiles
  where id = NEW.user_id;

  if existing_family_id is not null then
    -- Reuse profile family when present (keep explicit value if provided)
    NEW.family_id := coalesce(NEW.family_id, existing_family_id);
  else
    -- Otherwise create a new family and link it to the user profile
    insert into public.families (name, created_by, is_active)
    values (
      'Famille_' || left(coalesce(NEW.first_name, 'Enfant'), 10) || '_' || to_char(now(), 'YYYYMMDD_HH24MISS'),
      NEW.user_id,
      true
    )
    returning id into NEW.family_id;

    update public.user_profiles
    set family_id = NEW.family_id
    where id = NEW.user_id;
  end if;

  return NEW;
end;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, created_at)
  VALUES (NEW.id, NOW());
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;