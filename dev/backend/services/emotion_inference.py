# dev/backend/services/emotion_inference.py

import numpy as np
from PIL import Image

try:
    from deepface import DeepFace
    USE_DEEPFACE = True
except ImportError:
    USE_DEEPFACE = False
    print("[ERROR] DeepFace is not installed. Install it with 'pip install deepface'.")

def preprocess_image(image_file):
    image = Image.open(image_file).convert('RGB')
    return np.asarray(image)

def predict_emotion(image_file):
    if not USE_DEEPFACE:
        return "DeepFace not available"

    try:
        image_array = preprocess_image(image_file)
        result = DeepFace.analyze(image_array, actions=["emotion"], enforce_detection=False)
        emotion = result[0]["dominant_emotion"]
        return emotion
    except Exception as e:
        print(f"[ERROR] DeepFace prediction failed: {e}")
        return "Unable to predict emotion"

