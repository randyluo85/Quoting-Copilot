import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Calculator, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Package,
  Settings,
  TrendingUpDown,
  Briefcase,
  Box
} from 'lucide-react';
import type { View } from '../App';

interface CostCalculationProps {
  onNavigate: (view: View) => void;
}

// 产品数据类型
interface Product {
  id: string;
  name: string;
  partNumber: string;
  annualVolume: number;
}

// 物料成本
interface MaterialCost {
  id: string;
  partNumber: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
  status: 'normal' | 'anomaly';
  supplier?: string;
}

// 工艺成本
interface ProcessCost {
  id: string;
  opNo: string;
  name: string;
  workCenter: string;
  standardTime: number;
  hourlyRate: number;
  total: number;
}

// 投资成本
interface InvestmentCost {
  id: string;
  name: string;
  category: '模具' | '工装' | '检具' | '设备';
  totalInvestment: number;
  amortizationYears: number;
  annualVolume: number;
  unitCost: number;
}

// 其他成本
interface OtherCost {
  id: string;
  name: string;
  category: '研发' | '认证' | '测试' | '其他';
  totalCost: number;
  unitCost: number;
}

// 产品成本数据
interface ProductCostData {
  materials: MaterialCost[];
  processes: ProcessCost[];
  investments: InvestmentCost[];
  others: OtherCost[];
}

