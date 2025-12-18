import os
import jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from aiosmtplib import send
from email.message import EmailMessage

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
CLIENT_URL = os.getenv("CLIENT_URL")
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")

# Password hashing
def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(password, hashed):
    return pwd_context.verify(password, hashed)

# JWT token creation
def create_access_token(data: dict, expires_minutes: int = 60):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expires_minutes)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Send verification email
async def send_verification_email(to_email: str, token: str):
    verification_link = f"{CLIENT_URL}/verify/{token}"

    msg = EmailMessage()
    msg["From"] = EMAIL_USER
    msg["To"] = to_email
    msg["Subject"] = "Job Vision Email Verification"
    msg.set_content(f"Click this link to verify your email: {verification_link}")

    await send(msg, hostname="smtp.gmail.com", port=587, start_tls=True,
               username=EMAIL_USER, password=EMAIL_PASS)
