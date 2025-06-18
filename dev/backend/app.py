# app.py
from flask import Flask
from routes.user_routes import user_bp
from routes.emotion_routes import emotion_bp
from routes.music_routes import music_bp
from routes.model_routes import model_bp
from utils.error_handlers import register_error_handlers
from flask_sqlalchemy import SQLAlchemy
from models import db
from config import Config  # Import the Config class for configurations
# from config import SQLALCHEMY_DATABASE_URI, SQLALCHEMY_TRACK_MODIFICATIONS # Import configurations

app = Flask(__name__)

# Configure the database from config.py
# app.config['SQLALCHEMY_DATABASE_URI'] = SQLALCHEMY_DATABASE_URI
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = SQLALCHEMY_TRACK_MODIFICATIONS

# Load all configurations from config.py
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
    app.run(host="0.0.0.0", port=5000)