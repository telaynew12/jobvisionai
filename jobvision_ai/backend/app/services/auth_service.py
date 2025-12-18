from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import hashlib
import os
import smtplib
from email.mime.text import MIMEText
import jwt
from fastapi import Response, HTTPException, Cookie, Request
from app.models import User
from app.db import get_db

# Load environment variables
SECRET_KEY = os.getenv("SECRET_KEY", "supersecret")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 15))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", 7))
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    return hash_password(password) == hashed

def create_access_token(data: dict, expires_delta=None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(data: dict, expires_delta=None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def send_verification_email(email: str, code: str):
    subject = "Verify your JobVision account"
    body = f"Hello,\n\nYour verification code is: {code}\nThis code will expire in 5 minutes.\n\n- JobVision AI Team"
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = EMAIL_USER
    msg["To"] = email
    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(EMAIL_USER, EMAIL_PASSWORD)
            server.sendmail(EMAIL_USER, email, msg.as_string())
    except Exception as e:
        print(f"❌ Email sending failed: {e}")
        raise

async def register_user(email: str, name: str, password: str, db: Session):
    user = db.query(User).filter(User.email == email.lower()).first()
    if user:
        return {"error": "User already exists"}

    hashed_pw = hash_password(password)
    verification_code = os.urandom(3).hex()

    new_user = User(
        email=email.lower(),
        name=name,
        password=hashed_pw,
        is_verified=False,
        verification_code=verification_code
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    send_verification_email(email, verification_code)
    return {"message": "Verification code sent to your email"}

async def login_user(email: str, password: str, response: Response, db: Session):
    user = db.query(User).filter(User.email == email.lower()).first()
    if not user or not verify_password(password, user.password):
        return {"error": "Invalid credentials"}

    access_token = create_access_token({"email": email.lower()})
    refresh_token = create_refresh_token({"email": email.lower()})

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,
        samesite="Lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite="Lax",
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        path="/",
    )

    return {
        "message": "Login successful",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "is_verified": user.is_verified,
            "created_at": user.created_at.isoformat() if user.created_at else None
        }
    }

async def logout_user(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Logged out"}

async def get_current_user(request: Request, db: Session):
    access_token = request.cookies.get("access_token")
    if not access_token:
        raise HTTPException(status_code=401, detail="Missing access token")

    try:
        payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("email")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Access token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid access token")

    user = db.query(User).filter(User.email == email.lower()).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "is_verified": user.is_verified,
            "created_at": user.created_at.isoformat() if user.created_at else None,
        }
    }

async def verify_user_email(email: str, code: str, db: Session):
    user = db.query(User).filter(User.email == email.lower()).first()
    if not user:
        return {"error": "User not found"}

    if user.is_verified:
        return {"message": "User already verified"}
    if user.verification_code != code:
        return {"error": "Invalid verification code"}

    user.is_verified = True
    user.verified_at = datetime.utcnow()
    user.verification_code = None
    db.commit()

    return {"message": "Email verified successfully"}

async def resend_verification_code(email: str, db: Session):
    user = db.query(User).filter(User.email == email.lower()).first()
    if not user:
        return {"error": "User not found"}
    if user.is_verified:
        return {"message": "User already verified"}

    verification_code = os.urandom(3).hex()
    user.verification_code = verification_code
    db.commit()

    send_verification_email(email, verification_code)
    return {"message": "Verification code resent!"}

async def fetch_user_by_email(email: str, db: Session):
    email = email.lower().strip()
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "is_verified": user.is_verified,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }

async def fetch_user_by_id(user_id: str, db: Session):
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "is_verified": user.is_verified,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }