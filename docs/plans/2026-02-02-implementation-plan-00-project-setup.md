# SmartQuote 项目初始化实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 搭建 SmartQuote 项目基础架构：目录结构、Docker 环境、后端骨架、前端骨架

**Architecture:** Docker Compose 编排 MySQL + PostgreSQL + Backend + Frontend

**Tech Stack:** Docker, Python FastAPI, Next.js, Alembic

---

## Task 1: 创建项目根目录结构

**Files:**
- Create: `backend/` 目录及子结构
- Create: `frontend/` 目录及子结构
- Create: `docker-compose.yml`

**Step 1: 创建后端目录结构**

```bash
mkdir -p backend/app/{api,core,models,schemas,services}
mkdir -p backend/tests/{unit,integration,fixtures}
mkdir -p backend/alembic/versions
touch backend/app/__init__.py
touch backend/app/api/__init__.py
touch backend/app/core/__init__.py
touch backend/app/models/__init__.py
touch backend/app/schemas/__init__.py
touch backend/app/services/__init__.py
touch backend/tests/__init__.py
```

**Step 2: 创建前端目录结构**

```bash
mkdir -p frontend/app/{dashboard,components}
mkdir -p frontend/components/ui
mkdir -p frontend/lib
mkdir -p frontend/public
```

**Step 3: 验证目录结构**

Run: `tree -L 3 -I 'node_modules'`
Expected: 显示 backend 和 frontend 目录树

**Step 4: Commit**

```bash
git add backend/ frontend/
git commit -m "feat: create project directory structure"
```

---

## Task 2: 创建 Docker Compose 配置

**Files:**
- Create: `docker-compose.yml`
- Create: `.env.example`

**Step 1: 编写 docker-compose.yml**

```yaml
# docker-compose.yml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: smartquote-mysql
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD:-rootpassword}
      MYSQL_DATABASE: smartquote
      MYSQL_USER: ${MYSQL_USER:-smartquote}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD:-smartpassword}
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  postgres:
    image: pgvector/pgvector:pg16
    container_name: smartquote-postgres
    environment:
      POSTGRES_DB: smartquote_vector
      POSTGRES_USER: ${POSTGRES_USER:-smartquote}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-smartpassword}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-smartquote}"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: smartquote-backend
    depends_on:
      mysql:
        condition: service_healthy
      postgres:
        condition: service_healthy
    environment:
      DATABASE_URL: mysql+aiomysql://${MYSQL_USER:-smartquote}:${MYSQL_PASSWORD:-smartpassword}@mysql:3306/smartquote
      VECTOR_DB_URL: postgresql+asyncpg://${POSTGRES_USER:-smartquote}:${POSTGRES_PASSWORD:-smartpassword}@postgres:5432/smartquote_vector
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: smartquote-frontend
    depends_on:
      - backend
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000

volumes:
  mysql_data:
  postgres_data:
```

**Step 2: 创建环境变量模板**

```bash
# .env.example
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_USER=smartquote
MYSQL_PASSWORD=smartpassword

POSTGRES_USER=smartquote
POSTGRES_PASSWORD=smartpassword

NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Step 3: Commit**

```bash
git add docker-compose.yml .env.example
git commit -m "feat: add docker compose configuration"
```

---

## Task 3: 创建后端基础配置

**Files:**
- Create: `backend/pyproject.toml`
- Create: `backend/Dockerfile`
- Create: `backend/app/core/config.py`
- Create: `backend/app/main.py`

**Step 1: 编写 pyproject.toml**

```toml
# backend/pyproject.toml
[project]
name = "smartquote-backend"
version = "0.1.0"
requires-python = ">=3.10"
dependencies = [
    "fastapi>=0.109.0",
    "uvicorn[standard]>=0.27.0",
    "sqlalchemy>=2.0.25",
    "aiomysql>=0.2.0",
    "asyncpg>=0.29.0",
    "pydantic>=2.5.0",
    "pydantic-settings>=2.1.0",
    "alembic>=1.13.0",
    "openpyxl>=3.1.2",
    "python-multipart>=0.0.6",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.4.0",
    "pytest-asyncio>=0.23.0",
    "httpx>=0.26.0",
    "ruff>=0.1.0",
]

[tool.ruff]
line-length = 100
target-version = "py310"

[tool.ruff.lint]
select = ["E", "F", "I", "N", "W"]
```

**Step 2: 编写 Dockerfile**

```dockerfile
# backend/Dockerfile
FROM python:3.10-slim

WORKDIR /app

# 安装 uv
RUN pip install uv

# 复制依赖文件
COPY pyproject.toml ./

# 安装依赖
RUN uv pip install --system -e .

# 复制应用代码
COPY . .

# 暴露端口
EXPOSE 8000

# 启动命令
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

**Step 3: 编写配置模块**

```python
# backend/app/core/config.py
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Database
    database_url: str = "mysql+aiomysql://smartquote:smartpassword@localhost:3306/smartquote"
    vector_db_url: str = "postgresql+asyncpg://smartquote:smartpassword@localhost:5432/smartquote_vector"

    # API
    api_v1_prefix: str = "/api/v1"

    # CORS
    backend_cors_origins: list[str] = ["http://localhost:3000"]

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
```

**Step 4: 编写主应用入口**

