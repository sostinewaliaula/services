-- Increase logo_url length to accommodate longer URLs
ALTER TABLE services MODIFY COLUMN logo_url VARCHAR(2048) DEFAULT NULL;
