# backend/app/core/value_objects.py
from pydantic import BaseModel, Field
from decimal import Decimal


class PricePair(BaseModel):
    """双轨价格封装"""
    std: Decimal = Field(..., description="标准成本")
    vave: Decimal = Field(..., description="VAVE 目标成本")
    savings: Decimal = Field(..., description="价差 = std - vave")
    savings_rate: float = Field(..., description="价差比例 = savings / std * 100")

    @classmethod
    def from_prices(cls, std: Decimal, vave: Decimal | None = None) -> "PricePair":
        """从标准价和可选 VAVE 价创建"""
        if vave is None:
            vave = std
        savings = std - vave
        savings_rate = float(savings / std * 100) if std > 0 else 0.0
        return cls(std=std, vave=vave, savings=savings, savings_rate=savings_rate)


class ExtractedFeature(BaseModel):
    """AI 提取的工艺特征"""
    process: str = Field(..., description="工艺名称")
    count: int = Field(..., description="数量", ge=0)
    unit: str = Field(default="次", description="单位")
