"""Pydantic schemas module.

设计规范: docs/DATABASE_DESIGN.md
"""

# 通用类型
from app.schemas.common import PricePair, StatusLight

# 项目相关
from app.schemas.project import (
    ProductSchema,
    ProjectOwnerSchema,
    ProjectCreate,
    ProjectResponse,
)

# 物料相关
from app.schemas.material import MaterialResponse

# 成本相关
from app.schemas.cost import CostCalculationResponse

# BOM 和工艺路线相关（新增）
from app.schemas.bom import (
    ProjectProductCreate,
    ProjectProductResponse,
    ProductMaterialCreate,
    ProductMaterialResponse,
    ProductProcessCreate,
    ProductProcessResponse,
    QuoteSummaryCreate,
    QuoteSummaryResponse,
    MaterialDetailResponse,
)

# 工艺路线模板相关（新增）
from app.schemas.process_route import (
    ProcessRouteStatus,
    ProcessRouteCreate,
    ProcessRouteUpdate,
    ProcessRouteResponse,
    ProcessRouteList,
    ProcessRouteQuery,
    ProcessRouteItemCreate,
    ProcessRouteItemUpdate,
    ProcessRouteItemResponse,
    ProcessRouteSubmitRequest,
    ProcessRouteApprovalRequest,
    ProcessRouteApprovalResponse,
)

__all__ = [
    # 通用类型
    "PricePair",
    "StatusLight",
    # 项目相关
    "ProductSchema",
    "ProjectOwnerSchema",
    "ProjectCreate",
    "ProjectResponse",
    # 物料相关
    "MaterialResponse",
    # 成本相关
    "CostCalculationResponse",
    # BOM 和工艺路线相关
    "ProjectProductCreate",
    "ProjectProductResponse",
    "ProductMaterialCreate",
    "ProductMaterialResponse",
    "ProductProcessCreate",
    "ProductProcessResponse",
    "QuoteSummaryCreate",
    "QuoteSummaryResponse",
    "MaterialDetailResponse",
    # 工艺路线模板相关
    "ProcessRouteStatus",
    "ProcessRouteCreate",
    "ProcessRouteUpdate",
    "ProcessRouteResponse",
    "ProcessRouteList",
    "ProcessRouteQuery",
    "ProcessRouteItemCreate",
    "ProcessRouteItemUpdate",
    "ProcessRouteItemResponse",
    "ProcessRouteSubmitRequest",
    "ProcessRouteApprovalRequest",
    "ProcessRouteApprovalResponse",
]
