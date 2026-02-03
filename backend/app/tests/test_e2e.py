"""端到端测试."""

import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.db.session import engine


@pytest.fixture(scope="class")
async def cleanup_engine():
    """在每个测试类后清理数据库引擎."""
    yield
    await engine.dispose()


@pytest.mark.asyncio
class TestE2E:
    """端到端测试（无需数据库）."""

    async def test_health_check(self):
        """测试健康检查端点."""
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get("/health")
            assert response.status_code == 200
            assert response.json()["status"] == "healthy"

    async def test_cost_calculate(self):
        """测试成本计算端点."""
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post("/api/v1/cost/calculate?project_id=test&product_id=P-001")
            assert response.status_code == 200
            data = response.json()
            assert "materialCost" in data
            assert "processCost" in data
            assert "totalCost" in data
            # 验证双轨计算结果
            assert "std" in data["totalCost"]
            assert "vave" in data["totalCost"]
            assert "savings" in data["totalCost"]


@pytest.mark.usefixtures("cleanup_engine")
@pytest.mark.asyncio
class TestE2EWithDatabase:
    """需要数据库的端到端测试."""

    async def test_list_projects_empty(self):
        """测试获取空项目列表."""
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get("/api/v1/projects")
            assert response.status_code == 200
            # 验证 camelCase 响应
            data = response.json()
            assert isinstance(data, list)

    async def test_create_and_get_project(self):
        """测试创建和获取项目."""
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # 创建项目
            create_data = {
                "asacNumber": "AS-TEST-001",
                "customerNumber": "TEST-001",
                "productVersion": "V1.0",
                "customerVersion": "C1.0",
                "clientName": "测试客户",
                "projectName": "测试项目",
                "annualVolume": "10000",
                "description": "测试描述",
                "products": [
                    {
                        "id": "P-001",
                        "name": "测试产品",
                        "partNumber": "TEST-001",
                        "annualVolume": 10000,
                        "description": "测试产品描述",
                    }
                ],
                "owners": {
                    "sales": "张三",
                    "vm": "李四",
                    "ie": "王五",
                    "pe": "赵六",
                    "controlling": "钱七",
                },
            }

            response = await client.post("/api/v1/projects", json=create_data)
            assert response.status_code == 201
            data = response.json()
            project_id = data["id"]

            # 验证 camelCase 响应
            assert "projectName" in data
            assert data["projectName"] == "测试项目"

            # 获取项目
            response = await client.get(f"/api/v1/projects/{project_id}")
            assert response.status_code == 200
            data = response.json()
            assert data["projectName"] == "测试项目"
