from flask import current_app
from models import db, User, Token
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
