from models.user import db, User
from utils.auth_utils import hash_password, check_password

def register_user(data):
    if User.query.filter_by(username=data["username"]).first():
        return {"error": "User already exists"}, 409

    user = User(
        username=data["username"],
        password_hash=hash_password(data["password"]),
        email=data["email"]
    )
    db.session.add(user)
    db.session.commit()
    return {"message": "User registered successfully"}, 201

def login_user(data):
    user = User.query.filter_by(username=data["username"]).first()
    if not user or not check_password(data["password"], user.password_hash):
        return {"error": "Invalid credentials"}, 401
    return {"message": "Login successful"}, 200
