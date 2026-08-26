from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def about():
    return {"message": "Welcome to the FastAPI application!"}\


    
@app.get("/employees")
def get_employees():
    # Sample data for demonstration purposes
    employees = [
        {"id": 1, "name": "John Doe", "position": "Software Engineer"},
        {"id": 2, "name": "Jane Smith", "position": "Project Manager"},
        {"id": 3, "name": "Alice Johnson", "position": "Data Analyst"}
    ]
    return {"employees": employees}
@app.post("/employees")
def create_employee(employee: str, request model:):
    # In a real application, you would save the employee data to a database
return {"message": "Employee created successfully", "employee": employee}