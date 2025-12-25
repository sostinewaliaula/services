-- Create service_types table
CREATE TABLE IF NOT EXISTS service_types (
    id CHAR(36) NOT NULL DEFAULT (uuid()) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
    id CHAR(36) NOT NULL DEFAULT (uuid()) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create service_tags junction table
CREATE TABLE IF NOT EXISTS service_tags (
    service_id CHAR(36) NOT NULL,
    tag_id CHAR(36) NOT NULL,
    PRIMARY KEY (service_id, tag_id),
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add service_type_id to services
ALTER TABLE services ADD COLUMN service_type_id CHAR(36) AFTER category_id;
ALTER TABLE services ADD FOREIGN KEY (service_type_id) REFERENCES service_types(id);

-- Update status to allow Online/Offline
ALTER TABLE services MODIFY COLUMN status VARCHAR(50) NOT NULL;

-- Seed initial service types
INSERT IGNORE INTO service_types (name) VALUES ('Database'), ('WebLogic'), ('Generic');
