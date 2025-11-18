from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import text
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

def init_auth_routes(engine):

    # ---------- SIGNUP ----------
    @auth_bp.route("/signup", methods=["POST", "OPTIONS"])
    def signup():
        # ✅ Preflight CORS
        if request.method == "OPTIONS":
            return jsonify({"status": "ok"}), 200

        data = request.get_json()
        email = data.get("email")
        password = data.get("password")
        confirm_password = data.get("confirm_password")

        if not email or not password or not confirm_password:
            return jsonify({"error": "All fields are required"}), 400

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
                    text("INSERT INTO users (email, password_hash) VALUES (:email, :password_hash)"),
                    {"email": email, "password_hash": password_hash}
                )
                conn.commit()

            return jsonify({"message": "Signup successful"}), 201
        except Exception as e:
            print(f"❌ Signup error: {e}")
            return jsonify({"error": str(e)}), 500


    # ---------- LOGIN ----------
    @auth_bp.route("/login", methods=["POST", "OPTIONS"])
    def login():
        # ✅ Preflight CORS
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
            print(f"❌ Login error: {e}")
            return jsonify({"error": str(e)}), 500


    # ---------- VERIFY ----------
    @auth_bp.route("/verify", methods=["GET"])
    @jwt_required()
    def verify():
        return jsonify({"user": get_jwt_identity()}), 200

    return auth_bp
