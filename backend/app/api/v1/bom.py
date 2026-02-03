"""BOM API 路由."""

from sqlalchemy import select
from fastapi import APIRouter, Depends, UploadFile, File, Form
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, Session
from asyncio import to_thread
import pymysql

from app.db.session import get_db
from app.services.bom_parser import BOMParser
from app.schemas.bom import BOMMaterialResponse, BOMProcessResponse
from app.schemas.common import StatusLight
from app.models.material import Material
from app.models.process_rate import ProcessRate
from app.config import get_settings

router = APIRouter()
settings = get_settings()


def _query_materials_sync(material_codes: list[str]) -> dict:
    """同步查询物料价格（在线程池中执行）."""
    materials_with_price = {}
    if not material_codes:
        return materials_with_price

    conn = pymysql.connect(
        host=settings.MYSQL_HOST,
        port=settings.MYSQL_PORT,
        user=settings.MYSQL_USER,
        password=settings.MYSQL_PASSWORD,
        database=settings.MYSQL_DATABASE,
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor
    )

    try:
        with conn.cursor() as cursor:
            placeholders = ','.join(['%s'] * len(material_codes))
            query = f"""
                SELECT item_code, std_price, vave_price, supplier_tier, category
                FROM materials
                WHERE item_code IN ({placeholders})
            """
            cursor.execute(query, material_codes)
            results = cursor.fetchall()

            for row in results:
                materials_with_price[row['item_code']] = {
                    "unit_price": float(row['std_price']) if row['std_price'] else None,
                    "vave_price": float(row['vave_price']) if row['vave_price'] else None,
                    "supplier": row['supplier_tier'] or "",
                    "material": row['category'] or "",
                    "has_history_data": True,
                }
    finally:
        conn.close()

    return materials_with_price


def _query_processes_sync(process_names: list[str]) -> dict:
    """同步查询工艺费率（在线程池中执行）.

    使用新的 MHR 拆分费率结构：
    - 单价 = (std_mhr_var + std_mhr_fix) × standard_time
    - VAVE单价 = (vave_mhr_var + vave_mhr_fix) × standard_time
    """
    processes_with_rate = {}
    if not process_names:
        return processes_with_rate

    conn = pymysql.connect(
        host=settings.MYSQL_HOST,
        port=settings.MYSQL_PORT,
        user=settings.MYSQL_USER,
        password=settings.MYSQL_PASSWORD,
        database=settings.MYSQL_DATABASE,
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor
    )

    try:
        with conn.cursor() as cursor:
            placeholders = ','.join(['%s'] * len(process_names))
            # 使用新的 MHR 拆分字段，同时支持按工艺名称或编码匹配
            query = f"""
                SELECT process_code, process_name, equipment, work_center,
                       std_mhr_var, std_mhr_fix, vave_mhr_var, vave_mhr_fix,
                       std_hourly_rate, vave_hourly_rate, efficiency_factor
                FROM process_rates
                WHERE process_name IN ({placeholders}) OR process_code IN ({placeholders})
            """
            cursor.execute(query, process_names + process_names)
            results = cursor.fetchall()

            for row in results:
                # 优先使用新的 MHR 拆分费率
                if row['std_mhr_var'] is not None and row['std_mhr_fix'] is not None:
                    std_rate = float(row['std_mhr_var']) + float(row['std_mhr_fix'])
                else:
                    std_rate = float(row['std_hourly_rate']) if row['std_hourly_rate'] else None

                if row['vave_mhr_var'] is not None and row['vave_mhr_fix'] is not None:
                    vave_rate = float(row['vave_mhr_var']) + float(row['vave_mhr_fix'])
                else:
                    vave_rate = float(row['vave_hourly_rate']) if row['vave_hourly_rate'] else None

                processes_with_rate[row['process_name']] = {
                    "process_code": row['process_code'],
                    "equipment": row['equipment'] or "",
                    "work_center": row['work_center'] or "",
                    "std_mhr_var": float(row['std_mhr_var']) if row['std_mhr_var'] else None,
                    "std_mhr_fix": float(row['std_mhr_fix']) if row['std_mhr_fix'] else None,
                    "vave_mhr_var": float(row['vave_mhr_var']) if row['vave_mhr_var'] else None,
                    "vave_mhr_fix": float(row['vave_mhr_fix']) if row['vave_mhr_fix'] else None,
                    "unit_price": std_rate,
                    "vave_price": vave_rate,
                    "has_history_data": True,
                }
    finally:
        conn.close()

    return processes_with_rate


