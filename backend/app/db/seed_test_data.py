"""测试数据种子脚本 - 物料和工艺费率数据."""

import asyncio
from sqlalchemy import select
from app.db.session import async_session_maker
from app.models.material import Material
from app.models.process_rate import ProcessRate


async def seed_materials():
    """插入物料测试数据."""

    test_materials = [
        # 铝合金材料
        Material(
            item_code="MAT-A356-T6",
            name="A356铝合金铸造材料",
            spec="铸造级，符合GB/T 1173标准，Si:6.5-7.5%",
            std_price=28.50,
            vave_price=26.80,
            supplier_tier="A",
            category="金属-铝合金"
        ),
        Material(
            item_code="MAT-AL6061-T6",
            name="6061铝棒",
            spec="T6态，直径Φ20-80",
            std_price=32.00,
            vave_price=30.50,
            supplier_tier="A",
            category="金属-铝合金"
        ),
        # 钢材
        Material(
            item_code="MAT-ST304-2B",
            name="不锈钢板 304",
            spec="2B表面，厚度0.5-3.0mm",
            std_price=18.50,
            vave_price=17.20,
            supplier_tier="A",
            category="金属-不锈钢"
        ),
        Material(
            item_code="MAT-ST40CR",
            name="40Cr合金钢",
            spec="调质状态HRC28-32",
            std_price=12.30,
            vave_price=11.50,
            supplier_tier="B",
            category="金属-钢材"
        ),
        # 塑料
        Material(
            item_code="MAT-PA66-GF30",
            name="PA66塑料（含30%玻纤）",
            spec="阻燃级，黑色",
            std_price=45.00,
            vave_price=42.00,
            supplier_tier="A",
            category="塑料"
        ),
        Material(
            item_code="MAT-PA6-GF15",
            name="PA6塑料（含15%玻纤）",
            spec="本色",
            std_price=32.00,
            vave_price=29.50,
            supplier_tier="B",
            category="塑料"
        ),
        Material(
            item_code="MAT-POM",
            name="POM聚甲醛",
            spec="耐磨级，白色",
            std_price=28.00,
            vave_price=26.00,
            supplier_tier="B",
            category="塑料"
        ),
        # 橡胶
        Material(
            item_code="MAT-NBR-O",
            name="NBR丁腈橡胶",
            spec="耐油耐温，邵氏A70",
            std_price=22.00,
            vave_price=20.50,
            supplier_tier="A",
            category="橡胶"
        ),
        Material(
            item_code="MAT-EPDM",
            name="EPDM三元乙丙橡胶",
            spec="耐候耐温，黑色",
            std_price=18.00,
            vave_price=16.80,
            supplier_tier="B",
            category="橡胶"
        ),
        # 标准件
        Material(
            item_code="STD-M5-SS",
            name="不锈钢螺丝 M5",
            spec="304材质，内六角",
            std_price=0.15,
            vave_price=0.12,
            supplier_tier="C",
            category="标准件"
        ),
        Material(
            item_code="STD-M6-SS",
            name="不锈钢螺丝 M6",
            spec="304材质，内六角",
            std_price=0.20,
            vave_price=0.18,
            supplier_tier="C",
            category="标准件"
        ),
        Material(
            item_code="STD-M8-SS",
            name="不锈钢螺丝 M8",
            spec="304材质，内六角",
            std_price=0.30,
            vave_price=0.25,
            supplier_tier="C",
            category="标准件"
        ),
        # 电子元器件
        Material(
            item_code="ELEC-CONN-M12",
            name="M12连接器",
            spec="4针，防水IP67",
            std_price=15.00,
            vave_price=13.50,
            supplier_tier="B",
            category="电子元器件"
        ),
        Material(
            item_code="ELEC-CABLE-2M",
            name="屏蔽电缆 2芯",
            spec="2米，黑色",
            std_price=8.50,
            vave_price=7.80,
            supplier_tier="B",
            category="电子元器件"
        ),
    ]

    async with async_session_maker() as session:
        # 检查是否已有数据
        result = await session.execute(select(Material).limit(1))
        existing = result.scalars().first()

        if existing:
            print("物料数据已存在，跳过插入")
            return

        for material in test_materials:
            session.add(material)

        await session.commit()
        print(f"已插入 {len(test_materials)} 条物料数据")


