"""测试数据种子脚本 - 物料和工艺费率数据."""

import asyncio
from sqlalchemy import select
from app.db.session import AsyncSessionLocal
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
    """插入工艺费率测试数据.

    MHR (Machine Hour Rate) = 综合工时费率（元/小时）= 机时设备费 + 人工费
    """

    test_rates = [
        # 铸造工艺
        ProcessRate(
            process_name="重力铸造",
            work_center="铸造车间",
            std_hourly_rate=80.00,  # 45机时 + 35人工
            vave_hourly_rate=74.00,  # 42机时 + 32人工
            efficiency_factor=1.0
        ),
        ProcessRate(
            process_name="低压铸造",
            work_center="铸造车间",
            std_hourly_rate=95.00,  # 55机时 + 40人工
            vave_hourly_rate=86.00,  # 50机时 + 36人工
            efficiency_factor=1.1
        ),
        # 机加工艺
        ProcessRate(
            process_name="CNC精加工",
            work_center="机加车间",
            std_hourly_rate=260.00,  # 180机时 + 80人工
            vave_hourly_rate=237.00,  # 165机时 + 72人工
            efficiency_factor=1.0
        ),
        ProcessRate(
            process_name="车削加工",
            work_center="机加车间",
            std_hourly_rate=180.00,  # 120机时 + 60人工
            vave_hourly_rate=162.00,  # 110机时 + 52人工
            efficiency_factor=0.95
        ),
        ProcessRate(
            process_name="铣削加工",
            work_center="机加车间",
            std_hourly_rate=220.00,  # 150机时 + 70人工
            vave_hourly_rate=197.00,  # 135机时 + 62人工
            efficiency_factor=0.98
        ),
        ProcessRate(
            process_name="钻孔加工",
            work_center="机加车间",
            std_hourly_rate=145.00,  # 95机时 + 50人工
            vave_hourly_rate=130.00,  # 85机时 + 45人工
            efficiency_factor=0.92
        ),
        # 表面处理
        ProcessRate(
            process_name="阳极氧化",
            work_center="表面处理车间",
            std_hourly_rate=40.00,  # 25机时 + 15人工
            vave_hourly_rate=37.00,  # 23机时 + 14人工
            efficiency_factor=1.0
        ),
        ProcessRate(
            process_name="镀锌",
            work_center="表面处理车间",
            std_hourly_rate=30.00,  # 18机时 + 12人工
            vave_hourly_rate=27.00,  # 16机时 + 11人工
            efficiency_factor=1.05
        ),
        ProcessRate(
            process_name="喷涂",
            work_center="喷涂车间",
            std_hourly_rate=40.00,  # 22机时 + 18人工
            vave_hourly_rate=36.00,  # 20机时 + 16人工
            efficiency_factor=0.95
        ),
        # 检测工艺
        ProcessRate(
            process_name="气密性检测",
            work_center="检测中心",
            std_hourly_rate=23.50,  # 8.5机时 + 15人工
            vave_hourly_rate=21.80,  # 7.8机时 + 14人工
            efficiency_factor=1.0
        ),
        ProcessRate(
            process_name="X射线检测",
            work_center="检测中心",
            std_hourly_rate=32.00,  # 12机时 + 20人工
            vave_hourly_rate=29.00,  # 11机时 + 18人工
            efficiency_factor=1.0
        ),
        ProcessRate(
            process_name="尺寸检测",
            work_center="检测中心",
            std_hourly_rate=15.00,  # 5机时 + 10人工
            vave_hourly_rate=13.50,  # 4.5机时 + 9人工
            efficiency_factor=1.0
        ),
        # 装配工艺
        ProcessRate(
            process_name="总装",
            work_center="装配线",
            std_hourly_rate=80.00,  # 35机时 + 45人工
            vave_hourly_rate=72.00,  # 32机时 + 40人工
            efficiency_factor=1.0
        ),
        ProcessRate(
            process_name="包装",
            work_center="包装车间",
            std_hourly_rate=35.00,  # 15机时 + 20人工
            vave_hourly_rate=32.00,  # 14机时 + 18人工
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
