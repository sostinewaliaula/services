ALTER TABLE services 
ADD COLUMN status ENUM('Active', 'Maintenance', 'Deprecated', 'Online', 'Offline') DEFAULT 'Active',
ADD COLUMN environment ENUM('Production', 'Test', 'Dev') DEFAULT 'Dev',
ADD COLUMN url VARCHAR(255),
ADD COLUMN owner VARCHAR(255),
ADD COLUMN team VARCHAR(255),
ADD COLUMN db_connection VARCHAR(255),
ADD COLUMN service_username VARCHAR(255),
ADD COLUMN service_password VARCHAR(255);
