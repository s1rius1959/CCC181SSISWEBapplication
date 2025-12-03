from flask import jsonify, request
from models.college_model import CollegeModel


class CollegeController:
    """Controller for College operations"""
    
    def __init__(self, engine):
        self.model = CollegeModel(engine)

    def get_colleges(self):
        """Get all colleges with optional search and sort"""
        try:
            sort = request.args.get('sort', 'asc')
            sort_by = request.args.get('sort_by', 'college_code')
            search = request.args.get('search', '').strip()
            search_field = request.args.get('search_field', 'all')
            
            colleges = self.model.get_all(sort, sort_by, search, search_field)
            return jsonify(colleges), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    def create_college(self):
        """Create a new college"""
        try:
            data = request.get_json()
            college_code = data.get('college_code', '').strip().upper()
            college_name = data.get('college_name', '').strip()
            
            if not college_code or not college_name:
                return jsonify({"error": "College code and name are required"}), 400
            
            if self.model.exists(college_code):
                return jsonify({"error": "College code already exists"}), 409
            
            self.model.create(college_code, college_name)
            return jsonify({"message": "College added successfully"}), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    def update_college(self):
        """Update an existing college"""
        try:
            data = request.get_json()
            old_code = data.get('old_code', '').strip()
            new_code = data.get('college_code', '').strip().upper()
            college_name = data.get('college_name', '').strip()
            
            if not old_code or not new_code or not college_name:
                return jsonify({"error": "All fields are required"}), 400
            
            if not self.model.exists(old_code):
                return jsonify({"error": "College not found"}), 404
            
            if old_code != new_code and self.model.exists(new_code):
                return jsonify({"error": "New college code already exists"}), 409
            
            self.model.update(old_code, new_code, college_name)
            return jsonify({"message": "College updated successfully"}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    def delete_college(self):
        """Delete a college"""
        try:
            data = request.get_json()
            college_code = data.get('college_code', '').strip()
            
            if not college_code:
                return jsonify({"error": "College code is required"}), 400
            
            if not self.model.exists(college_code):
                return jsonify({"error": "College not found"}), 404
            
            self.model.delete(college_code)
            return jsonify({"message": "College deleted and programs reassigned to N/A"}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
