CREATE TABLE IF NOT EXISTS services (
    id CHAR(36) NOT NULL DEFAULT (uuid()) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category ENUM('Databases', 'Application Servers', 'HR Systems', 'Asset Management', 'Ticketing Systems', 'Task Trackers', 'Infrastructure') NOT NULL,
    status ENUM('Active', 'Maintenance', 'Deprecated') NOT NULL,
    environment ENUM('Production', 'Test', 'Dev') NOT NULL,
    url VARCHAR(255),
    owner VARCHAR(255) NOT NULL,
    team VARCHAR(255) NOT NULL,
    notes TEXT,
    isFeatured BOOLEAN DEFAULT FALSE,
    lastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    documentation VARCHAR(255),
    dashboard VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS migrations_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    migration_name VARCHAR(255) NOT NULL,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
