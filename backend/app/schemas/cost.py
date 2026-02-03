from pydantic import BaseModel, Field
from decimal import Decimal
from app.schemas.common import PricePair


class CostCalculationResponse(BaseModel):
    product_id: str = Field(..., alias="productId")
    material_cost: PricePair = Field(..., alias="materialCost")
    process_cost: PricePair = Field(..., alias="processCost")
    total_cost: PricePair = Field(..., alias="totalCost")

    model_config = {"populate_by_name": True, "by_alias": True}
