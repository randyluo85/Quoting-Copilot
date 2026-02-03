"""产品工艺路线表模型"""
import uuid
from sqlalchemy import String, ForeignKey, Numeric, Integer, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from app.db.session import Base


class ProductProcess(Base):
    """产品工艺路线表

    存储产品的工艺工序明细，包含双轨成本数据
    """

    __tablename__ = "product_processes"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    # 关联产品
    project_product_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("project_products.id", ondelete="CASCADE"), nullable=False, index=True
    )
    # 关联工序费率主数据
    process_code: Mapped[str] = mapped_column(
        String(50), ForeignKey("process_rates.process_code", ondelete="RESTRICT"), nullable=False
    )
    # 工序顺序
    sequence_order: Mapped[int] = mapped_column(Integer, nullable=False)
    # 工时（秒）- 双轨
    cycle_time_std: Mapped[int | None] = mapped_column(Integer, comment="标准工时（秒）")
    cycle_time_vave: Mapped[int | None] = mapped_column(Integer, comment="VAVE工时（秒）")
    # 人工配置（人/机）- 双轨
    personnel_std: Mapped[float | None] = mapped_column(
        Numeric(4, 2), default=1.0, comment="标准人工配置（人/机）"
    )
    personnel_vave: Mapped[float | None] = mapped_column(
        Numeric(4, 2), comment="VAVE人工配置（人/机）"
    )
    # 兼容旧字段（保留用于现有数据）
    cycle_time: Mapped[int | None] = mapped_column(Integer, comment="工时（秒）- 已弃用，请使用cycle_time_std")
    # MHR 快照（从费率表复制，便于审计）
    std_mhr: Mapped[float | None] = mapped_column(Numeric(10, 2))
    vave_mhr: Mapped[float | None] = mapped_column(Numeric(10, 2))
    # 双轨成本
    # 公式: std_cost = (cycle_time_std / 3600) * std_mhr
    std_cost: Mapped[float | None] = mapped_column(Numeric(12, 4))
    vave_cost: Mapped[float | None] = mapped_column(Numeric(12, 4))
    # 备注
    remarks: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    def __repr__(self) -> str:
        return f"<ProductProcess(id={self.id}, process_code={self.process_code}, sequence={self.sequence_order})>"
