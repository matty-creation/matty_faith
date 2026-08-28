from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from back_end.app.database.session import get_session
from back_end.app.models.department import Department
from back_end.app.models.employee import Employee
from back_end.app.schemas.department import DepartmentResponse
from back_end.app.schemas.employee import EmployeeResponse

router = APIRouter(
    prefix="/admin",
    tags=["Administration"]
)


@router.get("/employees", response_model=list[EmployeeResponse])
def get_admin_employees(session: Session = Depends(get_session)):
    return session.exec(
        select(Employee).order_by(Employee.last_name, Employee.first_name)
    ).all()


@router.get("/departments", response_model=list[DepartmentResponse])
def get_admin_departments(session: Session = Depends(get_session)):
    return session.exec(
        select(Department).order_by(Department.department_name)
    ).all()
