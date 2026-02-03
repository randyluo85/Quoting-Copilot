"""添加测试数据 - 物料、工序费率、工艺路线.

运行方式: python scripts/add_test_data.py
"""
import asyncio
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.material import Material
from app.models.process_rate import ProcessRate
from app.models.process_route import ProcessRoute, ProcessRouteItem, ProcessRouteStatus


# 测试物料数据
TEST_MATERIALS = [
    {
        "item_code": "A356-T6",
        "item_name": "铝合金 A356-T6",
        "material_type": "金属-铝合金",
        "supplier": "中国铝业",
        "unit": "kg",
        "std_price": Decimal("28.50"),
        "vave_price": Decimal("26.80"),
        "has_history_data": True,
        "comments": "铸造级，符合GB/T 1173标准",
    },
    {
        "item_code": "40Cr",
        "item_name": "40Cr合金钢",
        "material_type": "金属-钢材",
        "supplier": "精密锻造厂",
        "unit": "kg",
        "std_price": Decimal("12.30"),
        "vave_price": Decimal("11.50"),
        "has_history_data": True,
        "comments": "HRC45-50",
    },
    {
        "item_code": "NBR-70",
        "item_name": "NBR橡胶密封件",
        "material_type": "橡胶",
        "supplier": "密封件公司",
        "unit": "pcs",
        "std_price": Decimal("3.20"),
        "vave_price": Decimal("2.95"),
        "has_history_data": True,
        "comments": "耐温-40~150℃",
    },
    {
        "item_code": "SUS316L",
        "item_name": "316L不锈钢",
        "material_type": "金属-不锈钢",
        "supplier": "太钢不锈",
        "unit": "kg",
        "std_price": Decimal("45.00"),
        "vave_price": Decimal("42.00"),
        "has_history_data": True,
        "comments": "耐腐蚀，316L等级",
    },
]

# 测试工序费率数据
TEST_PROCESS_RATES = [
    {
        "process_code": "OP010",
        "process_name": "重力铸造",
        "equipment": "铸造机 Z-500",
        "work_center": "铸造车间",
        "std_mhr_var": Decimal("30.00"),
        "std_mhr_fix": Decimal("15.00"),
        "vave_mhr_var": Decimal("28.00"),
        "vave_mhr_fix": Decimal("14.00"),
        "efficiency_factor": 1.0,
        "remarks": "铝合金铸造，温度720℃",
    },
    {
        "process_code": "OP020",
        "process_name": "CNC精加工",
        "equipment": "五轴加工中心",
        "work_center": "机加车间",
        "std_mhr_var": Decimal("120.00"),
        "std_mhr_fix": Decimal("60.00"),
        "vave_mhr_var": Decimal("110.00"),
        "vave_mhr_fix": Decimal("55.00"),
        "efficiency_factor": 1.0,
        "remarks": "五轴加工，公差±0.02mm",
    },
    {
        "process_code": "OP030",
        "process_name": "激光打标",
        "equipment": "激光打标机 L-200",
        "work_center": "表面处理车间",
        "std_mhr_var": Decimal("8.00"),
        "std_mhr_fix": Decimal("2.00"),
        "vave_mhr_var": Decimal("7.50"),
        "vave_mhr_fix": Decimal("2.00"),
        "efficiency_factor": 1.0,
        "remarks": "二维码+序列号",
    },
    {
        "process_code": "OP040",
        "process_name": "气密性检测",
        "equipment": "氦检漏仪",
        "work_center": "检测中心",
        "std_mhr_var": Decimal("12.00"),
        "std_mhr_fix": Decimal("5.00"),
        "vave_mhr_var": Decimal("11.00"),
        "vave_mhr_fix": Decimal("5.00"),
        "efficiency_factor": 1.0,
        "remarks": "氦检漏，灵敏度10^-9",
    },
    {
        "process_code": "OP050",
        "process_name": "表面处理",
        "equipment": "阳极氧化线",
        "work_center": "表面处理车间",
        "std_mhr_var": Decimal("25.00"),
        "std_mhr_fix": Decimal("8.00"),
        "vave_mhr_var": Decimal("23.00"),
        "vave_mhr_fix": Decimal("8.00"),
        "efficiency_factor": 1.0,
        "remarks": "阳极氧化，黑色",
    },
]


async def add_test_data():
    """添加测试数据到数据库."""
    async with async_session_maker() as db:
        # 添加物料数据
        print("添加物料数据...")
        for material_data in TEST_MATERIALS:
            # 检查是否已存在
            from sqlalchemy import select
            result = await db.execute(
                select(Material).where(Material.item_code == material_data["item_code"])
            )
            existing = result.scalar_one_or_none()

            if not existing:
                material = Material(**material_data)
                db.add(material)
                print(f"  + 添加物料: {material_data['item_code']} - {material_data['item_name']}")
            else:
                print(f"  = 物料已存在: {material_data['item_code']}")

        # 添加工序费率数据
        print("\n添加工序费率数据...")
        for rate_data in TEST_PROCESS_RATES:
            from sqlalchemy import select
            result = await db.execute(
                select(ProcessRate).where(ProcessRate.process_code == rate_data["process_code"])
            )
            existing = result.scalar_one_or_none()

            if not existing:
                rate = ProcessRate(**rate_data)
                db.add(rate)
                print(f"  + 添加工序: {rate_data['process_code']} - {rate_data['process_name']}")
            else:
                print(f"  = 工序已存在: {rate_data['process_code']}")

        await db.commit()
        print("\n测试数据添加完成！")


if __name__ == "__main__":
    asyncio.run(add_test_data())
