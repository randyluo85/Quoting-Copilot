from pydantic import BaseModel, Field
from typing import List, Optional
from decimal import Decimal
from app.models.project import ProjectStatus


class ProductSchema(BaseModel):
    id: str
    name: str
    part_number: str = Field(..., alias="partNumber")
    annual_volume: int = Field(..., alias="annualVolume")
    description: str

    model_config = {"populate_by_name": True, "by_alias": True}


class ProjectOwnerSchema(BaseModel):
    sales: str
    vm: str
    ie: str
    controlling: str

    model_config = {"by_alias": True}


class ProjectCreate(BaseModel):
    asac_number: str = Field(..., alias="asacNumber")
    customer_number: str = Field(..., alias="customerNumber")
    product_version: str = Field(..., alias="productVersion")
    customer_version: str = Field(..., alias="customerVersion")
    client_name: str = Field(..., alias="clientName")
    project_name: str = Field(..., alias="projectName")
    annual_volume: str = Field(..., alias="annualVolume")
    description: str
    products: List["ProductSchema"]
    owners: ProjectOwnerSchema
    target_margin: Optional[float] = Field(None, alias="targetMargin")  # 目标利润率(%)

    model_config = {"populate_by_name": True, "by_alias": True}


class ProjectResponse(BaseModel):
    id: str
    asac_number: str = Field(..., alias="asacNumber")
    customer_number: str = Field(..., alias="customerNumber")
    product_version: str = Field(..., alias="productVersion")
    customer_version: str = Field(..., alias="customerVersion")
    client_name: str = Field(..., alias="clientName")
    project_name: str = Field(..., alias="projectName")
    annual_volume: str = Field(..., alias="annualVolume")
    description: str
    products: List["ProductSchema"]
    owners: ProjectOwnerSchema
    status: ProjectStatus
    target_margin: Optional[float] = Field(None, alias="targetMargin")  # 目标利润率(%)
    owner: Optional[str] = None  # 负责人（简化字段）
    remarks: Optional[str] = None  # 备注
    created_date: str = Field(..., alias="createdDate")
    updated_date: str = Field(..., alias="updatedDate")

    model_config = {"populate_by_name": True, "by_alias": True}
