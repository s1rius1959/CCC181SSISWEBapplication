#!/usr/bin/env python3
"""
Seed script to generate 40 students in BSA program
"""
import os
import random
import sys
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import execute_values

# Load environment variables
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
load_dotenv(os.path.join(ROOT, '.env'))

USER = os.getenv('user') or os.getenv('USER')
PASSWORD = os.getenv('password') or os.getenv('PASSWORD')
HOST = os.getenv('host') or os.getenv('HOST') or 'localhost'
PORT = os.getenv('port') or os.getenv('PORT') or '5432'
DBNAME = os.getenv('dbname') or os.getenv('DBNAME')

if not all([USER, PASSWORD, HOST, PORT, DBNAME]):
    print('Database credentials are not fully set in environment.')
    sys.exit(1)

CONN_STR = f"dbname={DBNAME} user={USER} password={PASSWORD} host={HOST} port={PORT}"

FIRST_NAMES = [
    'Alex', 'Jamie', 'Sam', 'Taylor', 'Jordan', 'Casey', 'Riley', 'Morgan', 'Avery', 'Peyton',
    'Chris', 'Pat', 'Drew', 'Cameron', 'Quinn', 'Devin', 'Skyler', 'Hayden', 'Kai', 'Rowan',
    'Evelyn', 'Olivia', 'Sophia', 'Isabella', 'Mia', 'Charlotte', 'Amelia', 'Harper', 'Eleanor', 'Penelope',
    'Emma', 'Ava', 'Luna', 'Ella', 'Lily', 'Grace', 'Chloe', 'Zoe', 'Madison', 'Victoria',
    'John', 'Michael', 'David', 'James', 'Robert', 'William', 'Joseph', 'Thomas', 'Charles', 'Daniel'
]

LAST_NAMES = [
    'Garcia', 'Smith', 'Johnson', 'Brown', 'Williams', 'Jones', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
    'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
    'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
    'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores'
]

def generate_bsa_students(n=40, start_id=5000):
    """Generate n students for BSA program"""
    students = []
    for i in range(n):
        student_id = f"2024-{start_id + i}"
        first_name = random.choice(FIRST_NAMES)
        last_name = random.choice(LAST_NAMES)
        gender = random.choices(['M', 'F', 'Others'], weights=[45, 45, 10], k=1)[0]
        program_code = 'BSA'
        year_level = random.randint(1, 4)  # BSA typically has 4 years
        profile_image_url = None
        students.append((student_id, first_name, last_name, gender, program_code, year_level, profile_image_url))
    return students

def insert_students(conn, students):
    sql = """
    INSERT INTO students (student_id, first_name, last_name, gender, program_code, year_level, profile_image_url) 
    VALUES %s 
    ON CONFLICT (student_id) DO NOTHING
    """
    with conn.cursor() as cur:
        execute_values(cur, sql, students)
    conn.commit()

def check_bsa_exists(conn):
    """Check if BSA program exists in the database"""
    with conn.cursor() as cur:
        cur.execute("SELECT program_code FROM programs WHERE program_code = 'BSA'")
        return cur.fetchone() is not None

def main():
    try:
        conn = psycopg2.connect(CONN_STR)
        print('Connected to DB')
    except Exception as e:
        print('Failed to connect to DB:', e)
        sys.exit(1)

    try:
        # Check if BSA program exists
        if not check_bsa_exists(conn):
            print('BSA program does not exist in database. Creating it...')
            with conn.cursor() as cur:
                # First check if CCS college exists, if not create it
                cur.execute("SELECT college_code FROM colleges WHERE college_code = 'CCS'")
                if not cur.fetchone():
                    cur.execute("INSERT INTO colleges (college_code, college_name) VALUES ('CCS', 'College of Computer Studies')")
                    print('Created CCS college')
                
                # Create BSA program
                cur.execute("INSERT INTO programs (program_code, program_name, college_code) VALUES ('BSA', 'Bachelor of Science in Accountancy', 'CCS')")
                conn.commit()
                print('Created BSA program')
        
        # Generate and insert BSA students
        students = generate_bsa_students(40)
        print(f'Generated {len(students)} BSA students')
        
        insert_students(conn, students)
        print(f'Successfully inserted {len(students)} students into BSA program')
        
        # Verify insertion
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM students WHERE program_code = 'BSA'")
            count = cur.fetchone()[0]
            print(f'Total BSA students in database: {count}')
            
    except Exception as e:
        print('Error:', e)
        conn.rollback()
    finally:
        conn.close()

if __name__ == '__main__':
    main()
