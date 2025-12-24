CREATE TABLE IF NOT EXISTS categories (
    id CHAR(36) NOT NULL DEFAULT (uuid()) PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert existing categories from the previous ENUM
INSERT IGNORE INTO categories (name) VALUES 
('Databases'), 
('Application Servers'), 
('HR Systems'), 
('Asset Management'), 
('Ticketing Systems'), 
('Task Trackers'), 
('Infrastructure');

-- Update services table: Add category_id and remove the category ENUM
ALTER TABLE services ADD COLUMN category_id CHAR(36) AFTER description;

-- Since the DB is currently empty, we don't need complex data migration.
-- If there were data, we would run an UPDATE statement here to link category_id to categories.id based on the string value.

ALTER TABLE services DROP COLUMN category;
ALTER TABLE services ADD CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES categories(id);
