import spotipy
from spotipy.oauth2 import SpotifyOAuth
from config import Config
from models import db, Song, UserSpotifyCredential
from sqlalchemy.sql import select
import os
from datetime import datetime, timedelta
from . import logger


def get_spotify_client(user_id):
    """
    Create and return a Spotify API client using credentials from database.
    """
    credential = UserSpotifyCredential.query.filter_by(user_id=user_id).first()
    if not credential:
        logger.error(f"No Spotify credential found for user_id: {user_id}")
        return None

    # Check if token is expired
    if credential.expires_at < datetime.utcnow():
        # Refresh token
        auth_manager = SpotifyOAuth(
            client_id=credential.client_id,
            client_secret=credential.client_secret,
            redirect_uri=Config.REDIRECT_URI,
            scope=Config.SPOTIFY_SCOPES,
        )
        try:
            token_info = auth_manager.refresh_access_token(
                credential.refresh_token)
            credential.access_token = token_info['access_token']
            credential.expires_at = datetime.utcnow(
            ) + timedelta(seconds=token_info['expires_in'])
            db.session.commit()
            logger.debug(f"Token refreshed for user_id: {user_id}")
        except Exception as e:
            logger.error(f"Token refresh failed for user_id: {user_id}: {e}")
            return None

    sp = spotipy.Spotify(auth=credential.access_token)
    logger.debug(f"Spotify client initialized for user_id: {user_id}")
    return sp


def recommend_song_by_valence(target_valence, user_id):
    """
    Recommend and play a song from SQLite based on the target valence value.
    Returns the recommended song info or None if failed.
    """
    try:
        with db.session() as session:
            songs = session.query(Song).filter(
                Song.spotify_id.isnot(None),
                Song.valence_tags.isnot(None)
            ).all()
        logger.debug(
            f"Found {len(songs)} songs in the database with valid Spotify IDs and valence tags.")

        if not songs:
            logger.warning("No suitable songs found in database.")
            return None

        min_diff = float('inf')
        closest_song = None
        for song in songs:
            valence_diff = abs(song.valence_tags - target_valence)
            if valence_diff < min_diff:
                min_diff = valence_diff
                closest_song = song

        logger.debug(
            f"Closest song found: {closest_song.track} by {closest_song.artist} with valence {closest_song.valence_tags}")
        if closest_song is None:
            logger.warning("No suitable song found.")
            return None

        track_name = closest_song.track
        artist_name = closest_song.artist
        valence_value = closest_song.valence_tags
        spotify_uri = f"spotify:track:{closest_song.spotify_id}"

        logger.info(f"Target Valence: {target_valence}")
        logger.info(
            f"Closest match: '{track_name}' by {artist_name} (valence: {valence_value})")

        sp = get_spotify_client(user_id)
        if not sp:
            logger.error("Spotify client could not be initialized.")
            return None

        devices = sp.devices()
        if not devices['devices']:
            logger.warning(
                "No active Spotify devices found. Open Spotify on your device.")
            return None

        active_device_id = next(
            (d['id'] for d in devices['devices'] if d['is_active']), devices['devices'][0]['id'])
        if not active_device_id == devices['devices'][0]['id']:
            logger.info(
                f"Switching playback to {devices['devices'][0]['name']}")

        sp.start_playback(device_id=active_device_id, uris=[spotify_uri])
        logger.info("Playback started.")
        return {
            "track_name": track_name,
            "spotify_id": closest_song.spotify_id
        }
    except Exception as e:
        logger.error(f"Failed to recommend song: {e}")
        return None
