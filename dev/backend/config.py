import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATHS = {
    "emotion_face": os.path.join(BASE_DIR, "ai_models", "emotion_model.pkl")
}
