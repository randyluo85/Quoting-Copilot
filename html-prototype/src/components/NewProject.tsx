import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { WorkflowGuide } from './WorkflowGuide';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  ArrowRight,
  Sparkles,
  Plus,
  Trash2,
  Edit
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import type { View } from '../App';

interface NewProjectProps {
  onNavigate: (view: View) => void;
}

interface Product {
  id: string;
  name: string;
  partNumber: string;
  annualVolume: number;
  orderQuantity: number;
  description: string;
}

export function NewProject({ onNavigate }: NewProjectProps) {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'parsing' | 'success' | 'error'>('idle');
  const [parseProgress, setParseProgress] = useState(0);
  const [fileName, setFileName] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [newProduct, setNewProduct] = useState<Product>({
    id: '',
    name: '',
    partNumber: '',
    annualVolume: 0,
    orderQuantity: 0,
    description: ''
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setUploadStatus('uploading');
      
      // Simulate upload and parsing
      setTimeout(() => {
        setUploadStatus('parsing');
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setParseProgress(progress);
          if (progress >= 100) {
            clearInterval(interval);
            setUploadStatus('success');
            // Auto-detect products from uploaded file
            setProducts([
              {
                id: 'P-001',
                name: '发动机缸体',
                partNumber: 'ENG-CB-2024',
                annualVolume: 100000,
                orderQuantity: 1000,
                description: 'A356-T6铝合金铸造缸体'
              },
              {
                id: 'P-002',
                name: '缸盖组件',
                partNumber: 'ENG-CH-2024',
                annualVolume: 100000,
                orderQuantity: 1000,
                description: '缸盖含气门机构'
              }
            ]);
          }
        }, 200);
      }, 500);
    }
  };

  const handleAddProduct = () => {
    const product: Product = {
      ...newProduct,
      id: `P-${String(products.length + 1).padStart(3, '0')}`
    };
    setProducts([...products, product]);
    setNewProduct({
      id: '',
      name: '',
      partNumber: '',
      annualVolume: 0,
      orderQuantity: 0,
      description: ''
    });
    setShowAddProduct(false);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setNewProduct(product);
    setShowAddProduct(true);
  };

  const handleUpdateProduct = () => {
    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? newProduct : p));
      setEditingProduct(null);
      setNewProduct({
        id: '',
        name: '',
        partNumber: '',
        annualVolume: 0,
        orderQuantity: 0,
        description: ''
      });
      setShowAddProduct(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl mb-1">新建报价项目</h1>
        <p className="text-sm text-zinc-500">上传询价文件，AI 将自动解析并识别多个产品</p>
      </div>

      <WorkflowGuide currentView="new-project" onNavigate={onNavigate} />

      <div className="space-y-6">
        {/* AI Tip */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm text-blue-900 mb-1">AI 智能解析多产品项目</p>
                <p className="text-xs text-blue-700">
                  支持上传 Excel、PDF 格式的询价单，AI 将自动识别项目中的多个产品、各自的BOM清单、年量和技术要求等关键信息。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Info */}
        <Card>
          <CardHeader>
            <CardTitle>项目信息</CardTitle>
            <CardDescription>填写基本项目信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="project-name">项目名称</Label>
                <Input id="project-name" placeholder="例如：博世-发动机零部件报价" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client">客户名称</Label>
                <Input id="client" placeholder="例如：博世汽车" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-annual-volume">项目年量 (pcs)</Label>
                <Input id="project-annual-volume" type="number" placeholder="例如：200000" />
                <p className="text-xs text-zinc-500">作为新增产品的默认年量</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-order-quantity">默认订单量 (pcs)</Label>
                <Input id="project-order-quantity" type="number" placeholder="例如：1000" />
                <p className="text-xs text-zinc-500">作为新增产品的默认订单量</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">项目描述</Label>
              <Textarea 
                id="description" 
                placeholder="简要描述项目内容和要求"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* BOM Upload */}
        <Card>
          <CardHeader>
            <CardTitle>询价文件上传</CardTitle>
            <CardDescription>支持 Excel (.xlsx, .xls)、PDF 和 CSV 格式，最大 50MB</CardDescription>
          </CardHeader>
          <CardContent>
            {uploadStatus === 'idle' && (
              <div className="border-2 border-dashed border-zinc-200 rounded-lg p-12 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-zinc-400" />
                <p className="mb-2 text-sm">拖拽文件到此处或点击上传</p>
                <p className="text-xs text-zinc-500 mb-4">支持 .xlsx, .xls, .pdf, .csv 格式</p>
                <Input
                  type="file"
                  accept=".xlsx,.xls,.csv,.pdf"
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
                <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-zinc-400" />
                <p className="text-sm">正在上传文件...</p>
              </div>
            )}

            {uploadStatus === 'parsing' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-10 w-10 text-zinc-400" />
                  <div className="flex-1">
                    <p className="text-sm mb-1">{fileName}</p>
                    <p className="text-xs text-zinc-500">AI 正在智能解析文件...</p>
                  </div>
                </div>
                <Progress value={parseProgress} />
                <p className="text-xs text-zinc-500 text-center">{parseProgress}% 完成</p>
              </div>
            )}

            {uploadStatus === 'success' && (
              <div className="space-y-4">
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    文件解析成功！已识别 {products.length} 个产品，共 156 个物料项
                  </AlertDescription>
                </Alert>
                
                <div className="border rounded-lg p-4 space-y-3">
                  <h4 className="text-sm">AI 解析结果</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-zinc-500 text-xs">产品总数</p>
                      <p>{products.length}</p>
                    </div>
                    <div>
                      <p className="text-zinc-500 text-xs">物料总数</p>
                      <p>156</p>
                    </div>
                    <div>
                      <p className="text-zinc-500 text-xs">数据质量</p>
                      <p className="text-green-600">优秀 (95%)</p>
                    </div>
                    <div>
                      <p className="text-zinc-500 text-xs">识别工艺</p>
                      <p className="text-blue-600">4 个步骤</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Products List */}
        {products.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>产品清单</CardTitle>
                  <CardDescription>项目包含的产品及其年量信息</CardDescription>
                </div>
                <Button size="sm" onClick={() => setShowAddProduct(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  添加产品
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>产品编号</TableHead>
                      <TableHead>产品名称</TableHead>
                      <TableHead>零件号</TableHead>
                      <TableHead className="text-right">年量 (pcs)</TableHead>
                      <TableHead className="text-right">订单量 (pcs)</TableHead>
                      <TableHead>描述</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-mono text-xs">{product.id}</TableCell>
                        <TableCell>{product.name}</TableCell>
                        <TableCell className="text-xs text-zinc-500">{product.partNumber}</TableCell>
                        <TableCell className="text-right">{product.annualVolume.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{product.orderQuantity.toLocaleString()}</TableCell>
                        <TableCell className="text-xs text-zinc-500 max-w-[200px] truncate">
                          {product.description}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-7 w-7 p-0"
                              onClick={() => handleEditProduct(product)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-7 w-7 p-0"
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Summary */}
              <div className="mt-4 p-4 bg-zinc-50 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-zinc-500 text-xs">产品总数</p>
                    <p className="text-lg">{products.length}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs">总年量</p>
                    <p className="text-lg">
                      {products.reduce((sum, p) => sum + p.annualVolume, 0).toLocaleString()} pcs
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs">总订单量</p>
                    <p className="text-lg">
                      {products.reduce((sum, p) => sum + p.orderQuantity, 0).toLocaleString()} pcs
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add/Edit Product Form */}
        {showAddProduct && (
          <Card className="border-2 border-blue-500">
            <CardHeader>
              <CardTitle>{editingProduct ? '编辑产品' : '添加产品'}</CardTitle>
              <CardDescription>填写产品基本信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product-name">产品名称 *</Label>
                  <Input 
                    id="product-name" 
                    placeholder="例如：发动机缸体"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="part-number">零件号 *</Label>
                  <Input 
                    id="part-number" 
                    placeholder="例如：ENG-CB-2024"
                    value={newProduct.partNumber}
                    onChange={(e) => setNewProduct({...newProduct, partNumber: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="annual-volume">年量 (pcs) *</Label>
                  <Input 
                    id="annual-volume" 
                    type="number" 
                    placeholder="例如：100000"
                    value={newProduct.annualVolume || ''}
                    onChange={(e) => setNewProduct({...newProduct, annualVolume: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="order-quantity">订单量 (pcs) *</Label>
                  <Input 
                    id="order-quantity" 
                    type="number" 
                    placeholder="例如：1000"
                    value={newProduct.orderQuantity || ''}
                    onChange={(e) => setNewProduct({...newProduct, orderQuantity: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-description">产品描述</Label>
                <Textarea 
                  id="product-description" 
                  placeholder="简要描述产品规格和要求"
                  rows={2}
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowAddProduct(false);
                    setEditingProduct(null);
                    setNewProduct({
                      id: '',
                      name: '',
                      partNumber: '',
                      annualVolume: 0,
                      orderQuantity: 0,
                      description: ''
                    });
                  }}
                >
                  取消
                </Button>
                <Button 
                  onClick={editingProduct ? handleUpdateProduct : handleAddProduct}
                  disabled={!newProduct.name || !newProduct.partNumber || !newProduct.annualVolume || !newProduct.orderQuantity}
                >
                  {editingProduct ? '更新产品' : '添加产品'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => onNavigate('dashboard')}>
            取消
          </Button>
          <Button 
            onClick={() => onNavigate('bom')}
            disabled={products.length === 0}
          >
            继续 BOM 管理 <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}