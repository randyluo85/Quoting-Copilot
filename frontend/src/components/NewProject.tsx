import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Sparkles,
  FileText,
  Brain,
  X,
} from 'lucide-react';
import type { View } from '../App';
import { api } from '../lib/api';
import { useProjectStore } from '../lib/store';

interface NewProjectProps {
  onNavigate: (view: View) => void;
  onProjectCreated?: (projectId: string) => void;
}

interface ProjectOwner {
  sales: string;
  vm: string;
  ie: string;
  pe: string;
  controlling: string;
}

interface ProjectForm {
  asacNumber: string;
  customerNumber: string;
  productVersion: string;
  customerVersion: string;
  clientName: string;
  projectName: string;
  annualVolume: string;
  description: string;
}

interface Product {
  id: string;
  name: string;
  partNumber: string;
  annualVolume: number;
  description: string;
}

interface ParsedData {
  clientName?: string;
  projectName?: string;
  annualVolume?: string;
  description?: string;
  products?: Product[];
  confidence: {
    clientName: number;
    projectName: number;
    annualVolume: number;
    description: number;
  };
}

export function NewProject({ onNavigate, onProjectCreated }: NewProjectProps) {
  const [activeTab, setActiveTab] = useState<'manual' | 'import'>('manual');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'parsing' | 'success' | 'error'>('idle');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [parseProgress, setParseProgress] = useState(0);
  const [fileName, setFileName] = useState('');
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);

  const [formData, setFormData] = useState<ProjectForm>({
    asacNumber: '',
    customerNumber: '',
    productVersion: '',
    customerVersion: '',
    clientName: '',
    projectName: '',
    annualVolume: '',
    description: ''
  });

  // 负责人默认值
  const [owners, setOwners] = useState<ProjectOwner>({
    sales: '张三',
    vm: '李四',
    ie: '王五',
    pe: '赵六',
    controlling: '钱七'
  });

  // 获取创建项目的 store 方法
  const createProjectAPI = useProjectStore((state) => state.createProject);

  const [touched, setTouched] = useState({
    clientName: false,
    projectName: false,
    annualVolume: false,
    description: false
  });

  // 模拟AI解析
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setUploadStatus('uploading');
      
      // 模拟上传
      setTimeout(() => {
        setUploadStatus('parsing');
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setParseProgress(progress);
          if (progress >= 100) {
            clearInterval(interval);
            setUploadStatus('success');
            
            // 模拟AI识别结果 - 部分字段可能缺失
            const mockParsedData: ParsedData = {
              clientName: '博世汽车部件（苏州）有限公司',
              projectName: '发动机零部件报价项目',
              annualVolume: '200000',
              // description 故意留空，模拟AI未能识别
              products: [
                {
                  id: 'P-001',
                  name: '发动机缸体',
                  partNumber: 'ENG-CB-2024',
                  annualVolume: 100000,
                  description: 'A356-T6铝合金铸造缸体'
                },
                {
                  id: 'P-002',
                  name: '缸盖组件',
                  partNumber: 'ENG-CH-2024',
                  annualVolume: 100000,
                  description: '缸盖含气门机构'
                }
              ],
              confidence: {
                clientName: 0.95,
                projectName: 0.92,
                annualVolume: 0.88,
                description: 0
              }
            };
            
            setParsedData(mockParsedData);
            
            // 自动填充识别到的字段
            setFormData({
              asacNumber: '',
              customerNumber: '',
              productVersion: '',
              customerVersion: '',
              clientName: mockParsedData.clientName || '',
              projectName: mockParsedData.projectName || '',
              annualVolume: mockParsedData.annualVolume || '',
              description: mockParsedData.description || ''
            });
          }
        }, 200);
      }, 500);
    }
  };

  const handleInputChange = (field: keyof ProjectForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field: keyof ProjectForm) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const isFieldValid = (field: keyof ProjectForm) => {
    return formData[field].trim() !== '';
  };

  const isFormValid = () => {
    return (
      formData.clientName.trim() !== '' &&
      formData.projectName.trim() !== '' &&
      formData.annualVolume.trim() !== '' &&
      formData.description.trim() !== ''
    );
  };

  const missingFields = () => {
    const missing: string[] = [];
    if (!formData.clientName.trim()) missing.push('客户名称');
    if (!formData.projectName.trim()) missing.push('项目名称');
    if (!formData.annualVolume.trim()) missing.push('项目年量');
    if (!formData.description.trim()) missing.push('项目描述');
    return missing;
  };

  const handleCreateProject = async () => {
    if (isFormValid()) {
      setIsCreating(true);
      setCreateError(null);

      try {
        // 调用 API 创建项目
        const createdProject = await createProjectAPI({
          asacNumber: formData.asacNumber || `AS-${Date.now()}`,
          customerNumber: formData.customerNumber || `CUS-${Date.now()}`,
          productVersion: formData.productVersion || 'V1.0',
          customerVersion: formData.customerVersion || 'C1.0',
          clientName: formData.clientName,
          projectName: formData.projectName,
          annualVolume: formData.annualVolume,
          description: formData.description,
          owners: owners,  // 添加负责人字段
          products: parsedData?.products?.map(p => ({
            id: p.id,
            name: p.name,
            partNumber: p.partNumber,
            annualVolume: p.annualVolume,
            description: p.description
          })) || [{
            id: 'P-001',
            name: formData.projectName,
            partNumber: 'PART-' + Date.now(),
            annualVolume: parseInt(formData.annualVolume) || 0,
            description: formData.description
          }]
        });

        // 创建成功，通知父组件
        if (onProjectCreated) {
          onProjectCreated(createdProject.id);
        }

        // 跳转到项目创建成功页面
        onNavigate('project-success');
      } catch (err) {
        const message = err instanceof Error ? err.message : '创建项目失败';
        setCreateError(message);
        setIsCreating(false);
      }
    }
  };

  const clearUpload = () => {
    setUploadStatus('idle');
    setFileName('');
    setParsedData(null);
    setParseProgress(0);
  };

  const renderFormField = (
    field: keyof ProjectForm,
    label: string,
    placeholder: string,
    type: 'input' | 'textarea' = 'input',
    hint?: string
  ) => {
    const isMissing = uploadStatus === 'success' && parsedData && !parsedData[field];
    const isValid = isFieldValid(field);
    const showError = touched[field] && !isValid;

    return (
      <div className="space-y-2">
        <Label htmlFor={field} className="flex items-center gap-2">
          {label}
          <Badge variant="destructive" className="text-xs">必填</Badge>
          {isMissing && parsedData && (
            <Badge variant="outline" className="text-xs text-orange-600 border-orange-300 bg-orange-50">
              <AlertCircle className="h-3 w-3 mr-1" />
              AI未识别
            </Badge>
          )}
          {parsedData && parsedData[field] && parsedData.confidence[field] > 0 && (
            <Badge variant="outline" className="text-xs text-purple-600 border-purple-300 bg-purple-50">
              <Sparkles className="h-3 w-3 mr-1" />
              AI识别 {Math.round(parsedData.confidence[field] * 100)}%
            </Badge>
          )}
        </Label>
        
        {type === 'input' ? (
          <Input
            id={field}
            placeholder={placeholder}
            value={formData[field]}
            onChange={(e) => handleInputChange(field, e.target.value)}
            onBlur={() => handleBlur(field)}
            className={showError ? 'border-red-500' : isMissing ? 'border-orange-500' : ''}
          />
        ) : (
          <Textarea
            id={field}
            placeholder={placeholder}
            value={formData[field]}
            onChange={(e) => handleInputChange(field, e.target.value)}
            onBlur={() => handleBlur(field)}
            rows={3}
            className={showError ? 'border-red-500' : isMissing ? 'border-orange-500' : ''}
          />
        )}
        
        {hint && <p className="text-xs text-zinc-500">{hint}</p>}
        {showError && (
          <p className="text-xs text-red-600">请输入{label}</p>
        )}
      </div>
    );
  };

  return (
    <div className="p-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl mb-1">新建报价项目</h1>
        <p className="text-sm text-zinc-500">填写项目基本信息或导入报价单快速创建</p>
      </div>

      <div className="space-y-6">
        {/* AI Tip */}
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Brain className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-purple-900 mb-1">AI 智能识别报价单</p>
                <p className="text-xs text-purple-700">
                  支持上传 Excel、PDF 格式的报价单，AI 将自动识别客户名称、项目名称、年量和项目描述等关键信息，未识别字段请手动补充。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Manual vs Import */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'manual' | 'import')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual" className="gap-2">
              <FileText className="h-4 w-4" />
              手动创建
            </TabsTrigger>
            <TabsTrigger value="import" className="gap-2">
              <Upload className="h-4 w-4" />
              导入报价单
            </TabsTrigger>
          </TabsList>

          {/* Manual Creation Tab */}
          <TabsContent value="manual" className="space-y-6 mt-6">
            {/* 项目基本信息 - 必填项在前 */}
            <Card>
              <CardHeader>
                <CardTitle>项目基本信息</CardTitle>
                <CardDescription>请填写以下必填字段</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderFormField('clientName', '客户名称', '例如：博世汽车部件（苏州）有限公司')}
                {renderFormField('projectName', '项目名称', '例如：发动机零部件报价项目')}
                {renderFormField('annualVolume', '项目年量', '例如：100000', 'input', '单位：件/年')}
                {renderFormField('description', '项目描述', '请简要描述项目内容、技术要求等', 'textarea')}
              </CardContent>
            </Card>

            {/* 项目编号信息 - 选填项在后 */}
            <Card>
              <CardHeader>
                <CardTitle>项目编号信息</CardTitle>
                <CardDescription>项目编号和版本信息（可选）</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="asacNumber">AS/AC Number</Label>
                    <Input
                      id="asacNumber"
                      placeholder="例如：AS-2024-001"
                      value={formData.asacNumber}
                      onChange={(e) => handleInputChange('asacNumber', e.target.value)}
                    />
                    <p className="text-xs text-zinc-500">项目编号</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerNumber">Customer Number</Label>
                    <Input
                      id="customerNumber"
                      placeholder="例如：CUS-2024-001"
                      value={formData.customerNumber}
                      onChange={(e) => handleInputChange('customerNumber', e.target.value)}
                    />
                    <p className="text-xs text-zinc-500">客户编号</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="productVersion">Product Version</Label>
                    <Input
                      id="productVersion"
                      placeholder="例如：V1.0"
                      value={formData.productVersion}
                      onChange={(e) => handleInputChange('productVersion', e.target.value)}
                    />
                    <p className="text-xs text-zinc-500">产品版本</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerVersion">Customer Version</Label>
                    <Input
                      id="customerVersion"
                      placeholder="例如：C1.0"
                      value={formData.customerVersion}
                      onChange={(e) => handleInputChange('customerVersion', e.target.value)}
                    />
                    <p className="text-xs text-zinc-500">客户版本</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Import Tab */}
          <TabsContent value="import" className="space-y-6 mt-6">
            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle>上传报价单</CardTitle>
                <CardDescription>支持 Excel (.xlsx, .xls) 和 PDF 格式，最大 50MB</CardDescription>
              </CardHeader>
              <CardContent>
                {uploadStatus === 'idle' && (
                  <div className="border-2 border-dashed border-zinc-200 rounded-lg p-12 text-center hover:border-zinc-300 transition-colors">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-zinc-400" />
                    <p className="mb-2 text-sm">拖拽文件到此处或点击上传</p>
                    <p className="text-xs text-zinc-500 mb-4">支持 .xlsx, .xls, .pdf 格式</p>
                    <Input
                      type="file"
                      accept=".xlsx,.xls,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <Label htmlFor="file-upload">
                      <Button variant="outline" asChild>
                        <span>选择文件</span>
                      </Button>
                    </Label>
                  </div>
                )}

                {uploadStatus === 'uploading' && (
                  <div className="text-center py-8">
                    <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-purple-600" />
                    <p className="text-sm">正在上传文件...</p>
                  </div>
                )}

                {uploadStatus === 'parsing' && (
                  <div className="space-y-4 py-4">
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="h-10 w-10 text-purple-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm mb-1 truncate">{fileName}</p>
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-purple-600 animate-pulse" />
                          <p className="text-xs text-zinc-500">AI 正在智能解析报价单...</p>
                        </div>
                      </div>
                    </div>
                    <Progress value={parseProgress} className="h-2" />
                    <p className="text-xs text-zinc-500 text-center">{parseProgress}% 完成</p>
                  </div>
                )}

                {uploadStatus === 'success' && (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-green-900 mb-1">文件解析成功</p>
                          <p className="text-xs text-green-700 truncate">{fileName}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 flex-shrink-0"
                        onClick={clearUpload}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* AI识别结果统计 */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-zinc-50 rounded-lg">
                      <div>
                        <p className="text-xs text-zinc-500 mb-1">识别字段</p>
                        <p className="text-lg font-semibold">
                          {Object.values(parsedData?.confidence || {}).filter(c => c > 0).length} / 4
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500 mb-1">平均准确度</p>
                        <p className="text-lg font-semibold text-purple-600">
                          {parsedData ? Math.round(
                            Object.values(parsedData.confidence).reduce((a, b) => a + b, 0) / 4 * 100
                          ) : 0}%
                        </p>
                      </div>
                    </div>

                    {/* 缺失字段提醒 */}
                    {missingFields().length > 0 && (
                      <Alert className="border-orange-200 bg-orange-50">
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                        <AlertDescription className="text-orange-800 text-sm">
                          以下字段未能识别，请手动补充：
                          <span className="font-medium ml-1">{missingFields().join('、')}</span>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Form Fields - shown after parsing */}
            {uploadStatus === 'success' && (
              <Card>
                <CardHeader>
                  <CardTitle>确认项目信息</CardTitle>
                  <CardDescription>请检查并补充完整项目信息</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {renderFormField('clientName', '客户名称', '例如：博世汽车部件（苏州）有限公司')}
                  {renderFormField('projectName', '项目名称', '例如：发动机零部件报价项目')}
                  {renderFormField('annualVolume', '项目年量', '例如：100000', 'input', '单位：件/年')}
                  {renderFormField('description', '项目描述', '请简要描述项目内容、技术要求等', 'textarea')}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Validation Summary */}
        {(activeTab === 'manual' || uploadStatus === 'success') && (
          <Card className="border-zinc-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isFormValid() ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm text-green-900">所有必填字段已完成</p>
                        <p className="text-xs text-green-700">可以继续创建项目</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="text-sm text-orange-900">还有 {missingFields().length} 个必填字段待完成</p>
                        <p className="text-xs text-orange-700">{missingFields().join('、')}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={() => onNavigate('dashboard')} disabled={isCreating}>
            取消
          </Button>
          <Button
            onClick={handleCreateProject}
            disabled={!isFormValid() || isCreating}
            className="gap-2"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                创建中...
              </>
            ) : (
              <>
                创建项目并继续
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {/* Error Display */}
        {createError && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 text-sm">
              创建失败：{createError}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}