import secrets
from models import db, User, UserSpotifyCredential, Token
from . import logger
import requests
import base64
from datetime import datetime, timedelta
from flask import current_app
from spotipy.oauth2 import SpotifyOAuth
from utils.auth_utils import generate_token
from config import Config
import spotipy


def save_spotify_credential(user_id, data):
    try:
        credential = UserSpotifyCredential.query.filter_by(
            user_id=user_id).first()
        if credential:
            credential.client_id = data.get('client_id')
            credential.client_secret = data.get('client_secret')
            credential.access_token = data.get('access_token')
            credential.refresh_token = data.get('refresh_token')
            credential.expires_at = data.get('expires_at')
            logger.info(f"Updated Spotify credential for user_id: {user_id}")
        else:
            credential = UserSpotifyCredential(
                user_id=user_id,
                client_id=data.get('client_id'),
                client_secret=data.get('client_secret'),
                access_token=data.get('access_token'),
                refresh_token=data.get('refresh_token'),
                expires_at=data.get('expires_at')
            )
            db.session.add(credential)
            logger.info(f"Created Spotify credential for user_id: {user_id}")

        db.session.commit()
        return {"message": "Spotify credential saved successfully"}, 200
    except Exception as e:
        db.session.rollback()
        logger.error(
            f"Failed to save Spotify credential for user_id {user_id}: {str(e)}")
        return {"error": f"Failed to save: {str(e)}"}, 500


def get_spotify_credential(user_id):
    try:
        credential = UserSpotifyCredential.query.filter_by(
            user_id=user_id).first()
        if not credential:
            return {"error": "No Spotify credential found"}, 404
        return {
            "client_id": credential.client_id,
            "client_secret": credential.client_secret,
            "access_token": credential.access_token,
            "refresh_token": credential.refresh_token,
            "expires_at": credential.expires_at
        }, 200
    except Exception as e:
        logger.error(
            f"Failed to get Spotify credential for user_id {user_id}: {str(e)}")
        return {"error": f"Failed to retrieve: {str(e)}"}, 500


def generate_spotify_auth_url(user_id):
    try:
        credential = UserSpotifyCredential.query.filter_by(
            user_id=user_id).first()
        if not credential or not credential.client_id:
            return {"error": "No Spotify credentials found for user"}, 404

        scope = current_app.config.get(
            'SPOTIFY_SCOPES', 'user-read-playback-state user-modify-playback-state user-read-private streaming')
        redirect_uri = current_app.config.get(
            'SPOTIFY_REDIRECT_URI', 'http://127.0.0.1:5000/spotify/callback')

        state = base64.b64encode(
            f"{user_id}:{generate_random_string(16)}".encode()).decode()

        auth_manager = SpotifyOAuth(
            client_id=credential.client_id,
            client_secret=credential.client_secret,
            redirect_uri=redirect_uri,
            scope=scope,
            show_dialog=True,
            state=state
        )
        auth_url = auth_manager.get_authorize_url()
        logger.debug(f"Generated Spotify auth_url: {auth_url}")
        return {"auth_url": auth_url}, 200
    except Exception as e:
        logger.error(
            f"Failed to generate Spotify auth URL for user_id {user_id}: {str(e)}")
        return {"error": f"Failed to generate auth URL: {str(e)}"}, 500


def handle_spotify_callback(code, state=None):
    try:
        decoded_state = base64.b64decode(state).decode()
        user_id, _ = decoded_state.split(':')
        user_id = int(user_id)

        credential = UserSpotifyCredential.query.filter_by(
            user_id=user_id).first()
        if not credential:
            return {"error": "Invalid state or user not found"}, 400

        redirect_uri = current_app.config.get(
            'SPOTIFY_REDIRECT_URI', 'http://127.0.0.1:5000/spotify/callback')
        scope = current_app.config.get(
            'SPOTIFY_SCOPES', 'user-read-playback-state user-modify-playback-state user-read-private streaming')

        logger.debug(f"Handling Spotify callback for user_id: {user_id}")
        logger.debug(f"Using redirect_uri: {redirect_uri}, scope: {scope}")
        auth_manager = SpotifyOAuth(
            client_id=credential.client_id,
            client_secret=credential.client_secret,
            redirect_uri=redirect_uri,
            scope=scope,
            show_dialog=True
        )

        token_info = auth_manager.get_access_token(code)
        credential.access_token = token_info['access_token']
        credential.refresh_token = token_info.get('refresh_token')
        credential.expires_at = datetime.utcnow(
        ) + timedelta(seconds=token_info['expires_in'])
        db.session.commit()
        logger.info(f"Spotify tokens saved for user_id: {user_id}")
        return {"message": "Spotify authorization successful"}, 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Spotify callback failed: {str(e)}")
        return {"error": str(e)}, 500


