ALTER TABLE services 
ADD COLUMN ip_address VARCHAR(45) AFTER url,
ADD COLUMN port INT AFTER ip_address;
