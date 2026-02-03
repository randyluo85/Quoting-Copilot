"""双轨计价算法测试."""

import pytest
from decimal import Decimal
from unittest.mock import AsyncMock, MagicMock, patch

from app.services.calculation import DualTrackCalculator


@pytest.mark.asyncio
class TestDualTrackCalculation:
    """双轨计价算法测试."""

    async def test_zero_price_pair(self):
        """测试零价格对 - 无物料编码."""
        calc = DualTrackCalculator(None)
        result = await calc.calculate_material_cost(None, 10)

        assert result.std == Decimal("0.00")
        assert result.vave == Decimal("0.00")
        assert result.savings == Decimal("0.00")
        assert result.savings_rate == 0.0

    async def test_zero_price_pair_no_process(self):
        """测试零价格对 - 无工艺名称."""
        calc = DualTrackCalculator(None)
        result = await calc.calculate_process_cost(None, 2.5)

        assert result.std == Decimal("0.00")
        assert result.vave == Decimal("0.00")

    async def test_material_not_found(self):
        """测试物料不存在."""
        with patch("app.services.calculation.select"):
            async def mock_execute(*args, **kwargs):
                mock_result = AsyncMock()
                mock_result.scalar_one_or_none = MagicMock(return_value=None)
                return mock_result

            db = AsyncMock()
            db.execute = mock_execute

            calc = DualTrackCalculator(db)
            result = await calc.calculate_material_cost("NONEXISTENT", 10)

            assert result.std == Decimal("0.00")
            assert result.vave == Decimal("0.00")

    async def test_material_cost_calculation(self):
        """测试物料成本计算."""
        mock_material = MagicMock()
        mock_material.std_price = Decimal("100.00")
        mock_material.vave_price = Decimal("85.00")

        with patch("app.services.calculation.select"):
            async def mock_execute(*args, **kwargs):
                mock_result = AsyncMock()
                mock_result.scalar_one_or_none = MagicMock(return_value=mock_material)
                return mock_result

            db = AsyncMock()
            db.execute = mock_execute

            calc = DualTrackCalculator(db)
            result = await calc.calculate_material_cost("TEST-001", 10)

            assert result.std == Decimal("1000.00")  # 100 * 10
            assert result.vave == Decimal("850.00")  # 85 * 10
            assert result.savings == Decimal("150.00")
            assert result.savings_rate == 0.15

    async def test_material_cost_no_vave_price(self):
        """测试物料成本计算 - 无 VAVE 价格."""
        mock_material = MagicMock()
        mock_material.std_price = Decimal("100.00")
        mock_material.vave_price = None

        with patch("app.services.calculation.select"):

            async def mock_execute(*args, **kwargs):
                mock_result = AsyncMock()
                mock_result.scalar_one_or_none = MagicMock(return_value=mock_material)
                return mock_result

            db = AsyncMock()
            db.execute = mock_execute

            calc = DualTrackCalculator(db)
            result = await calc.calculate_material_cost("TEST-001", 10)

            # VAVE 价格应等于标准价格
            assert result.std == Decimal("1000.00")
            assert result.vave == Decimal("1000.00")
            assert result.savings == Decimal("0.00")

    async def test_process_cost_calculation(self):
        """测试工艺成本计算."""
        mock_rate = MagicMock()
        mock_rate.std_mhr = Decimal("45.00")
        mock_rate.std_labor = Decimal("30.00")
        mock_rate.vave_mhr = Decimal("42.00")
        mock_rate.vave_labor = Decimal("28.00")
        mock_rate.efficiency_factor = Decimal("0.95")

        with patch("app.services.calculation.select"):

            async def mock_execute(*args, **kwargs):
                mock_result = AsyncMock()
                mock_result.scalar_one_or_none = MagicMock(return_value=mock_rate)
                return mock_result

            db = AsyncMock()
            db.execute = mock_execute

            calc = DualTrackCalculator(db)
            result = await calc.calculate_process_cost("重力铸造", 2.5)

            # 标准成本 = 2.5 * (45 + 30) = 2.5 * 75 = 187.5
            # VAVE成本 = 2.5 * (42 + 28) * 0.95 = 2.5 * 70 * 0.95 = 166.25
            assert result.std == Decimal("187.50")
            assert result.vave == Decimal("166.25")
            assert result.savings == Decimal("21.25")

    def test_savings_calculation(self):
        """测试节省率计算."""
        std = Decimal("100.00")
        vave = Decimal("85.00")
        savings = std - vave
        savings_rate = float(savings / std)

        assert savings == Decimal("15.00")
        assert savings_rate == 0.15  # 15/100 = 0.15
