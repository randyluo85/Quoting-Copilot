# backend/app/services/business_case_service.py
"""Business Case 计算服务."""
from __future__ import annotations

import uuid
from decimal import Decimal
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.business_case import BusinessCaseParams, BusinessCaseYears
from app.models.quote_summary import QuoteSummary
from app.schemas.business_case import (
    BusinessCaseParamsCreate,
    BusinessCaseParamsUpdate,
    BusinessCaseParamsResponse,
    FinancialYearDataCreate,
    BusinessCaseResponse,
)


class BusinessCaseService:
    """Business Case 计算服务."""

    def __init__(self, db: AsyncSession):
        self.db = db

    # ============ BC 参数管理 ============

    async def create_params(
        self, data: BusinessCaseParamsCreate
    ) -> BusinessCaseParamsResponse:
        """创建 BC 参数."""
        params = BusinessCaseParams(
            id=str(uuid.uuid4()),
            **data.model_dump()
        )
        self.db.add(params)
        await self.db.commit()
        await self.db.refresh(params)
        return BusinessCaseParamsResponse.model_validate(params)

    async def get_params(self, project_id: str) -> BusinessCaseParamsResponse | None:
        """获取项目 BC 参数."""
        result = await self.db.execute(
            select(BusinessCaseParams).where(BusinessCaseParams.project_id == project_id)
        )
        params = result.scalar_one_or_none()
        return BusinessCaseParamsResponse.model_validate(params) if params else None

    async def update_params(
        self, project_id: str, data: BusinessCaseParamsUpdate
    ) -> BusinessCaseParamsResponse | None:
        """更新 BC 参数."""
        result = await self.db.execute(
            select(BusinessCaseParams).where(BusinessCaseParams.project_id == project_id)
        )
        params = result.scalar_one_or_none()
        if not params:
            return None

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            if hasattr(params, key):
                setattr(params, key, value)

        await self.db.commit()
        await self.db.refresh(params)
        return BusinessCaseParamsResponse.model_validate(params)

    async def upsert_params(
        self, data: BusinessCaseParamsCreate
    ) -> BusinessCaseParamsResponse:
        """创建或更新 BC 参数."""
        existing = await self.get_params(data.project_id)
        if existing:
            return await self.update_params(data.project_id, data)
        return await self.create_params(data)

    # ============ 年度数据管理 ============

    async def create_year_data(
        self, data: FinancialYearDataCreate
    ) -> BusinessCaseYears:
        """创建年度数据."""
        year_data = BusinessCaseYears(
            id=str(uuid.uuid4()),
            **data.model_dump()
        )
        self.db.add(year_data)
        await self.db.commit()
        await self.db.refresh(year_data)
        return year_data

    async def get_year_data(
        self, project_id: str, year: int | None = None
    ) -> list[BusinessCaseYears]:
        """获取项目年度数据."""
        query = select(BusinessCaseYears).where(BusinessCaseYears.project_id == project_id)
        if year is not None:
            query = query.where(BusinessCaseYears.year == year)

        result = await self.db.execute(query.order_by(BusinessCaseYears.year))
        return list(result.scalars().all())

    async def update_year_data(
        self, project_id: str, year: int, data: FinancialYearDataCreate
    ) -> BusinessCaseYears | None:
        """更新年度数据."""
        result = await self.db.execute(
            select(BusinessCaseYears).where(
                BusinessCaseYears.project_id == project_id,
                BusinessCaseYears.year == year,
            )
        )
        year_data = result.scalar_one_or_none()
        if not year_data:
            return None

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            if hasattr(year_data, key) and key not in ("project_id", "year"):
                setattr(year_data, key, value)

        await self.db.commit()
        await self.db.refresh(year_data)
        return year_data

    async def upsert_year_data(
        self, data: FinancialYearDataCreate
    ) -> BusinessCaseYears:
        """创建或更新年度数据."""
        existing_list = await self.get_year_data(data.project_id, data.year)
        if existing_list:
            return await self.update_year_data(data.project_id, data.year, data)
        return await self.create_year_data(data)

    async def delete_year_data(self, project_id: str, year: int) -> bool:
        """删除年度数据."""
        result = await self.db.execute(
            select(BusinessCaseYears).where(
                BusinessCaseYears.project_id == project_id,
                BusinessCaseYears.year == year,
            )
        )
        year_data = result.scalar_one_or_none()
        if not year_data:
            return False

        await self.db.delete(year_data)
        await self.db.commit()
        return True

    # ============ Business Case 计算 ============

    def _calculate_sk_components(
        self,
        hk_3_cost: Decimal,
        net_sales: Decimal,
        net_price: Decimal,
        volume: int,
        tooling_recovery: Decimal,
        rnd_recovery: Decimal,
        sa_rate: Decimal,
        working_capital_interest_rate: Decimal = Decimal("0.05"),
        payment_terms_days: int = 90,
    ) -> dict[str, Decimal]:
        """计算 SK（完全成本）的各组成部分.

        使用累加法：SK = HK3 + Tooling + R&D + S&A + Working Capital Interest

        ⚠️ 重要：利息类型区分
        - Working Capital Interest（营运资金利息）：基于销售账期的资金占用成本
        - Capital Interest（资本利息）：已包含在 tooling_recovery 中，由 investment_service 计算
        - 两者是不同的成本项，不可重复计算

        Args:
            hk_3_cost: 制造成本 HK III
            net_sales: 净销售额
            net_price: 净单价
            volume: 销量
            tooling_recovery: 模具摊销（含 Capital Interest）
            rnd_recovery: 研发摊销
            sa_rate: 管销费用率 (默认 2.1%)
            working_capital_interest_rate: 营运资金年利率 (默认 5%)
            payment_terms_days: 付款账期天数 (默认 90 天)

        Returns:
            包含 SK 各组成部分的字典
        """
        # 计算 S&A 管销费用
        overhead_sa = net_sales * sa_rate

        # 计算 Working Capital Interest（营运资金利息/资金占用成本）
        # 公式：VP × 利率 × (账期/360) × volume
        working_capital_interest = (
            net_price
            * working_capital_interest_rate
            * Decimal(str(payment_terms_days / 360))
            * Decimal(str(volume))
        )

        # 计算完全成本 SK
        # 注意：tooling_recovery 已包含 Capital Interest（模具投资的资本成本）
        sk_cost = hk_3_cost + tooling_recovery + rnd_recovery + overhead_sa + working_capital_interest

        # 计算利润指标
        db_1 = net_sales - hk_3_cost  # 边际贡献 I
        db_4 = net_sales - sk_cost    # 净利润 IV

        return {
            "overhead_sa": overhead_sa.quantize(Decimal("0.01")),
            "working_capital_interest": working_capital_interest.quantize(Decimal("0.01")),
            "sk_cost": sk_cost.quantize(Decimal("0.01")),
            "db_1": db_1.quantize(Decimal("0.01")),
            "db_4": db_4.quantize(Decimal("0.01")),
        }

    async def calculate_business_case(
        self,
        project_id: str,
        params: BusinessCaseParamsCreate,
        years: list[FinancialYearDataCreate],
    ) -> BusinessCaseResponse:
        """计算完整的 Business Case.

        计算公式（累加法）:
        - HK3 = Material Cost + Process Cost
        - S&A = Net Sales × sa_rate (管销费用率，默认 2.1%)
        - Interest = Net Price × interest_rate × (payment_terms_days / 360) × volume
        - SK = HK3 + Tooling Recovery + R&D Recovery + S&A + Interest
        - DB1 = Net Sales - HK3 (边际贡献 I)
        - DB4 = Net Sales - SK (净利润 IV)
        """
        # 保存参数
        bc_params = await self.upsert_params(params)

        # 保存年度数据并计算
        year_responses = []
        total_volume = 0
        total_db_4 = Decimal("0")
        break_even_year = None

        for year_data in years:
            # 确保 HK3 和 net_sales 有值
            if year_data.hk_3_cost is None or year_data.net_sales is None:
                raise ValueError(f"Year {year_data.year}: hk_3_cost and net_sales are required for calculation")

            # 确保 net_price 和 volume 有值
            if year_data.net_price is None or year_data.volume is None:
                raise ValueError(f"Year {year_data.year}: net_price and volume are required for calculation")

            # 计算或使用提供的摊销值
            tooling_recovery = year_data.recovery_tooling or Decimal("0")
            rnd_recovery = year_data.recovery_rnd or Decimal("0")

            # 使用累加法计算 SK 各组成部分
            sk_components = self._calculate_sk_components(
                hk_3_cost=year_data.hk_3_cost,
                net_sales=year_data.net_sales,
                net_price=year_data.net_price,
                volume=year_data.volume,
                tooling_recovery=tooling_recovery,
                rnd_recovery=rnd_recovery,
                sa_rate=params.sa_rate,
            )

            # 更新年度数据中的计算字段
            year_data.overhead_sa = sk_components["overhead_sa"]
            year_data.sk_cost = sk_components["sk_cost"]
            year_data.db_1 = sk_components["db_1"]
            year_data.db_4 = sk_components["db_4"]

            # 保存或更新年度数据
            bc_year = await self.upsert_year_data(year_data)

            # 累计销量
            total_volume += bc_year.volume or 0

            # 计算边际贡献
            if bc_year.db_4:
                total_db_4 += bc_year.db_4

            # 找到盈亏平衡年
            if break_even_year is None and bc_year.db_4 and bc_year.db_4 >= 0:
                break_even_year = bc_year.year

            year_responses.append(
                FinancialYearDataCreate(
                    project_id=project_id,
                    year=bc_year.year,
                    volume=bc_year.volume,
                    reduction_rate=bc_year.reduction_rate,
                    gross_sales=bc_year.gross_sales,
                    net_sales=bc_year.net_sales,
                    net_price=bc_year.net_price,
                    hk_3_cost=bc_year.hk_3_cost,
                    recovery_tooling=bc_year.recovery_tooling,
                    recovery_rnd=bc_year.recovery_rnd,
                    overhead_sa=bc_year.overhead_sa,
                    sk_cost=bc_year.sk_cost,
                    db_1=bc_year.db_1,
                    db_4=bc_year.db_4,
                )
            )

        # 更新 QuoteSummary 中的 BC 字段
        await self._update_quote_summary_bc_fields(project_id, years[-1] if years else None)

        return BusinessCaseResponse(
            project_id=project_id,
            params=BusinessCaseParamsResponse.model_validate(bc_params),
            years=[FinancialYearDataCreate(**y.model_dump()) for y in year_responses],
            total_lifetime_volume=total_volume,
            total_db_4=total_db_4.quantize(Decimal("0.01")),
            break_even_year=break_even_year,
        )

    async def _update_quote_summary_bc_fields(
        self, project_id: str, final_year: FinancialYearDataCreate | None
    ):
        """更新 QuoteSummary 中的 Business Case 字段."""
        result = await self.db.execute(
            select(QuoteSummary).where(QuoteSummary.project_id == project_id)
        )
        summary = result.scalar_one_or_none()
        if not summary:
            return

        if final_year:
            summary.hk_3_cost = final_year.hk_3_cost
            summary.sk_cost = final_year.sk_cost
            summary.db_1 = final_year.db_1
            summary.db_4 = final_year.db_4

        await self.db.commit()

    async def get_business_case(self, project_id: str) -> BusinessCaseResponse:
        """获取完整的 Business Case."""
        params = await self.get_params(project_id)
        if not params:
            raise ValueError(f"No BC params found for project {project_id}")

        years_data = await self.get_year_data(project_id)

        total_volume = sum(y.volume or 0 for y in years_data)
        total_db_4 = sum(y.db_4 or Decimal("0") for y in years_data)

        break_even_year = None
        for y in years_data:
            if y.db_4 and y.db_4 >= 0:
                break_even_year = y.year
                break

        return BusinessCaseResponse(
            project_id=project_id,
            params=params,
            years=[
                FinancialYearDataCreate(
                    project_id=project_id,
                    year=y.year,
                    volume=y.volume,
                    reduction_rate=y.reduction_rate,
                    gross_sales=y.gross_sales,
                    net_sales=y.net_sales,
                    net_price=y.net_price,
                    hk_3_cost=y.hk_3_cost,
                    recovery_tooling=y.recovery_tooling,
                    recovery_rnd=y.recovery_rnd,
                    overhead_sa=y.overhead_sa,
                    sk_cost=y.sk_cost,
                    db_1=y.db_1,
                    db_4=y.db_4,
                )
                for y in years_data
            ],
            total_lifetime_volume=total_volume,
            total_db_4=total_db_4.quantize(Decimal("0.01")),
            break_even_year=break_even_year,
        )
