import { useState, useEffect } from 'react';
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
  | 'new-project'
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
  const projects = useProjectStore((state) => state.projects);
  const selectedProject = useProjectStore((state) => state.selectedProject);
  const fetchProjects = useProjectStore((state) => state.fetchProjects);
  const selectProject = useProjectStore((state) => state.selectProject);
  const loading = useProjectStore((state) => state.loading);

  // 启动时获取项目列表
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleSyncFromPM = (newProject: ProjectData) => {
    // PM 同步暂时使用本地状态（后续可接入真实 PM API）
    console.log('Sync from PM:', newProject);
  };

  const handleSelectProject = (project: ProjectData) => {
    selectProject(project.id);
    // 如果是新项目（draft状态），先显示项目确认页面
    if (project.status === 'draft') {
      setCurrentView('project-success');
    } else {
      // 已有项目直接进入BOM管理
      setCurrentView('bom');
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
            onProjectCreated={(data) => {
              // 创建成功后导航到成功页面
              selectProject(data.id || 'new');
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
        return <BOMManagement onNavigate={setCurrentView} project={selectedProject} />;
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