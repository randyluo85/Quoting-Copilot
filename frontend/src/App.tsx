import { useState } from 'react';
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

export type View = 
  | 'dashboard' 
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
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
  const [projects, setProjects] = useState<ProjectData[]>([
    // 模拟已有项目数据
    {
      id: 'PRJ-2024-001',
      asacNumber: 'AS-2024-001',
      customerNumber: 'BOSCH-2024-Q1',
      productVersion: 'V2.0',
      customerVersion: 'C1.5',
      clientName: '博世汽车部件（苏州）有限公司',
      projectName: '发动机缸体零部件报价',
      annualVolume: '120000',
      description: 'A356-T6铝合金发动机缸体及相关零部件报价项目',
      products: [
        {
          id: 'P-001',
          name: '发动机缸体',
          partNumber: 'ENG-CB-2024',
          annualVolume: 120000,
          description: 'A356-T6铝合金铸造缸体'
        }
      ],
      owners: {
        sales: '张伟',
        vm: '李明',
        ie: '王芳',
        pe: '刘强',
        controlling: '陈静'
      },
      status: 'completed',
      createdDate: '2024-01-15',
      updatedDate: '2024-01-28'
    },
    {
      id: 'PRJ-2024-008',
      asacNumber: 'AS-2024-008',
      customerNumber: 'BOSCH-2024-Q2',
      productVersion: 'V1.0',
      customerVersion: 'C1.0',
      clientName: '博世汽车部件（苏州）有限公司',
      projectName: '传动系统报价项目',
      annualVolume: '95000',
      description: '传动系统零部件年度报价',
      products: [
        {
          id: 'P-001',
          name: '传动轴',
          partNumber: 'TRN-SH-2024',
          annualVolume: 95000,
          description: '高强度钢传动轴'
        }
      ],
      owners: {
        sales: '张伟',
        vm: '赵敏',
        ie: '孙丽',
        pe: '周杰',
        controlling: '陈静'
      },
      status: 'in-progress',
      createdDate: '2024-02-20',
      updatedDate: '2024-02-25'
    }
  ]);

  const handleSyncFromPM = (newProject: ProjectData) => {
    setProjects([newProject, ...projects]);
  };

  const handleSelectProject = (project: ProjectData) => {
    setSelectedProject(project);
    // 如果是新项目（draft状态），先显示项目确认页面
    if (project.status === 'draft') {
      setCurrentView('project-success');
    } else {
      // 已有项目直接进入BOM管理
      setCurrentView('bom');
    }
  };

  const renderView = () => {
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