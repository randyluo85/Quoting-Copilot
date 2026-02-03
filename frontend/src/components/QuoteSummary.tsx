import { UnderConstruction } from './UnderConstruction';
import type { View } from '../App';

interface QuoteSummaryProps {
  onNavigate: (view: View) => void;
}

export function QuoteSummary({ onNavigate }: QuoteSummaryProps) {
  return (
    <UnderConstruction 
      title="QS报价摘要"
      description="查看QS报价、BC成本分析和Payback投资回收"
      onNavigate={onNavigate}
      backView="cost-calc"
      backLabel="返回成本核算"
    />
  );
}
