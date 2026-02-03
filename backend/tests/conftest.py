"""Pytest 配置和共享 fixtures"""
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from datetime import datetime
from decimal import Decimal
from typing import AsyncGenerator, Generator
import uuid

from app.main import app
from app.db.session import Base, get_db
from app.models import Project, Material, ProcessRate, ProjectStatus


# 测试数据库 URL
TEST_DATABASE_URL = "mysql+aiomysql://smartquote:smartpassword@localhost:3306/smartquote"

# 创建测试引擎（全局共享）
test_engine = create_async_engine(
    TEST_DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
)

async_session = async_sessionmaker(
    test_engine, class_=AsyncSession, expire_on_commit=False
)


@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """创建事件循环（session 作用域）"""
    import asyncio
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="session")
async def setup_database():
    """设置测试数据库表（仅一次）"""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # 清理表（可选）
    # async with test_engine.begin() as conn:
    #     await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def db_session(setup_database) -> AsyncGenerator[AsyncSession, None]:
    """创建数据库会话"""
    async with async_session() as session:
        yield session
        # 回滚未提交的更改
        await session.rollback()


@pytest_asyncio.fixture
async def async_client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """创建异步测试客户端，覆盖 get_db 依赖"""

    async def override_get_db():
        """覆盖 get_db 依赖使用测试 session"""
        yield db_session

    # 覆盖依赖
    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client

    # 清理依赖覆盖
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def test_project(db_session: AsyncSession):
    """创建测试项目"""
    project = Project(
        id=str(uuid.uuid4()),
        asac_number=f"AS-{uuid.uuid4().hex[:8].upper()}",
        customer_number="TEST-CUST",
        product_version="V1.0",
        customer_version="C1.0",
        client_name="测试客户",
        project_name="测试项目",
        annual_volume="10000",
        description="测试描述",
        products=[],
        owners={
            "sales": "张三",
            "vm": "李四",
            "ie": "王五",
            "pe": "赵六",
            "controlling": "钱七"
        },
        status=ProjectStatus.DRAFT,
        target_margin=None,
        owner=None,
        remarks=None,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db_session.add(project)
    await db_session.commit()
    await db_session.refresh(project)
    return project


@pytest_asyncio.fixture
async def test_material(db_session: AsyncSession):
    """创建测试物料（使用唯一编码避免冲突）"""
    suffix = uuid.uuid4().hex[:6].upper()
    material = Material(
        item_code=f"MAT-{suffix}",
        name=f"测试物料-{suffix}",
        spec="规格描述",
        version="V1.0",
        material_type="made",
        status="active",
        material="材料描述",
        supplier="供应商",
        remarks="备注",
        std_price=Decimal("100.00"),
        vave_price=Decimal("90.00"),
        supplier_tier="A",
        category="金属",
    )
    db_session.add(material)
    await db_session.commit()
    await db_session.refresh(material)
    return material


@pytest_asyncio.fixture
async def test_process_rate(db_session: AsyncSession):
    """创建测试工序费率（使用唯一编码避免冲突）"""
    suffix = uuid.uuid4().hex[:6].upper()
    process_rate = ProcessRate(
        process_code=f"PROC-{suffix}",
        process_name=f"测试工序-{suffix}",
        equipment="设备A",
        std_mhr=Decimal("100.00"),
        vave_mhr=Decimal("90.00"),
        efficiency_factor=Decimal("1.0"),
        remarks="备注",
    )
    db_session.add(process_rate)
    await db_session.commit()
    await db_session.refresh(process_rate)
    return process_rate
