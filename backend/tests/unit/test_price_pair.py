"""PricePair 值对象单元测试.

遵循 TDD 原则：
1. RED - 先写失败的测试
2. GREEN - 写最小代码使测试通过
3. REFACTOR - 重构清理
"""

import pytest
from decimal import Decimal
from pydantic import ValidationError

from app.schemas.common import PricePair


class TestPricePairCalculation:
    """PricePair 双轨价格计算测试."""

    def test_price_pair_calculates_savings_correctly(self):
        """测试节省金额计算正确性: savings = std - vave."""
        # Arrange & Act
        price_pair = PricePair(
            std=Decimal("100.00"),
            vave=Decimal("85.00"),
            savings=Decimal("15.00"),
            savings_rate=0.15,
        )

        # Assert
        assert price_pair.std == Decimal("100.00")
        assert price_pair.vave == Decimal("85.00")
        assert price_pair.savings == Decimal("15.00")
        assert price_pair.savings_rate == 0.15

    def test_price_pair_with_different_savings_rate(self):
        """测试不同节省率计算."""
        # 场景：节省 30%
        price_pair = PricePair(
            std=Decimal("200.00"),
            vave=Decimal("140.00"),
            savings=Decimal("60.00"),
            savings_rate=0.30,
        )

        assert price_pair.std == Decimal("200.00")
        assert price_pair.vave == Decimal("140.00")
        assert price_pair.savings == Decimal("60.00")
        assert price_pair.savings_rate == 0.30

    def test_price_pair_with_zero_std_returns_zero_savings(self):
        """测试零标准价格时节省为零."""
        price_pair = PricePair(
            std=Decimal("0.00"),
            vave=Decimal("0.00"),
            savings=Decimal("0.00"),
            savings_rate=0.0,
        )

        assert price_pair.std == Decimal("0.00")
        assert price_pair.vave == Decimal("0.00")
        assert price_pair.savings == Decimal("0.00")
        assert price_pair.savings_rate == 0.0

    def test_price_pair_without_vave_uses_std(self):
        """测试无 VAVE 价格时，VAVE 等于标准价格."""
        # 当没有 VAVE 价格时，应该使用标准价格
        price_pair = PricePair(
            std=Decimal("100.00"),
            vave=Decimal("100.00"),  # 无 VAVE 时回退到 std
            savings=Decimal("0.00"),
            savings_rate=0.0,
        )

        assert price_pair.std == Decimal("100.00")
        assert price_pair.vave == Decimal("100.00")
        assert price_pair.savings == Decimal("0.00")
        assert price_pair.savings_rate == 0.0

    def test_price_pair_with_high_savings_rate(self):
        """测试高节省率（>20%）."""
        # 高节省率场景需要在前端高亮显示
        price_pair = PricePair(
            std=Decimal("100.00"),
            vave=Decimal("70.00"),
            savings=Decimal("30.00"),
            savings_rate=0.30,
        )

        assert price_pair.savings_rate == 0.30
        assert price_pair.savings_rate > 0.20  # 超过 20% 阈值

    def test_price_pair_extreme_savings_rate(self):
        """测试极端节省率（50%）."""
        price_pair = PricePair(
            std=Decimal("100.00"),
            vave=Decimal("50.00"),
            savings=Decimal("50.00"),
            savings_rate=0.50,
        )

        assert price_pair.savings_rate == 0.50

    def test_price_pair_with_small_savings(self):
        """测试小额节省."""
        price_pair = PricePair(
            std=Decimal("100.00"),
            vave=Decimal("95.00"),
            savings=Decimal("5.00"),
            savings_rate=0.05,
        )

        assert price_pair.savings == Decimal("5.00")
        assert price_pair.savings_rate == 0.05

    def test_price_pair_decimal_precision(self):
        """测试小数精度（2位小数）."""
        price_pair = PricePair(
            std=Decimal("100.567"),
            vave=Decimal("85.432"),
            savings=Decimal("15.135"),
            savings_rate=0.1504,
        )

        # PricePair 不自动四舍五入，由创建者控制精度
        assert price_pair.std == Decimal("100.567")
        assert price_pair.vave == Decimal("85.432")


