# dev/backend/routes/music_routes.py
from flask import Blueprint, jsonify

music_bp = Blueprint("music", __name__)

@music_bp.route("/recommendation", methods=["GET"])
def music_recommendation():
    return jsonify({"songs": ["Song A", "Song B"]})

@music_bp.route("/mood/<emotion>", methods=["GET"])
def music_by_mood(emotion):
    return jsonify({"songs": [f"Mood-{emotion}-Song1", f"Mood-{emotion}-Song2"]})

@music_bp.route("/feedback", methods=["POST"])
def music_feedback():
    return jsonify({"message": "Feedback submitted"})

@music_bp.route("/playlist", methods=["GET"])
def get_playlist():
    return jsonify({"playlist": ["YourSong1", "YourSong2"]})