"""测试数据工厂模块.

提供用于测试的实体创建工厂函数，遵循工厂模式简化测试数据准备.
"""

from decimal import Decimal
from app.models.material import Material
from app.models.process_rate import ProcessRate
from app.models.project import Project, ProjectStatus
from datetime import datetime


class MaterialFactory:
    """物料测试数据工厂."""

    @staticmethod
    def create_dual_price(
        item_code: str = "MAT-TEST",
        std_price: float = 100.0,
        vave_price: float = 85.0,
        name: str | None = None,
        **kwargs,
    ) -> Material:
        """创建带双轨价格的物料实例.

        Args:
            item_code: 物料编码
            std_price: 标准价格
            vave_price: VAVE 价格
            name: 物料名称
            **kwargs: 其他字段

        Returns:
            Material 实例（未持久化）
        """
        return Material(
            item_code=item_code,
            name=name or f"测试物料-{item_code}",
            std_price=Decimal(str(std_price)),
            vave_price=Decimal(str(vave_price)),
            supplier_tier=kwargs.get("supplier_tier", "A"),
            category=kwargs.get("category", "测试"),
            material=kwargs.get("material", "测试材料"),
            status=kwargs.get("status", "active"),
            spec=kwargs.get("spec"),
            supplier=kwargs.get("supplier"),
        )

    @staticmethod
    def create_without_vave(
        item_code: str = "MAT-TEST-NO-VAVE",
        std_price: float = 100.0,
        **kwargs,
    ) -> Material:
        """创建无 VAVE 价格的物料实例.

        Args:
            item_code: 物料编码
            std_price: 标准价格
            **kwargs: 其他字段

        Returns:
            Material 实例（未持久化）
        """
        return Material(
            item_code=item_code,
            name=kwargs.get("name", f"无VAVE物料-{item_code}"),
            std_price=Decimal(str(std_price)),
            vave_price=None,
            supplier_tier=kwargs.get("supplier_tier", "B"),
            category=kwargs.get("category", "测试"),
            material=kwargs.get("material", "测试材料"),
            status=kwargs.get("status", "active"),
        )

    @staticmethod
    def create_zero_price(
        item_code: str = "MAT-TEST-ZERO",
        **kwargs,
    ) -> Material:
        """创建零价格物料实例.

        Args:
            item_code: 物料编码
            **kwargs: 其他字段

        Returns:
            Material 实例（未持久化）
        """
        return Material(
            item_code=item_code,
            name=kwargs.get("name", f"零价格物料-{item_code}"),
            std_price=Decimal("0.00"),
            vave_price=Decimal("0.00"),
            supplier_tier=kwargs.get("supplier_tier", "C"),
            category=kwargs.get("category", "测试"),
            material=kwargs.get("material", "未知"),
            status=kwargs.get("status", "active"),
        )

    @staticmethod
    def create_high_savings(
        item_code: str = "MAT-HIGH-SAVE",
        std_price: float = 100.0,
        savings_rate: float = 0.30,
        **kwargs,
    ) -> Material:
        """创建高节省率物料（>20%，需要高亮）.

        Args:
            item_code: 物料编码
            std_price: 标准价格
            savings_rate: 节省率（默认 30%）
            **kwargs: 其他字段

        Returns:
            Material 实例（未持久化）
        """
        vave_price = std_price * (1 - savings_rate)
        return Material(
            item_code=item_code,
            name=kwargs.get("name", f"高节省物料-{item_code}"),
            std_price=Decimal(str(std_price)),
            vave_price=Decimal(str(vave_price)),
            supplier_tier=kwargs.get("supplier_tier", "A"),
            category=kwargs.get("category", "测试"),
            material=kwargs.get("material", "测试材料"),
            status=kwargs.get("status", "active"),
        )


