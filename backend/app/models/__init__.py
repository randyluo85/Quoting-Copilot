# backend/app/models/__init__.py
from sqlalchemy.orm import DeclarativeBase
from app.models.material import Material  # noqa


class Base(DeclarativeBase):
    """所有模型的基类"""
    pass


__all__ = ["Base", "Material"]
