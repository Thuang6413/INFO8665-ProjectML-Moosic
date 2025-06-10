# dev/backend/routes/user_routes.py
from flask import Blueprint, request, jsonify
from services.auth_service import register_user, login_user

user_bp = Blueprint("user", __name__)

@user_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    return register_user(data)

@user_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    return login_user(data)

@user_bp.route("", methods=["GET"])
def get_user():
    return jsonify({"username": "user001", "preferences": {}})

@user_bp.route("", methods=["PUT"])
def update_user():
    return jsonify({"message": "User preferences updated"})