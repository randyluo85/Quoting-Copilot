import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { 
  Plus, 
  Package,
  Wrench,
  Calculator, 
  FileText, 
  TrendingUp, 
  BarChart3,
  FileOutput,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import type { View } from '../App';

interface WorkflowGuideProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

export function WorkflowGuide({ currentView, onNavigate }: WorkflowGuideProps) {
  const steps = [
    { 
      id: 'new-project', 
      title: '1. 新建项目', 
      icon: Plus, 
      view: 'new-project' as View,
      description: '上传询价文件，AI自动解析'
    },
    { 
      id: 'bom', 
      title: '2. BOM管理', 
      icon: Package, 
      view: 'bom' as View,
      description: '物料清单与成本管理'
    },
    { 
      id: 'process', 
      title: '3. 工艺评估', 
      icon: Wrench, 
      view: 'process' as View,
      description: '工艺路线与工时评估'
    },
    { 
      id: 'cost-calc', 
      title: '4. 成本核算', 
      icon: Calculator, 
      view: 'cost-calc' as View,
      description: 'AI智能计算全成本'
    },
    { 
      id: 'quotation', 
      title: '5. 报价摘要', 
      icon: FileText, 
      view: 'quotation' as View,
      description: 'QS成本核算'
    },
    { 
      id: 'investment', 
      title: '6. 投资回收分析', 
      icon: BarChart3, 
      view: 'investment' as View,
      description: '投资回报分析'
    },
    { 
      id: 'output', 
      title: '7. 报价输出', 
      icon: FileOutput, 
      view: 'output' as View,
      description: '生成最终报价单'
    },
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.view === currentView);
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500">VOSS报价流程:</span>
          </div>
          <div className="flex items-center gap-1">
            {steps.map((step, index) => {
              const isActive = step.view === currentView;
              const isCompleted = index < currentStepIndex;
              const isClickable = true;

              return (
                <div key={step.id} className="flex items-center">
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    className={`h-8 px-2 ${
                      isCompleted ? 'text-green-600' : ''
                    }`}
                    onClick={() => onNavigate(step.view)}
                    disabled={!isClickable}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <step.icon className="h-4 w-4" />
                    )}
                  </Button>
                  {index < steps.length - 1 && (
                    <ArrowRight className="h-3 w-3 text-zinc-300 mx-0.5" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {currentStepIndex >= 0 && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="text-zinc-500">当前步骤: </span>
                <span>{steps[currentStepIndex]?.title}</span>
                <span className="text-zinc-400 ml-2">- {steps[currentStepIndex]?.description}</span>
              </div>
              <span className="text-zinc-500">
                {currentStepIndex + 1} / {steps.length}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}