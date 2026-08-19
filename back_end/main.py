from fastapi import FastAPI, Header
from fastapi import FastAPI, HTTPException

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Attendance(BaseModel):
    employee_id: int
    status: str

class Employee(BaseModel):
    id: int
    name: str
    role: str
    department: str

@app.get("/")
def home():
    return {"message": "Hello, Welcome to Matty Faith"}

@app.get("/employees")
def get_employees(user_agent: str | None = Header(default=None)):
    return {
        "user_agent": user_agent
    }

@app.post("/attendance", )
def record_attendance(attendance: Attendance):
    return {
        "message": "Attendance recorded",
        "data": attendance
        }



employees = [
    {"id": 1, "name": "John", "role": "developer", "department": "engineering"},
    {"id": 2, "name": "Sarah", "role": "designer", "department": "design"},
    {"id": 3, "name": "Mike", "role": "manager", "department": "engineering"},
    {"id": 4, "name": "Emma", "role": "developer", "department": "engineering"},
]


# Basic query parameter
@app.get("/employees/v1")
def get_employees(role: str, department: str):
    """
    URL: /employees?role=developer
    If role parameter is provided, filter by role
    """
    return [
        e for e in employees
        if e["role"] == role and e["department"] == department
    ]

@app.get("/employees/{employee_id}", response_model=Employee)
def get_employee(employee_id: int):
    for employee in employees:
        if employee["id"] == employee_id:
            return employee

    raise HTTPException(
        status_code=404,
        detail="Employee not found"
    )

# Query params
# Path params
# Request model
# Response Model
# Http Response Code
# Http methods
# Headers
# Extraction http payload Both (application/ json and multipart form data)


# Mimic database impl using python dict