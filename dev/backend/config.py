# dev/backend/config.py
import os


class Config:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

    MODEL_PATHS = {
        "emotion_face_affectnet": os.path.join(BASE_DIR, "ai_models", "Emotion_Recognition_Model.h5"),
        # "emotion_face_fer2013": os.path.join(BASE_DIR, "ai_models", "fer2013_emotion_recognition_model.h5")
    }

    # Database Configuration
    DATABASE_PATH = os.path.join(BASE_DIR, 'moosic.db')
    SQLALCHEMY_DATABASE_URI = f'sqlite:///{DATABASE_PATH}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # JWT Configuration
    SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'moosic-secret')
    JWT_EXPIRATION_DELTA = 3600
