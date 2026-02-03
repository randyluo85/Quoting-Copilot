# SmartQuote Backend

SmartQuote AI 双轨报价系统后端服务。

## 技术栈

- **Python**: 3.10+
- **框架**: FastAPI
- **数据库**: MySQL + PostgreSQL
- **缓存**: Redis
- **AI**: 通义千问 (阿里云 DashScope)

## 安装依赖

```bash
uv pip install -e ".[dev]"
```

## 运行开发服务器

```bash
uvicorn app.main:app --reload --port 8000
```

## 运行测试

```bash
pytest app/tests/ -v --cov=app
```

## 代码格式化

```bash
ruff format app/
ruff check app/ --fix
```
