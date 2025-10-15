-- Initialize details field for all family_members with NULL details
-- This ensures all existing relatives have a valid JSON object in details

UPDATE family_members
SET details = '{}'::jsonb
WHERE details IS NULL;