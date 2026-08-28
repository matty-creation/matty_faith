from datetime import date, time
from sqlmodel import SQLModel, Field

class Attendance(SQLModel, table=True):
    __tablename__ = "attendance"

    attendance_id: int | None = Field(
        default=None,
        primary_key=True
    )

    employee_id: int = Field(
        foreign_key="employees.employee_id"
    )

    attendance_date: date
    time_in: time | None = None
    time_out: time | None = None
    status: str
