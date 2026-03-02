# backend/app/models/production_line.py
from datetime import datetime

from sqlalchemy import DateTime, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class ProductionLine(Base):
    """产线主数据表.

    设计规范: docs/数据库设计.md §3.3
    """

    __tablename__ = "production_lines"

    id: Mapped[str] = mapped_column(String(20), primary_key=True)
    factory_id: Mapped[str | None] = mapped_column(String(20), nullable=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    net_production_hours: Mapped[float | None] = mapped_column(Numeric(8, 2))
    efficiency_rate: Mapped[float | None] = mapped_column(Numeric(5, 4))
    plan_fx_rate: Mapped[float | None] = mapped_column(Numeric(10, 6))
    avg_wages_per_hour: Mapped[float | None] = mapped_column(Numeric(10, 2))
    useful_life_years: Mapped[int] = mapped_column(Integer, default=8)
    rent_unit_price: Mapped[float | None] = mapped_column(Numeric(10, 4))
    energy_unit_price: Mapped[float | None] = mapped_column(Numeric(8, 4))
    interest_rate: Mapped[float | None] = mapped_column(Numeric(5, 4))
    status: Mapped[str] = mapped_column(String(20), default="TEMPORARY")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # 反向关系：一条产线可以关联多个工序费率
    process_rates: Mapped[list["ProcessRate"]] = relationship(
        "ProcessRate", back_populates="production_line"
    )
