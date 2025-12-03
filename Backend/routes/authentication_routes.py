from flask import Blueprint
from flask_jwt_extended import jwt_required
from controllers.auth_controller import AuthController


def init_auth_routes(engine):
    """Initialize authentication routes with MVC pattern"""
    auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")
    controller = AuthController(engine)

    @auth_bp.route("/signup", methods=["POST", "OPTIONS"])
    def signup():
        return controller.signup()

    @auth_bp.route("/login", methods=["POST", "OPTIONS"])
    def login():
        return controller.login()

    @auth_bp.route("/verify", methods=["GET"])
    @jwt_required()
    def verify():
        return controller.verify()

    @auth_bp.route("/profile", methods=["GET"])
    @jwt_required()
    def get_profile():
        return controller.get_profile()

    @auth_bp.route("/profile-image", methods=["PUT"])
    @jwt_required()
    def update_profile_image():
        return controller.update_profile_image()

    return auth_bp
