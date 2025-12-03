from flask import Blueprint
from controllers.program_controller import ProgramController


def init_program_routes(engine):
    """Initialize program routes with MVC pattern"""
    program_bp = Blueprint("programs", __name__)
    controller = ProgramController(engine)

    @program_bp.route("/api/programs", methods=["GET"])
    def get_programs():
        return controller.get_programs()

    @program_bp.route("/api/programs", methods=["POST"])
    def create_program():
        return controller.create_program()

    @program_bp.route("/api/programs", methods=["PUT"])
    def update_program():
        return controller.update_program()

    @program_bp.route("/api/programs", methods=["DELETE"])
    def delete_program():
        return controller.delete_program()

    return program_bp
