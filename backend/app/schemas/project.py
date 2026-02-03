from pydantic import BaseModel, Field
from typing import List
from app.models.project import ProjectStatus


class ProductSchema(BaseModel):
    id: str
    name: str
    partNumber: str = Field(..., alias="part_number")
    annualVolume: int = Field(..., alias="annual_volume")
    description: str

    model_config = {"populate_by_name": True, "by_alias": True}


class ProjectOwnerSchema(BaseModel):
    sales: str
    vm: str
    ie: str
    pe: str
    controlling: str

    model_config = {"by_alias": True}


class ProjectCreate(BaseModel):
    asacNumber: str = Field(..., alias="asac_number")
    customerNumber: str = Field(..., alias="customer_number")
    productVersion: str = Field(..., alias="product_version")
    customerVersion: str = Field(..., alias="customer_version")
    clientName: str = Field(..., alias="client_name")
    projectName: str = Field(..., alias="project_name")
    annualVolume: str = Field(..., alias="annual_volume")
    description: str
    products: List[ProductSchema]
    owners: ProjectOwnerSchema

    model_config = {"populate_by_name": True, "by_alias": True}


class ProjectResponse(BaseModel):
    id: str
    asacNumber: str = Field(..., alias="asac_number")
    customerNumber: str = Field(..., alias="customer_number")
    productVersion: str = Field(..., alias="product_version")
    customerVersion: str = Field(..., alias="customer_version")
    clientName: str = Field(..., alias="client_name")
    projectName: str = Field(..., alias="project_name")
    annualVolume: str = Field(..., alias="annual_volume")
    description: str
    products: List[ProductSchema]
    owners: ProjectOwnerSchema
    status: ProjectStatus
    createdDate: str = Field(..., alias="created_date")
    updatedDate: str = Field(..., alias="updated_date")

    model_config = {"populate_by_name": True, "by_alias": True}
