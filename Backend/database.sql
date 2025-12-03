DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS programs CASCADE;
DROP TABLE IF EXISTS colleges CASCADE;
DROP TABLE IF EXISTS users CASCADE;


CREATE TABLE colleges (
    college_code VARCHAR(10) PRIMARY KEY,
    college_name VARCHAR(255) NOT NULL
);

CREATE TABLE programs (
    program_code VARCHAR(10) PRIMARY KEY,
    program_name VARCHAR(255) NOT NULL,
    college_code VARCHAR(10) NOT NULL,
    FOREIGN KEY (college_code) REFERENCES colleges(college_code) ON DELETE RESTRICT
);

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

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    profile_image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


INSERT INTO colleges (college_code, college_name) VALUES ('N/A', 'No College Assigned');

INSERT INTO programs (program_code, program_name, college_code) VALUES ('N/A', 'No Program Assigned', 'N/A');


CREATE INDEX idx_students_program ON students(program_code);
CREATE INDEX idx_students_year ON students(year_level);
CREATE INDEX idx_students_name ON students(last_name, first_name);
CREATE INDEX idx_programs_college ON programs(college_code);
CREATE INDEX idx_users_email ON users(email);
