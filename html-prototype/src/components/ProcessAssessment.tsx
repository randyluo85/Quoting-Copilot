import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { WorkflowGuide } from './WorkflowGuide';
import { 
  Plus, 
  Sparkles,
  Wrench,
  Clock,
  Settings,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Upload,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from './ui/sheet';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import type { View } from '../App';

interface ProcessAssessmentProps {
  onNavigate: (view: View) => void;
}

interface ProcessStep {
  id: string;
  name: string;
  equipment: string;
  standardTime: number;
  setupTime: number;
  laborCost: number;
  equipmentCost: number;
  status: string;
  processType?: string;
  aiConfidence: number;
  moldCost?: number;
  toolingCost?: number;
  gaugeCost?: number;
  testCost?: number;
}

interface ProcessTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  steps: ProcessStep[];
  estimatedCost: number;
  estimatedTime: number;
  applicability: string;
}

export function ProcessAssessment({ onNavigate }: ProcessAssessmentProps) {
  const [selectedStep, setSelectedStep] = useState<ProcessStep | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ProcessTemplate | null>(null);
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>([]);
  const [hasCalculated, setHasCalculated] = useState(false);

  // 标准工艺流程库
  const processTemplates: ProcessTemplate[] = [
    {
      id: 'TPL-001',
      name: '铸造+机加工标准流程',
      category: '铸造类',
      description: '适用于发动机缸体、变速箱壳体等铸造零部件的标准工艺流程',
      applicability: '适用于中等复杂度铸造件',
      estimatedCost: 735,
      estimatedTime: 80.5,
      steps: [
        {
          id: 'P-001',
          name: '铸造成型',
          equipment: '压铸机 DC-800T',
          standardTime: 8.5,
          setupTime: 45,
          laborCost: 35,
          equipmentCost: 120,
          status: 'completed',
          processType: 'mature',
          aiConfidence: 95,
          moldCost: 15000,
          toolingCost: 8000,
          gaugeCost: 3000,
          testCost: 1200
        },
        {
          id: 'P-002',
          name: '粗加工',
          equipment: 'CNC加工中心 VMC-850',
          standardTime: 25.0,
          setupTime: 30,
          laborCost: 45,
          equipmentCost: 180,
          status: 'completed',
          processType: 'mature',
          aiConfidence: 92,
          moldCost: 0,
          toolingCost: 5000,
          gaugeCost: 2000,
          testCost: 800
        },
        {
          id: 'P-003',
          name: '精加工',
          equipment: 'CNC加工中心 VMC-1050',
          standardTime: 35.0,
          setupTime: 20,
          laborCost: 45,
          equipmentCost: 200,
          status: 'inProgress',
          processType: 'new',
          aiConfidence: 88,
          moldCost: 0,
          toolingCost: 6000,
          gaugeCost: 2500,
          testCost: 1000
        },
        {
          id: 'P-004',
          name: '热处理',
          equipment: '淬火炉 QF-600',
          standardTime: 12.0,
          setupTime: 60,
          laborCost: 30,
          equipmentCost: 80,
          status: 'pending',
          processType: 'mature',
          aiConfidence: 85,
          moldCost: 0,
          toolingCost: 2000,
          gaugeCost: 1000,
          testCost: 500
        },
      ]
    },
    {
      id: 'TPL-002',
      name: '冲压+焊接标准流程',
      category: '钣金类',
      description: '适用于车身覆盖件、支架等钣金零部件的标准工艺流程',
      applicability: '适用于薄板冲压焊接件',
      estimatedCost: 520,
      estimatedTime: 45.0,
      steps: [
        {
          id: 'P-101',
          name: '冲压成型',
          equipment: '冲床 400T',
          standardTime: 5.0,
          setupTime: 30,
          laborCost: 25,
          equipmentCost: 80,
          status: 'completed',
          processType: 'mature',
          aiConfidence: 90,
          moldCost: 12000,
          toolingCost: 3000,
          gaugeCost: 1500,
          testCost: 600
        },
        {
          id: 'P-102',
          name: '点焊组装',
          equipment: '点焊机器人',
          standardTime: 15.0,
          setupTime: 20,
          laborCost: 30,
          equipmentCost: 100,
          status: 'completed',
          processType: 'mature',
          aiConfidence: 88,
          moldCost: 0,
          toolingCost: 4000,
          gaugeCost: 2000,
          testCost: 800
        },
        {
          id: 'P-103',
          name: '表面处理',
          equipment: '喷涂线',
          standardTime: 10.0,
          setupTime: 40,
          laborCost: 20,
          equipmentCost: 60,
          status: 'pending',
          processType: 'mature',
          aiConfidence: 85,
          moldCost: 0,
          toolingCost: 2000,
          gaugeCost: 500,
          testCost: 300
        },
      ]
    },
    {
      id: 'TPL-003',
      name: '注塑成型标准流程',
      category: '塑料类',
      description: '适用于塑料零部件的注塑成型工艺流程',
      applicability: '适用于塑料注塑件',
      estimatedCost: 280,
      estimatedTime: 25.0,
      steps: [
        {
          id: 'P-201',
          name: '注塑成型',
          equipment: '注塑机 350T',
          standardTime: 3.0,
          setupTime: 25,
          laborCost: 15,
          equipmentCost: 50,
          status: 'completed',
          processType: 'mature',
          aiConfidence: 92,
          moldCost: 8000,
          toolingCost: 1000,
          gaugeCost: 800,
          testCost: 400
        },
        {
          id: 'P-202',
          name: '去毛刺',
          equipment: '去毛刺机',
          standardTime: 2.0,
          setupTime: 10,
          laborCost: 10,
          equipmentCost: 20,
          status: 'completed',
          processType: 'mature',
          aiConfidence: 95,
          moldCost: 0,
          toolingCost: 500,
          gaugeCost: 300,
          testCost: 200
        },
      ]
    },
  ];

  const handleSelectTemplate = (template: ProcessTemplate) => {
    setSelectedTemplate(template);
    setProcessSteps([]);
    setHasCalculated(false);
  };

  const handleCalculateProcess = () => {
    if (selectedTemplate) {
      setProcessSteps(selectedTemplate.steps);
      setHasCalculated(true);
    }
  };

  const handleImportProcess = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      alert(`正在导入工艺流程: ${file.name}`);
      // 模拟导入流程
      setTimeout(() => {
        setProcessSteps(processTemplates[0].steps);
        setSelectedTemplate(null);
        setHasCalculated(true);
      }, 1000);
    }
  };

  const totalTime = processSteps.reduce((sum, step) => sum + step.standardTime + step.setupTime / 60, 0);
  const totalCost = processSteps.reduce((sum, step) => sum + step.laborCost + step.equipmentCost, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700">已完成</Badge>;
      case 'inProgress':
        return <Badge className="bg-blue-100 text-blue-700">进行中</Badge>;
      case 'pending':
        return <Badge className="bg-zinc-100 text-zinc-700">待评估</Badge>;
      default:
        return null;
    }
  };

  const handleEditStep = (step: ProcessStep) => {
    setSelectedStep(step);
    setIsEditing(true);
  };

  const handleSaveStep = () => {
    if (selectedStep) {
      const updatedSteps = processSteps.map(step => {
        if (step.id === selectedStep.id) {
          return selectedStep;
        }
        return step;
      });
      setProcessSteps(updatedSteps);
    }
    setIsEditing(false);
    setSelectedStep(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl mb-1">工艺评估</h1>
        <p className="text-sm text-zinc-500">选择标准工艺流程或导入新流程，进行工艺成本计算</p>
      </div>

      <WorkflowGuide currentView="process" onNavigate={onNavigate} />

      <div className="space-y-6">
        {/* Process Selection */}
        {!hasCalculated && (
          <>
            {/* AI Recommendation */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm mb-1">AI 工艺推荐</h3>
                    <p className="text-xs text-zinc-600 mb-3">
                      基于产品特征分析，AI 推荐使用"铸造+机加工标准流程"。
                      该流程匹配度 92%，预计总工时 80.5 小时，工艺成本 ¥735。
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Template Selection */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>选择标准工艺流程</CardTitle>
                    <CardDescription>从工艺流程库中选择合适的标准流程</CardDescription>
                  </div>
                  <div>
                    <Label htmlFor="process-import">
                      <Button variant="outline" size="sm" asChild>
                        <span>
                          <FileSpreadsheet className="mr-2 h-4 w-4" />
                          导入工艺流程
                        </span>
                      </Button>
                    </Label>
                    <Input
                      id="process-import"
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleImportProcess}
                      className="hidden"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {processTemplates.map((template) => (
                    <Card 
                      key={template.id} 
                      className={`cursor-pointer transition-all ${
                        selectedTemplate?.id === template.id 
                          ? 'border-2 border-blue-500 bg-blue-50' 
                          : 'hover:border-zinc-400'
                      }`}
                      onClick={() => handleSelectTemplate(template)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-sm">{template.name}</h4>
                          {selectedTemplate?.id === template.id && (
                            <CheckCircle2 className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                        <Badge variant="outline" className="mb-3">
                          {template.category}
                        </Badge>
                        <p className="text-xs text-zinc-600 mb-3">{template.description}</p>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-zinc-500">工序数量</span>
                            <span>{template.steps.length} 步</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">预计工时</span>
                            <span>{template.estimatedTime} min</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">预计成本</span>
                            <span>¥{template.estimatedCost}</span>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>{template.applicability}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {selectedTemplate && (
                  <div className="mt-6 flex justify-end">
                    <Button onClick={handleCalculateProcess}>
                      <Sparkles className="mr-2 h-4 w-4" />
                      计算工艺成本
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Process Results */}
        {hasCalculated && (
          <>
            {/* AI Insights */}
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600 text-white">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm mb-1">工艺成本计算完成</h3>
                    <p className="text-xs text-zinc-600 mb-3">
                      已完成 {processSteps.length} 个工序的成本评估。总工时 {totalTime.toFixed(1)} 小时，
                      工艺总成本 ¥{totalCost.toFixed(0)}。可继续编辑调整各工序参数。
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => {
                        setHasCalculated(false);
                        setProcessSteps([]);
                        setSelectedTemplate(null);
                      }}>
                        重新选择流程
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs">
                        工艺优化建议
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-zinc-500">工序总数</p>
                      <p className="text-2xl mt-1">{processSteps.length}</p>
                    </div>
                    <Wrench className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-zinc-500">总工时（小时）</p>
                      <p className="text-2xl mt-1">{totalTime.toFixed(1)}</p>
                    </div>
                    <Clock className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-zinc-500">设备投资</p>
                      <p className="text-2xl mt-1">¥0</p>
                    </div>
                    <Settings className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-2 border-zinc-900">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-zinc-500">工艺成本</p>
                      <p className="text-2xl mt-1">¥{totalCost.toFixed(0)}</p>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Process Flow */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>工艺路线</CardTitle>
                        <CardDescription>当前选择的工艺流程详情</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Plus className="mr-2 h-4 w-4" />
                          添加工序
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {processSteps.map((step, index) => (
                        <div key={step.id} className="relative">
                          <div className="border rounded-lg p-4 hover:bg-zinc-50 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-start gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-sm">
                                  {index + 1}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-sm">{step.name}</h4>
                                    {getStatusBadge(step.status)}
                                  </div>
                                  <p className="text-xs text-zinc-500 mb-2">{step.equipment}</p>
                                  
                                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                    <div>
                                      <span className="text-zinc-500">标准工时：</span>
                                      <span>{step.standardTime} min</span>
                                    </div>
                                    <div>
                                      <span className="text-zinc-500">准备工时：</span>
                                      <span>{step.setupTime} min</span>
                                    </div>
                                    <div>
                                      <span className="text-zinc-500">人工成本：</span>
                                      <span>¥{step.laborCost}</span>
                                    </div>
                                    <div>
                                      <span className="text-zinc-500">设备成本：</span>
                                      <span>¥{step.equipmentCost}</span>
                                    </div>
                                  </div>

                                  {step.aiConfidence > 0 && (
                                    <div className="flex items-center gap-1 mt-2">
                                      <Sparkles className="h-3 w-3 text-blue-500" />
                                      <span className="text-xs text-zinc-500">AI置信度：</span>
                                      <span className="text-xs text-blue-600">{step.aiConfidence}%</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <Button size="sm" variant="outline" onClick={() => handleEditStep(step)}>
                                查看详情
                              </Button>
                            </div>
                          </div>
                          
                          {index < processSteps.length - 1 && (
                            <div className="flex justify-center py-2">
                              <div className="h-4 w-px bg-zinc-200"></div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Sidebar - Details & Analysis */}
              <div className="space-y-6">
                {/* Cost Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">成本构成</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">人工成本</span>
                      <span>¥{processSteps.reduce((sum, s) => sum + s.laborCost, 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">设备成本</span>
                      <span>¥{processSteps.reduce((sum, s) => sum + s.equipmentCost, 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">工装投资</span>
                      <span>¥{processSteps.reduce((sum, s) => sum + (s.toolingCost || 0), 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-3 border-t">
                      <span>总计</span>
                      <span>¥{totalCost}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Process Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">工艺汇总</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">总工序数</span>
                      <span>{processSteps.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">总工时</span>
                      <span>{totalTime.toFixed(1)} h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">平均置信度</span>
                      <span className="text-blue-600">
                        {(processSteps.reduce((sum, s) => sum + s.aiConfidence, 0) / processSteps.length).toFixed(0)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Quality Requirements */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">质量要求</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>尺寸精度：IT7级</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>表面粗糙度：Ra 1.6</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>材料硬度：HRC 45-50</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => onNavigate('bom')}>
            返回上一步
          </Button>
          <Button onClick={() => onNavigate('cost-calc')} disabled={!hasCalculated}>
            继续成本核算 <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Edit Step Sheet */}
      <Sheet open={selectedStep !== null} onOpenChange={(open) => !open && setSelectedStep(null)}>
        <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto p-0">
          {selectedStep && (
            <>
              <SheetHeader className="px-6 pt-6 pb-4">
                <SheetTitle>工序详情</SheetTitle>
                <SheetDescription>查看和编辑工序的详细信息</SheetDescription>
              </SheetHeader>
              
              <div className="px-6 pb-6 space-y-5">
                {/* Basic Info */}
                <div>
                  <Label htmlFor="step-name" className="text-sm">工序名称</Label>
                  <Input
                    id="step-name"
                    value={selectedStep.name}
                    onChange={(e) => setSelectedStep({ ...selectedStep, name: e.target.value })}
                    className="mt-2"
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <Label htmlFor="process-type" className="text-sm">工艺类型</Label>
                  <Select
                    value={selectedStep.processType || 'mature'}
                    onValueChange={(value) => setSelectedStep({ ...selectedStep, processType: value })}
                    disabled={!isEditing}
                  >
                    <SelectTrigger id="process-type" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mature">成熟工艺</SelectItem>
                      <SelectItem value="new">新工艺</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Time & Cost */}
                <div>
                  <h4 className="text-sm mb-3">工时与成本</h4>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-4">
                    <div>
                      <Label htmlFor="standard-time" className="text-xs text-zinc-600">标准工时（分钟）</Label>
                      <Input
                        id="standard-time"
                        type="number"
                        value={selectedStep.standardTime}
                        onChange={(e) => setSelectedStep({ ...selectedStep, standardTime: parseFloat(e.target.value) })}
                        className="mt-1.5"
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="setup-time" className="text-xs text-zinc-600">准备工时（分钟）</Label>
                      <Input
                        id="setup-time"
                        type="number"
                        value={selectedStep.setupTime}
                        onChange={(e) => setSelectedStep({ ...selectedStep, setupTime: parseFloat(e.target.value) })}
                        className="mt-1.5"
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="labor-cost" className="text-xs text-zinc-600">人工成本（元）</Label>
                      <Input
                        id="labor-cost"
                        type="number"
                        value={selectedStep.laborCost}
                        onChange={(e) => setSelectedStep({ ...selectedStep, laborCost: parseFloat(e.target.value) })}
                        className="mt-1.5"
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="equipment-cost" className="text-xs text-zinc-600">设备成本（元）</Label>
                      <Input
                        id="equipment-cost"
                        type="number"
                        value={selectedStep.equipmentCost}
                        onChange={(e) => setSelectedStep({ ...selectedStep, equipmentCost: parseFloat(e.target.value) })}
                        className="mt-1.5"
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Costs */}
                <div>
                  <h4 className="text-sm mb-3">工装与检测成本</h4>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-4">
                    <div>
                      <Label htmlFor="mold-cost" className="text-xs text-zinc-600">模具（元）</Label>
                      <Input
                        id="mold-cost"
                        type="number"
                        value={selectedStep.moldCost || 0}
                        onChange={(e) => setSelectedStep({ ...selectedStep, moldCost: parseFloat(e.target.value) })}
                        className="mt-1.5"
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="tooling-cost" className="text-xs text-zinc-600">工装（元）</Label>
                      <Input
                        id="tooling-cost"
                        type="number"
                        value={selectedStep.toolingCost || 0}
                        onChange={(e) => setSelectedStep({ ...selectedStep, toolingCost: parseFloat(e.target.value) })}
                        className="mt-1.5"
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="gauge-cost" className="text-xs text-zinc-600">检具（元）</Label>
                      <Input
                        id="gauge-cost"
                        type="number"
                        value={selectedStep.gaugeCost || 0}
                        onChange={(e) => setSelectedStep({ ...selectedStep, gaugeCost: parseFloat(e.target.value) })}
                        className="mt-1.5"
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="test-cost" className="text-xs text-zinc-600">测试（元）</Label>
                      <Input
                        id="test-cost"
                        type="number"
                        value={selectedStep.testCost || 0}
                        onChange={(e) => setSelectedStep({ ...selectedStep, testCost: parseFloat(e.target.value) })}
                        className="mt-1.5"
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  {!isEditing ? (
                    <>
                      <Button variant="outline" onClick={() => setSelectedStep(null)}>
                        关闭
                      </Button>
                      <Button onClick={() => setIsEditing(true)}>
                        编辑
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" onClick={handleCancelEdit}>
                        取消
                      </Button>
                      <Button onClick={handleSaveStep}>
                        保存修改
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}