"""项目 API 路由."""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
import uuid

from app.db.session import get_db
from app.schemas.project import ProjectCreate, ProjectResponse
from app.models.project import Project, ProjectStatus
from sqlalchemy import select

router = APIRouter()


@router.get("")
async def list_projects(
    status_filter: ProjectStatus | None = None,
    db: AsyncSession = Depends(get_db),
):
    """获取项目列表.

    Args:
        status_filter: 按状态筛选
        db: 数据库会话

    Returns:
        项目列表
    """
    query = select(Project)
    if status_filter:
        query = query.where(Project.status == status_filter)

    result = await db.execute(query.order_by(Project.created_at.desc()))
    projects = result.scalars().all()

    responses = [
        ProjectResponse(
            id=p.id,
            asac_number=p.asac_number,
            customer_number=p.customer_number,
            product_version=p.product_version,
            customer_version=p.customer_version,
            client_name=p.client_name,
            project_name=p.project_name,
            annual_volume=str(p.annual_volume),
            description=p.description or "",
            products=p.products,
            owners=p.owners,
            status=p.status,
            target_margin=p.target_margin,
            owner=p.owner,
            remarks=p.remarks,
            created_date=p.created_at.isoformat(),
            updated_date=p.updated_at.isoformat(),
        )
        for p in projects
    ]
    return JSONResponse(content=[r.model_dump(by_alias=True) for r in responses])


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_project(
    data: ProjectCreate,
    db: AsyncSession = Depends(get_db),
):
    """创建新项目.

    Args:
        data: 项目创建数据
        db: 数据库会话

    Returns:
        创建的项目
    """
    project_id = f"PRJ-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:6].upper()}"

    project = Project(
        id=project_id,
        asac_number=data.asac_number,
        customer_number=data.customer_number,
        product_version=data.product_version,
        customer_version=data.customer_version,
        client_name=data.client_name,
        project_name=data.project_name,
        annual_volume=int(data.annual_volume),
        description=data.description,
        products=[p.model_dump(by_alias=False) for p in data.products],
        owners=data.owners.model_dump(by_alias=False),
        status=ProjectStatus.DRAFT,
        target_margin=data.target_margin,
    )

    db.add(project)
    await db.commit()
    await db.refresh(project)

    response = ProjectResponse(
        id=project.id,
        asac_number=project.asac_number,
        customer_number=project.customer_number,
        product_version=project.product_version,
        customer_version=project.customer_version,
        client_name=project.client_name,
        project_name=project.project_name,
        annual_volume=str(project.annual_volume),
        description=project.description or "",
        products=project.products,
        owners=project.owners,
        status=project.status,
        target_margin=project.target_margin,
        owner=project.owner,
        remarks=project.remarks,
        created_date=project.created_at.isoformat(),
        updated_date=project.updated_at.isoformat(),
    )
    return JSONResponse(content=response.model_dump(by_alias=True), status_code=201)


@router.get("/{project_id}")
async def get_project(
    project_id: str,
    db: AsyncSession = Depends(get_db),
):
    """获取项目详情.

    Args:
        project_id: 项目 ID
        db: 数据库会话

    Returns:
        项目详情
    """
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    response = ProjectResponse(
        id=project.id,
        asac_number=project.asac_number,
        customer_number=project.customer_number,
        product_version=project.product_version,
        customer_version=project.customer_version,
        client_name=project.client_name,
        project_name=project.project_name,
        annual_volume=str(project.annual_volume),
        description=project.description or "",
        products=project.products,
        owners=project.owners,
        status=project.status,
        target_margin=project.target_margin,
        owner=project.owner,
        remarks=project.remarks,
        created_date=project.created_at.isoformat(),
        updated_date=project.updated_at.isoformat(),
    )
    return JSONResponse(content=response.model_dump(by_alias=True))


@router.put("/{project_id}")
async def update_project(
    project_id: str,
    data: ProjectCreate,
    db: AsyncSession = Depends(get_db),
):
    """更新项目.

    Args:
        project_id: 项目 ID
        data: 更新数据
        db: 数据库会话

    Returns:
        更新后的项目
    """
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # 更新字段
    project.asac_number = data.asac_number
    project.customer_number = data.customer_number
    project.product_version = data.product_version
    project.customer_version = data.customer_version
    project.client_name = data.client_name
    project.project_name = data.project_name
    project.annual_volume = int(data.annual_volume)
    project.description = data.description
    project.products = [p.model_dump(by_alias=False) for p in data.products]
    project.owners = data.owners.model_dump(by_alias=False)
    project.target_margin = data.target_margin
    project.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(project)

    response = ProjectResponse(
        id=project.id,
        asac_number=project.asac_number,
        customer_number=project.customer_number,
        product_version=project.product_version,
        customer_version=project.customer_version,
        client_name=project.client_name,
        project_name=project.project_name,
        annual_volume=str(project.annual_volume),
        description=project.description or "",
        products=project.products,
        owners=project.owners,
        status=project.status,
        target_margin=project.target_margin,
        owner=project.owner,
        remarks=project.remarks,
        created_date=project.created_at.isoformat(),
        updated_date=project.updated_at.isoformat(),
    )
    return JSONResponse(content=response.model_dump(by_alias=True))


@router.delete("/{project_id}")
async def delete_project(
    project_id: str,
    db: AsyncSession = Depends(get_db),
):
    """删除项目.

    Args:
        project_id: 项目 ID
        db: 数据库会话

    Returns:
        成功消息
    """
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    await db.delete(project)
    await db.commit()

    return JSONResponse(content={"message": "Project deleted successfully"})
