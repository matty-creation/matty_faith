from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database.session import get_session
from app.models.attendance import Attendance
from app.schemas.attendance import AttendanceCreate, AttendanceResponse


router = APIRouter(
    prefix="/attendance",
    tags=["Attendance"]
)


# CREATE
@router.post("/", response_model=AttendanceResponse)
def create_attendance(
    attendance: AttendanceCreate,
    session: Session = Depends(get_session)
):
    new_attendance = Attendance(
        employee_id=attendance.employee_id,
        attendance_date=attendance.attendance_date,
        time_in=attendance.time_in,
        time_out=attendance.time_out,
        status=attendance.status
    )

    session.add(new_attendance)
    session.commit()
    session.refresh(new_attendance)

    return new_attendance


# READ ALL
@router.get("/", response_model=list[AttendanceResponse])
def get_attendance(
    session: Session = Depends(get_session)
):
    attendance = session.exec(
        select(Attendance)
    ).all()

    return attendance


# READ ONE
@router.get("/{attendance_id}", response_model=AttendanceResponse)
def get_attendance_by_id(
    attendance_id: int,
    session: Session = Depends(get_session)
):
    attendance = session.get(Attendance, attendance_id)

    if not attendance:
        raise HTTPException(
            status_code=404,
            detail="Attendance record not found"
        )

    return attendance


# UPDATE
@router.put("/{attendance_id}", response_model=AttendanceResponse)
def update_attendance(
    attendance_id: int,
    updated_attendance: AttendanceCreate,
    session: Session = Depends(get_session)
):
    attendance = session.get(Attendance, attendance_id)

    if not attendance:
        raise HTTPException(
            status_code=404,
            detail="Attendance record not found"
        )

    attendance.employee_id = updated_attendance.employee_id
    attendance.attendance_date = updated_attendance.attendance_date
    attendance.time_in = updated_attendance.time_in
    attendance.time_out = updated_attendance.time_out
    attendance.status = updated_attendance.status

    session.add(attendance)
    session.commit()
    session.refresh(attendance)

    return attendance


# DELETE
@router.delete("/{attendance_id}")
def delete_attendance(
    attendance_id: int,
    session: Session = Depends(get_session)
):
    attendance = session.get(Attendance, attendance_id)

    if not attendance:
        raise HTTPException(
            status_code=404,
            detail="Attendance record not found"
        )

    session.delete(attendance)
    session.commit()

    return {
        "message": "Attendance record deleted successfully"
    }
