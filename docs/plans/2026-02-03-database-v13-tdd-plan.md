# Dr.aiVOSS 数据库 v1.3 TDD 实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**目标:** 实施 DATABASE_DESIGN.md v1.3 的破坏性变更，包括 5 张新表、MHR 费率拆分、扩展字段，以及配套的 API 和前端界面。

**架构:** 采用 TDD（测试驱动开发）方式，每个功能模块遵循"写测试 → 运行失败 → 最小实现 → 测试通过 → 提交"的红-绿-重构循环。

**技术栈:**
- 后端: Python 3.10+, FastAPI, SQLAlchemy (async), Pytest, pytest-asyncio
- 前端: Vite 6, React 18, TypeScript, ShadcnUI
- 数据库: MySQL 8.0+

---

## 📋 任务总览

| Sprint | 任务范围 | 预计时间 |
|--------|----------|----------|
| **Sprint 0** | 数据库迁移 + MHR 拆分 | Week 1-2 |
| **Sprint 1** | NRE 投资模块 + API | Week 3-4 |
| **Sprint 2** | Business Case 计算 + API | Week 5-6 |

---

## Sprint 0: 数据库 v1.3 迁移与 MHR 拆分

### Task 1: CostCenter 模型与测试

**文件:**
- Create: `backend/app/models/cost_center.py`
- Modify: `backend/app/models/__init__.py`
- Test: `backend/app/tests/test_models/test_cost_center.py`

**Step 1: 写失败测试**

```python
# backend/app/tests/test_models/test_cost_center.py
import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.cost_center import CostCenter


@pytest.mark.asyncio
class TestCostCenterModel:
    """CostCenter 模型测试."""

    async def test_create_cost_center(self, clean_db: AsyncSession):
        """测试创建成本中心."""
        center = CostCenter(
            id="CC001",
            name="铸造车间",
            net_production_hours=4000.00,
            efficiency_rate=0.85,
            plan_fx_rate=7.83,
            avg_wages_per_hour=45.00,
            useful_life_years=8,
            status="ACTIVE"
        )
        clean_db.add(center)
        await clean_db.commit()
        await clean_db.refresh(center)

        assert center.id == "CC001"
        assert center.name == "铸造车间"
        assert center.efficiency_rate == 0.85

    async def test_cost_center_unique_id(self, clean_db: AsyncSession):
        """测试 ID 唯一约束."""
        center1 = CostCenter(
            id="CC002", name="车间1", net_production_hours=4000,
            efficiency_rate=0.85, status="ACTIVE"
        )
        center2 = CostCenter(
            id="CC002", name="车间2", net_production_hours=4000,
            efficiency_rate=0.85, status="ACTIVE"
        )
        clean_db.add(center1)
        clean_db.add(center2)

        with pytest.raises(Exception):  # IntegrityError expected
            await clean_db.commit()

    async def test_cost_center_default_values(self, clean_db: AsyncSession):
        """测试默认值."""
        center = CostCenter(
            id="CC003", name="焊接车间", net_production_hours=3000
        )
        clean_db.add(center)
        await clean_db.commit()
        await clean_db.refresh(center)

        assert center.useful_life_years == 8
        assert center.status == "ACTIVE"
```

**Step 2: 运行测试确认失败**

```bash
pytest backend/app/tests/test_models/test_cost_center.py -v
```
Expected: `ImportError: cannot import name 'CostCenter'`

**Step 3: 最小实现**

```python
# backend/app/models/cost_center.py
from sqlalchemy import String, Numeric, Integer, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from app.db.session import Base


class CostCenter(Base):
    """成本中心主数据表.

    设计规范: docs/DATABASE_DESIGN.md §3.3
    """

    __tablename__ = "cost_centers"

    id: Mapped[str] = mapped_column(String(20), primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    net_production_hours: Mapped[float | None] = mapped_column(Numeric(8, 2))
    efficiency_rate: Mapped[float | None] = mapped_column(Numeric(5, 4))
    plan_fx_rate: Mapped[float | None] = mapped_column(Numeric(10, 6))
    avg_wages_per_hour: Mapped[float | None] = mapped_column(Numeric(10, 2))
    useful_life_years: Mapped[int] = mapped_column(Integer, default=8)
    status: Mapped[str] = mapped_column(String(20), default="ACTIVE")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )
```

更新 `backend/app/models/__init__.py`:
```python
from app.models.cost_center import CostCenter

__all__ = [
    # ... existing ...
    "CostCenter",
]
```

**Step 4: 运行测试确认通过**

```bash
pytest backend/app/tests/test_models/test_cost_center.py -v
```
Expected: 3 passed

**Step 5: 提交**

```bash
git add backend/app/models/cost_center.py backend/app/models/__init__.py backend/app/tests/test_models/test_cost_center.py
git commit -m "feat: add CostCenter model with tests"
```

---

### Task 2: ProcessRate MHR 拆分迁移

**文件:**
- Modify: `backend/app/models/process_rate.py`
- Test: `backend/app/tests/test_models/test_process_rate_migration.py`

**Step 1: 写失败测试**

```python
# backend/app/tests/test_models/test_process_rate_migration.py
import pytest
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.process_rate import ProcessRate


@pytest.mark.asyncio
class TestProcessRateMHRSplit:
    """ProcessRate MHR 拆分测试."""

    async def test_mhr_var_and_fix_fields_exist(self, clean_db: AsyncSession):
        """测试新字段存在."""
        rate = ProcessRate(
            process_code="PROC-001",
            process_name="测试工序",
            cost_center_id="CC001",
            std_mhr_var=Decimal("100.00"),
            std_mhr_fix=Decimal("50.00"),
            vave_mhr_var=Decimal("90.00"),
            vave_mhr_fix=Decimal("45.00"),
        )
        clean_db.add(rate)
        await clean_db.commit()
        await clean_db.refresh(rate)

        assert rate.std_mhr_var == Decimal("100.00")
        assert rate.std_mhr_fix == Decimal("50.00")
        assert rate.vave_mhr_var == Decimal("90.00")
        assert rate.vave_mhr_fix == Decimal("45.00")

    async def test_cost_center_fk_constraint(self, clean_db: AsyncSession):
        """测试成本中心外键约束."""
        # 首先创建成本中心
        from app.models.cost_center import CostCenter
        center = CostCenter(id="CC001", name="测试车间", net_production_hours=4000)
        clean_db.add(center)
        await clean_db.commit()

        # 然后创建关联的工序费率
        rate = ProcessRate(
            process_code="PROC-002",
            process_name="测试工序2",
            cost_center_id="CC001",
        )
        clean_db.add(rate)
        await clean_db.commit()
        await clean_db.refresh(rate)

        assert rate.cost_center_id == "CC001"

    async def test_total_mhr_property(self, clean_db: AsyncSession):
        """测试总 MHR 计算属性."""
        rate = ProcessRate(
            process_code="PROC-003",
            process_name="测试工序3",
            std_mhr_var=Decimal("100.00"),
            std_mhr_fix=Decimal("50.00"),
            vave_mhr_var=Decimal("90.00"),
            vave_mhr_fix=Decimal("45.00"),
        )
        clean_db.add(rate)
        await clean_db.commit()

        # std_total = var + fix = 150
        # vave_total = var + fix = 135
        assert rate.std_mhr_total == Decimal("150.00")
        assert rate.vave_mhr_total == Decimal("135.00")

    async def test_backward_compatibility_std_mhr(self, clean_db: AsyncSession):
        """测试向后兼容: 读取 std_mhr 返回总和."""
        rate = ProcessRate(
            process_code="PROC-004",
            process_name="测试工序4",
            std_mhr_var=Decimal("80.00"),
            std_mhr_fix=Decimal("40.00"),
        )
        clean_db.add(rate)
        await clean_db.commit()

        # std_mhr (legacy) 应该返回 var + fix
        assert rate.std_mhr == Decimal("120.00")

    async def test_backward_compatibility_vave_mhr(self, clean_db: AsyncSession):
        """测试向后兼容: 读取 vave_mhr 返回总和."""
        rate = ProcessRate(
            process_code="PROC-005",
            process_name="测试工序5",
            vave_mhr_var=Decimal("70.00"),
            vave_mhr_fix=Decimal("35.00"),
        )
        clean_db.add(rate)
        await clean_db.commit()

        # vave_mhr (legacy) 应该返回 var + fix
        assert rate.vave_mhr == Decimal("105.00")
```

**Step 2: 运行测试确认失败**

```bash
pytest backend/app/tests/test_models/test_process_rate_migration.py -v
```
Expected: `AttributeError: 'ProcessRate' object has no attribute 'std_mhr_var'`

**Step 3: 最小实现**

```python
# backend/app/models/process_rate.py (修改)
from sqlalchemy import String, Numeric, Integer, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from app.db.session import Base


class ProcessRate(Base):
    """工艺费率表 - 双轨计价 (v1.3 MHR 拆分版).

    MHR (Machine Hour Rate) = MHR_VAR (变动费率) + MHR_FIX (固定费率)

    设计规范: docs/DATABASE_DESIGN.md §3.1
    """

    __tablename__ = "process_rates"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    process_code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    process_name: Mapped[str] = mapped_column(String(100), nullable=False)
    equipment: Mapped[str | None] = mapped_column(String(100))

    # 🔴 v1.3 新增: 成本中心外键
    cost_center_id: Mapped[str | None] = mapped_column(
        String(20), ForeignKey("cost_centers.id"), nullable=True
    )

    # 🔴 v1.3 新增: MHR 拆分为变动/固定费率
    std_mhr_var: Mapped[float | None] = mapped_column(Numeric(10, 2))  # 标准变动费率
    std_mhr_fix: Mapped[float | None] = mapped_column(Numeric(10, 2))  # 标准固定费率
    vave_mhr_var: Mapped[float | None] = mapped_column(Numeric(10, 2))  # VAVE 变动费率
    vave_mhr_fix: Mapped[float | None] = mapped_column(Numeric(10, 2))  # VAVE 固定费率

    efficiency_factor: Mapped[float] = mapped_column(Numeric(4, 2), default=1.0)
    remarks: Mapped[str | None] = mapped_column(String(255))

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # ==================== 向后兼容属性 ====================
    @property
    def std_mhr_total(self) -> Decimal:
        """标准总费率 = var + fix."""
        var = Decimal(str(self.std_mhr_var)) if self.std_mhr_var else Decimal("0")
        fix = Decimal(str(self.std_mhr_fix)) if self.std_mhr_fix else Decimal("0")
        return (var + fix).quantize(Decimal("0.01"))

    @property
    def vave_mhr_total(self) -> Decimal:
        """VAVE 总费率 = var + fix."""
        var = Decimal(str(self.vave_mhr_var)) if self.vave_mhr_var else Decimal("0")
        fix = Decimal(str(self.vave_mhr_fix)) if self.vave_mhr_fix else Decimal("0")
        return (var + fix).quantize(Decimal("0.01"))

    # 保留原属性名，指向计算属性（向后兼容）
    @property
    def std_mhr(self) -> Decimal:
        """标准总费率（向后兼容）."""
        return self.std_mhr_total

    @property
    def vave_mhr(self) -> Decimal:
        """VAVE 总费率（向后兼容）."""
        return self.vave_mhr_total

    # ==================== 保留兼容字段（废弃）====================
    # 以下字段保留以兼容现有代码，标记为 deprecated
    work_center: Mapped[str | None] = mapped_column(String(100))
    std_hourly_rate: Mapped[float | None] = mapped_column(Numeric(10, 2))
    vave_hourly_rate: Mapped[float | None] = mapped_column(Numeric(10, 2))
```

**Step 4: 运行测试确认通过**

```bash
pytest backend/app/tests/test_models/test_process_rate_migration.py -v
```
Expected: 5 passed

**Step 5: 提交**

