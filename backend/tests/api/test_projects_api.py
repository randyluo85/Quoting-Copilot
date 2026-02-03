"""Projects API 集成测试

遵循 TDD 原则：
1. RED - 先写失败的测试
2. GREEN - 写最小代码使测试通过
3. REFACTOR - 重构清理
"""
import pytest
from httpx import AsyncClient, ASGITransport
from decimal import Decimal

from app.main import app
from app.models.project import Project, ProjectStatus


class TestProjectsAPI:
    """Projects API 集成测试"""

    @pytest.mark.asyncio
    async def test_list_projects_returns_empty_array_when_no_projects(self, async_client):
        """当没有项目时，返回空数组"""
        response = await async_client.get("/api/v1/projects")

        assert response.status_code == 200
        assert response.json() == []

    @pytest.mark.asyncio
    async def test_list_projects_returns_projects_with_new_fields(self, async_client, test_project):
        """返回项目列表时包含新增字段：targetMargin, owner, remarks"""
        response = await async_client.get("/api/v1/projects")

        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1

        project = data[0]
        # 验证新字段存在
        assert "targetMargin" in project
        assert "owner" in project
        assert "remarks" in project
        # 验证其他必需字段
        assert "id" in project
        assert "asacNumber" in project
        assert "projectName" in project
        assert "status" in project

    @pytest.mark.asyncio
    async def test_create_project_with_target_margin(self, async_client):
        """创建项目时可以指定目标利润率"""
        payload = {
            "asacNumber": "TEST-001",
            "customerNumber": "CUST-001",
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
                    "partNumber": "PART-001",
                    "annualVolume": 10000,
                    "description": "测试产品描述"
                }
            ],
            "owners": {
                "sales": "张三",
                "vm": "李四",
                "ie": "王五",
                "pe": "赵六",
                "controlling": "钱七"
            },
            "targetMargin": 15.5  # 目标利润率 15.5%
        }

        response = await async_client.post("/api/v1/projects", json=payload)

        assert response.status_code == 201  # POST 正确返回 201
        data = response.json()
        assert data["targetMargin"] == 15.5
        assert data["asacNumber"] == "TEST-001"

    @pytest.mark.asyncio
    async def test_get_project_by_id(self, async_client, test_project):
        """通过 ID 获取项目详情"""
        response = await async_client.get(f"/api/v1/projects/{test_project.id}")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_project.id
        assert data["projectName"] == test_project.project_name

    @pytest.mark.asyncio
    async def test_update_project_target_margin(self, async_client, test_project):
        """更新项目的目标利润率"""
        payload = {
            "asacNumber": test_project.asac_number,
            "customerNumber": test_project.customer_number,
            "productVersion": test_project.product_version,
            "customerVersion": test_project.customer_version,
            "clientName": test_project.client_name,
            "projectName": test_project.project_name,
            "annualVolume": test_project.annual_volume,
            "description": test_project.description,
            "products": [],
            "owners": {
                "sales": "销售",
                "vm": "项目经理",
                "ie": "工艺",
                "pe": "产品",
                "controlling": "财务"
            },
            "targetMargin": 20.0  # 更新为 20%
        }

        response = await async_client.put(f"/api/v1/projects/{test_project.id}", json=payload)

        assert response.status_code == 200
        data = response.json()
        assert data["targetMargin"] == 20.0

    @pytest.mark.asyncio
    async def test_delete_project(self, async_client, test_project):
        """删除项目"""
        response = await async_client.delete(f"/api/v1/projects/{test_project.id}")

        assert response.status_code == 200

        # 验证项目已删除
        get_response = await async_client.get(f"/api/v1/projects/{test_project.id}")
        assert get_response.status_code == 404


class TestProjectProductRelationship:
    """项目与产品关联测试（新增表）"""

    @pytest.mark.asyncio
    async def test_create_project_product(self, async_client, test_project):
        """创建项目产品关联"""
        payload = {
            "projectId": test_project.id,
            "productName": "新产品",
            "productCode": "PROD-001",
            "productVersion": "V2.0",
            "routeCode": "ROUTE-A"
        }

        response = await async_client.post("/api/v1/project-products", json=payload)

        assert response.status_code == 200
        data = response.json()
        assert data["productName"] == "新产品"
        assert data["routeCode"] == "ROUTE-A"

    @pytest.mark.asyncio
    async def test_get_project_products(self, async_client, test_project):
        """获取项目的所有产品"""
        response = await async_client.get(f"/api/v1/projects/{test_project.id}/products")

        assert response.status_code == 200
        # 返回产品列表
        data = response.json()
        assert isinstance(data, list)
