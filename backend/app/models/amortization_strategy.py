# backend/app/models/amortization_strategy.py
"""分摊策略模型."""
from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal
from enum import Enum

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class AmortizationMode(str, Enum):
    """分摊模式枚举."""

    UPFRONT = "UPFRONT"  # 一次性支付
    AMORTIZED = "AMORTIZED"  # 分摊进单价


class AmortizationStrategy(Base):
    """NRE 分摊策略表.

    设计规范: docs/DATABASE_DESIGN.md §3.4
    """

    __tablename__ = "amortization_strategies"

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
    # 分摊模式
    mode: Mapped[str] = mapped_column(String(20), nullable=False)  # UPFRONT/AMORTIZED
    # 分摊基数销量
    amortization_volume: Mapped[int | None] = mapped_column(Integer)
    # 分摊年限
    duration_years: Mapped[int] = mapped_column(Integer, default=2)
    # 年利率
    interest_rate: Mapped[Decimal | None] = mapped_column(Numeric(5, 4), default=Decimal("0.06"))
    # 单件分摊额（计算结果）
    calculated_unit_add: Mapped[Decimal | None] = mapped_column(Numeric(10, 4))
    # 时间戳
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    def __repr__(self) -> str:
        return f"<AmortizationStrategy(id={self.id}, mode={self.mode}, volume={self.amortization_volume})>"
