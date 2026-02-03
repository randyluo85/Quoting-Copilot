"""数据库初始化脚本.

设计规范: docs/DATABASE_DESIGN.md
"""
from sqlalchemy.ext.asyncio import create_async_engine
from app.config import get_settings
from app.db.session import Base

# 导入所有模型，确保 SQLAlchemy 能识别所有表
from app.models import (
    Project,
    Material,
    ProcessRate,
    CostCenter,
    ProjectProduct,
    ProductMaterial,
    ProductProcess,
    QuoteSummary,
)


async def init_db() -> None:
    """初始化数据库.

    创建所有表结构。
    """
    settings = get_settings()

    engine = create_async_engine(settings.mysql_url, echo=True)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    await engine.dispose()
    print("Database initialized successfully!")


if __name__ == "__main__":
    import asyncio

    asyncio.run(init_db())
