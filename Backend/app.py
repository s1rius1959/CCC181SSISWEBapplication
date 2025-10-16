from flask import Flask
from flask_cors import CORS
from sqlalchemy import create_engine, text
from sqlalchemy.pool import NullPool
from dotenv import load_dotenv
import os

# Import route blueprints
from student_routes import init_student_routes
from college_routes import init_college_routes
from program_routes import init_program_routes
from authentication_routes import init_auth_routes

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# Load environment variables
load_dotenv()

USER = os.getenv("user")
PASSWORD = os.getenv("password")
HOST = os.getenv("host")
PORT = os.getenv("port")
DBNAME = os.getenv("dbname")

DATABASE_URL = f"postgresql+psycopg2://{USER}:{PASSWORD}@{HOST}:{PORT}/{DBNAME}"
engine = create_engine(DATABASE_URL, poolclass=NullPool)

# Load keys from .env (secure)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "fallback_secret")
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "fallback_jwt_secret")

@app.route("/")
def index():
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT NOW();"))
            current_time = result.scalar()
            return f"<h3>Connection successful!</h3><p>Current Time: {current_time}</p>"
    except Exception as e:
        return f"<h3>Failed to connect:</h3><pre>{e}</pre>"

# Register routes
student_bp = init_student_routes(engine)
college_bp = init_college_routes(engine)
program_bp = init_program_routes(engine)
auth_bp = init_auth_routes(app, engine)

app.register_blueprint(student_bp)
app.register_blueprint(college_bp)
app.register_blueprint(program_bp)
app.register_blueprint(auth_bp)

if __name__ == "__main__":
    app.run(debug=True)
