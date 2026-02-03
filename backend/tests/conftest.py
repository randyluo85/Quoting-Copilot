"""Pytest 配置和共享 fixtures"""
import asyncio
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from datetime import datetime
from decimal import Decimal
import uuid

from app.main import app
from app.db.session import Base
from app.config import get_settings
from app.models import Project, Material, ProcessRate, ProjectStatus


# 测试数据库 URL（使用现有数据库作为测试库）
# 注意：生产环境应使用独立测试数据库
TEST_DATABASE_URL = "mysql+aiomysql://smartquote:smartpassword@localhost:3306/smartquote"

# 创建测试引擎
test_engine = create_async_engine(
    TEST_DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
)


@pytest.fixture(scope="session")
def event_loop():
    """创建事件循环"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
async def setup_database():
    """设置测试数据库"""
    # 创建所有表
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # 清理
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture
async def db_session(setup_database):
    """创建数据库会话"""
    async_session = async_sessionmaker(
        test_engine, class_=AsyncSession, expire_on_commit=False
    )
    async with async_session() as session:
        yield session
        # 清理数据
        await session.rollback()


@pytest.fixture
async def async_client(db_session):
    """创建异步测试客户端"""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client


@pytest.fixture
async def test_project(db_session):
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


@pytest.fixture
async def test_material(db_session):
    """创建测试物料"""
    material = Material(
        id=1,
        item_code="MAT-001",
        name="测试物料",
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


@pytest.fixture
async def test_process_rate(db_session):
    """创建测试工序费率"""
    process_rate = ProcessRate(
        id=1,
        process_code="PROC-001",
        process_name="测试工序",
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
