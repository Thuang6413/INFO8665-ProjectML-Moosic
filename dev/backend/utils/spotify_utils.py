import math
from . import logger
from datetime import datetime, timedelta
import os
from sqlalchemy.sql import select
from models import db, Song, UserSpotifyCredential
from config import Config
from spotipy.oauth2 import SpotifyOAuth
import spotipy


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
            cache_path=None
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
    logger.debug(
        f"Spotify client initialized for user_id: {user_id}, scope: {Config.SPOTIFY_SCOPES}")
    return sp


def recommend_song_by_valence(target_valence, target_arousal, user_id, exclude_track_ids=None):
    """
    Recommend and play a song from SQLite based on the target valence and arousal values.
    Excludes songs in exclude_track_ids. Returns the recommended song info or None if failed.
    """
    if exclude_track_ids is None:
        exclude_track_ids = set()

    try:
        with db.session() as session:
            songs = session.query(Song).filter(
                Song.spotify_id.isnot(None),
                Song.valence_tags.isnot(None),
                Song.arousal_tags.isnot(None),
                # Filter out already played songs
                ~Song.spotify_id.in_(exclude_track_ids)
            ).all()
        logger.debug(
            f"Found {len(songs)} songs in the database with valid Spotify IDs, valence, and arousal tags after excluding {len(exclude_track_ids)} tracks.")

        if not songs:
            logger.warning(
                "No suitable songs found in database after excluding played tracks.")
            return None

        min_distance = float('inf')
        closest_song = None
        for song in songs:
            # Calculate Euclidean distance for valence and arousal
            valence_diff = abs(song.valence_tags - target_valence)
            arousal_diff = abs(song.arousal_tags - target_arousal)
            distance = math.sqrt(valence_diff**2 + arousal_diff**2)

            if distance < min_distance:
                min_distance = distance
                closest_song = song

        if closest_song is None:
            logger.warning("No suitable song found after filtering.")
            return None

        track_name = closest_song.track
        artist_name = closest_song.artist
        valence_value = closest_song.valence_tags
        arousal_value = closest_song.arousal_tags
        spotify_uri = f"spotify:track:{closest_song.spotify_id}"

        logger.info(
            f"Target Valence: {target_valence}, Target Arousal: {target_arousal}")
        logger.info(
            f"Closest match: '{track_name}' by {artist_name} (valence: {valence_value}, arousal: {arousal_value})")

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
        if active_device_id != devices['devices'][0]['id']:
            logger.info(
                f"Switching playback to {devices['devices'][0]['name']}")

        sp.start_playback(device_id=active_device_id, uris=[spotify_uri])
        logger.info("Playback started.")
        return {
            "track_name": track_name,
            "spotify_id": closest_song.spotify_id,
            "valence": valence_value,
            "arousal": arousal_value
        }
    except Exception as e:
        logger.error(f"Failed to recommend song: {e}")
        return None
