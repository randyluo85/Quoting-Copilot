"""通义千问 AI 服务."""

import httpx
import json
from typing import Optional
from app.config import Settings, get_settings


class QwenAIService:
    """通义千问 AI 服务.

    用于从 BOM 备注列中提取工艺特征参数。
    """

    def __init__(self, settings: Settings | None = None) -> None:
        self.settings = settings or get_settings()
        self.api_key = self.settings.DASHSCOPE_API_KEY
        self.base_url = self.settings.DASHSCOPE_BASE_URL
        self.model = self.settings.DASHSCOPE_MODEL
        self._client: httpx.AsyncClient | None = None

    @property
    def client(self) -> httpx.AsyncClient:
        """获取或创建 HTTP 客户端."""
        if self._client is None:
            self._client = httpx.AsyncClient(
                base_url=self.base_url,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                timeout=30.0,
            )
        return self._client

    async def extract_features_from_comments(
        self,
        comments: str,
        part_name: str,
    ) -> dict:
        """从 Comments 列提取工艺特征.

        Args:
            comments: BOM 表备注列内容
            part_name: 零件名称

        Returns:
            dict: 提取的工艺特征参数
        """
        if not comments or len(comments.strip()) < 3:
            return {}

        system_prompt = """你是一个拥有 10 年经验的制造业成本工程师。
你的任务是从 BOM 表的备注列中提取工艺参数，并转化为标准的 JSON 键值对。

提取规则：
1. 工艺名称：如"折弯"、"焊接"、"喷涂"等
2. 数量/次数：如"32次折弯"提取为 {"bending_count": 32}
3. 参数要求：如"公差±0.02mm"提取为 {"tolerance": "±0.02mm"}
4. 表面处理：如"阳极氧化黑色"提取为 {"surface_treatment": "anodizing_black"}

对于不确定的参数，不要猜测，直接标记为 null。

返回格式必须是纯 JSON，不要有任何其他文字。"""

        user_prompt = f"""请从以下备注中提取工艺特征：

零件名称：{part_name}
备注内容：{comments}

返回 JSON 格式。"""

        try:
            response = await self.client.post(
                "/chat/completions",
                json={
                    "model": self.model,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    "temperature": 0.1,
                    "max_tokens": 500,
                },
            )

            result = response.json()
            content = result["choices"][0]["message"]["content"]

            # 尝试解析 JSON，如果失败则返回空字典
            try:
                return json.loads(content)
            except json.JSONDecodeError:
                # 如果 AI 返回的内容不是纯 JSON，尝试提取 JSON 部分
                if "```json" in content:
                    json_start = content.find("```json") + 7
                    json_end = content.find("```", json_start)
                    json_str = content[json_start:json_end].strip()
                    return json.loads(json_str)
                elif "{" in content and "}" in content:
                    json_start = content.find("{")
                    json_end = content.rfind("}") + 1
                    return json.loads(content[json_start:json_end])

                return {}

        except Exception:
            return {}

    async def close(self) -> None:
        """关闭 HTTP 客户端."""
        if self._client is not None:
            await self._client.aclose()
            self._client = None

    async def __aenter__(self):
        """异步上下文管理器入口."""
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """异步上下文管理器退出."""
        await self.close()
