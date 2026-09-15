from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database.session import get_session
from app.models.employee import Employee
from app.schemas.auth import LoginRequest
from app.utils.security import verify_password

from app.schemas.auth import LoginRequest, TokenResponse
from app.utils.dependencies import get_current_employee

from app.schemas.auth import (
    LoginRequest,
    TokenResponse,
    CurrentEmployeeResponse
)

from app.utils.dependencies import get_current_employee

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/login")
def login(
    login_data: LoginRequest,
    session: Session = Depends(get_session)
):
    employee = session.exec(
        select(Employee).where(
            Employee.email == login_data.email
        )
    ).first()

    if not employee:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        login_data.password,
        employee.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    return {
        "message": "Login successful",
        "employee_id": employee.employee_id
    }

@router.get("/me", response_model=CurrentEmployeeResponse)
def get_my_profile(
    current_employee: Employee = Depends(get_current_employee)
):
    return current_employee