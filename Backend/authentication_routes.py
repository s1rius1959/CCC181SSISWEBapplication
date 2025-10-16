from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import text
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)
from datetime import timedelta

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

# ---------- Initialize Auth Routes ----------
def init_auth_routes(app, engine):
    app.config["JWT_SECRET_KEY"] = "supersecretjwtkey"   # change this to your own random key
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)  # token expires in 1 hour

    jwt = JWTManager(app)

    # ---------- SIGNUP ----------
    @auth_bp.route("/signup", methods=["POST"])
    def signup():
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")
        confirm_password = data.get("confirm_password")

        # Simple validation
        if not email or not password or not confirm_password:
            return jsonify({"error": "All fields are required"}), 400

        if password != confirm_password:
            return jsonify({"error": "Passwords do not match"}), 400

        if len(password) < 6:
            return jsonify({"error": "Password must be at least 6 characters"}), 400

        password_hash = generate_password_hash(password)

        with engine.connect() as conn:
            existing = conn.execute(text("SELECT * FROM users WHERE email=:email"), {"email": email}).fetchone()
            if existing:
                return jsonify({"error": "Email already registered"}), 400

            conn.execute(
                text("INSERT INTO users (email, password_hash) VALUES (:email, :password_hash)"),
                {"email": email, "password_hash": password_hash}
            )
            conn.commit()

        return jsonify({"message": "Signup successful"}), 201


    # ---------- LOGIN ----------
    @auth_bp.route("/login", methods=["POST"])
    def login():
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        with engine.connect() as conn:
            user = conn.execute(text("SELECT * FROM users WHERE email=:email"), {"email": email}).fetchone()
            if not user or not check_password_hash(user.password_hash, password):
                return jsonify({"error": "Invalid email or password"}), 401

        token = create_access_token(identity=email)
        return jsonify({"access_token": token, "user": email}), 200


    # ---------- VERIFY TOKEN ----------
    @auth_bp.route("/verify", methods=["GET"])
    @jwt_required()
    def verify():
        current_user = get_jwt_identity()
        return jsonify({"user": current_user}), 200

    return auth_bp
