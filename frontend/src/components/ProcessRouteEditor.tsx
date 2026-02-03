/**
 * 工艺路线编辑器
 *
 * 用于创建和编辑工艺路线，支持工序的增删改、拖拽排序、实时成本计算
 *
 * 设计规范: docs/plans/2026-02-03-process-assessment-design.md
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Plus, Trash2, GripVertical, Save, Send } from 'lucide-react';

// 工序数据类型（编辑用）
export interface ProcessItemEdit {
  id: string;
  operationNo: string;      // 工序号，如 OP010
  processCode: string;      // 工序编码（关联 process_rates）
  processName?: string;     // 工序名称（从 process_rates 获取）
  equipment?: string;       // 设备（从 process_rates 获取）
  sequence: number;         // 排序顺序
  cycleTimeStd: number;     // 标准工时（秒）
  cycleTimeVave?: number;   // VAVE 工时（秒）
  personnelStd: number;     // 标准人工配置
  personnelVave?: number;   // VAVE 人工配置
  stdMhrVar?: number;       // 标准变动费率（快照）
  stdMhrFix?: number;       // 标准固定费率（快照）
  vaveMhrVar?: number;      // VAVE 变动费率（快照）
  vaveMhrFix?: number;      // VAVE 固定费率（快照）
  efficiencyFactor: number; // 效率系数
  remarks?: string;
}

// 工艺路线数据类型
export interface ProcessRouteEdit {
  id?: string;              // 工艺路线编码（编辑时存在）
  name: string;             // 工艺路线名称
  status: 'draft' | 'pending' | 'active' | 'deprecated';
  version?: number;
  items: ProcessItemEdit[];
  remarks?: string;
}

// 成本汇总类型
interface CostSummary {
  totalStdCost: number;
  totalVaveCost: number;
  totalSavings: number;
  savingsRate: number;
}

// 可用的工序选项（从 process_rates 表获取）
interface ProcessRateOption {
  processCode: string;
  processName: string;
  equipment: string;
  stdMhrVar: number;
  stdMhrFix: number;
  vaveMhrVar: number;
  vaveMhrFix: number;
}

interface ProcessRouteEditorProps {
  initialData?: ProcessRouteEdit;       // 初始数据（编辑时）
  availableProcesses: ProcessRateOption[]; // 可用的工序列表
  onSave: (data: ProcessRouteEdit) => void;
  onSubmit?: () => void;                 // 提交审批
  onCancel: () => void;
  isSaving?: boolean;
  readOnly?: boolean;                    // 只读模式
}

// 计算单个工序成本
const calculateItemCost = (item: ProcessItemEdit): { stdCost: number; vaveCost: number } => {
  const laborRate = 50; // 默认人工时薪（元/小时），实际应从配置获取

  // 标准成本 = (cycleTimeStd / 3600) × (stdMhrVar + stdMhrFix + personnelStd × laborRate)
  const hoursStd = (item.cycleTimeStd || 0) / 3600;
  const mhrStd = (item.stdMhrVar || 0) + (item.stdMhrFix || 0);
  const personnelCostStd = item.personnelStd * laborRate;
  const stdCost = hoursStd * (mhrStd + personnelCostStd);

  // VAVE 成本
  const cycleTimeVave = item.cycleTimeVave || item.cycleTimeStd;
  const personnelVave = item.personnelVave !== undefined ? item.personnelVave : item.personnelStd;
  const hoursVave = cycleTimeVave / 3600;
  const mhrVave = (item.vaveMhrVar || item.stdMhrVar || 0) + (item.vaveMhrFix || item.stdMhrFix || 0);
  const personnelCostVave = personnelVave * laborRate;
  const vaveCost = hoursVave * (mhrVave + personnelCostVave);

  return { stdCost, vaveCost };
};

// 生成工序号
const generateOperationNo = (index: number): string => {
  const num = (index + 1) * 10;
  return `OP${String(num).padStart(3, '0')}`;
};

export function ProcessRouteEditor({
  initialData,
  availableProcesses,
  onSave,
  onSubmit,
  onCancel,
  isSaving = false,
  readOnly = false,
}: ProcessRouteEditorProps) {
  // 表单状态
  const [name, setName] = useState(initialData?.name || '');
  const [items, setItems] = useState<ProcessItemEdit[]>(
    initialData?.items || []
  );
  const [remarks, setRemarks] = useState(initialData?.remarks || '');

  // 计算成本汇总
  const calculateSummary = (): CostSummary => {
    let totalStd = 0;
    let totalVave = 0;

    items.forEach((item) => {
      const { stdCost, vaveCost } = calculateItemCost(item);
      totalStd += stdCost;
      totalVave += vaveCost;
    });

    const savings = totalStd - totalVave;
    const savingsRate = totalStd > 0 ? (savings / totalStd) * 100 : 0;

    return {
      totalStdCost: totalStd,
      totalVaveCost: totalVave,
      totalSavings: savings,
      savingsRate,
    };
  };

  const summary = calculateSummary();

  // 添加工序
  const handleAddItem = () => {
    const newItem: ProcessItemEdit = {
      id: `new-${Date.now()}`,
      operationNo: generateOperationNo(items.length),
      processCode: '',
      sequence: items.length,
      cycleTimeStd: 0,
      personnelStd: 1.0,
      efficiencyFactor: 1.0,
    };
    setItems([...items, newItem]);
  };

  // 删除工序
  const handleDeleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  // 更新工序字段
  const handleUpdateItem = (id: string, field: keyof ProcessItemEdit, value: any) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  // 选择工序时，自动填充从 process_rates 获取的数据
  const handleProcessSelect = (id: string, processCode: string) => {
    const process = availableProcesses.find((p) => p.processCode === processCode);
    if (process) {
      setItems(
        items.map((item) =>
          item.id === id
            ? {
                ...item,
                processCode,
                processName: process.processName,
                equipment: process.equipment,
                stdMhrVar: process.stdMhrVar,
                stdMhrFix: process.stdMhrFix,
                vaveMhrVar: process.vaveMhrVar,
                vaveMhrFix: process.vameMhrFix,
              }
            : item
        )
      );
    }
  };

  // 保存
  const handleSave = () => {
    const data: ProcessRouteEdit = {
      id: initialData?.id,
      name,
      status: initialData?.status || 'draft',
      version: initialData?.version,
      items: items.map((item, index) => ({ ...item, sequence: index })),
      remarks,
    };
    onSave(data);
  };

  // 状态标签
  const statusBadge = () => {
    const status = initialData?.status || 'draft';
    const variants: Record<string, 'outline' | 'secondary'> = {
      draft: 'outline',
      pending: 'secondary',
      active: 'outline',
      deprecated: 'secondary',
    };
    const labels: Record<string, string> = {
      draft: '草稿',
      pending: '待审批',
      active: '生效',
      deprecated: '已废弃',
    };
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  return (
    <div className="max-w-5xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>工艺路线编辑</CardTitle>
              <CardDescription>
                {initialData?.id ? `编辑工艺路线: ${initialData.id}` : '创建新工艺路线'}
              </CardDescription>
            </div>
            {statusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 基本信息 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="route-name">工艺路线名称 *</Label>
              <Input
                id="route-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="如：铝合金缸体标准工艺"
                disabled={readOnly}
              />
            </div>
          </div>

          {/* 工序明细 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>工序明细</Label>
              {!readOnly && (
                <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                  <Plus className="h-4 w-4 mr-1" />
                  添加工序
                </Button>
              )}
            </div>

            {items.length === 0 ? (
              <div className="text-center py-8 text-zinc-400 border rounded-lg border-dashed">
                暂无工序，点击"添加工序"开始编辑
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10" />
                    <TableHead className="w-24">工序号</TableHead>
                    <TableHead>工序名称</TableHead>
                    <TableHead className="w-24">工时(秒)</TableHead>
                    <TableHead className="w-24">VAVE工时</TableHead>
                    <TableHead className="w-24">人工配置</TableHead>
                    <TableHead className="w-24 text-right">标准成本</TableHead>
                    <TableHead className="w-24 text-right">VAVE成本</TableHead>
                    {!readOnly && <TableHead className="w-10" />}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => {
                    const costs = calculateItemCost(item);
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="text-zinc-400">
                          <GripVertical className="h-4 w-4" />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={item.operationNo}
                            onChange={(e) => handleUpdateItem(item.id, 'operationNo', e.target.value)}
                            disabled={readOnly}
                            className="font-mono text-xs"
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={item.processCode}
                            onValueChange={(value) => {
                              handleUpdateItem(item.id, 'processCode', value);
                              handleProcessSelect(item.id, value);
                            }}
                            disabled={readOnly}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="选择工序" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableProcesses.map((process) => (
                                <SelectItem key={process.processCode} value={process.processCode}>
                                  {process.processName} ({process.processCode})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.cycleTimeStd || ''}
                            onChange={(e) => handleUpdateItem(item.id, 'cycleTimeStd', Number(e.target.value))}
                            disabled={readOnly}
                            min={0}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.cycleTimeVave || ''}
                            onChange={(e) => handleUpdateItem(item.id, 'cycleTimeVave', Number(e.target.value) || undefined)}
                            disabled={readOnly}
                            min={0}
                            placeholder="可选"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.personnelStd}
                            onChange={(e) => handleUpdateItem(item.id, 'personnelStd', Number(e.target.value))}
                            disabled={readOnly}
                            min={0}
                            step={0.1}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          ¥{costs.stdCost.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={costs.vaveCost < costs.stdCost ? 'text-green-600' : ''}>
                            ¥{costs.vaveCost.toFixed(2)}
                          </span>
                        </TableCell>
                        {!readOnly && (
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4 text-zinc-400 hover:text-red-500" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>

          {/* 成本汇总 */}
          <div className="bg-zinc-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600">成本汇总</span>
              <div className="text-right">
                <div className="text-sm">
                  标准: <span className="font-semibold">¥{summary.totalStdCost.toFixed(2)}</span>
                  {' '} / VAVE: <span className="font-semibold text-green-600">¥{summary.totalVaveCost.toFixed(2)}</span>
                </div>
                {summary.totalSavings > 0 && (
                  <div className="text-xs text-green-600">
                    节省 ¥{summary.totalSavings.toFixed(2)} ({summary.savingsRate.toFixed(1)}%)
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 备注 */}
          <div className="space-y-2">
            <Label htmlFor="remarks">备注</Label>
            <Textarea
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="添加备注说明..."
              disabled={readOnly}
              rows={3}
            />
          </div>

          {/* 操作按钮 */}
          {!readOnly && (
            <div className="flex justify-between pt-4 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                取消
              </Button>
              <div className="flex gap-2">
                {onSubmit && initialData?.status === 'draft' && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onSubmit}
                    disabled={!name || items.length === 0}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    提交审批
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={!name || isSaving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? '保存中...' : '保存'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
