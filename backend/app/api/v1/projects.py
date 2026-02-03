"""项目 API 路由."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
import uuid

from app.db.session import get_db
from app.schemas.project import ProjectCreate, ProjectResponse
from app.models.project import Project, ProjectStatus
from sqlalchemy import select

router = APIRouter()


@router.get("", response_model=list[ProjectResponse])
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

    return [
        ProjectResponse(
            id=p.id,
            asacNumber=p.asac_number,
            customerNumber=p.customer_number,
            productVersion=p.product_version,
            customerVersion=p.customer_version,
            clientName=p.client_name,
            projectName=p.project_name,
            annualVolume=str(p.annual_volume),
            description=p.description or "",
            products=p.products,
            owners=p.owners,
            status=p.status,
            createdDate=p.created_at.isoformat(),
            updatedDate=p.updated_at.isoformat(),
        )
        for p in projects
    ]


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
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
        asac_number=data.asacNumber,
        customer_number=data.customerNumber,
        product_version=data.productVersion,
        customer_version=data.customerVersion,
        client_name=data.clientName,
        project_name=data.projectName,
        annual_volume=int(data.annualVolume),
        description=data.description,
        products=[p.model_dump() for p in data.products],
        owners=data.owners.model_dump(),
        status=ProjectStatus.DRAFT,
    )

    db.add(project)
    await db.commit()
    await db.refresh(project)

    return ProjectResponse(
        id=project.id,
        asacNumber=project.asac_number,
        customerNumber=project.customer_number,
        productVersion=project.product_version,
        customerVersion=project.customer_version,
        clientName=project.client_name,
        projectName=project.project_name,
        annualVolume=str(project.annual_volume),
        description=project.description or "",
        products=project.products,
        owners=project.owners,
        status=project.status,
        createdDate=project.created_at.isoformat(),
        updatedDate=project.updated_at.isoformat(),
    )


@router.get("/{project_id}", response_model=ProjectResponse)
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

    return ProjectResponse(
        id=project.id,
        asacNumber=project.asac_number,
        customerNumber=project.customer_number,
        productVersion=project.product_version,
        customerVersion=project.customer_version,
        clientName=project.client_name,
        projectName=project.project_name,
        annualVolume=str(project.annual_volume),
        description=project.description or "",
        products=project.products,
        owners=project.owners,
        status=project.status,
        createdDate=project.created_at.isoformat(),
        updatedDate=project.updated_at.isoformat(),
    )
