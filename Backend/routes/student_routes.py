from flask import Blueprint
from controllers.student_controller import StudentController


def init_student_routes(engine):
    """Initialize student routes with MVC pattern"""
    student_bp = Blueprint("students", __name__)
    controller = StudentController(engine)

    @student_bp.route("/api/students", methods=["GET"])
    def get_students():
        return controller.get_students()

    @student_bp.route("/api/students", methods=["POST"])
    def create_student():
        return controller.create_student()

    @student_bp.route("/api/students", methods=["PUT"])
    def update_student():
        return controller.update_student()

    @student_bp.route("/api/students", methods=["DELETE"])
    def delete_student():
        return controller.delete_student()

    return student_bp
