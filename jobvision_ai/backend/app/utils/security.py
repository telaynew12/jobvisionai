# app/utils/security.py
import bcrypt
from datetime import datetime, timedelta
from jose import jwt
import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))

MAX_BCRYPT_LENGTH = 72  # bcrypt limitation

def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt. Truncate to 72 bytes.
    """
    try:
        pw_bytes = password.encode("utf-8")[:MAX_BCRYPT_LENGTH]
        hashed = bcrypt.hashpw(pw_bytes, bcrypt.gensalt())
        return hashed.decode("utf-8")
    except Exception as e:
        raise ValueError(f"Failed to hash password: {e}")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against a bcrypt hash.
    """
    try:
        pw_bytes = plain_password.encode("utf-8")[:MAX_BCRYPT_LENGTH]
        return bcrypt.checkpw(pw_bytes, hashed_password.encode("utf-8"))
    except Exception as e:
        return False

def create_access_token(data: dict, expires_delta: timedelta = None):
    """
    Create a JWT access token with an optional expiration.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
