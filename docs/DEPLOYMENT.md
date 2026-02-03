# SmartQuote 部署运维指南

| 版本号 | 创建时间 | 更新时间 | 文档主题 | 创建人 |
|--------|----------|----------|----------|--------|
| v1.0   | 2026-02-03 | 2026-02-03 | SmartQuote 部署运维指南 | Randy Luo |

---

## 1. 本地开发环境

### 1.1 前置要求

| 组件 | 版本要求 | 用途 |
|------|----------|------|
| Node.js | >= 20.x | 前端构建 |
| Python | >= 3.10 | 后端运行 |
| Docker | >= 24.x | 容器化服务 |
| MySQL | >= 8.0 | 主数据库 |
| PostgreSQL | >= 14.x | 向量数据库 |
| Redis | >= 7.x | 缓存层 |

### 1.2 启动顺序

```bash
# 1. 启动基础服务（MySQL, PostgreSQL, Redis）
docker-compose up -d mysql postgres redis

# 2. 初始化数据库
cd backend
python scripts/init_db.py

# 3. 启动后端
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 4. 启动前端（新终端）
cd frontend
npm run dev
```

### 1.3 服务地址

| 服务 | 地址 | 说明 |
|------|------|------|
| 前端 | http://localhost:5173 | Vite Dev Server |
| 后端 API | http://localhost:8000 | FastAPI |
| API 文档 | http://localhost:8000/docs | Swagger UI |
| MySQL | localhost:3306 | 默认 root/root |
| PostgreSQL | localhost:5432 | 默认 postgres/postgres |
| Redis | localhost:6379 | 无密码 |

---

## 2. Docker Compose 一键部署

### 2.1 完整配置

**文件:** `docker-compose.yml`

```yaml
version: '3.8'

services:
  # MySQL - 主数据库
  mysql:
    image: mysql:8.0
    container_name: smartquote-mysql
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD:-root}
      MYSQL_DATABASE: smartquote
      MYSQL_USER: smartquote
      MYSQL_PASSWORD: ${DB_PASSWORD:-smartquote}
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql
      - ./backend/scripts/init.sql:/docker-entrypoint-initdb.d/init.sql
    command: --default-authentication-plugin=mysql_native_password
    networks:
      - smartquote-net

  # PostgreSQL - 向量数据库
  postgres:
    image: pgvector/pgvector:pg14
    container_name: smartquote-postgres
    environment:
      POSTGRES_DB: smartquote_vector
      POSTGRES_USER: smartquote
      POSTGRES_PASSWORD: ${DB_PASSWORD:-smartquote}
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./backend/scripts/init_vector.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - smartquote-net

  # Redis - 缓存层
  redis:
    image: redis:7-alpine
    container_name: smartquote-redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - smartquote-net

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: smartquote-backend
    environment:
      DATABASE_URL: mysql://smartquote:${DB_PASSWORD:-smartquote}@mysql:3306/smartquote
      VECTOR_DB_URL: postgresql://smartquote:${DB_PASSWORD:-smartquote}@postgres:5432/smartquote_vector
      REDIS_URL: redis://redis:6379/0
      DASHSCOPE_API_KEY: ${DASHSCOPE_API_KEY}
    ports:
      - "8000:8000"
    depends_on:
      - mysql
      - postgres
      - redis
    networks:
      - smartquote-net

  # Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: smartquote-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - smartquote-net

volumes:
  mysql-data:
  postgres-data:
  redis-data:

networks:
  smartquote-net:
    driver: bridge
```

### 2.2 启动命令

```bash
# 复制环境变量模板
cp .env.example .env
# 编辑 .env 文件，填入真实配置

# 构建并启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 停止并清理数据
docker-compose down -v
```

---

## 3. 环境变量配置

### 3.1 后端环境变量

**文件:** `backend/.env`

```bash
# 数据库配置
DATABASE_URL=mysql://smartquote:password@localhost:3306/smartquote
VECTOR_DB_URL=postgresql://smartquote:password@localhost:5432/smartquote_vector

# Redis 配置
REDIS_URL=redis://localhost:6379/0

# AI 服务配置
DASHSCOPE_API_KEY=sk-xxxxxxxxxxxxxxxx
DASHSCOPE_MODEL=qwen-plus
DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1

# 应用配置
APP_ENV=development
DEBUG=true
SECRET_KEY=your-secret-key-here
ALLOWED_ORIGINS=http://localhost:5173

# 缓存配置
CACHE_TTL_MATERIAL=3600
CACHE_TTL_LLM=86400
```

