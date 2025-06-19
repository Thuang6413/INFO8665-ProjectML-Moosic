import numpy as np
import cv2
import tensorflow as tf
from flask import current_app, jsonify
from utils.spotify_utils import recommend_song_by_valence

# Emotion class mapping (FER2013 standard, -1 to 1 range)
EMOTION_LABELS = ["angry", "disgust", "fear", "happy", "sad", "surprise", "neutral"]

def preprocess_image(image_file):
    image = cv2.imdecode(np.frombuffer(image_file.read(), np.uint8), cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError("Failed to decode image")
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    image = cv2.resize(image, (48, 48))
    image_array = image.astype("float32") / 255.0
    image_array = np.expand_dims(image_array, axis=0)
    return image_array

def predict_emotion(image_file, model_name=None):
    try:
        print(f"[DEBUG] Using preloaded models for prediction")
        models = current_app.models
        if not models or not isinstance(models, dict):
            raise RuntimeError("Models are not preloaded or corrupted")

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
        if image_array.shape[1:] != (48, 48, 3):
            raise ValueError(f"Unexpected image shape: {image_array.shape}, expected (48, 48, 3)")
        print(f"[DEBUG] Making prediction with model: {model_name}")
        predictions = model.predict(image_array)
        print("[DEBUG] Prediction completed")
        if predictions.ndim != 2 or predictions.shape[0] != 1:
            raise ValueError(f"Unexpected prediction shape: {predictions.shape}")
        print(f"[DEBUG] Model predictions: {predictions}")
        emotion_index = np.argmax(predictions[0])
        print(f"[DEBUG] Predicted emotion index: {emotion_index}, probabilities: {predictions[0]}")
        emotion = EMOTION_LABELS[emotion_index]
        print(f"[DEBUG] Predicted emotion: {emotion}")

        # Map emotion to valence (-1 to 1 range)
        valence_map = {
            "angry": -0.7, "disgust": -0.5, "fear": -0.3,
            "happy": 0.9, "sad": -0.4, "surprise": 0.6, "neutral": 0.0
        }
        predicted_valence = valence_map.get(emotion, 0.0)

        # Standardize valence from [-1, 1] to [0, 10] to match database range
        standardized_valence = ((predicted_valence + 1) / 2) * 10

        # Recommend song and capture result
        print(f"[DEBUG] Recommending song with valence: {standardized_valence}")
        try:
            recommended_song = recommend_song_by_valence(standardized_valence)
            recommended_song_name = recommended_song["track_name"] if recommended_song else "No song found"
            recommended_song_url = f"https://open.spotify.com/track/{recommended_song['spotify_id']}" if recommended_song else ""
        except Exception as e:
            print(f"[WARNING] Song recommendation failed: {e}")
            recommended_song_name = "Recommendation failed"
            recommended_song_url = ""

        # Return JSON response
        response = {
            "emotion": emotion,
            "valence": round(standardized_valence, 2),  # Rounded for readability
            "recommended_song_name": recommended_song_name,
            "recommended_song_url": recommended_song_url
        }
        return jsonify(response)

    except Exception as e:
        print(f"[ERROR] Emotion prediction failed: {e}")
        return jsonify({"error": "Unable to predict emotion"})