from pydantic import BaseModel, Field
from typing import Optional
from app.schemas.common import StatusLight


class MaterialResponse(BaseModel):
    """物料响应模型."""
    id: str
    part_number: str = Field(..., alias="partNumber")
    part_name: str = Field(..., alias="partName")
    material: str
    supplier: str
    quantity: float
    unit_price: Optional[float] = Field(None, alias="unitPrice")
    vave_price: Optional[float] = Field(None, alias="vavePrice")
    has_history_data: bool = Field(..., alias="hasHistoryData")
    comments: str
    status: StatusLight = StatusLight.GREEN

    model_config = {"populate_by_name": True, "by_alias": True}
