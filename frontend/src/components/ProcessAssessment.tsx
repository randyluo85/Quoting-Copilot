import { UnderConstruction } from './UnderConstruction';
import type { View } from '../App';

interface ProcessAssessmentProps {
  onNavigate: (view: View) => void;
}

export function ProcessAssessment({ onNavigate }: ProcessAssessmentProps) {
  return (
    <UnderConstruction 
      title="工艺评估"
      description="IE工程师评估新工艺路线，设定工序和工时"
      onNavigate={onNavigate}
      backView="bom"
      backLabel="返回BOM管理"
    />
  );
}
