from decimal import Decimal
from sqlalchemy import String, Numeric, DateTime, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from app.db.session import Base


class ProcessRate(Base):
    """工艺费率表 - 双轨计价

    MHR (Machine Hour Rate) = 综合工时费率，包含机时设备费 + 人工费

    从 v1.3 开始，MHR 拆分为变动费率(var)和固定费率(fix)两部分：
    - MHR = MHR_var + MHR_fix

    设计规范: docs/DATABASE_DESIGN.md
    """

    __tablename__ = "process_rates"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    # 工序编码（规范要求作为唯一标识）
    process_code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    # 工序名称（不再作为唯一约束）
    process_name: Mapped[str] = mapped_column(String(100), nullable=False)
    equipment: Mapped[str | None] = mapped_column(String(100))  # 规范命名

    # ========== v1.3 新增：成本中心关联 ==========
    cost_center_id: Mapped[str | None] = mapped_column(
        String(20), ForeignKey("cost_centers.id"), nullable=True
    )
    cost_center: Mapped["CostCenter"] = relationship(
        "CostCenter", back_populates="process_rates"
    )

    # ========== v1.3 新增：MHR 拆分字段 ==========
    # 标准费率拆分
    std_mhr_var: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)  # 变动费率
    std_mhr_fix: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)  # 固定费率

    # VAVE 费率拆分
    vave_mhr_var: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)  # 变动费率
    vave_mhr_fix: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)  # 固定费率

    # ========== 向后兼容：保留原有字段作为计算属性 ==========
    # 注意：std_mhr 和 vave_mhr 不再是数据库列，而是 @property 计算属性

    # 效率系数（用于调整工时）
    efficiency_factor: Mapped[float] = mapped_column(Numeric(4, 2), default=1.0)

    # 新增字段
    remarks: Mapped[str | None] = mapped_column(Text)  # 备注

    # 兼容原有字段（保留但不推荐使用）
    work_center: Mapped[str | None] = mapped_column(String(100))
    std_hourly_rate: Mapped[float | None] = mapped_column(Numeric(10, 2))
    vave_hourly_rate: Mapped[float | None] = mapped_column(Numeric(10, 2))

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

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

    # ========== 向后兼容属性 ==========
    # 为了向后兼容，保留 std_mhr 和 vave_mhr 作为总 MHR 的别名
    # 这些属性映射到 *_total 属性

    @property
    def std_mhr(self) -> Decimal | None:
        """标准总 MHR (向后兼容)."""
        return self.std_mhr_total

    @property
    def vave_mhr(self) -> Decimal | None:
        """VAVE 总 MHR (向后兼容)."""
        return self.vave_mhr_total
