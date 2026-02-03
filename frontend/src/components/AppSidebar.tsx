import { 
  LayoutDashboard, 
  FileText, 
  Upload, 
  Package,
  Settings,
  DollarSign,
  ShoppingCart,
  Eye,
  Calculator,
  BarChart3,
  CheckCircle2,
  FileOutput,
  Brain,
  Circle,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarHeader,
} from './ui/sidebar';
import { Badge } from './ui/badge';
import type { View } from '../App';

interface AppSidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

// 流程步骤定义
interface ProcessStep {
  id: string;
  title: string;
  icon: any;
  view?: View;
  status: 'completed' | 'active' | 'pending' | 'optional';
  substeps?: ProcessSubstep[];
}

interface ProcessSubstep {
  id: string;
  title: string;
  view?: View;
  status: 'completed' | 'active' | 'pending' | 'optional';
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export function AppSidebar({ currentView, onNavigate }: AppSidebarProps) {
  // 根据当前视图动态计算流程状态
  const getStepStatus = (view: View | undefined): 'completed' | 'active' | 'pending' => {
    if (!view) return 'pending';
    
    const viewOrder: View[] = [
      'dashboard',
      'project-success',
      'bom',
      'process',
      'cost-calc',
      'quotation',
      'investment',
      'output'
    ];
    
    const currentIndex = viewOrder.indexOf(currentView);
    const stepIndex = viewOrder.indexOf(view);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  const processSteps: ProcessStep[] = [
    {
      id: 'dashboard',
      title: '项目总览',
      icon: LayoutDashboard,
      view: 'dashboard',
      status: getStepStatus('dashboard'),
    },
    {
      id: 'create-project',
      title: '创建项目',
      icon: FileText,
      view: 'project-success',
      status: getStepStatus('project-success'),
    },
    {
      id: 'bom-management',
      title: '报价管理',
      icon: Upload,
      view: 'bom',
      status: getStepStatus('bom'),
      substeps: [
        {
          id: 'material-list',
          title: '物料清单',
          status: getStepStatus('bom'),
        },
        {
          id: 'process-list',
          title: '工艺清单',
          status: getStepStatus('bom'),
        },
        {
          id: 'investment-list',
          title: '投资清单',
          status: 'optional',
          badge: '可选',
          badgeVariant: 'outline',
        },
        {
          id: 'other-costs',
          title: '其他清单（研发成本）',
          status: 'optional',
          badge: '可选',
          badgeVariant: 'outline',
        },
      ],
    },
    {
      id: 'branch-process',
      title: '分支：新工艺评估',
      icon: Settings,
      view: 'process',
      status: 'optional',
      substeps: [
        {
          id: 'process-assessment',
          title: 'IE工艺评估',
          view: 'process',
          status: getStepStatus('process'),
          badge: '条件触发',
          badgeVariant: 'secondary',
        },
      ],
    },
    {
      id: 'branch-procurement',
      title: '分支：新物料询价',
      icon: ShoppingCart,
      status: 'optional',
      substeps: [
        {
          id: 'supplier-quote',
          title: '采购上传报价单',
          status: 'optional',
          badge: '条件触发',
          badgeVariant: 'secondary',
        },
      ],
    },
    {
      id: 'cost-review',
      title: '成本核算',
      icon: Calculator,
      view: 'cost-calc',
      status: getStepStatus('cost-calc'),
      substeps: [
        {
          id: 'sales-review',
          title: '销售查看成本',
          view: 'cost-calc',
          status: getStepStatus('cost-calc'),
        },
      ],
    },
    {
      id: 'quotation-summary',
      title: 'QS/BC/Payback',
      icon: FileText,
      view: 'quotation',
      status: getStepStatus('quotation'),
      substeps: [
        {
          id: 'qs-view',
          title: 'QS报价摘要',
          view: 'quotation',
          status: getStepStatus('quotation'),
        },
        {
          id: 'bc-view',
          title: 'BC成本分析',
          view: 'quotation',
          status: getStepStatus('quotation'),
        },
        {
          id: 'payback-view',
          title: 'Payback投资回收',
          view: 'investment',
          status: getStepStatus('investment'),
        },
      ],
    },
    {
      id: 'controlling-review',
      title: '控制审核',
      icon: CheckCircle2,
      status: getStepStatus('output'),
    },
    {
      id: 'output',
      title: '报价输出',
      icon: FileOutput,
      view: 'output',
      status: getStepStatus('output'),
    },
  ];

  const getStatusIcon = (status: 'completed' | 'active' | 'pending' | 'optional') => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'active':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'optional':
        return <Circle className="h-4 w-4 text-zinc-300" />;
      default:
        return <Circle className="h-4 w-4 text-zinc-300" />;
    }
  };

