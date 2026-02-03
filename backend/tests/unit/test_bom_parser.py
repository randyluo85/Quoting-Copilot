"""BOM Parser 单元测试.

遵循 TDD 原则：
1. RED - 先写失败的测试
2. GREEN - 写最小代码使测试通过
3. REFACTOR - 重构清理
"""

import pytest
from io import BytesIO
from openpyxl import Workbook

from app.services.bom_parser import (
    BOMParser,
    ParsedMaterial,
    ParsedProcess,
    BOMParseResult,
)


class TestBOMParserBasic:
    """BOM Parser 基础功能测试."""

    def test_parse_empty_excel_returns_empty_result(self):
        """测试解析空 Excel 文件返回空结果."""
        # Arrange
        wb = Workbook()
        ws = wb.active
        ws.title = "BOM"

        # 添加表头但没有数据
        headers = [
            "Level",
            "Part Number",
            "Part Name",
            "Version",
            "Type",
            "Status",
            "Material",
            "Supplier",
            "Qty",
            "Unit",
            "Comments",
        ]
        ws.append(headers)

        output = BytesIO()
        wb.save(output)
        output.seek(0)

        # Act
        parser = BOMParser()
        result = parser.parse_excel_file(output.read())

        # Assert
        assert isinstance(result, BOMParseResult)
        assert len(result.materials) == 0
        assert len(result.processes) == 0

    def test_parse_excel_with_single_material(self):
        """测试解析包含单个物料的 Excel."""
        # Arrange
        wb = Workbook()
        ws = wb.active
        ws.title = "BOM Material"

        # 表头
        headers = [
            "Level",
            "Item",
            "Part Number",
            "Part Name",
            "Version",
            "Type",
            "Status",
            "Material",
            "Supplier",
            "Qty",
            "Unit",
            "Comments",
        ]
        ws.append(headers)

        # 数据行
        ws.append([
            "1",
            "100",
            "MAT-TEST-001",
            "测试物料",
            "V1.0",
            "I",
            "N",
            "铝合金",
            "供应商A",
            2.5,
            "kg",
            "铸造级材料",
        ])

        output = BytesIO()
        wb.save(output)
        output.seek(0)

        # Act
        parser = BOMParser()
        result = parser.parse_excel_file(output.read())

        # Assert
        assert len(result.materials) == 1
        material = result.materials[0]
        assert material.part_number == "MAT-TEST-001"
        assert material.part_name == "测试物料"
        assert material.quantity == 2.5
        assert material.material == "铝合金"
        assert material.supplier == "供应商A"
        assert material.comments == "铸造级材料"

    def test_parse_excel_with_multiple_materials(self):
        """测试解析包含多个物料的 Excel."""
        # Arrange
        wb = Workbook()
        ws = wb.active
        ws.title = "BOM"

        headers = [
            "Level",
            "Item",
            "Part Number",
            "Part Name",
            "Version",
            "Type",
            "Status",
            "Material",
            "Supplier",
            "Qty",
            "Unit",
            "Comments",
        ]
        ws.append(headers)

        # 添加多行数据
        ws.append([
            "1", "100", "MAT-001", "物料一", "V1.0", "I", "N",
            "铝", "A", 1.0, "kg", "备注一"
        ])
        ws.append([
            "2", "200", "MAT-002", "物料二", "V1.0", "I", "N",
            "钢", "B", 2.0, "kg", "备注二"
        ])
        ws.append([
            "3", "300", "MAT-003", "物料三", "V1.0", "I", "N",
            "铜", "C", 3.0, "kg", "备注三"
        ])

        output = BytesIO()
        wb.save(output)
        output.seek(0)

        # Act
        parser = BOMParser()
        result = parser.parse_excel_file(output.read())

        # Assert
        assert len(result.materials) == 3
        assert result.materials[0].part_number == "MAT-001"
        assert result.materials[1].part_number == "MAT-002"
        assert result.materials[2].part_number == "MAT-003"


