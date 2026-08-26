from sqlmodel import SQLModel

class EmployeeCreate(SQLModel):
    first_name: str
    last_name: str
    email: str
    phone: str
    position: str
    date_joined: str
    password: str
    department_id: int

class EmployeeResponse(SQLModel):
    employee_id:int
    first_name: str
    last_name: str
    email: str
    phone: str
    position: str
    date_joined: str
