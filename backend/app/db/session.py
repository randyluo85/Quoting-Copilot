from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.config import Settings, get_settings

settings: Settings = get_settings()

# 创建异步引擎 - 添加连接池配置以避免超时
engine = create_async_engine(
    settings.mysql_url,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    pool_recycle=3600,  # 1小时回收连接
    connect_args={
        "charset": "utf8mb4",
        "connect_timeout": 60,
    }
)

# 创建异步会话工厂
AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False, autocommit=False, autoflush=False
)


class Base(DeclarativeBase):
    """所有模型的基类"""

    pass


async def get_db() -> AsyncSession:
    """数据库会话依赖注入"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
