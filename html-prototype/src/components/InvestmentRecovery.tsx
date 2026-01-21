import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { WorkflowGuide } from './WorkflowGuide';
import { 
  TrendingUp,
  DollarSign,
  Percent,
  ArrowRight,
  Sparkles,
  Calculator,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Calendar,
  FileText
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

interface InvestmentRecoveryProps {
  onNavigate: (view: View) => void;
}

interface ProductPricing {
  id: string;
  name: string;
  partNumber: string;
  qsCost: number;
  quotePrice: number | null; // 用户输入的报价（模式1）
  profitMargin: number;      // 利润率（模式2）
  annualVolume: number;
  orderQuantity: number;
  investment: number;
  amortizationYears: number;
}

export function InvestmentRecovery({ onNavigate }: InvestmentRecoveryProps) {
  const [calculationMode, setCalculationMode] = useState<'price' | 'margin'>('margin'); // 'price' = 输入单价, 'margin' = 设置利润率
  
  //Mock 产品数据（从QS带过来）
  const [products, setProducts] = useState<ProductPricing[]>([
    {
      id: 'P-001',
      name: '发动机缸体',
      partNumber: 'ENG-CB-2024',
      qsCost: 1649.48,  // QS成本
      quotePrice: null,
      profitMargin: 15,
      annualVolume: 100000,
      orderQuantity: 1000,
      investment: 48000,
      amortizationYears: 5
    },
    {
      id: 'P-002',
      name: '缸盖组件',
      partNumber: 'ENG-CH-2024',
      qsCost: 1424.93,
      quotePrice: null,
      profitMargin: 15,
      annualVolume: 100000,
      orderQuantity: 1000,
      investment: 28000,
      amortizationYears: 5
    }
  ]);

  const [commercialTerms, setCommercialTerms] = useState({
    incoterms: 'EXW 工厂交货',
    validityPeriod: '30天',
    paymentTerms: '30% 预付，70% 交货后30天',
    deliveryTime: '收到订单后45天',
    warranty: '12个月质保',
    packagingLevel: '标准包装'
  });

  const currentYear = new Date().getFullYear();

  // 计算单个产品的定价和利润率
  const getProductPricing = (product: ProductPricing) => {
    let calculatedPrice = 0;
    let calculatedMargin = 0;
    let profit = 0;

    if (calculationMode === 'price' && product.quotePrice) {
      // 模式1：输入报价，计算利润率
      calculatedPrice = product.quotePrice;
      profit = calculatedPrice - product.qsCost;
      calculatedMargin = (profit / product.qsCost) * 100;
    } else {
      // 模式2：设置利润率，计算报价
      calculatedMargin = product.profitMargin;
      profit = product.qsCost * (product.profitMargin / 100);
      calculatedPrice = product.qsCost + profit;
    }

    const orderRevenue = calculatedPrice * product.orderQuantity;
    const annualRevenue = calculatedPrice * product.annualVolume;
    const annualProfit = profit * product.annualVolume;

    // 投资回收期计算（简化）
    const paybackPeriod = product.investment / annualProfit;

    // ROI计算
    const totalProfitOverPeriod = annualProfit * product.amortizationYears;
    const roi = ((totalProfitOverPeriod - product.investment) / product.investment) * 100;

    return {
      calculatedPrice,
      calculatedMargin,
      profit,
      orderRevenue,
      annualRevenue,
      annualProfit,
      paybackPeriod,
      roi
    };
  };

  // 处理报价输入（模式1）
  const handleQuotePriceChange = (productId: string, value: string) => {
    const numValue = parseFloat(value) || null;
    setProducts(products.map(p =>
      p.id === productId ? { ...p, quotePrice: numValue } : p
    ));
  };

  // 处理利润率滑块（模式2）
  const handleProfitMarginChange = (productId: string, value: number[]) => {
    setProducts(products.map(p =>
      p.id === productId ? { ...p, profitMargin: value[0] } : p
    ));
  };

  // 计算投资回收计划表
  const getRecoverySchedule = (product: ProductPricing) => {
    const pricing = getProductPricing(product);
    const schedule = [];
    let cumulativeProfit = 0;

    for (let i = 0; i < product.amortizationYears; i++) {
      const year = currentYear + i;
      const yearProfit = pricing.annualProfit;
      cumulativeProfit += yearProfit;
      const remainingInvestment = Math.max(0, product.investment - cumulativeProfit);
      const recoveryRate = Math.min(100, (cumulativeProfit / product.investment) * 100);

      schedule.push({
        year,
        revenue: pricing.annualRevenue,
        profit: yearProfit,
        cumulativeProfit,
        remaining: remainingInvestment,
        recoveryRate
      });
    }

    return schedule;
  };

  // 总览数据
  const totalInvestment = products.reduce((sum, p) => sum + p.investment, 0);
  const totalAnnualRevenue = products.reduce((sum, p) => {
    const pricing = getProductPricing(p);
    return sum + pricing.annualRevenue;
  }, 0);
  const totalAnnualProfit = products.reduce((sum, p) => {
    const pricing = getProductPricing(p);
    return sum + pricing.annualProfit;
  }, 0);
  const avgPaybackPeriod = totalInvestment / totalAnnualProfit;

  // 校验：模式1下，所有产品必须填写报价
  const hasInvalidData = calculationMode === 'price' && products.some(p => !p.quotePrice || p.quotePrice <= 0);

  return (
    <div className="p-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl mb-1">BC 投资回收分析 (Business Case - Investment Recovery)</h1>
        <p className="text-sm text-zinc-500">设置产品报价、分析投资回收与 ROI</p>
      </div>

      <WorkflowGuide currentView="investment" onNavigate={onNavigate} />

      {/* AI Insights */}
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm mb-1">AI 投资回收分析</h3>
              <p className="text-xs text-zinc-600 mb-3">
                项目总投资 ¥{totalInvestment.toLocaleString()}，
                预计年利润 ¥{totalAnnualProfit.toLocaleString()}，
                投资回收期约 {avgPaybackPeriod.toFixed(1)} 年。
                AI 建议利润率设置在 12-18% 区间，确保合理的投资回报率。
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="h-7 text-xs">
                  ROI优化建议
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs">
                  定价策略分析
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation Alert */}
      {hasInvalidData && (
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h3 className="text-sm text-orange-900 mb-1">数据未完整</h3>
                <p className="text-xs text-orange-700">
                  请为所有产品填写报价单价，或切换到利润率模式进行计算。
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
                <p className="text-xs text-zinc-500">年收入</p>
                <p className="text-2xl mt-1">¥{(totalAnnualRevenue / 1000).toFixed(0)}K</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500">年利润</p>
                <p className="text-2xl mt-1">¥{(totalAnnualProfit / 1000).toFixed(0)}K</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-zinc-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500">回收期</p>
                <p className="text-2xl mt-1">{avgPaybackPeriod.toFixed(1)}年</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Calculation Mode Selector */}
          <Card>
            <CardHeader>
              <CardTitle>报价计算方式</CardTitle>
              <CardDescription>选择您偏好的定价方法</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Card 
                  className={`cursor-pointer transition-all ${
                    calculationMode === 'price' 
                      ? 'border-2 border-blue-500 bg-blue-50' 
                      : 'hover:border-zinc-400'
                  }`}
                  onClick={() => setCalculationMode('price')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {calculationMode === 'price' && (
                        <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Calculator className="h-4 w-4 text-zinc-600" />
                          <h4 className="text-sm">方式一：填入报价</h4>
                        </div>
                        <p className="text-xs text-zinc-600">
                          直接输入产品单价，系统自动计算利润率
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all ${
                    calculationMode === 'margin' 
                      ? 'border-2 border-blue-500 bg-blue-50' 
                      : 'hover:border-zinc-400'
                  }`}
                  onClick={() => setCalculationMode('margin')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {calculationMode === 'margin' && (
                        <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Percent className="h-4 w-4 text-zinc-600" />
                          <h4 className="text-sm">方式二：设置利润率</h4>
                        </div>
                        <p className="text-xs text-zinc-600">
                          通过滑块设置利润率，系统自动计算报价
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Product Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>产品定价</CardTitle>
              <CardDescription>
                {calculationMode === 'price' ? '输入每个产品的报价单价' : '调整每个产品的利润率'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={products[0]?.id} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  {products.map((product) => (
                    <TabsTrigger key={product.id} value={product.id}>
                      {product.name}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {products.map((product) => {
                  const pricing = getProductPricing(product);
                  const schedule = getRecoverySchedule(product);

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
                            <p className="text-xs text-zinc-500">QS成本</p>
                            <p className="text-blue-600">¥{product.qsCost.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-zinc-500">年量</p>
                            <p>{product.annualVolume.toLocaleString()} pcs</p>
                          </div>
                        </div>
                      </div>

                      {/* Pricing Input/Slider */}
                      {calculationMode === 'price' ? (
                        // 方式1：输入报价
                        <div className="border rounded-lg p-4">
                          <h4 className="text-sm mb-3">填入报价单价</h4>
                          <div className="space-y-4">
                            <div className="flex items-end gap-4">
                              <div className="flex-1">
                                <Label htmlFor="quote-price">报价单价 (¥)</Label>
                                <Input
                                  id="quote-price"
                                  type="number"
                                  step="0.01"
                                  placeholder="输入报价单价"
                                  value={product.quotePrice || ''}
                                  onChange={(e) => handleQuotePriceChange(product.id, e.target.value)}
                                  className="mt-2"
                                />
                              </div>
                              <div className="flex-1">
                                <Label>计算得到的利润率</Label>
                                <div className="mt-2 text-2xl text-green-600">
                                  {pricing.calculatedMargin.toFixed(2)}%
                                </div>
                              </div>
                            </div>
                            <div className="bg-green-50 rounded p-3">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-xs text-zinc-600">单件利润</p>
                                  <p className="text-green-700">¥{pricing.profit.toFixed(2)}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-zinc-600">年利润</p>
                                  <p className="text-green-700">¥{pricing.annualProfit.toLocaleString()}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // 方式2：设置利润率
                        <div className="border rounded-lg p-4">
                          <h4 className="text-sm mb-3">设置目标利润率</h4>
                          <div className="space-y-4">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <Label>利润率</Label>
                                <span className="text-2xl text-blue-600">
                                  {product.profitMargin}%
                                </span>
                              </div>
                              <Slider
                                value={[product.profitMargin]}
                                onValueChange={(value) => handleProfitMarginChange(product.id, value)}
                                min={0}
                                max={50}
                                step={0.5}
                                className="my-4"
                              />
                              <div className="flex justify-between text-xs text-zinc-500">
                                <span>0%</span>
                                <span>25%</span>
                                <span>50%</span>
                              </div>
                            </div>
                            <div className="bg-blue-50 rounded p-3">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-xs text-zinc-600">计算得到的单价</p>
                                  <p className="text-blue-700">¥{pricing.calculatedPrice.toFixed(2)}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-zinc-600">年收入</p>
                                  <p className="text-blue-700">¥{pricing.annualRevenue.toLocaleString()}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Pricing Summary */}
                      <div className="border-2 border-zinc-900 rounded-lg p-4 bg-zinc-50">
                        <h4 className="text-sm mb-3">定价汇总</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-zinc-500">QS成本</span>
                            <span>¥{product.qsCost.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">利润率</span>
                            <span className="text-green-600">{pricing.calculatedMargin.toFixed(2)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">单件利润</span>
                            <span className="text-green-600">¥{pricing.profit.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t">
                            <span>报价单价</span>
                            <span className="text-lg">¥{pricing.calculatedPrice.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Investment Recovery Table */}
                      <div className="border rounded-lg p-4">
                        <h4 className="text-sm mb-3">投资回收计划表</h4>
                        <div className="border rounded-lg overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>年份</TableHead>
                                <TableHead className="text-right">年收入</TableHead>
                                <TableHead className="text-right">年利润</TableHead>
                                <TableHead className="text-right">累计利润</TableHead>
                                <TableHead className="text-right">剩余投资</TableHead>
                                <TableHead className="text-right">回收率</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {schedule.map((row, index) => (
                                <TableRow key={index}>
                                  <TableCell className="font-medium">{row.year}</TableCell>
                                  <TableCell className="text-right">
                                    ¥{row.revenue.toLocaleString()}
                                  </TableCell>
                                  <TableCell className="text-right text-green-600">
                                    ¥{row.profit.toLocaleString()}
                                  </TableCell>
                                  <TableCell className="text-right text-blue-600">
                                    ¥{row.cumulativeProfit.toLocaleString()}
                                  </TableCell>
                                  <TableCell className="text-right text-orange-600">
                                    ¥{row.remaining.toLocaleString()}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {row.recoveryRate.toFixed(1)}%
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                        <div className="mt-3 space-y-1 text-xs">
                          <p className="text-zinc-500">
                            * 投资回收期：{pricing.paybackPeriod.toFixed(2)} 年
                          </p>
                          <p className="text-zinc-500">
                            * {product.amortizationYears} 年期 ROI：{pricing.roi.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                  );
                })}
              </Tabs>
            </CardContent>
          </Card>

          {/* Commercial Terms */}
          <Card>
            <CardHeader>
              <CardTitle>商务条款</CardTitle>
              <CardDescription>交付、付款等商务条件</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>交付条款 (Incoterms)</Label>
                  <Input 
                    value={commercialTerms.incoterms} 
                    onChange={(e) => setCommercialTerms(prev => ({ ...prev, incoterms: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>报价有效期</Label>
                  <Input 
                    value={commercialTerms.validityPeriod}
                    onChange={(e) => setCommercialTerms(prev => ({ ...prev, validityPeriod: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>付款条件</Label>
                  <Input 
                    value={commercialTerms.paymentTerms}
                    onChange={(e) => setCommercialTerms(prev => ({ ...prev, paymentTerms: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>交货周期</Label>
                  <Input 
                    value={commercialTerms.deliveryTime}
                    onChange={(e) => setCommercialTerms(prev => ({ ...prev, deliveryTime: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>质保期</Label>
                  <Input 
                    value={commercialTerms.warranty}
                    onChange={(e) => setCommercialTerms(prev => ({ ...prev, warranty: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>包装要求</Label>
                  <Input 
                    value={commercialTerms.packagingLevel}
                    onChange={(e) => setCommercialTerms(prev => ({ ...prev, packagingLevel: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Products Pricing Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">产品报价汇总</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {products.map((product) => {
                const pricing = getProductPricing(product);
                return (
                  <div key={product.id} className="pb-3 border-b last:border-0">
                    <p className="text-sm mb-2">{product.name}</p>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between text-zinc-600">
                        <span>QS成本</span>
                        <span>¥{product.qsCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-zinc-600">
                        <span>利润率</span>
                        <span>{pricing.calculatedMargin.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>报价</span>
                        <span className="text-green-600">¥{pricing.calculatedPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Financial Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">财务指标</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">总投资</span>
                <span>¥{totalInvestment.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">年收入</span>
                <span>¥{totalAnnualRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">年利润</span>
                <span className="text-green-600">¥{totalAnnualProfit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span>投资回收期</span>
                <span className="text-blue-600">{avgPaybackPeriod.toFixed(2)} 年</span>
              </div>
            </CardContent>
          </Card>

          {/* Validation Status */}
          <Card className={hasInvalidData ? "border-orange-200 bg-orange-50" : "border-green-200 bg-green-50"}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                {hasInvalidData ? (
                  <>
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <span className="text-orange-900">待完成</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-green-900">分析完成</span>
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
                <span className="text-zinc-700">{products.length} 个产品定价</span>
              </div>
              <div className="flex items-center gap-2">
                {hasInvalidData ? (
                  <AlertCircle className="h-3 w-3 text-orange-600" />
                ) : (
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                )}
                <span className="text-zinc-700">
                  {calculationMode === 'price' ? '报价已填写' : '利润率已设置'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
                <span className="text-zinc-700">投资回收已分析</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
                <span className="text-zinc-700">商务条款已确认</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={() => onNavigate('quotation')}>
          返回QS报价摘要
        </Button>
        <div className="flex gap-2">
          <Button variant="outline">
            导出BC分析报告
          </Button>
          <Button 
            onClick={() => onNavigate('quotation-output')}
            disabled={hasInvalidData}
          >
            生成最终报价单 <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}