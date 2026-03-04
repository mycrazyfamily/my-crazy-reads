-- Migrate legacy gendered roles to normalized roles with gender in details

-- femaleCousin -> cousin with gender female
UPDATE family_members 
SET role = 'cousin',
    details = jsonb_set(COALESCE(details, '{}'::jsonb), '{gender}', '"female"')
WHERE role = 'femaleCousin';

-- maleCousin -> cousin with gender male
UPDATE family_members 
SET role = 'cousin',
    details = jsonb_set(COALESCE(details, '{}'::jsonb), '{gender}', '"male"')
WHERE role = 'maleCousin';

-- femaleFriend -> bestFriend with gender female
UPDATE family_members 
SET role = 'bestFriend',
    details = jsonb_set(COALESCE(details, '{}'::jsonb), '{gender}', '"female"')
WHERE role = 'femaleFriend';

-- maleFriend -> bestFriend with gender male
UPDATE family_members 
SET role = 'bestFriend',
    details = jsonb_set(COALESCE(details, '{}'::jsonb), '{gender}', '"male"')
WHERE role = 'maleFriend';

-- Also update child_family_members relation_label
UPDATE child_family_members SET relation_label = 'cousin' WHERE relation_label IN ('femaleCousin', 'maleCousin');
UPDATE child_family_members SET relation_label = 'bestFriend' WHERE relation_label IN ('femaleFriend', 'maleFriend');

-- Ensure all family_members have a gender in details (set based on role for known gendered roles)
UPDATE family_members
SET details = jsonb_set(COALESCE(details, '{}'::jsonb), '{gender}', '"female"')
WHERE role IN ('mother', 'sister', 'grandmother', 'aunt', 'nanny')
  AND (details IS NULL OR details->>'gender' IS NULL OR details->>'gender' = 'neutral');

UPDATE family_members
SET details = jsonb_set(COALESCE(details, '{}'::jsonb), '{gender}', '"male"')
WHERE role IN ('father', 'brother', 'grandfather', 'uncle')
  AND (details IS NULL OR details->>'gender' IS NULL OR details->>'gender' = 'neutral');