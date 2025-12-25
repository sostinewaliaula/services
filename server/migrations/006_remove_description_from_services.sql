-- Migration: Remove description column from services table
-- This field is not required for service management

ALTER TABLE services DROP COLUMN description;
