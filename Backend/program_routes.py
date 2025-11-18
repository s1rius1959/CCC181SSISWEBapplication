from flask import Blueprint, jsonify, request
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError

def init_program_routes(engine):
    program_bp = Blueprint("programs", __name__)

    # ==================== GET ALL PROGRAMS ====================
    @program_bp.route("/api/programs", methods=["GET"])
    def get_programs():
        """Get all programs with optional sorting and field-specific search"""
        try:
            sort_order = request.args.get("sort", "default")
            sort_by = request.args.get("sort_by", "program_code")
            search_query = request.args.get("search", "").strip()
            search_field = request.args.get("search_field", "all")

            valid_sort_columns = {
                "program_code": "program_code",
                "program_name": "program_name",
                "college_code": "college_code"
            }
            sort_column = valid_sort_columns.get(sort_by, "program_code")

            # Sorting
            if sort_order == "asc":
                order_clause = f"ORDER BY {sort_column} ASC"
            elif sort_order == "desc":
                order_clause = f"ORDER BY {sort_column} DESC"
            else:
                order_clause = "ORDER BY program_code ASC"

            where_clause = "WHERE program_code != 'N/A'"
            params = {}

            # Field-specific search
            if search_query:
                if search_field == "program_code":
                    where_clause += " AND LOWER(program_code) = LOWER(:search)"
                    params["search"] = search_query
                elif search_field == "program_name":
                    where_clause += " AND LOWER(program_name) LIKE LOWER(:search)"
                    params["search"] = f"%{search_query}%"
                elif search_field == "college_code":
                    where_clause += " AND LOWER(college_code) = LOWER(:search)"
                    params["search"] = search_query
                else:
                    # 'all' - search across all
                    where_clause += """
                        AND (
                            LOWER(program_code) LIKE LOWER(:search)
                            OR LOWER(program_name) LIKE LOWER(:search)
                            OR LOWER(college_code) LIKE LOWER(:search)
                        )
                    """
                    params["search"] = f"%{search_query}%"

            with engine.connect() as connection:
                result = connection.execute(
                    text(f"""
                        SELECT program_code, program_name, college_code
                        FROM programs
                        {where_clause}
                        {order_clause}
                    """),
                    params,
                )
                rows = result.fetchall()
                programs = [
                    {"code": r[0], "name": r[1], "collegeCode": r[2]}
                    for r in rows
                ]
                return jsonify(programs), 200

        except Exception as e:
            print(f"Error in get_programs: {e}")
            return jsonify({"error": str(e)}), 500

    # ==================== GET SINGLE PROGRAM ====================
    @program_bp.route("/api/programs/<program_code>", methods=["GET"])
    def get_program(program_code):
        try:
            with engine.connect() as connection:
                result = connection.execute(
                    text("""
                        SELECT program_code, program_name, college_code
                        FROM programs
                        WHERE program_code = :code
                    """),
                    {"code": program_code},
                ).fetchone()

                if not result:
                    return jsonify({"error": "Program not found"}), 404

                return jsonify({
                    "code": result[0],
                    "name": result[1],
                    "collegeCode": result[2],
                }), 200
        except Exception as e:
            print(f"Error in get_program: {e}")
            return jsonify({"error": str(e)}), 500

    # ==================== ADD PROGRAM ====================
    @program_bp.route("/api/programs", methods=["POST"])
    def add_program():
        try:
            data = request.get_json()
            if not data:
                return jsonify({"error": "No data provided"}), 400

            required_fields = ["code", "name", "college"]
            missing = [f for f in required_fields if f not in data or not str(data[f]).strip()]
            if missing:
                return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

            code = str(data["code"]).strip()
            name = str(data["name"]).strip()
            college_code = str(data["college"]).strip()

            with engine.connect() as connection:
                # Validate duplicates
                exists = connection.execute(
                    text("SELECT 1 FROM programs WHERE program_code = :code"),
                    {"code": code},
                ).first()
                if exists:
                    return jsonify({"error": f"Program '{code}' already exists"}), 409

                # Validate college exists
                valid_college = connection.execute(
                    text("SELECT 1 FROM colleges WHERE college_code = :code"),
                    {"code": college_code},
                ).first()
                if not valid_college:
                    return jsonify({"error": f"Invalid college code: {college_code}"}), 400

                connection.execute(
                    text("""
                        INSERT INTO programs (program_code, program_name, college_code)
                        VALUES (:code, :name, :college_code)
                    """),
                    {"code": code, "name": name, "college_code": college_code},
                )
                connection.commit()
                return jsonify({"message": "Program added successfully"}), 201
        except Exception as e:
            print(f"Error in add_program: {e}")
            return jsonify({"error": str(e)}), 500

    # ==================== UPDATE PROGRAM ====================
    @program_bp.route("/api/programs/<program_code>", methods=["PUT"])
    def update_program(program_code):
        try:
            data = request.get_json()
            if not data:
                return jsonify({"error": "No data provided"}), 400

            new_code = str(data.get("code", program_code)).strip()
            name = str(data.get("name", "")).strip()
            college_code = str(data.get("college", "")).strip()

            if not name:
                return jsonify({"error": "Program name is required"}), 400

            with engine.connect() as connection:
                existing = connection.execute(
                    text("SELECT college_code FROM programs WHERE program_code = :code"),
                    {"code": program_code},
                ).fetchone()
                if not existing:
                    return jsonify({"error": "Program not found"}), 404

                if not college_code:
                    college_code = existing[0]

                connection.execute(
                    text("""
                        UPDATE programs
                        SET program_code = :new_code,
                            program_name = :name,
                            college_code = :college_code
                        WHERE program_code = :old_code
                    """),
                    {
                        "new_code": new_code,
                        "name": name,
                        "college_code": college_code,
                        "old_code": program_code,
                    },
                )

                # Update students if code changed
                if new_code != program_code:
                    connection.execute(
                        text("""
                            UPDATE students
                            SET program_code = :new_code
                            WHERE program_code = :old_code
                        """),
                        {"new_code": new_code, "old_code": program_code},
                    )

                connection.commit()
                return jsonify({"message": "Program updated successfully"}), 200
        except Exception as e:
            print(f"Error in update_program: {e}")
            return jsonify({"error": str(e)}), 500

    # ==================== DELETE PROGRAM ====================
    @program_bp.route("/api/programs/<program_code>", methods=["DELETE"])
    def delete_program(program_code):
        try:
            with engine.connect() as connection:
                program = connection.execute(
                    text("SELECT 1 FROM programs WHERE program_code = :code"),
                    {"code": program_code},
                ).fetchone()
                if not program:
                    return jsonify({"error": "Program not found"}), 404

                # Reassign students to 'N/A'
                connection.execute(
                    text("""
                        UPDATE students
                        SET program_code = 'N/A'
                        WHERE program_code = :code
                    """),
                    {"code": program_code},
                )

                connection.execute(
                    text("DELETE FROM programs WHERE program_code = :code"),
                    {"code": program_code},
                )
                connection.commit()

                return jsonify({"message": "Program deleted successfully"}), 200
        except Exception as e:
            print(f"Error in delete_program: {e}")
            return jsonify({"error": str(e)}), 500

    return program_bp
