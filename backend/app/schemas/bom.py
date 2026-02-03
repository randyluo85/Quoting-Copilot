"""BOM 和工艺路线相关的 Pydantic Schemas.

设计规范: docs/DATABASE_DESIGN.md
"""
from pydantic import BaseModel, Field
from typing import Optional
from decimal import Decimal
from datetime import datetime
from app.schemas.common import PricePair, StatusLight


# ==================== ProjectProduct ====================

class ProjectProductCreate(BaseModel):
    """创建项目产品关联."""
    project_id: str = Field(..., alias="projectId")
    product_name: str = Field(..., alias="productName")
    product_code: Optional[str] = Field(None, alias="productCode")
    product_version: Optional[str] = Field(None, alias="productVersion")
    route_code: Optional[str] = Field(None, alias="routeCode")
    bom_file_path: Optional[str] = Field(None, alias="bomFilePath")

    model_config = {"populate_by_name": True, "by_alias": True}


class ProjectProductResponse(BaseModel):
    """项目产品响应."""
    id: str
    project_id: str = Field(..., alias="projectId")
    product_name: str = Field(..., alias="productName")
    product_code: Optional[str] = Field(None, alias="productCode")
    product_version: Optional[str] = Field(None, alias="productVersion")
    route_code: Optional[str] = Field(None, alias="routeCode")
    bom_file_path: Optional[str] = Field(None, alias="bomFilePath")
    created_at: datetime = Field(..., alias="createdAt")

    model_config = {"populate_by_name": True, "by_alias": True}


# ==================== ProductMaterial ====================

class ProductMaterialCreate(BaseModel):
    """创建产品物料关联（BOM行）."""
    project_product_id: str = Field(..., alias="projectProductId")
    material_id: Optional[str] = Field(None, alias="materialId")
    material_level: Optional[int] = Field(None, alias="materialLevel")
    material_name: Optional[str] = Field(None, alias="materialName")
    material_type: Optional[str] = Field(None, alias="materialType")  # made/bought
    quantity: Optional[Decimal] = None
    unit: Optional[str] = None
    std_cost: Optional[Decimal] = Field(None, alias="stdCost")
    vave_cost: Optional[Decimal] = Field(None, alias="vaveCost")
    confidence: Optional[float] = None  # 0-100
    ai_suggestion: Optional[str] = Field(None, alias="aiSuggestion")
    remarks: Optional[str] = None

    model_config = {"populate_by_name": True, "by_alias": True}


class ProductMaterialResponse(BaseModel):
    """产品物料响应（BOM行）."""
    id: str
    project_product_id: str = Field(..., alias="projectId")
    material_id: Optional[str] = Field(None, alias="materialId")
    material_level: Optional[int] = Field(None, alias="materialLevel")
    material_name: Optional[str] = Field(None, alias="materialName")
    material_type: Optional[str] = Field(None, alias="materialType")
    quantity: Optional[Decimal] = None
    unit: Optional[str] = None
    std_cost: Optional[Decimal] = Field(None, alias="stdCost")
    vave_cost: Optional[Decimal] = Field(None, alias="vaveCost")
    confidence: Optional[float] = None
    ai_suggestion: Optional[str] = Field(None, alias="aiSuggestion")
    remarks: Optional[str] = None
    status: StatusLight = StatusLight.GREEN  # 计算状态
    created_at: datetime = Field(..., alias="createdAt")

    model_config = {"populate_by_name": True, "by_alias": True}


# ==================== ProductProcess ====================

class ProductProcessCreate(BaseModel):
    """创建产品工艺路线."""
    project_product_id: str = Field(..., alias="projectId")
    process_code: str = Field(..., alias="processCode")
    sequence_order: int = Field(..., alias="sequenceOrder")
    cycle_time: Optional[int] = Field(None, alias="cycleTime")  # 工时（秒）
    std_mhr: Optional[Decimal] = Field(None, alias="stdMhr")
    vave_mhr: Optional[Decimal] = Field(None, alias="vaveMhr")
    std_cost: Optional[Decimal] = Field(None, alias="stdCost")
    vave_cost: Optional[Decimal] = Field(None, alias="vaveCost")
    remarks: Optional[str] = None

    model_config = {"populate_by_name": True, "by_alias": True}


class ProductProcessResponse(BaseModel):
    """产品工艺响应."""
    id: str
    project_product_id: str = Field(..., alias="projectId")
    process_code: str = Field(..., alias="processCode")
    sequence_order: int = Field(..., alias="sequenceOrder")
    cycle_time: Optional[int] = Field(None, alias="cycleTime")
    std_mhr: Optional[Decimal] = Field(None, alias="stdMhr")
    vave_mhr: Optional[Decimal] = Field(None, alias="vaveMhr")
    std_cost: Optional[Decimal] = Field(None, alias="stdCost")
    vave_cost: Optional[Decimal] = Field(None, alias="vaveCost")
    remarks: Optional[str] = None
    created_at: datetime = Field(..., alias="createdAt")

    model_config = {"populate_by_name": True, "by_alias": True}


# ==================== QuoteSummary ====================

class QuoteSummaryCreate(BaseModel):
    """创建报价汇总."""
    project_id: str = Field(..., alias="projectId")
    total_std_cost: Optional[Decimal] = Field(None, alias="totalStdCost")
    total_vave_cost: Optional[Decimal] = Field(None, alias="totalVaveCost")
    total_savings: Optional[Decimal] = Field(None, alias="totalSavings")
    savings_rate: Optional[float] = Field(None, alias="savingsRate")
    quoted_price: Optional[Decimal] = Field(None, alias="quotedPrice")
    actual_margin: Optional[float] = Field(None, alias="actualMargin")

    model_config = {"populate_by_name": True, "by_alias": True}


class QuoteSummaryResponse(BaseModel):
    """报价汇总响应."""
    id: str
    project_id: str = Field(..., alias="projectId")
    total_std_cost: Optional[Decimal] = Field(None, alias="totalStdCost")
    total_vave_cost: Optional[Decimal] = Field(None, alias="totalVaveCost")
    total_savings: Optional[Decimal] = Field(None, alias="totalSavings")
    savings_rate: Optional[float] = Field(None, alias="savingsRate")
    quoted_price: Optional[Decimal] = Field(None, alias="quotedPrice")
    actual_margin: Optional[float] = Field(None, alias="actualMargin")
    created_at: datetime = Field(..., alias="createdAt")
    updated_at: datetime = Field(..., alias="updatedAt")

    model_config = {"populate_by_name": True, "by_alias": True}


# ==================== 扩展的 Material Response ====================

class MaterialDetailResponse(BaseModel):
    """物料详情响应（包含新字段）."""
    id: int
    item_code: str = Field(..., alias="itemCode")
    name: str
    spec: Optional[str] = None
    version: Optional[str] = None
    material_type: Optional[str] = Field(None, alias="materialType")  # made/bought
    status: Optional[str] = None  # active/inactive
    material: Optional[str] = None  # 材料描述
    supplier: Optional[str] = None
    remarks: Optional[str] = None
    std_price: Optional[Decimal] = Field(None, alias="stdPrice")
    vave_price: Optional[Decimal] = Field(None, alias="vavePrice")
    supplier_tier: Optional[str] = Field(None, alias="supplierTier")
    category: Optional[str] = None
    created_at: datetime = Field(..., alias="createdAt")
    updated_at: datetime = Field(..., alias="updatedAt")

    model_config = {"populate_by_name": True, "by_alias": True}
