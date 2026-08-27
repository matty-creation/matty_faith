from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel

from back_end.app.routers.employees import router as employee_router
from back_end.app.database.connection import engine
from back_end.app.models.employee import Employee

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://127.0.0.1:5501",
        "http://localhost:5501"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def create_tables():
    SQLModel.metadata.create_all(engine)

app.include_router(employee_router)

@app.get("/")
def root():
    return {"message": "TimeTracker API is running"}