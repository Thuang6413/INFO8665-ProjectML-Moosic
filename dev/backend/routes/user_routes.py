# dev/backend/routes/user_routes.py
from flask import Blueprint, request, jsonify
from services.auth_service import register_user, login_user, logout_user, get_user_info, update_user_preferences
from services.spotify_service import save_spotify_credential, get_spotify_credential
from models import db, Token
from utils.auth_utils import token_required
import re
from . import logger

user_bp = Blueprint("user", __name__)


@user_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    logger.info(f"Received registration data: {data}")
    try:
        if not data or not data.get("username") or not data.get("password"):
            return jsonify({"error": "Missing required fields"}), 400
        if not re.match(r"^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$", data["password"]):
            return jsonify({"error": "Password must be at least 8 characters with letters and numbers"}), 400
    except Exception as e:
        logger.error(f"Error processing registration data: {e}")
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
        logger.error(f"Error processing login data: {e}")
        return jsonify({"error": str(e)}), 400

    response, status = login_user(data)
    return jsonify(response), status


@user_bp.route("/logout", methods=["POST"])
@token_required
def logout(token_data):
    token = request.headers.get('Authorization').replace('Bearer ', '')
    response, status = logout_user(token)
    return jsonify(response), status


@user_bp.route("", methods=["GET"])
@token_required
def get_user(token_data):
    try:
        user_id = token_data['user_id']
    except KeyError:
        return jsonify({"error": "Invalid token payload"}), 401
    response, status = get_user_info(user_id)
    return jsonify(response), status


@user_bp.route("", methods=["PUT"])
@token_required
def update_user(token_data):
    data = request.get_json()
    try:
        user_id = token_data['user_id']
    except KeyError:
        return jsonify({"error": "Invalid token payload"}), 401
    response, status = update_user_preferences(user_id, data)
    return jsonify(response), status


@user_bp.route("/spotify-credential", methods=["POST"])
@token_required
def post_user_spotify_credential(token_data):
    token = request.headers.get('Authorization').replace('Bearer ', '')
    token_obj = Token.query.filter_by(token=token).first()
    if not token_obj:
        return jsonify({"error": "Token not found"}), 400
    data = request.get_json()
    try:
        user_id = token_data['user_id']
    except KeyError:
        return jsonify({"error": "Invalid token payload"}), 401
    response, status = save_spotify_credential(user_id, data)
    return jsonify(response), status


@user_bp.route("/spotify-credential", methods=["GET"])
@token_required
def get_user_spotify_credential(token_data):
    try:
        user_id = token_data['user_id']
    except KeyError:
        return jsonify({"error": "Invalid token payload"}), 401
    response, status = get_spotify_credential(user_id)
    return jsonify(response), status
