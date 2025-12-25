-- Migration: Add db_password column to services table
-- This allows storing database passwords for services that require database connections

ALTER TABLE services 
ADD COLUMN db_password VARCHAR(255) AFTER db_username;