```bash
git add backend/app/models/process_rate.py backend/app/tests/test_models/test_process_rate_migration.py
git commit -m "feat: split MHR into var/fix components with backward compatibility"
```

---

### Task 3: ProductProcess 扩展字段

**文件:**
- Modify: `backend/app/models/product_process.py`
- Test: `backend/app/tests/test_models/test_product_process_extension.py`

**Step 1: 写失败测试**

```python
# backend/app/tests/test_models/test_product_process_extension.py
import pytest
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.product_process import ProductProcess


@pytest.mark.asyncio
class TestProductProcessExtension:
    """ProductProcess 扩展字段测试."""

    async def test_cycle_time_std_and_vave(self, clean_db: AsyncSession):
        """测试标准工时和 VAVE 工时."""
        # 需要先创建 project_product
        from app.models.project_product import ProjectProduct
        from app.models.project import Project, ProjectStatus
        import uuid

        project = Project(
            id=str(uuid.uuid4()),
            project_name="测试项目",
            project_code="TEST-001",
            customer_name="测试客户",
            annual_volume=100000,
            status=ProjectStatus.DRAFT
        )
        clean_db.add(project)
        await clean_db.commit()

        product = ProjectProduct(
            id=str(uuid.uuid4()),
            project_id=project.id,
            part_number="PART-001",
            part_name="测试零件"
        )
        clean_db.add(product)
        await clean_db.commit()

        process = ProductProcess(
            project_product_id=product.id,
            process_code="PROC-001",
            sequence_order=1,
            cycle_time_std=120,  # 秒
            cycle_time_vave=108,  # 秒 (优化后)
            personnel_std=Decimal("1.0"),
            personnel_vave=Decimal("0.8"),
        )
        clean_db.add(process)
        await clean_db.commit()
        await clean_db.refresh(process)

        assert process.cycle_time_std == 120
        assert process.cycle_time_vave == 108
        assert process.personnel_std == Decimal("1.0")
        assert process.personnel_vave == Decimal("0.8")

    async def test_extended_cost_calculation(self, clean_db: AsyncSession):
        """测试扩展成本计算公式."""
        # std_cost = (cycle_time_std / 3600) × (std_mhr_var + std_mhr_fix + personnel_std × labor_rate)
        # 假设 labor_rate = 50, std_mhr_var = 100, std_mhr_fix = 50
        # cycle_time_std = 120 秒 = 0.0333 小时
        # std_cost = 0.0333 × (100 + 50 + 1.0 × 50) = 0.0333 × 200 = 6.66

        from app.models.project_product import ProjectProduct
        from app.models.project import Project, ProjectStatus
        import uuid

        project = Project(
            id=str(uuid.uuid4()),
            project_name="测试项目2",
            project_code="TEST-002",
            customer_name="测试客户",
            annual_volume=100000,
            status=ProjectStatus.DRAFT
        )
        clean_db.add(project)
        await clean_db.commit()

        product = ProjectProduct(
            id=str(uuid.uuid4()),
            project_id=project.id,
            part_number="PART-002",
            part_name="测试零件2"
        )
        clean_db.add(product)
        await clean_db.commit()

        process = ProductProcess(
            project_product_id=product.id,
            process_code="PROC-002",
            sequence_order=1,
            cycle_time_std=120,
            std_mhr=Decimal("200.00"),  # 模拟计算后的总费率
        )
        clean_db.add(process)
        await clean_db.commit()

        # cost = (120 / 3600) × 200 = 6.6667
        expected_cost = Decimal("6.67")
        assert process.std_cost == expected_cost
```

**Step 2: 运行测试确认失败**

```bash
pytest backend/app/tests/test_models/test_product_process_extension.py -v
```
Expected: `AttributeError: 'ProductProcess' object has no attribute 'cycle_time_std'`

**Step 3: 最小实现**

```python
# backend/app/models/product_process.py (修改)
"""产品工艺路线表模型 (v1.3 扩展版)."""
import uuid
from decimal import Decimal
from sqlalchemy import String, ForeignKey, Numeric, Integer, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from app.db.session import Base


class ProductProcess(Base):
    """产品工艺路线表 (v1.3 扩展版).

    设计规范: docs/DATABASE_DESIGN.md §3.2
    """

    __tablename__ = "product_processes"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    project_product_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("project_products.id", ondelete="CASCADE"), nullable=False, index=True
    )
    process_code: Mapped[str] = mapped_column(
        String(50), ForeignKey("process_rates.process_code", ondelete="RESTRICT"), nullable=False
    )
    sequence_order: Mapped[int] = mapped_column(Integer, nullable=False)

    # 🔴 v1.3 新增: 拆分工时
    cycle_time_std: Mapped[int | None] = mapped_column(Integer)  # 标准工时（秒）
    cycle_time_vave: Mapped[int | None] = mapped_column(Integer)  # VAVE 工时（秒）

    # 🔴 v1.3 新增: 人工配置
    personnel_std: Mapped[float | None] = mapped_column(Numeric(4, 2), default=1.0)  # 标准人工配置（人/机）
    personnel_vave: Mapped[float | None] = mapped_column(Numeric(4, 2))  # VAVE 人工配置

    # MHR 快照（保留兼容）
    std_mhr: Mapped[float | None] = mapped_column(Numeric(10, 2))
    vave_mhr: Mapped[float | None] = mapped_column(Numeric(10, 2))

    # 双轨成本
    std_cost: Mapped[float | None] = mapped_column(Numeric(12, 4))
    vave_cost: Mapped[float | None] = mapped_column(Numeric(12, 4))

    remarks: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    def __repr__(self) -> str:
        return f"<ProductProcess(id={self.id}, process_code={self.process_code}, sequence={self.sequence_order})>"
```

**Step 4: 运行测试确认通过**

```bash
pytest backend/app/tests/test_models/test_product_process_extension.py -v
```
Expected: 2 passed

**Step 5: 提交**

```bash
git add backend/app/models/product_process.py backend/app/tests/test_models/test_product_process_extension.py
git commit -m "feat: add cycle_time and personnel fields to ProductProcess"
```

---

### Task 4: QuoteSummary 扩展字段

**文件:**
- Modify: `backend/app/models/quote_summary.py`
- Test: `backend/app/tests/test_models/test_quote_summary_extension.py`

**Step 1: 写失败测试**

```python
# backend/app/tests/test_models/test_quote_summary_extension.py
import pytest
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.quote_summary import QuoteSummary


@pytest.mark.asyncio
class TestQuoteSummaryExtension:
    """QuoteSummary 扩展字段测试."""

    async def test_hk_3_and_sk_cost_fields(self, clean_db: AsyncSession):
        """测试 HK III 和 SK 成本字段."""
        import uuid

        summary = QuoteSummary(
            id=str(uuid.uuid4()),
            project_id=str(uuid.uuid4()),
            total_std_cost=Decimal("1000.00"),
            total_vave_cost=Decimal("850.00"),
            total_savings=Decimal("150.00"),
            savings_rate=15.0,
            # 🔴 v1.3 新增字段
            hk_3_cost=Decimal("900.00"),
            sk_cost=Decimal("950.00"),
            db_1=Decimal("100.00"),
            db_4=Decimal("50.00"),
        )
        clean_db.add(summary)
        await clean_db.commit()
        await clean_db.refresh(summary)

        assert summary.hk_3_cost == Decimal("900.00")
        assert summary.sk_cost == Decimal("950.00")
        assert summary.db_1 == Decimal("100.00")
        assert summary.db_4 == Decimal("50.00")

    async def test_db_margin_calculation(self, clean_db: AsyncSession):
        """测试边际贡献计算."""
        import uuid

        summary = QuoteSummary(
            id=str(uuid.uuid4()),
            project_id=str(uuid.uuid4()),
            total_std_cost=Decimal("1000.00"),
            quoted_price=Decimal("1200.00"),
            hk_3_cost=Decimal("900.00"),
            sk_cost=Decimal("950.00"),
        )
        clean_db.add(summary)
        await clean_db.commit()
        await clean_db.refresh(summary)

        # DB I = Sales - HK III
        # DB IV = Sales - SK
        # 这里只验证字段存储，计算逻辑在 service 层
        assert summary.hk_3_cost == Decimal("900.00")
        assert summary.sk_cost == Decimal("950.00")
```

**Step 2: 运行测试确认失败**

```bash
pytest backend/app/tests/test_models/test_quote_summary_extension.py -v
```
Expected: `TypeError: __init__() got an unexpected keyword argument 'hk_3_cost'`

**Step 3: 最小实现**

```python
# backend/app/models/quote_summary.py (修改)
"""报价汇总表模型 (v1.3 扩展版)."""
import uuid
from decimal import Decimal
from sqlalchemy import String, ForeignKey, Numeric, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from app.db.session import Base


class QuoteSummary(Base):
    """报价汇总表 (v1.3 扩展版).

    设计规范: docs/DATABASE_DESIGN.md §3.2
    """

    __tablename__ = "quote_summaries"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    project_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, unique=True, index=True
    )
    total_std_cost: Mapped[float | None] = mapped_column(Numeric(14, 4))
    total_vave_cost: Mapped[float | None] = mapped_column(Numeric(14, 4))
    total_savings: Mapped[float | None] = mapped_column(Numeric(14, 4))
    savings_rate: Mapped[float | None] = mapped_column(Numeric(5, 2))
    quoted_price: Mapped[float | None] = mapped_column(Numeric(14, 4))
    actual_margin: Mapped[float | None] = mapped_column(Numeric(5, 2))

    # 🔴 v1.3 新增: Business Case 相关字段
    hk_3_cost: Mapped[float | None] = mapped_column(Numeric(14, 4))  # HK III 制造成本
    sk_cost: Mapped[float | None] = mapped_column(Numeric(14, 4))    # SK 完全成本
    db_1: Mapped[float | None] = mapped_column(Numeric(14, 4))       # DB I 边际贡献 I
    db_4: Mapped[float | None] = mapped_column(Numeric(14, 4))       # DB IV 净利润

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    def __repr__(self) -> str:
        return f"<QuoteSummary(id={self.id}, project_id={self.project_id}, total_std_cost={self.total_std_cost})>"
```

**Step 4: 运行测试确认通过**

```bash
pytest backend/app/tests/test_models/test_quote_summary_extension.py -v
```
Expected: 2 passed

**Step 5: 提交**

```bash
git add backend/app/models/quote_summary.py backend/app/tests/test_models/test_quote_summary_extension.py
git commit -m "feat: add HK/SK/DB fields to QuoteSummary"
```

---

### Task 5: InvestmentItem 模型

**文件:**
- Create: `backend/app/models/investment_item.py`
- Create: `backend/app/schemas/investment.py`
- Modify: `backend/app/models/__init__.py`
- Test: `backend/app/tests/test_models/test_investment_item.py`

**Step 1: 写失败测试**