class TestBOMParserColumnDetection:
    """BOM Parser 智能列检测测试."""

    def test_detect_column_mapping_with_part_number_header(self):
        """测试检测包含 'Part Number' 表头的列映射."""
        # Arrange
        wb = Workbook()
        ws = wb.active

        # 使用非标准列顺序
        headers = [
            "Comments",
            "Qty",
            "Part Number",
            "Part Name",
            "Material",
            "Supplier",
        ]
        ws.append(headers)
        ws.append(["备注", 1.5, "MAT-TEST", "测试", "铝", "A"])

        output = BytesIO()
        wb.save(output)
        output.seek(0)

        # Act
        parser = BOMParser()
        result = parser.parse_excel_file(output.read())

        # Assert
        assert len(result.materials) == 1
        assert result.materials[0].part_number == "MAT-TEST"

    def test_detect_column_mapping_with_chinese_headers(self):
        """测试检测中文表头."""
        # Arrange
        wb = Workbook()
        ws = wb.active

        headers = ["层级", "零件号", "零件名称", "数量", "单位", "备注"]
        ws.append(headers)
        ws.append(["1", "MAT-CN-001", "中文测试物料", "5.0", "kg", "中文备注"])

        output = BytesIO()
        wb.save(output)
        output.seek(0)

        # Act
        parser = BOMParser()
        result = parser.parse_excel_file(output.read())

        # Assert
        assert len(result.materials) == 1
        assert result.materials[0].part_number == "MAT-CN-001"
        assert result.materials[0].part_name == "中文测试物料"
        assert result.materials[0].quantity == 5.0


class TestBOMParserEdgeCases:
    """BOM Parser 边界情况测试."""

    def test_skip_empty_rows(self):
        """测试跳过空行."""
        # Arrange
        wb = Workbook()
        ws = wb.active

        headers = ["Part Number", "Part Name", "Version", "Type", "Status", "Qty"]
        ws.append(headers)
        ws.append(["MAT-001", "物料一", "V1.0", "I", "N", 1.0])
        ws.append([])  # 空行
        ws.append(["MAT-002", "物料二", "V1.0", "I", "N", 2.0])
        ws.append([None, None, None, None, None, None])  # None 行

        output = BytesIO()
        wb.save(output)
        output.seek(0)

        # Act
        parser = BOMParser()
        result = parser.parse_excel_file(output.read())

        # Assert
        assert len(result.materials) == 2

    def test_handle_missing_quantity(self):
        """测试处理缺失的数量."""
        # Arrange
        wb = Workbook()
        ws = wb.active

        headers = ["Part Number", "Part Name", "Version", "Type", "Status", "Qty"]
        ws.append(headers)
        ws.append(["MAT-NO-QTY", "无数量物料", "V1.0", "I", "N", None])  # 数量为空
        ws.append(["MAT-001", "正常物料", "V1.0", "I", "N", 1.0])

        output = BytesIO()
        wb.save(output)
        output.seek(0)

        # Act
        parser = BOMParser()
        result = parser.parse_excel_file(output.read())

        # Assert
        assert len(result.materials) == 2
        assert result.materials[0].quantity == 0  # 缺失数量默认为 0
        assert result.materials[1].quantity == 1.0

    def test_handle_invalid_quantity(self):
        """测试处理无效的数量（非数字）."""
        # Arrange
        wb = Workbook()
        ws = wb.active

        headers = ["Part Number", "Part Name", "Version", "Type", "Status", "Qty"]
        ws.append(headers)
        ws.append(["MAT-INVALID", "无效数量物料", "V1.0", "I", "N", "N/A"])  # 字符串数量

        output = BytesIO()
        wb.save(output)
        output.seek(0)

        # Act
        parser = BOMParser()
        result = parser.parse_excel_file(output.read())

        # Assert
        assert len(result.materials) == 1
        assert result.materials[0].quantity == 0  # 无效数量默认为 0

    def test_skip_rows_without_part_number(self):
        """测试跳过没有零件号的行."""
        # Arrange
        wb = Workbook()
        ws = wb.active

        headers = ["Part Number", "Part Name", "Version", "Type", "Status", "Qty"]
        ws.append(headers)
        ws.append([None, "无零件号物料", "V1.0", "I", "N", 1.0])  # 零件号为空
        ws.append(["", "空字符串零件号", "V1.0", "I", "N", 2.0])  # 零件号为空字符串
        ws.append(["MAT-001", "正常物料", "V1.0", "I", "N", 3.0])

        output = BytesIO()
        wb.save(output)
        output.seek(0)

        # Act
        parser = BOMParser()
        result = parser.parse_excel_file(output.read())

        # Assert
        assert len(result.materials) == 1
        assert result.materials[0].part_number == "MAT-001"

    def test_use_default_values_for_missing_columns(self):
        """测试缺失列使用默认值."""
        # Arrange
        wb = Workbook()
        ws = wb.active

        # 只包含必要的列
        headers = ["Part Number", "Part Name", "Version", "Type", "Status"]
        ws.append(headers)
        ws.append(["MAT-MINIMAL", "最小字段物料", "V1.0", "I", "N"])

        output = BytesIO()
        wb.save(output)
        output.seek(0)

        # Act
        parser = BOMParser()
        result = parser.parse_excel_file(output.read())

        # Assert
        assert len(result.materials) == 1
        material = result.materials[0]
        assert material.part_number == "MAT-MINIMAL"
        assert material.quantity == 0  # 默认值
        assert material.unit == "PC"  # 默认值


