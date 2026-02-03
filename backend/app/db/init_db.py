"""数据库初始化脚本."""

from sqlalchemy.ext.asyncio import create_async_engine
from app.config import get_settings
from app.db.session import Base


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
