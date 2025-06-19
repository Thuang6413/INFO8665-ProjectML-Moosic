# dev/backend/routes/emotion_routes.py
from flask import Blueprint, request, jsonify
from services.emotion_inference import predict_emotion

emotion_bp = Blueprint("emotion", __name__)


@emotion_bp.route("/face", methods=["POST"])
def detect_emotion_face():
    if 'image' not in request.files:
        return jsonify({"error": "Missing 'image' parameter"}), 400

    image = request.files["image"]
    model_name = request.form.get("model")  # Get model name from form data
    if not model_name:
        model_name = "emotion_face_fer2013"

    print(f"[DEBUG] Using model: {model_name} for emotion detection")
    emotion = predict_emotion(image, model_name)
    return jsonify({"emotion": emotion}), 200


@emotion_bp.route("/voice", methods=["POST"])
def detect_emotion_voice():
    if 'audio' not in request.files:
        return jsonify({"error": "Missing 'audio' parameter"}), 400
    return jsonify({"emotion": "Calm"})


@emotion_bp.route("/multi", methods=["POST"])
def detect_emotion_multi():
    if 'image' not in request.files or 'audio' not in request.files:
        return jsonify({"error": "Missing 'image' and/or 'audio' parameter"}), 400
    return jsonify({"emotion": "Neutral"})


@emotion_bp.route("/history", methods=["GET"])
def emotion_history():
    return jsonify({"history": ["Happy", "Sad", "Neutral"]})
