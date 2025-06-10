from flask import Flask
from routes.user_routes import user_bp
from routes.emotion_routes import emotion_bp
from routes.music_routes import music_bp
from routes.model_routes import model_bp
from utils.error_handlers import register_error_handlers

app = Flask(__name__)

# Register Blueprint routes
app.register_blueprint(user_bp, url_prefix="/api/v1/user")
app.register_blueprint(emotion_bp, url_prefix="/api/v1/emotion")
app.register_blueprint(music_bp, url_prefix="/api/v1/music")
app.register_blueprint(model_bp, url_prefix="/api/v1/model")

# Register error handlers
register_error_handlers(app)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
