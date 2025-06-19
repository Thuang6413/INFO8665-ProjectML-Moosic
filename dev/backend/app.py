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
import os

# Load environment variables from .env file
load_dotenv()
print(f"[DEBUG] Loaded env: {os.getenv('SPOTIFY_CLIENT_ID')}")

# Check GPU availability at startup
print("[DEBUG] Checking GPU availability...")
gpus = tf.config.list_physical_devices('GPU')
if gpus:
    print(f"[DEBUG] GPU detected: {len(gpus)} GPU(s) available - {gpus}")
else:
    print("[DEBUG] No GPU detected. Running on CPU.")

app = Flask(__name__)

# Load all models at startup and attach to app
print("[DEBUG] Initializing application and loading emotion recognition models...")
app.models = {}
try:
    for model_name, model_path in Config.MODEL_PATHS.items():
        print(f"[DEBUG] Loading model '{model_name}' from: {model_path}")
        app.models[model_name] = tf.keras.models.load_model(model_path)
        print(f"[DEBUG] Model '{model_name}' loaded successfully")
except Exception as e:
    print(f"[ERROR] Failed to load one or more models: {e}")
    app.models = {}  # Set to empty dict if loading fails

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
    app.run(host="0.0.0.0", port=5000, debug=True)