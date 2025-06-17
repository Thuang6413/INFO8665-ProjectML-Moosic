# dev/backend/utils/auth_utils.py
import bcrypt
import jwt
from datetime import datetime, timedelta
from flask import current_app, request, jsonify
from functools import wraps
from models import Token

def hash_password(password):
    """Hash a password using bcrypt."""
    try:
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    except Exception as e:
        print(f"Error hashing password: {e}")
        raise

def check_password(password, password_hash):
    """Check if the provided password matches the hashed password."""
    try:
        return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))
    except ValueError as e:
        print(f"Error checking password: {e}")
        return False
    except Exception as e:
        print(f"Unexpected error checking password: {e}")
        return False

def generate_token(user_id, username):
    """Generate a JWT for the given user."""
    try:
        payload = {
            'user_id': user_id,
            'username': username,
            'exp': datetime.utcnow() + timedelta(seconds=current_app.config['JWT_EXPIRATION_DELTA']),
            'iat': datetime.utcnow()
        }
        token = jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')
        return token
    except Exception as e:
        raise Exception(f"Error generating token: {str(e)}")

def token_required(f):
    """Decorator to validate JWT and check token in database."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({"error": "Token missing"}), 401
        try:
            token = token.replace('Bearer ', '')
            # Verify JWT signature
            payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            # Check if token exists in database and is not expired
            token_obj = Token.query.filter_by(token=token).first()
            if not token_obj or token_obj.is_expired():
                return jsonify({"error": "Invalid or expired token"}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401
        except Exception as e:
            print(f"Error validating token: {e}")
            return jsonify({"error": "Token validation failed"}), 500
        return f(payload, *args, **kwargs)
    return decorated