def generate_random_string(length):
    return secrets.token_hex(length // 2)


def handle_spotify_sso_callback(code, state=None):
    print(f"Handling Spotify SSO callback with code: {code}, state: {state}")
    try:
        # Initialize Spotify OAuth with app-wide credentials
        redirect_sso_uri = current_app.config.get(
            'SPOTIFY_REDIRECT_SSO_URI', 'http://127.0.0.1:5000/sso/callback')
        scope = current_app.config.get(
            'SPOTIFY_SCOPES', 'user-read-playback-state user-modify-playback-state user-read-private streaming')
        logger.debug(
            f"SSO callback redirect_sso_uri: {redirect_sso_uri}, scope: {scope}")
        auth_manager = SpotifyOAuth(
            client_id=Config.SPOTIFY_CLIENT_ID,
            client_secret=Config.SPOTIFY_CLIENT_SECRET,
            redirect_uri=redirect_sso_uri,
            scope=scope,
            show_dialog=True,
            cache_path=None  # Disable cache
        )

        # Exchange code for tokens
        token_info = auth_manager.get_access_token(code)
        if not token_info:
            logger.error("Failed to retrieve token_info")
            return {"error": "Failed to retrieve access token"}, 400

        access_token = token_info['access_token']
        refresh_token = token_info.get('refresh_token')
        expires_at = datetime.utcnow(
        ) + timedelta(seconds=token_info['expires_in'])

        # Get user profile from Spotify
        sp = spotipy.Spotify(auth=access_token)
        user_profile = sp.current_user()
        spotify_user_id = user_profile['id']
        email = user_profile.get('email', '')

        logger.debug(f"Full Spotify user profile: {user_profile}")

        # Check if user exists with this Spotify ID
        user = User.query.filter_by(spotify_user_id=spotify_user_id).first()
        if not user:
            # Create new user
            user = User(
                username=email or f"spotify_{spotify_user_id}",
                spotify_user_id=spotify_user_id
            )
            db.session.add(user)
            db.session.commit()
            logger.info(f"Created new user with Spotify ID: {spotify_user_id}")

        # Save or update Spotify credentials
        credential = UserSpotifyCredential.query.filter_by(
            user_id=user.id).first()
        if credential:
            credential.access_token = access_token
            credential.refresh_token = refresh_token
            credential.expires_at = expires_at
        else:
            credential = UserSpotifyCredential(
                user_id=user.id,
                client_id=Config.SPOTIFY_CLIENT_ID,
                client_secret=Config.SPOTIFY_CLIENT_SECRET,
                access_token=access_token,
                refresh_token=refresh_token,
                expires_at=expires_at
            )
            db.session.add(credential)
        db.session.commit()

        # Generate JWT token
        token = generate_token(user.id, user.username or user.spotify_user_id)
        token_obj = Token(
            token=token,
            user_id=user.id,
            expires_at=datetime.utcnow() +
            timedelta(seconds=current_app.config['JWT_EXPIRATION_DELTA'])
        )
        db.session.add(token_obj)
        db.session.commit()
        logger.info(
            f"SSO login successful for Spotify user: {spotify_user_id}")

        return {
            "message": "Spotify SSO login successful",
            "token": token,
            "user_id": user.id
        }, 200
    except Exception as e:
        db.session.rollback()
        # print where the error occurred and specific line number
        print(
            f"Error in handle_spotify_sso_callback: {e} at line {e.__traceback__.tb_lineno}")
        logger.error(f"Spotify SSO callback failed: {str(e)}")
        return {"error": str(e)}, 500
