import os
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 465  # Use 587 if TLS


def send_verification_email(to_email: str, token: str):
    """Send verification email with token link"""
    try:
        subject = "Verify your account"
        verify_link = f"http://localhost:3000/verify?token={token}"  # adjust to your frontend domain

        msg = MIMEMultipart()
        msg["From"] = EMAIL_USER
        msg["To"] = to_email
        msg["Subject"] = subject

        body = f"""
        <h2>Welcome!</h2>
        <p>Click the link below to verify your email:</p>
        <a href="{verify_link}">Verify Email</a>
        """
        msg.attach(MIMEText(body, "html"))

        context = ssl.create_default_context()
        with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT, context=context) as server:
            server.login(EMAIL_USER, EMAIL_PASSWORD)
            server.sendmail(EMAIL_USER, to_email, msg.as_string())

        print(f"✅ Verification email sent to {to_email}")

    except Exception as e:
        print(f"❌ Failed to send email: {e}")
