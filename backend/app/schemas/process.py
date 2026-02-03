from pydantic import BaseModel, Field
from typing import Optional


class ProcessResponse(BaseModel):
    """工艺响应模型."""
    id: str
    op_no: str = Field(..., alias="opNo")
    name: str
    work_center: str = Field(..., alias="workCenter")
    standard_time: float = Field(..., alias="standardTime")
    unit_price: Optional[float] = Field(None, alias="unitPrice")
    vave_price: Optional[float] = Field(None, alias="vavePrice")
    has_history_data: bool = Field(..., alias="hasHistoryData")

    model_config = {"populate_by_name": True, "by_alias": True}
