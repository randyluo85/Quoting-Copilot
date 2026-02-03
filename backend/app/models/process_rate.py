from sqlalchemy import String, Numeric, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from app.db.session import Base


class ProcessRate(Base):
    """工艺费率表 - 带双费率"""
    __tablename__ = "process_rates"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    process_name: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    work_center: Mapped[str | None] = mapped_column(String(100))

    # 标准费率
    std_mhr: Mapped[float | None] = mapped_column(Numeric(10, 2))
    std_labor: Mapped[float | None] = mapped_column(Numeric(10, 2))

    # VAVE 费率
    vave_mhr: Mapped[float | None] = mapped_column(Numeric(10, 2))
    vave_labor: Mapped[float | None] = mapped_column(Numeric(10, 2))

    efficiency_factor: Mapped[float] = mapped_column(Numeric(4, 2), default=1.0)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