  const getStatusColor = (status: 'completed' | 'active' | 'pending' | 'optional') => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'active':
        return 'text-blue-600 font-medium';
      case 'optional':
        return 'text-zinc-400';
      default:
        return 'text-zinc-500';
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-zinc-200 p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm">DR.aiVOSS</h2>
            <p className="text-xs text-zinc-500">智能报价助手</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="mb-3 px-2">报价项目进度</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-1">
              {processSteps.map((step, index) => (
                <div key={step.id}>
                  {/* 主步骤 */}
                  <div
                    className={`
                      relative flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors
                      ${step.view ? 'cursor-pointer hover:bg-zinc-100' : 'cursor-default'}
                      ${step.status === 'active' && step.view ? 'bg-blue-50' : ''}
                    `}
                    onClick={() => step.view && onNavigate(step.view)}
                  >
                    {/* 连接线 */}
                    {index < processSteps.length - 1 && (
                      <div className="absolute left-[22px] top-[40px] h-[calc(100%+4px)] w-[2px] bg-zinc-200" />
                    )}
                    
                    {/* 状态图标 */}
                    <div className="relative z-10 flex-shrink-0">
                      {getStatusIcon(step.status)}
                    </div>
                    
                    {/* 步骤内容 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <step.icon className={`h-3.5 w-3.5 flex-shrink-0 ${getStatusColor(step.status)}`} />
                        <span className={`text-sm ${getStatusColor(step.status)}`}>
                          {step.title}
                        </span>
                      </div>
                      
                      {/* 子步骤 */}
                      {step.substeps && step.substeps.length > 0 && (
                        <div className="mt-2 space-y-1.5 ml-1">
                          {step.substeps.map((substep) => (
                            <div
                              key={substep.id}
                              className={`
                                flex items-center gap-2 text-xs rounded px-2 py-1.5
                                ${substep.view ? 'cursor-pointer hover:bg-zinc-100' : 'cursor-default'}
                                ${substep.status === 'active' && substep.view ? 'bg-blue-100' : ''}
                              `}
                              onClick={(e) => {
                                if (substep.view) {
                                  e.stopPropagation();
                                  onNavigate(substep.view);
                                }
                              }}
                            >
                              <ChevronRight className={`h-3 w-3 ${getStatusColor(substep.status)}`} />
                              <span className={getStatusColor(substep.status)}>
                                {substep.title}
                              </span>
                              {substep.badge && (
                                <Badge 
                                  variant={substep.badgeVariant || 'secondary'} 
                                  className="text-[10px] px-1.5 py-0 h-4"
                                >
                                  {substep.badge}
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* 图例说明 */}
        <div className="mt-6 px-3">
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
            <p className="text-xs text-zinc-500 mb-2 font-medium">流程图例</p>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span className="text-zinc-600">已完成</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-blue-600" />
                <span className="text-zinc-600">进行中</span>
              </div>
              <div className="flex items-center gap-2">
                <Circle className="h-3 w-3 text-zinc-300" />
                <span className="text-zinc-600">待执行</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">条件触发</Badge>
                <span className="text-zinc-600">按需执行</span>
              </div>
            </div>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}