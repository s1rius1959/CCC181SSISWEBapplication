from flask import Flask
from flask_cors import CORS
from sqlalchemy import create_engine, text
from sqlalchemy_utils import database_exists, create_database
from sqlalchemy.pool import NullPool
from dotenv import load_dotenv
import os

# ------------------------------
# Load environment variables
# ------------------------------
load_dotenv()

USER = os.getenv("user")
PASSWORD = os.getenv("password")
HOST = os.getenv("host")
PORT = os.getenv("port")
DBNAME = os.getenv("dbname")

DATABASE_URL = f"postgresql+psycopg2://{USER}:{PASSWORD}@{HOST}:{PORT}/{DBNAME}"
SERVER_URL = f"postgresql+psycopg2://{USER}:{PASSWORD}@{HOST}:{PORT}/postgres"

# ------------------------------
# Flask App
# ------------------------------
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# Load keys from .env
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "fallback_secret")
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "fallback_jwt_secret")

# ------------------------------
# Database Setup Function
# ------------------------------
def setup_database():
    try:
        # Create DB if it doesn't exist
        if not database_exists(DATABASE_URL):
            print(f"Database '{DBNAME}' does not exist. Creating...")
            create_database(DATABASE_URL)
            print(f"[OK] Database '{DBNAME}' created successfully!")

        # Connect to DB
        engine = create_engine(DATABASE_URL, poolclass=NullPool)
        with engine.connect() as conn:
            print("[OK] Connected to database successfully!")

            # Create tables
            schema_sql = """
            CREATE TABLE IF NOT EXISTS colleges (
                college_code VARCHAR(10) PRIMARY KEY,
                college_name VARCHAR(255) NOT NULL
            );

            CREATE TABLE IF NOT EXISTS programs (
                program_code VARCHAR(10) PRIMARY KEY,
                program_name VARCHAR(255) NOT NULL,
                college_code VARCHAR(10) NOT NULL,
                FOREIGN KEY (college_code) REFERENCES colleges(college_code) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS students (
                student_id VARCHAR(20) PRIMARY KEY,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                gender VARCHAR(10) NOT NULL CHECK (gender IN ('M', 'F', 'Others')),
                program_code VARCHAR(10) NOT NULL,
                year_level INTEGER NOT NULL CHECK (year_level BETWEEN 1 AND 5),
                FOREIGN KEY (program_code) REFERENCES programs(program_code) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash TEXT NOT NULL
            );
            """
            conn.execute(text(schema_sql))
            conn.commit()
            print("[OK] Tables created or already exist.")

            # Insert fallback 'N/A' rows
            conn.execute(text("""
                INSERT INTO colleges (college_code, college_name)
                VALUES ('N/A', 'No College Assigned')
                ON CONFLICT (college_code) DO NOTHING;

                INSERT INTO programs (program_code, program_name, college_code)
                VALUES ('N/A', 'No Program Assigned', 'N/A')
                ON CONFLICT (program_code) DO NOTHING;
            """))
            conn.commit()
            print("[OK] Fallback records ensured.")

        return engine

    except Exception as e:
        print("[FAIL] Database setup failed!")
        print("Error:", e)
        exit(1)

# ------------------------------
# Initialize Database
# ------------------------------
engine = setup_database()

# ------------------------------
# Test Route
# ------------------------------
@app.route("/")
def index():
    try:
        with engine.connect() as conn:
            current_time = conn.execute(text("SELECT NOW();")).scalar()
            return f"<h3>Connection successful!</h3><p>Current Time: {current_time}</p>"
    except Exception as e:
        return f"<h3>Failed to connect:</h3><pre>{e}</pre>"

# ------------------------------
# Import and Register Blueprints
# ------------------------------
from student_routes import init_student_routes
from college_routes import init_college_routes
from program_routes import init_program_routes
from authentication_routes import init_auth_routes

student_bp = init_student_routes(engine)
college_bp = init_college_routes(engine)
program_bp = init_program_routes(engine)
auth_bp = init_auth_routes(app, engine)

app.register_blueprint(student_bp)
app.register_blueprint(college_bp)
app.register_blueprint(program_bp)
app.register_blueprint(auth_bp)

# ------------------------------
# Run Flask App
# ------------------------------
if __name__ == "__main__":
    app.run(debug=True)
