# dev/backend/services/auth_service.py
from flask import current_app
from models import db, User, Token
from utils.auth_utils import hash_password, check_password, generate_token
from datetime import datetime, timedelta

def register_user(data):
    print("Registering user with data:", data)
    if User.query.filter_by(username=data["username"]).first():
        return {"error": "User already exists"}, 409

    user = User(
        username=data["username"],
        password_hash=hash_password(data["password"]),
        email=data["email"]
    )
    db.session.add(user)
    db.session.commit()

    # Generate and save JWT
    token = generate_token(user.id, user.username)
    token_obj = Token(
        token=token,
        user_id=user.id,
        expires_at=datetime.utcnow() + timedelta(seconds=current_app.config['JWT_EXPIRATION_DELTA'])
    )
    db.session.add(token_obj)
    db.session.commit()

    return {
        "message": "User registered successfully",
        "token": token
    }, 201

def login_user(data):
    user = User.query.filter_by(username=data["username"]).first()
    if not user or not check_password(data["password"], user.password_hash):
        return {"error": "Invalid credentials"}, 401
    
    # Generate and save JWT
    token = generate_token(user.id, user.username)
    token_obj = Token(
        token=token,
        user_id=user.id,
        expires_at=datetime.utcnow() + timedelta(seconds=current_app.config['JWT_EXPIRATION_DELTA'])
    )
    db.session.add(token_obj)
    db.session.commit()

    return {
        "message": "Login successful",
        "token": token
    }, 200