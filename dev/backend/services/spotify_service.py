import secrets
from models import db, UserSpotifyCredential
from . import logger  # Assume logger is imported from services/__init__.py
import requests
import base64
from datetime import datetime, timedelta
from flask import current_app
from spotipy.oauth2 import SpotifyOAuth
import os


def save_spotify_credential(user_id, data):
    try:
        # Check if credential already exists, update if it does
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
            # Create new credential if not exists
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
        # Retrieve credential for the given user_id
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
            'SPOTIFY_SCOPE', 'user-read-playback-state user-modify-playback-state user-read-private streaming')
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
            cache_path=os.path.join(current_app.root_path, '.spotify_cache'),
            state=state  # Pass the state here
        )
        auth_url = auth_manager.get_authorize_url()
        return {"auth_url": auth_url}, 200

    except Exception as e:
        logger.error(
            f"Failed to generate Spotify auth URL for user_id {user_id}: {str(e)}")
        return {"error": f"Failed to generate auth URL: {str(e)}"}, 500


def handle_spotify_callback(code, state):
    try:
        # Parse state to get user_id
        decoded_state = base64.b64decode(state).decode()
        # Ignore random part, only get user_id
        user_id, _ = decoded_state.split(':')
        user_id = int(user_id)

        credential = UserSpotifyCredential.query.filter_by(
            user_id=user_id).first()
        if not credential:
            return {"error": "Invalid state or user not found"}, 400

        redirect_uri = current_app.config.get(
            'SPOTIFY_REDIRECT_URI', 'http://127.0.0.1:5000/spotify/callback')
        scope = current_app.config.get(
            'SPOTIFY_SCOPE', 'user-read-playback-state user-modify-playback-state user-read-private streaming')

        auth_manager = SpotifyOAuth(
            client_id=credential.client_id,
            client_secret=credential.client_secret,
            redirect_uri=redirect_uri,
            scope=scope,
            show_dialog=True,
            cache_path=os.path.join(current_app.root_path, '.spotify_cache')
        )

        # Exchange code for token using SpotifyOAuth
        token_info = auth_manager.get_access_token(code)

        # Update DB
        credential.access_token = token_info['access_token']
        credential.refresh_token = token_info.get('refresh_token')
        credential.expires_at = datetime.utcnow(
        ) + timedelta(seconds=token_info['expires_in'])
        db.session.commit()
        logger.info(f"Spotify tokens saved for user_id: {user_id}")

        # Or redirect to frontend
        return {"message": "Spotify authorization successful"}, 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Spotify callback failed: {str(e)}")
        return {"error": str(e)}, 500


# Helper function: generate random string
def generate_random_string(length):
    return secrets.token_hex(length // 2)
