-- Initialize database schema
-- This script is executed when the Docker container starts

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set timezone
SET timezone = 'UTC';

-- Create indexes for better performance (will be created by Prisma migrations, but kept for reference)
-- These will be managed by Prisma