```python
# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings

settings = get_settings()

app = FastAPI(
    title="SmartQuote API",
    description="AI 智能报价系统 - 双轨核算",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.backend_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "SmartQuote API v2.0", "status": "healthy"}


@app.get("/health")
async def health():
    return {"status": "healthy", "database": "connected"}
```

**Step 5: Commit**

```bash
git add backend/
git commit -m "feat: add backend base configuration and main app"
```

---

## Task 4: 创建 Alembic 数据库迁移配置

**Files:**
- Create: `backend/alembic.ini`
- Create: `backend/alembic/env.py`

**Step 1: 编写 alembic.ini**

```ini
# backend/alembic.ini
[alembic]
script_location = alembic
file_template = %%(year)d-%%(month).2d-%%(day).2d_%%(rev)s_%%(slug)s
sqlalchemy.url = mysql+aiomysql://smartquote:smartpassword@localhost:3306/smartquote

[post_write_hooks]

[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic

[logger_root]
level = WARN
handlers = console
qualname =

[logger_sqlalchemy]
level = WARN
handlers =
qualname = sqlalchemy.engine

[logger_alembic]
level = INFO
handlers =
qualname = alembic

[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s
datefmt = %H:%M:%S
```

**Step 2: 编写 env.py**

```python
# backend/alembic/env.py
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
import sys
from pathlib import Path

# 添加项目路径
sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.core.config import get_settings
from app.models import Base  # noqa

settings = get_settings()
config = context.config

# 设置数据库 URL
config.set_main_option("sqlalchemy.url", settings.database_url)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```

**Step 3: 编写 script.py.mako**

```python
# backend/alembic/script.py.mako
"""${message}

Revision ID: ${up_revision}
Revises: ${down_revision | comma,n}
Create Date: ${create_date}

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
${imports if imports else ""}

# revision identifiers, used by Alembic.
revision: str = ${repr(up_revision)}
down_revision: Union[str, None] = ${repr(down_revision)}
branch_labels: Union[str, Sequence[str], None] = ${repr(branch_labels)}
depends_on: Union[str, Sequence[str], None] = ${repr(depends_on)}


def upgrade() -> None:
    ${upgrades if upgrades else "pass"}


def downgrade() -> None:
    ${downgrades if downgrades else "pass"}
```

**Step 4: Commit**

```bash
git add backend/alembic/
git commit -m "feat: add alembic database migration configuration"
```

---

## Task 5: 创建前端基础配置

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/Dockerfile`
- Create: `frontend/next.config.js`
- Create: `frontend/tailwind.config.ts`
- Create: `frontend/tsconfig.json`

**Step 1: 编写 package.json**

```json
{
  "name": "smartquote-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@tanstack/react-query": "^5.17.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.56.0",
    "eslint-config-next": "14.1.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.3.0"
  }
}
```

**Step 2: 编写 Dockerfile**

```dockerfile
# frontend/Dockerfile
FROM node:20-alpine

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制应用代码
COPY . .

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["npm", "run", "dev"]
```

**Step 3: 编写 next.config.js**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://backend:8000/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig
```

**Step 4: 编写 tailwind.config.ts**

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
      },
    },
  },
  plugins: [],
}
export default config
```

**Step 5: 编写 tsconfig.json**

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**Step 6: 创建全局样式**

```css
/* frontend/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --border: 214.3 31.8% 91.4%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

**Step 7: 创建布局和首页**

```typescript
// frontend/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SmartQuote - 智能报价系统',
  description: '双轨核算 AI 报价系统',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
```

```typescript
// frontend/app/page.tsx
export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">SmartQuote MVP</h1>
        <p className="text-muted-foreground">AI 智能报价系统 - 双轨核算</p>
      </div>
    </main>
  )
}
```

**Step 8: Commit**

```bash
git add frontend/
git commit -m "feat: add frontend base configuration"
```

---

## Task 6: 验证环境启动

**Files:** 无

**Step 1: 复制环境变量**

```bash
cp .env.example .env
```

**Step 2: 启动 Docker 服务**

```bash
docker-compose up -d mysql postgres
```

Expected: MySQL 和 PostgreSQL 容器启动并健康

**Step 3: 验证数据库连接**

```bash
# MySQL
docker exec smartquote-mysql mysql -usmartquote -psmartpassword -e "SELECT 1"

# PostgreSQL
docker exec smartquote-postgres psql -U smartquote -d smartquote_vector -c "SELECT 1"
```

Expected: 两者都返回 `1`

**Step 4: 启动后端**

```bash
docker-compose up -d backend
```

**Step 5: 验证后端 API**

```bash
curl http://localhost:8000/
curl http://localhost:8000/health
```

Expected: 返回 JSON 响应

**Step 6: 启动前端**

```bash
docker-compose up -d frontend
```

**Step 7: 验证前端**

访问: http://localhost:3000

Expected: 显示 "SmartQuote MVP" 页面

**Step 8: Commit**

```bash
git add .
git commit -m "chore: verify docker environment setup"
```

---

## ✅ 完成标准

- [ ] 目录结构创建完成
- [ ] Docker Compose 启动成功
- [ ] 后端 API `/` 和 `/health` 可访问
- [ ] 前端页面可访问
- [ ] 数据库连接正常

**下一步:** 执行 `01-material-library.md`（物料库管理）
