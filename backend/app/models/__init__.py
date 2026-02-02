# backend/app/models/__init__.py
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """所有模型的基类 - 用于 SQLAlchemy ORM"""
    pass


__all__ = ["Base"]


# 延迟导入模型避免循环依赖
from app.models.material import Material  # noqa
