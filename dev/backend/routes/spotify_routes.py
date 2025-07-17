# dev/backend/routes/spotify_routes.py
from flask import Blueprint, request, jsonify, redirect
from services.spotify_service import generate_spotify_auth_url, handle_spotify_callback
from utils.auth_utils import token_required

spotify_bp = Blueprint("spotify", __name__)


@spotify_bp.route("/authorize", methods=["GET"])
@token_required
def spotify_authorize(token_data):
    try:
        user_id = token_data['user_id']
    except KeyError:
        return jsonify({"error": "Invalid token payload"}), 401
    response, status = generate_spotify_auth_url(user_id)
    if status == 200:
        return jsonify(response), 200  # Frontend should redirect to auth_url
    return jsonify(response), status


def spotify_callback():
    code = request.args.get('code')
    state = request.args.get('state')
    error = request.args.get('error')

    if error:
        return jsonify({"error": error}), 400
    if not code or not state:
        return jsonify({"error": "Missing code or state"}), 400

    response, status = handle_spotify_callback(code, state)
    if status == 200:
        # Redirect to frontend success page
        return redirect("http://127.0.0.1:3000/success")
    return jsonify(response), status
