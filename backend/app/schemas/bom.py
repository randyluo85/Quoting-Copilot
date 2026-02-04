"""BOM 和工艺路线相关的 Pydantic Schemas.

设计规范: docs/DATABASE_DESIGN.md
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from decimal import Decimal
from datetime import datetime
from app.schemas.common import PricePair, StatusLight


# ==================== ProjectProduct ====================

class ProjectProductCreate(BaseModel):
    """创建项目产品关联.

    必填字段:
    - product_name: 产品名称
    - product_code: 产品编码

    非必填字段:
    - route_code: 工艺路线编码
    - product_version: 产品版本
    - bom_file_path: BOM文件路径
    """
    project_id: str = Field(..., alias="projectId")
    product_name: str = Field(..., alias="productName", min_length=1)
    product_code: str = Field(..., alias="productCode", min_length=1)  # 改为必填
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
    created_at: str = Field(..., alias="createdAt")  # 使用字符串类型

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


# ==================== BOM Upload Response ====================

class BOMMaterialResponse(BaseModel):
    """BOM 上传返回的物料响应（用于前端显示）."""
    id: str  # 格式: M-001
    part_number: str = Field(..., alias="partNumber")
    part_name: str = Field(..., alias="partName")
    material: Optional[str] = None
    supplier: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = "PC"  # 单位，从 BOM 文件解析
    unit_price: Optional[float] = Field(None, alias="unitPrice")
    vave_price: Optional[float] = Field(None, alias="vavePrice")
    has_history_data: bool = Field(False, alias="hasHistoryData")
    comments: Optional[str] = None
    status: StatusLight = StatusLight.RED

    model_config = {"populate_by_name": True, "by_alias": True}


class BOMProcessResponse(BaseModel):
    """BOM 上传返回的工艺响应（用于前端显示）."""
    id: str  # 格式: P-001
    op_no: str = Field(..., alias="opNo")
    name: str
    work_center: Optional[str] = Field(None, alias="workCenter")
    standard_time: Optional[float] = Field(None, alias="standardTime")
    unit_price: Optional[float] = Field(None, alias="unitPrice")
    vave_price: Optional[float] = Field(None, alias="vavePrice")
    has_history_data: bool = Field(False, alias="hasHistoryData")

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


# ==================== 多产品 BOM 解析 ====================

class ProductInfoSchema(BaseModel):
    """产品元数据（从 sheet 顶部提取）."""
    product_code: str
    product_name: Optional[str] = None
    product_number: Optional[str] = None
    product_version: str = "01"
    customer_version: str = "01"
    customer_number: Optional[str] = None
    issue_date: Optional[datetime] = None
    material_count: int = 0
    process_count: int = 0

    model_config = {"by_alias": True}


class MaterialSchema(BaseModel):
    """物料 Schema（用于解析结果）."""
    level: str
    part_number: str = Field(..., alias="partNumber")
    part_name: str = Field(..., alias="partName")
    version: str
    type: str
    status: str
    material: str
    supplier: str
    quantity: float
    unit: str
    comments: str

    model_config = {"by_alias": True, "populate_by_name": True}


class ProcessSchema(BaseModel):
    """工艺 Schema（用于解析结果）."""
    op_no: str = Field(..., alias="opNo")
    name: str
    work_center: str = Field(..., alias="workCenter")
    standard_time: float = Field(..., alias="standardTime")
    spec: Optional[str] = None

    model_config = {"by_alias": True, "populate_by_name": True}


class ProductBOMResultSchema(BaseModel):
    """单个产品的 BOM 解析结果."""
    product_info: ProductInfoSchema = Field(..., alias="productInfo")
    materials: List[MaterialSchema]
    processes: List[ProcessSchema]

    model_config = {"by_alias": True, "populate_by_name": True}


class MultiProductBOMParseResultSchema(BaseModel):
    """多产品 BOM 解析结果."""
    products: List[ProductBOMResultSchema]
    total_products: int
    total_materials: int
    parse_warnings: List[str] = []

    model_config = {"by_alias": True, "populate_by_name": True}


class BOMConfirmCreateRequest(BaseModel):
    """确认创建产品请求."""
    project_id: str = Field(..., alias="projectId")
    products: List[ProductBOMResultSchema]

    model_config = {"by_alias": True, "populate_by_name": True}


class BOMPreviewResponse(BaseModel):
    """BOM 预览响应."""
    project_id: str = Field(..., alias="projectId")
    products: List[ProductBOMResultSchema]
    total_products: int
    total_materials: int
    parse_warnings: List[str] = []

    model_config = {"by_alias": True, "populate_by_name": True}
