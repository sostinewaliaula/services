-- Migration: Create service type associations with categories and tags
-- This allows many-to-many relationships so categories and tags can be filtered by service type

-- Junction table for service types and categories
CREATE TABLE IF NOT EXISTS service_type_categories (
    id CHAR(36) NOT NULL DEFAULT (uuid()) PRIMARY KEY,
    service_type_id CHAR(36) NOT NULL,
    category_id CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_type_id) REFERENCES service_types(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE KEY unique_type_category (service_type_id, category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Junction table for service types and tags
CREATE TABLE IF NOT EXISTS service_type_tags (
    id CHAR(36) NOT NULL DEFAULT (uuid()) PRIMARY KEY,
    service_type_id CHAR(36) NOT NULL,
    tag_id CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_type_id) REFERENCES service_types(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    UNIQUE KEY unique_type_tag (service_type_id, tag_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed default associations for WebLogic type
INSERT INTO service_type_categories (service_type_id, category_id)
SELECT st.id, c.id 
FROM service_types st
CROSS JOIN categories c
WHERE st.name = 'WebLogic' AND c.name IN ('Databases', 'Application Servers');

-- Seed default associations for Database type
INSERT INTO service_type_categories (service_type_id, category_id)
SELECT st.id, c.id 
FROM service_types st
CROSS JOIN categories c
WHERE st.name = 'Database' AND c.name = 'Databases';

-- Seed default associations for Generic type (all categories)
INSERT INTO service_type_categories (service_type_id, category_id)
SELECT st.id, c.id 
FROM service_types st
CROSS JOIN categories c
WHERE st.name = 'Generic';

-- Seed some default tag associations
-- WebLogic can have Critical, Production, Infrastructure tags
INSERT INTO service_type_tags (service_type_id, tag_id)
SELECT st.id, t.id 
FROM service_types st
CROSS JOIN tags t
WHERE st.name = 'WebLogic' AND t.name IN ('Critical', 'Production', 'Infrastructure');

-- Database can have Critical, Production tags
INSERT INTO service_type_tags (service_type_id, tag_id)
SELECT st.id, t.id 
FROM service_types st
CROSS JOIN tags t
WHERE st.name = 'Database' AND t.name IN ('Critical', 'Production');

-- Generic type can have all tags
INSERT INTO service_type_tags (service_type_id, tag_id)
SELECT st.id, t.id 
FROM service_types st
CROSS JOIN tags t
WHERE st.name = 'Generic';
