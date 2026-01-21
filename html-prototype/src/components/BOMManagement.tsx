import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { WorkflowGuide } from './WorkflowGuide';
import { 
  Plus, 
  Search, 
  Upload,
  Download,
  Edit,
  Trash2,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  FileSpreadsheet,
  ShoppingCart,
  AlertCircle,
  Package
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import type { View } from '../App';

interface BOMManagementProps {
  onNavigate: (view: View) => void;
}

interface BOMItem {
  id: string;
  productId: string;
  name: string;
  spec: string;
  quantity: number;
  unit: string;
  category: string;
  price: number | null;
  supplier: string;
  priceStatus: string;
  validation: string;
  hasPriceQuoted: boolean;
}

interface Product {
  id: string;
  name: string;
  partNumber: string;
}

export function BOMManagement({ onNavigate }: BOMManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<string>('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Mock products data
  const products: Product[] = [
    { id: 'P-001', name: '发动机缸体', partNumber: 'ENG-CB-2024' },
    { id: 'P-002', name: '缸盖组件', partNumber: 'ENG-CH-2024' },
  ];

  // Mock BOM items data - now linked to products
  const bomItems: BOMItem[] = [
    // Product 1: 发动机缸体
    {
      id: 'M-2001',
      productId: 'P-001',
      name: '发动机缸体铸件',
      spec: 'A356-T6, 2.5kg',
      quantity: 1,
      unit: 'PCS',
      category: '铸件',
      price: 85.50,
      supplier: '宁波精密铸造',
      priceStatus: 'stable',
      validation: '通过',
      hasPriceQuoted: true,
    },
    {
      id: 'M-2043',
      productId: 'P-001',
      name: '活塞环组件',
      spec: 'φ86×2.0mm',
      quantity: 4,
      unit: 'PCS',
      category: '机加工件',
      price: 12.30,
      supplier: '苏州活塞环厂',
      priceStatus: 'up',
      validation: '偏高',
      hasPriceQuoted: true,
    },
    {
      id: 'M-5001',
      productId: 'P-001',
      name: '特殊合金轴承',
      spec: 'Custom Alloy, φ45mm',
      quantity: 2,
      unit: 'PCS',
      category: '定制件',
      price: null,
      supplier: '-',
      priceStatus: 'unknown',
      validation: '未询价',
      hasPriceQuoted: false,
    },
    // Product 2: 缸盖组件
    {
      id: 'M-3001',
      productId: 'P-002',
      name: '缸盖铸件',
      spec: 'A356-T6, 1.8kg',
      quantity: 1,
      unit: 'PCS',
      category: '铸件',
      price: 65.80,
      supplier: '宁波精密铸造',
      priceStatus: 'stable',
      validation: '通过',
      hasPriceQuoted: true,
    },
    {
      id: 'M-3156',
      productId: 'P-002',
      name: '连杆螺栓',
      spec: 'M10×1.25, Grade 12.9',
      quantity: 8,
      unit: 'PCS',
      category: '标准件',
      price: 2.15,
      supplier: '东风紧固件',
      priceStatus: 'down',
      validation: '偏低',
      hasPriceQuoted: true,
    },
    {
      id: 'M-5002',
      productId: 'P-002',
      name: '高温密封圈',
      spec: 'PTFE, φ60×3mm',
      quantity: 4,
      unit: 'PCS',
      category: '密封件',
      price: null,
      supplier: '-',
      priceStatus: 'unknown',
      validation: '未询价',
      hasPriceQuoted: false,
    },
    {
      id: 'M-5003',
      productId: 'P-002',
      name: '钛合金紧固件',
      spec: 'Ti-6Al-4V, M8×1.0',
      quantity: 12,
      unit: 'PCS',
      category: '标准件',
      price: null,
      supplier: '-',
      priceStatus: 'unknown',
      validation: '未询价',
      hasPriceQuoted: false,
    },
  ];

  // Filter items based on selected product
  const filteredItems = selectedProduct === 'all' 
    ? bomItems 
    : bomItems.filter(item => item.productId === selectedProduct);

  const itemsWithPrice = filteredItems.filter(item => item.hasPriceQuoted);
  const itemsWithoutPrice = filteredItems.filter(item => !item.hasPriceQuoted);

  const getPriceStatusIcon = (status: string) => {
    switch (status) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      case 'unknown':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return null;
    }
  };

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === itemsWithoutPrice.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(itemsWithoutPrice.map(item => item.id));
    }
  };

  const handleMergeQuote = () => {
    alert(`已选择 ${selectedItems.length} 个物料，正在生成合并询价单...`);
  };

  const handleImportQuote = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      alert(`正在导入询价单: ${file.name}`);
    }
  };

  // Calculate costs per product
  const getProductCost = (productId: string) => {
    const productItems = bomItems.filter(item => item.productId === productId && item.hasPriceQuoted);
    return productItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  };

  const totalAllCost = products.reduce((sum, product) => sum + getProductCost(product.id), 0);

  return (
    <div className="p-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl mb-1">BOM 物料清单管理</h1>
        <p className="text-sm text-zinc-500">多产品 BOM 管理，AI 智能物料识别与价格查询</p>
      </div>

      <WorkflowGuide currentView="bom" onNavigate={onNavigate} />

      <div className="space-y-6">
        {/* AI Insights */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm mb-1">AI 多产品物料分析</h3>
                <p className="text-xs text-zinc-600 mb-3">
                  项目包含 {products.length} 个产品，共 {bomItems.length} 个物料项。
                  已查询到 {itemsWithPrice.length} 个物料价格，{itemsWithoutPrice.length} 个需要询价。
                  AI 建议优先对定制件和特殊材料进行询价。
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="h-7 text-xs">
                    价格趋势分析
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs">
                    供应商建议
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Unquoted Items Alert */}
        {itemsWithoutPrice.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm text-orange-900 mb-1">未查询到单价的物料</h3>
                  <p className="text-xs text-orange-700 mb-3">
                    发现 {itemsWithoutPrice.length} 个物料尚未查询到单价，请进行合并询价或导入询价单。
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-7 text-xs border-orange-300"
                      onClick={() => setSelectedItems(itemsWithoutPrice.map(item => item.id))}
                    >
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      全部加入询价
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Product Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-zinc-500 mb-1">产品数量</p>
              <p className="text-2xl">{products.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-zinc-500 mb-1">物料总数</p>
              <p className="text-2xl">{bomItems.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-zinc-500 mb-1">待询价</p>
              <p className="text-2xl text-orange-600">{itemsWithoutPrice.length}</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-zinc-900">
            <CardContent className="p-4">
              <p className="text-xs text-zinc-500 mb-1">物料总成本</p>
              <p className="text-2xl">¥{totalAllCost.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Products BOM Summary */}
        <Card>
          <CardHeader>
            <CardTitle>产品 BOM 汇总</CardTitle>
            <CardDescription>各产品的物料成本概览</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {products.map((product) => {
                const productItems = bomItems.filter(item => item.productId === product.id);
                const productWithPrice = productItems.filter(item => item.hasPriceQuoted);
                const productWithoutPrice = productItems.filter(item => !item.hasPriceQuoted);
                const productCost = getProductCost(product.id);

                return (
                  <div key={product.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-blue-500" />
                        <div>
                          <h4 className="text-sm">{product.name}</h4>
                          <p className="text-xs text-zinc-500">{product.partNumber}</p>
                        </div>
                      </div>
                      {productWithoutPrice.length > 0 && (
                        <Badge variant="destructive">{productWithoutPrice.length} 未询价</Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-zinc-500">物料总数</p>
                        <p>{productItems.length}</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500">已询价</p>
                        <p className="text-green-600">{productWithPrice.length}</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500">待询价</p>
                        <p className="text-orange-600">{productWithoutPrice.length}</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500">物料成本</p>
                        <p>¥{productCost.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* BOM Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>物料清单</CardTitle>
                <CardDescription>管理和编辑 BOM 物料信息</CardDescription>
              </div>
              <div className="flex gap-2">
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部产品</SelectItem>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  导出
                </Button>
                <Button size="sm" variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  导入
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">全部物料 ({filteredItems.length})</TabsTrigger>
                <TabsTrigger value="quoted">已询价 ({itemsWithPrice.length})</TabsTrigger>
                <TabsTrigger value="unquoted">
                  未询价 ({itemsWithoutPrice.length})
                  {itemsWithoutPrice.length > 0 && (
                    <Badge variant="destructive" className="ml-2">!</Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* All Items */}
              <TabsContent value="all" className="mt-4">
                <div className="mb-4 flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                      placeholder="搜索物料编码、名称或规格..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>产品</TableHead>
                        <TableHead>物料编码</TableHead>
                        <TableHead>物料名称</TableHead>
                        <TableHead>规格</TableHead>
                        <TableHead className="text-right">数量</TableHead>
                        <TableHead>类别</TableHead>
                        <TableHead className="text-right">单价</TableHead>
                        <TableHead>供应商</TableHead>
                        <TableHead>状态</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.map((item) => {
                        const product = products.find(p => p.id === item.productId);
                        return (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div className="text-xs">
                                <p className="font-medium">{product?.name}</p>
                                <p className="text-zinc-500">{product?.partNumber}</p>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-xs">{item.id}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell className="text-xs text-zinc-500">{item.spec}</TableCell>
                            <TableCell className="text-right">{item.quantity} {item.unit}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{item.category}</Badge>
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {item.price ? `¥${item.price.toFixed(2)}` : (
                                <span className="text-orange-600">未询价</span>
                              )}
                            </TableCell>
                            <TableCell className="text-xs">{item.supplier}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {getPriceStatusIcon(item.priceStatus)}
                                <span className="text-xs">{item.validation}</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              {/* Quoted Items */}
              <TabsContent value="quoted" className="mt-4">
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>产品</TableHead>
                        <TableHead>物料编码</TableHead>
                        <TableHead>物料名称</TableHead>
                        <TableHead className="text-right">数量</TableHead>
                        <TableHead className="text-right">单价</TableHead>
                        <TableHead className="text-right">金额</TableHead>
                        <TableHead>供应商</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {itemsWithPrice.map((item) => {
                        const product = products.find(p => p.id === item.productId);
                        return (
                          <TableRow key={item.id}>
                            <TableCell className="text-xs">
                              <p className="font-medium">{product?.name}</p>
                            </TableCell>
                            <TableCell className="font-mono text-xs">{item.id}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell className="text-right">{item.quantity} {item.unit}</TableCell>
                            <TableCell className="text-right font-mono">¥{item.price?.toFixed(2)}</TableCell>
                            <TableCell className="text-right font-mono">
                              ¥{((item.price || 0) * item.quantity).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-xs">{item.supplier}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              {/* Unquoted Items */}
              <TabsContent value="unquoted" className="mt-4">
                <div className="mb-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedItems.length === itemsWithoutPrice.length && itemsWithoutPrice.length > 0}
                        onChange={handleSelectAll}
                        className="h-4 w-4 rounded border-zinc-300"
                      />
                      <span className="text-sm text-zinc-600">
                        已选择 {selectedItems.length} / {itemsWithoutPrice.length} 项
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        disabled={selectedItems.length === 0}
                        onClick={handleMergeQuote}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        生成合并询价单 ({selectedItems.length})
                      </Button>
                      <Label htmlFor="quote-import">
                        <Button size="sm" variant="outline" asChild>
                          <span>
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            导入询价单
                          </span>
                        </Button>
                      </Label>
                      <Input
                        id="quote-import"
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleImportQuote}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <input
                            type="checkbox"
                            checked={selectedItems.length === itemsWithoutPrice.length && itemsWithoutPrice.length > 0}
                            onChange={handleSelectAll}
                            className="h-4 w-4 rounded border-zinc-300"
                          />
                        </TableHead>
                        <TableHead>产品</TableHead>
                        <TableHead>物料编码</TableHead>
                        <TableHead>物料名称</TableHead>
                        <TableHead>规格</TableHead>
                        <TableHead className="text-right">数量</TableHead>
                        <TableHead>类别</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {itemsWithoutPrice.map((item) => {
                        const product = products.find(p => p.id === item.productId);
                        return (
                          <TableRow key={item.id}>
                            <TableCell>
                              <input
                                type="checkbox"
                                checked={selectedItems.includes(item.id)}
                                onChange={() => handleSelectItem(item.id)}
                                className="h-4 w-4 rounded border-zinc-300"
                              />
                            </TableCell>
                            <TableCell className="text-xs">
                              <p className="font-medium">{product?.name}</p>
                            </TableCell>
                            <TableCell className="font-mono text-xs">{item.id}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell className="text-xs text-zinc-500">{item.spec}</TableCell>
                            <TableCell className="text-right">{item.quantity} {item.unit}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="border-orange-500 text-orange-600">
                                {item.category}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button size="sm" variant="outline" className="h-7 text-xs">
                                单独询价
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => onNavigate('new-project')}>
            返回上一步
          </Button>
          <Button 
            onClick={() => onNavigate('process')}
            disabled={itemsWithoutPrice.length > 0}
          >
            继续工艺评估 <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}