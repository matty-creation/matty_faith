
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from back_end.app.database.session import get_session
from back_end.app.models.employee import Employee
from back_end.app.schemas.employee import (
    EmployeeCreate,
    EmployeeLogin,
    EmployeeResponse
)


router = APIRouter(
    prefix="/employees",
    tags=["Employees"]
)


@router.post("/", response_model=EmployeeResponse)
def create_employee(
    employee: EmployeeCreate,
    session: Session = Depends(get_session)
):
    existing_employee = session.exec(
        select(Employee).where(
            Employee.email == employee.email
        )
    ).first()

    if existing_employee:
        raise HTTPException(
            status_code=400,
            detail="An account with this email already exists."
        )

    new_employee = Employee(
        first_name=employee.first_name,
        last_name=employee.last_name,
        email=employee.email,
        phone=employee.phone,
        position=employee.position,
        date_joined=employee.date_joined,
        password=employee.password,
        department_id=employee.department_id
    )

    session.add(new_employee)
    session.commit()
    session.refresh(new_employee)

    return new_employee


@router.post("/login", response_model=EmployeeResponse)
def login_employee(
    login_data: EmployeeLogin,
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
            detail="Invalid email or password."
        )

    if employee.password != login_data.password:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    return employee


@router.get("/", response_model=list[EmployeeResponse])
def get_employees(
    session: Session = Depends(get_session)
):
    employee = session.exec(
        select(Employee)
    ).all()

    return employee



@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee(
    employee_id: int,
    session: Session = Depends(get_session)
):
    employee = session.get(
        Employee,
        employee_id
    )

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
    employee = session.get(
        Employee,
        employee_id
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    existing_employee = session.exec(
        select(Employee).where(
            Employee.email == employee_data.email,
            Employee.employee_id != employee_id
        )
    ).first()

    if existing_employee:
        raise HTTPException(
            status_code=400,
            detail="An account with this email already exists."
        )

    employee.first_name = employee_data.first_name
    employee.last_name = employee_data.last_name
    employee.email = employee_data.email
    employee.phone = employee_data.phone
    employee.position = employee_data.position
    employee.date_joined = employee_data.date_joined
    employee.password = employee_data.password
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
    employee = session.get(
        Employee,
        employee_id
    )

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
