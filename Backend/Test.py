from sqlalchemy import create_engine, text
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

# Create connection string
DATABASE_URL = f"postgresql+psycopg2://{USER}:{PASSWORD}@{HOST}:{PORT}/{DBNAME}"

print("Testing PostgreSQL connection...")
print(f"Connecting to: postgresql://{USER}:****@{HOST}:{PORT}/{DBNAME}")

try:
    # Create engine
    engine = create_engine(DATABASE_URL)
    
    # Test connection
    with engine.connect() as connection:
        result = connection.execute(text("SELECT version();"))
        version = result.scalar()
        print("\n✅ CONNECTION SUCCESSFUL!")
        print(f"PostgreSQL Version: {version}")
        
        # Test tables
        result = connection.execute(text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        """))
        tables = [row[0] for row in result]
        print(f"\nTables found: {tables}")
        
        # Count records
        if 'students' in tables:
            result = connection.execute(text("SELECT COUNT(*) FROM students"))
            count = result.scalar()
            print(f"Students in database: {count}")
            
except Exception as e:
    print("\n❌ CONNECTION FAILED!")
    print(f"Error: {e}")
    print("\nTroubleshooting:")
    print("1. Make sure PostgreSQL is running")
    print("2. Check your .env file has correct credentials")
    print("3. Verify database 'student_db' exists")
    print("4. Check if password is correct")