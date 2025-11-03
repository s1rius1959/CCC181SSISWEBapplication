from sqlalchemy import create_engine, text
from sqlalchemy_utils import database_exists, create_database
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Get database credentials
USER = os.getenv("user")
PASSWORD = os.getenv("password")
HOST = os.getenv("host")
PORT = os.getenv("port")
DBNAME = os.getenv("dbname")

# Connection strings
DATABASE_URL = f"postgresql+psycopg2://{USER}:{PASSWORD}@{HOST}:{PORT}/{DBNAME}"
SERVER_URL = f"postgresql+psycopg2://{USER}:{PASSWORD}@{HOST}:{PORT}/postgres"

print("🔍 Checking PostgreSQL connection...")
print(f"Connecting to: postgresql://{USER}:****@{HOST}:{PORT}/{DBNAME}")

try:
    # ✅ Auto-create database if not exists
    if not database_exists(DATABASE_URL):
        print(f"\n⚙️ Database '{DBNAME}' does not exist. Creating...")
        create_database(DATABASE_URL)
        print(f"✅ Database '{DBNAME}' created successfully!")

    # Connect to the database
    engine = create_engine(DATABASE_URL)
    with engine.connect() as connection:
        # PostgreSQL version
        result = connection.execute(text("SELECT version();"))
        version = result.scalar()
        print(f"\n✅ CONNECTION SUCCESSFUL!")
        print(f"PostgreSQL Version: {version}")

        # List tables
        result = connection.execute(text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        """))
        tables = [row[0] for row in result]
        print(f"\n📋 Tables found: {tables if tables else 'No tables yet.'}")

        # Count students if table exists
        if 'students' in tables:
            result = connection.execute(text("SELECT COUNT(*) FROM students"))
            count = result.scalar()
            print(f"👩‍🎓 Students in database: {count}")

except Exception as e:
    print("\n❌ CONNECTION FAILED!")
    print(f"Error: {e}")
    print("\n🔧 Troubleshooting:")
    print("1. Make sure PostgreSQL service is running.")
    print("2. Check your .env credentials.")
    print(f"3. Verify database '{DBNAME}' is accessible.")
    print("4. Confirm psycopg2 and sqlalchemy-utils are installed.")

