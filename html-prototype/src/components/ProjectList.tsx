import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Search, 
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import type { View } from '../App';

interface ProjectListProps {
  onNavigate: (view: View) => void;
  onSelectProject: (id: string) => void;
}

export function ProjectList({ onNavigate, onSelectProject }: ProjectListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const allProjects = [
    { id: 'P001', name: '博世-发动机零部件报价', client: '博世汽车', status: 'in-progress', stage: '成本计算', progress: 40, date: '2025-11-08', value: '¥20,100' },
    { id: 'P002', name: '大众-车身模块报价', client: '大众集团', status: 'in-progress', stage: '报价生成', progress: 65, date: '2025-11-07', value: '¥35,600' },
    { id: 'P003', name: '特斯拉-电池组件报价', client: '特斯拉', status: 'in-progress', stage: '投资分析', progress: 85, date: '2025-11-05', value: '¥128,000' },
    { id: 'P004', name: '福特-传动系统报价', client: '福特汽车', status: 'in-progress', stage: 'BOM导入', progress: 20, date: '2025-11-10', value: '¥42,300' },
    { id: 'P005', name: '奔驰-内饰件报价', client: '奔驰', status: 'pending', stage: '待审批', progress: 95, date: '2025-11-03', value: '¥18,900' },
    { id: 'P006', name: '宝马-底盘系统报价', client: '宝马', status: 'completed', stage: '已完成', progress: 100, date: '2025-10-28', value: '¥56,700' },
    { id: 'P007', name: '通用-电气系统报价', client: '通用汽车', status: 'completed', stage: '已完成', progress: 100, date: '2025-10-25', value: '¥32,400' },
  ];

  const inProgressProjects = allProjects.filter(p => p.status === 'in-progress');
  const pendingProjects = allProjects.filter(p => p.status === 'pending');
  const completedProjects = allProjects.filter(p => p.status === 'completed');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in-progress':
        return <Badge variant="outline" className="border-blue-500 text-blue-600">进行中</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-orange-500 text-orange-600">待审批</Badge>;
      case 'completed':
        return <Badge variant="secondary">已完成</Badge>;
      default:
        return <Badge variant="outline">未知</Badge>;
    }
  };

  const ProjectTable = ({ projects }: { projects: typeof allProjects }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>项目编号</TableHead>
          <TableHead>项目名称</TableHead>
          <TableHead>客户</TableHead>
          <TableHead>当前阶段</TableHead>
          <TableHead>状态</TableHead>
          <TableHead>项目金额</TableHead>
          <TableHead>创建日期</TableHead>
          <TableHead className="text-right">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map((project) => (
          <TableRow key={project.id}>
            <TableCell className="font-mono text-xs">{project.id}</TableCell>
            <TableCell>{project.name}</TableCell>
            <TableCell>{project.client}</TableCell>
            <TableCell>{project.stage}</TableCell>
            <TableCell>{getStatusBadge(project.status)}</TableCell>
            <TableCell className="font-mono">{project.value}</TableCell>
            <TableCell className="text-sm text-zinc-500">{project.date}</TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl mb-1">项目列表</h1>
        <p className="text-sm text-zinc-500">管理所有报价项目</p>
      </div>

      <div className="space-y-6">
        {/* Search and Filter */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  placeholder="搜索项目名称、客户或编号..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                筛选
              </Button>
              <Button onClick={() => onNavigate('new-project')}>
                新建项目
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Project Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-zinc-500 mb-1">总项目数</p>
              <p className="text-3xl">{allProjects.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-zinc-500 mb-1">进行中</p>
              <p className="text-3xl text-blue-600">{inProgressProjects.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-zinc-500 mb-1">待审批</p>
              <p className="text-3xl text-orange-600">{pendingProjects.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-zinc-500 mb-1">已完成</p>
              <p className="text-3xl text-green-600">{completedProjects.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Projects Table */}
        <Card>
          <CardHeader>
            <CardTitle>所有项目</CardTitle>
            <CardDescription>按状态分类查看项目</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">全部 ({allProjects.length})</TabsTrigger>
                <TabsTrigger value="in-progress">进行中 ({inProgressProjects.length})</TabsTrigger>
                <TabsTrigger value="pending">待审批 ({pendingProjects.length})</TabsTrigger>
                <TabsTrigger value="completed">已完成 ({completedProjects.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                <ProjectTable projects={allProjects} />
              </TabsContent>

              <TabsContent value="in-progress" className="mt-4">
                <ProjectTable projects={inProgressProjects} />
              </TabsContent>

              <TabsContent value="pending" className="mt-4">
                <ProjectTable projects={pendingProjects} />
              </TabsContent>

              <TabsContent value="completed" className="mt-4">
                <ProjectTable projects={completedProjects} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
