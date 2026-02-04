"""添加 BOM 物料字段

- part_number: 零件号
- version: 版本号（BOM 的 Ver. 列）
- stock_status: 库存状态（BOM 的 St. 列）
- supplier: 供应商

Revision ID: 002
Revises: 001
Create Date: 2026-02-04

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '002'
down_revision: Union[str, None] = '001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """添加 BOM 物料字段."""

    # 添加新列到 product_materials 表
    op.add_column('product_materials', sa.Column('part_number', sa.String(length=100), nullable=True))
    op.add_column('product_materials', sa.Column('version', sa.String(length=20), nullable=True))
    op.add_column('product_materials', sa.Column('stock_status', sa.String(length=20), nullable=True))
    op.add_column('product_materials', sa.Column('supplier', sa.String(length=200), nullable=True))


def downgrade() -> None:
    """移除添加的列."""

    op.drop_column('product_materials', 'supplier')
    op.drop_column('product_materials', 'stock_status')
    op.drop_column('product_materials', 'version')
    op.drop_column('product_materials', 'part_number')
