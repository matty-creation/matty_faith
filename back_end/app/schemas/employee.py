
from sqlmodel import SQLModel
from pydantic import EmailStr, field_validator
import re


class EmployeeCreate(SQLModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    position: str
    date_joined: str
    password: str
    department_id: int

    @field_validator("first_name", "last_name")
    @classmethod
    def validate_names(cls, value):
        value = value.strip()

        if not value:
            raise ValueError("Name cannot be empty.")

        if not value[0].isupper():
            raise ValueError(
                "Name must start with a capital letter."
            )

        if not value.replace(" ", "").isalpha():
            raise ValueError(
                "Name can contain letters and spaces only."
            )

        return value

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value):
        phone = value.replace(" ", "")

        if not phone.isdigit():
            raise ValueError(
                "Phone number must contain numbers only."
            )

        if len(phone) != 10:
            raise ValueError(
                "Phone number must contain exactly 10 digits."
            )

        return phone

    @field_validator("password")
    @classmethod
    def validate_password(cls, value):
        if len(value) < 6:
            raise ValueError(
                "Password must be at least 6 characters."
            )

        if not re.search(r"[A-Z]", value):
            raise ValueError(
                "Password must contain an uppercase letter."
            )

        if not re.search(r"[a-z]", value):
            raise ValueError(
                "Password must contain a lowercase letter."
            )

        if not re.search(r"\d", value):
            raise ValueError(
                "Password must contain a number."
            )

        if not re.search(
            r'[!@#$%^&*(),.?":{}|<>_\-]',
            value
        ):
            raise ValueError(
                "Password must contain a special character."
            )

        return value


class EmployeeLogin(SQLModel):
    email: EmailStr
    password: str


class EmployeeResponse(SQLModel):
    employee_id: int
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    position: str
    date_joined: str
    department_id: int
