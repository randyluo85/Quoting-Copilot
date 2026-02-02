# tests/unit/schemas/test_material.py
import pytest
from decimal import Decimal
from datetime import datetime
from app.schemas.material import MaterialCreate, MaterialResponse, MaterialListResponse


def test_material_create_schema():
    """验证 MaterialCreate schema"""
    data = {
        "id": "TEST-001",
        "name": "测试物料",
        "spec": "规格",
        "std_price": "100.50",
        "vave_price": "85.00",
        "supplier_tier": "A"
    }
    schema = MaterialCreate(**data)
    assert schema.id == "TEST-001"
    assert schema.std_price == Decimal("100.50")


def test_material_response_schema():
    """验证 MaterialResponse schema"""
    data = {
        "id": "TEST-001",
        "name": "测试物料",
        "spec": "规格",
        "std_price": "100.50",
        "vave_price": "85.00",
        "supplier_tier": "A",
        "created_at": "2026-02-02T00:00:00",
        "updated_at": "2026-02-02T00:00:00"
    }
    schema = MaterialResponse(**data)
    assert schema.id == "TEST-001"


def test_material_list_response_schema():
    """验证 MaterialListResponse schema"""
    data = {
        "total": 1,
        "items": [{
            "id": "TEST-001",
            "name": "测试物料",
            "spec": "规格",
            "std_price": "100.50",
            "vave_price": "85.00",
            "supplier_tier": "A",
            "created_at": "2026-02-02T00:00:00",
            "updated_at": "2026-02-02T00:00:00"
        }],
        "page": 1,
        "page_size": 20
    }
    schema = MaterialListResponse(**data)
    assert schema.total == 1
    assert len(schema.items) == 1
