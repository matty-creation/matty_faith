from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, select

from app.database.session import get_session
from app.models.employee import Employee
from app.utils.security import decode_access_token


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_employee(
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_session)
):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode_access_token(token)
        employee_id = payload.get("sub")
        if employee_id is None:
            raise credentials_exception
        employee_id = int(employee_id)
    except (Exception, ValueError):
        raise credentials_exception
        payload = decode_access_token(token)
        employee_id = payload.get("sub")

        if employee_id is None:
            raise credentials_exception

        employee_id = int(employee_id)

    except (Exception, ValueError):
        raise credentials_exception

    employee = session.exec(
        select(Employee).where(
            Employee.employee_id == employee_id
        )
    ).first()

    if employee is None:
        raise credentials_exception

    return employee


def require_admin(employee: Employee = Depends(get_current_employee)):
    if employee.position.strip().lower() not in {
        "admin",
        "administrator",
        "system administrator",
    }:
        raise HTTPException(status_code=403, detail="Administrator access is required")
    return employee