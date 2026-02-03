"""双轨计价计算服务 - 核心算法."""

from decimal import Decimal
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.material import Material
from app.models.process_rate import ProcessRate
from app.schemas.common import PricePair


class DualTrackCalculator:
    """双轨计价计算器 - 核心算法.

    实现标准成本与 VAVE 成本的双轨计算。
    """

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def calculate_material_cost(
        self,
        material_code: str | None,
        quantity: float,
    ) -> PricePair:
        """计算物料成本（双轨).

        公式: Cost = Quantity * Price

        Args:
            material_code: 物料编码
            quantity: 数量

        Returns:
            PricePair: 标准成本和 VAVE 成本
        """
        if not material_code:
            return self._zero_price_pair()

        result = await self.db.execute(select(Material).where(Material.item_code == material_code))
        material = result.scalar_one_or_none()

        if material is None:
            return self._zero_price_pair()

        std_price = Decimal(str(material.std_price)) if material.std_price else Decimal("0")
        vave_price = Decimal(str(material.vave_price)) if material.vave_price else std_price

        quantity_dec = Decimal(str(quantity))
        std_cost = std_price * quantity_dec
        vave_cost = vave_price * quantity_dec

        return self._create_price_pair(std_cost, vave_cost)

    async def calculate_process_cost(
        self,
        process_name: str | None,
        cycle_time: float,
    ) -> PricePair:
        """计算工艺成本（双轨）.

        公式: Cost = CycleTime * (MHR + Labor)

        Args:
            process_name: 工艺名称
            cycle_time: 循环时间

        Returns:
            PricePair: 标准成本和 VAVE 成本
        """
        if not process_name:
            return self._zero_price_pair()

        result = await self.db.execute(
            select(ProcessRate).where(ProcessRate.process_name == process_name)
        )
        rate = result.scalar_one_or_none()

        if rate is None:
            return self._zero_price_pair()

        std_mhr = Decimal(str(rate.std_mhr)) if rate.std_mhr else Decimal("0")
        std_labor = Decimal(str(rate.std_labor)) if rate.std_labor else Decimal("0")
        std_hourly_rate = std_mhr + std_labor

        vave_mhr = Decimal(str(rate.vave_mhr)) if rate.vave_mhr else std_mhr
        vave_labor = Decimal(str(rate.vave_labor)) if rate.vave_labor else std_labor
        vave_hourly_rate = vave_mhr + vave_labor

        efficiency = Decimal(str(rate.efficiency_factor))
        cycle_time_dec = Decimal(str(cycle_time))

        std_cost = cycle_time_dec * std_hourly_rate
        vave_cost = cycle_time_dec * vave_hourly_rate * efficiency

        return self._create_price_pair(std_cost, vave_cost)

    def _create_price_pair(self, std: Decimal, vave: Decimal) -> PricePair:
        """创建 PricePair，自动计算节省."""
        savings = std - vave
        savings_rate = float(savings / std) if std > 0 else 0.0

        return PricePair(
            std=std.quantize(Decimal("0.01")),
            vave=vave.quantize(Decimal("0.01")),
            savings=savings.quantize(Decimal("0.01")),
            savings_rate=round(savings_rate, 4),
        )

    def _zero_price_pair(self) -> PricePair:
        """零价格对."""
        return PricePair(
            std=Decimal("0.00"),
            vave=Decimal("0.00"),
            savings=Decimal("0.00"),
            savings_rate=0.0,
        )
