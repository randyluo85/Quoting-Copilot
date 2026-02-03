import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import { 
  BarChart3, 
  ArrowRight,
  TrendingUp,
  Calendar,
  DollarSign,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import type { View } from '../App';

interface InvestmentAnalysisProps {
  onNavigate: (view: View) => void;
}

export function InvestmentAnalysis({ onNavigate }: InvestmentAnalysisProps) {
  const [profitMargin, setProfitMargin] = useState(15); // 利润率 15%
  const [isConfirmed, setIsConfirmed] = useState(false);

  // 基础成本数据
  const directCost = 14823.70;
  const indirectCost = 828.50;
  const totalCost = directCost + indirectCost;

  // 根据利润率实时计算
  const profit = totalCost * (profitMargin / 100);
  const unitPrice = totalCost + profit;
  const orderQuantity = 1000;
  const totalRevenue = unitPrice * orderQuantity;

  // 投资数据
  const totalInvestment = 220; // 万元

  // 财务指标实时计算
  const calculateFinancialMetrics = () => {
    const annualRevenue = totalRevenue * 12 / 10000; // 年收入（万元）
    const discountRate = 0.10; // 折现率 10%
    
    // 简化的NPV计算（5年期）
    let npv = -totalInvestment;
    for (let year = 1; year <= 5; year++) {
      const cashFlow = annualRevenue * 0.35; // 假设35%为净现金流
      npv += cashFlow / Math.pow(1 + discountRate, year);
    }
    
    // IRR估算（简化）
    const irr = (annualRevenue * 0.35 / totalInvestment) * 100;
    
    // 投资回收期
    const paybackPeriod = totalInvestment / (annualRevenue * 0.35);
    
    // ROI
    const roi = ((npv + totalInvestment) / totalInvestment) * 100;
    
    return {
      npv: npv.toFixed(1),
      irr: irr.toFixed(1),
      paybackPeriod: paybackPeriod.toFixed(1),
      roi: roi.toFixed(0)
    };
  };

  const financialMetrics = calculateFinancialMetrics();

  const milestones = [
    { id: 'MS1', name: '项目启动', investment: 12, date: '2025-12', status: 'pending' },
    { id: 'MS2', name: '设计开发', investment: 28, date: '2026-03', status: 'pending' },
    { id: 'MS3', name: '样品试制', investment: 45, date: '2026-06', status: 'pending' },
    { id: 'MS4', name: '工艺验证', investment: 38, date: '2026-09', status: 'pending' },
    { id: 'MS5', name: '小批量生产', investment: 56, date: '2026-12', status: 'pending' },
    { id: 'MS6', name: '量产启动', investment: 41, date: '2027-03', status: 'pending' },
  ];

  const handleConfirm = () => {
    setIsConfirmed(true);
  };

  return (
    <div className="p-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl mb-1">BC 投资回报分析</h1>
        <p className="text-sm text-zinc-500">通过利润率调整进行投资汇报分析，由控制经理确认</p>
      </div>

      <div className="space-y-6">
        {/* Profit Margin Control */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-base">利润率调整</CardTitle>
            <CardDescription>拖动滑块调整利润率，实时查看投资回报指标变化</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">利润率 (%)</Label>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{profitMargin}%</span>
                </div>
              </div>
              <Slider
                value={[profitMargin]}
                onValueChange={(value) => setProfitMargin(value[0])}
                min={5}
                max={30}
                step={0.5}
                className="py-4"
              />
              <div className="flex justify-between text-xs text-zinc-500">
                <span>5%（最低）</span>
                <span>30%（最高）</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-xs text-zinc-600 mb-1">单件成本</p>
                <p className="text-lg">¥{totalCost.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-600 mb-1">单件利润</p>
                <p className="text-lg text-green-600">¥{profit.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-600 mb-1">单件报价</p>
                <p className="text-xl text-blue-600">¥{unitPrice.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-600 mb-1">订单总额</p>
                <p className="text-xl">¥{totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Financial Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">净现值 (NPV)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-green-600 mb-1">¥{financialMetrics.npv}万</div>
              <p className="text-xs text-zinc-500">折现率 10%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">内部收益率 (IRR)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-green-600 mb-1">{financialMetrics.irr}%</div>
              <p className="text-xs text-zinc-500">高于资本成本</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">投资回收期</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl mb-1">{financialMetrics.paybackPeriod} 年</div>
              <p className="text-xs text-zinc-500">含建设期</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">投资回报率 (ROI)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-green-600 mb-1">{financialMetrics.roi}%</div>
              <p className="text-xs text-zinc-500">5 年累计</p>
            </CardContent>
          </Card>
        </div>

        {/* Milestone Investment Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              MS1-MS6 里程碑投资计划
            </CardTitle>
            <CardDescription>分阶段投资安排与进度管理</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>里程碑</TableHead>
                  <TableHead>阶段名称</TableHead>
                  <TableHead className="text-right">投资金额</TableHead>
                  <TableHead>预计时间</TableHead>
                  <TableHead>状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {milestones.map((milestone) => (
                  <TableRow key={milestone.id}>
                    <TableCell className="font-mono">{milestone.id}</TableCell>
                    <TableCell>{milestone.name}</TableCell>
                    <TableCell className="text-right font-mono">¥{milestone.investment}万</TableCell>
                    <TableCell>{milestone.date}</TableCell>
                    <TableCell>
                      <Badge variant="outline">待执行</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 p-4 bg-zinc-50 rounded-lg border">
              <div className="flex justify-between items-center">
                <span className="text-sm">总投资金额</span>
                <span className="text-xl font-mono">¥{milestones.reduce((sum, m) => sum + m.investment, 0)}万</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Investment Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              投资表现评估
            </CardTitle>
            <CardDescription>基于当前利润率 {profitMargin}% 的投资指标评估</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <span className="text-sm">NPV 评估</span>
                <div className="flex items-center gap-2">
                  {parseFloat(financialMetrics.npv) > 0 ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-700">正向价值，建议投资</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-700">负向价值，需调整</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-sm">IRR 评估</span>
                <div className="flex items-center gap-2">
                  {parseFloat(financialMetrics.irr) > 10 ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-700">高于资本成本</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                      <span className="text-sm text-orange-700">接近资本成本</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <span className="text-sm">回收期评估</span>
                <div className="flex items-center gap-2">
                  {parseFloat(financialMetrics.paybackPeriod) < 3 ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-700">快速回收</span>
                    </>
                  ) : parseFloat(financialMetrics.paybackPeriod) < 5 ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-blue-700">合理范围</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                      <span className="text-sm text-orange-700">回收期较长</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Controller Approval */}
        <Card className={isConfirmed ? "border-2 border-green-500 bg-green-50" : "border-2 border-orange-500 bg-orange-50"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isConfirmed ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-green-900">控制经理已确认</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  <span className="text-orange-900">等待控制经理确认</span>
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isConfirmed ? (
              <>
                <p className="text-sm text-zinc-700">
                  请控制经理审核投资回报分析结果，确认利润率设置（当前 {profitMargin}%）和财务指标是否符合公司投资政策。
                </p>
                <div className="space-y-2 text-xs text-zinc-600">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                    <span>利润率范围：{profitMargin}%（行业标准 12-18%）</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                    <span>NPV：¥{financialMetrics.npv}万（{parseFloat(financialMetrics.npv) > 0 ? '正向' : '负向'}）</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                    <span>IRR：{financialMetrics.irr}%（资本成本 10%）</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                    <span>回收期：{financialMetrics.paybackPeriod}年（政策要求 {'<'} 5 年）</span>
                  </div>
                </div>
                <Button 
                  onClick={handleConfirm} 
                  className="w-full"
                  disabled={parseFloat(financialMetrics.npv) < 0}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  控制经理确认投资分析
                </Button>
              </>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-sm text-green-800">
                  <CheckCircle2 className="h-5 w-5 mt-0.5" />
                  <div>
                    <p className="mb-1">投资分析已通过审核</p>
                    <p className="text-xs text-green-700">
                      利润率 {profitMargin}%，NPV ¥{financialMetrics.npv}万，IRR {financialMetrics.irr}%，
                      投资回收期 {financialMetrics.paybackPeriod}年，符合公司投资政策要求。
                    </p>
                  </div>
                </div>
                <p className="text-xs text-zinc-600">
                  确认时间：{new Date().toLocaleString('zh-CN')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => onNavigate('quotation')}>
            返回报价摘要
          </Button>
          <Button 
            onClick={() => onNavigate('output')} 
            className="bg-green-600 hover:bg-green-700"
            disabled={!isConfirmed}
          >
            生成最终报价单 <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}