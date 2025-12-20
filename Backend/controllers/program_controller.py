from flask import jsonify, request
from models.program_model import ProgramModel


class ProgramController:
    """Controller for Program operations"""
    
    def __init__(self, engine):
        self.model = ProgramModel(engine)

    def get_programs(self):
        """Get all programs with optional search and sort"""
        try:
            sort = request.args.get('sort', 'asc')
            sort_by = request.args.get('sort_by', 'program_code')
            search = request.args.get('search', '').strip()
            search_field = request.args.get('search_field', 'all')
            
            # Get college filter as comma-separated values
            colleges_param = request.args.get('colleges', '')
            colleges = [c.strip() for c in colleges_param.split(',') if c.strip()] if colleges_param else None
            
            programs = self.model.get_all(sort, sort_by, search, search_field, colleges)
            return jsonify(programs), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    def create_program(self):
        """Create a new program"""
        try:
            data = request.get_json()
            program_code = data.get('program_code', '').strip().upper()
            program_name = data.get('program_name', '').strip()
            college_code = data.get('college_code', '').strip()
            
            if not program_code or not program_name or not college_code:
                return jsonify({"error": "All fields are required"}), 400
            
            if self.model.exists(program_code):
                return jsonify({"error": "Program code already exists"}), 409
            
            if not self.model.college_exists(college_code):
                return jsonify({"error": "College code does not exist"}), 400
            
            self.model.create(program_code, program_name, college_code)
            return jsonify({"message": "Program added successfully"}), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    def update_program(self):
        """Update an existing program"""
        try:
            data = request.get_json()
            old_code = data.get('old_code', '').strip()
            new_code = data.get('program_code', '').strip().upper()
            program_name = data.get('program_name', '').strip()
            college_code = data.get('college_code', '').strip()
            
            if not old_code or not new_code or not program_name or not college_code:
                return jsonify({"error": "All fields are required"}), 400
            
            if not self.model.exists(old_code):
                return jsonify({"error": "Program not found"}), 404
            
            if old_code != new_code and self.model.exists(new_code):
                return jsonify({"error": "New program code already exists"}), 409
            
            if not self.model.college_exists(college_code):
                return jsonify({"error": "College code does not exist"}), 400
            
            self.model.update(old_code, new_code, program_name, college_code)
            return jsonify({"message": "Program updated successfully"}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    def delete_program(self):
        """Delete a program"""
        try:
            data = request.get_json()
            program_code = data.get('program_code', '').strip()
            
            if not program_code:
                return jsonify({"error": "Program code is required"}), 400
            
            if not self.model.exists(program_code):
                return jsonify({"error": "Program not found"}), 404
            
            self.model.delete(program_code)
            return jsonify({"message": "Program deleted successfully"}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
