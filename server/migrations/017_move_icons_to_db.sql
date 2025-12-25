-- Add blob storage for service icons
ALTER TABLE services ADD COLUMN logo_blob LONGBLOB DEFAULT NULL;
ALTER TABLE services ADD COLUMN logo_mime_type VARCHAR(50) DEFAULT NULL;

-- Note: We keep logo_url for external links if needed, 
-- but the priority will be given to logo_blob in the UI.
