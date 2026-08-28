from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from back_end.app.models.department import Department
from back_end.app.database.session import get_session
from back_end.app.schemas.department import DepartmentResponse

router = APIRouter(
    prefix="/departments",
    tags=["Departments"]
)


# CREATE
@router.post("/", response_model=DepartmentResponse)
def create_department(
    department: Department,
    session: Session = Depends(get_session)
):
    session.add(department)
    session.commit()
    session.refresh(department)

    return department


# READ ALL
@router.get("/", response_model=list[DepartmentResponse])
def get_departments(
    session: Session = Depends(get_session)
):
    departments = session.exec(select(Department)).all()

    return departments


# READ ONE
@router.get("/{department_id}", response_model=DepartmentResponse)
def get_department(
    department_id: int,
    session: Session = Depends(get_session)
):
    department = session.get(Department, department_id)

    if not department:
        raise HTTPException(
            status_code=404,
            detail="Department not found"
        )

    return department


# UPDATE
@router.put("/{department_id}", response_model=DepartmentResponse)
def update_department(
    department_id: int,
    updated_department: Department,
    session: Session = Depends(get_session)
):
    department = session.get(Department, department_id)

    if not department:
        raise HTTPException(
            status_code=404,
            detail="Department not found"
        )

    department.department_name = updated_department.department_name

    session.add(department)
    session.commit()
    session.refresh(department)

    return department


# DELETE
@router.delete("/{department_id}")
def delete_department(
    department_id: int,
    session: Session = Depends(get_session)
):
    department = session.get(Department, department_id)

    if not department:
        raise HTTPException(
            status_code=404,
            detail="Department not found"
        )

    session.delete(department)
    session.commit()

    return {"message": "Department deleted successfully"}