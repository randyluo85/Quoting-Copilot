"""Materials API Pydantic Schemas.

设计规范: docs/DATABASE_DESIGN.md
"""
from pydantic import BaseModel, Field
from typing import Optional
from decimal import Decimal
from datetime import datetime


class MaterialCreate(BaseModel):
    """创建物料请求."""
    itemCode: str = Field(..., min_length=1, max_length=50)
    name: str = Field(..., min_length=1, max_length=200)
    spec: Optional[str] = Field(None, max_length=255)
    version: Optional[str] = Field(None, max_length=20)
    materialType: Optional[str] = Field(None, max_length=20)  # made/bought
    status: Optional[str] = Field("active", max_length=20)  # active/inactive
    material: Optional[str] = Field(None, max_length=100)
    supplier: Optional[str] = Field(None, max_length=200)
    remarks: Optional[str] = None
    stdPrice: Optional[Decimal] = Field(None, ge=0, decimal_places=4)
    vavePrice: Optional[Decimal] = Field(None, ge=0, decimal_places=4)
    supplierTier: Optional[str] = Field(None, max_length=20)
    category: Optional[str] = Field(None, max_length=50)

    model_config = {"populate_by_name": True, "by_alias": True}


class MaterialUpdate(BaseModel):
    """更新物料请求."""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    spec: Optional[str] = Field(None, max_length=255)
    version: Optional[str] = Field(None, max_length=20)
    materialType: Optional[str] = Field(None, max_length=20)
    status: Optional[str] = Field(None, max_length=20)
    material: Optional[str] = Field(None, max_length=100)
    supplier: Optional[str] = Field(None, max_length=200)
    remarks: Optional[str] = None
    stdPrice: Optional[Decimal] = Field(None, ge=0, decimal_places=4)
    vavePrice: Optional[Decimal] = Field(None, ge=0, decimal_places=4)
    supplierTier: Optional[str] = Field(None, max_length=20)
    category: Optional[str] = Field(None, max_length=50)

    model_config = {"populate_by_name": True, "by_alias": True}


class MaterialResponse(BaseModel):
    """物料响应模型（包含双轨价格）."""
    id: int
    itemCode: str
    name: str
    spec: Optional[str] = None
    version: Optional[str] = None
    materialType: Optional[str] = Field(None, alias="materialType")
    status: Optional[str] = None
    material: Optional[str] = None
    supplier: Optional[str] = None
    remarks: Optional[str] = None
    stdPrice: Optional[Decimal] = Field(None, alias="stdPrice")
    vavePrice: Optional[Decimal] = Field(None, alias="vavePrice")
    savings: Optional[Decimal] = None  # 计算字段：stdPrice - vavePrice
    supplierTier: Optional[str] = Field(None, alias="supplierTier")
    category: Optional[str] = None
    createdAt: str = Field(..., alias="createdAt")
    updatedAt: str = Field(..., alias="updatedAt")

    model_config = {"populate_by_name": True, "by_alias": True}


class ProcessRateCreate(BaseModel):
    """创建工序费率请求."""
    processCode: str = Field(..., min_length=1, max_length=50)
    processName: str = Field(..., min_length=1, max_length=100)
    equipment: Optional[str] = Field(None, max_length=100)
    stdMhr: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    vaveMhr: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    efficiencyFactor: Optional[Decimal] = Field(Decimal("1.0"), ge=0, decimal_places=2)
    remarks: Optional[str] = None

    model_config = {"populate_by_name": True, "by_alias": True}


class ProcessRateUpdate(BaseModel):
    """更新工序费率请求."""
    processName: Optional[str] = Field(None, min_length=1, max_length=100)
    equipment: Optional[str] = Field(None, max_length=100)
    stdMhr: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    vaveMhr: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    efficiencyFactor: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    remarks: Optional[str] = None

    model_config = {"populate_by_name": True, "by_alias": True}


class ProcessRateResponse(BaseModel):
    """工序费率响应模型（包含双轨费率）."""
    id: int
    processCode: str
    processName: str
    equipment: Optional[str] = None
    stdMhr: Optional[Decimal] = Field(None, alias="stdMhr")
    vaveMhr: Optional[Decimal] = Field(None, alias="vaveMhr")
    savings: Optional[Decimal] = None  # 计算字段：stdMhr - vaveMhr
    efficiencyFactor: Optional[Decimal] = Field(None, alias="efficiencyFactor")
    remarks: Optional[str] = None
    createdAt: str = Field(..., alias="createdAt")
    updatedAt: str = Field(..., alias="updatedAt")

    model_config = {"populate_by_name": True, "by_alias": True}
