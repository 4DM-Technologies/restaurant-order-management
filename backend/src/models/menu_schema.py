"""Menu DTOs — grouped list, create, patch."""

from pydantic import BaseModel, Field, field_validator, model_validator


class MenuItemBase(BaseModel):
    category: str
    name: str
    description: str | None = None
    standard_price: float | None = None
    small_price: float | None = None
    large_price: float | None = None
    image_url: str | None = None
    is_available: bool = True

    @field_validator("name")
    @classmethod
    def name_not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Item name is required")
        return v.strip()

    @field_validator("category")
    @classmethod
    def category_not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Category is required")
        return v.strip()

    @field_validator("standard_price", "small_price", "large_price")
    @classmethod
    def price_non_negative(cls, v: float | None) -> float | None:
        if v is not None and v < 0:
            raise ValueError("Prices cannot be negative")
        return v


class MenuItemCreate(MenuItemBase):
    # Convenience single-price alias -> standard_price when set via "price".
    price: float | None = Field(default=None, alias="price")

    @model_validator(mode="after")
    def resolve_price(self) -> "MenuItemCreate":
        if self.price is not None and self.standard_price is None:
            self.standard_price = self.price
        if self.standard_price is None and self.small_price is None and self.large_price is None:
            raise ValueError("At least one price is required")
        return self


class MenuItemPatch(BaseModel):
    category: str | None = None
    name: str | None = None
    description: str | None = None
    standard_price: float | None = None
    small_price: float | None = None
    large_price: float | None = None
    image_url: str | None = None
    is_available: bool | None = None
    price: float | None = None

    @field_validator("name", "category")
    @classmethod
    def not_blank(cls, v: str | None) -> str | None:
        if v is not None and not v.strip():
            raise ValueError("Value cannot be blank")
        return v.strip() if v is not None else None

    @field_validator("standard_price", "small_price", "large_price", "price")
    @classmethod
    def price_non_negative(cls, v: float | None) -> float | None:
        if v is not None and v < 0:
            raise ValueError("Prices cannot be negative")
        return v

    @model_validator(mode="after")
    def resolve_price(self) -> "MenuItemPatch":
        if self.price is not None:
            self.standard_price = self.price
        if all(v is None for v in (self.category, self.name, self.description,
                                   self.standard_price, self.small_price,
                                   self.large_price, self.image_url,
                                   self.is_available, self.price)):
            raise ValueError("Provide at least one field to update")
        return self


class MenuItemOut(BaseModel):
    menu_uuid: str
    menu_id: int
    category: str
    item_name: str
    item_description: str | None = None
    standard_price: float | None = None
    small_price: float | None = None
    large_price: float | None = None
    image_url: str | None = None
    is_available: bool


class MenuGroupOut(BaseModel):
    category: str
    items: list[MenuItemOut]