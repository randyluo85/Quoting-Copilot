# backend/app/models/investment_item.py
"""NRE 投资项模型."""
from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal
from enum import Enum

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class InvestmentType(str, Enum):
    """投资类型枚举."""

    MOLD = "MOLD"  # 模具
    GAUGE = "GAUGE"  # 检具
    JIG = "JIG"  # 夹具
    FIXTURE = "FIXTURE"  # 工装


class InvestmentItem(Base):
    """NRE 投资项明细表.

    设计规范: docs/DATABASE_DESIGN.md §3.4
    """

    __tablename__ = "investment_items"

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
    # 关联产品（可选）
    product_id: Mapped[str | None] = mapped_column(
        String(36),
        ForeignKey("project_products.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    # 投资类型
    item_type: Mapped[str] = mapped_column(String(20), nullable=False)  # MOLD/GAUGE/JIG/FIXTURE
    # 名称
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    # 单位估算成本
    unit_cost_est: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))
    # 币种
    currency: Mapped[str] = mapped_column(String(10), default="CNY")
    # 数量
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    # 资产设计寿命（模次）
    asset_lifecycle: Mapped[int | None] = mapped_column(Integer)
    # 是否共享资产
    is_shared: Mapped[bool] = mapped_column(Boolean, default=False)
    # 共享源 ID（引用其他项目的共享资产）
    shared_source_id: Mapped[str | None] = mapped_column(String(36))
    # 状态
    status: Mapped[str] = mapped_column(String(20), default="DRAFT")  # DRAFT/CONFIRMED
    # 时间戳
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    def __repr__(self) -> str:
        return f"<InvestmentItem(id={self.id}, type={self.item_type}, name={self.name})>"
