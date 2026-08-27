from typing import Optional
from sqlmodel import SQLModel, Field


class Employee(SQLModel, table=True):
    __tablename__ = "employees"

    employee_id: Optional[int] = Field(
        default=None,
        primary_key=True
    )

    first_name: str
    last_name: str
    email: str
    phone: str
    position: str
    date_joined: str
    password: str