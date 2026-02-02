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


# 导入并注册路由
from app.api.v1.materials import router as materials_router

app.include_router(materials_router, prefix=settings.api_v1_prefix)
