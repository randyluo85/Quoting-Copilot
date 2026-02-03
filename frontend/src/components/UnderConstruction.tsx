import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Construction, ArrowLeft } from 'lucide-react';
import type { View } from '../App';

interface UnderConstructionProps {
  title: string;
  description: string;
  onNavigate: (view: View) => void;
  backView?: View;
  backLabel?: string;
}

export function UnderConstruction({ 
  title, 
  description, 
  onNavigate,
  backView = 'dashboard',
  backLabel = '返回首页'
}: UnderConstructionProps) {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl mb-1">{title}</h1>
          <p className="text-sm text-zinc-500">{description}</p>
        </div>

        <Card className="border-dashed border-2 border-zinc-300">
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 mb-6">
                <Construction className="h-10 w-10 text-zinc-400" />
              </div>
              
              <h2 className="text-xl mb-2">功能开发中</h2>
              <p className="text-sm text-zinc-500 mb-8 max-w-md">
                此功能正在开发中，敬请期待。我们将尽快为您提供完整的功能体验。
              </p>

              <Button 
                variant="outline" 
                onClick={() => onNavigate(backView)}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {backLabel}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}