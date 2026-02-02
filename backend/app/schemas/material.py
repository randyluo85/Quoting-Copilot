# backend/app/schemas/material.py
from pydantic import BaseModel, Field, ConfigDict
from decimal import Decimal
from datetime import datetime
from typing import Optional


class MaterialBase(BaseModel):
    """物料基础字段"""
    name: str = Field(..., min_length=1, max_length=100, description="物料名称")
    spec: Optional[str] = Field(None, max_length=255, description="规格说明")
    std_price: Decimal = Field(..., ge=0, description="标准单价")
    vave_price: Optional[Decimal] = Field(None, ge=0, description="VAVE 单价")
    supplier_tier: Optional[str] = Field(None, max_length=20, description="供应商等级")


class MaterialCreate(MaterialBase):
    """创建物料"""
    id: str = Field(..., min_length=1, max_length=50, description="物料编码")


class MaterialUpdate(MaterialBase):
    """更新物料"""
    pass  # id 不在更新字段中


class MaterialResponse(MaterialBase):
    """物料响应"""
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MaterialListResponse(BaseModel):
    """物料列表响应"""
    total: int
    items: list[MaterialResponse]
    page: int
    page_size: int


class MaterialImportResult(BaseModel):
    """物料导入结果"""
    success_count: int
    failed_count: int
    failed_rows: list[dict]  # {row: int, reason: str, data: dict}
