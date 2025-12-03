from flask import Blueprint
from controllers.college_controller import CollegeController


def init_college_routes(engine):
    """Initialize college routes with MVC pattern"""
    college_bp = Blueprint("colleges", __name__)
    controller = CollegeController(engine)

    @college_bp.route("/api/colleges", methods=["GET"])
    def get_colleges():
        return controller.get_colleges()

    @college_bp.route("/api/colleges", methods=["POST"])
    def create_college():
        return controller.create_college()

    @college_bp.route("/api/colleges", methods=["PUT"])
    def update_college():
        return controller.update_college()

    @college_bp.route("/api/colleges", methods=["DELETE"])
    def delete_college():
        return controller.delete_college()

    return college_bp
