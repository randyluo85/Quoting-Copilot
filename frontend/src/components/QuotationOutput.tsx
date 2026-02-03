import { UnderConstruction } from './UnderConstruction';
import type { View } from '../App';

interface QuotationOutputProps {
  onNavigate: (view: View) => void;
}

export function QuotationOutput({ onNavigate }: QuotationOutputProps) {
  return (
    <UnderConstruction 
      title="报价输出"
      description="生成并导出最终报价文档"
      onNavigate={onNavigate}
      backView="investment"
      backLabel="返回投资回收分析"
    />
  );
}
