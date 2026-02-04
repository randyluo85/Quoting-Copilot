"""添加 ProcessRate 折旧率字段

- std_depreciation_rate: 标准折旧率
- vave_depreciation_rate: VAVE 折旧率

Revision ID: 006
Revises: 005
Create Date: 2026-02-04

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '006'
down_revision: Union[str, None] = '005'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """添加折旧率字段."""

    # 添加标准折旧率列
    op.add_column(
        'process_rates',
        sa.Column('std_depreciation_rate', sa.Numeric(precision=8, scale=4), nullable=True)
    )

    # 添加 VAVE 折旧率列
    op.add_column(
        'process_rates',
        sa.Column('vave_depreciation_rate', sa.Numeric(precision=8, scale=4), nullable=True)
    )


def downgrade() -> None:
    """移除折旧率字段."""

    op.drop_column('process_rates', 'vave_depreciation_rate')
    op.drop_column('process_rates', 'std_depreciation_rate')
