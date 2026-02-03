"""Database models module

设计规范: docs/DATABASE_DESIGN.md
"""
from app.models.project import Project, ProjectStatus
from app.models.material import Material
from app.models.process_rate import ProcessRate
from app.models.project_product import ProjectProduct
from app.models.product_material import ProductMaterial
from app.models.product_process import ProductProcess
from app.models.quote_summary import QuoteSummary

__all__ = [
    # 主数据表
    "Material",
    "ProcessRate",
    # 交易数据表
    "Project",
    "ProjectStatus",
    "ProjectProduct",
    "ProductMaterial",
    "ProductProcess",
    "QuoteSummary",
]
