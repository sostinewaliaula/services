ALTER TABLE services 
MODIFY COLUMN status ENUM('Active', 'Maintenance', 'Deprecated', 'Online', 'Offline') NULL,
MODIFY COLUMN environment ENUM('Production', 'Test', 'Dev') NULL,
MODIFY COLUMN owner VARCHAR(255) NULL,
MODIFY COLUMN team VARCHAR(255) NULL,
MODIFY COLUMN url VARCHAR(255) NULL;
