from sqlalchemy import text


class UserModel:
    """Model for User database operations"""
    
    def __init__(self, engine):
        self.engine = engine

    def get_by_email(self, email):
        """Get a user by email"""
        with self.engine.connect() as conn:
            result = conn.execute(
                text("SELECT id, email, password_hash FROM users WHERE email = :email"),
                {"email": email}
            ).fetchone()
            return result

    def email_exists(self, email):
        """Check if email already exists"""
        with self.engine.connect() as conn:
            result = conn.execute(
                text("SELECT 1 FROM users WHERE email = :email"),
                {"email": email}
            ).fetchone()
            return result is not None

    def create(self, email, password_hash, first_name, last_name):
        """Create a new user"""
        with self.engine.connect() as conn:
            conn.execute(
                text("INSERT INTO users (email, password_hash, first_name, last_name) VALUES (:email, :password_hash, :first_name, :last_name)"),
                {"email": email, "password_hash": password_hash, "first_name": first_name, "last_name": last_name}
            )
            conn.commit()

    def get_profile(self, email):
        """Get user profile information"""
        with self.engine.connect() as conn:
            user = conn.execute(
                text("SELECT email, profile_image_url, first_name, last_name FROM users WHERE email = :email"),
                {"email": email}
            ).fetchone()
            
            if user:
                return {
                    "email": user[0],
                    "profileImageUrl": user[1],
                    "firstName": user[2],
                    "lastName": user[3]
                }
            return None

    def update_profile_image(self, email, profile_image_url):
        """Update user profile image"""
        with self.engine.connect() as conn:
            conn.execute(
                text("UPDATE users SET profile_image_url = :url WHERE email = :email"),
                {"url": profile_image_url, "email": email}
            )
            conn.commit()
