/**
 * 工艺路线预览卡片
 *
 * 在 BOM 页面内嵌显示，展示成熟工艺路线或提示需要评估
 *
 * 设计规范: docs/plans/2026-02-03-process-assessment-design.md
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { CheckCircle2, AlertCircle, ArrowRight, Edit3 } from 'lucide-react';

// 工序数据类型
interface ProcessItem {
  id: string;
  operationNo: string;      // 工序号，如 OP010
  processName: string;      // 工序名称
  equipment: string;        // 设备
  cycleTimeStd: number;     // 标准工时（秒）
  stdCost: number;          // 标准成本
  vaveCost?: number;        // VAVE 成本（可选）
}

// 工艺路线数据类型
interface ProcessRouteData {
  id: string;               // 工艺路线编码，如 PR-2024-001
  name: string;             // 工艺路线名称
  status: 'active' | 'pending' | 'draft';
  itemCount: number;        // 工序数量
  items: ProcessItem[];     // 工序列表
  totalStdCost: number;     // 总标准成本
  totalVaveCost?: number;   // 总 VAVE 成本
  totalSavings?: number;    // 总节省金额
}

interface ProcessPreviewCardProps {
  routeId?: string;                     // 工艺路线编码（如果有）
  routeData?: ProcessRouteData;         // 工艺路线数据（已加载）
  isLoading?: boolean;                  // 加载状态
  onEdit?: () => void;                  // 编辑回调
  onNavigateToAssessment?: () => void;  // 跳转到工艺评估页面
}

export function ProcessPreviewCard({
  routeId,
  routeData,
  isLoading = false,
  onEdit,
  onNavigateToAssessment,
}: ProcessPreviewCardProps) {
  // 计算节省金额和节省率
  const calculateSavings = () => {
    if (!routeData) return null;
    const stdCost = routeData.totalStdCost || 0;
    const vaveCost = routeData.totalVaveCost || 0;
    const savings = stdCost - vaveCost;
    const savingsRate = stdCost > 0 ? (savings / stdCost) * 100 : 0;
    return { savings, savingsRate };
  };

  // 成熟工艺展示
  if (routeData && routeId) {
    const savings = calculateSavings();

    return (
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <CardTitle className="text-lg">工艺路线</CardTitle>
            <Badge variant="outline" className="text-green-600 border-green-200">
              成熟工艺
            </Badge>
          </div>
          <div className="flex gap-2">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit3 className="h-4 w-4 mr-1" />
                编辑
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* 工艺路线基本信息 */}
          <div className="mb-4 p-3 bg-zinc-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-600">工艺路线: </span>
              <span className="font-medium">{routeData.id} ({routeData.name})</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-zinc-600">工序数: </span>
              <span className="font-medium">{routeData.itemCount} 道</span>
            </div>
          </div>

          {/* 工序列表 */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">工序号</TableHead>
                <TableHead>名称</TableHead>
                <TableHead>设备</TableHead>
                <TableHead className="w-20">工时</TableHead>
                <TableHead className="w-24 text-right">标准成本</TableHead>
                {(routeData.items.some(i => i.vaveCost)) && (
                  <TableHead className="w-24 text-right">VAVE成本</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {routeData.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs">{item.operationNo}</TableCell>
                  <TableCell>{item.processName}</TableCell>
                  <TableCell className="text-zinc-600">{item.equipment}</TableCell>
                  <TableCell>{item.cycleTimeStd}s</TableCell>
                  <TableCell className="text-right">
                    ¥{item.stdCost.toFixed(2)}
                  </TableCell>
                  {(routeData.items.some(i => i.vaveCost)) && (
                    <TableCell className="text-right">
                      {item.vaveCost !== undefined ? (
                        <span className={item.vaveCost < item.stdCost ? 'text-green-600' : ''}>
                          ¥{item.vaveCost.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-zinc-400">-</span>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* 成本汇总 */}
          <div className="mt-4 pt-4 border-t flex justify-between items-center">
            <div className="text-sm text-zinc-600">工艺成本</div>
            <div className="text-right">
              <div className="text-sm">
                标准: <span className="font-semibold">¥{routeData.totalStdCost.toFixed(2)}</span>
                {savings && routeData.totalVaveCost && (
                  <> / VAVE: <span className="font-semibold text-green-600">¥{routeData.totalVaveCost.toFixed(2)}</span></>
                )}
              </div>
              {savings && savings.savings > 0 && (
                <div className="text-xs text-green-600">
                  节省 ¥{savings.savings.toFixed(2)} ({savings.savingsRate.toFixed(1)}%)
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 新工艺提示（需要评估）
  if (!routeId && !routeData) {
    return (
      <Card className="mt-6 border-amber-200 bg-amber-50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-lg text-amber-800">工艺路线待评估</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-amber-700 mb-4">
            该产品使用新工艺路线，需要 IE 工程师进行评估
          </p>
          {onNavigateToAssessment && (
            <Button className="bg-amber-600 hover:bg-amber-700" onClick={onNavigateToAssessment}>
              前往评估
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // 加载状态
  if (isLoading) {
    return (
      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-center text-zinc-400">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-zinc-400 mr-2" />
            加载工艺路线...
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
