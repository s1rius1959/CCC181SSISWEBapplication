from sqlalchemy import text


class StudentModel:
    """Model for Student database operations"""
    
    def __init__(self, engine):
        self.engine = engine

    def get_all(self, sort='asc', sort_by='student_id', search=None, search_field='all'):
        """Fetch all students with optional search and sort"""
        with self.engine.connect() as conn:
            if search:
                search_stripped = search.strip()
                search_upper = search_stripped.upper()

                if search_field == 'id':
                    # Extract only numbers from search for ID field
                    search_numbers = ''.join(filter(str.isdigit, search_stripped))
                    if not search_numbers:
                        # Return empty if no numbers provided
                        return []
                    query = text(f"""
                        SELECT student_id, first_name, last_name, gender, program_code, year_level, profile_image_url
                        FROM students
                        WHERE student_id LIKE :search
                        ORDER BY {sort_by} {sort.upper()}
                    """)
                    result = conn.execute(query, {"search": f"%{search_numbers}%"})

                elif search_field == 'first_name':
                    query = text(f"""
                        SELECT student_id, first_name, last_name, gender, program_code, year_level, profile_image_url
                        FROM students
                        WHERE UPPER(first_name) LIKE :search
                        ORDER BY {sort_by} {sort.upper()}
                    """)
                    result = conn.execute(query, {"search": f"{search_upper}%"})

                elif search_field == 'last_name':
                    query = text(f"""
                        SELECT student_id, first_name, last_name, gender, program_code, year_level, profile_image_url
                        FROM students
                        WHERE UPPER(last_name) LIKE :search
                        ORDER BY {sort_by} {sort.upper()}
                    """)
                    result = conn.execute(query, {"search": f"{search_upper}%"})

                elif search_field == 'gender':
                    query = text(f"""
                        SELECT student_id, first_name, last_name, gender, program_code, year_level, profile_image_url
                        FROM students
                        WHERE UPPER(gender) LIKE :search
                        ORDER BY {sort_by} {sort.upper()}
                    """)
                    result = conn.execute(query, {"search": f"{search_upper}%"})

                elif search_field == 'course':
                    # Program code starts with match (case-insensitive)
                    query = text(f"""
                        SELECT student_id, first_name, last_name, gender, program_code, year_level, profile_image_url
                        FROM students
                        WHERE UPPER(program_code) LIKE :search
                        ORDER BY {sort_by} {sort.upper()}
                    """)
                    result = conn.execute(query, {"search": f"{search_upper}%"})

                elif search_field == 'year_level':
                    query = text(f"""
                        SELECT student_id, first_name, last_name, gender, program_code, year_level, profile_image_url
                        FROM students
                        WHERE CAST(year_level AS TEXT) LIKE :search
                        ORDER BY {sort_by} {sort.upper()}
                    """)
                    result = conn.execute(query, {"search": f"{search_stripped}%"})

                else:  # all fields
                    query = text(f"""
                        SELECT student_id, first_name, last_name, gender, program_code, year_level, profile_image_url
                        FROM students
                        WHERE student_id LIKE :search
                        OR UPPER(first_name) LIKE :search_upper
                        OR UPPER(last_name) LIKE :search_upper
                        OR UPPER(gender) LIKE :search_upper
                        OR UPPER(program_code) LIKE :search_upper
                        OR CAST(year_level AS TEXT) LIKE :search
                        ORDER BY {sort_by} {sort.upper()}
                    """)
                    result = conn.execute(query, {
                        "search": f"%{search_stripped}%",
                        "search_upper": f"{search_upper}%"
                    })
            else:
                query = text(f"""
                    SELECT student_id, first_name, last_name, gender, program_code, year_level, profile_image_url
                    FROM students
                    ORDER BY {sort_by} {sort.upper()}
                """)
                result = conn.execute(query)
            
            # Fetch all rows while connection is still open
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
