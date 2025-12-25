-- Migration: Create environments and teams tables
-- This allows dynamic management of environments and teams instead of hardcoded values

-- Create environments table
CREATE TABLE IF NOT EXISTS environments (
    id CHAR(36) NOT NULL DEFAULT (uuid()) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
    id CHAR(36) NOT NULL DEFAULT (uuid()) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed default environments
INSERT INTO environments (name) VALUES 
    ('Production'),
    ('Test'),
    ('Dev');

-- Seed default teams
INSERT INTO teams (name) VALUES 
    ('Infrastructure'),
    ('Development'),
    ('Operations');

-- Add foreign key columns to services table
ALTER TABLE services ADD COLUMN environment_id CHAR(36) AFTER environment;
ALTER TABLE services ADD COLUMN team_id CHAR(36) AFTER team;

-- Add foreign key constraints
ALTER TABLE services ADD FOREIGN KEY (environment_id) REFERENCES environments(id);
ALTER TABLE services ADD FOREIGN KEY (team_id) REFERENCES teams(id);
