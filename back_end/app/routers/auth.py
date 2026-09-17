from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database.session import get_session
from app.models.employee import Employee
from app.schemas.auth import CurrentEmployeeResponse, LoginRequest
from app.utils.dependencies import get_current_employee
from app.utils.security import create_access_token, hash_password, verify_password

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

    password_is_valid = False
    try:
        password_is_valid = verify_password(
            login_data.password,
            employee.password
        )
    except Exception:
        password_is_valid = employee.password == login_data.password

    if not password_is_valid:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if employee.password == login_data.password:
        employee.password = hash_password(login_data.password)
        session.add(employee)
        session.commit()

    return {
        "message": "Login successful",
        "access_token": create_access_token({"sub": str(employee.employee_id)}),
        "token_type": "bearer",
        "employee_id": employee.employee_id,
        "first_name": employee.first_name,
        "last_name": employee.last_name,
        "email": employee.email,
        "position": employee.position,
    }

@router.get("/me", response_model=CurrentEmployeeResponse)
def get_my_profile(
    current_employee: Employee = Depends(get_current_employee)
):
    return current_employee