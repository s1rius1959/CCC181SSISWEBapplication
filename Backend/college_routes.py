from flask import Blueprint, jsonify, request
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError

def init_college_routes(engine):
    college_bp = Blueprint("colleges", __name__)

    # ==================== GET ALL COLLEGES ====================
    @college_bp.route("/api/colleges", methods=["GET"])
    def get_colleges():
        """Get all colleges with optional sorting and search"""
        try:
            sort_order = request.args.get("sort", "default")
            sort_by = request.args.get("sort_by", "college_code")
            search_query = request.args.get("search", "").strip()

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

            where_clause = "WHERE college_code != 'N/A'"  # ✅ Exclude N/A
            params = {}
            
            if search_query:
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
            print(f"❌ Error in get_colleges: {e}")
            return jsonify({"error": str(e)}), 500

    # ==================== GET SINGLE COLLEGE ====================
    @college_bp.route("/api/colleges/<college_code>", methods=["GET"])
    def get_college(college_code):
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

                return jsonify({"code": result[0], "name": result[1]}), 200

        except Exception as e:
            print(f"❌ Error in get_college: {e}")
            return jsonify({"error": str(e)}), 500

    # ==================== ADD COLLEGE ====================
    @college_bp.route("/api/colleges", methods=["POST"])
    def add_college():
        try:
            data = request.get_json()
            if not data:
                return jsonify({"error": "No data provided"}), 400

            required_fields = ["code", "name"]
            missing = [f for f in required_fields if f not in data or not str(data[f]).strip()]
            if missing:
                return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

            code = str(data["code"]).strip().upper()
            name = str(data["name"]).strip()

            if len(code) < 2:
                return jsonify({"error": "College code must be at least 2 characters"}), 400
            if len(name) < 3:
                return jsonify({"error": "College name must be at least 3 characters"}), 400

            with engine.connect() as connection:
                exists = connection.execute(
                    text("SELECT college_code FROM colleges WHERE college_code = :code"),
                    {"code": code},
                ).first()
                if exists:
                    return jsonify({"error": f"College code '{code}' already exists"}), 409

                connection.execute(
                    text("INSERT INTO colleges (college_code, college_name) VALUES (:code, :name)"),
                    {"code": code, "name": name},
                )
                connection.commit()

                print(f"✅ Successfully added college: {code} - {name}")

                return jsonify({
                    "message": "College added successfully",
                    "college": {"code": code, "name": name},
                }), 201

        except IntegrityError:
            return jsonify({"error": "Database integrity error"}), 400
        except Exception as e:
            print(f"❌ Error in add_college: {e}")
            return jsonify({"error": str(e)}), 500

    # ==================== UPDATE COLLEGE (CASCADE) ====================
    @college_bp.route("/api/colleges/<old_college_code>", methods=["PUT"])
    def update_college(old_college_code):
        """Update college - safely cascades college code to programs without violating FK"""
        try:
            data = request.get_json()
            if not data:
                return jsonify({"error": "No data provided"}), 400

            required_fields = ["code", "name"]
            missing = [f for f in required_fields if f not in data or not str(data[f]).strip()]
            if missing:
                return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

            new_code = str(data["code"]).strip().upper()
            name = str(data["name"]).strip()

            if len(new_code) < 2:
                return jsonify({"error": "College code must be at least 2 characters"}), 400
            if len(name) < 3:
                return jsonify({"error": "College name must be at least 3 characters"}), 400

            with engine.begin() as connection:
                # Check if old college exists
                old_college = connection.execute(
                    text("SELECT college_code FROM colleges WHERE college_code = :code"),
                    {"code": old_college_code},
                ).first()
                if not old_college:
                    return jsonify({"error": "College not found"}), 404

                # If changing the college code
                if old_college_code != new_code:
                    # Check if new code already exists
                    code_exists = connection.execute(
                        text("SELECT college_code FROM colleges WHERE college_code = :code"),
                        {"code": new_code},
                    ).first()
                    if code_exists:
                        return jsonify({"error": f"College code '{new_code}' already exists"}), 409

                    # 1️⃣ Insert new college code first (for FK integrity)
                    connection.execute(
                        text("""
                            INSERT INTO colleges (college_code, college_name)
                            VALUES (:new_code, :name)
                        """),
                        {"new_code": new_code, "name": name},
                    )

                    # 2️⃣ Update programs to point to new college code
                    connection.execute(
                        text("""
                            UPDATE programs
                            SET college_code = :new_code
                            WHERE college_code = :old_code
                        """),
                        {"new_code": new_code, "old_code": old_college_code},
                    )

                    # 3️⃣ Delete old college entry
                    connection.execute(
                        text("DELETE FROM colleges WHERE college_code = :code"),
                        {"code": old_college_code},
                    )

                    print(f"✅ College code cascaded from {old_college_code} → {new_code}")
                else:
                    # Only update college name
                    connection.execute(
                        text("UPDATE colleges SET college_name = :name WHERE college_code = :code"),
                        {"name": name, "code": new_code},
                    )
                    print(f"✅ Updated college name for {new_code}")

            return jsonify({"message": "College updated successfully"}), 200

        except Exception as e:
            print(f"❌ Error in update_college: {e}")
            return jsonify({"error": str(e)}), 500

    # ==================== DELETE COLLEGE ====================
    @college_bp.route("/api/colleges/<college_code>", methods=["DELETE"])
    def delete_college(college_code):
        try:
            with engine.connect() as connection:
                college = connection.execute(
                    text("SELECT college_code, college_name FROM colleges WHERE college_code = :code"),
                    {"code": college_code},
                ).fetchone()
                if not college:
                    return jsonify({"error": "College not found"}), 404

                has_programs = connection.execute(
                    text("SELECT COUNT(*) FROM programs WHERE college_code = :code"),
                    {"code": college_code},
                ).scalar()
                if has_programs > 0:
                    return jsonify({
                        "error": "Cannot delete college. It has associated programs."
                    }), 409

                connection.execute(
                    text("DELETE FROM colleges WHERE college_code = :code"),
                    {"code": college_code},
                )
                connection.commit()

                print(f"✅ Successfully deleted college: {college_code} - {college[1]}")

                return jsonify({"message": f"College {college[1]} deleted successfully"}), 200

        except Exception as e:
            print(f"❌ Error in delete_college: {e}")
            return jsonify({"error": str(e)}), 500

    return college_bp