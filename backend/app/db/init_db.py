"""数据库初始化脚本."""

from sqlalchemy.ext.asyncio import create_async_engine
from app.config import get_settings
from app.db.session import Base
from app.models.material import Material
from app.models.process_rate import ProcessRate
from app.models.project import Project


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
