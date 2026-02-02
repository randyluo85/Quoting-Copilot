# tests/conftest.py
import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from app.models import Base


@pytest_asyncio.fixture
async def mock_db_session():
    """Mock 数据库会话 - 使用内存 SQLite 测试"""
    try:
        import aiosqlite
    except ImportError:
        pytest.skip("aiosqlite not installed")

    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as session:
        yield session

    await engine.dispose()
