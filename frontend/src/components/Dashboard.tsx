import {
  RefreshCw,
  Search,
  FileText,
  Building2,
  Package,
  TrendingUp,
  Clock,
  Users,
  Loader2,
  ChevronRight,
  Sparkles,
  Star,
  CheckCircle2
} from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from './ui/tabs';
import type { View, ProjectData } from '../App';

interface DashboardProps {
  onNavigate: (view: View) => void;
  projects: ProjectData[];
  onSyncFromPM: (project: ProjectData) => void;
  onSelectProject: (project: ProjectData) => void;
}

export function Dashboard({ onNavigate, projects, onSyncFromPM, onSelectProject }: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'draft' | 'in-progress' | 'completed'>('all');
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncNotification, setShowSyncNotification] = useState(false);
  const [syncedProjectCount, setSyncedProjectCount] = useState(0);

  // 模拟从PM软件同步新项目
  const handleSyncFromPM = () => {
    setIsSyncing(true);
    
    setTimeout(() => {
      const newProject: ProjectData = {
        id: `PRJ-2024-${String(projects.length + 1).padStart(3, '0')}`,
        asacNumber: 'AS-2024-015',
        customerNumber: 'BOSCH-2024-Q3',
        productVersion: 'V1.5',
        customerVersion: 'C2.0',
        clientName: '博世汽车部件（苏州）有限公司',
        projectName: '发动机零部件报价项目',
        annualVolume: '200000',
        description: '新一代发动机缸体及缸盖组件报价项目，包含高精度铸造和机加工工艺',
        products: [
          {
            id: 'P-001',
            name: '发动机缸体',
            partNumber: 'ENG-CB-2024',
            annualVolume: 100000,
            description: 'A356-T6铝合金铸造缸体'
          },
          {
            id: 'P-002',
            name: '缸盖组件',
            partNumber: 'ENG-CH-2024',
            annualVolume: 100000,
            description: '缸盖含气门机构'
          }
        ],
        owners: {
          sales: '张伟',
          vm: '李明',
          ie: '王芳',
          pe: '刘强',
          controlling: '陈静'
        },
        status: 'draft',
        createdDate: new Date().toISOString().split('T')[0],
        updatedDate: new Date().toISOString().split('T')[0]
      };
      
      setIsSyncing(false);
      onSyncFromPM(newProject);
      setSyncedProjectCount(prev => prev + 1);
      setShowSyncNotification(true);
    }, 2000);
  };

  // 过滤项目
  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.asacNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = activeTab === 'all' || project.status === activeTab;
    
    return matchesSearch && matchesTab;
  });

  // 统计数据
  const stats = {
    total: projects.length,
    draft: projects.filter(p => p.status === 'draft').length,
    inProgress: projects.filter(p => p.status === 'in-progress').length,
    completed: projects.filter(p => p.status === 'completed').length
  };

  const getStatusBadge = (status: ProjectData['status']) => {
    const statusConfig = {
      'draft': { label: '草稿', variant: 'outline' as const, className: 'bg-zinc-50 text-zinc-600' },
      'in-progress': { label: '进行中', variant: 'default' as const, className: 'bg-blue-50 text-blue-600 border-blue-200' },
      'completed': { label: '已完成', variant: 'secondary' as const, className: 'bg-green-50 text-green-600 border-green-200' }
    };
    
    const config = statusConfig[status];
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="px-4 py-8 lg:px-8">
      <div className="max-w-7xl space-y-6">
        {/* Sync Success Notification */}
        {showSyncNotification && (
          <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-5">
            <Card className="border-green-500 bg-green-50 shadow-lg min-w-[320px]">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-900 mb-1">
                      同步成功
                    </p>
                    <p className="text-xs text-green-700">
                      成功从PM软件同步 {syncedProjectCount} 个项目
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-green-200"
                    onClick={() => setShowSyncNotification(false)}
                  >
                    <span className="sr-only">关闭</span>
                    <span className="text-green-700">×</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl mb-2">报价项目管理</h1>
            <p className="text-sm text-zinc-500">
              从PM软件同步项目，开始VOSS智能报价流程
            </p>
          </div>
          <Button 
            onClick={handleSyncFromPM} 
            disabled={isSyncing}
            className="gap-2"
            size="lg"
          >
            {isSyncing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                正在同步...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                从PM软件同步
              </>
            )}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">项目总数</p>
                  <p className="text-2xl font-semibold">{stats.total}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">草稿</p>
                  <p className="text-2xl font-semibold">{stats.draft}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-zinc-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-zinc-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">进行中</p>
                  <p className="text-2xl font-semibold">{stats.inProgress}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">已完成</p>
                  <p className="text-2xl font-semibold">{stats.completed}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Package className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>项目列表</CardTitle>
                <CardDescription>
                  查看和管理所有报价项目
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input
                    placeholder="搜索项目名称、客户、编号..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="all">
                  全部 ({stats.total})
                </TabsTrigger>
                <TabsTrigger value="draft">
                  草稿 ({stats.draft})
                </TabsTrigger>
                <TabsTrigger value="in-progress">
                  进行中 ({stats.inProgress})
                </TabsTrigger>
                <TabsTrigger value="completed">
                  已完成 ({stats.completed})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-0">
                {filteredProjects.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
                    <p className="text-sm text-zinc-500 mb-1">暂无项目</p>
                    <p className="text-xs text-zinc-400">点击"从PM软件同步"按钮同步新项目</p>
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[120px]">项目编号</TableHead>
                          <TableHead>项目名称</TableHead>
                          <TableHead>客户名称</TableHead>
                          <TableHead className="text-center">产品数</TableHead>
                          <TableHead className="text-right">项目年量</TableHead>
                          <TableHead>负责人</TableHead>
                          <TableHead>状态</TableHead>
                          <TableHead className="text-right">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProjects.map((project) => (
                          <TableRow 
                            key={project.id}
                            className="cursor-pointer hover:bg-zinc-50"
                            onClick={() => onSelectProject(project)}
                          >
                            <TableCell>
                              <div>
                                <p className="font-mono text-xs font-medium">{project.id}</p>
                                <p className="font-mono text-xs text-zinc-400">{project.asacNumber}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">{project.projectName}</p>
                                  {project.status === 'draft' && (
                                    <Badge className="bg-orange-500 hover:bg-orange-600 text-white gap-1 text-xs px-2 py-0">
                                      <Star className="h-3 w-3 fill-white" />
                                      NEW
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-zinc-500 mt-0.5">{project.description}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-zinc-400" />
                                <span className="text-sm">{project.clientName}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="font-mono">
                                {project.products.length}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {parseInt(project.annualVolume).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-zinc-400" />
                                <div className="text-xs">
                                  <p className="text-zinc-500">销售: {project.owners.sales}</p>
                                  <p className="text-zinc-400">VM: {project.owners.vm}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(project.status)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectProject(project);
                                }}
                              >
                                查看详情
                                <ChevronRight className="ml-1 h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* AI Assistant Tip */}
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-purple-900 mb-1">
                  AI 智能报价助手已就绪
                </p>
                <p className="text-xs text-purple-700">
                  选择项目后，AI将自动分析BOM结构、识别工艺路线、推荐成本参数，并提供相似项目参考，帮助您快速完成报价。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}