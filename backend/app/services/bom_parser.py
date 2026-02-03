"""BOM 文件解析服务."""

from typing import NamedTuple
from openpyxl import load_workbook


class ParsedMaterial(NamedTuple):
    """解析后的物料行."""

    level: str
    part_number: str
    part_name: str
    version: str
    type: str
    status: str
    material: str
    supplier: str
    quantity: float
    unit: str
    comments: str


class ParsedProcess(NamedTuple):
    """解析后的工艺行."""

    op_no: str
    name: str
    work_center: str
    standard_time: float
    spec: str | None


class BOMParseResult(NamedTuple):
    """BOM 解析结果."""

    materials: list[ParsedMaterial]
    processes: list[ParsedProcess]


class ColumnMapping(NamedTuple):
    """列映射配置."""

    level: int
    part_number: int
    part_name: int
    version: int
    type: int
    status: int
    material: int
    supplier: int
    quantity: int
    unit: int
    comments: int


class BOMParser:
    """BOM 文件解析器 - 支持智能列检测."""

    # 默认列映射（原始格式）
    DEFAULT_MAPPING = ColumnMapping(
        level=0,
        part_number=1,
        part_name=2,
        version=3,
        type=4,
        status=5,
        material=6,
        supplier=7,
        quantity=8,
        unit=9,
        comments=12,
    )

    # 实际 BOM 文件列映射（基于 tests/files/bom.xlsx）
    ACTUAL_BOM_MAPPING = ColumnMapping(
        level=0,
        part_number=4,
        part_name=5,
        version=6,
        type=7,
        status=8,
        material=9,
        supplier=10,
        quantity=11,
        unit=12,
        comments=13,
    )

    def parse_excel_file(self, file_content: bytes) -> BOMParseResult:
        """解析 Excel BOM 文件（从内存）.

        Args:
            file_content: Excel 文件的字节内容

        Returns:
            BOMParseResult: 解析后的物料和工艺列表
        """
        import io

        wb = load_workbook(filename=io.BytesIO(file_content), read_only=True)

        materials: list[ParsedMaterial] = []
        processes: list[ParsedProcess] = []

        for sheet_name in wb.sheetnames:
            ws = wb[sheet_name]
            sheet_type = self._detect_sheet_type(ws)

            if sheet_type == "material":
                # 智能检测列映射
                header_row, mapping = self._detect_column_mapping(ws)
                materials.extend(self._parse_material_sheet(ws, header_row, mapping))
            elif sheet_type == "process":
                processes.extend(self._parse_process_sheet(ws))

        return BOMParseResult(materials=materials, processes=processes)

    def _detect_sheet_type(self, worksheet) -> str:
        """检测工作表类型.

        通过关键字检测工作表包含物料还是工艺数据。
        """
        keywords_material = ["物料", "material", "bom", "item", "零件", "bill of material"]
        keywords_process = ["工艺", "process", "operation", "工序", "op"]

        # 排除的信息类 sheet
        exclude_keywords = ["product info", "产品信息", "产品名称"]

        for row in worksheet.iter_rows(min_row=1, max_row=10, values_only=True):
            if not row:
                continue
            row_text = " ".join(str(cell).lower() for cell in row if cell)

            # 先检查是否为排除的 sheet
            for kw in exclude_keywords:
                if kw in row_text:
                    return "info"

            for kw in keywords_material:
                if kw in row_text:
                    return "material"

            for kw in keywords_process:
                if kw in row_text:
                    return "process"

        return "unknown"

    def _detect_column_mapping(self, worksheet) -> tuple[int, ColumnMapping]:
        """智能检测列映射和表头行位置.

        Returns:
            (header_row, column_mapping): 表头行号和列映射
        """
        # 查找表头行（包含 "Part Number" 或 "零件号" 的行）
        header_row = 1
        for i, row in enumerate(worksheet.iter_rows(min_row=1, max_row=10, values_only=True), 1):
            row_text = " ".join(str(cell).lower() for cell in row if cell)
            if "part number" in row_text or "零件号" in row_text:
                header_row = i
                break

        # 检测列位置
        col_map = {}
        for col_idx, cell in enumerate(worksheet[header_row]):
            if cell.value is None:
                continue
            cell_lower = str(cell.value).lower()

            if "part number" in cell_lower or "零件号" in cell_lower:
                col_map["part_number"] = col_idx
            elif "part name" in cell_lower or "零件名称" in cell_lower:
                col_map["part_name"] = col_idx
            elif "ver" in cell_lower and "version" not in cell_lower:
                col_map["version"] = col_idx
            elif "qty" in cell_lower or "quantity" in cell_lower or "数量" in cell_lower:
                col_map["quantity"] = col_idx
            elif "unit" in cell_lower or "单位" in cell_lower:
                col_map["unit"] = col_idx
            elif "comments" in cell_lower or "备注" in cell_lower or "comment" in cell_lower:
                col_map["comments"] = col_idx
            elif "material" in cell_lower and "supplier" not in cell_lower:
                col_map["material"] = col_idx
            elif "supplier" in cell_lower or "供应商" in cell_lower:
                col_map["supplier"] = col_idx
            elif "typ" in cell_lower and "part" not in cell_lower:
                col_map["type"] = col_idx
            elif "st" in cell_lower and len(cell_lower) <= 3:
                col_map["status"] = col_idx
            elif "level" in cell_lower or "层级" in cell_lower:
                col_map["level"] = col_idx

        # 如果检测到足够的关键列，使用检测到的映射
        if len(col_map) >= 5:
            return header_row, ColumnMapping(
                level=col_map.get("level", 0),
                part_number=col_map.get("part_number", 1),
                part_name=col_map.get("part_name", 2),
                version=col_map.get("version", 3),
                type=col_map.get("type", 4),
                status=col_map.get("status", 5),
                material=col_map.get("material", 6),
                supplier=col_map.get("supplier", 7),
                quantity=col_map.get("quantity", 8),
                unit=col_map.get("unit", 9),
                comments=col_map.get("comments", 10),
            )

        # 否则使用默认映射
        return header_row, self.DEFAULT_MAPPING

    def _parse_material_sheet(
        self, worksheet, header_row: int, mapping: ColumnMapping
    ) -> list[ParsedMaterial]:
        """解析物料工作表.

        Args:
            worksheet: 工作表对象
            header_row: 表头行号
            mapping: 列映射配置
        """
        materials = []

        for row in worksheet.iter_rows(min_row=header_row + 1, values_only=True):
            if not row or len(row) <= max(mapping.part_number, mapping.quantity):
                continue

            # 获取零件号
            part_number_cell = row[mapping.part_number] if mapping.part_number < len(row) else None
            if not part_number_cell:
                continue

            part_number = str(part_number_cell).strip()
            # 跳过空值或表头行
            if not part_number or part_number.lower() in ["", "none", "part number", "零件号"]:
                continue

            # 获取数量
            quantity = 0
            if mapping.quantity < len(row) and row[mapping.quantity] is not None:
                try:
                    quantity = float(row[mapping.quantity])
                except (ValueError, TypeError):
                    quantity = 0

            materials.append(
                ParsedMaterial(
                    level=str(row[mapping.level] or "") if mapping.level < len(row) else "1",
                    part_number=part_number,
                    part_name=str(row[mapping.part_name] or "") if mapping.part_name < len(row) else "",
                    version=str(row[mapping.version] or "1.0") if mapping.version < len(row) else "1.0",
                    type=str(row[mapping.type] or "I") if mapping.type < len(row) else "I",
                    status=str(row[mapping.status] or "N") if mapping.status < len(row) else "N",
                    material=str(row[mapping.material] or "") if mapping.material < len(row) else "",
                    supplier=str(row[mapping.supplier] or "") if mapping.supplier < len(row) else "",
                    quantity=quantity,
                    unit=str(row[mapping.unit] or "PC") if mapping.unit < len(row) else "PC",
                    comments=str(row[mapping.comments] or "") if mapping.comments < len(row) else "",
                )
            )

        return materials

    def _parse_process_sheet(self, worksheet) -> list[ParsedProcess]:
        """解析工艺工作表.

        默认列映射:
        - Col 0: Op No (工序号)
        - Col 1: Name (工序名称)
        - Col 2: Work Center (工作中心)
        - Col 3: Standard Time (标准工时)
        - Col 4: Spec (规格说明)
        """
        processes = []

        # 查找表头行
        header_row = 1
        for i, row in enumerate(worksheet.iter_rows(min_row=1, max_row=10, values_only=True), 1):
            row_text = " ".join(str(cell).lower() for cell in row if cell)
            if "op no" in row_text or "工序号" in row_text or "operation" in row_text:
                header_row = i
                break

        for row in worksheet.iter_rows(min_row=header_row + 1, values_only=True):
            if not row or not row[0]:
                continue

            op_no = str(row[0]).strip()
            if not op_no or op_no.lower() in ["", "none", "op no", "工序号"]:
                continue

            # 安全获取各列数据，处理行数据不完整的情况
            name = str(row[1]) if len(row) > 1 and row[1] else ""
            work_center = str(row[2]) if len(row) > 2 and row[2] else ""

            # 标准工时可能是分钟或小时，存储为分钟数
            standard_time = 0
            if len(row) > 3 and row[3] is not None:
                try:
                    standard_time = float(row[3])
                except (ValueError, TypeError):
                    standard_time = 0

            spec = str(row[4]) if len(row) > 4 and row[4] else None

            processes.append(
                ParsedProcess(
                    op_no=op_no,
                    name=name,
                    work_center=work_center,
                    standard_time=standard_time,
                    spec=spec,
                )
            )

        return processes
