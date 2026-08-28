from typing import Optional
from sqlmodel import SQLModel

class CreateDepartment(SQLModel):
    department_id: Optional[int] = None
    department_name: str
    description: str

class DepartmentResponse(SQLModel):
    department_id: int
    department_name: str
    description: str