#!/usr/bin/env python3
"""
Seed script for CCC181SSISWEBapplication
Generates:
- 30 colleges
- 30 programs
- 300 students

Reads DB connection from environment / .env:
- user, password, host, port, dbname

Usage:
  python Backend/scripts/seed_db.py

This will use psycopg2 and python-dotenv (already in requirements).
"""
import os
import random
import sys
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import execute_values

# Load environment variables from project root .env if present
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
load_dotenv(os.path.join(ROOT, '.env'))

USER = os.getenv('user') or os.getenv('USER')
PASSWORD = os.getenv('password') or os.getenv('PASSWORD')
HOST = os.getenv('host') or os.getenv('HOST') or 'localhost'
PORT = os.getenv('port') or os.getenv('PORT') or '5432'
DBNAME = os.getenv('dbname') or os.getenv('DBNAME')

if not all([USER, PASSWORD, HOST, PORT, DBNAME]):
    print('Database credentials are not fully set in environment. Please set user, password, host, port, dbname or place them in .env')
    sys.exit(1)

CONN_STR = f"dbname={DBNAME} user={USER} password={PASSWORD} host={HOST} port={PORT}"

FIRST_NAMES = [
    'Alex','Jamie','Sam','Taylor','Jordan','Casey','Riley','Morgan','Avery','Peyton',
    'Chris','Pat','Drew','Cameron','Quinn','Devin','Skyler','Hayden','Kai','Rowan',
    'Evelyn','Olivia','Sophia','Isabella','Mia','Charlotte','Amelia','Harper','Eleanor','Penelope'
]

LAST_NAMES = [
    'Garcia','Smith','Johnson','Brown','Williams','Jones','Miller','Davis','Rodriguez','Martinez',
    'Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin',
    'Lee','Perez','Thompson','White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson'
]

COLLEGE_PREFIX = 'C'
PROGRAM_PREFIX = 'P'

def generate_colleges(n=30):
    colleges = []
    for i in range(1, n+1):
        code = f"{COLLEGE_PREFIX}{i:02d}"
        name = f"College of {random.choice(['Computer Studies','Engineering','Business','Education','Arts','Science','Health','Management','Law','Agriculture'])} {i}"
        colleges.append((code, name))
    return colleges

def generate_programs(n=30, colleges=None):
    programs = []
    for i in range(1, n+1):
        code = f"{PROGRAM_PREFIX}{i:02d}"
        name = f"Program {i} in {random.choice(['Computer Science','Information Technology','Civil Engineering','Business Administration','Biology','Nursing','Psychology','Education','Accounting','Architecture'])}"
        college_code = random.choice(colleges)[0] if colleges else f"{COLLEGE_PREFIX}{random.randint(1,30):02d}"
        programs.append((code, name, college_code))
    return programs

def generate_students(n=300, programs=None):
    students = []
    for i in range(1, n+1):
        student_id = f"2025-{i:04d}"
        first_name = random.choice(FIRST_NAMES)
        last_name = random.choice(LAST_NAMES)
        gender = random.choices(['M','F','Others'], weights=[45,45,10], k=1)[0]
        program_code = random.choice(programs)[0] if programs else f"{PROGRAM_PREFIX}{random.randint(1,30):02d}"
        year_level = random.randint(1,5)
        profile_image_url = None
        students.append((student_id, first_name, last_name, gender, program_code, year_level, profile_image_url))
    return students


def insert_colleges(conn, colleges):
    sql = "INSERT INTO colleges (college_code, college_name) VALUES %s ON CONFLICT (college_code) DO NOTHING"
    with conn.cursor() as cur:
        execute_values(cur, sql, colleges)
    conn.commit()


def insert_programs(conn, programs):
    sql = "INSERT INTO programs (program_code, program_name, college_code) VALUES %s ON CONFLICT (program_code) DO NOTHING"
    with conn.cursor() as cur:
        execute_values(cur, sql, programs)
    conn.commit()


def insert_students(conn, students):
    sql = "INSERT INTO students (student_id, first_name, last_name, gender, program_code, year_level, profile_image_url) VALUES %s ON CONFLICT (student_id) DO NOTHING"
    with conn.cursor() as cur:
        execute_values(cur, sql, students)
    conn.commit()


def main():
    colleges = generate_colleges(30)
    programs = generate_programs(30, colleges)
    students = generate_students(300, programs)

    print(f"Generated {len(colleges)} colleges, {len(programs)} programs, {len(students)} students")

    try:
        conn = psycopg2.connect(CONN_STR)
        print('Connected to DB')
    except Exception as e:
        print('Failed to connect to DB:', e)
        sys.exit(1)

    try:
        insert_colleges(conn, colleges)
        print('Inserted colleges')
        insert_programs(conn, programs)
        print('Inserted programs')
        insert_students(conn, students)
        print('Inserted students')
    except Exception as e:
        print('Error inserting data:', e)
    finally:
        conn.close()

if __name__ == '__main__':
    main()
