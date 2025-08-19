# dev/backend/app.py
from flask import Flask
import tensorflow as tf
from routes.user_routes import user_bp
from routes.emotion_routes import emotion_bp
from routes.music_routes import music_bp
from routes.model_routes import model_bp
from utils.error_handlers import register_error_handlers
from models import db
from config import Config
from dotenv import load_dotenv
from flask_cors import CORS
import os
import logging

# Ensure logs directory exists
if not os.path.exists("logs"):
    os.makedirs("logs")

# Configure logging
logger = logging.getLogger("moosic_logger")
logger.setLevel(logging.INFO)

file_handler = logging.FileHandler("logs/moosic.log")
file_handler.setLevel(logging.INFO)

formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
file_handler.setFormatter(formatter)

logger.addHandler(file_handler)

# Load environment variables from .env file
load_dotenv()
logger.info(
    f"Loaded environment variable: SPOTIFY_CLIENT_ID={os.getenv('SPOTIFY_CLIENT_ID')}"
)

# Check GPU availability at startup
logger.info("Checking GPU availability...")
gpus = tf.config.list_physical_devices("GPU")
if gpus:
    logger.info(f"GPU detected: {len(gpus)} GPU(s) available - {gpus}")
else:
    logger.info("No GPU detected. Running on CPU.")

# Load all models at startup and attach to app
logger.info("Initializing application and loading emotion recognition models...")
app.models = {}
try:
    for model_name, model_path in Config.MODEL_PATHS.items():
        logger.info(f"Loading model '{model_name}' from: {model_path}")
        app.models[model_name] = tf.keras.models.load_model(model_path)
        logger.info(f"Model '{model_name}' loaded successfully")
except Exception as e:
    logger.error(f"Failed to load one or more models: {e}")
    app.models = {}


# Configure the database from config.py
app.config.from_object(Config)

# Initialize the database
db.init_app(app)

# Register Blueprint routes
app.register_blueprint(user_bp, url_prefix="/api/v1/user")
app.register_blueprint(emotion_bp, url_prefix="/api/v1/emotion")
app.register_blueprint(music_bp, url_prefix="/api/v1/music")
app.register_blueprint(model_bp, url_prefix="/api/v1/model")

# Register error handlers
register_error_handlers(app)

# Create database tables if they don't exist
with app.app_context():
    db.create_all()

if __name__ == "__main__":
    logger.info("Moosic backend server is starting...")
    app.run(host="0.0.0.0", port=5000, debug=True)
