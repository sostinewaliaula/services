-- Add logo_url to services table
ALTER TABLE services ADD COLUMN logo_url VARCHAR(255) DEFAULT NULL;
