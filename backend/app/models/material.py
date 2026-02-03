from sqlalchemy import String, Numeric, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from app.db.session import Base


class Material(Base):
    """物料主数据表 - 带双价格

    设计规范: docs/DATABASE_DESIGN.md
    """

    __tablename__ = "materials"

    # 主键：物料编码（规范要求用 item_code 作为主键）
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    item_code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)  # 规范: VARCHAR(200)
    spec: Mapped[str | None] = mapped_column(String(255))

    # 新增字段（符合设计规范）
    version: Mapped[str | None] = mapped_column(String(20))  # 版本号
    material_type: Mapped[str | None] = mapped_column(String(20), index=True)  # made/bought
    status: Mapped[str | None] = mapped_column(String(20), default="active", index=True)  # active/inactive
    material: Mapped[str | None] = mapped_column(String(100))  # 材料描述
    supplier: Mapped[str | None] = mapped_column(String(200))  # 供应商
    remarks: Mapped[str | None] = mapped_column(Text)  # 备注

    # 双轨价格
    std_price: Mapped[float | None] = mapped_column(Numeric(10, 4))
    vave_price: Mapped[float | None] = mapped_column(Numeric(10, 4))

    # 原有字段保留（扩展字段）
    supplier_tier: Mapped[str | None] = mapped_column(String(20))
    category: Mapped[str | None] = mapped_column(String(50))

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )
