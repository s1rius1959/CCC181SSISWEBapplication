from sqlalchemy import text


class CollegeModel:
    """Model for College database operations"""
    
    def __init__(self, engine):
        self.engine = engine

    def get_all(self, sort='asc', sort_by='college_code', search=None, search_field='all'):
        """Fetch all colleges with optional search and sort"""
        with self.engine.connect() as conn:
            if search:
                if search_field == 'code':
                    query = text(f"""
                        SELECT college_code, college_name
                        FROM colleges
                        WHERE LOWER(college_code) LIKE LOWER(:search)
                        ORDER BY {sort_by} {sort.upper()}
                    """)
                elif search_field == 'name':
                    query = text(f"""
                        SELECT college_code, college_name
                        FROM colleges
                        WHERE LOWER(college_name) LIKE LOWER(:search)
                        ORDER BY {sort_by} {sort.upper()}
                    """)
                else:  # all fields
                    query = text(f"""
                        SELECT college_code, college_name
                        FROM colleges
                        WHERE LOWER(college_code) LIKE LOWER(:search)
                           OR LOWER(college_name) LIKE LOWER(:search)
                        ORDER BY {sort_by} {sort.upper()}
                    """)
                result = conn.execute(query, {"search": f"%{search}%"})
            else:
                query = text(f"""
                    SELECT college_code, college_name
                    FROM colleges
                    ORDER BY {sort_by} {sort.upper()}
                """)
                result = conn.execute(query)
            
            return [{"code": row[0], "name": row[1]} for row in result]

    def get_by_code(self, college_code):
        """Get a single college by code"""
        with self.engine.connect() as conn:
            result = conn.execute(
                text("SELECT college_code FROM colleges WHERE college_code = :code"),
                {"code": college_code}
            ).fetchone()
            return result

    def exists(self, college_code):
        """Check if college exists"""
        return self.get_by_code(college_code) is not None

    def create(self, college_code, college_name):
        """Create a new college"""
        with self.engine.connect() as conn:
            conn.execute(
                text("INSERT INTO colleges (college_code, college_name) VALUES (:code, :name)"),
                {"code": college_code, "name": college_name}
            )
            conn.commit()

    def update(self, old_code, new_code, college_name):
        """Update a college"""
        with self.engine.connect() as conn:
            conn.execute(
                text("UPDATE colleges SET college_code = :new_code, college_name = :name WHERE college_code = :old_code"),
                {"old_code": old_code, "new_code": new_code, "name": college_name}
            )
            conn.commit()

    def delete(self, college_code):
        """Delete a college and reassign programs to N/A"""
        with self.engine.connect() as conn:
            # Ensure N/A college exists
            na_exists = conn.execute(
                text("SELECT 1 FROM colleges WHERE college_code = 'N/A'")
            ).fetchone()
            
            if not na_exists:
                conn.execute(
                    text("INSERT INTO colleges (college_code, college_name) VALUES ('N/A', 'No College Assigned')")
                )
            
            # Reassign programs
            conn.execute(
                text("UPDATE programs SET college_code = 'N/A' WHERE college_code = :code"),
                {"code": college_code}
            )
            
            # Delete college
            conn.execute(
                text("DELETE FROM colleges WHERE college_code = :code"),
                {"code": college_code}
            )
            conn.commit()
