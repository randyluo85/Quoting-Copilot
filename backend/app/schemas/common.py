from pydantic import BaseModel, Field
from decimal import Decimal
from enum import Enum


class PricePair(BaseModel):
    """双轨价格封装 - 核心值对象."""

    std: Decimal = Field(..., alias="std", description="标准成本")
    vave: Decimal = Field(..., alias="vave", description="VAVE目标成本")
    savings: Decimal = Field(..., alias="savings", description="节省金额 (std - vave)")
    savings_rate: float = Field(..., alias="savingsRate", description="节省率 (savings / std)")

    model_config = {"populate_by_name": True, "by_alias": True}


class StatusLight(str, Enum):
    """红绿灯状态"""

    GREEN = "verified"
    YELLOW = "warning"
    RED = "missing"
