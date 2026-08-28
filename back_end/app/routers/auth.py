from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from back_end.app.database.session import get_session
from back_end.app.models.employee import Employee
from back_end.app.schemas.auth import LoginRequest
from back_end.app.utils.security import verify_password


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