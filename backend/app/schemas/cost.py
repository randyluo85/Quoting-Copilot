from pydantic import BaseModel, Field
from decimal import Decimal
from app.schemas.common import PricePair


class CostCalculationResponse(BaseModel):
    productId: str = Field(..., alias="product_id")
    materialCost: PricePair = Field(..., alias="material_cost")
    processCost: PricePair = Field(..., alias="process_cost")
    totalCost: PricePair = Field(..., alias="total_cost")

    model_config = {"populate_by_name": True}
