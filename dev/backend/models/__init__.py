# dev/backend/models/__init__.py
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

    # One-to-one relationship with Spotify credentials
    spotify_credential = db.relationship(
        'UserSpotifyCredential', backref='user', uselist=False)


class Token(db.Model):
    __tablename__ = 'tokens'
    id = db.Column(db.Integer, primary_key=True)
    token = db.Column(db.String(500), nullable=False, unique=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    user = db.relationship(
        'User', backref=db.backref('tokens', lazy='dynamic'))

    def is_expired(self):
        from datetime import datetime
        return datetime.utcnow() > self.expires_at


class Song(db.Model):
    __tablename__ = 'songs'
    id = db.Column(db.Integer, primary_key=True)
    lastfm_url = db.Column(db.String)
    track = db.Column(db.String)
    artist = db.Column(db.String)
    seeds = db.Column(db.String)
    number_of_emotion_tags = db.Column(db.Integer)
    valence_tags = db.Column(db.Float)
    arousal_tags = db.Column(db.Float)
    dominance_tags = db.Column(db.Float)
    mbid = db.Column(db.String)
    spotify_id = db.Column(db.String)
    genre = db.Column(db.String)


class UserSpotifyCredential(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(
        'users.id'), unique=True, nullable=False)
    client_id = db.Column(db.String(128))  # Spotify Client ID
    # Spotify Client Secret (should be stored encrypted)
    client_secret = db.Column(db.String(128))
    access_token = db.Column(db.String(256))  # Access Token
    refresh_token = db.Column(db.String(256))  # Refresh Token
    expires_at = db.Column(db.DateTime)  # Token expiration time
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
