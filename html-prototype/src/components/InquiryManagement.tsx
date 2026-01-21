import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  Plus, 
  Search, 
  FileText, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Filter,
  Download,
  Sparkles
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import type { View } from '../App';

interface InquiryManagementProps {
  onNavigate: (view: View) => void;
}

export function InquiryManagement({ onNavigate }: InquiryManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const inquiries = [
    {
      id: 'INQ-2024-001',
      name: '博世-发动机零部件询价',
      customer: '博世汽车',
      date: '2024-11-08',
      status: 'processing',
      priority: 'high',
      items: 156,
      aiScore: 95
    },
    {
      id: 'INQ-2024-002',
      name: '大众-车身模块询价',
      customer: '大众集团',
      date: '2024-11-07',
      status: 'quoted',
      priority: 'medium',
      items: 89,
      aiScore: 92
    },
    {
      id: 'INQ-2024-003',
      name: '特斯拉-电池组件询价',
      customer: '特斯拉',
      date: '2024-11-06',
      status: 'analyzing',
      priority: 'high',
      items: 234,
      aiScore: 88
    },
    {
      id: 'INQ-2024-004',
      name: '福特-传动系统询价',
      customer: '福特汽车',
      date: '2024-11-05',
      status: 'pending',
      priority: 'low',
      items: 67,
      aiScore: 91
    },
  ];

  const getStatusInfo = (status: string) => {
    const statusMap = {
      pending: { label: '待处理', color: 'bg-zinc-100 text-zinc-700' },
      analyzing: { label: 'AI分析中', color: 'bg-blue-100 text-blue-700' },
      processing: { label: '处理中', color: 'bg-yellow-100 text-yellow-700' },
      quoted: { label: '已报价', color: 'bg-green-100 text-green-700' },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.pending;
  };

  const getPriorityInfo = (priority: string) => {
    const priorityMap = {
      high: { label: '高', color: 'bg-red-100 text-red-700' },
      medium: { label: '中', color: 'bg-orange-100 text-orange-700' },
      low: { label: '低', color: 'bg-zinc-100 text-zinc-700' },
    };
    return priorityMap[priority as keyof typeof priorityMap] || priorityMap.low;
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl mb-1">询价管理</h1>
        <p className="text-sm text-zinc-500">客户询价需求管理与智能分析</p>
      </div>

      {/* AI Insights Banner */}
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm mb-1">AI 智能建议</h3>
              <p className="text-xs text-zinc-600 mb-3">
                检测到 3 个新询价文件，AI 已完成自动解析和需求分析。建议优先处理高优先级询价 INQ-2024-001 和 INQ-2024-003。
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="h-7 text-xs">
                  查看AI分析报告
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs">
                  一键批量处理
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500">待处理询价</p>
                <p className="text-2xl mt-1">8</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500">处理中询价</p>
                <p className="text-2xl mt-1">12</p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500">已报价</p>
                <p className="text-2xl mt-1">48</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500">平均处理时间</p>
                <p className="text-2xl mt-1">5.8h</p>
              </div>
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>询价列表</CardTitle>
              <CardDescription>管理和跟踪所有客户询价</CardDescription>
            </div>
            <Button onClick={() => onNavigate('new-project')}>
              <Plus className="mr-2 h-4 w-4" />
              新建询价
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                placeholder="搜索询价单号、客户名称..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              筛选
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              导出
            </Button>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">全部</TabsTrigger>
              <TabsTrigger value="pending">待处理</TabsTrigger>
              <TabsTrigger value="processing">处理中</TabsTrigger>
              <TabsTrigger value="quoted">已报价</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <div className="space-y-3">
                {inquiries.map((inquiry) => {
                  const status = getStatusInfo(inquiry.status);
                  const priority = getPriorityInfo(inquiry.priority);
                  
                  return (
                    <div
                      key={inquiry.id}
                      className="border rounded-lg p-4 hover:bg-zinc-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm">{inquiry.name}</h4>
                            <Badge className={status.color}>
                              {status.label}
                            </Badge>
                            <Badge className={priority.color}>
                              {priority.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-zinc-500">
                            <span>{inquiry.id}</span>
                            <span>•</span>
                            <span>{inquiry.customer}</span>
                            <span>•</span>
                            <span>{inquiry.date}</span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          查看详情 <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-6 text-xs">
                        <div>
                          <span className="text-zinc-500">物料项数：</span>
                          <span>{inquiry.items}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-blue-500" />
                          <span className="text-zinc-500">AI解析评分：</span>
                          <span className="text-blue-600">{inquiry.aiScore}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="pending">
              <div className="py-8 text-center text-sm text-zinc-500">
                筛选待处理的询价...
              </div>
            </TabsContent>

            <TabsContent value="processing">
              <div className="py-8 text-center text-sm text-zinc-500">
                筛选处理中的询价...
              </div>
            </TabsContent>

            <TabsContent value="quoted">
              <div className="py-8 text-center text-sm text-zinc-500">
                筛选已报价的询价...
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
