"""产品物料关联表模型（BOM行项目）"""
import uuid
from sqlalchemy import String, ForeignKey, Numeric, Integer, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from app.db.session import Base


class ProductMaterial(Base):
    """产品-物料关联表（BOM 行项目）

    存储产品的物料清单明细，包含双轨成本数据
    """

    __tablename__ = "product_materials"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    # 关联产品
    project_product_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("project_products.id", ondelete="CASCADE"), nullable=False, index=True
    )
    # 关联物料主数据（可为空，用于快照数据）
    material_id: Mapped[str | None] = mapped_column(
        String(50), ForeignKey("materials.id", ondelete="SET NULL"), index=True
    )
    # 物料层级（BOM层级）
    material_level: Mapped[int | None] = mapped_column(Integer)
    # 物料快照数据
    material_name: Mapped[str | None] = mapped_column(String(200))
    material_type: Mapped[str | None] = mapped_column(String(20))  # made/bought
    quantity: Mapped[float | None] = mapped_column(Numeric(10, 3))
    unit: Mapped[str | None] = mapped_column(String(10))
    # 双轨成本
    std_cost: Mapped[float | None] = mapped_column(Numeric(12, 4))
    vave_cost: Mapped[float | None] = mapped_column(Numeric(12, 4))
    # AI 匹配信息
    confidence: Mapped[float | None] = mapped_column(Numeric(5, 2))  # 0-100
    ai_suggestion: Mapped[str | None] = mapped_column(Text)
    # 备注（BOM Comments）
    remarks: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    def __repr__(self) -> str:
        return f"<ProductMaterial(id={self.id}, material_name={self.material_name})>"
