# dev/backend/routes/log_routes.py
from flask import Blueprint, jsonify, current_app
import os

log_bp = Blueprint("log", __name__)


@log_bp.route("/", methods=["GET"])
def get_logs():
    """
    Get the application log data.
    """

    log_path = os.path.join(current_app.root_path, "logs", "moosic.log")
    if not os.path.exists(log_path):
        return jsonify({"error": "Log file not found"}), 404

    try:
        # each log lines to be array
        with open(log_path, 'r') as log_file:
            logs = log_file.readlines()
        return jsonify({"logs": logs}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to read log file: {str(e)}"}), 500
