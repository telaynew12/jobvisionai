#!/usr/bin/env python3
"""
Database initialization script
"""
from app.db import engine, Base
from app.models import User

def init_database():
    """Create all tables"""
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully!")
    except Exception as e:
        print(f"❌ Error creating database tables: {e}")

if __name__ == "__main__":
    init_database()