```python
# backend/app/tests/test_models/test_investment_item.py
import pytest
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.investment_item import InvestmentItem, InvestmentType


@pytest.mark.asyncio
class TestInvestmentItem:
    """InvestmentItem 模型测试."""

    async def test_create_mold_investment(self, clean_db: AsyncSession):
        """测试创建模具投资."""
        import uuid

        item = InvestmentItem(
            id=str(uuid.uuid4()),
            project_id=str(uuid.uuid4()),
            product_id=str(uuid.uuid4()),
            item_type=InvestmentType.MOLD,
            name="Housing 注塑模具",
            unit_cost_est=Decimal("170000.00"),
            currency="CNY",
            quantity=1,
            asset_lifecycle=300000,
            is_shared=False,
            status="DRAFT"
        )
        clean_db.add(item)
        await clean_db.commit()
        await clean_db.refresh(item)

        assert item.item_type == InvestmentType.MOLD
        assert item.unit_cost_est == Decimal("170000.00")
        assert item.asset_lifecycle == 300000

    async def test_investment_type_enum(self, clean_db: AsyncSession):
        """测试投资类型枚举."""
        assert InvestmentType.MOLD == "MOLD"
        assert InvestmentType.GAUGE == "GAUGE"
        assert InvestmentType.JIG == "JIG"
        assert InvestmentType.FIXTURE == "FIXTURE"

    async def test_shared_asset_reference(self, clean_db: AsyncSession):
        """测试共享资产引用."""
        import uuid

        source_id = str(uuid.uuid4())
        item1 = InvestmentItem(
            id=str(uuid.uuid4()),
            project_id=str(uuid.uuid4()),
            product_id=str(uuid.uuid4()),
            item_type=InvestmentType.JIG,
            name="焊接夹具（原始）",
            unit_cost_est=Decimal("5000.00"),
            quantity=2,
            is_shared=True,
        )
        clean_db.add(item1)
        await clean_db.commit()

        item2 = InvestmentItem(
            id=str(uuid.uuid4()),
            project_id=str(uuid.uuid4()),
            product_id=str(uuid.uuid4()),
            item_type=InvestmentType.JIG,
            name="焊接夹具（共享）",
            unit_cost_est=Decimal("0.00"),  # 共享资产不重复计费
            quantity=0,
            is_shared=True,
            shared_source_id=source_id,
        )
        clean_db.add(item2)
        await clean_db.commit()

        assert item2.is_shared is True
        assert item2.shared_source_id == source_id
```

**Step 2: 运行测试确认失败**

```bash
pytest backend/app/tests/test_models/test_investment_item.py -v
```
Expected: `ImportError: cannot import name 'InvestmentItem'`

**Step 3: 最小实现**

```python
# backend/app/models/investment_item.py (新建)
"""NRE 投资项模型."""
import uuid
from enum import Enum
from decimal import Decimal
from sqlalchemy import String, ForeignKey, Numeric, Integer, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from app.db.session import Base


class InvestmentType(str, Enum):
    """投资类型枚举."""
    MOLD = "MOLD"         # 模具
    GAUGE = "GAUGE"       # 检具
    JIG = "JIG"           # 夹具
    FIXTURE = "FIXTURE"   # 工装


class InvestmentItem(Base):
    """NRE 投资项明细表.

    设计规范: docs/DATABASE_DESIGN.md §3.4
    """

    __tablename__ = "investment_items"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    project_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    product_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("project_products.id", ondelete="SET NULL"), nullable=True, index=True
    )
    item_type: Mapped[str] = mapped_column(String(20), nullable=False)  # MOLD/GAUGE/JIG/FIXTURE
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    unit_cost_est: Mapped[float | None] = mapped_column(Numeric(12, 2))
    currency: Mapped[str] = mapped_column(String(10), default="CNY")
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    asset_lifecycle: Mapped[int | None] = mapped_column(Integer)  # 设计寿命（模次）
    is_shared: Mapped[bool] = mapped_column(Boolean, default=False)
    shared_source_id: Mapped[str | None] = mapped_column(String(36))  # 共享源 ID
    status: Mapped[str] = mapped_column(String(20), default="DRAFT")  # DRAFT/CONFIRMED
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    def __repr__(self) -> str:
        return f"<InvestmentItem(id={self.id}, type={self.item_type}, name={self.name})>"
```

```python
# backend/app/schemas/investment.py (新建)
"""NRE 投资相关 Pydantic Schemas."""
from enum import Enum
from typing import Literal
from pydantic import BaseModel, Field
from decimal import Decimal


class InvestmentType(str, Enum):
    """投资类型."""
    MOLD = "MOLD"
    GAUGE = "GAUGE"
    JIG = "JIG"
    FIXTURE = "FIXTURE"


class InvestmentItemCreate(BaseModel):
    """创建投资项."""
    project_id: str
    product_id: str
    item_type: InvestmentType
    name: str
    unit_cost_est: Decimal
    currency: str = "CNY"
    quantity: int = 1
    asset_lifecycle: int | None = None
    is_shared: bool = False
    shared_source_id: str | None = None


class InvestmentItemResponse(BaseModel):
    """投资项响应."""
    id: str
    project_id: str
    product_id: str | None
    item_type: str
    name: str
    unit_cost_est: Decimal | None
    currency: str
    quantity: int
    asset_lifecycle: int | None
    is_shared: bool
    shared_source_id: str | None
    status: str

    class Config:
        from_attributes = True


class AmortizationMode(str, Enum):
    """分摊模式."""
    UPFRONT = "UPFRONT"
    AMORTIZED = "AMORTIZED"


class AmortizationStrategyCreate(BaseModel):
    """创建分摊策略."""
    project_id: str
    mode: AmortizationMode
    amortization_volume: int | None = None
    duration_years: int = 2
    interest_rate: Decimal = Field(default=Decimal("0.06"))


class AmortizationStrategyResponse(BaseModel):
    """分摊策略响应."""
    id: str
    project_id: str
    mode: str
    amortization_volume: int | None
    duration_years: int
    interest_rate: Decimal
    calculated_unit_add: Decimal | None

    class Config:
        from_attributes = True
```

更新 `backend/app/models/__init__.py`:
```python
from app.models.investment_item import InvestmentItem, InvestmentType

__all__ = [
    # ... existing ...
    "InvestmentItem",
    "InvestmentType",
]
```

**Step 4: 运行测试确认通过**

```bash
pytest backend/app/tests/test_models/test_investment_item.py -v
```
Expected: 3 passed

**Step 5: 提交**

```bash
git add backend/app/models/investment_item.py backend/app/schemas/investment.py backend/app/models/__init__.py backend/app/tests/test_models/test_investment_item.py
git commit -m "feat: add InvestmentItem model and schemas"
```

---

### Task 6: AmortizationStrategy 模型

**文件:**
- Create: `backend/app/models/amortization_strategy.py`
- Modify: `backend/app/models/__init__.py`
- Test: `backend/app/tests/test_models/test_amortization_strategy.py`

**Step 1: 写失败测试**

```python
# backend/app/tests/test_models/test_amortization_strategy.py
import pytest
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.amortization_strategy import AmortizationStrategy, AmortizationMode


@pytest.mark.asyncio
class TestAmortizationStrategy:
    """AmortizationStrategy 模型测试."""

    async def test_create_amortized_strategy(self, clean_db: AsyncSession):
        """测试创建分摊策略."""
        import uuid

        strategy = AmortizationStrategy(
            id=str(uuid.uuid4()),
            project_id=str(uuid.uuid4()),
            mode=AmortizationMode.AMORTIZED,
            amortization_volume=29750,
            duration_years=2,
            interest_rate=Decimal("0.0600"),
            calculated_unit_add=Decimal("6.40"),
        )
        clean_db.add(strategy)
        await clean_db.commit()
        await clean_db.refresh(strategy)

        assert strategy.mode == AmortizationMode.AMORTIZED
        assert strategy.duration_years == 2
        assert strategy.interest_rate == Decimal("0.0600")

    async def test_upfront_mode_zero_amortization(self, clean_db: AsyncSession):
        """测试一次性支付模式不计算分摊."""
        import uuid

        strategy = AmortizationStrategy(
            id=str(uuid.uuid4()),
            project_id=str(uuid.uuid4()),
            mode=AmortizationMode.UPFRONT,
            calculated_unit_add=Decimal("0.00"),  # 一次性支付不分摊
        )
        clean_db.add(strategy)
        await clean_db.commit()

        assert strategy.mode == AmortizationMode.UPFRONT
        assert strategy.calculated_unit_add == Decimal("0.00")

    async def test_project_unique_constraint(self, clean_db: AsyncSession):
        """测试项目唯一约束（一个项目只能有一个分摊策略）."""
        import uuid

        project_id = str(uuid.uuid4())

        strategy1 = AmortizationStrategy(
            id=str(uuid.uuid4()),
            project_id=project_id,
            mode=AmortizationMode.AMORTIZED,
        )
        clean_db.add(strategy1)
        await clean_db.commit()

        strategy2 = AmortizationStrategy(
            id=str(uuid.uuid4()),
            project_id=project_id,  # 同一项目
            mode=AmortizationMode.UPFRONT,
        )
        clean_db.add(strategy2)

        with pytest.raises(Exception):  # IntegrityError expected
            await clean_db.commit()
```

**Step 2: 运行测试确认失败**

```bash
pytest backend/app/tests/test_models/test_amortization_strategy.py -v
```
Expected: `ImportError: cannot import name 'AmortizationStrategy'`

**Step 3: 最小实现**

```python
# backend/app/models/amortization_strategy.py (新建)
"""分摊策略模型."""
import uuid
from enum import Enum
from decimal import Decimal
from sqlalchemy import String, ForeignKey, Numeric, Integer, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from app.db.session import Base


class AmortizationMode(str, Enum):
    """分摊模式枚举."""
    UPFRONT = "UPFRONT"       # 一次性支付
    AMORTIZED = "AMORTIZED"   # 分摊进单价


class AmortizationStrategy(Base):
    """NRE 分摊策略表.

    设计规范: docs/DATABASE_DESIGN.md §3.4
    """

    __tablename__ = "amortization_strategies"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    project_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, unique=True, index=True
    )
    mode: Mapped[str] = mapped_column(String(20), nullable=False)  # UPFRONT/AMORTIZED
    amortization_volume: Mapped[int | None] = mapped_column(Integer)  # 分摊基数销量
    duration_years: Mapped[int] = mapped_column(Integer, default=2)  # 分摊年限
    interest_rate: Mapped[float | None] = mapped_column(Numeric(5, 4), default=0.06)  # 年利率
    calculated_unit_add: Mapped[float | None] = mapped_column(Numeric(10, 4))  # 单件分摊额（计算结果）
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    def __repr__(self) -> str:
        return f"<AmortizationStrategy(id={self.id}, mode={self.mode}, volume={self.amortization_volume})>"
```

更新 `backend/app/models/__init__.py`:
```python
from app.models.amortization_strategy import AmortizationStrategy, AmortizationMode

__all__ = [
    # ... existing ...
    "AmortizationStrategy",
    "AmortizationMode",
]
```

**Step 4: 运行测试确认通过**

```bash
pytest backend/app/tests/test_models/test_amortization_strategy.py -v
```
Expected: 3 passed

**Step 5: 提交**

```bash
git add backend/app/models/amortization_strategy.py backend/app/models/__init__.py backend/app/tests/test_models/test_amortization_strategy.py
git commit -m "feat: add AmortizationStrategy model"
```

---

### Task 7: BusinessCaseParams 和 BusinessCaseYears 模型

**文件:**
- Create: `backend/app/models/business_case.py`
- Create: `backend/app/schemas/business_case.py`
- Modify: `backend/app/models/__init__.py`
- Test: `backend/app/tests/test_models/test_business_case.py`

**Step 1: 写失败测试**

