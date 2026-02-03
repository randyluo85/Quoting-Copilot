from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.api.v1 import projects, bom, costs, project_products, materials, investments, business_case

settings = get_settings()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册 API 路由
app.include_router(projects.router, prefix="/api/v1/projects", tags=["projects"])
app.include_router(project_products.router, prefix="/api/v1/project-products", tags=["project-products"])
app.include_router(bom.router, prefix="/api/v1/bom", tags=["bom"])
app.include_router(costs.router, prefix="/api/v1/cost", tags=["costs"])
app.include_router(materials.router, prefix="/api/v1/materials", tags=["materials"])
app.include_router(investments.router, prefix="/api/v1", tags=["investments"])
app.include_router(business_case.router, prefix="/api/v1", tags=["business-case"])


@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": settings.APP_VERSION}
