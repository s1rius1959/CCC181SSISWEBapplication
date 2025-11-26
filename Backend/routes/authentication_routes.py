from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import text
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

def init_auth_routes(engine):

    # ---------- SIGNUP ----------
    @auth_bp.route("/signup", methods=["POST", "OPTIONS"])
    def signup():
        # Preflight CORS
        if request.method == "OPTIONS":
            return jsonify({"status": "ok"}), 200

        data = request.get_json()
        email = data.get("email")
        password = data.get("password")
        confirm_password = data.get("confirm_password")
        first_name = data.get("first_name", "").strip()
        last_name = data.get("last_name", "").strip()

        if not email or not password or not confirm_password:
            return jsonify({"error": "All fields are required"}), 400

        if not first_name or not last_name:
            return jsonify({"error": "First name and last name are required"}), 400

        if password != confirm_password:
            return jsonify({"error": "Passwords do not match"}), 400

        if len(password) < 6:
            return jsonify({"error": "Password must be at least 6 characters"}), 400

        password_hash = generate_password_hash(password)

        try:
            with engine.connect() as conn:
                existing = conn.execute(
                    text("SELECT email FROM users WHERE email=:email"),
                    {"email": email}
                ).fetchone()

                if existing:
                    return jsonify({"error": "Email already registered"}), 400

                conn.execute(
                    text("INSERT INTO users (email, password_hash, first_name, last_name) VALUES (:email, :password_hash, :first_name, :last_name)"),
                    {"email": email, "password_hash": password_hash, "first_name": first_name, "last_name": last_name}
                )
                conn.commit()

            return jsonify({"message": "Signup successful"}), 201
        except Exception as e:
            print(f"Signup error: {e}")
            return jsonify({"error": str(e)}), 500


    # ---------- LOGIN ----------
    @auth_bp.route("/login", methods=["POST", "OPTIONS"])
    def login():
        # Preflight CORS
        if request.method == "OPTIONS":
            return jsonify({"status": "ok"}), 200

        data = request.get_json()
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        try:
            with engine.connect() as conn:
                user = conn.execute(
                    text("SELECT id, email, password_hash FROM users WHERE email=:email"),
                    {"email": email}
                ).fetchone()

                if not user:
                    return jsonify({"error": "Invalid email or password"}), 401

                # user is a tuple: (id, email, password_hash)
                if not check_password_hash(user[2], password):
                    return jsonify({"error": "Invalid email or password"}), 401

            token = create_access_token(identity=email)
            return jsonify({"access_token": token, "user": email}), 200
        except Exception as e:
            print(f"Login error: {e}")
            return jsonify({"error": str(e)}), 500


    # ---------- VERIFY ----------
    @auth_bp.route("/verify", methods=["GET"])
    @jwt_required()
    def verify():
        return jsonify({"user": get_jwt_identity()}), 200


    # ---------- UPDATE PROFILE IMAGE ----------
    @auth_bp.route("/profile-image", methods=["PUT"])
    @jwt_required()
    def update_profile_image():
        try:
            data = request.get_json()
            email = data.get("email")
            profile_image_url = data.get("profile_image_url")

            if not email or not profile_image_url:
                return jsonify({"error": "Email and image URL are required"}), 400

            with engine.connect() as conn:
                conn.execute(
                    text("UPDATE users SET profile_image_url = :url WHERE email = :email"),
                    {"url": profile_image_url, "email": email}
                )
                conn.commit()

            return jsonify({"message": "Profile image updated successfully"}), 200
        except Exception as e:
            print(f"Profile image update error: {e}")
            return jsonify({"error": str(e)}), 500


    # ---------- GET USER PROFILE ----------
    @auth_bp.route("/profile", methods=["GET"])
    @jwt_required()
    def get_profile():
        try:
            email = get_jwt_identity()
            with engine.connect() as conn:
                user = conn.execute(
                    text("SELECT email, profile_image_url, first_name, last_name FROM users WHERE email = :email"),
                    {"email": email}
                ).fetchone()

                if not user:
                    return jsonify({"error": "User not found"}), 404

                return jsonify({
                    "email": user[0],
                    "profile_image_url": user[1],
                    "first_name": user[2],
                    "last_name": user[3]
                }), 200
        except Exception as e:
            print(f"Get profile error: {e}")
            return jsonify({"error": str(e)}), 500

    return auth_bp
