"""工艺路线 Schema

定义工艺路线相关的请求和响应模型。

设计规范: docs/DATABASE_DESIGN.md
"""
from decimal import Decimal
from datetime import datetime
from typing import Optional
from enum import Enum

from pydantic import BaseModel, Field

from app.schemas.common import PricePair


# ========== 枚举类型 ==========


class ProcessRouteStatus(str, Enum):
    """工艺路线状态枚举."""
    DRAFT = "draft"
    PENDING = "pending"
    ACTIVE = "active"
    DEPRECATED = "deprecated"


# ========== 工序明细相关 Schema ==========


class ProcessRouteItemBase(BaseModel):
    """工序明细基础模型."""
    operation_no: str = Field(..., description="工序号，如 OP010")
    process_code: str = Field(..., description="工序编码（关联 process_rates）")
    sequence: int = Field(default=0, description="排序顺序")
    cycle_time_std: Optional[int] = Field(None, description="标准工时（秒）")
    cycle_time_vave: Optional[int] = Field(None, description="VAVE工时（秒）")
    personnel_std: Decimal = Field(default=Decimal("1.0"), description="标准人工配置")
    personnel_vave: Optional[Decimal] = Field(None, description="VAVE人工配置")
    efficiency_factor: Decimal = Field(default=Decimal("1.0"), description="效率系数")
    remarks: Optional[str] = Field(None, description="备注")


class ProcessRouteItemCreate(ProcessRouteItemBase):
    """创建工序明细请求模型."""
    pass


class ProcessRouteItemUpdate(BaseModel):
    """更新工序明细请求模型."""
    operation_no: Optional[str] = None
    process_code: Optional[str] = None
    sequence: Optional[int] = None
    cycle_time_std: Optional[int] = None
    cycle_time_vave: Optional[int] = None
    personnel_std: Optional[Decimal] = None
    personnel_vave: Optional[Decimal] = None
    efficiency_factor: Optional[Decimal] = None
    remarks: Optional[str] = None


class ProcessRouteItemResponse(ProcessRouteItemBase):
    """工序明细响应模型."""
    id: str = Field(..., description="UUID")
    route_id: str = Field(..., description="关联工艺路线ID")

    # 从 process_rates 关联获取的参考数据
    process_name: Optional[str] = Field(None, description="工序名称")
    equipment: Optional[str] = Field(None, description="设备")

    # 费率数据（快照）
    std_mhr_var: Optional[Decimal] = Field(None, description="标准变动费率")
    std_mhr_fix: Optional[Decimal] = Field(None, description="标准固定费率")
    vave_mhr_var: Optional[Decimal] = Field(None, description="VAVE变动费率")
    vave_mhr_fix: Optional[Decimal] = Field(None, description="VAVE固定费率")

    # 计算成本
    std_cost: Decimal = Field(..., description="标准成本")
    vave_cost: Decimal = Field(..., description="VAVE成本")

    created_at: datetime = Field(..., description="创建时间")

    model_config = {"from_attributes": True}


class ProcessRouteItemWithCost(ProcessRouteItemResponse):
    """带成本计算的工序明细."""
    cost: PricePair = Field(..., description="双轨成本")


# ========== 工艺路线相关 Schema ==========


class ProcessRouteBase(BaseModel):
    """工艺路线基础模型."""
    name: str = Field(..., max_length=200, description="工艺路线名称")
    product_id: Optional[str] = Field(None, max_length=50, description="关联产品ID")
    remarks: Optional[str] = Field(None, description="备注")


class ProcessRouteCreate(ProcessRouteBase):
    """创建工艺路线请求模型."""
    items: list[ProcessRouteItemCreate] = Field(
        default_factory=list, description="工序明细列表"
    )


class ProcessRouteUpdate(BaseModel):
    """更新工艺路线请求模型."""
    name: Optional[str] = Field(None, max_length=200)
    product_id: Optional[str] = None
    remarks: Optional[str] = None
    items: Optional[list[ProcessRouteItemUpdate]] = None


class ProcessRouteResponse(ProcessRouteBase):
    """工艺路线响应模型."""
    id: str = Field(..., description="工艺路线编码")
    version: int = Field(..., description="当前版本号")
    status: ProcessRouteStatus = Field(..., description="状态")
    created_by: Optional[str] = Field(None, description="创建人")
    approved_by: Optional[str] = Field(None, description="审批人")
    approved_at: Optional[datetime] = Field(None, description="审批时间")
    created_at: datetime = Field(..., description="创建时间")
    updated_at: datetime = Field(..., description="更新时间")

    # 关联的工序明细
    items: list[ProcessRouteItemResponse] = Field(
        default_factory=list, description="工序明细列表"
    )

    # 汇总成本
    total_std_cost: Decimal = Field(..., description="总标准成本")
    total_vave_cost: Decimal = Field(..., description="总VAVE成本")
    total_savings: Decimal = Field(..., description="总节省金额")
    savings_rate: float = Field(..., description="节省率")

    item_count: int = Field(..., description="工序数量")

    model_config = {"from_attributes": True}


class ProcessRouteList(BaseModel):
    """工艺路线列表项（简化版）."""
    id: str = Field(..., description="工艺路线编码")
    name: str = Field(..., description="工艺路线名称")
    status: ProcessRouteStatus = Field(..., description="状态")
    version: int = Field(..., description="版本号")
    item_count: int = Field(..., description="工序数量")
    total_std_cost: Decimal = Field(..., description="总标准成本")
    total_vave_cost: Decimal = Field(..., description="总VAVE成本")
    updated_at: datetime = Field(..., description="更新时间")

    model_config = {"from_attributes": True}


class ProcessRouteQuery(BaseModel):
    """工艺路线查询参数."""
    status: Optional[ProcessRouteStatus] = Field(None, description="状态筛选")
    keyword: Optional[str] = Field(None, description="关键词搜索（名称或编码）")
    product_id: Optional[str] = Field(None, description="产品ID筛选")
    page: int = Field(1, ge=1, description="页码")
    page_size: int = Field(20, ge=1, le=100, description="每页数量")


# ========== 审批相关 Schema ==========


class ProcessRouteSubmitRequest(BaseModel):
    """提交审批请求模型."""
    remarks: Optional[str] = Field(None, description="提交说明")


class ProcessRouteApprovalRequest(BaseModel):
    """审批请求模型."""
    approved: bool = Field(..., description="是否通过")
    remarks: Optional[str] = Field(None, description="审批意见")


class ProcessRouteApprovalResponse(BaseModel):
    """审批响应模型."""
    id: str = Field(..., description="工艺路线编码")
    status: ProcessRouteStatus = Field(..., description="更新后状态")
    approved_by: Optional[str] = Field(None, description="审批人")
    approved_at: Optional[datetime] = Field(None, description="审批时间")

    model_config = {"from_attributes": True}
