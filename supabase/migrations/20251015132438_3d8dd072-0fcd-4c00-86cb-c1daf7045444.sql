-- Add DELETE policies to allow replacing pivot selections during child profile edits
-- These mirror existing INSERT/SELECT policies so owners and family members can delete

-- child_discoveries
create policy "Users can delete discoveries for their children"
on public.child_discoveries
for delete
using (
  exists (
    select 1 from public.child_profiles cp
    where cp.id = child_discoveries.child_id
      and cp.user_id = auth.uid()
  )
);

create policy "Users can delete child_discoveries for their family"
on public.child_discoveries
for delete
using (
  exists (
    select 1 from public.child_profiles cp
    join public.user_profiles up on up.id = auth.uid()
    where cp.id = child_discoveries.child_id
      and (cp.family_id = up.family_id or cp.user_id = up.id)
  )
);

-- child_universes
create policy "Users can delete universes for their children"
on public.child_universes
for delete
using (
  exists (
    select 1 from public.child_profiles cp
    where cp.id = child_universes.child_id
      and cp.user_id = auth.uid()
  )
);

create policy "Users can delete child_universes for their family"
on public.child_universes
for delete
using (
  exists (
    select 1 from public.child_profiles cp
    join public.user_profiles up on up.id = auth.uid()
    where cp.id = child_universes.child_id
      and (cp.family_id = up.family_id or cp.user_id = up.id)
  )
);

-- child_likes
create policy "Users can delete likes for their children"
on public.child_likes
for delete
using (
  exists (
    select 1 from public.child_profiles cp
    where cp.id = child_likes.child_id
      and cp.user_id = auth.uid()
  )
);

create policy "Users can delete child_likes for their family"
on public.child_likes
for delete
using (
  exists (
    select 1 from public.child_profiles cp
    join public.user_profiles up on up.id = auth.uid()
    where cp.id = child_likes.child_id
      and (cp.family_id = up.family_id or cp.user_id = up.id)
  )
);

-- child_superpowers
create policy "Users can delete superpowers for their children"
on public.child_superpowers
for delete
using (
  exists (
    select 1 from public.child_profiles cp
    where cp.id = child_superpowers.child_id
      and cp.user_id = auth.uid()
  )
);

create policy "Users can delete child_superpowers for their family"
on public.child_superpowers
for delete
using (
  exists (
    select 1 from public.child_profiles cp
    join public.user_profiles up on up.id = auth.uid()
    where cp.id = child_superpowers.child_id
      and (cp.family_id = up.family_id or cp.user_id = up.id)
  )
);

-- child_challenges
create policy "Users can delete challenges for their children"
on public.child_challenges
for delete
using (
  exists (
    select 1 from public.child_profiles cp
    where cp.id = child_challenges.child_id
      and cp.user_id = auth.uid()
  )
);

create policy "Users can delete child_challenges for their family"
on public.child_challenges
for delete
using (
  exists (
    select 1 from public.child_profiles cp
    join public.user_profiles up on up.id = auth.uid()
    where cp.id = child_challenges.child_id
      and (cp.family_id = up.family_id or cp.user_id = up.id)
  )
);