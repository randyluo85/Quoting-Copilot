"""ProcessRate MHR 拆分迁移 (v1.3)

将 std_mhr 和 vave_mhr 拆分为变动费率和固定费率两部分:
- std_mhr = std_mhr_var + std_mhr_fix
- vave_mhr = vave_mhr_var + vave_mhr_fix

同时添加 cost_center_id 外键关联到成本中心表.

Revision ID: 002
Revises: 001
Create Date: 2026-02-03

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
    """添加 MHR 拆分字段和成本中心外键."""

    # 添加成本中心外键列
    op.add_column(
        'process_rates',
        sa.Column('cost_center_id', sa.String(length=20), nullable=True)
    )

    # 创建外键约束
    op.create_foreign_key(
        'fk_process_rates_cost_center',
        'process_rates', 'cost_centers',
        ['cost_center_id'], ['id']
    )

    # 添加标准费率拆分列
    op.add_column(
        'process_rates',
        sa.Column('std_mhr_var', sa.Numeric(precision=10, scale=2), nullable=True)
    )
    op.add_column(
        'process_rates',
        sa.Column('std_mhr_fix', sa.Numeric(precision=10, scale=2), nullable=True)
    )

    # 添加 VAVE 费率拆分列
    op.add_column(
        'process_rates',
        sa.Column('vave_mhr_var', sa.Numeric(precision=10, scale=2), nullable=True)
    )
    op.add_column(
        'process_rates',
        sa.Column('vave_mhr_fix', sa.Numeric(precision=10, scale=2), nullable=True)
    )

    # 数据迁移：将现有的 std_mhr 和 vave_mhr 数据迁移到新的拆分列
    # 默认策略：全部作为固定费率 (可以根据业务需求调整)
    op.execute("""
        UPDATE process_rates
        SET std_mhr_fix = std_mhr
        WHERE std_mhr IS NOT NULL
    """)

    op.execute("""
        UPDATE process_rates
        SET vave_mhr_fix = vave_mhr
        WHERE vave_mhr IS NOT NULL
    """)


def downgrade() -> None:
    """回滚迁移."""

    # 删除新增的列
    op.drop_column('process_rates', 'vave_mhr_fix')
    op.drop_column('process_rates', 'vave_mhr_var')
    op.drop_column('process_rates', 'std_mhr_fix')
    op.drop_column('process_rates', 'std_mhr_var')

    # 删除外键约束和列
    op.drop_constraint('fk_process_rates_cost_center', 'process_rates', type_='foreignkey')
    op.drop_column('process_rates', 'cost_center_id')
