from sqlalchemy import text


class ProgramModel:
    """Model for Program database operations"""
    
    def __init__(self, engine):
        self.engine = engine

    def get_all(self, sort='asc', sort_by='program_code', search=None, search_field='all', colleges=None):
        """Fetch all programs with optional search, sort, and filters"""
        with self.engine.connect() as conn:
            # Build WHERE clauses
            where_clauses = []
            params = {}
            
            # Add search filter
            if search:
                if search_field == 'code':
                    where_clauses.append("LOWER(program_code) LIKE LOWER(:search)")
                elif search_field == 'name':
                    where_clauses.append("LOWER(program_name) LIKE LOWER(:search)")
                elif search_field == 'collegeCode':
                    where_clauses.append("LOWER(college_code) LIKE LOWER(:search)")
                else:  # all fields
                    where_clauses.append("(LOWER(program_code) LIKE LOWER(:search) OR LOWER(program_name) LIKE LOWER(:search))")
                params["search"] = f"%{search}%"
            
            # Add college filter
            if colleges and len(colleges) > 0:
                placeholders = ', '.join([f':college_{i}' for i in range(len(colleges))])
                where_clauses.append(f"college_code IN ({placeholders})")
                for i, college in enumerate(colleges):
                    params[f'college_{i}'] = college
            
            # Query 
            where_sql = " AND ".join(where_clauses) if where_clauses else "1=1"
            query = text(f"""
                SELECT program_code, program_name, college_code
                FROM programs
                WHERE {where_sql}
                ORDER BY {sort_by} {sort.upper()}
            """)
            
            result = conn.execute(query, params)
            return [{"code": row[0], "name": row[1], "collegeCode": row[2]} for row in result]

    def get_by_code(self, program_code):
        """Get a single program by code"""
        with self.engine.connect() as conn:
            result = conn.execute(
                text("SELECT program_code, college_code FROM programs WHERE program_code = :code"),
                {"code": program_code}
            ).fetchone()
            return result

    def exists(self, program_code):
        """Check if program exists"""
        return self.get_by_code(program_code) is not None

    def college_exists(self, college_code):
        """Check if college exists"""
        with self.engine.connect() as conn:
            result = conn.execute(
                text("SELECT 1 FROM colleges WHERE college_code = :code"),
                {"code": college_code}
            ).fetchone()
            return result is not None

    def create(self, program_code, program_name, college_code):
        """Create a new program"""
        with self.engine.connect() as conn:
            conn.execute(
                text("INSERT INTO programs (program_code, program_name, college_code) VALUES (:code, :name, :college)"),
                {"code": program_code, "name": program_name, "college": college_code}
            )
            conn.commit()

    def update(self, old_code, new_code, program_name, college_code):
        """Update a program"""
        with self.engine.connect() as conn:
            # Get old college code
            old_college = conn.execute(
                text("SELECT college_code FROM programs WHERE program_code = :code"),
                {"code": old_code}
            ).fetchone()
            
            # Update program
            conn.execute(
                text("UPDATE programs SET program_code = :new_code, program_name = :name, college_code = :college WHERE program_code = :old_code"),
                {"old_code": old_code, "new_code": new_code, "name": program_name, "college": college_code}
            )
            
            # Update students if program code changed
            if old_code != new_code:
                conn.execute(
                    text("UPDATE students SET program_code = :new_code WHERE program_code = :old_code"),
                    {"old_code": old_code, "new_code": new_code}
                )
            
            conn.commit()

    def delete(self, program_code):
        """Delete a program"""
        with self.engine.connect() as conn:
            conn.execute(
                text("DELETE FROM programs WHERE program_code = :code"),
                {"code": program_code}
            )
            conn.commit()
