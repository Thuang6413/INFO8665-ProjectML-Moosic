from models import db, UserSpotifyCredential
from . import logger  # Assume logger is imported from services/__init__.py


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
