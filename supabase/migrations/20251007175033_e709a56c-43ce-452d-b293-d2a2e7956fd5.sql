-- Fix set_user_and_family_ids to use correct columns and attach trigger to child_profiles

create or replace function public.set_user_and_family_ids()
returns trigger
language plpgsql
as $$
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

-- Attach BEFORE INSERT trigger so RLS WITH CHECK sees NEW.user_id set
drop trigger if exists trg_set_child_profile_defaults on public.child_profiles;
create trigger trg_set_child_profile_defaults
before insert on public.child_profiles
for each row
execute function public.set_user_and_family_ids();