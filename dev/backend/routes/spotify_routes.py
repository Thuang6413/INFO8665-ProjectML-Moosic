from flask import Blueprint, request, jsonify, redirect, current_app
from services.spotify_service import generate_spotify_auth_url, handle_spotify_callback, handle_spotify_sso_callback
from utils.auth_utils import token_required
from spotipy.oauth2 import SpotifyOAuth
from config import Config
from . import logger  # Import logger

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
        return jsonify(response), 200
    return jsonify(response), status


@spotify_bp.route("/callback", methods=["GET"])
def spotify_callback():
    code = request.args.get('code')
    state = request.args.get('state')
    error = request.args.get('error')

    if error:
        return jsonify({"error": error}), 400
    if not code:
        return jsonify({"error": "Missing code parameter"}), 400

    response, status = handle_spotify_callback(code, state)
    if status == 200:
        return redirect(current_app.config.get('FRONTEND_URL', 'http://127.0.0.1:3000'))
    return jsonify(response), status


@spotify_bp.route("/sso/login", methods=["GET"])
def spotify_sso_login():
    try:
        scope = 'user-read-email user-read-playback-state user-modify-playback-state user-read-private streaming'
        redirect_sso_uri = current_app.config.get(
            'SPOTIFY_REDIRECT_SSO_URI', 'http://127.0.0.1:5000/sso/callback')
        # Log redirect URI
        logger.debug(f"Spotify SSO login redirect_uri: {redirect_sso_uri}")
        auth_manager = SpotifyOAuth(
            client_id=Config.SPOTIFY_CLIENT_ID,
            client_secret=Config.SPOTIFY_CLIENT_SECRET,
            redirect_uri=redirect_sso_uri,
            scope=scope,
            show_dialog=True,
            cache_path=None  # Disable cache to avoid issues with SSO
        )
        auth_url = auth_manager.get_authorize_url()
        logger.debug(f"Generated Spotify SSO auth_url: {auth_url}")
        return jsonify({"auth_url": auth_url}), 200
    except Exception as e:
        logger.error(f"Failed to generate Spotify SSO auth URL: {str(e)}")
        return jsonify({"error": f"Failed to generate auth URL: {str(e)}"}, 500)


@spotify_bp.route("/sso/callback", methods=["GET"])
def spotify_sso_callback():
    code = request.args.get('code')
    error = request.args.get('error')

    if error:
        logger.error(f"Spotify SSO callback error: {error}")
        return jsonify({"error": error}), 400
    if not code:
        logger.error("Spotify SSO callback missing code parameter")
        return jsonify({"error": "Missing code parameter"}), 400
    print(f"Handling Spotify SSO callback with code: {code}, error: {error}")

    response, status = handle_spotify_sso_callback(code)
    if status == 200:
        logger.debug(
            f"Spotify SSO callback successful, redirecting with token: {response['token'][:10]}...")
        return redirect(f"{current_app.config.get('FRONTEND_URL', 'http://127.0.0.1:3000')}?token={response['token']}")
    return jsonify(response), status
