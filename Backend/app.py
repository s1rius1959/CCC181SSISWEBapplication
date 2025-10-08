from flask import Flask, jsonify
from flask_cors import CORS
from sqlalchemy import create_engine, text
from sqlalchemy.pool import NullPool
from dotenv import load_dotenv
import os

# Import route blueprints
from student_routes import init_student_routes

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Load environment variables from .env
load_dotenv()

# Fetch variables
USER = os.getenv("user")
PASSWORD = os.getenv("password")
HOST = os.getenv("host")
PORT = os.getenv("port")
DBNAME = os.getenv("dbname")

DATABASE_URL = f"postgresql+psycopg2://{USER}:{PASSWORD}@{HOST}:{PORT}/{DBNAME}"


engine = create_engine(DATABASE_URL, poolclass=NullPool)

@app.route("/")
def index():
    """Test database connection"""
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT NOW();"))
            current_time = result.scalar()
            return f"<h3>Connection successful!</h3><p>Current Time: {current_time}</p>"
    except Exception as e:
        return f"<h3>Failed to connect:</h3><pre>{e}</pre>"

# Register blueprints
student_bp = init_student_routes(engine)
app.register_blueprint(student_bp)


if __name__ == "__main__":
    app.run(debug=True)