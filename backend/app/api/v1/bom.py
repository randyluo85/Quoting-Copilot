"""BOM API 路由."""

from fastapi import APIRouter, Depends, UploadFile, File, Form
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.bom_parser import BOMParser
from app.schemas.material import MaterialResponse
from app.schemas.common import StatusLight

router = APIRouter()


@router.post("/upload")
async def upload_bom(
    file: UploadFile = File(...),
    project_id: str = Form(...),
    db: AsyncSession = Depends(get_db),
):
    """上传并解析 BOM 文件.

    Args:
        file: Excel BOM 文件
        project_id: 项目 ID
        db: 数据库会话

    Returns:
        解析结果，包含物料和工艺列表
    """
    # 读取文件内容
    content = await file.read()

    # 解析 Excel
    parser = BOMParser()
    parse_result = parser.parse_excel_file(content)

    # 转换为响应格式
    materials = []
    for idx, m in enumerate(parse_result.materials):
        materials.append(
            MaterialResponse(
                id=f"M-{idx + 1:03d}",
                part_number=m.part_number,
                part_name=m.part_name,
                material=m.material,
                supplier=m.supplier,
                quantity=m.quantity,
                unit_price=None,
                vave_price=None,
                has_history_data=False,
                comments=m.comments,
                status=StatusLight.RED,
            )
        )

    # TODO: 转换工艺数据

    return JSONResponse(
        content={
            "parseId": f"parse-{project_id}",
            "status": "completed",
            "materials": [m.model_dump(by_alias=True) for m in materials],
            "processes": [],
        }
    )
