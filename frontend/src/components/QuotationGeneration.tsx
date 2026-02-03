import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  Target,
  DollarSign
} from 'lucide-react';
import type { View } from '../App';

interface QuotationGenerationProps {
  onNavigate: (view: View) => void;
}

export function QuotationGeneration({ onNavigate }: QuotationGenerationProps) {
  const [profitMargin, setProfitMargin] = useState([25]);
  const baseCost = 16080;
  const calculatedPrice = baseCost * (1 + profitMargin[0] / 100);

  const strategies = [
    {
      name: '保守策略',
      margin: 15,
      price: baseCost * 1.15,
      acceptance: 92,
      description: '较低利润率，高中标概率'
    },
    {
      name: '平衡策略',
      margin: 25,
      price: baseCost * 1.25,
      acceptance: 78,
      description: '适中利润率，良好竞争力',
      recommended: true
    },
    {
      name: '激进策略',
      margin: 35,
      price: baseCost * 1.35,
      acceptance: 58,
      description: '高利润率，中标风险较高'
    }
  ];

  const competitorAnalysis = [
    { company: '竞争对手 A', estimatedPrice: '¥19,500 - ¥21,000', position: '中等' },
    { company: '竞争对手 B', estimatedPrice: '¥18,200 - ¥19,800', position: '低价' },
    { company: '竞争对手 C', estimatedPrice: '¥21,000 - ¥23,500', position: '高价' },
  ];

  return (
    <div className="p-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl mb-1">智能报价生成</h1>
        <p className="text-sm text-zinc-500">AI 推荐最优定价策略，助力赢得订单</p>
      </div>

      <div className="space-y-6">
        {/* AI Recommended Strategies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI 推荐报价策略
            </CardTitle>
            <CardDescription>基于市场分析和竞争对手数据的智能推荐</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {strategies.map((strategy) => (
                <div
                  key={strategy.name}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    strategy.recommended 
                      ? 'border-zinc-900 bg-zinc-50' 
                      : 'border-zinc-200 hover:border-zinc-300'
                  }`}
                  onClick={() => setProfitMargin([strategy.margin])}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm">{strategy.name}</h4>
                    {strategy.recommended && (
                      <Badge>AI 推荐</Badge>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">利润率</span>
                      <span>{strategy.margin}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">报价</span>
                      <span className="font-mono">¥{strategy.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">接受概率</span>
                      <span className={
                        strategy.acceptance >= 80 ? 'text-green-600' :
                        strategy.acceptance >= 60 ? 'text-orange-600' :
                        'text-red-600'
                      }>{strategy.acceptance}%</span>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500 mt-3">{strategy.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Custom Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>自定义报价参数</CardTitle>
            <CardDescription>调整利润率以生成自定义报价</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>目标利润率</Label>
                <span className="text-sm">{profitMargin[0]}%</span>
              </div>
              <Slider
                value={profitMargin}
                onValueChange={setProfitMargin}
                min={5}
                max={50}
                step={1}
              />
              <div className="flex justify-between text-xs text-zinc-500">
                <span>5% (保守)</span>
                <span>50% (激进)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <p className="text-xs text-zinc-500 mb-1">基础成本</p>
                <p className="text-xl font-mono">¥{baseCost.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">利润金额</p>
                <p className="text-xl font-mono text-green-600">
                  ¥{(calculatedPrice - baseCost).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">最终报价</p>
                <p className="text-2xl font-mono">¥{calculatedPrice.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Competitor Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              竞争对手分析
            </CardTitle>
            <CardDescription>AI 智能预测竞争对手报价范围</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {competitorAnalysis.map((competitor, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm mb-1">{competitor.company}</h4>
                      <p className="text-xs text-zinc-500">预估报价范围: {competitor.estimatedPrice}</p>
                    </div>
                    <Badge variant="outline">{competitor.position}</Badge>
                  </div>
                </div>
              ))}
              
              <div className="border-2 border-zinc-900 rounded-lg p-4 bg-zinc-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm mb-1">您的报价</h4>
                    <p className="text-xs text-zinc-500">当前报价: ¥{calculatedPrice.toLocaleString()}</p>
                  </div>
                  <Badge>
                    {calculatedPrice < 19500 ? '竞争优势' : 
                     calculatedPrice < 21000 ? '中等位置' : '高价位'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profit Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                利润空间
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl mb-1">¥{(calculatedPrice - baseCost).toLocaleString()}</div>
              <p className="text-xs text-zinc-500">利润率 {profitMargin[0]}%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                中标概率
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl mb-1">
                {profitMargin[0] <= 15 ? '90%+' :
                 profitMargin[0] <= 25 ? '75-85%' :
                 profitMargin[0] <= 35 ? '55-70%' : '40-55%'}
              </div>
              <p className="text-xs text-zinc-500">AI 预测概率</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4" />
                市场定位
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl mb-1">
                {calculatedPrice < 19500 ? '低价区' :
                 calculatedPrice < 21000 ? '中价区' : '高价区'}
              </div>
              <p className="text-xs text-zinc-500">相对竞争对手</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => onNavigate('cost-calc')}>
            返回成本计算
          </Button>
          <Button onClick={() => onNavigate('business-case')}>
            进入商业案例评估 <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
