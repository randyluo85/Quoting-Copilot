import { UnderConstruction } from './UnderConstruction';
import type { View } from '../App';

interface InvestmentRecoveryProps {
  onNavigate: (view: View) => void;
}

export function InvestmentRecovery({ onNavigate }: InvestmentRecoveryProps) {
  return (
    <UnderConstruction 
      title="Payback投资回收分析"
      description="分析投资回收期和ROI"
      onNavigate={onNavigate}
      backView="quotation"
      backLabel="返回报价摘要"
    />
  );
}
