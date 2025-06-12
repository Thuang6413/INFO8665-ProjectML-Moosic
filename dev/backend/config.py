# dev/backend/config.py
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATHS = {
    "emotion_face": os.path.join(BASE_DIR, "ai_models", "emotion_model.pkl")
}

# Database Configuration
# Use an absolute path for the SQLite database
DATABASE_PATH = os.path.join(BASE_DIR, 'moosic.db')
SQLALCHEMY_DATABASE_URI = f'sqlite:///{DATABASE_PATH}'
SQLALCHEMY_TRACK_MODIFICATIONS = False