```python
# backend/app/tests/test_models/test_business_case.py
import pytest
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.business_case import BusinessCaseParams, BusinessCaseYears


@pytest.mark.asyncio
class TestBusinessCaseModels:
    """Business Case 模型测试."""

    async def test_create_bc_params(self, clean_db: AsyncSession):
        """测试创建 Business Case 参数."""
        import uuid

        params = BusinessCaseParams(
            id=str(uuid.uuid4()),
            project_id=str(uuid.uuid4()),
            tooling_invest=Decimal("49468.00"),
            rnd_invest=Decimal("48079.00"),
            base_price=Decimal("21.76"),
            exchange_rate=Decimal("7.83"),
            amortization_mode="total_volume_based",
            sa_rate=Decimal("0.0210"),
        )
        clean_db.add(params)
        await clean_db.commit()
        await clean_db.refresh(params)

        assert params.tooling_invest == Decimal("49468.00")
        assert params.sa_rate == Decimal("0.0210")

    async def test_create_bc_years(self, clean_db: AsyncSession):
        """测试创建 Business Case 年度数据."""
        import uuid

        project_id = str(uuid.uuid4())

        year_data = BusinessCaseYears(
            id=str(uuid.uuid4()),
            project_id=project_id,
            year=2026,
            volume=15750,
            reduction_rate=Decimal("0.00"),
            gross_sales=Decimal("342658.00"),
            net_sales=Decimal("342658.00"),
            net_price=Decimal("21.76"),
            hk_3_cost=Decimal("316470.00"),
            recovery_tooling=Decimal("20369.00"),
            recovery_rnd=Decimal("19797.00"),
            overhead_sa=Decimal("7196.00"),
            sk_cost=Decimal("364023.00"),
            db_1=Decimal("26188.00"),
            db_4=Decimal("-21365.00"),
        )
        clean_db.add(year_data)
        await clean_db.commit()
        await clean_db.refresh(year_data)

        assert year_data.year == 2026
        assert year_data.db_4 == Decimal("-21365.00")

    async def test_year_unique_constraint_per_project(self, clean_db: AsyncSession):
        """测试同一项目同年份唯一约束."""
        import uuid

        project_id = str(uuid.uuid4())

        year1 = BusinessCaseYears(
            id=str(uuid.uuid4()),
            project_id=project_id,
            year=2026,
            volume=10000,
        )
        clean_db.add(year1)
        await clean_db.commit()

        year2 = BusinessCaseYears(
            id=str(uuid.uuid4()),
            project_id=project_id,
            year=2026,  # 同一项目同一年份
            volume=15000,
        )
        clean_db.add(year2)

        with pytest.raises(Exception):  # IntegrityError expected
            await clean_db.commit()

    async def test_different_projects_same_year(self, clean_db: AsyncSession):
        """测试不同项目可以有同一年份."""
        import uuid

        year1 = BusinessCaseYears(
            id=str(uuid.uuid4()),
            project_id=str(uuid.uuid4()),
            year=2026,
            volume=10000,
        )
        clean_db.add(year1)

        year2 = BusinessCaseYears(
            id=str(uuid.uuid4()),
            project_id=str(uuid.uuid4()),  # 不同项目
            year=2026,
            volume=15000,
        )
        clean_db.add(year2)

        await clean_db.commit()  # 应该成功
```

**Step 2: 运行测试确认失败**

```bash
pytest backend/app/tests/test_models/test_business_case.py -v
```
Expected: `ImportError: cannot import name 'BusinessCaseParams'`

**Step 3: 最小实现**

```python
# backend/app/models/business_case.py (新建)
"""Business Case 相关模型."""
import uuid
from decimal import Decimal
from sqlalchemy import String, ForeignKey, Numeric, Integer, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from app.db.session import Base


class BusinessCaseParams(Base):
    """Business Case 全局参数表.

    设计规范: docs/DATABASE_DESIGN.md §3.5
    """

    __tablename__ = "business_case_params"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    project_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, unique=True, index=True
    )
    tooling_invest: Mapped[float | None] = mapped_column(Numeric(14, 4))  # 模具投入
    rnd_invest: Mapped[float | None] = mapped_column(Numeric(14, 4))     # 研发投入
    base_price: Mapped[float | None] = mapped_column(Numeric(10, 4))     # 基础单价
    exchange_rate: Mapped[float | None] = mapped_column(Numeric(8, 4))   # 汇率
    amortization_mode: Mapped[str | None] = mapped_column(String(50))    # 摊销模式
    sa_rate: Mapped[float | None] = mapped_column(Numeric(5, 4), default=0.021)  # 管销费用率
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )


class BusinessCaseYears(Base):
    """Business Case 年度数据表.

    设计规范: docs/DATABASE_DESIGN.md §3.5
    """

    __tablename__ = "business_case_years"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    project_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    year: Mapped[int] = mapped_column(Integer, nullable=False)  # 年份
    volume: Mapped[int | None] = mapped_column(Integer)  # 销量
    reduction_rate: Mapped[float | None] = mapped_column(Numeric(5, 4))  # 年降比例
    gross_sales: Mapped[float | None] = mapped_column(Numeric(14, 4))  # 毛销售额
    net_sales: Mapped[float | None] = mapped_column(Numeric(14, 4))    # 净销售额
    net_price: Mapped[float | None] = mapped_column(Numeric(10, 4))    # 净单价
    hk_3_cost: Mapped[float | None] = mapped_column(Numeric(14, 4))    # HK III
    recovery_tooling: Mapped[float | None] = mapped_column(Numeric(14, 4))  # 模具摊销
    recovery_rnd: Mapped[float | None] = mapped_column(Numeric(14, 4))      # 研发摊销
    overhead_sa: Mapped[float | None] = mapped_column(Numeric(14, 4))       # S&A
    sk_cost: Mapped[float | None] = mapped_column(Numeric(14, 4))      # SK
    db_1: Mapped[float | None] = mapped_column(Numeric(14, 4))         # DB I
    db_4: Mapped[float | None] = mapped_column(Numeric(14, 4))         # DB IV
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    def __repr__(self) -> str:
        return f"<BusinessCaseYears(id={self.id}, project_id={self.project_id}, year={self.year})>"
```

```python
# backend/app/schemas/business_case.py (新建)
"""Business Case Pydantic Schemas."""
from pydantic import BaseModel, Field
from decimal import Decimal
from typing import List


class BusinessCaseParamsCreate(BaseModel):
    """创建 BC 参数."""
    project_id: str
    tooling_invest: Decimal
    rnd_invest: Decimal
    base_price: Decimal
    exchange_rate: Decimal
    amortization_mode: str = "total_volume_based"
    sa_rate: Decimal = Field(default=Decimal("0.021"))


class BusinessCaseParamsResponse(BaseModel):
    """BC 参数响应."""
    id: str
    project_id: str
    tooling_invest: Decimal | None
    rnd_invest: Decimal | None
    base_price: Decimal | None
    exchange_rate: Decimal | None
    amortization_mode: str | None
    sa_rate: Decimal | None

    class Config:
        from_attributes = True


class FinancialYearData(BaseModel):
    """单年度财务数据."""
    year: int
    volume: int | None
    reduction_rate: Decimal | None
    gross_sales: Decimal | None
    net_sales: Decimal | None
    net_price: Decimal | None
    hk_3_cost: Decimal | None
    recovery_tooling: Decimal | None
    recovery_rnd: Decimal | None
    overhead_sa: Decimal | None
    sk_cost: Decimal | None
    db_1: Decimal | None
    db_4: Decimal | None


class BusinessCaseResponse(BaseModel):
    """Business Case 完整响应."""
    project_id: str
    params: BusinessCaseParamsResponse
    years: List[FinancialYearData]
    total_lifetime_volume: int | None
    total_db_4: Decimal | None
    break_even_year: int | None
```

更新 `backend/app/models/__init__.py`:
```python
from app.models.business_case import BusinessCaseParams, BusinessCaseYears

__all__ = [
    # ... existing ...
    "BusinessCaseParams",
    "BusinessCaseYears",
]
```

**Step 4: 运行测试确认通过**

```bash
pytest backend/app/tests/test_models/test_business_case.py -v
```
Expected: 4 passed

**Step 5: 提交**

```bash
git add backend/app/models/business_case.py backend/app/schemas/business_case.py backend/app/models/__init__.py backend/app/tests/test_models/test_business_case.py
git commit -m "feat: add BusinessCaseParams and BusinessCaseYears models"
```

---

### Task 8: 数据库迁移脚本

**文件:**
- Create: `backend/app/db/migrations/versions/001_v13_database_migration.py`

**Step 1: 创建 Alembic 迁移文件**

```python
# backend/app/db/migrations/versions/001_v13_database_migration.py
"""数据库 v1.3 迁移脚本

Revision ID: v1.3
Revises: v1.2
Create Date: 2026-02-03

破坏性变更:
- 新增 5 张表
- process_rates 表 MHR 拆分
- product_processes 表扩展
- quote_summaries 表扩展
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers
revision = 'v1.3'
down_revision = 'v1.2'
branch_labels = None
depends_on = None


def upgrade():
    """执行升级."""

    # ============ 新增表 ============

    # 1. cost_centers 表
    op.create_table(
        'cost_centers',
        sa.Column('id', sa.String(20), primary_key=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('net_production_hours', sa.Numeric(8, 2)),
        sa.Column('efficiency_rate', sa.Numeric(5, 4)),
        sa.Column('plan_fx_rate', sa.Numeric(10, 6)),
        sa.Column('avg_wages_per_hour', sa.Numeric(10, 2)),
        sa.Column('useful_life_years', sa.Integer, default=8),
        sa.Column('status', sa.String(20), default='ACTIVE'),
        sa.Column('created_at', sa.DateTime, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime, server_default=sa.text('CURRENT_TIMESTAMP'), onupdate=sa.text('CURRENT_TIMESTAMP')),
    )
    op.create_index('idx_cc_status', 'cost_centers', ['status'])

    # 2. investment_items 表
    op.create_table(
        'investment_items',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('project_id', sa.String(36), sa.ForeignKey('projects.id', ondelete='CASCADE'), nullable=False),
        sa.Column('product_id', sa.String(36), sa.ForeignKey('project_products.id', ondelete='SET NULL')),
        sa.Column('item_type', sa.String(20), nullable=False),  # MOLD/GAUGE/JIG/FIXTURE
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('unit_cost_est', sa.Numeric(12, 2)),
        sa.Column('currency', sa.String(10), default='CNY'),
        sa.Column('quantity', sa.Integer, default=1),
        sa.Column('asset_lifecycle', sa.Integer),
        sa.Column('is_shared', sa.Boolean, default=False),
        sa.Column('shared_source_id', sa.String(36)),
        sa.Column('status', sa.String(20), default='DRAFT'),
        sa.Column('created_at', sa.DateTime, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime, server_default=sa.text('CURRENT_TIMESTAMP'), onupdate=sa.text('CURRENT_TIMESTAMP')),
    )
    op.create_index('idx_inv_project', 'investment_items', ['project_id'])
    op.create_index('idx_inv_product', 'investment_items', ['product_id'])
    op.create_index('idx_inv_type', 'investment_items', ['item_type'])

    # 3. amortization_strategies 表
    op.create_table(
        'amortization_strategies',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('project_id', sa.String(36), sa.ForeignKey('projects.id', ondelete='CASCADE'), nullable=False, unique=True),
        sa.Column('mode', sa.String(20), nullable=False),  # UPFRONT/AMORTIZED
        sa.Column('amortization_volume', sa.Integer),
        sa.Column('duration_years', sa.Integer, default=2),
        sa.Column('interest_rate', sa.Numeric(5, 4), default=0.06),
        sa.Column('calculated_unit_add', sa.Numeric(10, 4)),
        sa.Column('created_at', sa.DateTime, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime, server_default=sa.text('CURRENT_TIMESTAMP'), onupdate=sa.text('CURRENT_TIMESTAMP')),
    )

    # 4. business_case_params 表
    op.create_table(
        'business_case_params',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('project_id', sa.String(36), sa.ForeignKey('projects.id', ondelete='CASCADE'), nullable=False, unique=True),
        sa.Column('tooling_invest', sa.Numeric(14, 4)),
        sa.Column('rnd_invest', sa.Numeric(14, 4)),
        sa.Column('base_price', sa.Numeric(10, 4)),
        sa.Column('exchange_rate', sa.Numeric(8, 4)),
        sa.Column('amortization_mode', sa.String(50)),
        sa.Column('sa_rate', sa.Numeric(5, 4), default=0.021),
        sa.Column('created_at', sa.DateTime, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime, server_default=sa.text('CURRENT_TIMESTAMP'), onupdate=sa.text('CURRENT_TIMESTAMP')),
    )

    # 5. business_case_years 表
    op.create_table(
        'business_case_years',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('project_id', sa.String(36), sa.ForeignKey('projects.id', ondelete='CASCADE'), nullable=False),
        sa.Column('year', sa.Integer, nullable=False),
        sa.Column('volume', sa.Integer),
        sa.Column('reduction_rate', sa.Numeric(5, 4)),
        sa.Column('gross_sales', sa.Numeric(14, 4)),
        sa.Column('net_sales', sa.Numeric(14, 4)),
        sa.Column('net_price', sa.Numeric(10, 4)),
        sa.Column('hk_3_cost', sa.Numeric(14, 4)),
        sa.Column('recovery_tooling', sa.Numeric(14, 4)),
        sa.Column('recovery_rnd', sa.Numeric(14, 4)),
        sa.Column('overhead_sa', sa.Numeric(14, 4)),
        sa.Column('sk_cost', sa.Numeric(14, 4)),
        sa.Column('db_1', sa.Numeric(14, 4)),
        sa.Column('db_4', sa.Numeric(14, 4)),
        sa.Column('created_at', sa.DateTime, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime, server_default=sa.text('CURRENT_TIMESTAMP'), onupdate=sa.text('CURRENT_TIMESTAMP')),
    )
    op.create_index('idx_bcy_project', 'business_case_years', ['project_id'])
    op.create_index('idx_bcy_year', 'business_case_years', ['year'])
    op.create_unique_constraint('uq_project_year', 'business_case_years', ['project_id', 'year'])

    # ============ 修改现有表 ============

    # process_rates 表扩展
    op.add_column('process_rates', sa.Column('cost_center_id', sa.String(20), sa.ForeignKey('cost_centers.id')))
    op.add_column('process_rates', sa.Column('std_mhr_var', sa.Numeric(10, 2)))
    op.add_column('process_rates', sa.Column('std_mhr_fix', sa.Numeric(10, 2)))
    op.add_column('process_rates', sa.Column('vave_mhr_var', sa.Numeric(10, 2)))
    op.add_column('process_rates', sa.Column('vave_mhr_fix', sa.Numeric(10, 2)))

    # product_processes 表扩展
    op.add_column('product_processes', sa.Column('cycle_time_std', sa.Integer))
    op.add_column('product_processes', sa.Column('cycle_time_vave', sa.Integer))
    op.add_column('product_processes', sa.Column('personnel_std', sa.Numeric(4, 2), default=1.0))
    op.add_column('product_processes', sa.Column('personnel_vave', sa.Numeric(4, 2)))

    # quote_summaries 表扩展
    op.add_column('quote_summaries', sa.Column('hk_3_cost', sa.Numeric(14, 4)))
    op.add_column('quote_summaries', sa.Column('sk_cost', sa.Numeric(14, 4)))
    op.add_column('quote_summaries', sa.Column('db_1', sa.Numeric(14, 4)))
    op.add_column('quote_summaries', sa.Column('db_4', sa.Numeric(14, 4)))


def downgrade():
    """执行回滚."""
    # 删除新增的列
    op.drop_column('quote_summaries', 'db_4')
    op.drop_column('quote_summaries', 'db_1')
    op.drop_column('quote_summaries', 'sk_cost')
    op.drop_column('quote_summaries', 'hk_3_cost')

    op.drop_column('product_processes', 'personnel_vave')
    op.drop_column('product_processes', 'personnel_std')
    op.drop_column('product_processes', 'cycle_time_vave')
    op.drop_column('product_processes', 'cycle_time_std')

    op.drop_column('process_rates', 'vave_mhr_fix')
    op.drop_column('process_rates', 'vave_mhr_var')
    op.drop_column('process_rates', 'std_mhr_fix')
    op.drop_column('process_rates', 'std_mhr_var')
    op.drop_column('process_rates', 'cost_center_id')

    # 删除新增的表
    op.drop_table('business_case_years')
    op.drop_table('business_case_params')
    op.drop_table('amortization_strategies')
    op.drop_table('investment_items')
    op.drop_table('cost_centers')
```

