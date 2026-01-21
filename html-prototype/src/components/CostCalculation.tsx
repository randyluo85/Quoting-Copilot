import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Calculator, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Sparkles
} from 'lucide-react';
import type { View } from '../App';

interface CostCalculationProps {
  onNavigate: (view: View) => void;
}

export function CostCalculation({ onNavigate }: CostCalculationProps) {
  const [calcStatus, setCalcStatus] = useState<'calculating' | 'completed'>('calculating');
  const [progress, setProgress] = useState(45);

  // Simulate calculation completion
  useState(() => {
    if (calcStatus === 'calculating') {
      const timer = setTimeout(() => {
        setProgress(100);
        setCalcStatus('completed');
      }, 2000);
      return () => clearTimeout(timer);
    }
  });

  const materialCosts = [
    { id: 'M-2001', name: '发动机缸体铸件', quantity: 1, unit: 'PCS', unitPrice: 85.50, total: 85.50, status: 'normal' },
    { id: 'M-2043', name: '活塞环组件', quantity: 4, unit: 'PCS', unitPrice: 12.30, total: 49.20, status: 'normal' },
    { id: 'M-3156', name: '连杆螺栓', quantity: 8, unit: 'PCS', unitPrice: 2.15, total: 17.20, status: 'normal' },
    { id: 'M-4021', name: '缸盖密封垫', quantity: 1, unit: 'PCS', unitPrice: 45.80, total: 45.80, status: 'anomaly' },
  ];

  const processCosts = [
    { process: '铸造成型', hours: 8.5, rate: 120, total: 1020 },
    { process: '粗加工', hours: 25.0, rate: 180, total: 4500 },
    { process: '精加工', hours: 35.0, rate: 200, total: 7000 },
    { process: '热处理', hours: 12.0, rate: 80, total: 960 },
  ];

  const costSummary = {
    material: materialCosts.reduce((sum, item) => sum + item.total, 0),
    process: processCosts.reduce((sum, item) => sum + item.total, 0),
    additional: 1146,  // 附加成本：模具、工装、检具、测试
    total: 0
  };
  
  costSummary.total = costSummary.material + costSummary.process + costSummary.additional;

  return (
    <div className="p-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl mb-1">AI 成本核算</h1>
        <p className="text-sm text-zinc-500">智能分析物料成本、工艺成本和附加成本</p>
      </div>

      <div className="space-y-6">
        {/* Calculation Status */}
        {calcStatus === 'calculating' && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <Sparkles className="h-5 w-5 animate-pulse" />
                </div>
                <div className="flex-1">
                  <p className="text-sm mb-1">AI 正在智能计算成本...</p>
                  <p className="text-xs text-zinc-600 mb-2">
                    正在分析物料成本、工艺成本、质量成本和间接费用
                  </p>
                  <Progress value={progress} />
                </div>
                <span className="text-sm text-zinc-700">{progress}%</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cost Summary */}
        {calcStatus === 'completed' && (
          <>
            {/* AI Success Banner */}
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600 text-white">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm mb-1">成本计算完成</h3>
                    <p className="text-xs text-zinc-600 mb-3">
                      AI 已完成全面成本分析。总成本 ¥{costSummary.total.toLocaleString()}，
                      比历史平均成本低 3.2%。识别出 2 项成本优化机会，预计可节约 ¥450。
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="h-7 text-xs">
                        查看优化建议
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs">
                        成本对比分析
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <p className="text-xs text-zinc-500 mb-1">物料成本</p>
                  <p className="text-2xl">¥{costSummary.material.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                    <TrendingDown className="h-3 w-3" />
                    <span>比历史低 5%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <p className="text-xs text-zinc-500 mb-1">工艺成本</p>
                  <p className="text-2xl">¥{costSummary.process.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-zinc-500">
                    <TrendingUp className="h-3 w-3" />
                    <span>符合预期</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <p className="text-xs text-zinc-500 mb-1">附加成本</p>
                  <p className="text-2xl">¥{costSummary.additional.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-zinc-500">
                    <TrendingUp className="h-3 w-3" />
                    <span>符合预期</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-zinc-900">
                <CardContent className="p-6">
                  <p className="text-xs text-zinc-500 mb-1">总成本</p>
                  <p className="text-2xl">¥{costSummary.total.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    <span className="text-green-600">计算完成</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>成本明细</CardTitle>
                <CardDescription>详细的成本构成分析（基于VOSS报价流程）</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="material">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="material">物料成本</TabsTrigger>
                    <TabsTrigger value="process">工艺成本</TabsTrigger>
                    <TabsTrigger value="additional">附加成本</TabsTrigger>
                  </TabsList>

                  <TabsContent value="material" className="mt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>物料编码</TableHead>
                          <TableHead>物料名称</TableHead>
                          <TableHead className="text-right">数量</TableHead>
                          <TableHead className="text-right">单价</TableHead>
                          <TableHead className="text-right">金额</TableHead>
                          <TableHead>状态</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {materialCosts.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-mono text-xs">{item.id}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell className="text-right">{item.quantity} {item.unit}</TableCell>
                            <TableCell className="text-right">¥{item.unitPrice}</TableCell>
                            <TableCell className="text-right">¥{item.total.toFixed(2)}</TableCell>
                            <TableCell>
                              {item.status === 'normal' && (
                                <Badge variant="secondary">正常</Badge>
                              )}
                              {item.status === 'anomaly' && (
                                <Badge variant="outline" className="border-orange-500 text-orange-600">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  异常
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>

                  <TabsContent value="process" className="mt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>工艺流程</TableHead>
                          <TableHead className="text-right">标准工时 (min)</TableHead>
                          <TableHead className="text-right">小时费率</TableHead>
                          <TableHead className="text-right">工艺成本</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {processCosts.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.process}</TableCell>
                            <TableCell className="text-right">{item.hours} min</TableCell>
                            <TableCell className="text-right">¥{item.rate}/h</TableCell>
                            <TableCell className="text-right">¥{item.total}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>

                  <TabsContent value="additional" className="mt-4">
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm">模具成本分摊</span>
                          <span>¥500</span>
                        </div>
                        <Progress value={44} />
                        <p className="text-xs text-zinc-500 mt-1">总投资 ¥50,000 / 100,000 件</p>
                      </div>
                      <div className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm">工装成本分摊</span>
                          <span>¥200</span>
                        </div>
                        <Progress value={17} />
                        <p className="text-xs text-zinc-500 mt-1">总投资 ¥20,000 / 100,000 件</p>
                      </div>
                      <div className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm">检具成本分摊</span>
                          <span>¥100</span>
                        </div>
                        <Progress value={9} />
                        <p className="text-xs text-zinc-500 mt-1">总投资 ¥10,000 / 100,000 件</p>
                      </div>
                      <div className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm">测试成本</span>
                          <span>¥346</span>
                        </div>
                        <Progress value={30} />
                        <p className="text-xs text-zinc-500 mt-1">首件测试 + 过程测试</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  AI 成本分析洞察
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm">物料成本优化机会</p>
                    <p className="text-xs text-zinc-600 mt-1">
                      发现缸盖密封垫有 2 个替代供应商，价格更优惠，预计节约 ¥15/件
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Calculator className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm">工艺优化建议</p>
                    <p className="text-xs text-zinc-600 mt-1">
                      精加工工序可通过工艺参数优化减少 12% 工时，预计节省成本 ¥840
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <TrendingDown className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="text-sm">成本趋势分析</p>
                    <p className="text-xs text-zinc-600 mt-1">
                      该产品类型成本持续优化，过去 6 个月平均成本下降 8.5%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => onNavigate('process')}>
            返回上一步
          </Button>
          <Button 
            onClick={() => onNavigate('quotation')}
            disabled={calcStatus !== 'completed'}
          >
            生成报价摘要 <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}