### 3.2 前端环境变量

**文件:** `frontend/.env`

```bash
# API 地址
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_WS_URL=ws://localhost:8000/ws

# 应用配置
VITE_APP_NAME=SmartQuote
VITE_APP_VERSION=2.0.0
```

---

## 4. 数据库迁移

### 4.1 Alembic 配置

```bash
# 初始化 Alembic（首次）
cd backend
alembic init alembic

# 创建迁移脚本
alembic revision --autogenerate -m "Initial schema"

# 执行迁移
alembic upgrade head

# 回滚
alembic downgrade -1
```

### 4.2 初始化脚本

**文件:** `backend/scripts/init_db.py`

```python
"""初始化数据库脚本"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.models import Base
from app.core.config import settings

async def init_db():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    print("Database initialized successfully!")

if __name__ == "__main__":
    asyncio.run(init_db())
```

---

## 5. 生产环境清单

### 5.1 服务器要求

| 组件 | 最低配置 | 推荐配置 |
|------|----------|----------|
| CPU | 4 核 | 8 核+ |
| 内存 | 8 GB | 16 GB+ |
| 磁盘 | 100 GB SSD | 500 GB SSD |
| 操作系统 | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |

### 5.2 安全配置检查

- [ ] 修改所有默认密码
- [ ] 配置防火墙规则
- [ ] 启用 HTTPS/TLS
- [ ] 配置 CORS 白名单
- [ ] 启用 API 速率限制
- [ ] 配置日志脱敏

### 5.3 备份策略

| 数据类型 | 备份频率 | 保留时间 | 备份方式 |
|----------|----------|----------|----------|
| MySQL 数据库 | 每日 | 30 天 | mysqldump |
| PostgreSQL 数据库 | 每日 | 30 天 | pg_dump |
| Redis 缓存 | 每小时 | 7 天 | RDB 快照 |
| 上传文件 | 实时 | 永久 | 对象存储同步 |

---

## 6. 监控与日志

### 6.1 日志配置

```python
# backend/app/core/logging.py
import logging

LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "default",
        },
        "file": {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": "logs/smartquote.log",
            "maxBytes": 10485760,  # 10MB
            "backupCount": 5,
            "formatter": "default",
        },
    },
    "root": {
        "level": "INFO",
        "handlers": ["console", "file"],
    },
}
```

### 6.2 健康检查端点

```python
# backend/app/api/health.py
from fastapi import APIRouter
from sqlalchemy import text

router = APIRouter()

@router.get("/health")
async def health_check():
    """健康检查端点"""
    checks = {
        "status": "healthy",
        "services": {}
    }

    # 检查数据库
    try:
        db.execute(text("SELECT 1"))
        checks["services"]["database"] = "ok"
    except Exception as e:
        checks["services"]["database"] = f"error: {str(e)}"
        checks["status"] = "unhealthy"

    # 检查 Redis
    try:
        redis.ping()
        checks["services"]["redis"] = "ok"
    except Exception as e:
        checks["services"]["redis"] = f"error: {str(e)}"
        checks["status"] = "unhealthy"

    return checks
```

---

## 7. 故障排查

| 问题 | 可能原因 | 解决方法 |
|------|----------|----------|
| 后端无法启动 | 数据库连接失败 | 检查 DATABASE_URL，确认数据库服务运行 |
| BOM 解析失败 | LLM 服务无响应 | 检查 DASHSCOPE_API_KEY，确认网络连通 |
| 前端空白 | API 地址错误 | 检查 VITE_API_BASE_URL 配置 |
| 计算结果异常 | Redis 缓存损坏 | 清空缓存：`redis-cli FLUSHALL` |

---

## 8. 相关文档

- [docs/TESTING_STRATEGY.md](TESTING_STRATEGY.md) - 测试策略
- [docs/API_REFERENCE.md](API_REFERENCE.md) - API 参考
- [PROJECT_CONTEXT.md](../PROJECT_CONTEXT.md) - 项目上下文

---

**文档结束**
