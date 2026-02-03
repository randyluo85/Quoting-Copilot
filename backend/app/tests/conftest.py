"""测试配置和 fixtures."""

import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import NullPool
from app.config import get_settings
from app.main import app
from app.db.session import get_db


@pytest.fixture(scope="class")
async def test_client():
    """创建测试用的 HTTP 客户端.

    使用 NullPool 避免连接池与事件循环的冲突问题.
    """
    settings = get_settings()

    # 创建测试专用引擎（使用 NullPool）
    test_engine = create_async_engine(
        settings.mysql_url,
        echo=False,
        poolclass=NullPool,  # 不使用连接池，避免事件循环冲突
    )

    # 创建会话工厂
    TestingSessionLocal = async_sessionmaker(
        test_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    async def override_get_db():
        async with TestingSessionLocal() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client

    # 清理
    app.dependency_overrides.clear()
    await test_engine.dispose()
