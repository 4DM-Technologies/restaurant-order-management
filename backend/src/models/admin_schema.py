"""Admin DTOs — employees + order history."""


from pydantic import BaseModel, ConfigDict, field_validator, model_validator

from src.repositories.schema.enums import AccountRole


class EmployeeCreate(BaseModel):
    name: str
    email: str

    @field_validator("name")
    @classmethod
    def name_not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Name is required")
        return v.strip()

    @field_validator("email")
    @classmethod
    def email_valid(cls, v: str) -> str:
        if "@" not in v:
            raise ValueError("Enter a valid email address")
        return v.strip().lower()


class EmployeePatch(BaseModel):
    name: str | None = None
    email: str | None = None

    @field_validator("name")
    @classmethod
    def name_not_blank(cls, v: str | None) -> str | None:
        if v is not None and not v.strip():
            raise ValueError("Name is required")
        return v.strip() if v is not None else None

    @field_validator("email")
    @classmethod
    def email_valid(cls, v: str | None) -> str | None:
        if v is not None and "@" not in v:
            raise ValueError("Enter a valid email address")
        return v.strip().lower() if v is not None else None

    @model_validator(mode="after")
    def at_least_one(self) -> "EmployeePatch":
        if self.name is None and self.email is None:
            raise ValueError("Provide a name or email to update")
        return self


class EmployeeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    account_uuid: str
    account_id: int
    account_name: str
    account_email: str
    account_role: AccountRole
    created_at: str
    has_password: bool
    can_delete: bool = True