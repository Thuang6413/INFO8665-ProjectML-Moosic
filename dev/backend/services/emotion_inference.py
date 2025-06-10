# dev/backend/services/emotion_inference.py
import os
import joblib
import numpy as np
from PIL import Image

# Set model path
from config import MODEL_PATHS
MODEL_PATH = MODEL_PATHS["emotion_face"]

# Load model (assumed to be in scikit-learn format)
try:
    model = joblib.load(MODEL_PATH)
except Exception as e:
    model = None
    print(f"[ERROR] Failed to load model: {e}")

def preprocess_image(image_file):
    # Convert to grayscale, resize to 48x48, normalize
    image = Image.open(image_file).convert('L').resize((48, 48))
    image_array = np.asarray(image) / 255.0
    return image_array.flatten()

def predict_emotion(image_file):
    if not model:
        return "Model not available"
    image_array = preprocess_image(image_file)
    prediction = model.predict([image_array])[0]
    return prediction