export function CostCalculation({ onNavigate }: CostCalculationProps) {
  const [calcStatus, setCalcStatus] = useState<'calculating' | 'completed'>('calculating');
  const [progress, setProgress] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<string>('P-001');

  // 模拟产品数据
  const products: Product[] = [
    {
      id: 'P-001',
      name: '发动机缸体',
      partNumber: 'ENG-CB-2024',
      annualVolume: 100000
    },
    {
      id: 'P-002',
      name: '发动机缸盖',
      partNumber: 'ENG-CH-2024',
      annualVolume: 100000
    }
  ];

  // 模拟每个产品的成本数据
  const productCostData: Record<string, ProductCostData> = {
    'P-001': {
      materials: [
        { id: 'M-001', partNumber: 'A356-T6', name: '铝合金', quantity: 3.5, unit: 'kg', unitPrice: 28.50, total: 99.75, status: 'normal', supplier: '中国铝业' },
        { id: 'M-002', partNumber: '40Cr', name: '气门座圈', quantity: 8, unit: '个', unitPrice: 12.30, total: 98.40, status: 'normal', supplier: '精密锻造厂' },
        { id: 'M-003', partNumber: 'NBR橡胶', name: '密封垫片', quantity: 4, unit: '个', unitPrice: 3.20, total: 12.80, status: 'normal', supplier: '密封件公司' },
      ],
      processes: [
        { id: 'P-001', opNo: '010', name: '重力铸造', workCenter: '铸造车间', standardTime: 2.5, hourlyRate: 120, total: 45.00 },
        { id: 'P-002', opNo: '020', name: 'CNC精加工', workCenter: '机加车间', standardTime: 5.0, hourlyRate: 180, total: 180.00 },
        { id: 'P-003', opNo: '030', name: '激光打标', workCenter: '表面处理车间', standardTime: 0.5, hourlyRate: 80, total: 5.50 },
        { id: 'P-004', opNo: '040', name: '气密性检测', workCenter: '检测中心', standardTime: 1.0, hourlyRate: 100, total: 8.50 },
        { id: 'P-005', opNo: '050', name: '表面处理', workCenter: '表面处理车间', standardTime: 1.5, hourlyRate: 100, total: 25.00 },
      ],
      investments: [
        { id: 'I-001', name: '铸造模具', category: '模具', totalInvestment: 500000, amortizationYears: 5, annualVolume: 100000, unitCost: 1.00 },
        { id: 'I-002', name: 'CNC加工工装', category: '工装', totalInvestment: 200000, amortizationYears: 4, annualVolume: 100000, unitCost: 0.50 },
        { id: 'I-003', name: '气密性检具', category: '检具', totalInvestment: 100000, amortizationYears: 5, annualVolume: 100000, unitCost: 0.20 },
      ],
      others: [
        { id: 'O-001', name: '产品设计研发', category: '研发', totalCost: 300000, unitCost: 3.00 },
        { id: 'O-002', name: 'PPAP认证', category: '认证', totalCost: 50000, unitCost: 0.50 },
        { id: 'O-003', name: '首件测试', category: '测试', totalCost: 80000, unitCost: 0.80 },
      ]
    },
    'P-002': {
      materials: [
        { id: 'M-101', partNumber: 'Ti-6Al-4V', name: '钛合金板材', quantity: 2.8, unit: 'kg', unitPrice: 85.00, total: 238.00, status: 'normal', supplier: '钛合金供应商' },
        { id: 'M-102', partNumber: 'CF-3M', name: '不锈钢铸件', quantity: 1.5, unit: 'kg', unitPrice: 45.00, total: 67.50, status: 'anomaly' },
        { id: 'M-103', partNumber: 'PEEK材料', name: '高温密封件', quantity: 6, unit: '个', unitPrice: 8.50, total: 51.00, status: 'normal' },
      ],
      processes: [
        { id: 'P-101', opNo: '010', name: '精密锻造', workCenter: '锻造车间', standardTime: 3.2, hourlyRate: 150, total: 120.00 },
        { id: 'P-102', opNo: '020', name: '超精密加工', workCenter: '精密加工中心', standardTime: 8.5, hourlyRate: 220, total: 280.00 },
        { id: 'P-103', opNo: '030', name: '激光熔覆', workCenter: '激光车间', standardTime: 4.0, hourlyRate: 180, total: 150.00 },
        { id: 'P-104', opNo: '040', name: 'X射线探伤', workCenter: '无损检测中心', standardTime: 1.5, hourlyRate: 120, total: 35.00 },
        { id: 'P-105', opNo: '050', name: '真空热处理', workCenter: '热处理车间', standardTime: 6.0, hourlyRate: 100, total: 85.00 },
      ],
      investments: [
        { id: 'I-101', name: '精密锻造模具', category: '模具', totalInvestment: 800000, amortizationYears: 5, annualVolume: 100000, unitCost: 1.60 },
        { id: 'I-102', name: '七轴加工设备', category: '设备', totalInvestment: 1200000, amortizationYears: 5, annualVolume: 100000, unitCost: 2.40 },
        { id: 'I-103', name: 'X射线检测设备', category: '设备', totalInvestment: 600000, amortizationYears: 5, annualVolume: 100000, unitCost: 1.20 },
      ],
      others: [
        { id: 'O-101', name: '新工艺研发', category: '研发', totalCost: 500000, unitCost: 5.00 },
        { id: 'O-102', name: '航空级认证', category: '认证', totalCost: 150000, unitCost: 1.50 },
        { id: 'O-103', name: '全性能测试', category: '测试', totalCost: 200000, unitCost: 2.00 },
      ]
    }
  };

  // 模拟AI计算过程
  useEffect(() => {
    if (calcStatus === 'calculating') {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setCalcStatus('completed');
            return 100;
          }
          return prev + 10;
        });
      }, 200);
      return () => clearInterval(interval);
    }
  }, [calcStatus]);

  // 获取当前产品的成本数据
  const currentProductData = productCostData[selectedProduct];
  const currentProduct = products.find(p => p.id === selectedProduct)!;

  // 计算成本汇总
  const costSummary = {
    material: currentProductData.materials.reduce((sum, item) => sum + item.total, 0),
    process: currentProductData.processes.reduce((sum, item) => sum + item.total, 0),
    investment: currentProductData.investments.reduce((sum, item) => sum + item.unitCost, 0),
    other: currentProductData.others.reduce((sum, item) => sum + item.unitCost, 0),
    total: 0
  };
  
  costSummary.total = costSummary.material + costSummary.process + costSummary.investment + costSummary.other;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-2">
          <h1 className="text-2xl mb-1">成本核算</h1>
          <p className="text-sm text-zinc-500">基于BOM数据智能计算物料、工艺、投资、其他四项成本</p>
        </div>

        {/* Cost Summary */}
        <>
          {/* Product Tabs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Box className="h-5 w-5" />
                产品成本明细
              </CardTitle>
              <CardDescription>选择产品查看详细的成本构成</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedProduct} onValueChange={setSelectedProduct}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  {products.map((product) => (
                    <TabsTrigger key={product.id} value={product.id}>
                      {product.name}
                      <Badge variant="outline" className="ml-2 text-[10px] px-1.5">
                        {product.partNumber}
                      </Badge>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {products.map((product) => (
                  <TabsContent key={product.id} value={product.id}>
                    {/* Cost Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <Package className="h-4 w-4 text-blue-600" />
                            <p className="text-xs text-zinc-500">物料成本</p>
                          </div>
                          <p className="text-xl">¥{costSummary.material.toFixed(2)}</p>
                          <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
                            <TrendingDown className="h-3 w-3" />
                            <span>优化 5%</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <Settings className="h-4 w-4 text-purple-600" />
                            <p className="text-xs text-zinc-500">工艺成本</p>
                          </div>
                          <p className="text-xl">¥{costSummary.process.toFixed(2)}</p>
                          <div className="flex items-center gap-1 mt-1 text-xs text-zinc-500">
                            <TrendingUp className="h-3 w-3" />
                            <span>符合预期</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <TrendingUpDown className="h-4 w-4 text-orange-600" />
                            <p className="text-xs text-zinc-500">投资分摊</p>
                          </div>
                          <p className="text-xl">¥{costSummary.investment.toFixed(2)}</p>
                          <div className="flex items-center gap-1 mt-1 text-xs text-zinc-500">
                            <span>{currentProductData.investments.length} 项投资</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <Briefcase className="h-4 w-4 text-zinc-600" />
                            <p className="text-xs text-zinc-500">其他成本</p>
                          </div>
                          <p className="text-xl">¥{costSummary.other.toFixed(2)}</p>
                          <div className="flex items-center gap-1 mt-1 text-xs text-zinc-500">
                            <span>{currentProductData.others.length} 项费用</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-2 border-zinc-900">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <Calculator className="h-4 w-4" />
                            <p className="text-xs text-zinc-500">总成本</p>
                          </div>
                          <p className="text-xl font-semibold">¥{costSummary.total.toFixed(2)}</p>
                          <div className="flex items-center gap-1 mt-1 text-xs">
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                            <span className="text-green-600">已完成</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Detailed Cost Breakdown */}
                    <Tabs defaultValue="material">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="material">
                          物料清单 ({currentProductData.materials.length})
                        </TabsTrigger>
                        <TabsTrigger value="process">
                          工艺清单 ({currentProductData.processes.length})
                        </TabsTrigger>
                        <TabsTrigger value="investment">
                          投资清单 ({currentProductData.investments.length})
                        </TabsTrigger>
                        <TabsTrigger value="other">
                          其他清单 ({currentProductData.others.length})
                        </TabsTrigger>
                      </TabsList>

                      {/* Material Tab */}
                      <TabsContent value="material" className="mt-4">
                        <div className="border rounded-lg">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>物料编码</TableHead>
                                <TableHead>物料名称</TableHead>
                                <TableHead>供应商</TableHead>
                                <TableHead className="text-right">数量</TableHead>
                                <TableHead className="text-right">单价</TableHead>
                                <TableHead className="text-right">金额</TableHead>
                                <TableHead>状态</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {currentProductData.materials.map((item) => (
                                <TableRow key={item.id}>
                                  <TableCell className="font-mono text-xs">{item.partNumber}</TableCell>
                                  <TableCell>{item.name}</TableCell>
                                  <TableCell className="text-xs text-zinc-500">{item.supplier || '-'}</TableCell>
                                  <TableCell className="text-right">{item.quantity} {item.unit}</TableCell>
                                  <TableCell className="text-right">¥{item.unitPrice.toFixed(2)}</TableCell>
                                  <TableCell className="text-right font-medium">¥{item.total.toFixed(2)}</TableCell>
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
                              <TableRow className="bg-zinc-50">
                                <TableCell colSpan={5} className="font-medium">物料成本小计</TableCell>
                                <TableCell className="text-right font-semibold">
                                  ¥{costSummary.material.toFixed(2)}
                                </TableCell>
                                <TableCell></TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                      </TabsContent>

                      {/* Process Tab */}
                      <TabsContent value="process" className="mt-4">
                        <div className="border rounded-lg">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>工序号</TableHead>
                                <TableHead>工序名称</TableHead>
                                <TableHead>工作中心</TableHead>
                                <TableHead className="text-right">标准工时 (h)</TableHead>
                                <TableHead className="text-right">小时费率 (¥/h)</TableHead>
                                <TableHead className="text-right">工艺成本</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {currentProductData.processes.map((item) => (
                                <TableRow key={item.id}>
                                  <TableCell className="font-mono text-xs">{item.opNo}</TableCell>
                                  <TableCell>{item.name}</TableCell>
                                  <TableCell className="text-xs text-zinc-500">{item.workCenter}</TableCell>
                                  <TableCell className="text-right">{item.standardTime.toFixed(2)}</TableCell>
                                  <TableCell className="text-right">¥{item.hourlyRate}</TableCell>
                                  <TableCell className="text-right font-medium">¥{item.total.toFixed(2)}</TableCell>
                                </TableRow>
                              ))}
                              <TableRow className="bg-zinc-50">
                                <TableCell colSpan={5} className="font-medium">工艺成本小计</TableCell>
                                <TableCell className="text-right font-semibold">
                                  ¥{costSummary.process.toFixed(2)}
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                      </TabsContent>

                      {/* Investment Tab */}
                      <TabsContent value="investment" className="mt-4">
                        <div className="border rounded-lg">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>投资项目</TableHead>
                                <TableHead>类别</TableHead>
                                <TableHead className="text-right">总投资 (¥)</TableHead>
                                <TableHead className="text-right">分摊年份</TableHead>
                                <TableHead className="text-right">年量 (pcs)</TableHead>
                                <TableHead className="text-right">单件分摊 (¥)</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {currentProductData.investments.map((item) => (
                                <TableRow key={item.id}>
                                  <TableCell>{item.name}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline">{item.category}</Badge>
                                  </TableCell>
                                  <TableCell className="text-right">¥{item.totalInvestment.toLocaleString()}</TableCell>
                                  <TableCell className="text-right">{item.amortizationYears} 年</TableCell>
                                  <TableCell className="text-right">{item.annualVolume.toLocaleString()}</TableCell>
                                  <TableCell className="text-right font-medium">¥{item.unitCost.toFixed(2)}</TableCell>
                                </TableRow>
                              ))}
                              <TableRow className="bg-zinc-50">
                                <TableCell colSpan={5} className="font-medium">投资分摊小计</TableCell>
                                <TableCell className="text-right font-semibold">
                                  ¥{costSummary.investment.toFixed(2)}
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                      </TabsContent>

                      {/* Other Costs Tab */}
                      <TabsContent value="other" className="mt-4">
                        <div className="border rounded-lg">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>费用项目</TableHead>
                                <TableHead>类别</TableHead>
                                <TableHead className="text-right">总费用 (¥)</TableHead>
                                <TableHead className="text-right">单件分摊 (¥)</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {currentProductData.others.map((item) => (
                                <TableRow key={item.id}>
                                  <TableCell>{item.name}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline">{item.category}</Badge>
                                  </TableCell>
                                  <TableCell className="text-right">¥{item.totalCost.toLocaleString()}</TableCell>
                                  <TableCell className="text-right font-medium">¥{item.unitCost.toFixed(2)}</TableCell>
                                </TableRow>
                              ))}
                              <TableRow className="bg-zinc-50">
                                <TableCell colSpan={3} className="font-medium">其他成本小计</TableCell>
                                <TableCell className="text-right font-semibold">
                                  ¥{costSummary.other.toFixed(2)}
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => onNavigate('bom')}>
            返回BOM管理
          </Button>
          <Button onClick={() => onNavigate('quotation')}>
            生成QS报价 <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}