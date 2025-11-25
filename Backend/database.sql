-- Drop existing tables if they exist (in reverse order due to foreign keys)
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS programs CASCADE;
DROP TABLE IF EXISTS colleges CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ==========================================
-- CREATE TABLES
-- ==========================================

-- Colleges Table
CREATE TABLE colleges (
    college_code VARCHAR(10) PRIMARY KEY,
    college_name VARCHAR(255) NOT NULL
);

-- Programs Table
CREATE TABLE programs (
    program_code VARCHAR(10) PRIMARY KEY,
    program_name VARCHAR(255) NOT NULL,
    college_code VARCHAR(10) NOT NULL,
    FOREIGN KEY (college_code) REFERENCES colleges(college_code) ON DELETE RESTRICT
);

-- Students Table
CREATE TABLE students (
    student_id VARCHAR(20) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('M', 'F', 'Others')),
    program_code VARCHAR(10) NOT NULL,
    year_level INTEGER NOT NULL CHECK (year_level BETWEEN 1 AND 5),
    profile_image_url TEXT,
    FOREIGN KEY (program_code) REFERENCES programs(program_code) ON DELETE RESTRICT
);

-- Users Table (for authentication)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    profile_image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- INSERT DEFAULT DATA
-- ==========================================

-- Insert default 'N/A' college for unassigned programs
INSERT INTO colleges (college_code, college_name) VALUES
('N/A', 'No College Assigned');

-- Insert default 'N/A' program for unassigned students
INSERT INTO programs (program_code, program_name, college_code) VALUES
('N/A', 'No Program Assigned', 'N/A');

-- ==========================================
-- CREATE INDEXES FOR PERFORMANCE
-- ==========================================

-- Index on student lookups
CREATE INDEX idx_students_program ON students(program_code);
CREATE INDEX idx_students_year ON students(year_level);
CREATE INDEX idx_students_name ON students(last_name, first_name);

-- Index on program lookups
CREATE INDEX idx_programs_college ON programs(college_code);

-- Index on user email lookups
CREATE INDEX idx_users_email ON users(email);

-- ==========================================
-- DISPLAY SUCCESS MESSAGE
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE 'Database initialized successfully!';
    RAISE NOTICE 'Tables created: colleges, programs, students, users';
    RAISE NOTICE 'Default N/A records inserted';
    RAISE NOTICE 'Indexes created for optimized queries';
END $$;
