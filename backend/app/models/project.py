from sqlalchemy import String, Integer, Text, DateTime, JSON, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from app.db.session import Base
import enum


class ProjectStatus(str, enum.Enum):
    DRAFT = "draft"
    IN_PROGRESS = "in-progress"
    COMPLETED = "completed"


class Project(Base):
    """项目表"""

    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    asac_number: Mapped[str] = mapped_column(String(50), index=True)
    customer_number: Mapped[str] = mapped_column(String(50))
    product_version: Mapped[str] = mapped_column(String(20))
    customer_version: Mapped[str] = mapped_column(String(20))
    client_name: Mapped[str] = mapped_column(String(200))
    project_name: Mapped[str] = mapped_column(String(200))
    annual_volume: Mapped[int] = mapped_column(Integer)
    description: Mapped[str | None] = mapped_column(Text)

    products: Mapped[dict] = mapped_column(JSON)
    owners: Mapped[dict] = mapped_column(JSON)

    status: Mapped[ProjectStatus] = mapped_column(
        SQLEnum(ProjectStatus), default=ProjectStatus.DRAFT
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )
