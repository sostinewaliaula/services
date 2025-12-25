ALTER TABLE services 
ADD COLUMN db_connection VARCHAR(255) AFTER port,
ADD COLUMN db_username VARCHAR(255) AFTER db_connection,
ADD COLUMN service_username VARCHAR(255) AFTER db_username,
ADD COLUMN service_password VARCHAR(255) AFTER service_username;
