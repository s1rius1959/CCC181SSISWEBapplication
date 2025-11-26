-- Migration: Add first_name and last_name columns to users table if they don't exist
-- Run this script if your database was created before these columns were added

-- Check and add first_name column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'first_name'
    ) THEN
        ALTER TABLE users ADD COLUMN first_name VARCHAR(100);
        RAISE NOTICE 'Column first_name added to users table';
    ELSE
        RAISE NOTICE 'Column first_name already exists in users table';
    END IF;
END $$;

-- Check and add last_name column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'last_name'
    ) THEN
        ALTER TABLE users ADD COLUMN last_name VARCHAR(100);
        RAISE NOTICE 'Column last_name added to users table';
    ELSE
        RAISE NOTICE 'Column last_name already exists in users table';
    END IF;
END $$;

-- Verify the columns exist
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('first_name', 'last_name')
ORDER BY column_name;
