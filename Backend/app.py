from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlalchemy import create_engine, text
from sqlalchemy.pool import NullPool
from dotenv import load_dotenv
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Load environment variables from .env
load_dotenv()

# Fetch variables
USER = os.getenv("user")
PASSWORD = os.getenv("password")
HOST = os.getenv("host")
PORT = os.getenv("port")
DBNAME = os.getenv("dbname")

# Construct the SQLAlchemy connection string
DATABASE_URL = f"postgresql+psycopg2://{USER}:{PASSWORD}@{HOST}:{PORT}/{DBNAME}?sslmode=require"

# Create the SQLAlchemy engine
# If using Transaction Pooler or Session Pooler, we want to ensure we disable SQLAlchemy client side pooling
# https://docs.sqlalchemy.org/en/20/core/pooling.html#switching-pool-implementations
engine = create_engine(DATABASE_URL, poolclass=NullPool)

@app.route("/")
def index():
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT NOW();"))
            current_time = result.scalar()  # get single value
            return f"<h3>Connection successful!</h3><p>Current Time: {current_time}</p>"
    except Exception as e:
        return f"<h3>Failed to connect:</h3><pre>{e}</pre>"

# ==================== STUDENT ROUTES ====================

@app.route("/api/students", methods=["GET"])
def get_students():
    """Get all students"""
    try:
        with engine.connect() as connection:
            result = connection.execute(text("""
                SELECT student_id, first_name, last_name, gender, program_code, year_level 
                FROM students
                ORDER BY student_id
            """))
            students = []
            for row in result:
                students.append({
                    "id": row[0],
                    "firstName": row[1],
                    "lastName": row[2],
                    "gender": row[3],
                    "course": row[4],
                    "yearLevel": row[5]
                })
            return jsonify(students), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/students", methods=["POST"])
def add_student():
    """Add a new student"""
    try:
        data = request.json
        with engine.connect() as connection:
            connection.execute(text("""
                INSERT INTO students (student_id, first_name, last_name, gender, program_code, year_level)
                VALUES (:id, :firstName, :lastName, :gender, :course, :yearLevel)
            """), {
                "id": data["id"],
                "firstName": data["firstName"],
                "lastName": data["lastName"],
                "gender": data["gender"],
                "course": data["course"],
                "yearLevel": data["yearLevel"]
            })
            connection.commit()
        return jsonify({"message": "Student added successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/students/<student_id>", methods=["PUT"])
def update_student(student_id):
    """Update an existing student"""
    try:
        data = request.json
        with engine.connect() as connection:
            connection.execute(text("""
                UPDATE students 
                SET first_name = :firstName,
                    last_name = :lastName,
                    gender = :gender,
                    program_code = :course,
                    year_level = :yearLevel
                WHERE student_id = :id
            """), {
                "id": student_id,
                "firstName": data["firstName"],
                "lastName": data["lastName"],
                "gender": data["gender"],
                "course": data["course"],
                "yearLevel": data["yearLevel"]
            })
            connection.commit()
        return jsonify({"message": "Student updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/students/<student_id>", methods=["DELETE"])
def delete_student(student_id):
    """Delete a student"""
    try:
        with engine.connect() as connection:
            connection.execute(text("""
                DELETE FROM students WHERE student_id = :id
            """), {"id": student_id})
            connection.commit()
        return jsonify({"message": "Student deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==================== PROGRAM ROUTES ====================

@app.route("/api/programs", methods=["GET"])
def get_programs():
    """Get all programs"""
    try:
        with engine.connect() as connection:
            result = connection.execute(text("""
                SELECT program_code, program_name, college_code 
                FROM programs
                ORDER BY program_code
            """))
            programs = []
            for row in result:
                programs.append({
                    "code": row[0],
                    "name": row[1],
                    "college": row[2]
                })
            return jsonify(programs), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==================== COLLEGE ROUTES ====================

@app.route("/api/colleges", methods=["GET"])
def get_colleges():
    """Get all colleges"""
    try:
        with engine.connect() as connection:
            result = connection.execute(text("""
                SELECT college_code, college_name 
                FROM colleges
                ORDER BY college_code
            """))
            colleges = []
            for row in result:
                colleges.append({
                    "code": row[0],
                    "name": row[1]
                })
            return jsonify(colleges), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)