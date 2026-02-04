/**
 * 工艺评估主页面
 *
 * 工艺路线管理：列表展示、筛选搜索、新建编辑
 *
 * 设计规范: docs/plans/2026-02-03-process-assessment-design.md
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from './ui/sheet';
import { Plus, Search, Eye, Edit3, Copy, History, Trash2, ArrowLeft } from 'lucide-react';
import { ProcessRouteEditor, ProcessRouteEdit, ProcessItemEdit } from './ProcessRouteEditor';
import type { View } from '../App';

// 工艺路线状态
type RouteStatus = 'draft' | 'pending' | 'active' | 'deprecated';

// 工艺路线列表项
interface ProcessRouteListItem {
  id: string;               // 工艺路线编码
  name: string;             // 工艺路线名称
  status: RouteStatus;
  version: number;
  itemCount: number;        // 工序数量
  totalStdCost: number;     // 总标准成本
  totalVaveCost: number;    // 总 VAVE 成本
  updatedAt: string;        // 更新时间
}

// 工序费率选项（用于编辑器）
interface ProcessRateOption {
  processCode: string;
  processName: string;
  equipment: string;
  stdMhrVar: number;
  stdMhrFix: number;
  vaveMhrVar: number;
  vaveMhrFix: number;
}

interface ProcessAssessmentProps {
  onNavigate: (view: View) => void;
}

// 状态标签配置
const STATUS_CONFIG = {
  draft: { label: '草稿', color: 'secondary' as const, icon: '🟡' },
  pending: { label: '待审批', color: 'outline' as const, icon: '🔵' },
  active: { label: '生效', color: 'outline' as const, icon: '🟢' },
  deprecated: { label: '已废弃', color: 'secondary' as const, icon: '⚪' },
};

export function ProcessAssessment({ onNavigate }: ProcessAssessmentProps) {
  // 列表数据状态
  const [routes, setRoutes] = useState<ProcessRouteListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 筛选状态
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [keyword, setKeyword] = useState('');

  // 编辑器状态
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<ProcessRouteEdit | undefined>();
  const [isSaving, setIsSaving] = useState(false);

  // 可用的工序选项（模拟数据，实际应从 API 获取）
  const [availableProcesses, setAvailableProcesses] = useState<ProcessRateOption[]>([]);

  // 加载工艺路线列表
  useEffect(() => {
    loadRoutes();
    loadAvailableProcesses();
  }, [statusFilter, keyword]);

  const loadRoutes = async () => {
    setIsLoading(true);
    try {
      // 构建查询参数
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (keyword) {
        params.append('keyword', keyword);
      }

      const response = await fetch(`http://localhost:8000/api/v1/process-routes?${params}`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();

      // 转换 API 响应为前端类型
      const routesData: ProcessRouteListItem[] = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        status: item.status,
        version: item.version,
        itemCount: item.item_count,
        totalStdCost: parseFloat(item.total_std_cost) || 0,
        totalVaveCost: parseFloat(item.total_vave_cost) || 0,
        updatedAt: item.updated_at,
      }));

      setRoutes(routesData);
    } catch (error) {
      console.error('Failed to load process routes:', error);
      setRoutes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAvailableProcesses = async () => {
    try {
      // 获取工序费率列表（用于编辑器选择）
      const response = await fetch('http://localhost:8000/api/v1/process-rates');
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();

      // 转换 API 响应为前端类型
      const processes: ProcessRateOption[] = data.map((item: any) => ({
        processCode: item.process_code,
        processName: item.process_name,
        equipment: item.equipment || '',
        stdMhrVar: parseFloat(item.std_mhr_var) || 0,
        stdMhrFix: parseFloat(item.std_mhr_fix) || 0,
        vaveMhrVar: parseFloat(item.vave_mhr_var) || 0,
        vaveMhrFix: parseFloat(item.vave_mhr_fix) || 0,
      }));

      setAvailableProcesses(processes);
    } catch (error) {
      console.error('Failed to load process rates:', error);
      // 设置默认值确保编辑器可用
      setAvailableProcesses([]);
    }
  };

  // 新建工艺路线
  const handleCreate = () => {
    setEditingRoute(undefined);
    setIsEditorOpen(true);
  };

  // 编辑工艺路线
  const handleEdit = async (routeId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/process-routes/${routeId}`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();

      // 转换 API 响应为编辑类型
      const routeDetail: ProcessRouteEdit = {
        id: data.id,
        name: data.name,
        status: data.status,
        version: data.version,
        remarks: data.remarks,
        items: data.items.map((item: any) => ({
          id: item.id,
          operationNo: item.operation_no,
          processCode: item.process_code,
          processName: item.process_name,
          equipment: item.equipment,
          sequence: item.sequence,
          cycleTimeStd: item.cycle_time_std,
          cycleTimeVave: item.cycle_time_vave,
          personnelStd: parseFloat(item.personnel_std) || 1.0,
          personnelVave: item.personnel_vave ? parseFloat(item.personnel_vave) : undefined,
          stdMhrVar: parseFloat(item.std_mhr_var) || 0,
          stdMhrFix: parseFloat(item.std_mhr_fix) || 0,
          vaveMhrVar: parseFloat(item.vave_mhr_var) || 0,
          vaveMhrFix: parseFloat(item.vave_mhr_fix) || 0,
          efficiencyFactor: parseFloat(item.efficiency_factor) || 1.0,
          remarks: item.remarks,
        })),
      };

      setEditingRoute(routeDetail);
      setIsEditorOpen(true);
    } catch (error) {
      console.error('Failed to load route detail:', error);
    }
  };

  // 复制工艺路线
  const handleCopy = async (routeId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/process-routes/${routeId}`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();

      // 创建副本数据（id 为 undefined 将创建新路线）
      const newRoute: ProcessRouteEdit = {
        id: undefined,
        name: `${data.name} (副本)`,
        status: 'draft',
        version: 1,
        remarks: data.remarks,
        items: data.items.map((item: any) => ({
          id: `new-${Date.now()}-${item.id}`,
          operationNo: item.operation_no,
          processCode: item.process_code,
          processName: item.process_name,
          equipment: item.equipment,
          sequence: item.sequence,
          cycleTimeStd: item.cycle_time_std,
          cycleTimeVave: item.cycle_time_vave,
          personnelStd: parseFloat(item.personnel_std) || 1.0,
          personnelVave: item.personnel_vave ? parseFloat(item.personnel_vave) : undefined,
          stdMhrVar: parseFloat(item.std_mhr_var) || 0,
          stdMhrFix: parseFloat(item.std_mhr_fix) || 0,
          vaveMhrVar: parseFloat(item.vave_mhr_var) || 0,
          vaveMhrFix: parseFloat(item.vave_mhr_fix) || 0,
          efficiencyFactor: parseFloat(item.efficiency_factor) || 1.0,
          remarks: item.remarks,
        })),
      };

      setEditingRoute(newRoute);
      setIsEditorOpen(true);
    } catch (error) {
      console.error('Failed to copy route:', error);
    }
  };

  // 删除工艺路线
  const handleDelete = async (routeId: string) => {
    if (!confirm('确定要删除这个工艺路线吗？')) return;

    try {
      const response = await fetch(`http://localhost:8000/api/v1/process-routes/${routeId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      // 从列表中移除
      setRoutes(routes.filter((r) => r.id !== routeId));
    } catch (error) {
      console.error('Failed to delete route:', error);
      alert('删除失败，请检查后端服务');
    }
  };

  // 保存
  const handleSave = async (data: ProcessRouteEdit) => {
    setIsSaving(true);
    try {
      const isUpdate = !!editingRoute?.id;
      const url = isUpdate
        ? `http://localhost:8000/api/v1/process-routes/${editingRoute.id}`
        : 'http://localhost:8000/api/v1/process-routes';

      // 转换前端数据为 API 格式
      const apiData = {
        name: data.name,
        product_id: data.id ? undefined : 'PROD-TEMP', // 新建时需要临时产品ID
        remarks: data.remarks,
        items: data.items.map(item => ({
          operation_no: item.operationNo,
          process_code: item.processCode,
          sequence: item.sequence,
          cycle_time_std: item.cycleTimeStd,
          cycle_time_vave: item.cycleTimeVave,
          personnel_std: item.personnelStd,
          personnel_vave: item.personnelVave,
          efficiency_factor: item.efficiencyFactor,
          remarks: item.remarks,
        })),
      };

      const response = await fetch(url, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      // 刷新列表
      await loadRoutes();
      setIsEditorOpen(false);
    } catch (error) {
      console.error('Failed to save route:', error);
      alert('保存失败，请检查后端服务');
    } finally {
      setIsSaving(false);
    }
  };

  // 提交审批
  const handleSubmit = async () => {
    if (!editingRoute?.id) return;

    try {
      const response = await fetch(`http://localhost:8000/api/v1/process-routes/${editingRoute.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ remarks: '' }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      await loadRoutes();
      setIsEditorOpen(false);
    } catch (error) {
      console.error('Failed to submit route:', error);
      alert('提交失败，请检查后端服务');
    }
  };

  // 计算节省信息
  const getSavingsInfo = (item: ProcessRouteListItem) => {
    const savings = item.totalStdCost - item.totalVaveCost;
    const savingsRate = (savings / item.totalStdCost) * 100;
    return { savings, savingsRate };
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* 页头 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => onNavigate('bom')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold">工艺路线管理</h1>
              <p className="text-zinc-500 text-sm">创建和维护可复用的工艺路线模板</p>
            </div>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            新建工艺路线
          </Button>
        </div>

        {/* 筛选栏 */}
        <Card className="mb-6">
          <CardContent className="pt-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 flex-1">
                <Search className="h-4 w-4 text-zinc-400" />
                <Input
                  placeholder="搜索工艺路线名称或编码..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="状态筛选" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="draft">草稿</SelectItem>
                  <SelectItem value="pending">待审批</SelectItem>
                  <SelectItem value="active">生效</SelectItem>
                  <SelectItem value="deprecated">已废弃</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 工艺路线列表 */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>工艺路线编码</TableHead>
                <TableHead>名称</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>工序数</TableHead>
                <TableHead>标准成本</TableHead>
                <TableHead>VAVE成本</TableHead>
                <TableHead>节省</TableHead>
                <TableHead>更新时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-zinc-400">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : routes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-zinc-400">
                    暂无数据，点击"新建工艺路线"开始创建
                  </TableCell>
                </TableRow>
              ) : (
                routes.map((item) => {
                  const statusInfo = STATUS_CONFIG[item.status];
                  const savingsInfo = getSavingsInfo(item);

                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">{item.id}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>
                        <Badge variant={statusInfo.color}>
                          {statusInfo.icon} {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.itemCount} 道</TableCell>
                      <TableCell>¥{item.totalStdCost.toFixed(2)}</TableCell>
                      <TableCell>¥{item.totalVaveCost.toFixed(2)}</TableCell>
                      <TableCell>
                        {savingsInfo.savings > 0 ? (
                          <span className="text-green-600">
                            ¥{savingsInfo.savings.toFixed(2)} ({savingsInfo.savingsRate.toFixed(1)}%)
                          </span>
                        ) : (
                          <span className="text-zinc-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-zinc-500 text-sm">
                        {new Date(item.updatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(item.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(item.id)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(item.id)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          {item.status === 'draft' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 className="h-4 w-4 text-zinc-400 hover:text-red-500" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* 编辑器对话框 */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRoute?.id ? '编辑工艺路线' : '新建工艺路线'}
            </DialogTitle>
            <DialogDescription>
              创建和编辑工艺路线，定义工序顺序和成本参数
            </DialogDescription>
          </DialogHeader>
          <ProcessRouteEditor
            initialData={editingRoute}
            availableProcesses={availableProcesses}
            onSave={handleSave}
            onSubmit={editingRoute?.status === 'draft' ? handleSubmit : undefined}
            onCancel={() => setIsEditorOpen(false)}
            isSaving={isSaving}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
