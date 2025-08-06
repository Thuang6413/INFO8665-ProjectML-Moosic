import numpy as np
import cv2
import tensorflow as tf
from flask import current_app, jsonify
from utils.spotify_utils import recommend_song_by_valence
from . import logger

# Emotion class mapping (FER2013 standard)
EMOTION_LABELS = ["angry", "disgust", "fear",
                  "happy", "sad", "surprise", "neutral"]


def preprocess_image(image_file, target_shape):
    """Preprocess image according to model's input shape."""
    image = cv2.imdecode(np.frombuffer(
        image_file.read(), np.uint8), cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError("Failed to decode image")

    height, width, channels = target_shape[1:]

    if channels == 1:
        image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        image = cv2.resize(image, (width, height))
        image = image.reshape(height, width, 1)
    else:
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        image = cv2.resize(image, (width, height))

    image = image.astype("float32") / 255.0
    image_array = np.expand_dims(image, axis=0)

    return image_array


def predict_emotion(image_file, model_name=None, user_id=None):
    try:
        logger.debug("[DEBUG] Using preloaded models for prediction")
        models = current_app.models
        if not models or not isinstance(models, dict):
            raise RuntimeError("Models are not preloaded or corrupted")

        if model_name is None or model_name not in models:
            model_name = next(iter(models.keys()), None)
            logger.debug(
                f"[DEBUG] No model specified, using default: {model_name}")
        if model_name not in models or models[model_name] is None:
            raise ValueError(f"Model '{model_name}' not available")

        model = models[model_name]
        target_shape = model.input_shape
        logger.debug(f"[DEBUG] Model input shape: {target_shape}")

        image_file.seek(0)
        image_array = preprocess_image(image_file, target_shape)
        logger.debug(
            f"[DEBUG] Image preprocessed successfully with shape: {image_array.shape}")

        predictions = model.predict(image_array)
        logger.debug(
            f"[DEBUG] Raw predictions: {predictions}, type: {type(predictions)}, shape: {getattr(predictions, 'shape', 'No shape attribute')}")

        if model_name == "emotion_face_fer2013":
            if isinstance(predictions, list):
                predictions = np.array(predictions, dtype=np.float32)
            if len(predictions.shape) == 1:
                predictions = predictions.reshape(1, -1)
            if len(predictions.shape) != 2 or predictions.shape[0] != 1:
                raise ValueError(
                    f"Unexpected prediction shape: {predictions.shape}")

            emotion_index = np.argmax(predictions[0])
            emotion = EMOTION_LABELS[emotion_index]
            logger.debug(
                f"[DEBUG] Predicted emotion: {emotion}, Probabilities: {predictions[0]}")
            valence_map = {
                "angry": -0.7, "disgust": -0.5, "fear": -0.3,
                "happy": 0.9, "sad": -0.4, "surprise": 0.6, "neutral": 0.0
            }
            predicted_valence = valence_map.get(emotion, 0.0)
            standardized_valence = (predicted_valence + 1) / 2 * 7
            standardized_arousal = None
        else:  # mood_predictor
            if isinstance(predictions, (list, tuple)) and len(predictions) >= 2:
                # Extract scalar values
                predicted_valence = float(np.squeeze(predictions[0]))
                predicted_arousal = float(np.squeeze(predictions[1]))
                expression_output = np.squeeze(
                    predictions[2]) if len(predictions) > 2 else None
                logger.debug(
                    f"[DEBUG] Mood predictor outputs: Valence: {predicted_valence}, Arousal: {predicted_arousal}, Expression: {expression_output}")
                standardized_valence = (predicted_valence + 1) / 2 * 7
                standardized_arousal = (predicted_arousal + 1) / 2 * 7
                emotion = "N/A"
            else:
                raise ValueError(
                    f"Unexpected predictions format for mood_predictor: {predictions}")

        logger.debug(
            f"[DEBUG] Standardized valence: {standardized_valence}, arousal: {standardized_arousal}")

        try:
            recommended_song = recommend_song_by_valence(
                standardized_valence, standardized_arousal, user_id)
            recommended_song_name = recommended_song["track_name"] if recommended_song else "No song found"
            recommended_song_url = f"https://open.spotify.com/track/{recommended_song['spotify_id']}" if recommended_song else ""
            recommended_valence = recommended_song["valence"] if recommended_song else None
            recommended_arousal = recommended_song["arousal"] if recommended_song else None
        except Exception as e:
            logger.debug(f"[WARNING] Song recommendation failed: {e}")
            recommended_song_name = "Recommendation failed"
            recommended_song_url = ""
            recommended_valence = None
            recommended_arousal = None

        response = {
            "emotion": emotion,
            "valence": round(standardized_valence, 2),
            "arousal": round(standardized_arousal, 2) if standardized_arousal is not None else None,
            "recommended_song_name": recommended_song_name,
            "recommended_song_url": recommended_song_url,
            "recommended_valence": recommended_valence,
            "recommended_arousal": recommended_arousal
        }
        return jsonify(response)

    except Exception as e:
        logger.error(f"[ERROR] Emotion prediction failed: {str(e)}")
        return jsonify({"error": f"Emotion prediction failed: {str(e)}"}), 500
