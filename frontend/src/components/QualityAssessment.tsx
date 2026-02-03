import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  CheckCircle2,
  AlertTriangle,
  Shield,
  FileCheck,
  TestTube,
  TrendingUp,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Progress } from './ui/progress';
import type { View } from '../App';

interface QualityAssessmentProps {
  onNavigate: (view: View) => void;
}

export function QualityAssessment({ onNavigate }: QualityAssessmentProps) {
  const qualityRequirements = [
    {
      category: '尺寸检验',
      items: [
        { name: '缸体内径', spec: 'φ86 ±0.02mm', method: '三坐标测量', frequency: '100%', cost: 25 },
        { name: '连杆孔同轴度', spec: '≤0.05mm', method: '三坐标测量', frequency: '100%', cost: 20 },
        { name: '螺纹孔位置度', spec: '≤0.1mm', method: '专用检具', frequency: '100%', cost: 15 },
      ]
    },
    {
      category: '材料检验',
      items: [
        { name: '材料硬度', spec: 'HRC 45-50', method: '洛氏硬度计', frequency: '10%', cost: 10 },
        { name: '材料化学成分', spec: 'A356-T6标准', method: '光谱分析', frequency: '每批次', cost: 150 },
      ]
    },
    {
      category: '表面检验',
      items: [
        { name: '表面粗糙度', spec: 'Ra 1.6', method: '粗糙度仪', frequency: '20%', cost: 8 },
        { name: '表面缺陷', spec: '无裂纹、气孔', method: '目视+渗透检测', frequency: '100%', cost: 30 },
      ]
    },
  ];

  const qualityMetrics = [
    { label: '预计一次合格率', value: '98.5%', color: 'text-green-600' },
    { label: '检验覆盖率', value: '100%', color: 'text-blue-600' },
    { label: '质量成本占比', value: '5.2%', color: 'text-purple-600' },
  ];

  const totalQualityCost = qualityRequirements.reduce((sum, cat) => 
    sum + cat.items.reduce((s, item) => s + item.cost, 0), 0
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl mb-1">质量评估</h1>
        <p className="text-sm text-zinc-500">质量要求确认与质量成本分析</p>
      </div>

      {/* AI Analysis */}
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm mb-1">AI 质量分析</h3>
              <p className="text-xs text-zinc-600 mb-3">
                基于历史数据分析，该产品预计一次合格率 98.5%。
                建议增加缸体内径的抽检频率至 100%，预防潜在质量风险。
                质量成本占总成本 5.2%，符合行业标准。
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="h-7 text-xs">
                  查看质量历史
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs">
                  风险评估报告
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quality Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500">检验项目</p>
                <p className="text-2xl mt-1">8</p>
              </div>
              <FileCheck className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500">一次合格率</p>
                <p className="text-2xl mt-1">98.5%</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500">质量成本</p>
                <p className="text-2xl mt-1">¥{totalQualityCost}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500">风险等级</p>
                <p className="text-2xl mt-1">低</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quality Requirements */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>质量要求清单</CardTitle>
              <CardDescription>产品质量检验要求和标准</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {qualityRequirements.map((category) => (
                <div key={category.category}>
                  <h4 className="text-sm mb-3 flex items-center gap-2">
                    <TestTube className="h-4 w-4 text-blue-500" />
                    {category.category}
                  </h4>
                  <div className="space-y-3">
                    {category.items.map((item, index) => (
                      <div key={index} className="border rounded-lg p-4 hover:bg-zinc-50">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h5 className="text-sm mb-1">{item.name}</h5>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-zinc-500">
                              <div>
                                <span className="text-zinc-400">技术要求：</span>
                                <span>{item.spec}</span>
                              </div>
                              <div>
                                <span className="text-zinc-400">检验方法：</span>
                                <span>{item.method}</span>
                              </div>
                              <div>
                                <span className="text-zinc-400">检验频率：</span>
                                <span>{item.frequency}</span>
                              </div>
                              <div>
                                <span className="text-zinc-400">单件成本：</span>
                                <span className="text-blue-600">¥{item.cost}</span>
                              </div>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-700">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            已确认
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Quality Cost Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">质量成本构成</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-zinc-500">检验成本</span>
                  <span>¥{totalQualityCost}</span>
                </div>
                <Progress value={65} />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-zinc-500">预防成本</span>
                  <span>¥50</span>
                </div>
                <Progress value={20} />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-zinc-500">失败成本（预计）</span>
                  <span>¥38</span>
                </div>
                <Progress value={15} />
              </div>

              <div className="pt-3 border-t">
                <div className="flex justify-between text-sm">
                  <span>质量总成本</span>
                  <span>¥{totalQualityCost + 50 + 38}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quality Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">质量指标</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {qualityMetrics.map((metric) => (
                <div key={metric.label} className="flex justify-between text-sm">
                  <span className="text-zinc-500">{metric.label}</span>
                  <span className={metric.color}>{metric.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Risk Assessment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">风险评估</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <p>工艺成熟度高</p>
                  <p className="text-zinc-500">相似产品合格率 99%</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <p>检验设备齐全</p>
                  <p className="text-zinc-500">无需新增检验设备</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                <div>
                  <p>关键尺寸精度要求高</p>
                  <p className="text-zinc-500">建议100%全检</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={() => onNavigate('process')}>
          返回上一步
        </Button>
        <Button onClick={() => onNavigate('cost-calc')}>
          继续成本核算 <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}