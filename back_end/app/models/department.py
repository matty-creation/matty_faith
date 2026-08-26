from sqlmodel import SQLModel, Field

class Department(SQLModel, table=True):
    __tablename__="departments"

    department_id: int = Field(default=None, primary_key=True)
    department_name: str
    description: str