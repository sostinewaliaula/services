-- Migration: Finalize normalization by mapping data and dropping redundant columns

-- 1. Ensure all services have environment_id set based on the environment string
UPDATE services s
JOIN environments e ON s.environment = e.name
SET s.environment_id = e.id
WHERE s.environment_id IS NULL AND s.environment IS NOT NULL;

-- 2. Ensure all services have team_id set based on the team string
UPDATE services s
JOIN teams t ON s.team = t.name
SET s.team_id = t.id
WHERE s.team_id IS NULL AND s.team IS NOT NULL;

-- 3. Drop the redundant text columns
ALTER TABLE services
DROP COLUMN environment,
DROP COLUMN team;