**Step 2: 提交**

```bash
git add backend/app/db/migrations/versions/001_v13_database_migration.py
git commit -m "feat: add v1.3 database migration script"
```

---

## Sprint 1: NRE 投资模块 API

### Task 9: 投资项 CRUD API

**文件:**
- Create: `backend/app/api/v1/investments.py`
- Create: `backend/app/services/investment_service.py`
- Test: `backend/app/tests/test_api/test_investments.py`

**Step 1: 写失败测试**

```python
# backend/app/tests/test_api/test_investments.py
import pytest
from decimal import Decimal
from httpx import AsyncClient


@pytest.mark.asyncio
class TestInvestmentAPI:
    """投资项 API 测试."""

    async def test_create_investment_item(self, async_client: AsyncClient):
        """测试创建投资项."""
        import uuid

        response = await async_client.post(
            "/api/v1/investments",
            json={
                "project_id": str(uuid.uuid4()),
                "product_id": str(uuid.uuid4()),
                "item_type": "MOLD",
                "name": "Housing 注塑模具",
                "unit_cost_est": "170000.00",
                "quantity": 1,
                "asset_lifecycle": 300000,
            }
        )

        assert response.status_code == 201
        data = response.json()
        assert data["item_type"] == "MOLD"
        assert data["unit_cost_est"] == "170000.00"

    async def test_list_project_investments(self, async_client: AsyncClient, clean_db):
        """测试获取项目投资列表."""
        # 先创建测试数据
        from app.models.investment_item import InvestmentItem
        import uuid

        project_id = str(uuid.uuid4())
        item = InvestmentItem(
            id=str(uuid.uuid4()),
            project_id=project_id,
            product_id=str(uuid.uuid4()),
            item_type="MOLD",
            name="测试模具",
            unit_cost_est=Decimal("100000.00"),
        )
        clean_db.add(item)
        await clean_db.commit()

        response = await async_client.get(f"/api/v1/investments?project_id={project_id}")

        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 1

    async def test_update_investment_item(self, async_client: AsyncClient):
        """测试更新投资项."""
        from app.models.investment_item import InvestmentItem
        import uuid

        item_id = str(uuid.uuid4())
        project_id = str(uuid.uuid4())

        # 先创建
        item = InvestmentItem(
            id=item_id,
            project_id=project_id,
            product_id=str(uuid.uuid4()),
            item_type="MOLD",
            name="原名称",
            unit_cost_est=Decimal("100000.00"),
        )

        # 这里需要先注入 session
        # ... (简化示例)

        response = await async_client.put(
            f"/api/v1/investments/{item_id}",
            json={"name": "新名称", "unit_cost_est": "150000.00"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "新名称"

    async def test_delete_investment_item(self, async_client: AsyncClient):
        """测试删除投资项."""
        from app.models.investment_item import InvestmentItem
        import uuid

        item_id = str(uuid.uuid4())
        # ... 创建逻辑

        response = await async_client.delete(f"/api/v1/investments/{item_id}")

        assert response.status_code == 204

    async def test_calculate_amortization(self, async_client: AsyncClient):
        """测试计算分摊策略."""
        import uuid

        response = await async_client.post(
            "/api/v1/investments/calculate-amort",
            json={
                "project_id": str(uuid.uuid4()),
                "total_investment": "170000.00",
                "mode": "AMORTIZED",
                "amortization_volume": 29750,
                "duration_years": 2,
                "interest_rate": "0.06",
            }
        )

        assert response.status_code == 200
        data = response.json()
        # 170000 * (1 + 0.06 * 2) / 29750 = 6.40
        assert float(data["unit_amortization"]) == pytest.approx(6.40, rel=0.01)
```

**Step 2: 运行测试确认失败**

```bash
pytest backend/app/tests/test_api/test_investments.py -v
```
Expected: 404 Not Found

**Step 3: 最小实现**

```python
# backend/app/services/investment_service.py (新建)
"""NRE 投资服务."""
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.investment_item import InvestmentItem, InvestmentType
from app.models.amortization_strategy import AmortizationStrategy, AmortizationMode
from app.schemas.investment import (
    InvestmentItemCreate,
    InvestmentItemResponse,
    AmortizationStrategyCreate,
    AmortizationStrategyResponse,
)


class InvestmentService:
    """NRE 投资服务."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_investment(self, data: InvestmentItemCreate) -> InvestmentItemResponse:
        """创建投资项."""
        import uuid

        item = InvestmentItem(
            id=str(uuid.uuid4()),
            **data.model_dump()
        )
        self.db.add(item)
        await self.db.commit()
        await self.db.refresh(item)
        return InvestmentItemResponse.model_validate(item)

    async def list_investments(self, project_id: str) -> list[InvestmentItemResponse]:
        """获取项目投资列表."""
        result = await self.db.execute(
            select(InvestmentItem).where(InvestmentItem.project_id == project_id)
        )
        items = result.scalars().all()
        return [InvestmentItemResponse.model_validate(item) for item in items]

    async def get_investment(self, item_id: str) -> InvestmentItemResponse | None:
        """获取单个投资项."""
        result = await self.db.execute(
            select(InvestmentItem).where(InvestmentItem.id == item_id)
        )
        item = result.scalar_one_or_none()
        return InvestmentItemResponse.model_validate(item) if item else None

    async def update_investment(
        self, item_id: str, data: dict
    ) -> InvestmentItemResponse | None:
        """更新投资项."""
        result = await self.db.execute(
            select(InvestmentItem).where(InvestmentItem.id == item_id)
        )
        item = result.scalar_one_or_none()
        if not item:
            return None

        for key, value in data.items():
            if hasattr(item, key) and value is not None:
                setattr(item, key, value)

        await self.db.commit()
        await self.db.refresh(item)
        return InvestmentItemResponse.model_validate(item)

    async def delete_investment(self, item_id: str) -> bool:
        """删除投资项."""
        result = await self.db.execute(
            select(InvestmentItem).where(InvestmentItem.id == item_id)
        )
        item = result.scalar_one_or_none()
        if not item:
            return False

        await self.db.delete(item)
        await self.db.commit()
        return True

    def calculate_amortization(
        self,
        total_investment: Decimal,
        mode: AmortizationMode,
        amortization_volume: int | None,
        duration_years: int,
        interest_rate: Decimal,
    ) -> Decimal:
        """计算单件分摊额.

        公式: UnitAmort = I × (1 + R × Y) / V

        Args:
            total_investment: 总投资
            mode: 分摊模式
            amortization_volume: 分摊基数销量
            duration_years: 分摊年限
            interest_rate: 年利率

        Returns:
            单件分摊额
        """
        if mode == AmortizationMode.UPFRONT:
            return Decimal("0")

        if not amortization_volume or amortization_volume <= 0:
            return Decimal("0")

        interest_factor = Decimal("1") + interest_rate * duration_years
        return (total_investment * interest_factor / amortization_volume).quantize(Decimal("0.01"))
```

