import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { WorkflowGuide } from './WorkflowGuide';
import { 
  FileText,
  ArrowRight,
  Sparkles,
  DollarSign,
  Package,
  Calculator,
  Edit,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Calendar
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import type { View } from '../App';

interface QuoteSummaryProps {
  onNavigate: (view: View) => void;
}

interface Product {
  id: string;
  name: string;
  partNumber: string;
  annualVolume: number;
  orderQuantity: number;
  costs: {
    material: number;
    processing: number;
    additional: number;
  };
  investment: {
    mold: number;
    tooling: number;
    gauge: number;
    test: number;
  };
  amortizationYears: number;
}

interface IndirectCosts {
  manufacturing: number;
  quality: number;
  logistics: number;
  management: number;
  financial: number;
}

export function QuoteSummary({ onNavigate }: QuoteSummaryProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>('all');
  
  // Mock products data
  const [products, setProducts] = useState<Product[]>([
    {
      id: 'P-001',
      name: '发动机缸体',
      partNumber: 'ENG-CB-2024',
      annualVolume: 100000,
      orderQuantity: 1000,
      costs: {
        material: 85.50,
        processing: 735.00,
        additional: 0
      },
      investment: {
        mold: 15000,
        tooling: 21000,
        gauge: 8500,
        test: 3500
      },
      amortizationYears: 5
    },
    {
      id: 'P-002',
      name: '缸盖组件',
      partNumber: 'ENG-CH-2024',
      annualVolume: 100000,
      orderQuantity: 1000,
      costs: {
        material: 75.95,
        processing: 520.00,
        additional: 0
      },
      investment: {
        mold: 12000,
        tooling: 9500,
        gauge: 4300,
        test: 2200
      },
      amortizationYears: 5
    }
  ]);
  
  const [indirectCosts, setIndirectCosts] = useState<IndirectCosts>({
    manufacturing: 220.50,
    quality: 258.00,
    logistics: 150.00,
    management: 120.00,
    financial: 80.00
  });

  const [commercialTerms, setCommercialTerms] = useState({
    incoterms: 'EXW 工厂交货',
    validityPeriod: '30天',
    paymentTerms: '30% 预付，70% 交货后30天',
    deliveryTime: '收到订单后45天'
  });

  const currentYear = new Date().getFullYear();

  // 计算单个产品的成本和分摊
  const getProductCalculation = (product: Product) => {
    const directCost = product.costs.material + product.costs.processing + product.costs.additional;
    const indirectTotal = Object.values(indirectCosts).reduce((sum, val) => sum + val, 0);
    const totalInvestment = Object.values(product.investment).reduce((sum, val) => sum + val, 0);
    
    // 计算年分摊成本
    const annualAmortization = totalInvestment / product.amortizationYears;
    // 计算每件产品的分摊成本
    const perPieceAmortization = annualAmortization / product.annualVolume;
    
    // QS总成本 = 直接成本 + 间接成本 + 分摊成本
    const qsTotalCost = directCost + indirectTotal + perPieceAmortization;
    
    return {
      directCost,
      indirectTotal,
      totalInvestment,
      annualAmortization,
      perPieceAmortization,
      qsTotalCost
    };
  };

  // 计算分摊表
  const getAmortizationSchedule = (product: Product) => {
    const { totalInvestment, annualAmortization } = getProductCalculation(product);
    const schedule = [];
    
    for (let i = 0; i < product.amortizationYears; i++) {
      const year = currentYear + i;
      const yearlyProduction = product.annualVolume;
      const yearlyAmortization = annualAmortization;
      const cumulativeAmortization = yearlyAmortization * (i + 1);
      const remainingInvestment = totalInvestment - cumulativeAmortization;
      
      schedule.push({
        year,
        production: yearlyProduction,
        amortization: yearlyAmortization,
        cumulative: cumulativeAmortization,
        remaining: Math.max(0, remainingInvestment)
      });
    }
    
    return schedule;
  };

  const handleAmortizationYearsChange = (productId: string, years: number) => {
    setProducts(products.map(p => 
      p.id === productId ? { ...p, amortizationYears: years } : p
    ));
  };

  const handleIndirectCostChange = (field: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setIndirectCosts(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const handleSaveIndirectCosts = () => {
    setIsEditing(false);
  };

  // 计算总览数据
  const totalInvestment = products.reduce((sum, p) => {
    const { totalInvestment } = getProductCalculation(p);
    return sum + totalInvestment;
  }, 0);

  const totalAnnualAmortization = products.reduce((sum, p) => {
    const { annualAmortization } = getProductCalculation(p);
    return sum + annualAmortization;
  }, 0);

  // 数据校验
  const hasInvalidData = Object.values(indirectCosts).some(val => val < 0 || isNaN(val));

  // 筛选产品
  const displayProducts = selectedProduct === 'all' 
    ? products 
    : products.filter(p => p.id === selectedProduct);

  return (
    <div className="p-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl mb-1">QS 报价摘要 (Quote Summary)</h1>
        <p className="text-sm text-zinc-500">多产品成本核算、投资分摊与 ROI 分析</p>
      </div>

      <WorkflowGuide currentView="quotation" onNavigate={onNavigate} />

      {/* AI Insights */}
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm mb-1">AI 多产品成本分析</h3>
              <p className="text-xs text-zinc-600 mb-3">
                项目包含 {products.length} 个产品，总投资 ¥{totalInvestment.toLocaleString()}，
                年分摊成本 ¥{totalAnnualAmortization.toLocaleString()}。
                建议采用5年分摊策略，可有效降低单件成本。
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="h-7 text-xs">
                  分摊策略优化
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs">
                  成本对比分析
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Validation Alert */}
      {hasInvalidData && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="text-sm text-red-900 mb-1">数据校验失败</h3>
                <p className="text-xs text-red-700">
                  间接成本中存在无效数据，请检查并修正后再继续。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500">产品数量</p>
                <p className="text-2xl mt-1">{products.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500">总投资</p>
                <p className="text-2xl mt-1">¥{(totalInvestment / 1000).toFixed(0)}K</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500">年分摊</p>
                <p className="text-2xl mt-1">¥{(totalAnnualAmortization / 1000).toFixed(0)}K</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-zinc-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500">年总产量</p>
                <p className="text-2xl mt-1">
                  {(products.reduce((sum, p) => sum + p.annualVolume, 0) / 1000).toFixed(0)}K
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Selection */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>产品成本核算</CardTitle>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部产品</SelectItem>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={products[0]?.id || 'all'} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  {products.map((product) => (
                    <TabsTrigger key={product.id} value={product.id}>
                      {product.name}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {products.map((product) => {
                  const calc = getProductCalculation(product);
                  const schedule = getAmortizationSchedule(product);
                  
                  return (
                    <TabsContent key={product.id} value={product.id} className="space-y-4 mt-4">
                      {/* Product Info */}
                      <div className="border rounded-lg p-4 bg-zinc-50">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-xs text-zinc-500">零件号</p>
                            <p className="font-mono">{product.partNumber}</p>
                          </div>
                          <div>
                            <p className="text-xs text-zinc-500">年量</p>
                            <p>{product.annualVolume.toLocaleString()} pcs</p>
                          </div>
                          <div>
                            <p className="text-xs text-zinc-500">订单量</p>
                            <p>{product.orderQuantity.toLocaleString()} pcs</p>
                          </div>
                        </div>
                      </div>

                      {/* Cost Breakdown */}
                      <div className="border rounded-lg p-4">
                        <h4 className="text-sm mb-3">成本构成</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-zinc-500">物料成本</span>
                            <span>¥{product.costs.material.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-zinc-500">工艺加工</span>
                            <span>¥{product.costs.processing.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-zinc-500">附加成本</span>
                            <span>¥{product.costs.additional.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm pt-2 border-t">
                            <span>直接成本小计</span>
                            <span className="text-blue-600">¥{calc.directCost.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Investment & Amortization */}
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm">投资分摊设置</h4>
                          <div className="flex items-center gap-2">
                            <Label className="text-xs text-zinc-500">分摊年份：</Label>
                            <Select 
                              value={String(product.amortizationYears)} 
                              onValueChange={(value) => handleAmortizationYearsChange(product.id, parseInt(value))}
                            >
                              <SelectTrigger className="w-[80px] h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="4">4年</SelectItem>
                                <SelectItem value="5">5年</SelectItem>
                                <SelectItem value="6">6年</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-zinc-500">模具投资</span>
                            <span>¥{product.investment.mold.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-zinc-500">工装投资</span>
                            <span>¥{product.investment.tooling.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-zinc-500">检具投资</span>
                            <span>¥{product.investment.gauge.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-zinc-500">测试投资</span>
                            <span>¥{product.investment.test.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm pt-2 border-t">
                            <span>总投资</span>
                            <span className="text-purple-600">¥{calc.totalInvestment.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="bg-blue-50 rounded p-3 space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-zinc-600">年分摊金额</span>
                            <span className="text-blue-700">¥{calc.annualAmortization.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-600">单件分摊成本</span>
                            <span className="text-blue-700">¥{calc.perPieceAmortization.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Amortization Schedule */}
                      <div className="border rounded-lg p-4">
                        <h4 className="text-sm mb-3">投资分摊计划表</h4>
                        <div className="border rounded-lg overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>年份</TableHead>
                                <TableHead className="text-right">年产量</TableHead>
                                <TableHead className="text-right">年分摊</TableHead>
                                <TableHead className="text-right">累计分摊</TableHead>
                                <TableHead className="text-right">剩余投资</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {schedule.map((row, index) => (
                                <TableRow key={index}>
                                  <TableCell className="font-medium">{row.year}</TableCell>
                                  <TableCell className="text-right">{row.production.toLocaleString()}</TableCell>
                                  <TableCell className="text-right">¥{row.amortization.toLocaleString()}</TableCell>
                                  <TableCell className="text-right text-blue-600">
                                    ¥{row.cumulative.toLocaleString()}
                                  </TableCell>
                                  <TableCell className="text-right text-orange-600">
                                    ¥{row.remaining.toLocaleString()}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                        <div className="mt-3 text-xs text-zinc-500">
                          * 投资将在 {product.amortizationYears} 年内完全摊销
                        </div>
                      </div>

                      {/* QS Total Cost */}
                      <div className="border-2 border-zinc-900 rounded-lg p-4 bg-zinc-50">
                        <h4 className="text-sm mb-3">QS 单件总成本</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-zinc-500">直接成本</span>
                            <span>¥{calc.directCost.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">间接成本</span>
                            <span>¥{calc.indirectTotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">分摊成本</span>
                            <span>¥{calc.perPieceAmortization.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t text-base">
                            <span>QS 总成本</span>
                            <span className="text-lg">¥{calc.qsTotalCost.toFixed(2)}</span>
                          </div>
                        </div>
                        <p className="text-xs text-zinc-500 mt-3">
                          * QS成本已包含投资分摊，将在投资回收分析中设置利润率和报价
                        </p>
                      </div>
                    </TabsContent>
                  );
                })}
              </Tabs>
            </CardContent>
          </Card>

          {/* Indirect Costs (Shared) */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>间接成本（共享）</CardTitle>
                  <CardDescription>适用于所有产品的间接成本</CardDescription>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => isEditing ? handleSaveIndirectCosts() : setIsEditing(true)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  {isEditing ? '保存' : '编辑'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500">间接制造成本</span>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={indirectCosts.manufacturing}
                      onChange={(e) => handleIndirectCostChange('manufacturing', e.target.value)}
                      className="w-32 h-8 text-right"
                      step="0.01"
                    />
                  ) : (
                    <span>¥{indirectCosts.manufacturing.toFixed(2)}</span>
                  )}
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500">质量成本</span>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={indirectCosts.quality}
                      onChange={(e) => handleIndirectCostChange('quality', e.target.value)}
                      className="w-32 h-8 text-right"
                      step="0.01"
                    />
                  ) : (
                    <span>¥{indirectCosts.quality.toFixed(2)}</span>
                  )}
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500">物流包装</span>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={indirectCosts.logistics}
                      onChange={(e) => handleIndirectCostChange('logistics', e.target.value)}
                      className="w-32 h-8 text-right"
                      step="0.01"
                    />
                  ) : (
                    <span>¥{indirectCosts.logistics.toFixed(2)}</span>
                  )}
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500">管理费用</span>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={indirectCosts.management}
                      onChange={(e) => handleIndirectCostChange('management', e.target.value)}
                      className="w-32 h-8 text-right"
                      step="0.01"
                    />
                  ) : (
                    <span>¥{indirectCosts.management.toFixed(2)}</span>
                  )}
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500">财务成本</span>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={indirectCosts.financial}
                      onChange={(e) => handleIndirectCostChange('financial', e.target.value)}
                      className="w-32 h-8 text-right"
                      step="0.01"
                    />
                  ) : (
                    <span>¥{indirectCosts.financial.toFixed(2)}</span>
                  )}
                </div>
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span>间接成本小计</span>
                  <span className="text-purple-600">
                    ¥{Object.values(indirectCosts).reduce((sum, val) => sum + val, 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Products Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">产品成本汇总</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {products.map((product) => {
                const calc = getProductCalculation(product);
                return (
                  <div key={product.id} className="pb-3 border-b last:border-0">
                    <p className="text-sm mb-2">{product.name}</p>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between text-zinc-600">
                        <span>直接成本</span>
                        <span>¥{calc.directCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-zinc-600">
                        <span>分摊成本</span>
                        <span>¥{calc.perPieceAmortization.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>QS成本</span>
                        <span className="text-blue-600">¥{calc.qsTotalCost.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Validation Status */}
          <Card className={hasInvalidData ? "border-orange-200 bg-orange-50" : "border-green-200 bg-green-50"}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                {hasInvalidData ? (
                  <>
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <span className="text-orange-900">数据校验</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-green-900">QS核算完成</span>
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
                <span className="text-zinc-700">{products.length} 个产品成本核算完成</span>
              </div>
              <div className="flex items-center gap-2">
                {hasInvalidData ? (
                  <AlertCircle className="h-3 w-3 text-orange-600" />
                ) : (
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                )}
                <span className="text-zinc-700">间接成本已填写</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
                <span className="text-zinc-700">投资分摊计划已设定</span>
              </div>
            </CardContent>
          </Card>

          {/* Investment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">投资汇总</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">总投资</span>
                <span>¥{totalInvestment.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">年分摊</span>
                <span>¥{totalAnnualAmortization.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-zinc-500">平均分摊年限</span>
                <span>
                  {(products.reduce((sum, p) => sum + p.amortizationYears, 0) / products.length).toFixed(1)} 年
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={() => onNavigate('cost-calc')}>
          返回成本核算
        </Button>
        <div className="flex gap-2">
          <Button variant="outline">
            导出QS报价单
          </Button>
          <Button 
            onClick={() => onNavigate('investment')}
            disabled={hasInvalidData}
          >
            进入投资回收分析 <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}