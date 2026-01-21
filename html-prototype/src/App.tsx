import { useState } from 'react';
import { SidebarProvider } from './components/ui/sidebar';
import { AppSidebar } from './components/AppSidebar';
import { Dashboard } from './components/Dashboard';
import { InquiryManagement } from './components/InquiryManagement';
import { NewProject } from './components/NewProject';
import { BOMManagement } from './components/BOMManagement';
import { ProcessAssessment } from './components/ProcessAssessment';
import { CostCalculation } from './components/CostCalculation';
import { QuoteSummary } from './components/QuoteSummary';
import { InvestmentRecovery } from './components/InvestmentRecovery';
import { QuotationOutput } from './components/QuotationOutput';
import { ProjectList } from './components/ProjectList';

export type View = 
  | 'dashboard' 
  | 'inquiry' 
  | 'projects' 
  | 'new-project' 
  | 'bom' 
  | 'process' 
  | 'cost-calc' 
  | 'quotation' 
  | 'investment' 
  | 'output';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentView} />;
      case 'inquiry':
        return <InquiryManagement onNavigate={setCurrentView} />;
      case 'projects':
        return <ProjectList onNavigate={setCurrentView} onSelectProject={setSelectedProject} />;
      case 'new-project':
        return <NewProject onNavigate={setCurrentView} />;
      case 'bom':
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
        return <Dashboard onNavigate={setCurrentView} />;
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