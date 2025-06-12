# dev/backend/routes/model_routes.py
from flask import Blueprint, jsonify

model_bp = Blueprint("model", __name__)

@model_bp.route("/retrain", methods=["POST"])
def retrain_model():
    return jsonify({"message": "Model retraining triggered"})

@model_bp.route("/status", methods=["GET"])
def model_status():
    return jsonify({"status": "ok", "version": "v1.0.0"})

@model_bp.route("/logs", methods=["GET"])
def model_logs():
    return jsonify({"logs": ["Log1", "Log2"]})
