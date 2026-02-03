"""项目产品关联 API 路由.

设计规范: docs/DATABASE_DESIGN.md
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from datetime import datetime

from app.db.session import get_db
from app.schemas.bom import ProjectProductCreate, ProjectProductResponse
from app.models.project_product import ProjectProduct
from sqlalchemy import select

router = APIRouter()


@router.post("")
async def create_project_product(
    data: ProjectProductCreate,
    db: AsyncSession = Depends(get_db),
):
    """创建项目产品关联.

    Args:
        data: 项目产品创建数据
        db: 数据库会话

    Returns:
        创建的项目产品
    """
    product_id = str(uuid.uuid4())

    project_product = ProjectProduct(
        id=product_id,
        project_id=data.project_id,
        product_name=data.product_name,
        product_code=data.product_code,
        product_version=data.product_version,
        route_code=data.route_code,
        bom_file_path=data.bom_file_path,
        created_at=datetime.utcnow(),
    )

    db.add(project_product)
    await db.commit()
    await db.refresh(project_product)

    response = ProjectProductResponse(
        id=project_product.id,
        project_id=project_product.project_id,
        product_name=project_product.product_name,
        product_code=project_product.product_code,
        product_version=project_product.product_version,
        route_code=project_product.route_code,
        bom_file_path=project_product.bom_file_path,
        created_at=project_product.created_at.isoformat(),
    )
    return JSONResponse(content=response.model_dump(by_alias=True), status_code=201)


@router.get("/{project_id}")
async def get_project_products(
    project_id: str,
    db: AsyncSession = Depends(get_db),
):
    """获取项目的所有产品.

    Args:
        project_id: 项目 ID
        db: 数据库会话

    Returns:
        项目产品列表
    """
    result = await db.execute(
        select(ProjectProduct)
        .where(ProjectProduct.project_id == project_id)
        .order_by(ProjectProduct.created_at)
    )
    products = result.scalars().all()

    responses = [
        ProjectProductResponse(
            id=p.id,
            project_id=p.project_id,
            product_name=p.product_name,
            product_code=p.product_code,
            product_version=p.product_version,
            route_code=p.route_code,
            bom_file_path=p.bom_file_path,
            created_at=p.created_at.isoformat(),
        )
        for p in products
    ]
    return JSONResponse(content=[r.model_dump(by_alias=True) for r in responses])
