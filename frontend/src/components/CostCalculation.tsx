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
  TrendingDown,
  TrendingUp,
  Package,
  Settings,
  Briefcase,
  Box,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import type { View } from '../App';
import { useProjectStore } from '../lib/store';
import { useBOMStore, Material, Process, useCostStore } from '../lib/store';

interface CostCalculationProps {
  onNavigate: (view: View) => void;
}

// 产品数据类型（从项目数据中获取）
interface Product {
  id: string;
  name: string;
  partNumber: string;
  annualVolume: number;
}

export function CostCalculation({ onNavigate }: CostCalculationProps) {
  // Store 状态
  const selectedProject = useProjectStore((state) => state.selectedProject);
  const { materials, processes } = useBOMStore();
  const { result, calculating, error, calculate } = useCostStore();

  // 本地状态
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [calcStatus, setCalcStatus] = useState<'idle' | 'calculating' | 'completed' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 当前产品列表（从项目数据中获取）
  const products: Product[] = selectedProject?.products || [];

  // 初始化：选择第一个产品
  useEffect(() => {
    if (products.length > 0 && !selectedProductId) {
      setSelectedProductId(products[0].id);
    }
  }, [products, selectedProductId]);

  // 当产品或 BOM 数据变化时，自动触发计算
  useEffect(() => {
    if (selectedProject && selectedProductId && materials.length > 0) {
      performCalculation();
    }
  }, [selectedProject, selectedProductId, materials, processes]);

  // 执行成本计算
  const performCalculation = async () => {
    if (!selectedProject || !selectedProductId) return;

    setCalcStatus('calculating');
    setErrorMessage(null);

    try {
      // 准备请求数据
      const materialsRequest = materials.map((m) => ({
        code: m.partNumber,
        quantity: m.quantity,
      }));

      const processesRequest = processes.map((p) => ({
        name: p.name,
        cycle_time: p.standardTime,
      }));

      // 调用 API
      await calculate(selectedProject.id, selectedProductId, materialsRequest, processesRequest);

      setCalcStatus('completed');
    } catch (err) {
      const message = err instanceof Error ? err.message : '成本计算失败';
      setErrorMessage(message);
      setCalcStatus('error');
    }
  };

  // 手动刷新计算
  const handleRecalculate = () => {
    performCalculation();
  };

  // 当前产品
  const currentProduct = products.find((p) => p.id === selectedProductId);

  // 计算成本汇总（从真实 API 结果）
  const getCostSummary = () => {
    if (!result) {
      return { material: { std: 0, vave: 0, savings: 0, savingsRate: 0 }, process: { std: 0, vave: 0, savings: 0, savingsRate: 0 }, total: { std: 0, vave: 0, savings: 0, savingsRate: 0 } };
    }

    return {
      material: result.materialCost,
      process: result.processCost,
      total: result.totalCost,
    };
  };

  const costSummary = getCostSummary();

  // 判断是否有数据
  const hasData = materials.length > 0 || processes.length > 0;
  const isLoading = calcStatus === 'calculating' || calculating;

  return (
    <div className="px-4 py-8 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-2 flex items-center justify-between">
          <div>
            <h1 className="text-2xl mb-1">成本核算</h1>
            <p className="text-sm text-zinc-500">
              {selectedProject ? `项目: ${selectedProject.projectName}` : '请先选择项目'}
              {currentProduct && ` / 产品: ${currentProduct.name}`}
            </p>
          </div>
          {hasData && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRecalculate}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  计算中...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  重新计算
                </>
              )}
            </Button>
          )}
        </div>

        {/* 错误提示 */}
        {errorMessage && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <span>{errorMessage}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 无数据提示 */}
        {!hasData && !isLoading && (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="mx-auto h-12 w-12 text-zinc-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">暂无成本数据</h3>
              <p className="text-sm text-zinc-500 mb-6">
                请先在 BOM 管理页面上传物料和工艺数据
              </p>
              <Button variant="outline" onClick={() => onNavigate('bom')}>
                前往 BOM 管理
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 有数据时显示成本明细 */}
        {hasData && (
          <>
            {/* Product Tabs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Box className="h-5 w-5" />
                  产品成本明细
                </CardTitle>
                <CardDescription>
                  选择产品查看详细的成本构成（双轨计价：标准成本 vs VAVE 目标成本）
                </CardDescription>
              </CardHeader>
              <CardContent>
                {products.length > 1 ? (
                  <Tabs value={selectedProductId} onValueChange={setSelectedProductId}>
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
                        {renderCostDetail(costSummary, materials, processes, product)}
                      </TabsContent>
                    ))}
                  </Tabs>
                ) : (
                  renderCostDetail(costSummary, materials, processes, currentProduct)
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => onNavigate('bom')}>
            返回BOM管理
          </Button>
          <Button
            onClick={() => onNavigate('quotation')}
            disabled={!result || calcStatus !== 'completed'}
          >
            生成QS报价 <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// 成本详情渲染组件
function renderCostDetail(
  costSummary: any,
  materials: Material[],
  processes: Process[],
  product: Product | undefined
) {
  return (
    <>
      {/* Cost Summary Cards - 双轨计价显示 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* 物料成本 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-blue-600" />
              <p className="text-xs text-zinc-500">物料成本</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-zinc-500">标准</span>
                <span className="text-lg">¥{costSummary.material.std.toFixed(2)}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-zinc-500">VAVE</span>
                <span className="text-lg text-green-600">¥{costSummary.material.vave.toFixed(2)}</span>
              </div>
              {costSummary.material.savings > 0 && (
                <div className="flex items-center gap-1 mt-2 text-xs text-green-600 border-t pt-2">
                  <TrendingDown className="h-3 w-3" />
                  <span>
                    节省 ¥{costSummary.material.savings.toFixed(2)} ({(costSummary.material.savingsRate * 100).toFixed(1)}%)
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 工艺成本 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="h-4 w-4 text-purple-600" />
              <p className="text-xs text-zinc-500">工艺成本</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-zinc-500">标准</span>
                <span className="text-lg">¥{costSummary.process.std.toFixed(2)}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-zinc-500">VAVE</span>
                <span className="text-lg text-green-600">¥{costSummary.process.vave.toFixed(2)}</span>
              </div>
              {costSummary.process.savings > 0 && (
                <div className="flex items-center gap-1 mt-2 text-xs text-green-600 border-t pt-2">
                  <TrendingDown className="h-3 w-3" />
                  <span>
                    节省 ¥{costSummary.process.savings.toFixed(2)} ({(costSummary.process.savingsRate * 100).toFixed(1)}%)
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 总成本 */}
        <Card className="border-2 border-zinc-900">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="h-4 w-4" />
              <p className="text-xs text-zinc-500">总成本</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-zinc-500">标准</span>
                <span className="text-xl font-semibold">¥{costSummary.total.std.toFixed(2)}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-zinc-500">VAVE</span>
                <span className="text-xl font-semibold text-green-600">¥{costSummary.total.vave.toFixed(2)}</span>
              </div>
              {costSummary.total.savings > 0 && (
                <div className="flex items-center gap-1 mt-2 text-sm text-green-600 border-t pt-2">
                  <TrendingDown className="h-3 w-3" />
                  <span className="font-medium">
                    节省 ¥{costSummary.total.savings.toFixed(2)} ({(costSummary.total.savingsRate * 100).toFixed(1)}%)
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Cost Breakdown */}
      <Tabs defaultValue="material">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="material">
            物料清单 ({materials.length})
          </TabsTrigger>
          <TabsTrigger value="process">
            工艺清单 ({processes.length})
          </TabsTrigger>
        </TabsList>

        {/* Material Tab */}
        <TabsContent value="material" className="mt-4">
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>物料编码</TableHead>
                  <TableHead>物料名称</TableHead>
                  <TableHead>供应商</TableHead>
                  <TableHead className="text-right">数量</TableHead>
                  <TableHead className="text-right">标准单价</TableHead>
                  <TableHead className="text-right">VAVE单价</TableHead>
                  <TableHead className="text-right">标准金额</TableHead>
                  <TableHead className="text-right">VAVE金额</TableHead>
                  <TableHead>状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materials.map((item) => {
                  const stdTotal = item.quantity * (item.unitPrice || 0);
                  const vaveTotal = item.quantity * (item.vavePrice || item.unitPrice || 0);
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-xs">{item.partNumber}</TableCell>
                      <TableCell>{item.partName}</TableCell>
                      <TableCell className="text-xs text-zinc-500">{item.supplier || '-'}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        {item.unitPrice ? `¥${item.unitPrice.toFixed(2)}` : '-'}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        {item.vavePrice ? `¥${item.vavePrice.toFixed(2)}` : '-'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ¥{stdTotal.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        ¥{vaveTotal.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {item.status === 'verified' && (
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            已验证
                          </Badge>
                        )}
                        {item.status === 'warning' && (
                          <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            AI估算
                          </Badge>
                        )}
                        {item.status === 'missing' && (
                          <Badge variant="outline" className="border-red-500 text-red-600">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            缺失
                          </Badge>
                        )}
                        {!item.status && (
                          <Badge variant="secondary">正常</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow className="bg-zinc-50">
                  <TableCell colSpan={6} className="font-medium">物料成本小计</TableCell>
                  <TableCell className="text-right font-semibold">
                    ¥{costSummary.material.std.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-green-600">
                    ¥{costSummary.material.vave.toFixed(2)}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Process Tab */}
        <TabsContent value="process" className="mt-4">
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>工序号</TableHead>
                  <TableHead>工序名称</TableHead>
                  <TableHead>工作中心</TableHead>
                  <TableHead className="text-right">标准工时 (h)</TableHead>
                  <TableHead className="text-right">标准费率</TableHead>
                  <TableHead className="text-right">VAVE费率</TableHead>
                  <TableHead className="text-right">标准成本</TableHead>
                  <TableHead className="text-right">VAVE成本</TableHead>
                  <TableHead>状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processes.map((item) => {
                  const stdCost = item.standardTime * (item.unitPrice || 0);
                  const vaveCost = item.standardTime * (item.vavePrice || item.unitPrice || 0);
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-xs">{item.opNo || '-'}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell className="text-xs text-zinc-500">{item.workCenter}</TableCell>
                      <TableCell className="text-right">{item.standardTime.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        {item.unitPrice ? `¥${item.unitPrice.toFixed(2)}` : '-'}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        {item.vavePrice ? `¥${item.vavePrice.toFixed(2)}` : '-'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ¥{stdCost.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        ¥{vaveCost.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {item.hasHistoryData ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            已验证
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            待确认
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow className="bg-zinc-50">
                  <TableCell colSpan={6} className="font-medium">工艺成本小计</TableCell>
                  <TableCell className="text-right font-semibold">
                    ¥{costSummary.process.std.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-green-600">
                    ¥{costSummary.process.vave.toFixed(2)}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
