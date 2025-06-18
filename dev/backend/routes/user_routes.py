# dev/backend/routes/user_routes.py
from flask import Blueprint, request, jsonify
from services.auth_service import register_user, login_user
from models import db, Token
from utils.auth_utils import token_required
import re

user_bp = Blueprint("user", __name__)

@user_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    print(f"Received registration data: {data}")
    try:
        if not data or not data.get("username") or not data.get("password") or not data.get("email"):
            return jsonify({"error": "Missing required fields"}), 400
        if not re.match(r"^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$", data["password"]):
            return jsonify({"error": "Password must be at least 8 characters with letters and numbers"}), 400
    except Exception as e:
        print(f"Error processing registration data: {e}")
        return jsonify({"error": str(e)}), 400
    
    response, status = register_user(data)
    return jsonify(response), status

@user_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    try:
        if not data or not data.get("username") or not data.get("password"):
            return jsonify({"error": "Missing required fields"}), 400
    except Exception as e:
        print(f"Error processing login data: {e}")
        return jsonify({"error": str(e)}), 400
    
    response, status = login_user(data)
    return jsonify(response), status

@user_bp.route("/logout", methods=["POST"])
@token_required
def logout(token_data):
    token = request.headers.get('Authorization').replace('Bearer ', '')
    token_obj = Token.query.filter_by(token=token).first()
    if token_obj:
        db.session.delete(token_obj)
        db.session.commit()
        return jsonify({"message": "Logged out successfully"}), 200
    return jsonify({"error": "Token not found"}), 400

@user_bp.route("", methods=["GET"])
@token_required
def get_user(token_data):
    return jsonify({"username": token_data['username'], "preferences": {}})

@user_bp.route("", methods=["PUT"])
@token_required
def update_user(token_data):
    return jsonify({"message": "User preferences updated"})