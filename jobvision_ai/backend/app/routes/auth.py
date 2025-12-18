from fastapi import APIRouter, HTTPException, Response, Request
from pydantic import BaseModel
from app.services.auth_service import (
    register_user,
    login_user,
    verify_user_email,
    get_current_user,
    fetch_user_by_email,  # new import
)

router = APIRouter(prefix="/auth", tags=["auth"])

# ----------------------
# Request Models
# ----------------------
class RegisterRequest(BaseModel):
    email: str
    name: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class VerifyRequest(BaseModel):
    email: str
    code: str

class EmailRequest(BaseModel):
    email: str

# ----------------------
# Routes
# ----------------------
@router.post("/register")
async def register(req: RegisterRequest):
    res = await register_user(req.email, req.name, req.password)
    if "error" in res:
        raise HTTPException(status_code=400, detail=res["error"])
    return res

@router.post("/login")
async def login(req: LoginRequest, response: Response):
    res = await login_user(req.email, req.password, response)
    if "error" in res:
        raise HTTPException(status_code=400, detail=res["error"])
    return res

@router.post("/verify")
async def verify(req: VerifyRequest):
    res = await verify_user_email(req.email, req.code)
    if "error" in res:
        raise HTTPException(status_code=400, detail=res["error"])
    return res

@router.get("/me")
async def me(request: Request):
    try:
        user = await get_current_user(request)
        return user
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)

# ----------------------
# New endpoint: fetch user by email
# ----------------------
@router.post("/fetch-by-email")
async def fetch_by_email(req: EmailRequest):
    """
    Fetch full user record by email.
    Returns: {id, name, email, is_verified, created_at, ...}
    """
    try:
        user = await fetch_user_by_email(req.email)
        return user
    except HTTPException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)


@router.get("/user/{user_id}")
async def get_user_by_id(user_id: str):
    return await fetch_user_by_id(user_id)
