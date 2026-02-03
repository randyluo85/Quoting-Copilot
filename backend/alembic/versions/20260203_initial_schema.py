"""初始数据库结构

设计规范: docs/DATABASE_DESIGN.md

Revision ID: 001
Revises:
Create Date: 2026-02-03

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """创建所有表结构."""

    # ==================== materials (物料主数据表) ====================
    op.create_table(
        'materials',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('item_code', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('spec', sa.String(length=255), nullable=True),
        sa.Column('version', sa.String(length=20), nullable=True),
        sa.Column('material_type', sa.String(length=20), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=True, server_default='active'),
        sa.Column('material', sa.String(length=100), nullable=True),
        sa.Column('supplier', sa.String(length=200), nullable=True),
        sa.Column('remarks', sa.Text(), nullable=True),
        sa.Column('std_price', sa.Numeric(precision=10, scale=4), nullable=True),
        sa.Column('vave_price', sa.Numeric(precision=10, scale=4), nullable=True),
        sa.Column('supplier_tier', sa.String(length=20), nullable=True),
        sa.Column('category', sa.String(length=50), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('item_code'),
    )
    op.create_index('ix_materials_item_code', 'materials', ['item_code'])
    op.create_index('ix_materials_material_type', 'materials', ['material_type'])
    op.create_index('ix_materials_status', 'materials', ['status'])

    # ==================== process_rates (工序费率表) ====================
    op.create_table(
        'process_rates',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('process_code', sa.String(length=50), nullable=False),
        sa.Column('process_name', sa.String(length=100), nullable=False),
        sa.Column('equipment', sa.String(length=100), nullable=True),
        sa.Column('std_mhr', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('vave_mhr', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('efficiency_factor', sa.Numeric(precision=4, scale=2), nullable=False, server_default='1.0'),
        sa.Column('remarks', sa.Text(), nullable=True),
        sa.Column('work_center', sa.String(length=100), nullable=True),
        sa.Column('std_hourly_rate', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('vave_hourly_rate', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('process_code'),
    )
    op.create_index('ix_process_rates_process_code', 'process_rates', ['process_code'])
    op.create_index('ix_process_rates_process_name', 'process_rates', ['process_name'])

    # ==================== projects (项目表) ====================
    op.create_table(
        'projects',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('asac_number', sa.String(length=50), nullable=False),
        sa.Column('customer_number', sa.String(length=50), nullable=False),
        sa.Column('product_version', sa.String(length=20), nullable=False),
        sa.Column('customer_version', sa.String(length=20), nullable=False),
        sa.Column('client_name', sa.String(length=200), nullable=False),
        sa.Column('project_name', sa.String(length=200), nullable=False),
        sa.Column('annual_volume', sa.Integer(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('products', sa.JSON(), nullable=True),
        sa.Column('owners', sa.JSON(), nullable=True),
        sa.Column('status', sa.Enum('draft', 'in-progress', 'completed', name='projectstatus'), nullable=True, server_default='draft'),
        sa.Column('target_margin', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('owner', sa.String(length=50), nullable=True),
        sa.Column('remarks', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_projects_asac_number', 'projects', ['asac_number'])
    op.create_index('ix_projects_status', 'projects', ['status'])
    op.create_index('ix_projects_created_at', 'projects', ['created_at'])

    # ==================== project_products (项目产品关联表) ====================
    op.create_table(
        'project_products',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('project_id', sa.String(length=36), nullable=False),
        sa.Column('product_name', sa.String(length=200), nullable=False),
        sa.Column('product_code', sa.String(length=50), nullable=True),
        sa.Column('product_version', sa.String(length=20), nullable=True),
        sa.Column('route_code', sa.String(length=50), nullable=True),
        sa.Column('bom_file_path', sa.String(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
    )
    op.create_index('ix_project_products_project_id', 'project_products', ['project_id'])
    op.create_index('ix_project_products_route_code', 'project_products', ['route_code'])

    # ==================== product_materials (产品物料关联表/BOM行) ====================
    op.create_table(
        'product_materials',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('project_product_id', sa.String(length=36), nullable=False),
        sa.Column('material_id', sa.String(length=50), nullable=True),
        sa.Column('material_level', sa.Integer(), nullable=True),
        sa.Column('material_name', sa.String(length=200), nullable=True),
        sa.Column('material_type', sa.String(length=20), nullable=True),
        sa.Column('quantity', sa.Numeric(precision=10, scale=3), nullable=True),
        sa.Column('unit', sa.String(length=10), nullable=True),
        sa.Column('std_cost', sa.Numeric(precision=12, scale=4), nullable=True),
        sa.Column('vave_cost', sa.Numeric(precision=12, scale=4), nullable=True),
        sa.Column('confidence', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('ai_suggestion', sa.Text(), nullable=True),
        sa.Column('remarks', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['project_product_id'], ['project_products.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['material_id'], ['materials.id'], ondelete='SET NULL'),
    )
    op.create_index('ix_product_materials_project_product_id', 'product_materials', ['project_product_id'])
    op.create_index('ix_product_materials_material_id', 'product_materials', ['material_id'])

    # ==================== product_processes (产品工艺路线表) ====================
    op.create_table(
        'product_processes',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('project_product_id', sa.String(length=36), nullable=False),
        sa.Column('process_code', sa.String(length=50), nullable=False),
        sa.Column('sequence_order', sa.Integer(), nullable=False),
        sa.Column('cycle_time', sa.Integer(), nullable=True),
        sa.Column('std_mhr', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('vave_mhr', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('std_cost', sa.Numeric(precision=12, scale=4), nullable=True),
        sa.Column('vave_cost', sa.Numeric(precision=12, scale=4), nullable=True),
        sa.Column('remarks', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['project_product_id'], ['project_products.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['process_code'], ['process_rates.process_code'], ondelete='RESTRICT'),
    )
    op.create_index('ix_product_processes_project_product_id', 'product_processes', ['project_product_id'])
    op.create_index('ix_product_processes_product_product_id_sequence_order', 'product_processes', ['project_product_id', 'sequence_order'])

    # ==================== quote_summaries (报价汇总表) ====================
    op.create_table(
        'quote_summaries',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('project_id', sa.String(length=36), nullable=False),
        sa.Column('total_std_cost', sa.Numeric(precision=14, scale=4), nullable=True),
        sa.Column('total_vave_cost', sa.Numeric(precision=14, scale=4), nullable=True),
        sa.Column('total_savings', sa.Numeric(precision=14, scale=4), nullable=True),
        sa.Column('savings_rate', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('quoted_price', sa.Numeric(precision=14, scale=4), nullable=True),
        sa.Column('actual_margin', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('project_id'),
    )
    op.create_index('ix_quote_summaries_project_id', 'quote_summaries', ['project_id'])


def downgrade() -> None:
    """删除所有表结构."""
    op.drop_index('ix_quote_summaries_project_id', table_name='quote_summaries')
    op.drop_table('quote_summaries')

    op.drop_index('ix_product_processes_project_product_id_sequence_order', table_name='product_processes')
    op.drop_index('ix_product_processes_project_product_id', table_name='product_processes')
    op.drop_table('product_processes')

    op.drop_index('ix_product_materials_material_id', table_name='product_materials')
    op.drop_index('ix_product_materials_project_product_id', table_name='product_materials')
    op.drop_table('product_materials')

    op.drop_index('ix_project_products_route_code', table_name='project_products')
    op.drop_index('ix_project_products_project_id', table_name='project_products')
    op.drop_table('project_products')

    op.drop_index('ix_projects_created_at', table_name='projects')
    op.drop_index('ix_projects_status', table_name='projects')
    op.drop_index('ix_projects_asac_number', table_name='projects')
    op.drop_table('projects')

    op.drop_index('ix_process_rates_process_name', table_name='process_rates')
    op.drop_index('ix_process_rates_process_code', table_name='process_rates')
    op.drop_table('process_rates')

    op.drop_index('ix_materials_status', table_name='materials')
    op.drop_index('ix_materials_material_type', table_name='materials')
    op.drop_index('ix_materials_item_code', table_name='materials')
    op.drop_table('materials')
