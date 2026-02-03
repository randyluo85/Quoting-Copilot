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


class BOMParser:
    """BOM 文件解析器."""

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
                materials.extend(self._parse_material_sheet(ws))
            elif sheet_type == "process":
                processes.extend(self._parse_process_sheet(ws))

        return BOMParseResult(materials=materials, processes=processes)

    def _detect_sheet_type(self, worksheet) -> str:
        """检测工作表类型.

        通过关键字检测工作表包含物料还是工艺数据。
        """
        keywords_material = ["物料", "material", "bom", "item", "零件"]
        keywords_process = ["工艺", "process", "operation", "工序", "op"]

        for row in worksheet.iter_rows(min_row=1, max_row=5, values_only=True):
            if not row:
                continue
            row_text = " ".join(str(cell).lower() for cell in row if cell)

            for kw in keywords_material:
                if kw in row_text:
                    return "material"

            for kw in keywords_process:
                if kw in row_text:
                    return "process"

        return "unknown"

    def _parse_material_sheet(self, worksheet) -> list[ParsedMaterial]:
        """解析物料工作表.

        默认列映射:
        - Col 0: Level (层级)
        - Col 1: Part Number (零件号)
        - Col 2: Part Name (零件名称)
        - Col 3: Version (版本)
        - Col 4: Type (类型)
        - Col 5: Status (状态)
        - Col 6: Material (材质)
        - Col 7: Supplier (供应商)
        - Col 8: Quantity (数量)
        - Col 9: Unit (单位)
        - Col 12: Comments (备注)
        """
        materials = []

        for row in worksheet.iter_rows(min_row=2, values_only=True):
            if not row or not row[1]:
                continue

            # 跳过空行或标题行
            part_number = str(row[1]).strip()
            if not part_number or part_number.lower() in ["", "none", "part number", "零件号"]:
                continue

            materials.append(
                ParsedMaterial(
                    level=str(row[0] or ""),
                    part_number=part_number,
                    part_name=str(row[2] or ""),
                    version=str(row[3] or "1.0"),
                    type=str(row[4] or "原材料"),
                    status=str(row[5] or "可用"),
                    material=str(row[6] or ""),
                    supplier=str(row[7] or ""),
                    quantity=float(row[8] or 0),
                    unit=str(row[9] or "个"),
                    comments=str(row[12] if len(row) > 12 else ""),
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

        for row in worksheet.iter_rows(min_row=2, values_only=True):
            if not row or not row[0]:
                continue

            op_no = str(row[0]).strip()
            if not op_no or op_no.lower() in ["", "none", "op no", "工序号"]:
                continue

            processes.append(
                ParsedProcess(
                    op_no=op_no,
                    name=str(row[1] or ""),
                    work_center=str(row[2] or ""),
                    standard_time=float(row[3] or 0),
                    spec=str(row[4]) if len(row) > 4 and row[4] else None,
                )
            )

        return processes
