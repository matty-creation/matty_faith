from fastapi import FastAPI

from app.routers.employees import router as employee_router
app = FastAPI()

app.include_router(employee_router)


@app.get("/")
def home():
    return {"message": "Attendance System API is running"}