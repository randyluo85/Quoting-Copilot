"""工艺路线模型

工艺路线模板主数据，支持 IE 工程师创建和维护可复用的工艺路线。

设计规范: docs/DATABASE_DESIGN.md
"""
import uuid
from decimal import Decimal
from datetime import datetime
from typing import TYPE CHECKING

from sqlalchemy import String, Integer, Numeric, DateTime, Text, ForeignKey, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base

if TYPE_CHECKING:
    from app.models.process_rate import ProcessRate


class ProcessRoute(Base):
    """工艺路线主数据表（可复用模板）

    支持版本管理和审批流程：
    - draft: 草稿状态，IE 工程师编辑中
    - pending: 待审批状态
    - active: 生效状态，可被产品引用
    - deprecated: 已废弃
    """

    __tablename__ = "process_routes"

    # 主键：工艺路线编码，如 PR-2024-001
    id: Mapped[str] = mapped_column(
        String(50), primary_key=True, index=True, comment='工艺路线编码'
    )

    # 基本信息
    name: Mapped[str] = mapped_column(
        String(200), nullable=False, comment='工艺路线名称'
    )
    product_id: Mapped[str | None] = mapped_column(
        String(50), index=True, nullable=True, comment='关联产品ID（可选）'
    )

    # 版本和状态
    version: Mapped[int] = mapped_column(
        Integer, default=1, nullable=False, comment='当前版本号'
    )
    status: Mapped[str] = mapped_column(
        Enum('draft', 'pending', 'active', 'deprecated', name='processroutestatus'),
        default='draft',
        nullable=False,
        comment='状态'
    )

    # 审批信息
    created_by: Mapped[str | None] = mapped_column(
        String(50), nullable=True, comment='创建人（IE工程师）'
    )
    approved_by: Mapped[str | None] = mapped_column(
        String(50), nullable=True, comment='审批人'
    )
    approved_at: Mapped[datetime | None] = mapped_column(
        DateTime, nullable=True, comment='审批时间'
    )

    # 备注
    remarks: Mapped[str | None] = mapped_column(
        Text, nullable=True, comment='备注'
    )

    # 审计字段
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, comment='创建时间'
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, comment='更新时间'
    )

    # ========== 关联关系 ==========
    items: Mapped[list["ProcessRouteItem"]] = relationship(
        "ProcessRouteItem",
        back_populates="route",
        cascade="all, delete-orphan",
        order_by="ProcessRouteItem.sequence"
    )

    def __repr__(self) -> str:
        return f"<ProcessRoute(id={self.id}, name={self.name}, status={self.status})>"

    @property
    def item_count(self) -> int:
        """工序数量."""
        return len(self.items) if self.items else 0

    @property
    def is_active(self) -> bool:
        """是否为生效状态."""
        return self.status == "active"

    @property
    def is_editable(self) -> bool:
        """是否可编辑（草稿或被拒绝状态）."""
        return self.status in ("draft", "deprecated")


