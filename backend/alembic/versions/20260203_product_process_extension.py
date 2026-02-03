"""ProductProcess 扩展字段迁移 (v1.3)

为 ProductProcess 表添加双轨成本计算的扩展字段:
- cycle_time_std: 标准工时（秒）
- cycle_time_vave: VAVE 工时（秒）
- personnel_std: 标准人工配置（人/机）
- personnel_vave: VAVE 人工配置（人/机）

Revision ID: 003
Revises: 002
Create Date: 2026-02-03

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '003'
down_revision: Union[str, None] = '002'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """添加 ProductProcess 扩展字段."""

    # 添加标准工时列
    op.add_column(
        'product_processes',
        sa.Column('cycle_time_std', sa.Integer(), nullable=True, comment='标准工时（秒）')
    )

    # 添加 VAVE 工时列
    op.add_column(
        'product_processes',
        sa.Column('cycle_time_vave', sa.Integer(), nullable=True, comment='VAVE工时（秒）')
    )

    # 添加标准人工配置列
    op.add_column(
        'product_processes',
        sa.Column(
            'personnel_std',
            sa.Numeric(precision=4, scale=2),
            nullable=True,
            server_default='1.00',
            comment='标准人工配置（人/机）'
        )
    )

    # 添加 VAVE 人工配置列
    op.add_column(
        'product_processes',
        sa.Column(
            'personnel_vave',
            sa.Numeric(precision=4, scale=2),
            nullable=True,
            comment='VAVE人工配置（人/机）'
        )
    )

    # 数据迁移：将现有的 cycle_time 数据迁移到 cycle_time_std
    op.execute("""
        UPDATE product_processes
        SET cycle_time_std = cycle_time
        WHERE cycle_time IS NOT NULL
    """)


def downgrade() -> None:
    """回滚迁移."""

    # 删除新增的列
    op.drop_column('product_processes', 'personnel_vave')
    op.drop_column('product_processes', 'personnel_std')
    op.drop_column('product_processes', 'cycle_time_vave')
    op.drop_column('product_processes', 'cycle_time_std')
