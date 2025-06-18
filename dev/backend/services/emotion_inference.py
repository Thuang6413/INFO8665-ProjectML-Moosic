# dev/backend/services/emotion_inference.py
import numpy as np
import cv2
import tensorflow as tf
from flask import current_app
from config import Config

# Emotion class mapping (FER2013 standard, assuming consistency across models)
EMOTION_LABELS = ["angry", "disgust", "fear", "happy", "sad", "surprise", "neutral"] ## TODO: Should change to match the model's output, valance and arousal

def preprocess_image(image_file):
    # Read image with OpenCV (BGR format)
    image = cv2.imdecode(np.frombuffer(image_file.read(), np.uint8), cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError("Failed to decode image")
    # Convert BGR to RGB
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    # Resize to 96x96
    image = cv2.resize(image, (96, 96))
    # Normalize to [0, 1]
    image_array = image.astype("float32") / 255.0
    # Add batch dimension
    image_array = np.expand_dims(image_array, axis=0)
    return image_array

def predict_emotion(image_file, model_name=None):
    try:
        print(f"[DEBUG] Using preloaded models for prediction")
        models = current_app.models  # Access models from app context
        if not models or not isinstance(models, dict):
            raise RuntimeError("Models are not preloaded or corrupted")

        # Default to first model if no model_name provided
        if model_name is None or model_name not in models:
            model_name = next(iter(models.keys()), None)
            print(f"[DEBUG] No model specified, using default: {model_name}")
        if model_name not in models or models[model_name] is None:
            raise ValueError(f"Model '{model_name}' not available")

        model = models[model_name]
        print(f"[DEBUG] Preprocessing image: {image_file}")
        image_array = preprocess_image(image_file)
        print("[DEBUG] Image preprocessed successfully")
        print(f"[DEBUG] Image shape: {image_array.shape}")
        if image_array.shape[1:] != (96, 96, 3):
            raise ValueError(f"Unexpected image shape: {image_array.shape}")
        print(f"[DEBUG] Making prediction with model: {model_name}")
        predictions = model.predict(image_array)
        print("[DEBUG] Prediction completed")
        if predictions.ndim != 2 or predictions.shape[0] != 1:
            raise ValueError(f"Unexpected prediction shape: {predictions.shape}")
        print(f"[DEBUG] Model predictions: {predictions}")
        emotion_index = np.argmax(predictions[0])
        print(f"[DEBUG] Predicted emotion index: {emotion_index}, probabilities: {predictions[0]}")
        emotion = EMOTION_LABELS[emotion_index]        
        return emotion
    except Exception as e:
        print(f"[ERROR] Emotion prediction failed: {e}")
        return "Unable to predict emotion"