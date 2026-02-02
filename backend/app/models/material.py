# backend/app/models/material.py
from sqlalchemy import Column, String, Numeric, DateTime, func
from decimal import Decimal

from app.models import Base


class Material(Base):
    """物料主数据表"""
    __tablename__ = "materials"

    id = Column(String(50), primary_key=True, autoincrement=False)  # 使用 item_code 作为主键
    name = Column(String(100), nullable=False)
    spec = Column(String(255), nullable=True)
    std_price = Column(Numeric(10, 4), nullable=False, default=Decimal("0"))
    vave_price = Column(Numeric(10, 4), nullable=True)
    supplier_tier = Column(String(20), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"{self.id} - {self.name}"