class TestBOMParserSheetTypeDetection:
    """BOM Parser 工作表类型检测测试."""

    def test_detect_material_sheet_by_keywords(self):
        """测试通过关键字检测物料表."""
        # Arrange
        wb = Workbook()
        ws = wb.active
        ws.title = "Material BOM"

        # 表头包含物料关键字
        headers = ["Bill of Material", "Item", "Part Number"]
        ws.append(headers)
        ws.append(["", "100", "MAT-001"])

        output = BytesIO()
        wb.save(output)
        output.seek(0)

        # Act
        parser = BOMParser()
        result = parser.parse_excel_file(output.read())

        # Assert
        assert len(result.materials) == 1

    def test_detect_process_sheet_by_keywords(self):
        """测试通过关键字检测工艺表."""
        # Arrange
        wb = Workbook()
        ws = wb.active
        ws.title = "Process Sheet"

        headers = ["Operation", "Op No", "Name", "Work Center", "Standard Time"]
        ws.append(headers)
        ws.append(["", "010", "焊接", "焊接车间", 2.5])

        output = BytesIO()
        wb.save(output)
        output.seek(0)

        # Act
        parser = BOMParser()
        result = parser.parse_excel_file(output.read())

        # Assert
        assert len(result.processes) == 1
        assert result.processes[0].op_no == "010"

    def test_detect_chinese_keywords(self):
        """测试检测中文关键字."""
        # Arrange
        wb = Workbook()
        ws = wb.active
        ws.title = "物料表"

        headers = ["零件号", "零件名称", "数量"]
        ws.append(headers)
        ws.append(["MAT-CN", "中文物料", 10])

        output = BytesIO()
        wb.save(output)
        output.seek(0)

        # Act
        parser = BOMParser()
        result = parser.parse_excel_file(output.read())

        # Assert
        assert len(result.materials) == 1


class TestParsedMaterial:
    """ParsedMaterial 值对象测试."""

    def test_parsed_material_is_immutable(self):
        """测试 ParsedMaterial 是不可变的（NamedTuple）."""
        # Arrange & Act
        material = ParsedMaterial(
            level="1",
            part_number="MAT-001",
            part_name="测试",
            version="V1.0",
            type="I",
            status="N",
            material="铝",
            supplier="A",
            quantity=1.0,
            unit="kg",
            comments="备注",
        )

        # Assert - NamedTuple 是不可变的
        with pytest.raises(AttributeError):
            material.part_number = "NEW-001"

    def test_parsed_material_has_all_fields(self):
        """测试 ParsedMaterial 包含所有字段."""
        material = ParsedMaterial(
            level="1",
            part_number="MAT-001",
            part_name="测试",
            version="V1.0",
            type="I",
            status="N",
            material="铝",
            supplier="A",
            quantity=1.5,
            unit="kg",
            comments="备注",
        )

        assert material.level == "1"
        assert material.part_number == "MAT-001"
        assert material.part_name == "测试"
        assert material.version == "V1.0"
        assert material.type == "I"
        assert material.status == "N"
        assert material.material == "铝"
        assert material.supplier == "A"
        assert material.quantity == 1.5
        assert material.unit == "kg"
        assert material.comments == "备注"


class TestParsedProcess:
    """ParsedProcess 值对象测试."""

    def test_parsed_process_is_immutable(self):
        """测试 ParsedProcess 是不可变的."""
        process = ParsedProcess(
            op_no="010",
            name="焊接",
            work_center="焊接车间",
            standard_time=2.5,
            spec="对接焊",
        )

        with pytest.raises(AttributeError):
            process.op_no = "020"

    def test_parsed_process_with_optional_spec(self):
        """测试 ParsedProcess 的可选 spec 字段."""
        # 有 spec
        process_with_spec = ParsedProcess(
            op_no="010",
            name="焊接",
            work_center="焊接车间",
            standard_time=2.5,
            spec="对接焊",
        )
        assert process_with_spec.spec == "对接焊"

        # 无 spec
        process_without_spec = ParsedProcess(
            op_no="020",
            name="机加",
            work_center="机加车间",
            standard_time=1.5,
            spec=None,
        )
        assert process_without_spec.spec is None
