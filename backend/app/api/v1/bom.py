"""BOM API 路由."""

from sqlalchemy import select
from fastapi import APIRouter, Depends, UploadFile, File, Form
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.bom_parser import BOMParser
from app.schemas.material import MaterialResponse
from app.schemas.process import ProcessResponse
from app.schemas.common import StatusLight
from app.models.material import Material
from app.models.process_rate import ProcessRate

router = APIRouter()


@router.post("/upload")
async def upload_bom(
    file: UploadFile = File(...),
    project_id: str = Form(...),
    db: AsyncSession = Depends(get_db),
):
    """上传并解析 BOM 文件，自动关联历史价格数据.

    解析流程：
    1. 解析 Excel 文件获取物料和工艺列表
    2. 根据物料编码查询历史价格（std_price, vave_price）
    3. 根据工艺名称查询历史费率（std_hourly_rate, vave_hourly_rate）
    4. 设置状态：GREEN=完全匹配，YELLOW=AI估算，RED=无数据

    Args:
        file: Excel BOM 文件
        project_id: 项目 ID
        db: 数据库会话

    Returns:
        解析结果，包含物料和工艺列表（含价格）
    """
    # 读取文件内容
    content = await file.read()

    # 解析 Excel
    parser = BOMParser()
    parse_result = parser.parse_excel_file(content)

    # 批量查询物料历史价格
    material_codes = [m.part_number for m in parse_result.materials if m.part_number]
    materials_with_price = {}

    if material_codes:
        # 查询所有匹配的物料
        result = await db.execute(
            select(Material).where(Material.item_code.in_(material_codes))
        )
        db_materials = result.scalars().all()

        # 构建价格查询映射（Decimal 转 float）
        for db_mat in db_materials:
            materials_with_price[db_mat.item_code] = {
                "unit_price": float(db_mat.std_price) if db_mat.std_price else None,
                "vave_price": float(db_mat.vave_price) if db_mat.vave_price else None,
                "supplier": db_mat.supplier_tier or "",
                "material": db_mat.category or "",
                "has_history_data": True,
            }

    # 转换物料响应，自动填充价格
    materials = []
    for idx, m in enumerate(parse_result.materials):
        # 尝试从历史数据获取价格
        price_data = materials_with_price.get(m.part_number, {})

        # 判断状态
        if price_data.get("has_history_data"):
            status = StatusLight.GREEN
        elif m.comments:  # 有备注但无历史数据，可能需要AI估算
            status = StatusLight.YELLOW
        else:
            status = StatusLight.RED

        materials.append(
            MaterialResponse(
                id=f"M-{idx + 1:03d}",
                part_number=m.part_number,
                part_name=m.part_name,
                material=m.material or price_data.get("material", ""),
                supplier=m.supplier or price_data.get("supplier", ""),
                quantity=m.quantity,
                unit_price=price_data.get("unit_price"),
                vave_price=price_data.get("vave_price"),
                has_history_data=price_data.get("has_history_data", False),
                comments=m.comments,
                status=status,
            )
        )

    # 解析工艺数据（从 comments 中提取或根据物料推断）
    # 简化版：根据物料 comments 提取工艺关键词
    process_keywords = {
        "折弯": "CNC精加工",
        "弯曲": "CNC精加工",
        "焊接": "焊接",
        "机加": "CNC精加工",
        "铸造": "重力铸造",
        "表面": "喷涂",
        "阳极": "阳极氧化",
        "镀锌": "镀锌",
        "检测": "尺寸检测",
    }

    # 收集所有可能的工艺名称
    detected_processes = set()
    for m in parse_result.materials:
        if m.comments:
            for keyword, process_name in process_keywords.items():
                if keyword in m.comments:
                    detected_processes.add(process_name)

    # 查询工艺费率
    processes_with_rate = {}
    if detected_processes:
        result = await db.execute(
            select(ProcessRate).where(ProcessRate.process_name.in_(list(detected_processes)))
        )
        db_processes = result.scalars().all()

        for db_proc in db_processes:
            processes_with_rate[db_proc.process_name] = {
                "unit_price": float(db_proc.std_hourly_rate) if db_proc.std_hourly_rate else None,
                "vave_price": float(db_proc.vave_hourly_rate) if db_proc.vave_hourly_rate else None,
                "work_center": db_proc.work_center or "",
                "has_history_data": True,
            }

    # 构建工艺响应
    processes = []
    for idx, (proc_name, rate_data) in enumerate(sorted(processes_with_rate.items())):
        processes.append(
            ProcessResponse(
                id=f"P-{idx + 1:03d}",
                op_no=f"{idx + 1:03d}",
                name=proc_name,
                work_center=rate_data.get("work_center", ""),
                standard_time=1.0,  # 默认工时，需要AI或人工调整
                unit_price=rate_data.get("unit_price"),
                vave_price=rate_data.get("vave_price"),
                has_history_data=rate_data.get("has_history_data", False),
            )
        )

    return JSONResponse(
        content={
            "parseId": f"parse-{project_id}",
            "status": "completed",
            "materials": [m.model_dump(by_alias=True) for m in materials],
            "processes": [p.model_dump(by_alias=True) for p in processes],
            "summary": {
                "total_materials": len(materials),
                "matched_materials": sum(1 for m in materials if m.has_history_data),
                "total_processes": len(processes),
                "matched_processes": sum(1 for p in processes if p.has_history_data),
            },
        }
    )