```python
# backend/app/api/v1/investments.py (新建)
"""NRE 投资相关 API."""
from decimal import Decimal
from typing import list
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.services.investment_service import InvestmentService
from app.schemas.investment import (
    InvestmentItemCreate,
    InvestmentItemResponse,
    AmortizationStrategyCreate,
    AmortizationStrategyResponse,
)
from app.models.amortization_strategy import AmortizationMode


router = APIRouter(prefix="/investments", tags=["NRE Investment"])


@router.post("/", response_model=InvestmentItemResponse, status_code=status.HTTP_201_CREATED)
async def create_investment(
    data: InvestmentItemCreate,
    db: AsyncSession = Depends(get_db),
):
    """创建投资项."""
    service = InvestmentService(db)
    return await service.create_investment(data)


@router.get("/", response_model=list[InvestmentItemResponse])
async def list_investments(
    project_id: str,
    db: AsyncSession = Depends(get_db),
):
    """获取项目投资列表."""
    service = InvestmentService(db)
    return await service.list_investments(project_id)


@router.get("/{item_id}", response_model=InvestmentItemResponse)
async def get_investment(
    item_id: str,
    db: AsyncSession = Depends(get_db),
):
    """获取单个投资项."""
    service = InvestmentService(db)
    item = await service.get_investment(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Investment item not found")
    return item


@router.put("/{item_id}", response_model=InvestmentItemResponse)
async def update_investment(
    item_id: str,
    data: dict,
    db: AsyncSession = Depends(get_db),
):
    """更新投资项."""
    service = InvestmentService(db)
    item = await service.update_investment(item_id, data)
    if not item:
        raise HTTPException(status_code=404, detail="Investment item not found")
    return item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_investment(
    item_id: str,
    db: AsyncSession = Depends(get_db),
):
    """删除投资项."""
    service = InvestmentService(db)
    success = await service.delete_investment(item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Investment item not found")


@router.post("/calculate-amort", response_model=dict)
async def calculate_amortization(
    total_investment: Decimal,
    mode: AmortizationMode,
    amortization_volume: int | None,
    duration_years: int = 2,
    interest_rate: Decimal = Decimal("0.06"),
    db: AsyncSession = Depends(get_db),
):
    """计算分摊策略."""
    service = InvestmentService(db)
    unit_amort = service.calculate_amortization(
        total_investment, mode, amortization_volume, duration_years, interest_rate
    )
    return {
        "unit_amortization": str(unit_amort),
        "total_with_interest": str(
            total_investment * (Decimal("1") + interest_rate * duration_years)
        ),
    }
```

更新 `backend/app/api/v1/__init__.py`:
```python
from app.api.v1.investments import router as investments_router

api_router.include_router(investments_router)
```

**Step 4: 运行测试确认通过**

```bash
pytest backend/app/tests/test_api/test_investments.py -v
```
Expected: 5 passed

**Step 5: 提交**

```bash
git add backend/app/api/v1/investments.py backend/app/services/investment_service.py backend/app/tests/test_api/test_investments.py backend/app/api/v1/__init__.py
git commit -m "feat: add NRE investment CRUD API"
```

---

## Sprint 2: Business Case 计算 API

### Task 10: Business Case 计算服务

**文件:**
- Create: `backend/app/services/business_case_service.py`
- Create: `backend/app/api/v1/business_case.py`
- Test: `backend/app/tests/test_services/test_business_case_service.py`

**Step 1: 写失败测试**

```python
# backend/app/tests/test_services/test_business_case_service.py
import pytest
from decimal import Decimal
from app.services.business_case_service import BusinessCaseService


@pytest.mark.asyncio
class TestBusinessCaseCalculation:
    """Business Case 计算测试."""

    async def test_calculate_hk_3(self):
        """测试 HK III 计算."""
        service = BusinessCaseService(None)

        # HK III = Material + Variable Process + Fixed Overhead
        material_cost = Decimal("210.95")
        variable_process = Decimal("100.00")
        fixed_overhead = Decimal("50.00")

        result = service.calculate_hk_3(material_cost, variable_process, fixed_overhead)

        assert result == Decimal("360.95")

    async def test_calculate_sk_with_amortization(self):
        """测试 SK 计算（含摊销）."""
        service = BusinessCaseService(None)

        hk_3 = Decimal("316470.00")
        recovery_tooling = Decimal("20369.00")
        recovery_rnd = Decimal("19797.00")
        net_sales = Decimal("342658.00")
        sa_rate = Decimal("0.021")

        result = service.calculate_sk(
            hk_3, recovery_tooling, recovery_rnd, net_sales, sa_rate
        )

        # SK = HK III + Recovery Tooling + Recovery R&D + S&A
        # S&A = 342658 * 0.021 = 7195.82
        expected = Decimal("316470") + Decimal("20369") + Decimal("19797") + Decimal("7195.82")
        assert result == expected.quantize(Decimal("0.01"))

    async def test_calculate_db_1(self):
        """测试 DB I 计算."""
        service = BusinessCaseService(None)

        net_sales = Decimal("342658.00")
        hk_3 = Decimal("316470.00")

        result = service.calculate_db_1(net_sales, hk_3)

        # DB I = Net Sales - HK III
        assert result == Decimal("26188.00")

    async def test_calculate_db_4(self):
        """测试 DB IV 计算."""
        service = BusinessCaseService(None)

        net_sales = Decimal("342658.00")
        sk = Decimal("364023.00")

        result = service.calculate_db_4(net_sales, sk)

        # DB IV = Net Sales - SK
        assert result == Decimal("-21365.00")

    async def test_calculate_net_price_with_reduction(self):
        """测试年降后单价."""
        service = BusinessCaseService(None)

        base_price = Decimal("21.76")
        reduction_rate = Decimal("0.03")  # 3%
        year = 2027  # 第二年

        result = service.calculate_net_price(base_price, reduction_rate, year)

        # 如果是累计年降: 21.76 * (1 - 0.03) = 21.1072
        assert result == pytest.approx(Decimal("21.11"), rel=0.01)

    async def test_full_business_case_calculation(self):
        """测试完整 Business Case 计算."""
        # ... 更复杂的端到端测试
        pass
```

**Step 2: 运行测试确认失败**

```bash
pytest backend/app/tests/test_services/test_business_case_service.py -v
```
Expected: `ImportError: cannot import name 'BusinessCaseService'`

**Step 3: 最小实现**

```python
# backend/app/services/business_case_service.py (新建)
"""Business Case 计算服务."""
from decimal import Decimal
from typing import list
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.business_case import BusinessCaseParams, BusinessCaseYears
from app.schemas.business_case import (
    BusinessCaseParamsCreate,
    BusinessCaseResponse,
    FinancialYearData,
)


class BusinessCaseService:
    """Business Case 计算服务."""

    def __init__(self, db: AsyncSession):
        self.db = db

    # ==================== 核心计算方法 ====================

    @staticmethod
    def calculate_hk_3(
        material_cost: Decimal,
        variable_process: Decimal,
        fixed_overhead: Decimal,
    ) -> Decimal:
        """计算 HK III（制造成本）.

        公式: HK III = Material Cost + Variable Process + Fixed Overhead

        Args:
            material_cost: 物料成本
            variable_process: 变动工艺成本
            fixed_overhead: 固定制造费用

        Returns:
            HK III 成本
        """
        return (material_cost + variable_process + fixed_overhead).quantize(Decimal("0.01"))

    @staticmethod
    def calculate_sk(
        hk_3: Decimal,
        recovery_tooling: Decimal,
        recovery_rnd: Decimal,
        net_sales: Decimal,
        sa_rate: Decimal,
    ) -> Decimal:
        """计算 SK（完全成本）.

        公式: SK = HK III + Tooling Recovery + R&D Recovery + S&A

        Args:
            hk_3: HK III 成本
            recovery_tooling: 模具摊销
            recovery_rnd: 研发摊销
            net_sales: 净销售额
            sa_rate: 管销费用率

        Returns:
            SK 成本
        """
        sa_cost = (net_sales * sa_rate).quantize(Decimal("0.01"))
        return (hk_3 + recovery_tooling + recovery_rnd + sa_cost).quantize(Decimal("0.01"))

    @staticmethod
    def calculate_db_1(net_sales: Decimal, hk_3: Decimal) -> Decimal:
        """计算 DB I（边际贡献 I）.

        公式: DB I = Net Sales - HK III

        Args:
            net_sales: 净销售额
            hk_3: HK III 成本

        Returns:
            DB I
        """
        return (net_sales - hk_3).quantize(Decimal("0.01"))

    @staticmethod
    def calculate_db_4(net_sales: Decimal, sk: Decimal) -> Decimal:
        """计算 DB IV（净利润）.

        公式: DB IV = Net Sales - SK

        Args:
            net_sales: 净销售额
            sk: SK 成本

        Returns:
            DB IV
        """
        return (net_sales - sk).quantize(Decimal("0.01"))

    @staticmethod
    def calculate_net_price(
        base_price: Decimal,
        reduction_rate: Decimal,
        year: int,
        start_year: int = 2026,
    ) -> Decimal:
        """计算年降后单价.

        公式: NetPrice = BasePrice × (1 - Σ ReductionRate)

        Args:
            base_price: 基础单价
            reduction_rate: 年降比例
            year: 当前年份
            start_year: 起始年份

        Returns:
            年降后单价
        """
        years_passed = year - start_year
        if years_passed <= 0:
            return base_price

        # 假设年降是基于基价累计
        total_reduction = reduction_rate * years_passed
        net_price = base_price * (Decimal("1") - total_reduction)

        # 确保不为负
        return max(net_price, Decimal("0")).quantize(Decimal("0.01"))

    @staticmethod
    def calculate_gross_sales(volume: int, base_price: Decimal) -> Decimal:
        """计算毛销售额."""
        return (Decimal(volume) * base_price).quantize(Decimal("0.01"))

    @staticmethod
    def calculate_net_sales(volume: int, net_price: Decimal) -> Decimal:
        """计算净销售额."""
        return (Decimal(volume) * net_price).quantize(Decimal("0.01"))

    # ==================== 完整计算流程 ====================

    async def calculate_business_case(
        self,
        project_id: str,
        params: BusinessCaseParamsCreate,
        years_data: list[dict],
    ) -> BusinessCaseResponse:
        """计算完整 Business Case.

        Args:
            project_id: 项目 ID
            params: BC 全局参数
            years_data: 年度数据列表

        Returns:
            完整 Business Case 响应
        """
        import uuid

        # 保存参数
        bc_params = BusinessCaseParams(
            id=str(uuid.uuid4()),
            project_id=project_id,
            **params.model_dump()
        )
        self.db.add(bc_params)

        # 计算每年的数据
        calculated_years = []
        total_db_4 = Decimal("0")
        total_volume = 0

        for year_data in years_data:
            year = year_data["year"]
            volume = year_data["volume"]
            total_volume += volume

            # 计算价格和销售额
            net_price = self.calculate_net_price(
                params.base_price,
                Decimal(str(year_data.get("reduction_rate", 0))),
                year,
            )
            gross_sales = self.calculate_gross_sales(volume, params.base_price)
            net_sales = self.calculate_net_sales(volume, net_price)

            # 这里 HK III 和 SK 需要从 BOM 计算获取
            # 暂时使用简化计算
            hk_3 = Decimal(str(year_data.get("hk_3_cost", 0)))
            recovery_tooling = Decimal(str(year_data.get("recovery_tooling", 0)))
            recovery_rnd = Decimal(str(year_data.get("recovery_rnd", 0)))

            sk = self.calculate_sk(
                hk_3, recovery_tooling, recovery_rnd, net_sales, params.sa_rate
            )

            db_1 = self.calculate_db_1(net_sales, hk_3)
            db_4 = self.calculate_db_4(net_sales, sk)

            total_db_4 += db_4

            # 保存年度数据
            bc_year = BusinessCaseYears(
                id=str(uuid.uuid4()),
                project_id=project_id,
                year=year,
                volume=volume,
                reduction_rate=Decimal(str(year_data.get("reduction_rate", 0))),
                gross_sales=gross_sales,
                net_sales=net_sales,
                net_price=net_price,
                hk_3_cost=hk_3,
                recovery_tooling=recovery_tooling,
                recovery_rnd=recovery_rnd,
                overhead_sa=(net_sales * params.sa_rate).quantize(Decimal("0.01")),
                sk_cost=sk,
                db_1=db_1,
                db_4=db_4,
            )
            self.db.add(bc_year)

            calculated_years.append(FinancialYearData(
                year=year,
                volume=volume,
                reduction_rate=Decimal(str(year_data.get("reduction_rate", 0))),
                gross_sales=gross_sales,
                net_sales=net_sales,
                net_price=net_price,
                hk_3_cost=hk_3,
                recovery_tooling=recovery_tooling,
                recovery_rnd=recovery_rnd,
                overhead_sa=(net_sales * params.sa_rate).quantize(Decimal("0.01")),
                sk_cost=sk,
                db_1=db_1,
                db_4=db_4,
            ))

        await self.db.commit()

        # 计算盈亏平衡年份
        break_even_year = self._find_break_even_year(calculated_years)

        return BusinessCaseResponse(
            project_id=project_id,
            params=FinancialYearData.model_validate(bc_params),
            years=calculated_years,
            total_lifetime_volume=total_volume,
            total_db_4=total_db_4.quantize(Decimal("0.01")),
            break_even_year=break_even_year,
        )

    @staticmethod
    def _find_break_even_year(years: list[FinancialYearData]) -> int | None:
        """找出盈亏平衡年份."""
        cumulative = Decimal("0")
        for year_data in years:
            if year_data.db_4:
                cumulative += year_data.db_4
                if cumulative > 0:
                    return year_data.year
        return None
```

