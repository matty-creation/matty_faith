from datetime import date, time
from sqlmodel import SQLModel


class AttendanceCreate(SQLModel):
    employee_id: int
    attendance_date: date
    time_in: time | None = None
    time_out: time | None = None
    status: str


class AttendanceResponse(SQLModel):
    attendance_id: int
    employee_id: int
    attendance_date: date
    time_in: time | None
    time_out: time | None
    status: str