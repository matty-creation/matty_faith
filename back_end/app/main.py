from fastapi import FastAPI

from app.routers.employees import router as employee_router
from app.routers.department import router as department_router
from app.routers.attendance import router as attendance_router

app = FastAPI()

app.include_router(employee_router)
app.include_router(department_router)
app.include_router(attendance_router)

@app.get("/")
def home():
    return {"message": "Attendance System API is running"}