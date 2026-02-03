from sqlalchemy import String, Numeric, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from app.db.session import Base


class ProcessRate(Base):
    """工艺费率表 - 双轨计价

    MHR (Machine Hour Rate) = 综合工时费率，包含机时设备费 + 人工费

    设计规范: docs/DATABASE_DESIGN.md
    """

    __tablename__ = "process_rates"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    # 工序编码（规范要求作为唯一标识）
    process_code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    # 工序名称（不再作为唯一约束）
    process_name: Mapped[str] = mapped_column(String(100), nullable=False)
    equipment: Mapped[str | None] = mapped_column(String(100))  # 规范命名

    # 标准工时费率（元/小时）- 包含机时+人工
    std_mhr: Mapped[float | None] = mapped_column(Numeric(10, 2))  # 规范命名: std_mhr

    # VAVE 工时费率（元/小时）- 包含机时+人工
    vave_mhr: Mapped[float | None] = mapped_column(Numeric(10, 2))  # 规范命名: vave_mhr

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
