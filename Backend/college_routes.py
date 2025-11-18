from flask import Blueprint, jsonify, request
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError

def init_college_routes(engine):
    college_bp = Blueprint("colleges", __name__)

    # ==================== GET ALL COLLEGES ====================
    @college_bp.route("/api/colleges", methods=["GET"])
    def get_colleges():
        """Get all colleges with sorting and optional field-specific search"""
        try:
            sort_order = request.args.get("sort", "asc")
            sort_by = request.args.get("sort_by", "college_code")
            search_query = request.args.get("search", "").strip()
            search_field = request.args.get("search_field", "all")

            valid_sort_columns = {
                "college_code": "college_code",
                "college_name": "college_name"
            }
            sort_column = valid_sort_columns.get(sort_by, "college_code")

            if sort_order == "asc":
                order_clause = f"ORDER BY {sort_column} ASC"
            elif sort_order == "desc":
                order_clause = f"ORDER BY {sort_column} DESC"
            else:
                order_clause = "ORDER BY college_code ASC"

            where_clause = "WHERE college_code != 'N/A'"
            params = {}

            # Strict search by selected field
            if search_query:
                if search_field == "code":
                    where_clause += " AND LOWER(college_code) LIKE LOWER(:search)"
                elif search_field == "name":
                    where_clause += " AND LOWER(college_name) LIKE LOWER(:search)"
                else:  # all fields
                    where_clause += """
                        AND (
                            LOWER(college_code) LIKE LOWER(:search)
                            OR LOWER(college_name) LIKE LOWER(:search)
                        )
                    """
                params["search"] = f"%{search_query}%"

            with engine.connect() as connection:
                result = connection.execute(
                    text(f"""
                        SELECT college_code, college_name
                        FROM colleges
                        {where_clause}
                        {order_clause}
                    """),
                    params,
                )
                rows = result.fetchall()
                colleges = [{"code": r[0], "name": r[1]} for r in rows]
                return jsonify(colleges), 200

        except Exception as e:
            print(f"Error in get_colleges: {e}")
            return jsonify({"error": str(e)}), 500

    # ==================== GET SINGLE COLLEGE ====================
    @college_bp.route("/api/colleges/<college_code>", methods=["GET"])
    def get_college(college_code):
        """Get a single college by its code"""
        try:
            with engine.connect() as connection:
                result = connection.execute(
                    text("""
                        SELECT college_code, college_name
                        FROM colleges
                        WHERE college_code = :code
                    """),
                    {"code": college_code},
                ).fetchone()

                if not result:
                    return jsonify({"error": "College not found"}), 404

                return jsonify({
                    "code": result[0],
                    "name": result[1],
                }), 200

        except Exception as e:
            print(f"Error in get_college: {e}")
            return jsonify({"error": str(e)}), 500

    # ==================== ADD COLLEGE ====================
    @college_bp.route("/api/colleges", methods=["POST"])
    def add_college():
        """Add a new college"""
        try:
            data = request.get_json()
            if not data:
                return jsonify({"error": "No data provided"}), 400

            code = str(data.get("code", "")).strip().upper()
            name = str(data.get("name", "")).strip()

            if not code or not name:
                return jsonify({"error": "Both college code and name are required"}), 400
            if len(code) < 2:
                return jsonify({"error": "College code must be at least 2 characters"}), 400
            if len(name) < 3:
                return jsonify({"error": "College name must be at least 3 characters"}), 400

            with engine.connect() as connection:
                # Prevent duplicate
                exists = connection.execute(
                    text("SELECT college_code FROM colleges WHERE college_code = :code"),
                    {"code": code},
                ).first()
                if exists:
                    return jsonify({"error": f"College '{code}' already exists"}), 409

                # Insert new college
                connection.execute(
                    text("""
                        INSERT INTO colleges (college_code, college_name)
                        VALUES (:code, :name)
                    """),
                    {"code": code, "name": name},
                )
                connection.commit()

                return jsonify({
                    "message": "College added successfully",
                    "college": {"code": code, "name": name},
                }), 201

        except IntegrityError:
            return jsonify({"error": "Database integrity error"}), 400
        except Exception as e:
            print(f"Error in add_college: {e}")
            return jsonify({"error": str(e)}), 500

    # ==================== UPDATE COLLEGE ====================
    @college_bp.route("/api/colleges/<college_code>", methods=["PUT"])
    def update_college(college_code):
        """Update a college’s code and name"""
        try:
            data = request.get_json()
            if not data:
                return jsonify({"error": "No data provided"}), 400

            new_code = str(data.get("code", college_code)).strip().upper()
            name = str(data.get("name", "")).strip()

            if not name:
                return jsonify({"error": "College name is required"}), 400

            with engine.connect() as connection:
                existing = connection.execute(
                    text("SELECT college_code FROM colleges WHERE college_code = :code"),
                    {"code": college_code},
                ).fetchone()
                if not existing:
                    return jsonify({"error": "College not found"}), 404

                connection.execute(
                    text("""
                        UPDATE colleges
                        SET college_code = :new_code,
                            college_name = :name
                        WHERE college_code = :old_code
                    """),
                    {"new_code": new_code, "name": name, "old_code": college_code},
                )

                # Update associated programs
                if new_code != college_code:
                    connection.execute(
                        text("""
                            UPDATE programs
                            SET college_code = :new_code
                            WHERE college_code = :old_code
                        """),
                        {"new_code": new_code, "old_code": college_code},
                    )

                connection.commit()
                return jsonify({"message": "College updated successfully"}), 200

        except Exception as e:
            print(f"Error in update_college: {e}")
            return jsonify({"error": str(e)}), 500

    # ==================== DELETE COLLEGE ====================
    @college_bp.route("/api/colleges/<college_code>", methods=["DELETE"])
    def delete_college(college_code):
        """Delete a college and reassign its programs to the 'N/A' college"""
        try:
            with engine.connect() as connection:
                # Ensure 'N/A' college exists
                connection.execute(
                    text("""
                        INSERT INTO colleges (college_code, college_name)
                        SELECT 'N/A', 'No College Assigned'
                        WHERE NOT EXISTS (
                            SELECT 1 FROM colleges WHERE college_code = 'N/A'
                        )
                    """)
                )

                # Check if the target college exists
                college = connection.execute(
                    text("SELECT college_code FROM colleges WHERE college_code = :code"),
                    {"code": college_code},
                ).fetchone()
                if not college:
                    return jsonify({"error": "College not found"}), 404

                # Reassign programs under this college to 'N/A'
                connection.execute(
                    text("""
                        UPDATE programs
                        SET college_code = 'N/A'
                        WHERE college_code = :code
                    """),
                    {"code": college_code},
                )

                # Delete the college
                connection.execute(
                    text("DELETE FROM colleges WHERE college_code = :code"),
                    {"code": college_code},
                )

                connection.commit()

                return jsonify({
                    "message": f"College '{college_code}' deleted. Associated programs set to 'N/A'."
                }), 200

        except Exception as e:
            print(f"Error in delete_college: {e}")
            return jsonify({"error": str(e)}), 500

    return college_bp
