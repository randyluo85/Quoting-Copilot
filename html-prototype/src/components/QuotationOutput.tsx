import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  FileText, 
  Download,
  Mail,
  Share2,
  CheckCircle2,
  FileSpreadsheet,
  FileCheck
} from 'lucide-react';
import type { View } from '../App';

interface QuotationOutputProps {
  onNavigate: (view: View) => void;
}

export function QuotationOutput({ onNavigate }: QuotationOutputProps) {
  const quotationData = {
    projectName: '博世-发动机零部件报价',
    client: '博世汽车部件(苏州)有限公司',
    quotationNo: 'QT-2025-1110-001',
    date: '2025年11月10日',
    validUntil: '2025年12月10日',
    totalPrice: 20100,
    deliveryTime: '12 周',
    paymentTerms: '30% 预付，70% 交付后 60 天',
  };

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl mb-1">专业报价单输出</h1>
        <p className="text-sm text-zinc-500">一键生成符合客户需求的专业报价文档</p>
      </div>

      <div className="space-y-6">
        {/* Success Message */}
        <Card className="border-2 border-green-500 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="text-sm mb-1">报价流程已完成</h3>
                <p className="text-xs text-zinc-600">
                  所有分析和审批已完成，可以生成并发送专业报价单
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quotation Preview */}
        <Card>
          <CardHeader>
            <CardTitle>报价单预览</CardTitle>
            <CardDescription>最终报价文档内容预览</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Quotation Header */}
            <div className="border-2 border-zinc-900 rounded-lg p-8 bg-white">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-xl mb-2">DR.aiVOSS 智能报价</h2>
                  <p className="text-sm text-zinc-500">专业制造解决方案提供商</p>
                </div>
                <div className="text-right text-sm">
                  <p className="mb-1">报价单号: {quotationData.quotationNo}</p>
                  <p className="text-zinc-500">日期: {quotationData.date}</p>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Client Info */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">客户信息</p>
                  <p className="text-sm">{quotationData.client}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">项目名称</p>
                  <p className="text-sm">{quotationData.projectName}</p>
                </div>
              </div>

              {/* Pricing Summary */}
              <div className="bg-zinc-50 rounded-lg p-6 mb-6">
                <h3 className="text-sm mb-4">报价汇总</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-600">物料成本</span>
                    <span className="font-mono">¥5,620</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-600">工艺成本</span>
                    <span className="font-mono">¥5,160</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-600">投资成本分摊</span>
                    <span className="font-mono">¥3,200</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-600">间接成本</span>
                    <span className="font-mono">¥2,100</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span>总报价</span>
                    <span className="text-xl font-mono">¥{quotationData.totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">交付周期</p>
                  <p>{quotationData.deliveryTime}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">有效期</p>
                  <p>{quotationData.validUntil}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-zinc-500 mb-1">付款条件</p>
                  <p>{quotationData.paymentTerms}</p>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Footer */}
              <div className="text-xs text-zinc-500">
                <p>本报价单由 DR.aiVOSS 智能报价助手生成</p>
                <p className="mt-1">如有任何疑问，请联系我们的销售团队</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Options */}
        <Card>
          <CardHeader>
            <CardTitle>导出选项</CardTitle>
            <CardDescription>选择适合的格式导出报价单</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-24 flex flex-col gap-2">
                <FileText className="h-6 w-6" />
                <span className="text-sm">PDF 报价单</span>
                <span className="text-xs text-zinc-500">正式文档</span>
              </Button>
              
              <Button variant="outline" className="h-24 flex flex-col gap-2">
                <FileSpreadsheet className="h-6 w-6" />
                <span className="text-sm">Excel 明细</span>
                <span className="text-xs text-zinc-500">数据分析</span>
              </Button>
              
              <Button variant="outline" className="h-24 flex flex-col gap-2">
                <FileCheck className="h-6 w-6" />
                <span className="text-sm">Word 文档</span>
                <span className="text-xs text-zinc-500">可编辑版本</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button className="h-14 flex items-center justify-center gap-2">
            <Download className="h-5 w-5" />
            下载报价单
          </Button>
          
          <Button variant="outline" className="h-14 flex items-center justify-center gap-2">
            <Mail className="h-5 w-5" />
            发送邮件
          </Button>
          
          <Button variant="outline" className="h-14 flex items-center justify-center gap-2">
            <Share2 className="h-5 w-5" />
            分享链接
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">总耗时</p>
                  <p className="text-xl">6.5 小时</p>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  节省 85%
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">AI 准确率</p>
                  <p className="text-xl">96.8%</p>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  优秀
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">预计中标率</p>
                  <p className="text-xl">78%</p>
                </div>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  良好
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => onNavigate('investment')}>
            返回投资分析
          </Button>
          <Button onClick={() => onNavigate('dashboard')}>
            返回仪表板
          </Button>
        </div>
      </div>
    </div>
  );
}
