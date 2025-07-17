# dev/backend/config.py
import os


class Config:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

    MODEL_PATHS = {
        # "emotion_face_affectnet": os.path.join(BASE_DIR, "ai_models", "Emotion_Recognition_Model.h5"),
        "emotion_face_fer2013": os.path.join(BASE_DIR, "ai_models", "fer2013_emotion_recognition_model.h5")
    }

    # Database Configuration
    DATABASE_PATH = os.path.join(BASE_DIR, 'moosic.db')
    SQLALCHEMY_DATABASE_URI = f'sqlite:///{DATABASE_PATH}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # JWT Configuration
    SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'moosic-secret')
    JWT_EXPIRATION_DELTA = 3600

    # Spotify API Configuration
    CLIENT_ID = os.getenv('SPOTIFY_CLIENT_ID', 'default_client_id')
    CLIENT_SECRET = os.getenv('SPOTIFY_CLIENT_SECRET', 'default_client_secret')
    REDIRECT_URI = os.getenv(
        'SPOTIFY_REDIRECT_URI', 'http://127.0.0.1:5000/spotify/callback')  # Ensure consistency

    # Spotify Callback URLs
    SPOTIFY_AUTHORIZE_URL = 'https://accounts.spotify.com/authorize'
    SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token'
    SPOTIFY_SCOPES = 'user-read-playback-state user-modify-playback-state user-read-private streaming'
