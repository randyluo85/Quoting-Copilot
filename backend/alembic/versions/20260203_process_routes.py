"""工艺路线主数据表迁移

新增工艺路线模板主数据，支持 IE 工程师创建和维护可复用的工艺路线。

表结构:
- process_routes: 工艺路线主数据表（模板）
- process_route_items: 工序明细表

Revision ID: 004
Revises: 003
Create Date: 2026-02-03

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '004'
down_revision: Union[str, None] = '003'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """创建工艺路线主数据表."""

    # ==================== process_routes（工艺路线主数据表）====================
    op.create_table(
        'process_routes',
        sa.Column('id', sa.String(length=50), nullable=False, comment='工艺路线编码'),
        sa.Column('name', sa.String(length=200), nullable=False, comment='工艺路线名称'),
        sa.Column('product_id', sa.String(length=50), nullable=True, comment='关联产品ID（可选）'),
        sa.Column('version', sa.Integer(), nullable=False, server_default='1', comment='当前版本号'),
        sa.Column(
            'status',
            sa.Enum('draft', 'pending', 'active', 'deprecated', name='processroutestatus'),
            nullable=False,
            server_default='draft',
            comment='状态: draft-草稿, pending-待审批, active-生效, deprecated-已废弃'
        ),
        sa.Column('created_by', sa.String(length=50), nullable=True, comment='创建人（IE工程师）'),
        sa.Column('approved_by', sa.String(length=50), nullable=True, comment='审批人'),
        sa.Column('approved_at', sa.DateTime(), nullable=True, comment='审批时间'),
        sa.Column('remarks', sa.Text(), nullable=True, comment='备注'),
        sa.Column('created_at', sa.DateTime(), nullable=True, comment='创建时间'),
        sa.Column('updated_at', sa.DateTime(), nullable=True, comment='更新时间'),
        sa.PrimaryKeyConstraint('id'),
        comment='工艺路线主数据表（可复用模板）'
    )
    op.create_index('ix_process_routes_id', 'process_routes', ['id'])
    op.create_index('ix_process_routes_status', 'process_routes', ['status'])
    op.create_index('ix_process_routes_product_id', 'process_routes', ['product_id'])

    # ==================== process_route_items（工序明细表）====================
    op.create_table(
        'process_route_items',
        sa.Column('id', sa.String(length=36), nullable=False, comment='UUID'),
        sa.Column(
            'route_id',
            sa.String(length=50),
            nullable=False,
            comment='关联工艺路线ID'
        ),
        sa.Column('operation_no', sa.String(length=20), nullable=False, comment='工序号，如 OP010'),
        sa.Column(
            'process_code',
            sa.String(length=50),
            nullable=False,
            comment='关联 process_rates.process_code'
        ),
        sa.Column('sequence', sa.Integer(), nullable=False, server_default='0', comment='排序顺序'),
        sa.Column('cycle_time_std', sa.Integer(), nullable=True, comment='标准工时（秒）'),
        sa.Column('cycle_time_vave', sa.Integer(), nullable=True, comment='VAVE工时（秒）'),
        sa.Column(
            'personnel_std',
            sa.Numeric(precision=4, scale=2),
            nullable=False,
            server_default='1.00',
            comment='标准人工配置'
        ),
        sa.Column(
            'personnel_vave',
            sa.Numeric(precision=4, scale=2),
            nullable=True,
            comment='VAVE人工配置'
        ),
        sa.Column(
            'std_mhr_var',
            sa.Numeric(precision=10, scale=2),
            nullable=True,
            comment='标准变动费率（快照）'
        ),
        sa.Column(
            'std_mhr_fix',
            sa.Numeric(precision=10, scale=2),
            nullable=True,
            comment='标准固定费率（快照）'
        ),
        sa.Column(
            'vave_mhr_var',
            sa.Numeric(precision=10, scale=2),
            nullable=True,
            comment='VAVE变动费率（快照）'
        ),
        sa.Column(
            'vave_mhr_fix',
            sa.Numeric(precision=10, scale=2),
            nullable=True,
            comment='VAVE固定费率（快照）'
        ),
        sa.Column(
            'efficiency_factor',
            sa.Numeric(precision=4, scale=2),
            nullable=False,
            server_default='1.00',
            comment='效率系数'
        ),
        sa.Column('equipment', sa.String(length=100), nullable=True, comment='设备（快照）'),
        sa.Column('remarks', sa.Text(), nullable=True, comment='备注'),
        sa.Column('created_at', sa.DateTime(), nullable=True, comment='创建时间'),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['route_id'], ['process_routes.id'], ondelete='CASCADE'),
        comment='工序明细表'
    )
    op.create_index('ix_process_route_items_route_id', 'process_route_items', ['route_id'])
    op.create_index('ix_process_route_items_sequence', 'process_route_items', ['sequence'])
    op.create_index('ix_process_route_items_process_code', 'process_route_items', ['process_code'])

    # ==================== 修改 project_products 表 ====================
    # 添加 route_id 外键字段（关联工艺路线模板）
    op.add_column(
        'project_products',
        sa.Column(
            'route_id',
            sa.String(length=50),
            nullable=True,
            comment='关联的工艺路线ID（引用 process_routes.id）'
        )
    )
    op.create_index(
        'ix_project_products_route_id',
        'project_products',
        ['route_id']
    )


def downgrade() -> None:
    """回滚迁移."""

    # 删除 project_products 的 route_id 列
    op.drop_index('ix_project_products_route_id', table_name='project_products')
    op.drop_column('project_products', 'route_id')

    # 删除 process_route_items 表
    op.drop_index('ix_process_route_items_process_code', table_name='process_route_items')
    op.drop_index('ix_process_route_items_sequence', table_name='process_route_items')
    op.drop_index('ix_process_route_items_route_id', table_name='process_route_items')
    op.drop_table('process_route_items')

    # 删除 process_routes 表
    op.drop_index('ix_process_routes_product_id', table_name='process_routes')
    op.drop_index('ix_process_routes_status', table_name='process_routes')
    op.drop_index('ix_process_routes_id', table_name='process_routes')
    op.drop_table('process_routes')

    # 删除枚举类型
    op.execute('DROP TYPE IF EXISTS processroutestatus')
