from pydantic import BaseModel, EmailStr

# Data for registration
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

# Data for login
class UserLogin(BaseModel):
    email: EmailStr
    password: str
