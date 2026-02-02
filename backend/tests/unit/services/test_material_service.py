# tests/unit/services/test_material_service.py
import pytest
from decimal import Decimal
from app.services.material_service import MaterialService
from app.schemas.material import MaterialCreate


@pytest.mark.asyncio
async def test_create_material(mock_db_session):
    """验证创建物料"""
    service = MaterialService(mock_db_session)
    data = MaterialCreate(
        id="TEST-001",
        name="测试物料",
        std_price=Decimal("100.50"),
        vave_price=Decimal("85.00")
    )

    result = await service.create(data)

    assert result.id == "TEST-001"
    assert result.name == "测试物料"
    assert result.std_price == Decimal("100.50")


@pytest.mark.asyncio
async def test_get_material_by_id(mock_db_session):
    """验证通过 ID 获取物料"""
    service = MaterialService(mock_db_session)
    # 先创建
    data = MaterialCreate(
        id="TEST-001",
        name="测试物料",
        std_price=Decimal("100.50")
    )
    await service.create(data)

    # 查询
    result = await service.get_by_id("TEST-001")

    assert result is not None
    assert result.id == "TEST-001"
