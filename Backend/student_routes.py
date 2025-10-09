from flask import Blueprint, jsonify, request
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
import re

def init_student_routes(engine):
    student_bp = Blueprint('students', __name__)

    def validate_student_id_format(student_id):
        """Validate student ID format: YYYY-NNNN (e.g., 2024-0001)"""
        pattern = r'^\d{4}-\d{4}$'
        return re.match(pattern, student_id) is not None

    # ==================== GET ALL STUDENTS ====================
    @student_bp.route("/api/students", methods=["GET"])
    def get_students():
        """Get all students with optional sorting and search"""
        try:
            sort_order = request.args.get('sort', 'default')
            sort_by = request.args.get('sort_by', 'student_id')
            search_query = request.args.get('search', '').strip()
            
            valid_sort_columns = {
                'student_id': 's.student_id',
                'firstName': 's.first_name',
                'lastName': 's.last_name',
                'gender': 's.gender',
                'course': 's.program_code',
                'yearLevel': 's.year_level'
            }
            
            sort_column = valid_sort_columns.get(sort_by, 's.student_id')
            
            if sort_order == 'asc':
                order_clause = f"ORDER BY {sort_column} ASC"
            elif sort_order == 'desc':
                order_clause = f"ORDER BY {sort_column} DESC"
            else:
                order_clause = "ORDER BY s.student_id ASC"
            
            where_clause = ""
            params = {}
            
            if search_query:
                where_clause = """
                    WHERE (
                        LOWER(s.student_id) LIKE LOWER(:search) OR
                        LOWER(s.first_name) LIKE LOWER(:search) OR
                        LOWER(s.last_name) LIKE LOWER(:search) OR
                        LOWER(s.gender) LIKE LOWER(:search) OR
                        LOWER(s.program_code) LIKE LOWER(:search) OR
                        LOWER(p.program_name) LIKE LOWER(:search) OR
                        CAST(s.year_level AS TEXT) LIKE :search
                    )
                """
                params['search'] = f"%{search_query}%"
            
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
                    {where_clause}
                    {order_clause}
                """
                
                result = connection.execute(text(query), params)
                
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
            print(f"Error in get_students: {str(e)}")
            return jsonify({"error": str(e)}), 500

    # ==================== GET SINGLE STUDENT ====================
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
            print(f"Error in get_student: {str(e)}")
            return jsonify({"error": str(e)}), 500

    # ==================== ADD NEW STUDENT ====================
    @student_bp.route("/api/students", methods=["POST"])
    def add_student():
        """Add a new student to the database"""
        try:
            data = request.get_json()
            
            if not data:
                return jsonify({"error": "No data provided"}), 400
            
            required_fields = ["id", "firstName", "lastName", "gender", "course", "yearLevel"]
            missing_fields = [field for field in required_fields if field not in data or not str(data[field]).strip()]
            
            if missing_fields:
                return jsonify({
                    "error": f"Missing required fields: {', '.join(missing_fields)}"
                }), 400
            
            student_id = str(data["id"]).strip()
            first_name = str(data["firstName"]).strip()
            last_name = str(data["lastName"]).strip()
            gender = str(data["gender"]).strip()
            program_code = str(data["course"]).strip()
            
            # Validate student ID format
            if not validate_student_id_format(student_id):
                return jsonify({
                    "error": "Invalid Student ID format. Must be in format YYYY-NNNN (e.g., 2024-0001)"
                }), 400
            
            try:
                year_level = int(data["yearLevel"])
                if year_level < 1 or year_level > 5:
                    return jsonify({"error": "Year level must be between 1 and 5"}), 400
            except (ValueError, TypeError):
                return jsonify({"error": "Invalid year level format"}), 400
            
            if gender not in ['M', 'F', 'Others']:
                return jsonify({"error": "Gender must be M, F, or Others"}), 400
            
            if len(first_name) < 2:
                return jsonify({"error": "First name must be at least 2 characters"}), 400
            if len(last_name) < 2:
                return jsonify({"error": "Last name must be at least 2 characters"}), 400
            
            with engine.connect() as connection:
                check_result = connection.execute(
                    text("SELECT student_id FROM students WHERE student_id = :student_id"),
                    {"student_id": student_id}
                )
                if check_result.fetchone():
                    return jsonify({"error": f"Student ID '{student_id}' already exists"}), 409
                
                program_check = connection.execute(
                    text("SELECT program_code, program_name FROM programs WHERE program_code = :program_code"),
                    {"program_code": program_code}
                )
                program = program_check.fetchone()
                if not program:
                    return jsonify({"error": f"Invalid program code: {program_code}"}), 400
                
                connection.execute(text("""
                    INSERT INTO students (student_id, first_name, last_name, gender, program_code, year_level)
                    VALUES (:student_id, :first_name, :last_name, :gender, :program_code, :year_level)
                """), {
                    "student_id": student_id,
                    "first_name": first_name,
                    "last_name": last_name,
                    "gender": gender,
                    "program_code": program_code,
                    "year_level": year_level
                })
                connection.commit()
                
                print(f"✅ Successfully added student: {student_id} - {first_name} {last_name}")
                
                return jsonify({
                    "message": "Student added successfully",
                    "student": {
                        "id": student_id,
                        "firstName": first_name,
                        "lastName": last_name,
                        "gender": gender,
                        "course": program_code,
                        "yearLevel": year_level,
                        "courseName": program[1]
                    }
                }), 201
                
        except IntegrityError as e:
            print(f"❌ Database integrity error: {str(e)}")
            return jsonify({"error": "Database integrity error. Please check your data."}), 400
        except Exception as e:
            print(f"❌ Error in add_student: {str(e)}")
            return jsonify({"error": f"Server error: {str(e)}"}), 500

    # ==================== UPDATE STUDENT ====================
    @student_bp.route("/api/students/<old_student_id>", methods=["PUT"])
    def update_student(old_student_id):
        """Update an existing student - now allows changing student ID"""
        try:
            data = request.get_json()
            
            if not data:
                return jsonify({"error": "No data provided"}), 400
            
            required_fields = ["id", "firstName", "lastName", "gender", "course", "yearLevel"]
            missing_fields = [field for field in required_fields if field not in data or not str(data[field]).strip()]
            
            if missing_fields:
                return jsonify({
                    "error": f"Missing required fields: {', '.join(missing_fields)}"
                }), 400
            
            new_student_id = str(data["id"]).strip()
            first_name = str(data["firstName"]).strip()
            last_name = str(data["lastName"]).strip()
            gender = str(data["gender"]).strip()
            program_code = str(data["course"]).strip()
            
            # Validate new student ID format
            if not validate_student_id_format(new_student_id):
                return jsonify({
                    "error": "Invalid Student ID format. Must be in format YYYY-NNNN (e.g., 2024-0001)"
                }), 400
            
            try:
                year_level = int(data["yearLevel"])
                if year_level < 1 or year_level > 5:
                    return jsonify({"error": "Year level must be between 1 and 5"}), 400
            except (ValueError, TypeError):
                return jsonify({"error": "Invalid year level format"}), 400
            
            if gender not in ['M', 'F', 'Others']:
                return jsonify({"error": "Gender must be M, F, or Others"}), 400
            
            if len(first_name) < 2:
                return jsonify({"error": "First name must be at least 2 characters"}), 400
            if len(last_name) < 2:
                return jsonify({"error": "Last name must be at least 2 characters"}), 400
            
            with engine.connect() as connection:
                # Check if old student exists
                check_result = connection.execute(
                    text("SELECT student_id FROM students WHERE student_id = :student_id"),
                    {"student_id": old_student_id}
                )
                if not check_result.fetchone():
                    return jsonify({"error": "Student not found"}), 404
                
                # If student ID is changing, check if new ID already exists
                if old_student_id != new_student_id:
                    check_new_id = connection.execute(
                        text("SELECT student_id FROM students WHERE student_id = :student_id"),
                        {"student_id": new_student_id}
                    )
                    if check_new_id.fetchone():
                        return jsonify({"error": f"Student ID '{new_student_id}' already exists"}), 409
                
                # Check if program exists
                program_check = connection.execute(
                    text("SELECT program_code FROM programs WHERE program_code = :program_code"),
                    {"program_code": program_code}
                )
                if not program_check.fetchone():
                    return jsonify({"error": f"Invalid program code: {program_code}"}), 400
                
                # Update student (this handles both ID change and regular updates)
                if old_student_id != new_student_id:
                    # Delete old record and insert new one (to change primary key)
                    connection.execute(
                        text("DELETE FROM students WHERE student_id = :old_id"),
                        {"old_id": old_student_id}
                    )
                    connection.execute(text("""
                        INSERT INTO students (student_id, first_name, last_name, gender, program_code, year_level)
                        VALUES (:student_id, :first_name, :last_name, :gender, :program_code, :year_level)
                    """), {
                        "student_id": new_student_id,
                        "first_name": first_name,
                        "last_name": last_name,
                        "gender": gender,
                        "program_code": program_code,
                        "year_level": year_level
                    })
                    print(f"✅ Successfully updated student ID from {old_student_id} to {new_student_id}")
                else:
                    # Regular update
                    connection.execute(text("""
                        UPDATE students
                        SET first_name = :first_name,
                            last_name = :last_name,
                            gender = :gender,
                            program_code = :program_code,
                            year_level = :year_level
                        WHERE student_id = :student_id
                    """), {
                        "student_id": new_student_id,
                        "first_name": first_name,
                        "last_name": last_name,
                        "gender": gender,
                        "program_code": program_code,
                        "year_level": year_level
                    })
                    print(f"✅ Successfully updated student: {new_student_id}")
                
                connection.commit()
                
                return jsonify({"message": "Student updated successfully"}), 200
        except Exception as e:
            print(f"❌ Error in update_student: {str(e)}")
            return jsonify({"error": str(e)}), 500

    # ==================== DELETE STUDENT ====================
    @student_bp.route("/api/students/<student_id>", methods=["DELETE"])
    def delete_student(student_id):
        """Delete a student from the database"""
        try:
            with engine.connect() as connection:
                check_result = connection.execute(
                    text("SELECT student_id, first_name, last_name FROM students WHERE student_id = :student_id"),
                    {"student_id": student_id}
                )
                student = check_result.fetchone()
                
                if not student:
                    return jsonify({"error": "Student not found"}), 404
                
                connection.execute(
                    text("DELETE FROM students WHERE student_id = :student_id"),
                    {"student_id": student_id}
                )
                connection.commit()
                
                print(f"✅ Successfully deleted student: {student_id} - {student[1]} {student[2]}")
                
                return jsonify({
                    "message": f"Student {student[1]} {student[2]} (ID: {student_id}) deleted successfully"
                }), 200
        except Exception as e:
            print(f"❌ Error in delete_student: {str(e)}")
            return jsonify({"error": str(e)}), 500

    return student_bp