class ProcessRateFactory:
    """工艺费率测试数据工厂."""

    @staticmethod
    def create_dual_rate(
        process_code: str = "PROC-TEST",
        process_name: str | None = None,
        std_rate: float = 260.0,
        vave_rate: float = 237.0,
        efficiency: float = 1.0,
        **kwargs,
    ) -> ProcessRate:
        """创建带双轨费率的工序实例.

        Args:
            process_code: 工序编码
            process_name: 工序名称
            std_rate: 标准工时费率
            vave_rate: VAVE 工时费率
            efficiency: 效率系数
            **kwargs: 其他字段

        Returns:
            ProcessRate 实例（未持久化）
        """
        return ProcessRate(
            process_code=process_code,
            process_name=process_name or f"测试工序-{process_code}",
            std_mhr=Decimal(str(std_rate)),
            vave_mhr=Decimal(str(vave_rate)),
            std_hourly_rate=Decimal(str(std_rate)),
            vave_hourly_rate=Decimal(str(vave_rate)),
            efficiency_factor=Decimal(str(efficiency)),
            work_center=kwargs.get("work_center", "测试车间"),
            equipment=kwargs.get("equipment"),
        )

    @staticmethod
    def create_without_vave(
        process_code: str = "PROC-TEST-NO-VAVE",
        std_rate: float = 200.0,
        **kwargs,
    ) -> ProcessRate:
        """创建无 VAVE 费率的工序实例.

        Args:
            process_code: 工序编码
            std_rate: 标准工时费率
            **kwargs: 其他字段

        Returns:
            ProcessRate 实例（未持久化）
        """
        return ProcessRate(
            process_code=process_code,
            process_name=kwargs.get("process_name", f"无VAVE工序-{process_code}"),
            std_mhr=Decimal(str(std_rate)),
            vave_mhr=None,
            std_hourly_rate=Decimal(str(std_rate)),
            vave_hourly_rate=None,
            efficiency_factor=Decimal(str(kwargs.get("efficiency", 1.0))),
            work_center=kwargs.get("work_center", "测试车间"),
        )

    @staticmethod
    def create_with_efficiency(
        process_code: str = "PROC-TEST-EFF",
        std_rate: float = 260.0,
        vave_rate: float = 237.0,
        efficiency: float = 0.95,
        **kwargs,
    ) -> ProcessRate:
        """创建带效率系数的工序实例.

        Args:
            process_code: 工序编码
            std_rate: 标准工时费率
            vave_rate: VAVE 工时费率
            efficiency: 效率系数（<1 表示 VAVE 更高效）
            **kwargs: 其他字段

        Returns:
            ProcessRate 实例（未持久化）
        """
        return ProcessRate(
            process_code=process_code,
            process_name=kwargs.get("process_name", f"高效工序-{process_code}"),
            std_mhr=Decimal(str(std_rate)),
            vave_mhr=Decimal(str(vave_rate)),
            std_hourly_rate=Decimal(str(std_rate)),
            vave_hourly_rate=Decimal(str(vave_rate)),
            efficiency_factor=Decimal(str(efficiency)),
            work_center=kwargs.get("work_center", "测试车间"),
        )


class ProjectFactory:
    """项目测试数据工厂."""

    @staticmethod
    def create_minimal(
        project_id: str = "PRJ-TEST-001",
        **kwargs,
    ) -> Project:
        """创建最小字段项目实例.

        Args:
            project_id: 项目 ID
            **kwargs: 其他字段

        Returns:
            Project 实例（未持久化）
        """
        return Project(
            id=project_id,
            asac_number=kwargs.get("asac_number", "AS-TEST-001"),
            customer_number=kwargs.get("customer_number", "TEST-001"),
            product_version=kwargs.get("product_version", "V1.0"),
            customer_version=kwargs.get("customer_version", "C1.0"),
            client_name=kwargs.get("client_name", "测试客户"),
            project_name=kwargs.get("project_name", "测试项目"),
            annual_volume=int(kwargs.get("annual_volume", "10000")),
            description=kwargs.get("description", "测试描述"),
            products=kwargs.get("products", []),
            owners=kwargs.get(
                "owners",
                {
                    "sales": "测试销售",
                    "vm": "测试经理",
                    "ie": "测试工艺",
                    "controlling": "测试财务",
                },
            ),
            status=kwargs.get("status", ProjectStatus.DRAFT),
            target_margin=kwargs.get("target_margin"),
        )

    @staticmethod
    def create_with_products(
        project_id: str = "PRJ-TEST-002",
        products_count: int = 2,
        **kwargs,
    ) -> Project:
        """创建带产品的项目实例.

        Args:
            project_id: 项目 ID
            products_count: 产品数量
            **kwargs: 其他字段

        Returns:
            Project 实例（未持久化）
        """
        products = [
            {
                "id": f"P-{i:03d}",
                "name": f"测试产品{i}",
                "partNumber": f"PART-{i:03d}",
                "annualVolume": 10000,
                "description": f"测试产品{i}描述",
            }
            for i in range(1, products_count + 1)
        ]

        return ProjectFactory.create_minimal(
            project_id=project_id,
            products=products,
            **kwargs,
        )


class PricingScenarios:
    """标准测试场景数据集."""

    # 场景 1: 标准双轨价格（节省 15%）
    STANDARD_15_PCT = {
        "std": 100.0,
        "vave": 85.0,
        "savings": 15.0,
        "savings_rate": 0.15,
    }

    # 场景 2: 高节省率（> 20%，需要高亮）
    HIGH_SAVINGS = {
        "std": 100.0,
        "vave": 70.0,
        "savings": 30.0,
        "savings_rate": 0.30,
    }

    # 场景 3: 无 VAVE 价格
    NO_VAVE = {
        "std": 100.0,
        "vave": 100.0,
        "savings": 0.0,
        "savings_rate": 0.0,
    }

    # 场景 4: 零价格
    ZERO_PRICE = {
        "std": 0.0,
        "vave": 0.0,
        "savings": 0.0,
        "savings_rate": 0.0,
    }

    # 场景 5: 极端节省率（50%）
    EXTREME_SAVINGS = {
        "std": 100.0,
        "vave": 50.0,
        "savings": 50.0,
        "savings_rate": 0.50,
    }