**Step 4: 运行测试确认通过**

```bash
pytest backend/app/tests/test_services/test_business_case_service.py -v
```
Expected: 6 passed

**Step 5: 提交**

```bash
git add backend/app/services/business_case_service.py backend/app/tests/test_services/test_business_case_service.py
git commit -m "feat: add Business Case calculation service"
```

---

### Task 11: Business Case API

**文件:**
- Create: `backend/app/api/v1/business_case.py`
- Test: `backend/app/tests/test_api/test_business_case.py`

**Step 1: 写失败测试**

```python
# backend/app/tests/test_api/test_business_case.py
import pytest
from decimal import Decimal
from httpx import AsyncClient


@pytest.mark.asyncio
class TestBusinessCaseAPI:
    """Business Case API 测试."""

    async def test_create_business_case_params(self, async_client: AsyncClient):
        """测试创建 BC 参数."""
        import uuid

        response = await async_client.post(
            "/api/v1/business-case/params",
            json={
                "project_id": str(uuid.uuid4()),
                "tooling_invest": "49468.00",
                "rnd_invest": "48079.00",
                "base_price": "21.76",
                "exchange_rate": "7.83",
                "amortization_mode": "total_volume_based",
                "sa_rate": "0.021",
            }
        )

        assert response.status_code == 201
        data = response.json()
        assert data["tooling_invest"] == "49468.00"

    async def test_calculate_business_case(self, async_client: AsyncClient):
        """测试计算完整 Business Case."""
        import uuid

        project_id = str(uuid.uuid4())

        # 首先创建参数
        await async_client.post(
            "/api/v1/business-case/params",
            json={
                "project_id": project_id,
                "tooling_invest": "49468.00",
                "rnd_invest": "48079.00",
                "base_price": "21.76",
                "exchange_rate": "7.83",
                "sa_rate": "0.021",
            }
        )

        # 然后计算
        response = await async_client.post(
            "/api/v1/business-case/calculate",
            json={
                "project_id": project_id,
                "years": [
                    {
                        "year": 2026,
                        "volume": 15750,
                        "reduction_rate": "0.00",
                        "hk_3_cost": "316470.00",
                    },
                    {
                        "year": 2027,
                        "volume": 18900,
                        "reduction_rate": "0.03",
                        "hk_3_cost": "367924.00",
                    },
                ],
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert "years" in data
        assert len(data["years"]) == 2

    async def test_get_business_case(self, async_client: AsyncClient):
        """测试获取 Business Case."""
        import uuid

        project_id = str(uuid.uuid4())

        # 先创建
        # ... (创建逻辑)

        response = await async_client.get(f"/api/v1/business-case/{project_id}")

        assert response.status_code == 200
        data = response.json()
        assert "params" in data
```

**Step 2: 运行测试确认失败**

```bash
pytest backend/app/tests/test_api/test_business_case.py -v
```
Expected: 404 Not Found

**Step 3: 最小实现**

```python
# backend/app/api/v1/business_case.py (新建)
"""Business Case API."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.services.business_case_service import BusinessCaseService
from app.schemas.business_case import (
    BusinessCaseParamsCreate,
    BusinessCaseParamsResponse,
    BusinessCaseResponse,
)


router = APIRouter(prefix="/business-case", tags=["Business Case"])


@router.post("/params", response_model=BusinessCaseParamsResponse, status_code=status.HTTP_201_CREATED)
async def create_bc_params(
    data: BusinessCaseParamsCreate,
    db: AsyncSession = Depends(get_db),
):
    """创建 Business Case 参数."""
    import uuid

    from app.models.business_case import BusinessCaseParams

    params = BusinessCaseParams(
        id=str(uuid.uuid4()),
        **data.model_dump()
    )
    db.add(params)
    await db.commit()
    await db.refresh(params)

    return BusinessCaseParamsResponse.model_validate(params)


@router.get("/params/{project_id}", response_model=BusinessCaseParamsResponse)
async def get_bc_params(
    project_id: str,
    db: AsyncSession = Depends(get_db),
):
    """获取 Business Case 参数."""
    from sqlalchemy import select
    from app.models.business_case import BusinessCaseParams

    result = await db.execute(
        select(BusinessCaseParams).where(BusinessCaseParams.project_id == project_id)
    )
    params = result.scalar_one_or_none()

    if not params:
        raise HTTPException(status_code=404, detail="Business Case params not found")

    return BusinessCaseParamsResponse.model_validate(params)


@router.post("/calculate", response_model=BusinessCaseResponse)
async def calculate_business_case(
    project_id: str,
    years: list[dict],
    db: AsyncSession = Depends(get_db),
):
    """计算完整 Business Case."""
    # 获取参数
    from sqlalchemy import select
    from app.models.business_case import BusinessCaseParams

    result = await db.execute(
        select(BusinessCaseParams).where(BusinessCaseParams.project_id == project_id)
    )
    params = result.scalar_one_or_none()

    if not params:
        raise HTTPException(status_code=404, detail="Business Case params not found")

    service = BusinessCaseService(db)

    params_create = BusinessCaseParamsCreate.model_validate(params)

    return await service.calculate_business_case(project_id, params_create, years)


@router.get("/{project_id}", response_model=BusinessCaseResponse)
async def get_business_case(
    project_id: str,
    db: AsyncSession = Depends(get_db),
):
    """获取完整 Business Case."""
    from sqlalchemy import select
    from app.models.business_case import BusinessCaseParams, BusinessCaseYears

    # 获取参数
    params_result = await db.execute(
        select(BusinessCaseParams).where(BusinessCaseParams.project_id == project_id)
    )
    params = params_result.scalar_one_or_none()

    if not params:
        raise HTTPException(status_code=404, detail="Business Case not found")

    # 获取年度数据
    years_result = await db.execute(
        select(BusinessCaseYears)
        .where(BusinessCaseYears.project_id == project_id)
        .order_by(BusinessCaseYears.year)
    )
    years = years_result.scalars().all()

    return BusinessCaseResponse(
        project_id=project_id,
        params=BusinessCaseParamsResponse.model_validate(params),
        years=[FinancialYearData.model_validate(y) for y in years],
        total_lifetime_volume=sum(y.volume or 0 for y in years),
        total_db_4=sum(y.db_4 or 0 for y in years),
        break_even_year=None,  # 需要计算
    )
```

更新 `backend/app/api/v1/__init__.py`:
```python
from app.api.v1.business_case import router as business_case_router

api_router.include_router(business_case_router)
```

**Step 4: 运行测试确认通过**

```bash
pytest backend/app/tests/test_api/test_business_case.py -v
```
Expected: 3 passed

**Step 5: 提交**

```bash
git add backend/app/api/v1/business_case.py backend/app/tests/test_api/test_business_case.py backend/app/api/v1/__init__.py
git commit -m "feat: add Business Case API endpoints"
```

---

## Sprint 2: 前端界面开发

### Task 12: 投资管理前端组件

**文件:**
- Create: `frontend/src/components/InvestmentManagement.tsx`
- Create: `frontend/src/lib/api-investments.ts`
- Test: `frontend/src/e2e/specs/investment.spec.ts`

**Step 1: 写测试规范（使用 Vitest）**

```typescript
// frontend/src/components/__tests__/InvestmentManagement.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { InvestmentManagement } from '../InvestmentManagement'

describe('InvestmentManagement', () => {
  it('renders investment list', async () => {
    render(<InvestmentManagement projectId="test-project" />)

    await waitFor(() => {
      expect(screen.getByText('投资项管理')).toBeInTheDocument()
    })
  })

  it('opens create dialog on button click', async () => {
    render(<InvestmentManagement projectId="test-project" />)

    const createButton = screen.getByText('添加投资项')
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(screen.getByText('投资类型')).toBeInTheDocument()
    })
  })

  it('displays investment types correctly', () => {
    const { getByText } = render(<InvestmentManagement projectId="test-project" />)

    expect(getByText('模具')).toBeInTheDocument()
    expect(getByText('检具')).toBeInTheDocument()
    expect(getByText('夹具')).toBeInTheDocument()
    expect(getByText('工装')).toBeInTheDocument()
  })
})
```

**Step 2: 运行测试确认失败**

```bash
npm test InvestmentManagement.test.tsx
```
Expected: `Cannot find module './InvestmentManagement'`

**Step 3: 最小实现**

```typescript
// frontend/src/lib/api-investments.ts (新建)
import { apiClient } from './api'

export interface InvestmentItem {
  id: string
  project_id: string
  product_id: string | null
  item_type: 'MOLD' | 'GAUGE' | 'JIG' | 'FIXTURE'
  name: string
  unit_cost_est: string | null
  currency: string
  quantity: number
  asset_lifecycle: number | null
  is_shared: boolean
  shared_source_id: string | null
  status: string
}

export interface InvestmentItemCreate {
  project_id: string
  product_id: string
  item_type: 'MOLD' | 'GAUGE' | 'JIG' | 'FIXTURE'
  name: string
  unit_cost_est: string
  quantity?: number
  asset_lifecycle?: number
  is_shared?: boolean
}

export interface AmortizationStrategy {
  id: string
  project_id: string
  mode: 'UPFRONT' | 'AMORTIZED'
  amortization_volume: number | null
  duration_years: number
  interest_rate: string
  calculated_unit_add: string | null
}

export const investmentsApi = {
  // 获取项目投资列表
  list: (projectId: string) =>
    apiClient.get<InvestmentItem[]>(`/investments?project_id=${projectId}`),

  // 创建投资项
  create: (data: InvestmentItemCreate) =>
    apiClient.post<InvestmentItem>('/investments', data),

  // 更新投资项
  update: (id: string, data: Partial<InvestmentItem>) =>
    apiClient.put<InvestmentItem>(`/investments/${id}`, data),

  // 删除投资项
  delete: (id: string) =>
    apiClient.delete(`/investments/${id}`),

  // 计算分摊
  calculateAmort: (params: {
    project_id: string
    total_investment: string
    mode: 'UPFRONT' | 'AMORTIZED'
    amortization_volume?: number
    duration_years?: number
    interest_rate?: string
  }) => apiClient.post<{ unit_amortization: string; total_with_interest: string }>('/investments/calculate-amort', params),
}
```

