"""项目产品关联表模型"""
import uuid
from sqlalchemy import String, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from app.db.session import Base


class ProjectProduct(Base):
    """项目-产品关联表

    一个项目可以包含多个产品，
    每个产品有自己的 BOM 和工艺路线
    """

    __tablename__ = "project_products"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    project_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    product_name: Mapped[str] = mapped_column(String(200), nullable=False)
    product_code: Mapped[str | None] = mapped_column(String(50))
    product_version: Mapped[str | None] = mapped_column(String(20))
    route_code: Mapped[str | None] = mapped_column(String(50), index=True)
    bom_file_path: Mapped[str | None] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    def __repr__(self) -> str:
        return f"<ProjectProduct(id={self.id}, product_name={self.product_name})>"
