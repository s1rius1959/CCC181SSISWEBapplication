from flask import Blueprint, jsonify, request
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError

def init_student_routes(engine):
    student_bp = Blueprint("students", __name__)

    # ==================== GET ALL STUDENTS ====================
    @student_bp.route("/api/students", methods=["GET"])
    def get_students():
        """Fetch all students with optional sorting and field-specific search"""
        try:
            sort_order = request.args.get("sort", "default")
            sort_by = request.args.get("sort_by", "student_id")
            search_query = request.args.get("search", "").strip()
            search_field = request.args.get("search_field", "all")

            valid_sort_columns = {
                "id": "student_id",
                "student_id": "student_id",
                "first_name": "first_name",
                "last_name": "last_name",
                "gender": "gender",
                "program_code": "program_code",
                "year_level": "year_level"
            }
            sort_column = valid_sort_columns.get(sort_by, "student_id")

            # Sorting clause
            if sort_order == "asc":
                order_clause = f"ORDER BY {sort_column} ASC"
            elif sort_order == "desc":
                order_clause = f"ORDER BY {sort_column} DESC"
            else:
                order_clause = "ORDER BY student_id ASC"

            where_clause = "WHERE student_id IS NOT NULL"
            params = {}

            # Field-specific search
            if search_query:
                if search_field == "student_id" or search_field == "id":
                    where_clause += " AND LOWER(student_id) = LOWER(:search)"
                    params["search"] = search_query
                elif search_field == "first_name":
                    where_clause += " AND LOWER(first_name) LIKE LOWER(:search)"
                    params["search"] = f"%{search_query}%"
                elif search_field == "last_name":
                    where_clause += " AND LOWER(last_name) LIKE LOWER(:search)"
                    params["search"] = f"%{search_query}%"
                elif search_field == "gender":
                    where_clause += " AND LOWER(gender) = LOWER(:search)"
                    params["search"] = search_query
                elif search_field == "program_code" or search_field == "course":
                    where_clause += " AND LOWER(program_code) = LOWER(:search)"
                    params["search"] = search_query
                elif search_field == "year_level":
                    where_clause += " AND CAST(year_level AS TEXT) = :search"
                    params["search"] = search_query
                else:
                    # 'all' search (fuzzy match across all columns)
                    where_clause += """
                        AND (
                            LOWER(student_id) LIKE LOWER(:search)
                            OR LOWER(first_name) LIKE LOWER(:search)
                            OR LOWER(last_name) LIKE LOWER(:search)
                            OR LOWER(gender) LIKE LOWER(:search)
                            OR LOWER(program_code) LIKE LOWER(:search)
                            OR CAST(year_level AS TEXT) LIKE :search
                        )
                    """
                    params["search"] = f"%{search_query}%"

            with engine.connect() as connection:
                result = connection.execute(
                    text(f"""
                        SELECT student_id, first_name, last_name, gender, program_code, year_level
                        FROM students
                        {where_clause}
                        {order_clause}
                    """),
                    params
                )
                rows = result.fetchall()
                students = [
                    {
                        "id": r[0],
                        "firstName": r[1],
                        "lastName": r[2],
                        "gender": r[3],
                        "course": r[4],
                        "yearLevel": r[5]
                    }
                    for r in rows
                ]
                return jsonify(students), 200
        except Exception as e:
            print(f"❌ Error in get_students: {e}")
            return jsonify({"error": str(e)}), 500

    # ==================== GET SINGLE STUDENT ====================
    @student_bp.route("/api/students/<student_id>", methods=["GET"])
    def get_student(student_id):
        try:
            with engine.connect() as connection:
                result = connection.execute(
                    text("""
                        SELECT student_id, first_name, last_name, gender, program_code, year_level
                        FROM students
                        WHERE student_id = :id
                    """),
                    {"id": student_id}
                ).fetchone()

                if not result:
                    return jsonify({"error": "Student not found"}), 404

                return jsonify({
                    "id": result[0],
                    "firstName": result[1],
                    "lastName": result[2],
                    "gender": result[3],
                    "course": result[4],
                    "yearLevel": result[5]
                }), 200
        except Exception as e:
            print(f"❌ Error in get_student: {e}")
            return jsonify({"error": str(e)}), 500

    # ==================== ADD STUDENT ====================
    @student_bp.route("/api/students", methods=["POST"])
    def add_student():
        """Add a new student"""
        try:
            data = request.get_json()
            if not data:
                return jsonify({"error": "No data provided"}), 400

            required_fields = ["id", "firstName", "lastName", "gender", "course", "yearLevel"]
            missing = [f for f in required_fields if f not in data or not str(data[f]).strip()]
            if missing:
                return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

            student_id = str(data["id"]).strip()
            first_name = str(data["firstName"]).strip()
            last_name = str(data["lastName"]).strip()
            gender = str(data["gender"]).strip()
            course = str(data["course"]).strip()
            year_level = int(data["yearLevel"])

            with engine.connect() as connection:
                # Check duplicate ID
                exists = connection.execute(
                    text("SELECT 1 FROM students WHERE student_id = :id"),
                    {"id": student_id}
                ).first()
                if exists:
                    return jsonify({"error": f"Student ID '{student_id}' already exists"}), 409

                # Validate program
                valid_program = connection.execute(
                    text("SELECT 1 FROM programs WHERE program_code = :code"),
                    {"code": course}
                ).first()
                if not valid_program:
                    return jsonify({"error": f"Invalid program code: {course}"}), 400

                connection.execute(
                    text("""
                        INSERT INTO students (student_id, first_name, last_name, gender, program_code, year_level)
                        VALUES (:id, :first, :last, :gender, :course, :year)
                    """),
                    {
                        "id": student_id,
                        "first": first_name,
                        "last": last_name,
                        "gender": gender,
                        "course": course,
                        "year": year_level
                    }
                )
                connection.commit()
                return jsonify({"message": "Student added successfully"}), 201
        except Exception as e:
            print(f"❌ Error in add_student: {e}")
            return jsonify({"error": str(e)}), 500

    # ==================== UPDATE STUDENT ====================
    @student_bp.route("/api/students/<student_id>", methods=["PUT"])
    def update_student(student_id):
        """Update student information"""
        try:
            data = request.get_json()
            if not data:
                return jsonify({"error": "No data provided"}), 400

            new_id = str(data.get("id", student_id)).strip()
            first_name = str(data.get("firstName", "")).strip()
            last_name = str(data.get("lastName", "")).strip()
            gender = str(data.get("gender", "")).strip()
            course = str(data.get("course", "")).strip()
            year_level = str(data.get("yearLevel", "")).strip()

            with engine.connect() as connection:
                existing = connection.execute(
                    text("SELECT 1 FROM students WHERE student_id = :id"),
                    {"id": student_id}
                ).fetchone()
                if not existing:
                    return jsonify({"error": "Student not found"}), 404

                connection.execute(
                    text("""
                        UPDATE students
                        SET student_id = :new_id,
                            first_name = :first,
                            last_name = :last,
                            gender = :gender,
                            program_code = :course,
                            year_level = :year
                        WHERE student_id = :old_id
                    """),
                    {
                        "new_id": new_id,
                        "first": first_name,
                        "last": last_name,
                        "gender": gender,
                        "course": course,
                        "year": year_level,
                        "old_id": student_id
                    }
                )
                connection.commit()
                return jsonify({"message": "Student updated successfully"}), 200
        except Exception as e:
            print(f"❌ Error in update_student: {e}")
            return jsonify({"error": str(e)}), 500

    # ==================== DELETE STUDENT ====================
    @student_bp.route("/api/students/<student_id>", methods=["DELETE"])
    def delete_student(student_id):
        """Delete a student"""
        try:
            with engine.connect() as connection:
                student = connection.execute(
                    text("SELECT 1 FROM students WHERE student_id = :id"),
                    {"id": student_id}
                ).fetchone()
                if not student:
                    return jsonify({"error": "Student not found"}), 404

                connection.execute(
                    text("DELETE FROM students WHERE student_id = :id"),
                    {"id": student_id}
                )
                connection.commit()
                return jsonify({"message": "Student deleted successfully"}), 200
        except Exception as e:
            print(f"❌ Error in delete_student: {e}")
            return jsonify({"error": str(e)}), 500

    return student_bp
