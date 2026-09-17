from pydantic import BaseModel , EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    employee_id: int
    first_name: str
    last_name: str
    email: str
    position: str


class CurrentEmployeeResponse(BaseModel):
    employee_id: int
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    position: str
    address: str
    date_joined: str
    department_id: int