class TestPricePairEdgeCases:
    """PricePair 边界情况测试."""

    def test_price_pair_equal_std_and_vave(self):
        """测试标准价格等于 VAVE 价格（无节省）."""
        price_pair = PricePair(
            std=Decimal("100.00"),
            vave=Decimal("100.00"),
            savings=Decimal("0.00"),
            savings_rate=0.0,
        )

        assert price_pair.savings == Decimal("0.00")
        assert price_pair.savings_rate == 0.0

    def test_price_pair_vave_higher_than_std(self):
        """测试 VAVE 价格高于标准价格（负节省）.

        这种情况在现实中不应发生，但测试应能处理.
        """
        price_pair = PricePair(
            std=Decimal("85.00"),
            vave=Decimal("100.00"),
            savings=Decimal("-15.00"),
            savings_rate=-0.1765,
        )

        assert price_pair.savings == Decimal("-15.00")
        assert price_pair.savings_rate < 0

    def test_price_pair_with_large_values(self):
        """测试大数值."""
        price_pair = PricePair(
            std=Decimal("999999.99"),
            vave=Decimal("850000.00"),
            savings=Decimal("149999.99"),
            savings_rate=0.15,
        )

        assert price_pair.std == Decimal("999999.99")
        assert price_pair.savings == Decimal("149999.99")


class TestPricePairSerialization:
    """PricePair 序列化测试."""

    def test_price_pair_model_dump_uses_alias(self):
        """测试序列化时使用别名（camelCase）."""
        price_pair = PricePair(
            std=Decimal("100.00"),
            vave=Decimal("85.00"),
            savings=Decimal("15.00"),
            savings_rate=0.15,
        )

        # 使用 by_alias=True 序列化
        data = price_pair.model_dump(by_alias=True)

        assert data["std"] == Decimal("100.00")
        assert data["vave"] == Decimal("85.00")
        assert data["savings"] == Decimal("15.00")
        assert data["savingsRate"] == 0.15

    def test_price_pair_json_serialization(self):
        """测试 JSON 序列化."""
        price_pair = PricePair(
            std=Decimal("100.00"),
            vave=Decimal("85.00"),
            savings=Decimal("15.00"),
            savings_rate=0.15,
        )

        # mode="json" 将 Decimal 转换为 float
        data = price_pair.model_dump(mode="json", by_alias=True)

        # Pydantic 保留 Decimal 的字符串表示
        assert data["std"] == "100.00"
        assert data["vave"] == "85.00"
        assert data["savings"] == "15.00"
        assert data["savingsRate"] == 0.15

    def test_price_pair_from_dict(self):
        """测试从字典创建 PricePair."""
        data = {
            "std": "100.00",
            "vave": "85.00",
            "savings": "15.00",
            "savingsRate": 0.15,
        }

        price_pair = PricePair(**data)

        assert price_pair.std == Decimal("100.00")
        assert price_pair.vave == Decimal("85.00")


class TestPricePairValidation:
    """PricePair 验证测试."""

    def test_price_pair_requires_all_fields(self):
        """测试所有字段都是必需的."""
        with pytest.raises(ValidationError) as exc_info:
            PricePair()

        errors = exc_info.value.errors()
        error_fields = {e["loc"][0] for e in errors}
        assert "std" in error_fields
        assert "vave" in error_fields
        assert "savings" in error_fields
        assert "savingsRate" in error_fields

    def test_price_pair_accepts_string_numbers(self):
        """测试接受字符串形式的数字."""
        price_pair = PricePair(
            std="100.00",
            vave="85.00",
            savings="15.00",
            savingsRate="0.15",
        )

        assert price_pair.std == Decimal("100.00")
        assert price_pair.vave == Decimal("85.00")
