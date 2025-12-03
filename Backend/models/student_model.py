from sqlalchemy import text


class StudentModel:
    """Model for Student database operations"""
    
    def __init__(self, engine):
        self.engine = engine

    def get_all(self, sort='asc', sort_by='student_id', search=None, search_field='all'):
        """Fetch all students with optional search and sort"""
        with self.engine.connect() as conn:
            if search:
                if search_field == 'id':
                    query = text(f"""
                        SELECT student_id, first_name, last_name, gender, program_code, year_level, profile_image_url
                        FROM students
                        WHERE LOWER(student_id) LIKE LOWER(:search)
                        ORDER BY {sort_by} {sort.upper()}
                    """)
                elif search_field == 'name':
                    query = text(f"""
                        SELECT student_id, first_name, last_name, gender, program_code, year_level, profile_image_url
                        FROM students
                        WHERE LOWER(first_name) LIKE LOWER(:search)
                           OR LOWER(last_name) LIKE LOWER(:search)
                        ORDER BY {sort_by} {sort.upper()}
                    """)
                else:  # all fields
                    query = text(f"""
                        SELECT student_id, first_name, last_name, gender, program_code, year_level, profile_image_url
                        FROM students
                        WHERE LOWER(student_id) LIKE LOWER(:search)
                           OR LOWER(first_name) LIKE LOWER(:search)
                           OR LOWER(last_name) LIKE LOWER(:search)
                           OR LOWER(gender) LIKE LOWER(:search)
                           OR LOWER(program_code) LIKE LOWER(:search)
                           OR CAST(year_level AS TEXT) LIKE :search
                        ORDER BY {sort_by} {sort.upper()}
                    """)
                result = conn.execute(query, {"search": f"%{search}%"})
            else:
                query = text(f"""
                    SELECT student_id, first_name, last_name, gender, program_code, year_level, profile_image_url
                    FROM students
                    ORDER BY {sort_by} {sort.upper()}
                """)
                result = conn.execute(query)
            
            return [{
                "id": row[0],
                "firstName": row[1],
                "lastName": row[2],
                "gender": row[3],
                "course": row[4],
                "yearLevel": row[5],
                "profileImage": row[6]
            } for row in result]

    def get_by_id(self, student_id):
        """Get a single student by ID"""
        with self.engine.connect() as conn:
            result = conn.execute(
                text("SELECT 1 FROM students WHERE student_id = :id"),
                {"id": student_id}
            ).fetchone()
            return result

    def exists(self, student_id):
        """Check if student exists"""
        return self.get_by_id(student_id) is not None

    def program_exists(self, program_code):
        """Check if program exists"""
        with self.engine.connect() as conn:
            result = conn.execute(
                text("SELECT 1 FROM programs WHERE program_code = :code"),
                {"code": program_code}
            ).fetchone()
            return result is not None

    def create(self, student_id, first_name, last_name, gender, program_code, year_level, profile_image_url=None):
        """Create a new student"""
        with self.engine.connect() as conn:
            conn.execute(
                text("""
                    INSERT INTO students (student_id, first_name, last_name, gender, program_code, year_level, profile_image_url)
                    VALUES (:id, :first, :last, :gender, :program, :year, :image)
                """),
                {
                    "id": student_id,
                    "first": first_name,
                    "last": last_name,
                    "gender": gender,
                    "program": program_code,
                    "year": year_level,
                    "image": profile_image_url
                }
            )
            conn.commit()

    def update(self, old_id, student_id, first_name, last_name, gender, program_code, year_level, profile_image_url):
        """Update a student"""
        with self.engine.connect() as conn:
            conn.execute(
                text("""
                    UPDATE students 
                    SET student_id = :new_id, first_name = :first, last_name = :last, 
                        gender = :gender, program_code = :program, year_level = :year, 
                        profile_image_url = :image
                    WHERE student_id = :old_id
                """),
                {
                    "old_id": old_id,
                    "new_id": student_id,
                    "first": first_name,
                    "last": last_name,
                    "gender": gender,
                    "program": program_code,
                    "year": year_level,
                    "image": profile_image_url
                }
            )
            conn.commit()

    def delete(self, student_id):
        """Delete a student"""
        with self.engine.connect() as conn:
            conn.execute(
                text("DELETE FROM students WHERE student_id = :id"),
                {"id": student_id}
            )
            conn.commit()
