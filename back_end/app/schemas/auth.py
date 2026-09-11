from pydantic import BaseModel , EmailStr


class LoginRequest(BaseModel):
    email: Emailstr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    employee_id: int
    first_name: str
    last_name: str
    email: str


class CurrentEmployeeResponse(BaseModel):
    employee_id: int
    first_name: str
    last_name: str
    email: Emailstr
    phone: str
    position: str
    address: str
    date_joined: str
    department_id: int