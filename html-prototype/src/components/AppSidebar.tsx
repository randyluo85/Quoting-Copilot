import { 
  LayoutDashboard, 
  FolderOpen, 
  Plus, 
  FileSearch,
  Package,
  Wrench,
  Calculator, 
  FileText, 
  TrendingUp, 
  BarChart3,
  FileOutput,
  Brain
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from './ui/sidebar';
import type { View } from '../App';

interface AppSidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

export function AppSidebar({ currentView, onNavigate }: AppSidebarProps) {
  const mainMenuItems = [
    { title: '仪表板', icon: LayoutDashboard, view: 'dashboard' as View },
    { title: '询价管理', icon: FileSearch, view: 'inquiry' as View },
    { title: '项目列表', icon: FolderOpen, view: 'projects' as View },
  ];

  const workflowItems = [
    { title: '新建项目', icon: FileText, view: 'new-project' as View },
    { title: 'BOM管理', icon: Package, view: 'bom' as View },
    { title: '工艺评估', icon: Wrench, view: 'process' as View },
    { title: '成本核算', icon: Calculator, view: 'cost-calc' as View },
    { title: '报价摘要', icon: FileText, view: 'quotation' as View },
    { title: '投资回收分析', icon: BarChart3, view: 'investment' as View },
    { title: '报价输出', icon: FileOutput, view: 'output' as View },
  ];

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
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>主菜单</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => onNavigate(item.view)}
                    isActive={currentView === item.view}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>VOSS报价流程</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {workflowItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => onNavigate(item.view)}
                    isActive={currentView === item.view}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}