from sqlalchemy import String, Integer, Text, DateTime, JSON, Numeric, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from app.db.session import Base
import enum


class ProjectStatus(str, enum.Enum):
    DRAFT = "draft"
    IN_PROGRESS = "in-progress"
    COMPLETED = "completed"


class Project(Base):
    """项目表

    设计规范: docs/DATABASE_DESIGN.md
    """

    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)  # 规范: CHAR(36) UUID
    asac_number: Mapped[str] = mapped_column(String(50), index=True)
    customer_number: Mapped[str] = mapped_column(String(50))
    product_version: Mapped[str] = mapped_column(String(20))
    customer_version: Mapped[str] = mapped_column(String(20))
    client_name: Mapped[str] = mapped_column(String(200))
    project_name: Mapped[str] = mapped_column(String(200))
    annual_volume: Mapped[int] = mapped_column(Integer)
    description: Mapped[str | None] = mapped_column(Text)

    # 兼容字段（保留用于现有数据）
    products: Mapped[dict] = mapped_column(JSON)
    owners: Mapped[dict] = mapped_column(JSON)

    status: Mapped[ProjectStatus] = mapped_column(
        SQLEnum(ProjectStatus, values_callable=lambda obj: [e.value for e in obj]),
        default=ProjectStatus.DRAFT,
        index=True
    )

    # 新增字段（符合设计规范）
    target_margin: Mapped[float | None] = mapped_column(Numeric(5, 2))  # 目标利润率(%)

    # 新增索引字段
    owner: Mapped[str | None] = mapped_column(String(50))  # 负责人（简化字段）
    remarks: Mapped[str | None] = mapped_column(Text)  # 备注

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )
