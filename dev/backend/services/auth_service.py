from flask import current_app
from models import db, User, Token, UserSpotifyCredential
from utils.auth_utils import hash_password, check_password, generate_token
from datetime import datetime, timedelta
from . import logger


def register_user(data):
    try:
        if User.query.filter_by(username=data["username"]).first():
            return {"error": "User already exists"}, 409

        user = User(
            username=data["username"],
            password_hash=hash_password(data["password"]),
            email=data["email"]
        )
        db.session.add(user)
        db.session.commit()
        logger.info(f"User registered: {data['username']}")

        # Generate and save JWT
        token = generate_token(user.id, user.username)
        token_obj = Token(
            token=token,
            user_id=user.id,
            expires_at=datetime.utcnow() +
            timedelta(seconds=current_app.config['JWT_EXPIRATION_DELTA'])
        )
        db.session.add(token_obj)
        db.session.commit()
        logger.info(f"Token generated for user: {data['username']}")

        return {
            "message": "User registered successfully",
            "token": token
        }, 201
    except Exception as e:
        db.session.rollback()
        logger.error(
            f"Registration failed for {data.get('username', 'unknown')}: {str(e)}")
        return {"error": f"Registration failed: {str(e)}"}, 500


def login_user(data):
    try:
        user = User.query.filter_by(username=data["username"]).first()
        if not user or not check_password(data["password"], user.password_hash):
            logger.warning(f"Invalid login attempt for {data['username']}")
            return {"error": "Invalid credentials"}, 401

        # Generate and save JWT
        token = generate_token(user.id, user.username)
        token_obj = Token(
            token=token,
            user_id=user.id,
            expires_at=datetime.utcnow() +
            timedelta(seconds=current_app.config['JWT_EXPIRATION_DELTA'])
        )
        db.session.add(token_obj)
        db.session.commit()
        logger.info(f"User logged in: {data['username']}")

        return {
            "message": "Login successful",
            "token": token
        }, 200
    except Exception as e:
        db.session.rollback()
        logger.error(
            f"Login failed for {data.get('username', 'unknown')}: {str(e)}")
        return {"error": f"Login failed: {str(e)}"}, 500


def logout_user(token):
    try:
        token_obj = Token.query.filter_by(token=token).first()
        if token_obj:
            db.session.delete(token_obj)
            db.session.commit()
            logger.info(f"User logged out with token: {token[:10]}...")
            return {"message": "Logged out successfully"}, 200
        else:
            return {"error": "Token not found"}, 400
    except Exception as e:
        db.session.rollback()
        logger.error(f"Logout failed: {str(e)}")
        return {"error": f"Logout failed: {str(e)}"}, 500


def get_user_info(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return {"error": "User not found"}, 404

        # Find spotify credential if exists
        credential = UserSpotifyCredential.query.filter_by(
            user_id=user_id).first()
        if credential:
            return {
                "username": user.username,
                "email": user.email,
                "spotify_credential": {
                    "client_id": credential.client_id,
                    "client_secret": credential.client_secret,
                    "access_token": credential.access_token,
                    "refresh_token": credential.refresh_token,
                    "expires_at": credential.expires_at
                }
            }, 200

        # If no credential, return basic user info
        return {
            "username": user.username,
            "email": user.email,
            "spotify_credential": None
        }, 200
    except Exception as e:
        logger.error(
            f"Failed to get user info for user_id {user_id}: {str(e)}")
        return {"error": f"Failed to retrieve user info: {str(e)}"}, 500


def update_user_preferences(user_id, data):
    try:
        user = User.query.get(user_id)
        if not user:
            return {"error": "User not found"}, 404
        db.session.commit()
        logger.info(f"Updated preferences for user_id: {user_id}")
        return {"message": "User preferences updated"}, 200
    except Exception as e:
        db.session.rollback()
        logger.error(
            f"Failed to update preferences for user_id {user_id}: {str(e)}")
        return {"error": f"Update failed: {str(e)}"}, 500
