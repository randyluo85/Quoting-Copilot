from sqlalchemy import String, Numeric, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from app.db.session import Base


class ProcessRate(Base):
    """工艺费率表 - 双轨计价

    MHR (Machine Hour Rate) = 综合工时费率，包含机时设备费 + 人工费
    """

    __tablename__ = "process_rates"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    process_name: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    work_center: Mapped[str | None] = mapped_column(String(100))

    # 标准工时费率（元/小时）- 包含机时+人工
    std_hourly_rate: Mapped[float | None] = mapped_column(Numeric(10, 2))

    # VAVE 工时费率（元/小时）- 包含机时+人工
    vave_hourly_rate: Mapped[float | None] = mapped_column(Numeric(10, 2))

    # 效率系数（用于调整工时）
    efficiency_factor: Mapped[float] = mapped_column(Numeric(4, 2), default=1.0)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )
