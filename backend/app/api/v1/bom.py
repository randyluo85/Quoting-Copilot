"""BOM API 路由."""

from sqlalchemy import select
from fastapi import APIRouter, Depends, UploadFile, File, Form, Query
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, Session
from asyncio import to_thread
import pymysql

from app.db.session import get_db
from app.services.bom_parser import BOMParser, MultiProductBOMParser
from app.schemas.bom import (
    BOMMaterialResponse, BOMProcessResponse,
    ProductInfoSchema, MaterialSchema, ProcessSchema,
    ProductBOMResultSchema, MultiProductBOMParseResultSchema,
    BOMConfirmCreateRequest, BOMPreviewResponse
)
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
            # 使用新的 MHR 拆分字段，同时支持按工艺名称或编码匹配
            # 分别为 process_name 和 process_code 构建占位符
            name_placeholders = ','.join(['%s'] * len(process_names))
            code_placeholders = ','.join(['%s'] * len(process_names))
            query = f"""
                SELECT process_code, process_name, equipment, work_center,
                       std_mhr_var, std_mhr_fix, vave_mhr_var, vave_mhr_fix,
                       std_hourly_rate, vave_hourly_rate, efficiency_factor
                FROM process_rates
                WHERE process_name IN ({name_placeholders}) OR process_code IN ({code_placeholders})
            """
            all_params = process_names + process_names
            cursor.execute(query, all_params)
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
    """上传并解析 BOM 文件，支持多产品 BOM，自动关联历史价格数据.

    解析流程：
    1. 使用 MultiProductBOMParser 解析 Excel 文件（支持多 Sheet）
    2. 根据物料编码查询历史价格（std_price, vave_price）
    3. 根据工艺名称查询历史费率（std_hourly_rate, vave_hourly_rate）
    4. 设置状态：GREEN=完全匹配，YELLOW=AI估算，RED=无数据
    5. 汇总所有产品的物料和工艺返回

    Args:
        file: Excel BOM 文件（可以是单产品或多产品）
        project_id: 项目 ID
        db: 数据库会话

    Returns:
        解析结果，包含所有产品的物料和工艺列表（含价格）
    """
    import time
    start_time = time.time()

    # 读取文件内容
    content = await file.read()
    print(f"[DEBUG] File read time: {time.time() - start_time:.3f}s")

    # 使用多产品解析器解析 Excel
    parser = MultiProductBOMParser()
    parse_result = parser.parse_excel_file(content)
    print(f"[DEBUG] Parse Excel time: {time.time() - start_time:.3f}s")
    print(f"[DEBUG] Detected {parse_result.total_products} products, {parse_result.total_materials} materials")

    # 汇总所有产品的物料和工艺
    all_materials = []
    all_processes = []
    material_idx = 0
    process_idx = 0

    for product in parse_result.products:
        # 收集所有物料
        for m in product.materials:
            all_materials.append(m)
        # 收集所有工艺
        for p in product.processes:
            all_processes.append(p)

    # 批量查询物料历史价格
    material_codes = [m.part_number for m in all_materials if m.part_number]
    print(f"[DEBUG] Querying materials: {material_codes}")

    materials_with_price = await to_thread(_query_materials_sync, material_codes)
    print(f"[DEBUG] Materials query time: {time.time() - start_time:.3f}s, found: {len(materials_with_price)}")

    # 转换物料响应，自动填充价格
    materials = []
    for idx, m in enumerate(all_materials):
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
                unit=m.unit,
                unit_price=price_data.get("unit_price"),
                vave_price=price_data.get("vave_price"),
                has_history_data=price_data.get("has_history_data", False),
                comments=m.comments,
                status=status,
            )
        )

    # 获取解析后的工艺数据
    print(f"[DEBUG] Parsed processes from Excel: {len(all_processes)}")

    # 查询工艺费率
    process_names = [p.name for p in all_processes if p.name]
    print(f"[DEBUG] Querying processes: {process_names}")

    processes_with_rate = await to_thread(_query_processes_sync, process_names)
    print(f"[DEBUG] Processes query time: {time.time() - start_time:.3f}s, found: {len(processes_with_rate)}")

    # 构建工艺响应
    processes = []
    for idx, p in enumerate(all_processes):
        rate_data = processes_with_rate.get(p.name, {})

        # 计算工序总成本：费率 × 标准工时
        standard_time = p.standard_time or 1.0
        hourly_rate = rate_data.get("unit_price")
        vave_hourly_rate = rate_data.get("vave_price")

        unit_price = None
        vave_price = None
        if hourly_rate is not None:
            unit_price = round(hourly_rate * standard_time, 2)
        if vave_hourly_rate is not None:
            vave_price = round(vave_hourly_rate * standard_time, 2)

        processes.append(
            BOMProcessResponse(
                id=f"P-{idx + 1:03d}",
                op_no=p.op_no or f"{idx + 1:03d}",
                name=p.name,
                work_center=p.work_center or rate_data.get("work_center", ""),
                standard_time=standard_time,
                unit_price=unit_price,
                vave_price=vave_price,
                has_history_data=rate_data.get("has_history_data", False),
            )
        )

    print(f"[DEBUG] Total time: {time.time() - start_time:.3f}s")

    # 按产品分组物料和工艺数据
    # 注意：需要按产品顺序重新分配带价格的物料数据
    products_grouped = []
    global_material_idx = 0
    global_process_idx = 0

    for product in parse_result.products:
        # 获取该产品的原始物料数量
        product_material_count = len(product.materials)

        # 从全局物料列表中取出该产品的物料（按顺序）
        product_materials = []
        for _ in range(product_material_count):
            if global_material_idx < len(materials):
                product_materials.append(materials[global_material_idx].model_dump(by_alias=True))
                global_material_idx += 1

        # 获取该产品的工艺
        product_process_count = len(product.processes)
        product_processes = []
        for _ in range(product_process_count):
            if global_process_idx < len(processes):
                product_processes.append(processes[global_process_idx].model_dump(by_alias=True))
                global_process_idx += 1

        products_grouped.append({
            "product_code": product.product_info.product_code,
            "product_name": product.product_info.product_name,
            "product_number": product.product_info.product_number,
            "customer_number": product.product_info.customer_number,
            "material_count": len(product_materials),
            "process_count": len(product_processes),
            "materials": product_materials,
            "processes": product_processes,
        })

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
                "total_products": parse_result.total_products,
                "products": [
                    {
                        "product_code": p.product_info.product_code,
                        "product_name": p.product_info.product_name,
                        "material_count": p.product_info.material_count,
                    }
                    for p in parse_result.products
                ],
            },
            # 按产品分组的数据
            "products_grouped": products_grouped,
        }
    )


# ==================== 多产品 BOM 解析 API ====================

@router.post("/parse-preview")
async def parse_bom_preview(
    file: UploadFile = File(...),
    project_id: str = Query(..., alias="projectId"),
    db: AsyncSession = Depends(get_db)
):
    """解析多产品 BOM 文件，返回预览结果（不创建数据）.

    两步流程的第一步：上传 → 解析 → 返回预览

    Args:
        file: Excel BOM 文件
        project_id: 关联的项目 ID

    Returns:
        BOMPreviewResponse: 包含所有产品的预览数据
    """
    content = await file.read()

    parser = MultiProductBOMParser()
    result = parser.parse_excel_file(content)

    # 转换为 Schema 格式
    products_schema = []
    for product in result.products:
        materials_schema = [
            MaterialSchema(
                level=m.level,
                part_number=m.part_number,
                part_name=m.part_name,
                version=m.version,
                type=m.type,
                status=m.status,
                material=m.material,
                supplier=m.supplier,
                quantity=m.quantity,
                unit=m.unit,
                comments=m.comments
            )
            for m in product.materials
        ]

        processes_schema = [
            ProcessSchema(
                op_no=p.op_no,
                name=p.name,
                work_center=p.work_center,
                standard_time=p.standard_time,
                spec=p.spec
            )
            for p in product.processes
        ]

        products_schema.append(ProductBOMResultSchema(
            product_info=ProductInfoSchema(
                product_code=product.product_info.product_code,
                product_name=product.product_info.product_name,
                product_number=product.product_info.product_number,
                product_version=product.product_info.product_version,
                customer_version=product.product_info.customer_version,
                customer_number=product.product_info.customer_number,
                issue_date=product.product_info.issue_date,
                material_count=product.product_info.material_count,
                process_count=product.product_info.process_count
            ),
            materials=materials_schema,
            processes=processes_schema
        ))

    response = BOMPreviewResponse(
        project_id=project_id,
        products=products_schema,
        total_products=result.total_products,
        total_materials=result.total_materials,
        parse_warnings=result.parse_warnings
    )

    return JSONResponse(content=response.model_dump(by_alias=True, mode='json'))


@router.post("/confirm-create")
async def confirm_create_products(
    request: BOMConfirmCreateRequest,
    db: AsyncSession = Depends(get_db)
):
    """确认创建产品及 BOM 数据.

    两步流程的第二步：确认 → 创建产品 + 物料

    Args:
        request: 包含产品和物料数据的创建请求

    Returns:
        创建结果摘要
    """
    from app.models.project_product import ProjectProduct
    from app.models.product_material import ProductMaterial
    import uuid
    from datetime import datetime

    created_products = []
    total_materials = 0

    for product_data in request.products:
        # 1. 创建 ProjectProduct 记录
        product_id = str(uuid.uuid4())
        project_product = ProjectProduct(
            id=product_id,
            project_id=request.project_id,
            product_name=product_data.product_info.product_name or product_data.product_info.product_code,
            product_code=product_data.product_info.product_code,
            product_version=product_data.product_info.product_version,
            route_code=None,  # 工艺路线代码待后续添加
            bom_file_path=None,
            created_at=datetime.utcnow()
        )
        db.add(project_product)

        # 先 flush 确保 ProjectProduct 插入到数据库（满足外键约束）
        await db.flush()

        # 2. 创建 ProductMaterial 记录
        for material_data in product_data.materials:
            material_id = str(uuid.uuid4())
            product_material = ProductMaterial(
                id=material_id,
                project_product_id=product_id,
                material_id=None,  # 关联到 materials 表的 ID（后续可匹配）
                material_level=int(material_data.level) if material_data.level.isdigit() else None,
                material_name=material_data.part_name,
                material_type=material_data.type,
                quantity=float(material_data.quantity),
                unit=material_data.unit,
                std_cost=None,  # 待后续成本计算填充
                vave_cost=None,
                confidence=None,
                remarks=material_data.comments,
                created_at=datetime.utcnow()
            )
            db.add(product_material)
            total_materials += 1

        created_products.append({
            "id": product_id,
            "product_code": product_data.product_info.product_code,
            "product_name": product_data.product_info.product_name,
            "material_count": len(product_data.materials)
        })

    # 提交所有更改
    await db.commit()

    return JSONResponse(content={
        "status": "success",
        "message": f"成功创建 {len(created_products)} 个产品，共 {total_materials} 条物料记录",
        "created_products": created_products,
        "total_products": len(created_products),
        "total_materials": total_materials
    })
