from flask import jsonify, request
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, get_jwt_identity
from models.user_model import UserModel


class AuthController:
    """Controller for Authentication operations"""
    
    def __init__(self, engine):
        self.model = UserModel(engine)

    def signup(self):
        """Handle user signup"""
        # Handle CORS preflight
        if request.method == "OPTIONS":
            return jsonify({"status": "ok"}), 200

        try:
            data = request.get_json()
            email = data.get("email")
            password = data.get("password")
            confirm_password = data.get("confirm_password")
            first_name = data.get("first_name", "").strip()
            last_name = data.get("last_name", "").strip()

            # Validation
            if not email or not password or not confirm_password:
                return jsonify({"error": "All fields are required"}), 400

            if not first_name or not last_name:
                return jsonify({"error": "First name and last name are required"}), 400

            if password != confirm_password:
                return jsonify({"error": "Passwords do not match"}), 400

            if len(password) < 6:
                return jsonify({"error": "Password must be at least 6 characters"}), 400

            # Check if email exists
            if self.model.email_exists(email):
                return jsonify({"error": "Email already registered"}), 400

            # Create user
            password_hash = generate_password_hash(password)
            self.model.create(email, password_hash, first_name, last_name)

            return jsonify({"message": "Signup successful"}), 201

        except Exception as e:
            print(f"Signup error: {e}")
            return jsonify({"error": str(e)}), 500

    def login(self):
        """Handle user login"""
        # Handle CORS preflight
        if request.method == "OPTIONS":
            return jsonify({"status": "ok"}), 200

        try:
            data = request.get_json()
            email = data.get("email")
            password = data.get("password")

            if not email or not password:
                return jsonify({"error": "Email and password are required"}), 400

            # Get user from database
            user = self.model.get_by_email(email)

            if not user:
                return jsonify({"error": "Invalid email or password"}), 401

            # Verify password (user tuple: id, email, password_hash)
            if not check_password_hash(user[2], password):
                return jsonify({"error": "Invalid email or password"}), 401

            # Create access token
            token = create_access_token(identity=email)
            return jsonify({"access_token": token, "user": email}), 200

        except Exception as e:
            print(f"Login error: {e}")
            return jsonify({"error": str(e)}), 500

    def verify(self):
        """Verify JWT token"""
        return jsonify({"user": get_jwt_identity()}), 200

    def get_profile(self):
        """Get user profile"""
        try:
            email = get_jwt_identity()
            profile = self.model.get_profile(email)

            if not profile:
                return jsonify({"error": "User not found"}), 404

            return jsonify(profile), 200

        except Exception as e:
            print(f"Get profile error: {e}")
            return jsonify({"error": str(e)}), 500

    def update_profile_image(self):
        """Update user profile image"""
        try:
            data = request.get_json()
            email = data.get("email")
            profile_image_url = data.get("profile_image_url")

            if not email or not profile_image_url:
                return jsonify({"error": "Email and image URL are required"}), 400

            self.model.update_profile_image(email, profile_image_url)
            return jsonify({"message": "Profile image updated successfully"}), 200

        except Exception as e:
            print(f"Profile image update error: {e}")
            return jsonify({"error": str(e)}), 500
