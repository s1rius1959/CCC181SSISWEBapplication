from flask import Blueprint, jsonify, request
from sqlalchemy import text

def init_student_routes(engine):
    student_bp = Blueprint('students', __name__)

    # ==================== STUDENT ROUTES ====================
    
    @student_bp.route("/api/students", methods=["GET"])
    def get_students():
        """Get all students with their program information with optional sorting"""
        try:
            # Get sort parameters from query string
            sort_order = request.args.get('sort', 'default')  # default, asc, desc
            sort_by = request.args.get('sort_by', 'student_id')  # Column to sort by
            
            # Validate sort_by to prevent SQL injection
            valid_sort_columns = {
                'student_id': 's.student_id',
                'firstName': 's.first_name',
                'lastName': 's.last_name',
                'gender': 's.gender',
                'course': 's.program_code',
                'yearLevel': 's.year_level'
            }
            
            # Default to student_id if invalid column
            sort_column = valid_sort_columns.get(sort_by, 's.student_id')
            
            # Determine ORDER BY clause
            if sort_order == 'asc':
                order_clause = f"ORDER BY {sort_column} ASC"
            elif sort_order == 'desc':
                order_clause = f"ORDER BY {sort_column} DESC"
            else:  # default
                order_clause = "ORDER BY s.student_id ASC"
            
            with engine.connect() as connection:
                query = f"""
                    SELECT 
                        s.student_id,
                        s.first_name,
                        s.last_name,
                        s.gender,
                        s.program_code,
                        s.year_level,
                        p.program_name
                    FROM students s
                    LEFT JOIN programs p ON s.program_code = p.program_code
                    {order_clause}
                """
                
                result = connection.execute(text(query))
                
                students = []
                for row in result:
                    students.append({
                        "id": row[0],
                        "firstName": row[1],
                        "lastName": row[2],
                        "gender": row[3],
                        "course": row[4],
                        "yearLevel": row[5],
                        "courseName": row[6]
                    })
                
                return jsonify(students), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @student_bp.route("/api/students/<student_id>", methods=["GET"])
    def get_student(student_id):
        """Get a single student by ID"""
        try:
            with engine.connect() as connection:
                result = connection.execute(text("""
                    SELECT 
                        s.student_id,
                        s.first_name,
                        s.last_name,
                        s.gender,
                        s.program_code,
                        s.year_level,
                        p.program_name
                    FROM students s
                    LEFT JOIN programs p ON s.program_code = p.program_code
                    WHERE s.student_id = :student_id
                """), {"student_id": student_id})
                
                row = result.fetchone()
                if row:
                    student = {
                        "id": row[0],
                        "firstName": row[1],
                        "lastName": row[2],
                        "gender": row[3],
                        "course": row[4],
                        "yearLevel": row[5],
                        "courseName": row[6]
                    }
                    return jsonify(student), 200
                else:
                    return jsonify({"error": "Student not found"}), 404
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @student_bp.route("/api/students", methods=["POST"])
    def add_student():
        """Add a new student"""
        try:
            data = request.get_json()
            
            # Validate required fields
            required_fields = ["id", "firstName", "lastName", "gender", "course", "yearLevel"]
            for field in required_fields:
                if field not in data or not data[field]:
                    return jsonify({"error": f"Missing required field: {field}"}), 400
            
            with engine.connect() as connection:
                # Check if student ID already exists
                check_result = connection.execute(
                    text("SELECT student_id FROM students WHERE student_id = :student_id"),
                    {"student_id": data["id"]}
                )
                if check_result.fetchone():
                    return jsonify({"error": "Student ID already exists"}), 409
                
                # Check if program exists
                program_check = connection.execute(
                    text("SELECT program_code FROM programs WHERE program_code = :program_code"),
                    {"program_code": data["course"]}
                )
                if not program_check.fetchone():
                    return jsonify({"error": "Invalid program code"}), 400
                
                # Insert new student
                connection.execute(text("""
                    INSERT INTO students (student_id, first_name, last_name, gender, program_code, year_level)
                    VALUES (:student_id, :first_name, :last_name, :gender, :program_code, :year_level)
                """), {
                    "student_id": data["id"],
                    "first_name": data["firstName"],
                    "last_name": data["lastName"],
                    "gender": data["gender"],
                    "program_code": data["course"],
                    "year_level": int(data["yearLevel"])
                })
                connection.commit()
                
                return jsonify({"message": "Student added successfully", "id": data["id"]}), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @student_bp.route("/api/students/<student_id>", methods=["PUT"])
    def update_student(student_id):
        """Update an existing student"""
        try:
            data = request.get_json()
            
            # Validate required fields
            required_fields = ["firstName", "lastName", "gender", "course", "yearLevel"]
            for field in required_fields:
                if field not in data or not data[field]:
                    return jsonify({"error": f"Missing required field: {field}"}), 400
            
            with engine.connect() as connection:
                # Check if student exists
                check_result = connection.execute(
                    text("SELECT student_id FROM students WHERE student_id = :student_id"),
                    {"student_id": student_id}
                )
                if not check_result.fetchone():
                    return jsonify({"error": "Student not found"}), 404
                
                # Check if program exists
                program_check = connection.execute(
                    text("SELECT program_code FROM programs WHERE program_code = :program_code"),
                    {"program_code": data["course"]}
                )
                if not program_check.fetchone():
                    return jsonify({"error": "Invalid program code"}), 400
                
                # Update student
                connection.execute(text("""
                    UPDATE students
                    SET first_name = :first_name,
                        last_name = :last_name,
                        gender = :gender,
                        program_code = :program_code,
                        year_level = :year_level
                    WHERE student_id = :student_id
                """), {
                    "student_id": student_id,
                    "first_name": data["firstName"],
                    "last_name": data["lastName"],
                    "gender": data["gender"],
                    "program_code": data["course"],
                    "year_level": int(data["yearLevel"])
                })
                connection.commit()
                
                return jsonify({"message": "Student updated successfully"}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @student_bp.route("/api/students/<student_id>", methods=["DELETE"])
    def delete_student(student_id):
        """Delete a student"""
        try:
            with engine.connect() as connection:
                # Check if student exists
                check_result = connection.execute(
                    text("SELECT student_id FROM students WHERE student_id = :student_id"),
                    {"student_id": student_id}
                )
                if not check_result.fetchone():
                    return jsonify({"error": "Student not found"}), 404
                
                # Delete student
                connection.execute(
                    text("DELETE FROM students WHERE student_id = :student_id"),
                    {"student_id": student_id}
                )
                connection.commit()
                
                return jsonify({"message": "Student deleted successfully"}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    return student_bp