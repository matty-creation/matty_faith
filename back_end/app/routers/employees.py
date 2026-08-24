from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database.session import get_session
from app.models.employee import Employee
from app.schemas.employee import EmployeeCreate, EmployeeResponse

router = APIRouter(
    prefix="/employees",
    tags=["Employees"]
)


@router.post("/", response_model=EmployeeResponse)
def create_employee(
        employee: EmployeeCreate,
        session: Session = Depends(get_session)
):
    new_employee = Employee(
        first_name=employee.first_name,
        last_name=employee.last_name,
        phone=employee.phone,
        position=employee.position,
        date_joined=employee.date_joined,
        email=employee.email,
        password=employee.password,
    )

    session.add(new_employee)
    session.commit()
    session.refresh(new_employee)

    return new_employee


@router.get("/", response_model=list[EmployeeResponse])
def get_employees(
        session: Session = Depends(get_session)
):
    employee = session.exec(
        select(Employee)
    ).all()

    return employee


@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee(employee_id: int, session: Session = Depends(get_session)):
    employee = session.get(Employee, employee_id)

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    return employee


@router.put("/{employee_id}", response_model=EmployeeResponse)
def update_employee(
        employee_id: int,
        employee_data: EmployeeCreate,
        session: Session = Depends(get_session)
):
    employee = session.get(Employee, employee_id)
    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    employee.name = employee_data.name
    employee.email = employee_data.email
    employee.department_id = employee_data.department_id

    session.add(employee)
    session.commit()
    session.refresh(employee)

    return employee


@router.delete("/{employee_id}")
def delete_employee(
        employee_id: int,
        session: Session = Depends(get_session)
):
    employee = session.get(Employee, employee_id)

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    session.delete(employee)
    session.commit()

    return {
        "message": "Employee deleted successfully"
    }
