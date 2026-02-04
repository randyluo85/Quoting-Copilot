import { useState, useEffect, useRef } from 'react';
import { SidebarProvider } from './components/ui/sidebar';
import { AppSidebar } from './components/AppSidebar';
import { Dashboard } from './components/Dashboard';
import { NewProject } from './components/NewProject';
import { ProjectCreationSuccess } from './components/ProjectCreationSuccess';
import { BOMManagement } from './components/BOMManagement';
import { ProcessAssessment } from './components/ProcessAssessment';
import { CostCalculation } from './components/CostCalculation';
import { QuoteSummary } from './components/QuoteSummary';
import { InvestmentRecovery } from './components/InvestmentRecovery';
import { QuotationOutput } from './components/QuotationOutput';
import { useProjectStore, useUIStore } from './lib/store';

export type View =
  | 'dashboard'
  | 'new-project'  // 复用 NewProject 组件进行手动创建
  | 'project-success'
  | 'bom'
  | 'process'
  | 'cost-calc'
  | 'quotation'
  | 'investment'
  | 'output';

export interface Product {
  id: string;
  name: string;
  partNumber: string;
  annualVolume: number;
  description: string;
}

export interface ProjectOwner {
  sales: string;
  vm: string;
  ie: string;
  pe: string;
  controlling: string;
}

export interface ProjectData {
  id: string;
  asacNumber: string;
  customerNumber: string;
  productVersion: string;
  customerVersion: string;
  clientName: string;
  projectName: string;
  annualVolume: string;
  description: string;
  products: Product[];
  owners: ProjectOwner;
  status: 'draft' | 'in-progress' | 'completed';
  createdDate: string;
  updatedDate: string;
}

export default function App() {
  // 使用 Zustand store 管理全局状态
  const currentView = useUIStore((state) => state.currentView);
  const setCurrentView = useUIStore((state) => state.setCurrentView);

  // 分别获取各个值，避免 selector 对象引用变化
  const projects = useProjectStore((state) => state.projects);
  const selectedProject = useProjectStore((state) => state.selectedProject);
  const loading = useProjectStore((state) => state.loading);
  const fetchProjects = useProjectStore((state) => state.fetchProjects);
  const selectProject = useProjectStore((state) => state.selectProject);

  // 启动时获取项目列表 - 使用 ref 确保只执行一次
  const hasFetched = useRef(false);
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchProjects();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSyncFromPM = (newProject: ProjectData) => {
    // PM 同步暂时使用本地状态（后续可接入真实 PM API）
    console.log('Sync from PM:', newProject);
  };

  const handleSelectProject = (project: ProjectData) => {
    selectProject(project.id);
    // 如果项目已经有产品，直接进入BOM管理
    // 否则（新建的无产品项目），先显示项目确认页面
    if (project.products && project.products.length > 0) {
      setCurrentView('bom');
    } else {
      setCurrentView('project-success');
    }
  };

  const renderView = () => {
    if (loading && projects.length === 0) {
      return <div className="p-8 text-center">加载中...</div>;
    }

    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            onNavigate={setCurrentView}
            projects={projects}
            onSyncFromPM={handleSyncFromPM}
            onSelectProject={handleSelectProject}
          />
        );
      case 'new-project':
        return (
          <NewProject
            onNavigate={setCurrentView}
            onProjectCreated={(projectId) => {
              // 创建成功后导航到成功页面
              selectProject(projectId);
              setCurrentView('project-success');
            }}
          />
        );
      case 'project-success':
        if (!selectedProject) {
          return (
            <Dashboard
              onNavigate={setCurrentView}
              projects={projects}
              onSyncFromPM={handleSyncFromPM}
              onSelectProject={handleSelectProject}
            />
          );
        }
        return (
          <ProjectCreationSuccess
            onNavigate={setCurrentView}
            projectData={selectedProject}
          />
        );
      case 'bom':
        if (!selectedProject) {
          return (
            <Dashboard
              onNavigate={setCurrentView}
              projects={projects}
              onSyncFromPM={handleSyncFromPM}
              onSelectProject={handleSelectProject}
            />
          );
        }
        return <BOMManagement onNavigate={setCurrentView} />;
      case 'process':
        return <ProcessAssessment onNavigate={setCurrentView} />;
      case 'cost-calc':
        return <CostCalculation onNavigate={setCurrentView} />;
      case 'quotation':
        return <QuoteSummary onNavigate={setCurrentView} />;
      case 'investment':
        return <InvestmentRecovery onNavigate={setCurrentView} />;
      case 'output':
        return <QuotationOutput onNavigate={setCurrentView} />;
      default:
        return (
          <Dashboard
            onNavigate={setCurrentView}
            projects={projects}
            onSyncFromPM={handleSyncFromPM}
            onSelectProject={handleSelectProject}
          />
        );
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-zinc-50">
        <AppSidebar currentView={currentView} onNavigate={setCurrentView} />
        <main className="flex-1">
          {renderView()}
        </main>
      </div>
    </SidebarProvider>
  );
}