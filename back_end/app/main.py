from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel

from back_end.app.routers.employees import router as employee_router
from back_end.app.database.connection import engine
from back_end.app.models.employee import Employee
from back_end.app.routers.department import router as department_router
from back_end.app.routers.attendance import router as attendance_router
from back_end.app.routers.auth import router as auth_router
from back_end.app.routers.admin import router as admin_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def create_tables():
    SQLModel.metadata.create_all(engine)

app.include_router(employee_router)
app.include_router(department_router)
app.include_router(attendance_router)
app.include_router(auth_router)
app.include_router(admin_router)

@app.get("/")
def root():
    return {"message": "TimeTracker API is running"}