```tsx
// frontend/src/components/InvestmentManagement.tsx (新建)
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { investmentsApi, InvestmentItem } from '@/lib/api-investments'
import { Plus, Pencil, Trash2 } from 'lucide-react'

const INVESTMENT_TYPES = [
  { value: 'MOLD', label: '模具' },
  { value: 'GAUGE', label: '检具' },
  { value: 'JIG', label: '夹具' },
  { value: 'FIXTURE', label: '工装' },
] as const

interface InvestmentManagementProps {
  projectId: string
}

export function InvestmentManagement({ projectId }: InvestmentManagementProps) {
  const [investments, setInvestments] = useState<InvestmentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    loadInvestments()
  }, [projectId])

  const loadInvestments = async () => {
    setLoading(true)
    try {
      const response = await investmentsApi.list(projectId)
      setInvestments(response.data)
    } catch (error) {
      console.error('加载投资项失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeLabel = (type: string) => {
    return INVESTMENT_TYPES.find(t => t.value === type)?.label || type
  }

  const formatCurrency = (amount: string | null) => {
    if (!amount) return '-'
    return `¥${Number(amount).toLocaleString()}`
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>投资项管理</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" />
              添加投资项
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>添加投资项</DialogTitle>
            </DialogHeader>
            <InvestmentForm
              projectId={projectId}
              onSuccess={() => {
                setDialogOpen(false)
                loadInvestments()
              }}
              onCancel={() => setDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">加载中...</div>
        ) : investments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            暂无投资项，点击上方按钮添加
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>类型</TableHead>
                <TableHead>名称</TableHead>
                <TableHead>单价</TableHead>
                <TableHead>数量</TableHead>
                <TableHead>总金额</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {investments.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{getTypeLabel(item.item_type)}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{formatCurrency(item.unit_cost_est)}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>
                    {formatCurrency(
                      String(Number(item.unit_cost_est || 0) * item.quantity)
                    )}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        item.status === 'CONFIRMED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {item.status === 'CONFIRMED' ? '已确认' : '草稿'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

interface InvestmentFormProps {
  projectId: string
  onSuccess: () => void
  onCancel: () => void
}

function InvestmentForm({ projectId, onSuccess, onCancel }: InvestmentFormProps) {
  const [type, setType] = useState<string>('MOLD')
  const [name, setName] = useState('')
  const [unitCost, setUnitCost] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [lifecycle, setLifecycle] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      await investmentsApi.create({
        project_id: projectId,
        product_id: projectId, // 简化，实际应选择产品
        item_type: type as any,
        name,
        unit_cost_est: unitCost,
        quantity: Number(quantity),
        asset_lifecycle: lifecycle ? Number(lifecycle) : undefined,
      })
      onSuccess()
    } catch (error) {
      console.error('创建失败:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="type">投资类型</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger id="type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {INVESTMENT_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="name">名称</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例如：Housing 注塑模具"
          required
        />
      </div>

      <div>
        <Label htmlFor="unitCost">预估单价 (¥)</Label>
        <Input
          id="unitCost"
          type="number"
          step="0.01"
          value={unitCost}
          onChange={(e) => setUnitCost(e.target.value)}
          placeholder="170000.00"
          required
        />
      </div>

      <div>
        <Label htmlFor="quantity">数量</Label>
        <Input
          id="quantity"
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="lifecycle">设计寿命（模次，可选）</Label>
        <Input
          id="lifecycle"
          type="number"
          min="1"
          value={lifecycle}
          onChange={(e) => setLifecycle(e.target.value)}
          placeholder="300000"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? '提交中...' : '确认'}
        </Button>
      </div>
    </form>
  )
}
```

**Step 4: 运行测试确认通过**

```bash
npm test InvestmentManagement.test.tsx
```
Expected: 3 passed

**Step 5: 提交**

```bash
git add frontend/src/components/InvestmentManagement.tsx frontend/src/lib/api-investments.ts frontend/src/components/__tests__/InvestmentManagement.test.tsx
git commit -m "feat: add InvestmentManagement component with tests"
```

---

### Task 13: Business Case 展示组件

**文件:**
- Create: `frontend/src/components/BusinessCaseView.tsx`
- Create: `frontend/src/lib/api-business-case.ts`
- Test: `frontend/src/components/__tests__/BusinessCaseView.test.tsx`

**Step 1: 写测试规范**

```typescript
// frontend/src/components/__tests__/BusinessCaseView.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BusinessCaseView } from '../BusinessCaseView'

describe('BusinessCaseView', () => {
  it('renders business case summary', () => {
    render(<BusinessCaseView projectId="test-project" />)

    expect(screen.getByText('Business Case 分析')).toBeInTheDocument()
  })

  it('displays HK III and SK costs', () => {
    render(<BusinessCaseView projectId="test-project" />)

    expect(screen.getByText('HK III (制造成本)')).toBeInTheDocument()
    expect(screen.getByText('SK (完全成本)')).toBeInTheDocument()
  })

  it('displays DB margins', () => {
    render(<BusinessCaseView projectId="test-project" />)

    expect(screen.getByText('DB I (边际贡献 I)')).toBeInTheDocument()
    expect(screen.getByText('DB IV (净利润)')).toBeInTheDocument()
  })
})
```

**Step 2: 运行测试确认失败**

```bash
npm test BusinessCaseView.test.tsx
```
Expected: `Cannot find module './BusinessCaseView'`

**Step 3: 最小实现**

```typescript
// frontend/src/lib/api-business-case.ts (新建)
import { apiClient } from './api'

export interface BusinessCaseParams {
  id: string
  project_id: string
  tooling_invest: string | null
  rnd_invest: string | null
  base_price: string | null
  exchange_rate: string | null
  amortization_mode: string | null
  sa_rate: string | null
}

export interface FinancialYearData {
  year: number
  volume: number | null
  reduction_rate: string | null
  gross_sales: string | null
  net_sales: string | null
  net_price: string | null
  hk_3_cost: string | null
  recovery_tooling: string | null
  recovery_rnd: string | null
  overhead_sa: string | null
  sk_cost: string | null
  db_1: string | null
  db_4: string | null
}

export interface BusinessCase {
  project_id: string
  params: BusinessCaseParams
  years: FinancialYearData[]
  total_lifetime_volume: number | null
  total_db_4: string | null
  break_even_year: number | null
}

export const businessCaseApi = {
  // 获取 Business Case
  get: (projectId: string) =>
    apiClient.get<BusinessCase>(`/business-case/${projectId}`),

  // 创建/更新参数
  upsertParams: (projectId: string, params: Partial<BusinessCaseParams>) =>
    apiClient.post<BusinessCaseParams>(`/business-case/params`, {
      project_id: projectId,
      ...params,
    }),

  // 计算 Business Case
  calculate: (projectId: string, years: FinancialYearData[]) =>
    apiClient.post<BusinessCase>(`/business-case/calculate`, {
      project_id: projectId,
      years,
    }),
}
```

```tsx
// frontend/src/components/BusinessCaseView.tsx (新建)
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { businessCaseApi, BusinessCase, FinancialYearData } from '@/lib/api-business-case'
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'

interface BusinessCaseViewProps {
  projectId: string
}

export function BusinessCaseView({ projectId }: BusinessCaseViewProps) {
  const [bcData, setBcData] = useState<BusinessCase | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBusinessCase()
  }, [projectId])

  const loadBusinessCase = async () => {
    setLoading(true)
    try {
      const response = await businessCaseApi.get(projectId)
      setBcData(response.data)
    } catch (error) {
      console.error('加载 Business Case 失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: string | null) => {
    if (!amount) return '-'
    return `¥${Number(amount).toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  }

  const formatPercent = (rate: string | null) => {
    if (!rate) return '-'
    return `${(Number(rate) * 100).toFixed(2)}%`
  }

  const getValueColor = (value: string | null) => {
    if (!value) return 'text-muted-foreground'
    const num = Number(value)
    return num >= 0 ? 'text-green-600' : 'text-red-600'
  }

  const getValueIcon = (value: string | null) => {
    if (!value) return null
    const num = Number(value)
    if (num > 0) return <TrendingUp className="h-4 w-4 inline ml-1" />
    if (num < 0) return <TrendingDown className="h-4 w-4 inline ml-1" />
    return null
  }

  if (loading) {
    return <div className="text-center py-8">加载中...</div>
  }

  if (!bcData || !bcData.params) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          请先配置 Business Case 参数
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* 参数摘要 */}
      <Card>
        <CardHeader>
          <CardTitle>Business Case 分析参数</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">模具投入</div>
              <div className="font-semibold">{formatCurrency(bcData.params.tooling_invest)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">研发投入</div>
              <div className="font-semibold">{formatCurrency(bcData.params.rnd_invest)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">基础单价</div>
              <div className="font-semibold">{formatCurrency(bcData.params.base_price)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">管销费用率</div>
              <div className="font-semibold">{formatPercent(bcData.params.sa_rate)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 年度数据表格 */}
      <Card>
        <CardHeader>
          <CardTitle>年度财务分析</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="table">
            <TabsList>
              <TabsTrigger value="table">表格视图</TabsTrigger>
              <TabsTrigger value="summary">摘要</TabsTrigger>
            </TabsList>

            <TabsContent value="table" className="mt-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">年份</th>
                      <th className="text-right p-2">销量</th>
                      <th className="text-right p-2">净销售额</th>
                      <th className="text-right p-2">HK III</th>
                      <th className="text-right p-2">SK</th>
                      <th className="text-right p-2">DB I</th>
                      <th className="text-right p-2">DB IV</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bcData.years.map((year) => (
                      <tr key={year.year} className="border-b">
                        <td className="p-2 font-medium">{year.year}</td>
                        <td className="text-right p-2">{year.volume?.toLocaleString() || '-'}</td>
                        <td className="text-right p-2">{formatCurrency(year.net_sales)}</td>
                        <td className="text-right p-2">{formatCurrency(year.hk_3_cost)}</td>
                        <td className="text-right p-2">{formatCurrency(year.sk_cost)}</td>
                        <td className={`text-right p-2 ${getValueColor(year.db_1)}`}>
                          {formatCurrency(year.db_1)}
                          {getValueIcon(year.db_1)}
                        </td>
                        <td className={`text-right p-2 ${getValueColor(year.db_4)}`}>
                          {formatCurrency(year.db_4)}
                          {getValueIcon(year.db_4)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-muted/50">
                    <tr>
                      <td className="p-2 font-medium" colSpan={4}>合计</td>
                      <td className="text-right p-2" colSpan={2}></td>
                      <td className={`text-right p-2 font-bold ${getValueColor(bcData.total_db_4)}`}>
                        {formatCurrency(bcData.total_db_4)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="summary" className="mt-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">总生命周期销量</div>
                  <div className="text-2xl font-bold">
                    {bcData.total_lifetime_volume?.toLocaleString() || '-'}
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">累计净利润</div>
                  <div className={`text-2xl font-bold ${getValueColor(bcData.total_db_4)}`}>
                    {formatCurrency(bcData.total_db_4)}
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">盈亏平衡年份</div>
                  <div className="text-2xl font-bold">
                    {bcData.break_even_year || '-'}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
```

**Step 4: 运行测试确认通过**

```bash
npm test BusinessCaseView.test.tsx
```
Expected: 3 passed

**Step 5: 提交**

```bash
git add frontend/src/components/BusinessCaseView.tsx frontend/src/lib/api-business-case.ts frontend/src/components/__tests__/BusinessCaseView.test.tsx
git commit -m "feat: add BusinessCaseView component with tests"
```

---

## 🧪 运行所有测试

```bash
# 后端单元测试
pytest backend/app/tests/ -v --cov=backend/app --cov-report=html

# 前端单元测试
npm test

# E2E 测试
npm run test:e2e
```

---

## 📊 验收标准

### 模型层验收
- [ ] 所有新模型包含完整的字段定义和类型注解
- [ ] 所有模型有对应的 Pydantic Schema
- [ ] 所有模型有完整的单元测试
- [ ] 测试覆盖率 > 90%

### API 层验收
- [ ] 所有 API 端点有 OpenAPI 文档
- [ ] 所有 API 端点有集成测试
- [ ] 错误处理完整（400/404/500）
- [ ] 响应时间 < 500ms (p95)

### 前端验收
- [ ] 所有新组件有 TypeScript 类型定义
- [ ] 所有新组件有单元测试
- [ ] UI 符合 ShadcnUI 设计规范
- [ ] 响应式设计适配

---

**文档结束**