async def seed_process_rates():
    """插入工艺费率测试数据."""

    test_rates = [
        # 铸造工艺
        ProcessRate(
            process_name="重力铸造",
            work_center="铸造车间",
            std_mhr=45.00,
            std_labor=35.00,
            vave_mhr=42.00,
            vave_labor=32.00,
            efficiency_factor=1.0
        ),
        ProcessRate(
            process_name="低压铸造",
            work_center="铸造车间",
            std_mhr=55.00,
            std_labor=40.00,
            vave_mhr=50.00,
            vave_labor=36.00,
            efficiency_factor=1.1
        ),
        # 机加工艺
        ProcessRate(
            process_name="CNC精加工",
            work_center="机加车间",
            std_mhr=180.00,
            std_labor=80.00,
            vave_mhr=165.00,
            vave_labor=72.00,
            efficiency_factor=1.0
        ),
        ProcessRate(
            process_name="车削加工",
            work_center="机加车间",
            std_mhr=120.00,
            std_labor=60.00,
            vave_mhr=110.00,
            vave_labor=52.00,
            efficiency_factor=0.95
        ),
        ProcessRate(
            process_name="铣削加工",
            work_center="机加车间",
            std_mhr=150.00,
            std_labor=70.00,
            vave_mhr=135.00,
            vave_labor=62.00,
            efficiency_factor=0.98
        ),
        ProcessRate(
            process_name="钻孔加工",
            work_center="机加车间",
            std_mhr=95.00,
            std_labor=50.00,
            vave_mhr=85.00,
            vave_labor=45.00,
            efficiency_factor=0.92
        ),
        # 表面处理
        ProcessRate(
            process_name="阳极氧化",
            work_center="表面处理车间",
            std_mhr=25.00,
            std_labor=15.00,
            vave_mhr=23.00,
            vave_labor=14.00,
            efficiency_factor=1.0
        ),
        ProcessRate(
            process_name="镀锌",
            work_center="表面处理车间",
            std_mhr=18.00,
            std_labor=12.00,
            vave_mhr=16.00,
            vave_labor=11.00,
            efficiency_factor=1.05
        ),
        ProcessRate(
            process_name="喷涂",
            work_center="喷涂车间",
            std_mhr=22.00,
            std_labor=18.00,
            vave_mhr=20.00,
            vave_labor=16.00,
            efficiency_factor=0.95
        ),
        # 检测工艺
        ProcessRate(
            process_name="气密性检测",
            work_center="检测中心",
            std_mhr=8.50,
            std_labor=15.00,
            vave_mhr=7.80,
            vave_labor=14.00,
            efficiency_factor=1.0
        ),
        ProcessRate(
            process_name="X射线检测",
            work_center="检测中心",
            std_mhr=12.00,
            std_labor=20.00,
            vave_mhr=11.00,
            vave_labor=18.00,
            efficiency_factor=1.0
        ),
        ProcessRate(
            process_name="尺寸检测",
            work_center="检测中心",
            std_mhr=5.00,
            std_labor=10.00,
            vave_mhr=4.50,
            vave_labor=9.00,
            efficiency_factor=1.0
        ),
        # 装配工艺
        ProcessRate(
            process_name="总装",
            work_center="装配线",
            std_mhr=35.00,
            std_labor=45.00,
            vave_mhr=32.00,
            vave_labor=40.00,
            efficiency_factor=1.0
        ),
        ProcessRate(
            process_name="包装",
            work_center="包装车间",
            std_mhr=15.00,
            std_labor=20.00,
            vave_mhr=14.00,
            vave_labor=18.00,
            efficiency_factor=1.0
        ),
    ]

    async with async_session_maker() as session:
        # 检查是否已有数据
        result = await session.execute(select(ProcessRate).limit(1))
        existing = result.scalars().first()

        if existing:
            print("工艺费率数据已存在，跳过插入")
            return

        for rate in test_rates:
            session.add(rate)

        await session.commit()
        print(f"已插入 {len(test_rates)} 条工艺费率数据")


async def seed_all():
    """执行所有数据插入."""
    print("=" * 50)
    print("开始插入测试数据...")
    print("=" * 50)

    await seed_materials()
    await seed_process_rates()

    print("=" * 50)
    print("测试数据插入完成！")
    print("=" * 50)


if __name__ == "__main__":
    asyncio.run(seed_all())
