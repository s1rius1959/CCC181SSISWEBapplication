from flask import jsonify, request
from models.student_model import StudentModel
from utils.supabase_client import rename_student_image, delete_student_image


class StudentController:
    """Controller for Student operations"""
    
    def __init__(self, engine):
        self.model = StudentModel(engine)

    def get_students(self):
        """Get all students with optional search and sort"""
        try:
            sort = request.args.get('sort', 'asc')
            sort_by = request.args.get('sort_by', 'student_id')
            search = request.args.get('search', '').strip()
            search_field = request.args.get('search_field', 'all')
            
            # Map frontend column names to database column names
            column_mapping = {
                'id': 'student_id',
                'name': 'first_name'
            }
            sort_by = column_mapping.get(sort_by, sort_by)
            
            students = self.model.get_all(sort, sort_by, search, search_field)
            return jsonify(students), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    def create_student(self):
        """Create a new student"""
        try:
            data = request.get_json()
            student_id = data.get('student_id', '').strip()
            first_name = data.get('first_name', '').strip()
            last_name = data.get('last_name', '').strip()
            gender = data.get('gender', '').strip()
            program_code = data.get('program_code', '').strip()
            year_level = data.get('year_level')
            profile_image_url = data.get('profile_image_url')
            
            if not all([student_id, first_name, last_name, gender, program_code, year_level]):
                return jsonify({"error": "All fields except profile image are required"}), 400
            
            if self.model.exists(student_id):
                return jsonify({"error": "Student ID already exists"}), 409
            
            if not self.model.program_exists(program_code):
                return jsonify({"error": "Program code does not exist"}), 400
            
            self.model.create(student_id, first_name, last_name, gender, program_code, year_level, profile_image_url)
            return jsonify({"message": "Student added successfully"}), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    def update_student(self):
        """Update an existing student"""
        try:
            data = request.get_json()
            old_id = data.get('old_id', '').strip()
            student_id = data.get('student_id', '').strip()
            first_name = data.get('first_name', '').strip()
            last_name = data.get('last_name', '').strip()
            gender = data.get('gender', '').strip()
            program_code = data.get('program_code', '').strip()
            year_level = data.get('year_level')
            profile_image_url = data.get('profile_image_url')
            
            if not all([old_id, student_id, first_name, last_name, gender, program_code, year_level]):
                return jsonify({"error": "All fields except profile image are required"}), 400
            
            if not self.model.exists(old_id):
                return jsonify({"error": "Student not found"}), 404
            
            if old_id != student_id and self.model.exists(student_id):
                return jsonify({"error": "New student ID already exists"}), 409
            
            # If student ID changed and there's an image, rename it in Supabase
            if old_id != student_id and profile_image_url:
                new_image_url = rename_student_image(old_id, student_id)
                if new_image_url:
                    profile_image_url = new_image_url
            
            self.model.update(old_id, student_id, first_name, last_name, gender, program_code, year_level, profile_image_url)
            return jsonify({"message": "Student updated successfully"}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    def delete_student(self):
        """Delete a student"""
        try:
            data = request.get_json()
            student_id = data.get('student_id', '').strip()
            
            if not student_id:
                return jsonify({"error": "Student ID is required"}), 400
            
            if not self.model.exists(student_id):
                return jsonify({"error": "Student not found"}), 404
            
            # Delete the student's image from Supabase if it exists
            delete_student_image(student_id)
            
            self.model.delete(student_id)
            return jsonify({"message": "Student deleted successfully"}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
