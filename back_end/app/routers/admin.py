from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database.session import get_session
from app.models.attendance import Attendance
from app.models.department import Department
from app.models.employee import Employee
from app.schemas.attendance import AttendanceCreate, AttendanceResponse
from app.schemas.department import CreateDepartment, DepartmentResponse
from app.schemas.employee import EmployeeCreate, EmployeeResponse, EmployeeUpdate
from app.utils.dependencies import require_admin
from app.utils.security import hash_password

router = APIRouter(prefix="/admin", tags=["Administration"])


@router.get("/employees", response_model=list[EmployeeResponse])
def get_admin_employees(
    session: Session = Depends(get_session),
    _: Employee = Depends(require_admin),
):
    return session.exec(select(Employee).order_by(Employee.last_name, Employee.first_name)).all()


@router.post("/employees", response_model=EmployeeResponse)
def create_admin_employee(
    employee: EmployeeCreate,
    session: Session = Depends(get_session),
    _: Employee = Depends(require_admin),
):
    if session.exec(select(Employee).where(Employee.email == employee.email)).first():
        raise HTTPException(status_code=409, detail="An employee with this email already exists")
    data = employee.model_dump()
    data["password"] = hash_password(data["password"])
    record = Employee(**data)
    session.add(record)
    session.commit()
    session.refresh(record)
    return record


@router.put("/employees/{employee_id}", response_model=EmployeeResponse)
def update_admin_employee(
    employee_id: int,
    employee: EmployeeUpdate,
    session: Session = Depends(get_session),
    _: Employee = Depends(require_admin),
):
    record = session.get(Employee, employee_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Employee not found")
    for field, value in employee.model_dump(exclude_none=True).items():
        setattr(record, field, hash_password(value) if field == "password" else value)
    session.add(record)
    session.commit()
    session.refresh(record)
    return record


@router.delete("/employees/{employee_id}")
def delete_admin_employee(
    employee_id: int,
    session: Session = Depends(get_session),
    _: Employee = Depends(require_admin),
):
    record = session.get(Employee, employee_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Employee not found")
    session.delete(record)
    session.commit()
    return {"message": "Employee deleted successfully"}


@router.get("/departments", response_model=list[DepartmentResponse])
def get_admin_departments(
    session: Session = Depends(get_session),
    _: Employee = Depends(require_admin),
):
    return session.exec(select(Department).order_by(Department.department_name)).all()


@router.post("/departments", response_model=DepartmentResponse)
def create_admin_department(
    department: CreateDepartment,
    session: Session = Depends(get_session),
    _: Employee = Depends(require_admin),
):
    record = Department(
        department_name=department.department_name,
        description=department.description,
    )
    session.add(record)
    session.commit()
    session.refresh(record)
    return record


@router.put("/departments/{department_id}", response_model=DepartmentResponse)
def update_admin_department(
    department_id: int,
    department: CreateDepartment,
    session: Session = Depends(get_session),
    _: Employee = Depends(require_admin),
):
    record = session.get(Department, department_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Department not found")
    record.department_name = department.department_name
    record.description = department.description
    session.add(record)
    session.commit()
    session.refresh(record)
    return record


@router.delete("/departments/{department_id}")
def delete_admin_department(
    department_id: int,
    session: Session = Depends(get_session),
    _: Employee = Depends(require_admin),
):
    record = session.get(Department, department_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Department not found")
    if session.exec(select(Employee).where(Employee.department_id == department_id)).first():
        raise HTTPException(status_code=409, detail="Move employees before deleting this department")
    session.delete(record)
    session.commit()
    return {"message": "Department deleted successfully"}


@router.get("/attendance", response_model=list[AttendanceResponse])
def get_admin_attendance(
    session: Session = Depends(get_session),
    _: Employee = Depends(require_admin),
):
    return session.exec(select(Attendance).order_by(Attendance.attendance_date.desc())).all()


@router.put("/attendance/{attendance_id}", response_model=AttendanceResponse)
def update_admin_attendance(
    attendance_id: int,
    attendance: AttendanceCreate,
    session: Session = Depends(get_session),
    _: Employee = Depends(require_admin),
):
    record = session.get(Attendance, attendance_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    for field, value in attendance.model_dump().items():
        setattr(record, field, value)
    session.add(record)
    session.commit()
    session.refresh(record)
    return record


@router.get("/summary")
def get_admin_summary(
    session: Session = Depends(get_session),
    _: Employee = Depends(require_admin),
):
    employees = session.exec(select(Employee)).all()
    departments = session.exec(select(Department)).all()
    attendance = session.exec(select(Attendance)).all()
    today = date.today()
    statuses = {item.status.lower() for item in attendance}
    return {
        "employees": len(employees),
        "departments": len(departments),
        "attendance_today": sum(item.attendance_date == today for item in attendance),
        "present_today": sum(
            item.attendance_date == today and item.status.lower() == "present"
            for item in attendance
        ),
        "attendance_by_status": {
            status: sum(item.status.lower() == status for item in attendance)
            for status in statuses
        }
    }
