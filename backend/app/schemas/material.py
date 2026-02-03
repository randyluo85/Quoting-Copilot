from pydantic import BaseModel, Field
from decimal import Decimal
from typing import Optional
from app.schemas.common import StatusLight


class MaterialResponse(BaseModel):
    id: str
    partNumber: str = Field(..., alias="part_number")
    partName: str = Field(..., alias="part_name")
    material: str
    supplier: str
    quantity: float
    unitPrice: Optional[Decimal] = Field(None, alias="unit_price")
    vavePrice: Optional[Decimal] = Field(None, alias="vave_price")
    hasHistoryData: bool = Field(..., alias="has_history_data")
    comments: str
    status: StatusLight = StatusLight.GREEN

    model_config = {"populate_by_name": True, "by_alias": True}
