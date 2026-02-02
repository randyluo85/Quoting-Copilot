# tests/unit/models/test_material.py
import pytest
from decimal import Decimal
from app.models.material import Material


def test_material_model_attributes():
    """验证 Material 模型包含所有必需字段"""
    # Arrange
    material_data = {
        "id": "TEST-001",
        "name": "测试物料",
        "spec": "规格说明",
        "std_price": Decimal("100.50"),
        "vave_price": Decimal("85.00"),
        "supplier_tier": "A",
    }

    # Act
    material = Material(**material_data)

    # Assert
    assert material.id == "TEST-001"
    assert material.name == "测试物料"
    assert material.std_price == Decimal("100.50")
    assert material.vave_price == Decimal("85.00")
    assert material.supplier_tier == "A"


def test_material_string_representation():
    """验证 Material 的字符串表示"""
    material = Material(
        id="TEST-001",
        name="测试物料",
        std_price=Decimal("100.50")
    )
    assert str(material) == "TEST-001 - 测试物料"
