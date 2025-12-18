from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth  # auth.py router

app = FastAPI(title="JobVision AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # your frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)

@app.get("/")
async def root():
    return {"message": "API is running"}
