from app.db import supabase
from datetime import datetime, timedelta
import hashlib
import os
import smtplib
from email.mime.text import MIMEText
import jwt
from fastapi import Response, HTTPException, Cookie, Request

# ----------------------------
# Load environment variables
# ----------------------------
SECRET_KEY = os.getenv("SECRET_KEY", "supersecret")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 15))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", 7))
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

# ----------------------------
# Utility functions
# ----------------------------
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

# ----------------------------
# Auth services
# ----------------------------
async def register_user(email: str, name: str, password: str):
    user_res = supabase.table("users").select("*").eq("email", email).execute()
    if user_res.data and len(user_res.data) > 0:
        return {"error": "User already exists"}

    hashed_pw = hash_password(password)
    verification_code = os.urandom(3).hex()

    supabase.table("users").insert({
        "email": email.lower(),
        "name": name,
        "password": hashed_pw,
        "is_verified": False,
        "verification_code": verification_code,
        "created_at": datetime.utcnow().isoformat()
    }).execute()

    send_verification_email(email, verification_code)
    return {"message": "Verification code sent to your email"}

async def login_user(email: str, password: str, response: Response):
    res = supabase.table("users").select("*").eq("email", email.lower()).execute()
    user = res.data[0] if res.data else None
    if not user or not verify_password(password, user["password"]):
        return {"error": "Invalid credentials"}
    # Temporarily skip verification for testing
    # if not user.get("is_verified"):
    #     return {"error": "Email not verified"}

    # Generate tokens
    access_token = create_access_token({"email": email.lower()})
    refresh_token = create_refresh_token({"email": email.lower()})

    # Set cookies for entire site (path="/")
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,  # Set to False for development (localhost)
        samesite="Lax",  # Changed from Strict for development
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,  # Set to False for development (localhost)
        samesite="Lax",  # Changed from Strict for development
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        path="/",
    )

    # return full user info including id
    return {
        "message": "Login successful",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "is_verified": user["is_verified"],
            "created_at": user["created_at"]
        }
    }

async def logout_user(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Logged out"}

async def refresh_access_token(response: Response, refresh_token: str = Cookie(None)):
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Missing refresh token")

    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("email")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    new_access_token = create_access_token({"email": email})
    response.set_cookie(
        key="access_token",
        value=new_access_token,
        httponly=True,
        secure=True,
        samesite="Strict",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    return {"message": "Access token refreshed"}

async def get_current_user(request: Request):
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

    res = supabase.table("users").select("*").eq("email", email.lower()).execute()
    user = res.data[0] if res.data else None
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "user": {
            "id": user["id"],
            "name": user.get("name"),
            "email": user.get("email"),
            "is_verified": user.get("is_verified"),
            "created_at": user.get("created_at"),
        }
    }

async def verify_user_email(email: str, code: str):
    res = supabase.table("users").select("*").eq("email", email.lower()).execute()
    if not res.data or len(res.data) == 0:
        return {"error": "User not found"}

    user = res.data[0]
    if user.get("is_verified"):
        return {"message": "User already verified"}
    if user.get("verification_code") != code:
        return {"error": "Invalid verification code"}

    supabase.table("users").update({
        "is_verified": True,
        "verified_at": datetime.utcnow().isoformat(),
        "verification_code": None
    }).eq("email", email.lower()).execute()

    return {"message": "Email verified successfully"}

async def resend_verification_code(email: str):
    user_res = supabase.table("users").select("*").eq("email", email.lower()).execute()
    user = user_res.data[0] if user_res.data else None
    if not user:
        return {"error": "User not found"}
    if user.get("is_verified"):
        return {"message": "User already verified"}

    verification_code = os.urandom(3).hex()
    supabase.table("users").update({
        "verification_code": verification_code
    }).eq("email", email.lower()).execute()

    send_verification_email(email, verification_code)
    return {"message": "Verification code resent!"}


# ----------------------
# Fetch user by email for frontend navigation
# ----------------------
async def fetch_user_by_email(email: str):
    email = email.lower().strip()
    res = supabase.table("users").select("*").eq("email", email).execute()
    if not res.data or len(res.data) == 0:
        raise HTTPException(status_code=404, detail="User not found")

    user = res.data[0]
    return {
        "id": user["id"],
        "name": user.get("name"),
        "email": user.get("email"),
        "is_verified": user.get("is_verified"),
        "created_at": user.get("created_at"),
    }



async def fetch_user_by_id(user_id: str):
    """
    Fetches full user info from DB by user ID.
    """
    res = supabase.table("users").select("*").eq("id", user_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="User not found")

    user = res.data[0]
    return {
        "id": user["id"],
        "name": user.get("name"),
        "email": user.get("email"),
        "is_verified": user.get("is_verified"),
        "created_at": user.get("created_at"),
    }
