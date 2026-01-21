import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  AlertCircle,
  FileText,
  Calculator,
  BarChart3
} from 'lucide-react';
import type { View } from '../App';

interface DashboardProps {
  onNavigate: (view: View) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const stats = [
    { label: '进行中项目', value: '12', icon: Clock, color: 'text-blue-600' },
    { label: '已完成项目', value: '48', icon: CheckCircle2, color: 'text-green-600' },
    { label: '平均响应时间', value: '6h', icon: TrendingUp, color: 'text-purple-600' },
    { label: '待审批项目', value: '3', icon: AlertCircle, color: 'text-orange-600' },
  ];

  const recentProjects = [
    { id: 1, name: '博世-发动机零部件报价', client: '博世汽车', status: '工艺评估', progress: 40 },
    { id: 2, name: '大众-车身模块报价', client: '大众集团', status: '成本核算', progress: 65 },
    { id: 3, name: '特斯拉-电池组件报价', client: '特斯拉', status: '报价生成', progress: 85 },
    { id: 4, name: '福特-传动系统报价', client: '福特汽车', status: 'BOM管理', progress: 20 },
  ];

  const quickActions = [
    { label: '新建报价项目', icon: FileText, view: 'new-project' as View },
    { label: '询价管理', icon: Calculator, view: 'inquiry' as View },
    { label: '项目列表', icon: BarChart3, view: 'projects' as View },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl mb-1">仪表板</h1>
        <p className="text-sm text-zinc-500">欢迎使用 DR.aiVOSS 智能报价助手</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500">{stat.label}</p>
                  <p className="text-3xl mt-2">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>快速操作</CardTitle>
          <CardDescription>常用功能快速入口</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                className="h-24 flex flex-col gap-2"
                onClick={() => onNavigate(action.view)}
              >
                <action.icon className="h-6 w-6" />
                <span>{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Projects */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>最近项目</CardTitle>
              <CardDescription>正在进行的报价项目</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('projects')}>
              查看全部 <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentProjects.map((project) => (
              <div key={project.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-sm mb-1">{project.name}</h4>
                    <p className="text-xs text-zinc-500">{project.client}</p>
                  </div>
                  <span className="text-xs bg-zinc-100 px-2 py-1 rounded">
                    {project.status}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>进度</span>
                    <span>{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">AI 解析准确率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-2">95.2%</div>
            <Progress value={95.2} className="mb-2" />
            <p className="text-xs text-zinc-500">较上月提升 2.3%</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">成本计算准确率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-2">97.8%</div>
            <Progress value={97.8} className="mb-2" />
            <p className="text-xs text-zinc-500">较上月提升 1.5%</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">平均处理时间</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-2">5.8h</div>
            <Progress value={73} className="mb-2" />
            <p className="text-xs text-zinc-500">较上月减少 1.2h</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}