@router.post("/parse-test")
async def parse_bom_test(
    file: UploadFile = File(...),
):
    """测试BOM解析（包含测试价格数据）"""
    content = await file.read()

    parser = BOMParser()
    parse_result = parser.parse_excel_file(content)

    # 测试工艺价格数据
    test_process_prices = {
        "重力铸造": {"unit_price": 150.0, "vave_price": 135.0},
        "CNC精加工": {"unit_price": 200.0, "vave_price": 180.0},
        "焊接": {"unit_price": 120.0, "vave_price": 110.0},
        "喷涂": {"unit_price": 80.0, "vave_price": 72.0},
        "尺寸检测": {"unit_price": 100.0, "vave_price": 90.0},
    }

    materials = []
    for idx, m in enumerate(parse_result.materials):
        materials.append({
            "partNumber": m.part_number,
            "partName": m.part_name,
            "quantity": m.quantity,
            "comments": m.comments
        })

    processes = []
    for idx, p in enumerate(parse_result.processes):
        price_data = test_process_prices.get(p.name, {"unit_price": 0, "vave_price": 0})
        processes.append({
            "id": f"P-{idx + 1:03d}",
            "opNo": p.op_no,
            "name": p.name,
            "workCenter": p.work_center,
            "standardTime": p.standard_time,
            "unitPrice": price_data["unit_price"],
            "vavePrice": price_data["vave_price"],
            "hasHistoryData": True
        })

    return JSONResponse(content={
        "status": "completed",
        "materials": materials,
        "processes": processes,
        "summary": {
            "total_materials": len(materials),
            "total_processes": len(processes),
            "matched_processes": len(processes)
        }
    })


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
    import time
    start_time = time.time()

    # 读取文件内容
    content = await file.read()
    print(f"[DEBUG] File read time: {time.time() - start_time:.3f}s")

    # 解析 Excel
    parser = BOMParser()
    parse_result = parser.parse_excel_file(content)
    print(f"[DEBUG] Parse Excel time: {time.time() - start_time:.3f}s")

    # 批量查询物料历史价格（使用同步方式在线程池执行）
    material_codes = [m.part_number for m in parse_result.materials if m.part_number]
    print(f"[DEBUG] Querying materials: {material_codes}")

    materials_with_price = await to_thread(_query_materials_sync, material_codes)
    print(f"[DEBUG] Materials query time: {time.time() - start_time:.3f}s, found: {len(materials_with_price)}")

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
            BOMMaterialResponse(
                id=f"M-{idx + 1:03d}",
                part_number=m.part_number or "",
                part_name=m.part_name or "",
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

    # 获取解析后的工艺数据（从Excel的工艺工作表）
    print(f"[DEBUG] Parsed processes from Excel: {len(parse_result.processes)}")
    for p in parse_result.processes:
        print(f"[DEBUG]   - {p.op_no}: {p.name} @ {p.work_center}, {p.standard_time}h")

    # 直接使用解析出的工艺数据查询费率
    process_names = [p.name for p in parse_result.processes if p.name]
    print(f"[DEBUG] Querying processes: {process_names}")

    processes_with_rate = await to_thread(_query_processes_sync, process_names)
    print(f"[DEBUG] Processes query time: {time.time() - start_time:.3f}s, found: {len(processes_with_rate)}")

    # 构建工艺响应 - 使用 Excel 解析的数据
    processes = []
    for idx, p in enumerate(parse_result.processes):
        rate_data = processes_with_rate.get(p.name, {})
        print(f"[DEBUG] Process {p.name}: rate_data={rate_data}")

        processes.append(
            BOMProcessResponse(
                id=f"P-{idx + 1:03d}",
                op_no=p.op_no or f"{idx + 1:03d}",
                name=p.name,
                work_center=p.work_center or rate_data.get("work_center", ""),
                standard_time=p.standard_time or 1.0,
                unit_price=rate_data.get("unit_price"),
                vave_price=rate_data.get("vave_price"),
                has_history_data=rate_data.get("has_history_data", False),
            )
        )

    print(f"[DEBUG] Total time: {time.time() - start_time:.3f}s")

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
