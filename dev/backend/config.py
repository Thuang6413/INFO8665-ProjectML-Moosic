# dev/backend/config.py
import os

class Config:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

    MODEL_PATHS = {
        "emotion_face": os.path.join(BASE_DIR, "ai_models", "emotion_model.pkl")
    }

    # Database Configuration
    DATABASE_PATH = os.path.join(BASE_DIR, 'moosic.db')
    SQLALCHEMY_DATABASE_URI = f'sqlite:///{DATABASE_PATH}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # JWT Configuration
    SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'moosic-secret')  # Use env variable or fallback
    JWT_EXPIRATION_DELTA = 3600  # Token expiration in seconds (1 hour)