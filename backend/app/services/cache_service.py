"""Redis 缓存服务."""

import json
import redis.asyncio as redis
from typing import Optional
from app.config import Settings, get_settings


class CacheService:
    """Redis 缓存服务.

    用于缓存物料数据和工艺费率数据，减少数据库查询。
    """

    # 缓存过期时间（秒）
    TTL_MATERIAL = 3600  # 物料数据: 1 小时
    TTL_RATE = 3600  # 工艺费率: 1 小时
    TTL_LLM = 86400  # LLM 结果: 24 小时

    def __init__(self, settings: Settings | None = None) -> None:
        self.settings = settings or get_settings()
        self._redis: redis.Redis | None = None

    @property
    def redis(self) -> redis.Redis:
        """获取或创建 Redis 客户端."""
        if self._redis is None:
            self._redis = redis.Redis(
                host=self.settings.REDIS_HOST,
                port=self.settings.REDIS_PORT,
                db=self.settings.REDIS_DB,
                password=self.settings.REDIS_PASSWORD or None,
                decode_responses=True,
            )
        return self._redis

    async def get_material(self, item_code: str) -> Optional[dict]:
        """获取物料缓存.

        Args:
            item_code: 物料编码

        Returns:
            物料数据字典，不存在则返回 None
        """
        key = f"material:{item_code}"
        data = await self.redis.get(key)
        return json.loads(data) if data else None

    async def set_material(self, item_code: str, data: dict) -> None:
        """设置物料缓存.

        Args:
            item_code: 物料编码
            data: 物料数据
        """
        key = f"material:{item_code}"
        await self.redis.setex(key, self.TTL_MATERIAL, json.dumps(data))

    async def get_process_rate(self, process_name: str) -> Optional[dict]:
        """获取工艺费率缓存.

        Args:
            process_name: 工艺名称

        Returns:
            工艺费率数据字典，不存在则返回 None
        """
        key = f"rate:{process_name}"
        data = await self.redis.get(key)
        return json.loads(data) if data else None

    async def set_process_rate(self, process_name: str, data: dict) -> None:
        """设置工艺费率缓存.

        Args:
            process_name: 工艺名称
            data: 工艺费率数据
        """
        key = f"rate:{process_name}"
        await self.redis.setex(key, self.TTL_RATE, json.dumps(data))

    async def get_llm_result(self, cache_key: str) -> Optional[dict]:
        """获取 LLM 结果缓存.

        Args:
            cache_key: 缓存键

        Returns:
            LLM 结果字典，不存在则返回 None
        """
        key = f"llm:{cache_key}"
        data = await self.redis.get(key)
        return json.loads(data) if data else None

    async def set_llm_result(self, cache_key: str, data: dict) -> None:
        """设置 LLM 结果缓存.

        Args:
            cache_key: 缓存键
            data: LLM 结果数据
        """
        key = f"llm:{cache_key}"
        await self.redis.setex(key, self.TTL_LLM, json.dumps(data))

    async def delete_material(self, item_code: str) -> None:
        """删除物料缓存.

        Args:
            item_code: 物料编码
        """
        key = f"material:{item_code}"
        await self.redis.delete(key)

    async def delete_process_rate(self, process_name: str) -> None:
        """删除工艺费率缓存.

        Args:
            process_name: 工艺名称
        """
        key = f"rate:{process_name}"
        await self.redis.delete(key)

    async def close(self) -> None:
        """关闭 Redis 连接."""
        if self._redis is not None:
            await self._redis.close()
            self._redis = None

    async def __aenter__(self):
        """异步上下文管理器入口."""
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """异步上下文管理器退出."""
        await self.close()
