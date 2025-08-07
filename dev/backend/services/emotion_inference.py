import numpy as np
import cv2
import tensorflow as tf
from flask import current_app, jsonify
from utils.spotify_utils import recommend_song_by_valence
from . import logger, detector
import os
import tempfile
import torch

# Emotion class mapping (FER2013 standard)
EMOTION_LABELS = ["angry", "disgust", "fear",
                  "happy", "sad", "surprise", "neutral"]


def initialize_played_songs():
    """Initialize played_songs in the application context."""
    with current_app.app_context():
        if not hasattr(current_app, 'played_songs'):
            current_app.played_songs = {}


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
        initialize_played_songs()

        logger.debug("[DEBUG] Using preloaded models for prediction")
        models = current_app.models
        if not models or not isinstance(models, dict):
            raise RuntimeError("Models are not preloaded or corrupted")

        # According to the logs, you always want to use the py-feat detector
        # If you have different models that require different logic, you should use model_name here
        # Here we assume py-feat is always used
        logger.debug(f"[DEBUG] Using py-feat detector.")

        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_file:
            image_file.save(temp_file.name)
            temp_file_path = temp_file.name

        try:
            # Removed redundant model.predict() and preprocess_image()
            # Because py-feat handles image reading and preprocessing itself

            logger.debug(
                f"[DEBUG] Temp file path: {temp_file_path}, exists: {os.path.exists(temp_file_path)}")

            # --- Main modification ---
            # Use torch.no_grad() to disable gradient calculation
            with torch.no_grad():
                predictions = detector.detect_image(
                    temp_file_path, output_size=(224, 224), batch_size=1)
            # --- End modification ---

            # Debug the emotions data
            logger.debug(
                f"[DEBUG] Predictions type: {type(predictions)}, emotions: {predictions.emotions}")

            # Ensure predictions is not empty
            if predictions.emotions.empty:
                raise ValueError(
                    "py-feat detector failed to detect any face or emotion.")

            emotions = predictions.emotions.iloc[0]
            # Your code already has this handling, which is good practice, but the error occurs before this
            if isinstance(emotions, torch.Tensor):
                emotions = emotions.detach().cpu().numpy()

            logger.debug(
                f"[DEBUG] Detected emotions (post-detach): {emotions.to_dict() if hasattr(emotions, 'to_dict') else emotions}")

            # Use idxmax() to find the emotion with the highest score
            emotion = emotions.idxmax() if hasattr(emotions, 'idxmax') else "N/A"
            logger.debug(f"[DEBUG] Predicted emotion: {emotion}")

            # Valence and Arousal calculation (keep this part unchanged)
            valence = (
                emotions["happiness"] * 0.9 +
                emotions["sadness"] * -0.9 +
                emotions["anger"] * -0.8 +
                emotions["disgust"] * -0.6 +
                emotions["fear"] * -0.9 +
                emotions["surprise"] * 0.2 +
                emotions["neutral"] * 0.0
            )

            arousal = (
                emotions["happiness"] * 0.9 +
                emotions["sadness"] * -0.2 +
                emotions["anger"] * 0.8 +
                emotions["disgust"] * 0.3 +
                emotions["fear"] * 0.9 +
                emotions["surprise"] * 0.9 +
                emotions["neutral"] * 0.0
            )

            # Normalization (the range here is 0-9, Spotify's valence is -1~1)
            # You may consider adjusting this normalization formula
            standardized_valence = valence
            standardized_arousal = arousal
            # standardized_valence = (valence + 1) / 2 * 9
            # standardized_arousal = (arousal + 1) / 2 * 9

            # --- The following song recommendation logic remains unchanged ---

            with current_app.app_context():
                if user_id and user_id not in current_app.played_songs:
                    current_app.played_songs[user_id] = set()

            try:
                with current_app.app_context():
                    exclude_track_ids = current_app.played_songs.get(
                        user_id, set())
                recommended_song = recommend_song_by_valence(
                    standardized_valence, standardized_arousal, user_id, exclude_track_ids=exclude_track_ids)
                recommended_song_name = recommended_song["track_name"] if recommended_song else "No song found"
                # Note: This URL format may be incorrect, Spotify's URL format is https://open.spotify.com/track/TRACK_ID
                recommended_song_url = f"https://open.spotify.com/track/{recommended_song['spotify_id']}" if recommended_song else ""
                recommended_valence = recommended_song["valence"] if recommended_song else None
                recommended_arousal = recommended_song["arousal"] if recommended_song else None

                if recommended_song and user_id:
                    with current_app.app_context():
                        current_app.played_songs[user_id].add(
                            recommended_song['spotify_id'])
                        logger.debug(
                            f"[DEBUG] Added song {recommended_song['spotify_id']} to played list for user {user_id}")

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

        finally:
            if 'temp_file_path' in locals() and os.path.exists(temp_file_path):
                os.unlink(temp_file_path)

    except Exception as e:
        logger.error(
            f"[ERROR] Emotion prediction failed: {str(e)}, line: {e.__traceback__.tb_lineno}")
        return jsonify({"error": f"Emotion prediction failed: {str(e)}"}), 500
