import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle
} from './ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { 
  CheckCircle2,
  Sparkles,
  FileText,
  Building2,
  Calendar,
  Package,
  ArrowRight,
  TrendingUp,
  Clock,
  DollarSign,
  Eye,
  Loader2,
  Box,
  Users,
  User
} from 'lucide-react';
import type { View, ProjectData } from '../App';

interface ProjectCreationSuccessProps {
  onNavigate: (view: View) => void;
  projectData: ProjectData;
}

interface SimilarProject {
  id: string;
  name: string;
  client: string;
  annualVolume: number;
  createdDate: string;
  status: string;
  similarity: number;
  totalCost?: string;
  elapsedTime?: string;
  products: number;
}

export function ProjectCreationSuccess({ onNavigate, projectData }: ProjectCreationSuccessProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // 模拟相似项目数据
  const similarProjects: SimilarProject[] = [
    {
      id: 'PRJ-2024-001',
      name: '博世-发动机缸体零部件报价',
      client: '博世汽车部件（苏州）有限公司',
      annualVolume: 120000,
      createdDate: '2024-01-15',
      status: '已完成',
      similarity: 95,
      totalCost: '¥ 2,856,000',
      elapsedTime: '26h',
      products: 3
    },
    {
      id: 'PRJ-2024-008',
      name: '博世-传动系统报价项目',
      client: '博世汽车部件（苏州）有限公司',
      annualVolume: 95000,
      createdDate: '2024-02-20',
      status: '已完成',
      similarity: 87,
      totalCost: '¥ 3,120,000',
      elapsedTime: '32h',
      products: 4
    },
    {
      id: 'PRJ-2023-156',
      name: '博世-发动机配件年度报价',
      client: '博世汽车',
      annualVolume: 110000,
      createdDate: '2023-11-08',
      status: '已完成',
      similarity: 82,
      totalCost: '¥ 2,650,000',
      elapsedTime: '28h',
      products: 2
    },
    {
      id: 'PRJ-2024-012',
      name: '大陆-发动机零部件报价',
      client: '大陆汽车',
      annualVolume: 105000,
      createdDate: '2024-03-05',
      status: '进行中',
      similarity: 76,
      totalCost: '¥ 2,980,000',
      elapsedTime: '18h',
      products: 3
    }
  ];

  const handleSyncToPM = () => {
    setIsSyncing(true);
    
    // 模拟同步过程
    setTimeout(() => {
      setIsSyncing(false);
      onNavigate('bom');
    }, 1500);
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (similarity >= 80) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (similarity >= 70) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-zinc-600 bg-zinc-50 border-zinc-200';
  };

  return (
    <div className="p-8 max-w-4xl">
      <div className="space-y-6">
        {/* Success Header */}
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl mb-2">项目信息已准备完成</h1>
          <p className="text-sm text-zinc-500">
            请确认项目信息，同步至PM软件后即可开始报价流程
          </p>
        </div>

        {/* Project Info Summary */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>项目信息概览</CardTitle>
                <CardDescription>请确认以下项目基本信息</CardDescription>
              </div>
              <Badge variant="outline" className="gap-1">
                <FileText className="h-3 w-3" />
                待同步
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Project Details Grid */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <Building2 className="h-4 w-4" />
                  客户名称
                </div>
                <p className="text-base font-medium">{projectData.clientName}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <FileText className="h-4 w-4" />
                  项目名称
                </div>
                <p className="text-base font-medium">{projectData.projectName}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <Package className="h-4 w-4" />
                  项目年量
                </div>
                <p className="text-base font-medium">
                  {parseInt(projectData.annualVolume).toLocaleString()} 件/年
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <Calendar className="h-4 w-4" />
                  创建时间
                </div>
                <p className="text-base font-medium">
                  {new Date().toLocaleDateString('zh-CN', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="pt-4 border-t space-y-2">
              <div className="text-sm text-zinc-500">项目描述</div>
              <p className="text-sm leading-relaxed">{projectData.description}</p>
            </div>

            {/* Additional Fields (if provided) */}
            {(projectData.asacNumber || projectData.customerNumber || projectData.productVersion || projectData.customerVersion) && (
              <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-200">
                <p className="text-xs text-zinc-500 mb-3 font-medium">项目编号与版本</p>
                <div className="grid grid-cols-2 gap-4">
                  {projectData.asacNumber && (
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">AS/AC Number</p>
                      <p className="text-sm font-medium font-mono">{projectData.asacNumber}</p>
                    </div>
                  )}
                  {projectData.customerNumber && (
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">Customer Number</p>
                      <p className="text-sm font-medium font-mono">{projectData.customerNumber}</p>
                    </div>
                  )}
                  {projectData.productVersion && (
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">Product Version</p>
                      <p className="text-sm font-medium">{projectData.productVersion}</p>
                    </div>
                  )}
                  {projectData.customerVersion && (
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">Customer Version</p>
                      <p className="text-sm font-medium">{projectData.customerVersion}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Products List */}
        {projectData.products && projectData.products.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Box className="h-5 w-5" />
                    项目产品清单
                  </CardTitle>
                  <CardDescription>
                    AI 识别到 {projectData.products.length} 个产品，每个产品将独立管理BOM和工艺
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  AI 识别
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">产品编号</TableHead>
                      <TableHead>产品名称</TableHead>
                      <TableHead>零件号</TableHead>
                      <TableHead className="text-right">年量 (pcs)</TableHead>
                      <TableHead>描述</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectData.products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-mono text-xs">{product.id}</TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="text-xs text-zinc-500">{product.partNumber}</TableCell>
                        <TableCell className="text-right">{product.annualVolume.toLocaleString()}</TableCell>
                        <TableCell className="text-xs text-zinc-500 max-w-[300px] truncate">
                          {product.description}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Products Summary */}
              <div className="mt-4 p-4 bg-zinc-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-zinc-500 text-xs mb-1">产品总数</p>
                    <p className="text-lg font-semibold">{projectData.products.length}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs mb-1">产品总年量</p>
                    <p className="text-lg font-semibold">
                      {projectData.products.reduce((sum, p) => sum + p.annualVolume, 0).toLocaleString()} pcs
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Project Team / Owners */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              项目团队
            </CardTitle>
            <CardDescription>
              PM软件已分配以下团队成员负责此项目
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4">
              <div className="text-center p-4 bg-zinc-50 rounded-lg border">
                <div className="flex justify-center mb-2">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <p className="text-xs text-zinc-500 mb-1">销售</p>
                <p className="text-sm font-medium">{projectData.owners.sales}</p>
              </div>

              <div className="text-center p-4 bg-zinc-50 rounded-lg border">
                <div className="flex justify-center mb-2">
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <p className="text-xs text-zinc-500 mb-1">VM</p>
                <p className="text-sm font-medium">{projectData.owners.vm}</p>
              </div>

              <div className="text-center p-4 bg-zinc-50 rounded-lg border">
                <div className="flex justify-center mb-2">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <p className="text-xs text-zinc-500 mb-1">IE</p>
                <p className="text-sm font-medium">{projectData.owners.ie}</p>
              </div>

              <div className="text-center p-4 bg-zinc-50 rounded-lg border">
                <div className="flex justify-center mb-2">
                  <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
                <p className="text-xs text-zinc-500 mb-1">PE</p>
                <p className="text-sm font-medium">{projectData.owners.pe}</p>
              </div>

              <div className="text-center p-4 bg-zinc-50 rounded-lg border">
                <div className="flex justify-center mb-2">
                  <div className="h-10 w-10 rounded-full bg-zinc-200 flex items-center justify-center">
                    <User className="h-5 w-5 text-zinc-600" />
                  </div>
                </div>
                <p className="text-xs text-zinc-500 mb-1">Controlling</p>
                <p className="text-sm font-medium">{projectData.owners.controlling}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Similar Projects Recommendation */}
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <Sparkles className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-purple-900 mb-1">
                    AI 发现 {similarProjects.length} 个相似项目
                  </p>
                  <p className="text-xs text-purple-700">
                    这些历史项目与当前项目高度相似，可作为参考以提高报价效率
                  </p>
                </div>
              </div>
              
              <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-shrink-0"
                  onClick={() => setIsDrawerOpen(true)}
                >
                  查看相似项目
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      相似项目推荐
                    </SheetTitle>
                    <SheetDescription>
                      AI 根据客户名称、项目类型和年量等因素，为您匹配了以下相似项目
                    </SheetDescription>
                  </SheetHeader>

                  <div className="px-6 mt-6 space-y-4">
                    {similarProjects.map((project) => (
                      <Card key={project.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-sm font-medium">{project.name}</h4>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${getSimilarityColor(project.similarity)}`}
                                >
                                  {project.similarity}% 匹配
                                </Badge>
                              </div>
                              <p className="text-xs text-zinc-500">{project.client}</p>
                            </div>
                          </div>

                          {/* Stats Grid */}
                          <div className="grid grid-cols-3 gap-3 mb-3 pb-3 border-b">
                            <div>
                              <div className="text-xs text-zinc-500 mb-0.5">年量</div>
                              <div className="text-sm font-medium">
                                {project.annualVolume.toLocaleString()}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-zinc-500 mb-0.5">产品数</div>
                              <div className="text-sm font-medium">{project.products}</div>
                            </div>
                            <div>
                              <div className="text-xs text-zinc-500 mb-0.5">总成本</div>
                              <div className="text-sm font-medium text-blue-600">
                                {project.totalCost || '-'}
                              </div>
                            </div>
                          </div>

                          {/* Meta Info */}
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3 text-zinc-500">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {project.elapsedTime}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {project.createdDate}
                              </span>
                            </div>
                            <Badge 
                              variant={project.status === '已完成' ? 'secondary' : 'outline'}
                              className="text-xs"
                            >
                              {project.status}
                            </Badge>
                          </div>

                          {/* Actions */}
                          <div className="mt-3 pt-3 border-t">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="w-full text-xs h-8"
                            >
                              <Eye className="h-3 w-3 mr-2" />
                              查看项目详情
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Drawer Footer */}
                  <div className="mt-6 p-4 bg-zinc-50 rounded-lg border">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium mb-1">参考价值分析</p>
                        <p className="text-xs text-zinc-600">
                          相似项目的BOM结构、工艺评估和成本数据可为当前项目提供参考，
                          预计可节省 40% 的报价时间。
                        </p>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center pt-4">
          <Button 
            onClick={handleSyncToPM}
            disabled={isSyncing}
            className="gap-2"
            size="lg"
          >
            {isSyncing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                正在准备...
              </>
            ) : (
              <>
                开始报价
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}