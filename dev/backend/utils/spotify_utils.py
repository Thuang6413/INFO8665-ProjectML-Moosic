# dev/backend/utils/spotify_utils.py
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from config import Config
from models import db, Song
from sqlalchemy.sql import select
import os

def get_spotify_client():
    """
    Create and return a Spotify API client.
    """
    scope = 'user-read-playback-state user-modify-playback-state user-read-private streaming'
    cache_path = os.path.join(os.path.dirname(__file__), '..', '.spotify_cache')
    auth_manager = SpotifyOAuth(
        client_id=Config.CLIENT_ID,
        client_secret=Config.CLIENT_SECRET,
        redirect_uri=Config.REDIRECT_URI,
        scope=scope,
        cache_path=cache_path
    )
    sp = spotipy.Spotify(auth_manager=auth_manager)
    token_info = auth_manager.get_cached_token()
    print(f"[DEBUG] Spotify client initialized, token info: {token_info is not None}")
    if token_info and 'refresh_token' in token_info:
        try:
            token_info = auth_manager.refresh_access_token(token_info['refresh_token'])
            print(f"[DEBUG] Refreshed token: {token_info}")
        except Exception as e:
            print(f"[DEBUG] Refresh failed: {e}")
    return sp

def recommend_song_by_valence(target_valence):
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
        print(f"[DEBUG] Found {len(songs)} songs in the database with valid Spotify IDs and valence tags.")

        if not songs:
            print("No suitable songs found in database.")
            return None

        min_diff = float('inf')
        closest_song = None
        for song in songs:
            valence_diff = abs(song.valence_tags - target_valence)
            if valence_diff < min_diff:
                min_diff = valence_diff
                closest_song = song

        print(f"[DEBUG] Closest song found: {closest_song.track} by {closest_song.artist} with valence {closest_song.valence_tags}")
        if closest_song is None:
            print("No suitable song found.")
            return None

        track_name = closest_song.track
        artist_name = closest_song.artist
        valence_value = closest_song.valence_tags
        spotify_uri = f"spotify:track:{closest_song.spotify_id}"

        print(f"Target Valence: {target_valence}")
        print(f"Closest match: '{track_name}' by {artist_name} (valence: {valence_value})")

        sp = get_spotify_client()
        if not sp:
            print("[ERROR] Spotify client could not be initialized.")
            return None
        
        devices = sp.devices()
        if not devices['devices']:
            print("No active Spotify devices found. Open Spotify on your device.")
            return None

        active_device_id = next((d['id'] for d in devices['devices'] if d['is_active']), devices['devices'][0]['id'])
        if not active_device_id == devices['devices'][0]['id']:
            print(f"Switching playback to {devices['devices'][0]['name']}")

        sp.start_playback(device_id=active_device_id, uris=[spotify_uri])
        print("Playback started.")
        return {
            "track_name": track_name,
            "spotify_id": closest_song.spotify_id
        }
    except Exception as e:
        print(f"[ERROR] Failed to recommend song: {e}")
        return None