class ProcessRouteItem(Base):
    """工序明细表

    存储工艺路线中的每一道工序，包含从 process_rates 快照的费率数据。
    """

    __tablename__ = "process_route_items"

    # 主键：UUID
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        comment='UUID'
    )

    # 关联工艺路线
    route_id: Mapped[str] = mapped_column(
        String(50),
        ForeignKey("process_routes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment='关联工艺路线ID'
    )

    # 工序信息
    operation_no: Mapped[str] = mapped_column(
        String(20), nullable=False, comment='工序号，如 OP010'
    )
    process_code: Mapped[str] = mapped_column(
        String(50), nullable=False, index=True, comment='关联 process_rates.process_code'
    )
    sequence: Mapped[int] = mapped_column(
        Integer, default=0, nullable=False, index=True, comment='排序顺序'
    )

    # 工时数据
    cycle_time_std: Mapped[int | None] = mapped_column(
        Integer, nullable=True, comment='标准工时（秒）'
    )
    cycle_time_vave: Mapped[int | None] = mapped_column(
        Integer, nullable=True, comment='VAVE工时（秒）'
    )

    # 人工配置
    personnel_std: Mapped[float] = mapped_column(
        Numeric(4, 2), default=1.0, nullable=False, comment='标准人工配置'
    )
    personnel_vave: Mapped[float | None] = mapped_column(
        Numeric(4, 2), nullable=True, comment='VAVE人工配置'
    )

    # 费率快照（从 process_rates 复制，用于历史追溯）
    std_mhr_var: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2), nullable=True, comment='标准变动费率（快照）'
    )
    std_mhr_fix: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2), nullable=True, comment='标准固定费率（快照）'
    )
    vave_mhr_var: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2), nullable=True, comment='VAVE变动费率（快照）'
    )
    vave_mhr_fix: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2), nullable=True, comment='VAVE固定费率（快照）'
    )

    # 效率系数
    efficiency_factor: Mapped[float] = mapped_column(
        Numeric(4, 2), default=1.0, nullable=False, comment='效率系数'
    )

    # 设备快照
    equipment: Mapped[str | None] = mapped_column(
        String(100), nullable=True, comment='设备（快照）'
    )

    # 备注
    remarks: Mapped[str | None] = mapped_column(
        Text, nullable=True, comment='备注'
    )

    # 审计字段
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, comment='创建时间'
    )

    # ========== 关联关系 ==========
    route: Mapped["ProcessRoute"] = relationship(
        "ProcessRoute", back_populates="items"
    )

    def __repr__(self) -> str:
        return f"<ProcessRouteItem(id={self.id}, operation_no={self.operation_no}, process_code={self.process_code})>"

    # ========== 计算属性 ==========

    @property
    def std_mhr_total(self) -> Decimal | None:
        """标准总 MHR = var + fix."""
        if self.std_mhr_var is None and self.std_mhr_fix is None:
            return None
        var = Decimal(str(self.std_mhr_var)) if self.std_mhr_var is not None else Decimal("0")
        fix = Decimal(str(self.std_mhr_fix)) if self.std_mhr_fix is not None else Decimal("0")
        return var + fix

    @property
    def vave_mhr_total(self) -> Decimal | None:
        """VAVE 总 MHR = var + fix."""
        if self.vave_mhr_var is None and self.vave_mhr_fix is None:
            return None
        var = Decimal(str(self.vave_mhr_var)) if self.vave_mhr_var is not None else Decimal("0")
        fix = Decimal(str(self.vave_mhr_fix)) if self.vave_mhr_fix is not None else Decimal("0")
        return var + fix

    def calculate_std_cost(
        self,
        labor_rate: Decimal | None = None,
        cycle_time_override: int | None = None
    ) -> Decimal:
        """计算标准成本.

        公式: std_cost = (cycle_time_std / 3600) × (std_mhr_var + std_mhr_fix + personnel_std × labor_rate)

        Args:
            labor_rate: 人工时薪（如未提供，则使用 MHR 总值）
            cycle_time_override: 覆盖的工时值（秒）

        Returns:
            标准成本
        """
        cycle_time = Decimal(cycle_time_override or self.cycle_time_std or 0)
        if cycle_time == 0:
            return Decimal("0")

        # 计算小时数
        hours = cycle_time / Decimal("3600")

        # 获取 MHR 总值
        mhr_total = self.std_mhr_total or Decimal("0")

        # 加上人工成本
        if labor_rate is not None:
            personnel_cost = Decimal(str(self.personnel_std)) * labor_rate
            rate = mhr_total + personnel_cost
        else:
            rate = mhr_total

        return hours * rate

    def calculate_vave_cost(
        self,
        labor_rate: Decimal | None = None,
        cycle_time_override: int | None = None
    ) -> Decimal:
        """计算 VAVE 成本.

        公式: vave_cost = (cycle_time_vave / 3600) × (vave_mhr_var + vave_mhr_fix + personnel_vave × labor_rate)

        Args:
            labor_rate: 人工时薪（如未提供，则使用 MHR 总值）
            cycle_time_override: 覆盖的工时值（秒）

        Returns:
            VAVE 成本
        """
        cycle_time = Decimal(cycle_time_override or self.cycle_time_vave or self.cycle_time_std or 0)
        if cycle_time == 0:
            return Decimal("0")

        # 计算 VAVE 小时数
        hours = cycle_time / Decimal("3600")

        # 获取 VAVE MHR 总值
        mhr_total = self.vave_mhr_total or self.std_mhr_total or Decimal("0")

        # 加上人工成本
        personnel = Decimal(str(self.personnel_vave or self.personnel_std))
        if labor_rate is not None:
            personnel_cost = personnel * labor_rate
            rate = mhr_total + personnel_cost
        else:
            rate = mhr_total

        return hours * rate

    @property
    def std_cost(self) -> Decimal:
        """标准成本（计算属性）."""
        return self.calculate_std_cost()

    @property
    def vave_cost(self) -> Decimal:
        """VAVE 成本（计算属性）."""
        return self.calculate_vave_cost()

    @property
    def savings(self) -> Decimal:
        """节省金额 = std_cost - vave_cost."""
        return self.std_cost - self.vave_cost
