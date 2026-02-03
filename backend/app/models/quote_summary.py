"""报价汇总表模型"""
import uuid
from sqlalchemy import String, ForeignKey, Numeric, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from app.db.session import Base


class QuoteSummary(Base):
    """报价汇总表

    存储项目的报价汇总数据，与项目一对一关系
    """

    __tablename__ = "quote_summaries"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    # 关联项目（一对一）
    project_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, unique=True, index=True
    )
    # 总标准成本
    total_std_cost: Mapped[float | None] = mapped_column(Numeric(14, 4))
    # 总 VAVE 成本
    total_vave_cost: Mapped[float | None] = mapped_column(Numeric(14, 4))
    # 节省金额
    total_savings: Mapped[float | None] = mapped_column(Numeric(14, 4))
    # 节省率 (%)
    savings_rate: Mapped[float | None] = mapped_column(Numeric(5, 2))
    # 报价
    quoted_price: Mapped[float | None] = mapped_column(Numeric(14, 4))
    # 实际利润率 (%)
    actual_margin: Mapped[float | None] = mapped_column(Numeric(5, 2))
    # Business Case 扩展字段
    # HK III 制造成本
    hk_3_cost: Mapped[float | None] = mapped_column(Numeric(14, 4))
    # SK 完全成本
    sk_cost: Mapped[float | None] = mapped_column(Numeric(14, 4))
    # DB I 边际贡献 I
    db_1: Mapped[float | None] = mapped_column(Numeric(14, 4))
    # DB IV 净利润
    db_4: Mapped[float | None] = mapped_column(Numeric(14, 4))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    def __repr__(self) -> str:
        return f"<QuoteSummary(id={self.id}, project_id={self.project_id}, total_std_cost={self.total_std_cost})>"
