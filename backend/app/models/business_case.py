# backend/app/models/business_case.py
"""Business Case 相关模型."""
from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class BusinessCaseParams(Base):
    """Business Case 全局参数表.

    设计规范: docs/DATABASE_DESIGN.md §3.5
    """

    __tablename__ = "business_case_params"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    # 关联项目（一对一）
    project_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    # 模具投入
    tooling_invest: Mapped[Decimal | None] = mapped_column(Numeric(14, 4))
    # 研发投入
    rnd_invest: Mapped[Decimal | None] = mapped_column(Numeric(14, 4))
    # 基础单价
    base_price: Mapped[Decimal | None] = mapped_column(Numeric(10, 4))
    # 汇率
    exchange_rate: Mapped[Decimal | None] = mapped_column(Numeric(8, 4))
    # 摊销模式
    amortization_mode: Mapped[str | None] = mapped_column(String(50))
    # 管销费用率（默认 2.1%）
    sa_rate: Mapped[Decimal | None] = mapped_column(Numeric(5, 4), default=Decimal("0.021"))
    # 时间戳
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )


class BusinessCaseYears(Base):
    """Business Case 年度数据表.

    设计规范: docs/DATABASE_DESIGN.md §3.5
    """

    __tablename__ = "business_case_years"
    __table_args__ = (
        UniqueConstraint("project_id", "year", name="uq_business_case_years_project_year"),
    )

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    # 关联项目
    project_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    # 年份
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    # 销量
    volume: Mapped[int | None] = mapped_column(Integer)
    # 年降比例
    reduction_rate: Mapped[Decimal | None] = mapped_column(Numeric(5, 4))
    # 毛销售额
    gross_sales: Mapped[Decimal | None] = mapped_column(Numeric(14, 4))
    # 净销售额
    net_sales: Mapped[Decimal | None] = mapped_column(Numeric(14, 4))
    # 净单价
    net_price: Mapped[Decimal | None] = mapped_column(Numeric(10, 4))
    # HK III 制造成本
    hk_3_cost: Mapped[Decimal | None] = mapped_column(Numeric(14, 4))
    # 模具摊销
    recovery_tooling: Mapped[Decimal | None] = mapped_column(Numeric(14, 4))
    # 研发摊销
    recovery_rnd: Mapped[Decimal | None] = mapped_column(Numeric(14, 4))
    # S&A 管销费用
    overhead_sa: Mapped[Decimal | None] = mapped_column(Numeric(14, 4))
    # SK 完全成本
    sk_cost: Mapped[Decimal | None] = mapped_column(Numeric(14, 4))
    # DB I 边际贡献 I
    db_1: Mapped[Decimal | None] = mapped_column(Numeric(14, 4))
    # DB IV 净利润
    db_4: Mapped[Decimal | None] = mapped_column(Numeric(14, 4))
    # 时间戳
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    def __repr__(self) -> str:
        return f"<BusinessCaseYears(id={self.id}, project_id={self.project_id}, year={self.year})>"
