# backend/app/models/__init__.py
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """所有模型的基类"""
    pass


# 导入所有模型以注册到 Base.metadata
from app.models.material import Material  # noqa


__all__ = ["Base", "Material"]
