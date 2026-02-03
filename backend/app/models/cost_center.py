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
