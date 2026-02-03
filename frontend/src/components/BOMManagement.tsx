import { useState } from 'react';
import {
  Upload,
  FileSpreadsheet,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Mail,
  Package,
  Settings,
  TrendingDown,
  Database,
  Loader2,
  ArrowLeft,
  ChevronDown,
  AlertTriangle,
  ThumbsUp,
  DollarSign,
  ArrowRight,
  ChevronRight,
  Plus,
  X,
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import type { View, ProjectData, Product } from '../App';
import { api } from '../lib/api';
import { useProjectStore } from '../lib/store';

// 材质类型定义
const MATERIAL_TYPES = [
  { value: '塑料', label: '塑料', priceRange: { min: 8, max: 35 } },  // 单位：元/kg
  { value: '金属-铝合金', label: '金属 - 铝合金', priceRange: { min: 18, max: 45 } },
  { value: '金属-钢材', label: '金属 - 钢材', priceRange: { min: 15, max: 50 } },
  { value: '金属-不锈钢', label: '金属 - 不锈钢', priceRange: { min: 25, max: 80 } },
  { value: '金属-铜合金', label: '金属 - 铜合金', priceRange: { min: 40, max: 120 } },
  { value: '橡胶', label: '橡胶', priceRange: { min: 12, max: 50 } },
  { value: '陶瓷', label: '陶瓷', priceRange: { min: 20, max: 200 } },
  { value: '复合材料', label: '复合材料', priceRange: { min: 30, max: 150 } },
  { value: '其他', label: '其他', priceRange: { min: 0, max: 999999 } }
];

// 价格合理性判断
type PriceValidation = 'reasonable' | 'warning' | 'alert' | 'unknown';

const validatePrice = (materialType: string, unitPrice: number | undefined): PriceValidation => {
  if (!unitPrice) return 'unknown';
  
  const materialConfig = MATERIAL_TYPES.find(m => m.value === materialType);
  if (!materialConfig) return 'unknown';
  
  const { min, max } = materialConfig.priceRange;
  
  if (unitPrice >= min && unitPrice <= max) {
    return 'reasonable';
  } else if (unitPrice < min * 0.7 || unitPrice > max * 1.3) {
    return 'alert';
  } else {
    return 'warning';
  }
};

interface BOMManagementProps {
  onNavigate: (view: View) => void;
  project: ProjectData;
  onProjectUpdate?: (project: ProjectData) => void;
}

interface Material {
  id: string;
  level: string;
  partNumber: string;
  partName: string;
  version: string;
  type: string;
  status: string;
  material: string;
  supplier: string;
  quantity: number;
  unit: string;
  unitPrice?: number;
  vavePrice?: number;
  comments: string;
  hasHistoryData: boolean;
}

interface Process {
  id: string;
  opNo: string; // 工序号
  name: string; // 工序名称
  workCenter: string; // 工作中心
  standardTime: number; // 标准工时（小时）
  spec?: string; // 规格要求（可选）
  unit: string;
  quantity: number;
  unitPrice?: number;
  vavePrice?: number;
  hasHistoryData: boolean;
  isOperationKnown?: boolean; // 该工序是否在系统中已知
}

interface ProductBOMData {
  productId: string;
  isUploaded: boolean;
  isParsing: boolean;
  parseProgress: number;
  isParsed: boolean;
  routingId?: string; // 工艺路线编码（产品级别）
  isRoutingKnown?: boolean; // 工艺路线是否已知
  needsIEReview?: boolean; // 是否需要IE参与
  materials: Material[];
  processes: Process[];
  uploadError?: string; // 上传错误信息
}

export function BOMManagement({ onNavigate, project }: BOMManagementProps) {
  const updateProject = useProjectStore((state) => state.updateProject);
  // 添加空值检查
  if (!project) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <FileSpreadsheet className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
              <p className="text-zinc-500 mb-4">未选择项目</p>
              <Button onClick={() => onNavigate('dashboard')}>
                返回项目列表
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 检查项目是否有产品
  if (!project.products || project.products.length === 0) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
              <h2 className="text-lg font-medium mb-2">该项目暂无产品</h2>
              <p className="text-zinc-500 mb-4">请先为项目添加产品信息</p>
              <Button onClick={() => onNavigate('dashboard')}>
                返回项目列表
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const [selectedProduct, setSelectedProduct] = useState<Product>(project.products[0]);
  const [bomData, setBomData] = useState<Record<string, ProductBOMData>>({});
  const [fileName, setFileName] = useState('');

  // 新增产品状态
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    code: '',
    routeCode: '',
    annualVolume: project.annualVolume || '0',
    description: '',
  });

  // 获取当前产品的BOM数据
  const currentBomData = bomData[selectedProduct.id];

  // 处理材料类型变更
  const handleMaterialTypeChange = (materialId: string, newMaterialType: string) => {
    setBomData(prev => ({
      ...prev,
      [selectedProduct.id]: {
        ...prev[selectedProduct.id],
        materials: prev[selectedProduct.id].materials.map(m =>
          m.id === materialId ? { ...m, material: newMaterialType } : m
        )
      }
    }));
  };

  // 处理工艺工作中心变更
  const handleWorkCenterChange = (processId: string, newWorkCenter: string) => {
    setBomData(prev => ({
      ...prev,
      [selectedProduct.id]: {
        ...prev[selectedProduct.id],
        processes: prev[selectedProduct.id].processes.map(p =>
          p.id === processId ? { ...p, workCenter: newWorkCenter } : p
        )
      }
    }));
  };

  // 处理工艺标准工时变更
  const handleStandardTimeChange = (processId: string, newTime: number) => {
    setBomData(prev => ({
      ...prev,
      [selectedProduct.id]: {
        ...prev[selectedProduct.id],
        processes: prev[selectedProduct.id].processes.map(p =>
          p.id === processId ? { ...p, standardTime: newTime } : p
        )
      }
    }));
  };

  // 获取价格合理性指示器
  const getPriceValidationBadge = (materialType: string, unitPrice: number | undefined) => {
    const validation = validatePrice(materialType, unitPrice);
    
    if (validation === 'unknown' || !unitPrice) return null;
    
    if (validation === 'reasonable') {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <ThumbsUp className="h-3 w-3" />
          <span className="text-xs">合理</span>
        </div>
      );
    } else if (validation === 'warning') {
      return (
        <div className="flex items-center gap-1 text-orange-600">
          <AlertTriangle className="h-3 w-3" />
          <span className="text-xs">偏差</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1 text-red-600">
          <AlertCircle className="h-3 w-3" />
          <span className="text-xs">异常</span>
        </div>
      );
    }
  };

  // 文件上传和AI解析 - 调用真实API
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    // 设置上传状态
    setBomData(prev => ({
      ...prev,
      [selectedProduct.id]: {
        productId: selectedProduct.id,
        isUploaded: true,
        isParsing: true,
        parseProgress: 0,
        isParsed: false,
        materials: [],
        processes: [],
        uploadError: undefined
      }
    }));

    try {
      // 调用真实API上传BOM文件
      const response = await api.bom.upload(project.id, file);

      // 模拟解析进度动画
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 20;
        setBomData(prev => ({
          ...prev,
          [selectedProduct.id]: {
            ...prev[selectedProduct.id],
            parseProgress: Math.min(progress, 90)
          }
        }));

        if (progress >= 90) {
          clearInterval(progressInterval);
        }
      }, 100);

      // 转换API响应为前端格式
      const materials: Material[] = response.materials.map((m, idx) => ({
        id: m.id,
        level: '一级',
        partNumber: m.partNumber,
        partName: m.partName,
        version: '1.0',
        type: '原材料',
        status: '可用',
        material: m.material || '其他',
        supplier: m.supplier || '',
        quantity: m.quantity,
        unit: m.unit || 'PC',  // 使用 API 返回的单位，默认为 PC
        unitPrice: m.unitPrice,
        vavePrice: m.vavePrice,
        comments: m.comments || '',
        hasHistoryData: m.hasHistoryData
      }));

      const processes: Process[] = []; // TODO: 从API响应获取工艺数据

      // 完成解析
      clearInterval(progressInterval);
      setBomData(prev => ({
        ...prev,
        [selectedProduct.id]: {
          ...prev[selectedProduct.id],
          isParsing: false,
          isParsed: true,
          parseProgress: 100,
          materials,
          processes,
          isRoutingKnown: false,
          needsIEReview: materials.filter(m => !m.hasHistoryData).length > 0
        }
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '上传失败，请重试';
      setBomData(prev => ({
        ...prev,
        [selectedProduct.id]: {
          ...prev[selectedProduct.id],
          isParsing: false,
          isParsed: false,
          uploadError: errorMessage
        }
      }));
    }
  };

  // 模拟数据用于演示（保留原功能作为fallback）
  const handleFileUploadMock = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    // 设置上传状态
    setBomData(prev => ({
      ...prev,
      [selectedProduct.id]: {
        productId: selectedProduct.id,
        isUploaded: true,
        isParsing: true,
        parseProgress: 0,
        isParsed: false,
        materials: [],
        processes: []
      }
    }));

    // 模拟解析进度
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setBomData(prev => ({
        ...prev,
        [selectedProduct.id]: {
          ...prev[selectedProduct.id],
          parseProgress: progress
        }
      }));

      if (progress >= 100) {
        clearInterval(interval);

        // 根据产品零件号精确判断
        const isMaturedProduct = selectedProduct.partNumber === 'ENG-CB-2024';

        // 模拟AI解析结果
        const mockMaterials: Material[] = isMaturedProduct ? [
          // 产品1：铝合金发动机缸体 - 成熟路线，所有物料有历史数据
          {
            id: 'M-001',
            level: '一级',
            partNumber: 'A356-T6',
            partName: '铝合金',
            version: '1.0',
            type: '原材料',
            status: '可用',
            material: '金属-铝合金',
            supplier: '中国铝业',
            quantity: 3.5,
            unit: 'kg',
            unitPrice: 28.50,
            vavePrice: 26.80,
            comments: '铸造级，符合GB/T 1173标准',
            hasHistoryData: true
          },
          {
            id: 'M-002',
            level: '二级',
            partNumber: '40Cr',
            partName: '气门座圈',
            version: '1.0',
            type: '原材料',
            status: '可用',
            material: '金属-钢材',
            supplier: '精密锻造厂',
            quantity: 8,
            unit: '个',
            unitPrice: 12.30,
            vavePrice: 11.50,
            comments: 'HRC45-50',
            hasHistoryData: true
          },
          {
            id: 'M-003',
            level: '三级',
            partNumber: 'NBR橡胶',
            partName: '密封垫片',
            version: '1.0',
            type: '原材料',
            status: '可用',
            material: '橡胶',
            supplier: '密封件公司',
            quantity: 4,
            unit: '个',
            unitPrice: 3.20,
            vavePrice: 2.95,
            comments: '耐温-40~150℃',
            hasHistoryData: true
          }
        ] : [
          // 产品2：新产品 - 新路线，部分物料需要询价
          {
            id: 'M-101',
            level: '一级',
            partNumber: 'Ti-6Al-4V',
            partName: '钛合金板材',
            version: '1.0',
            type: '原材料',
            status: '可用',
            material: '金属-铜合金',
            supplier: '钛合金供应商',
            quantity: 2.8,
            unit: 'kg',
            unitPrice: 85.00,
            vavePrice: 78.00,
            comments: 'Grade 5，航空级',
            hasHistoryData: true
          },
          {
            id: 'M-102',
            level: '二级',
            partNumber: 'CF-3M',
            partName: '不锈钢铸件',
            version: '1.0',
            type: '原材料',
            status: '可用',
            material: '金属-不锈钢',
            supplier: '',
            quantity: 1.5,
            unit: 'kg',
            comments: '耐腐蚀，316L等级',
            hasHistoryData: false // 需要询价
          },
          {
            id: 'M-103',
            level: '三级',
            partNumber: 'PEEK材料',
            partName: '高温密封件',
            version: '1.0',
            type: '原材料',
            status: '可用',
            material: '塑料',
            supplier: '',
            quantity: 6,
            unit: '个',
            comments: '耐温260℃',
            hasHistoryData: false // 需要询价
          }
        ];

        const mockProcesses: Process[] = isMaturedProduct ? [
          // 产品1：成熟路线，所有工序有历史单价
          {
            id: 'P-001',
            opNo: '010',
            name: '重力铸造',
            workCenter: '铸造车间',
            standardTime: 2.5,
            spec: 'A356-T6，铸造温度720℃',
            unit: '件',
            quantity: 1,
            unitPrice: 45.00,
            vavePrice: 42.00,
            hasHistoryData: true,
            isOperationKnown: true
          },
          {
            id: 'P-002',
            opNo: '020',
            name: 'CNC精加工',
            workCenter: '机加车间',
            standardTime: 5.0,
            spec: '五轴加工中心，公差±0.02mm',
            unit: '件',
            quantity: 1,
            unitPrice: 180.00,
            vavePrice: 165.00,
            hasHistoryData: true,
            isOperationKnown: true
          },
          {
            id: 'P-003',
            opNo: '030',
            name: '激光打标',
            workCenter: '表面处理车间',
            standardTime: 0.5,
            spec: '二维码+序列号，深度0.05mm',
            unit: '件',
            quantity: 1,
            unitPrice: 5.50,
            vavePrice: 5.00,
            hasHistoryData: true,
            isOperationKnown: true
          },
          {
            id: 'P-004',
            opNo: '040',
            name: '气密性检测',
            workCenter: '检测中心',
            standardTime: 1.0,
            spec: '氦检漏，灵敏度10⁻⁹',
            unit: '件',
            quantity: 1,
            unitPrice: 8.50,
            vavePrice: 7.80,
            hasHistoryData: true,
            isOperationKnown: true
          },
          {
            id: 'P-005',
            opNo: '050',
            name: '表面处理',
            workCenter: '表面处理车间',
            standardTime: 1.5,
            spec: '阳极氧化，黑色，Ra≤0.8μm',
            unit: '件',
            quantity: 1,
            unitPrice: 25.00,
            vavePrice: 23.00,
            hasHistoryData: true,
            isOperationKnown: true
          }
        ] : [
          // 产品2：新路线，部分工序需要IE询价
          {
            id: 'P-101',
            opNo: '010',
            name: '精密锻造',
            workCenter: '锻造车间',
            standardTime: 3.2,
            spec: '钛合金锻造，温度950℃',
            unit: '件',
            quantity: 1,
            unitPrice: 120.00,
            vavePrice: 110.00,
            hasHistoryData: true,
            isOperationKnown: true
          },
          {
            id: 'P-102',
            opNo: '020',
            name: '超精密加工',
            workCenter: '精密加工中心',
            standardTime: 8.5,
            spec: '七轴联动，公差±0.005mm',
            unit: '件',
            quantity: 1,
            hasHistoryData: false, // 需要IE询价
            isOperationKnown: false
          },
          {
            id: 'P-103',
            opNo: '030',
            name: '激光熔覆',
            workCenter: '激光车间',
            standardTime: 4.0,
            spec: '表面强化，涂层厚度0.3mm',
            unit: '件',
            quantity: 1,
            hasHistoryData: false, // 需要IE询价
            isOperationKnown: false
          },
          {
            id: 'P-104',
            opNo: '040',
            name: 'X射线探伤',
            workCenter: '无损检测中心',
            standardTime: 1.5,
            spec: '100%全检，缺陷≤0.1mm',
            unit: '件',
            quantity: 1,
            unitPrice: 35.00,
            vavePrice: 32.00,
            hasHistoryData: true,
            isOperationKnown: true
          },
          {
            id: 'P-105',
            opNo: '050',
            name: '真空热处理',
            workCenter: '热处理车间',
            standardTime: 6.0,
            spec: '真空退火，硬度HRC40-45',
            unit: '件',
            quantity: 1,
            hasHistoryData: false, // 需要IE询价
            isOperationKnown: false
          }
        ];

        setBomData(prev => ({
          ...prev,
          [selectedProduct.id]: {
            ...prev[selectedProduct.id],
            isParsing: false,
            isParsed: true,
            routingId: isMaturedProduct ? 'RT-2024-ALU-001' : 'RT-2024-NEW-002',
            isRoutingKnown: isMaturedProduct, // 发动机缸体是成熟路线，其他产品是新路线
            needsIEReview: false,
            materials: mockMaterials,
            processes: mockProcesses
          }
        }));
      }
    }, 200);
  };

  // 生成询价邮件
  const handleInquiry = (type: 'material' | 'process', item: Material | Process) => {
    const itemName = type === 'material' ? (item as Material).partName : (item as Process).name;
    const itemSpec = type === 'material' ? (item as Material).material : (item as Process).spec;
    
    const subject = encodeURIComponent(
      `询价：${itemName} - ${project.projectName} (${project.id})`
    );
    
    const body = encodeURIComponent(
      `尊敬的供应商，\n\n我们正在进行以下项目的报价工作，需要询价：\n\n【项目信息】\n项目名称：${project.projectName}\n项目编号：${project.id}\n客户：${project.clientName}\n产品：${selectedProduct.name} (${selectedProduct.partNumber})\n\n【询价项目】\n类型：${type === 'material' ? '物料' : '工艺'}\n名称：${itemName}\n规格：${itemSpec}\n单位：${item.unit}\n数量：${item.quantity}\n年需求量：${selectedProduct.annualVolume.toLocaleString()}\n\n请您提供该项目的单价及交期信息，谢谢！\n\n此致\n${project.owners.sales}\nDR.aiVOSS 智能报价系统`
    );

    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  // 处理新增产品
  const handleAddProduct = async () => {
    // 验证必填字段
    if (!newProduct.name.trim()) {
      alert('请输入产品名称');
      return;
    }
    if (!newProduct.code.trim()) {
      alert('请输入产品编码');
      return;
    }

    setIsAddingProduct(true);
    try {
      // 使用新的 api.products.create
      const result = await api.products.create({
        projectId: project.id,
        productName: newProduct.name,
        productCode: newProduct.code,
        routeCode: newProduct.routeCode || undefined,
      });

      // 创建成功，添加到产品列表
      const newProductData: Product = {
        id: result.id,
        name: result.productName,
        partNumber: result.productCode,
        annualVolume: parseInt(newProduct.annualVolume) || 0,
        description: newProduct.description,
      };

      // 更新当前项目的 products 数组
      const updatedProject: ProjectData = {
        ...project,
        products: [...project.products, newProductData],
        updatedDate: new Date().toISOString(),
      };

      // 通知 store 更新项目数据
      updateProject(updatedProject);

      // 更新本地产品和 BOM 数据
      setSelectedProduct(newProductData);
      setBomData(prev => ({
        ...prev,
        [newProductData.id]: {
          productId: newProductData.id,
          isUploaded: false,
          isParsing: false,
          parseProgress: 0,
          isParsed: false,
          materials: [],
          processes: [],
        },
      }));

      // 关闭对话框并重置表单
      setIsAddProductOpen(false);
      setNewProduct({
        name: '',
        code: '',
        routeCode: '',
        annualVolume: project.annualVolume || '0',
        description: '',
      });

      // 成功提示
      alert('产品创建成功！');
    } catch (error) {
      const message = error instanceof Error ? error.message : '创建产品失败';
      alert(`创建产品失败：${message}`);
    } finally {
      setIsAddingProduct(false);
    }
  };

  // 计算统计数据
  const getProductStats = () => {
    if (!currentBomData?.isParsed) {
      return { materials: 0, processes: 0, needInquiry: 0, totalCost: 0 };
    }

    const materialsNeedInquiry = currentBomData.materials.filter(m => !m.hasHistoryData).length;
    const processesNeedInquiry = currentBomData.processes.filter(p => !p.hasHistoryData).length;
    
    const materialCost = currentBomData.materials
      .filter(m => m.hasHistoryData && m.unitPrice)
      .reduce((sum, m) => sum + (m.vavePrice || m.unitPrice!) * m.quantity, 0);
    
    const processCost = currentBomData.processes
      .filter(p => p.hasHistoryData && p.unitPrice)
      .reduce((sum, p) => sum + (p.vavePrice || p.unitPrice!) * p.quantity, 0);

    return {
      materials: currentBomData.materials.length,
      processes: currentBomData.processes.length,
      needInquiry: materialsNeedInquiry + processesNeedInquiry,
      totalCost: materialCost + processCost
    };
  };

  const stats = getProductStats();

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl">BOM管理</h1>
              <Badge variant="outline" className="font-mono text-xs">
                {project.id}
              </Badge>
            </div>
            <p className="text-sm text-zinc-500">
              {project.projectName} · {project.clientName}
            </p>
          </div>
          <Button 
            onClick={() => onNavigate('cost-calc')}
            disabled={!currentBomData?.isParsed || stats.needInquiry > 0}
            className="gap-2"
          >
            下一步：工艺评估
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Product Selector */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  选择产品
                </CardTitle>
                <CardDescription>
                  本项目包含 {project.products.length} 个产品，请选择需要上传BOM表的产品
                </CardDescription>
              </div>
              <Button
                onClick={() => setIsAddProductOpen(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                新增产品
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {project.products.map((product) => {
                const isSelected = selectedProduct.id === product.id;
                const productBom = bomData[product.id];
                
                return (
                  <Card 
                    key={product.id}
                    className={`cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                        : 'hover:border-zinc-300 hover:shadow-sm'
                    }`}
                    onClick={() => setSelectedProduct(product)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-medium mb-1">{product.name}</p>
                          <p className="text-xs text-zinc-500 font-mono">{product.partNumber}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {productBom?.isParsed && (
                            <Badge variant="secondary" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              已解析
                            </Badge>
                          )}
                          {productBom?.routingId && (
                            productBom.isRoutingKnown ? (
                              <Badge variant="secondary" className="gap-1 bg-green-100 text-green-700 border-green-300">
                                <CheckCircle2 className="h-3 w-3" />
                                成熟路线
                              </Badge>
                            ) : productBom.needsIEReview ? (
                              <Badge variant="outline" className="gap-1 text-red-600 border-red-300">
                                <AlertCircle className="h-3 w-3" />
                                需IE确认
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="gap-1 text-orange-600 border-orange-300">
                                <AlertTriangle className="h-3 w-3" />
                                新路线
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-zinc-500">
                        年量：{product.annualVolume.toLocaleString()} pcs
                      </div>
                      {productBom?.routingId && (
                        <div className="mt-2 pt-2 border-t">
                          <p className="text-xs text-zinc-400">
                            路线编码：<span className="font-mono text-zinc-600">{productBom.routingId}</span>
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upload BOM */}
        {!currentBomData?.isUploaded ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                上传 {selectedProduct.name} 的BOM表
              </CardTitle>
              <CardDescription>
                支持 Excel (.xlsx, .xls) 或 CSV 格式，AI将自动解析物料清单和工艺清单
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed rounded-lg p-12 text-center">
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                    <FileSpreadsheet className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-base font-medium mb-2">上传BOM表文件</h3>
                <p className="text-sm text-zinc-500 mb-4">
                  点击或拖拽文件到此区域上传
                </p>
                <label htmlFor="bom-upload">
                  <Button asChild>
                    <span className="cursor-pointer gap-2">
                      <Upload className="h-4 w-4" />
                      选择文件
                    </span>
                  </Button>
                  <Input
                    id="bom-upload"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>

              <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-purple-900 mb-1">AI 智能解析</p>
                    <p className="text-xs text-purple-700">
                      上传后，AI将自动识别BOM表中的物料和工艺信息，查询历史数据库，为有记录的项目自动匹配单价和VAVE优化价格。
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : currentBomData.isParsing ? (
          <Card>
            <CardContent className="p-12">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-medium mb-2">AI 正在解析BOM表</h3>
                  <p className="text-sm text-zinc-500 mb-4">{fileName}</p>
                  <div className="max-w-md mx-auto">
                    <div className="h-2 bg-zinc-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${currentBomData.parseProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-zinc-500 mt-2">
                      {currentBomData.parseProgress}% 完成
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">物料项数</p>
                      <p className="text-2xl font-semibold">{stats.materials}</p>
                    </div>
                    <Package className="h-8 w-8 text-blue-600 opacity-50" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">工艺项数</p>
                      <p className="text-2xl font-semibold">{stats.processes}</p>
                    </div>
                    <Settings className="h-8 w-8 text-purple-600 opacity-50" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">需询价</p>
                      <p className="text-2xl font-semibold text-orange-600">{stats.needInquiry}</p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-orange-600 opacity-50" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">单件成本</p>
                      <p className="text-2xl font-semibold text-green-600">
                        ¥{stats.totalCost.toFixed(2)}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600 opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Materials & Processes Tables */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      AI 解析结果
                    </CardTitle>
                    <CardDescription>
                      物料清单和工艺清单已从BOM表中识别，数据库查询完成
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {fileName}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="materials" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="materials">
                      物料清单 ({currentBomData.materials.length})
                    </TabsTrigger>
                    <TabsTrigger value="processes">
                      工艺清单 ({currentBomData.processes.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="materials" className="mt-6">
                    <div className="border rounded-lg overflow-hidden overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[60px]">层级</TableHead>
                            <TableHead className="w-[120px]">零件号</TableHead>
                            <TableHead>零件名称</TableHead>
                            <TableHead className="w-[60px]">版本</TableHead>
                            <TableHead className="w-[60px]">类型</TableHead>
                            <TableHead className="w-[60px]">状态</TableHead>
                            <TableHead>材料</TableHead>
                            <TableHead>供应商</TableHead>
                            <TableHead className="text-right w-[80px]">数量</TableHead>
                            <TableHead className="text-right w-[100px]">单价</TableHead>
                            <TableHead className="text-right w-[100px]">VAVE单价</TableHead>
                            <TableHead className="w-[150px]">备注</TableHead>
                            <TableHead className="text-right w-[100px]">操作</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentBomData.materials.map((material) => (
                            <TableRow key={material.id}>
                              <TableCell className="text-xs">
                                {material.level}
                              </TableCell>
                              <TableCell className="font-mono text-xs">
                                {material.partNumber}
                              </TableCell>
                              <TableCell className="font-medium text-sm">
                                {material.partName}
                              </TableCell>
                              <TableCell className="text-xs text-zinc-500">
                                {material.version}
                              </TableCell>
                              <TableCell className="text-xs">
                                <Badge variant="outline" className="text-xs">
                                  {material.type}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs">
                                <Badge variant="secondary" className="text-xs">
                                  {material.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="min-w-[180px]">
                                <Select
                                  value={material.material}
                                  onValueChange={(value) => handleMaterialTypeChange(material.id, value)}
                                >
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {MATERIAL_TYPES.map((type) => (
                                      <SelectItem key={type.value} value={type.value} className="text-xs">
                                        {type.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell className="text-xs text-zinc-600">
                                {material.supplier || '-'}
                              </TableCell>
                              <TableCell className="text-right text-sm">
                                {material.quantity} {material.unit}
                              </TableCell>
                              <TableCell className="text-right">
                                {material.hasHistoryData && material.unitPrice ? (
                                  <div className="space-y-1">
                                    <div className="font-medium">
                                      ¥{material.unitPrice.toFixed(2)}
                                    </div>
                                    {getPriceValidationBadge(material.material, material.unitPrice)}
                                  </div>
                                ) : (
                                  <span className="text-zinc-400">-</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                {material.hasHistoryData && material.vavePrice ? (
                                  <div className="flex items-center justify-end gap-1">
                                    <TrendingDown className="h-3 w-3 text-green-600" />
                                    <span className="font-medium text-green-600">
                                      ¥{material.vavePrice.toFixed(2)}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-zinc-400">-</span>
                                )}
                              </TableCell>
                              <TableCell className="text-xs text-zinc-500 max-w-[150px] truncate">
                                {material.comments || '-'}
                              </TableCell>
                              <TableCell className="text-right">
                                {material.hasHistoryData ? (
                                  <Badge variant="secondary" className="gap-1">
                                    <CheckCircle2 className="h-3 w-3" />
                                    已匹配
                                  </Badge>
                                ) : (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="gap-1 text-xs"
                                    onClick={() => handleInquiry('material', material)}
                                  >
                                    <Mail className="h-3 w-3" />
                                    询价
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>

                  <TabsContent value="processes" className="mt-6">
                    <div className="border rounded-lg overflow-hidden overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[80px]">工序号</TableHead>
                            <TableHead>工序名称</TableHead>
                            <TableHead>工作中心</TableHead>
                            <TableHead className="text-right w-[100px]">标准工时</TableHead>
                            <TableHead className="text-right w-[100px]">单价</TableHead>
                            <TableHead className="text-right w-[100px]">VAVE单价</TableHead>
                            <TableHead>规格要求</TableHead>
                            <TableHead className="text-right w-[100px]">操作</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentBomData.processes.map((process) => (
                            <TableRow key={process.id}>
                              <TableCell className="font-mono text-sm font-medium">
                                {process.opNo}
                              </TableCell>
                              <TableCell className="font-medium">
                                {process.name}
                              </TableCell>
                              <TableCell className="text-sm">
                                <Input 
                                  value={process.workCenter}
                                  className="h-8 text-xs"
                                  disabled={currentBomData.isRoutingKnown && process.isOperationKnown}
                                  onChange={(e) => handleWorkCenterChange(process.id, e.target.value)}
                                />
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Input 
                                    value={process.standardTime}
                                    type="number"
                                    step="0.1"
                                    className="h-8 w-20 text-xs text-right"
                                    disabled={currentBomData.isRoutingKnown && process.isOperationKnown}
                                    onChange={(e) => handleStandardTimeChange(process.id, parseFloat(e.target.value))}
                                  />
                                  <span className="text-xs text-zinc-500">h</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                {process.hasHistoryData && process.unitPrice ? (
                                  <span className="font-medium">
                                    ¥{process.unitPrice.toFixed(2)}
                                  </span>
                                ) : (
                                  <span className="text-zinc-400">-</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                {process.hasHistoryData && process.vavePrice ? (
                                  <div className="flex items-center justify-end gap-1">
                                    <TrendingDown className="h-3 w-3 text-green-600" />
                                    <span className="font-medium text-green-600">
                                      ¥{process.vavePrice.toFixed(2)}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-zinc-400">-</span>
                                )}
                              </TableCell>
                              <TableCell className="text-xs text-zinc-500 max-w-[200px] truncate">
                                {process.spec || '-'}
                              </TableCell>
                              <TableCell className="text-right">
                                {currentBomData.needsIEReview ? (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="gap-1 text-xs text-purple-600 border-purple-300"
                                  >
                                    <Settings className="h-3 w-3" />
                                    IE确认
                                  </Button>
                                ) : process.hasHistoryData ? (
                                  <Badge variant="secondary" className="gap-1">
                                    <CheckCircle2 className="h-3 w-3" />
                                    已匹配
                                  </Badge>
                                ) : (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="gap-1 text-xs"
                                    onClick={() => handleInquiry('process', process)}
                                  >
                                    <Mail className="h-3 w-3" />
                                    询价
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    
                    {/* Routing Info Card */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-3">
                        <Database className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-blue-900 mb-2 font-medium">工艺路线识别说明</p>
                          <div className="space-y-1 text-xs text-blue-700">
                            <p>• <strong>成熟路线</strong>：系统识别到工艺路线编码，计算规则已维护到系统，工作中心和工时可确认/修改</p>
                            <p>• <strong>新工艺路线</strong>：有工艺路线编码但系统未识别，需要为每个工序单独查询单价</p>
                            <p>• <strong>需IE确认</strong>：BOM表中未提供工艺路线编码，需要IE工程师参与确认新工艺路线</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Inquiry Reminder */}
                {stats.needInquiry > 0 && (
                  <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-orange-900 mb-1">
                          需要询价 {stats.needInquiry} 个项目
                        </p>
                        <p className="text-xs text-orange-700">
                          点击"询价"按钮将自动生成询价邮件，包含项目和产品的完整信息。完成所有询价后才能进入下一步。
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={() => onNavigate('dashboard')}>
            返回仪表板
          </Button>
          {currentBomData?.isParsed && stats.needInquiry === 0 && (
            <Button onClick={() => onNavigate('cost-calc')} className="gap-2">
              继续下一步
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* 新增产品对话框 */}
      <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              新增产品
            </DialogTitle>
            <DialogDescription>
              为项目 {project.id} 添加新产品，带 * 的字段为必填项
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* 产品名称 - 必填 */}
            <div className="space-y-2">
              <Label htmlFor="productName">
                产品名称 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="productName"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                placeholder="例如：发动机缸体"
                disabled={isAddingProduct}
              />
            </div>

            {/* 产品编码 - 必填 */}
            <div className="space-y-2">
              <Label htmlFor="productCode">
                产品编码 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="productCode"
                value={newProduct.code}
                onChange={(e) => setNewProduct({ ...newProduct, code: e.target.value })}
                placeholder="例如：PRT-2024-001"
                disabled={isAddingProduct}
              />
            </div>

            {/* 工艺路线编码 - 非必填 */}
            <div className="space-y-2">
              <Label htmlFor="routeCode">工艺路线编码</Label>
              <Input
                id="routeCode"
                value={newProduct.routeCode}
                onChange={(e) => setNewProduct({ ...newProduct, routeCode: e.target.value })}
                placeholder="例如：RT-AL-CASTING（可选）"
                disabled={isAddingProduct}
              />
              <p className="text-xs text-zinc-500">
                如果已知工艺路线编码，请填写以自动关联工艺路线
              </p>
            </div>

            {/* 年产量 */}
            <div className="space-y-2">
              <Label htmlFor="annualVolume">年产量</Label>
              <Input
                id="annualVolume"
                type="number"
                value={newProduct.annualVolume}
                onChange={(e) => setNewProduct({ ...newProduct, annualVolume: e.target.value })}
                placeholder="默认使用项目年产量"
                disabled={isAddingProduct}
              />
            </div>

            {/* 描述 */}
            <div className="space-y-2">
              <Label htmlFor="description">产品描述</Label>
              <Input
                id="description"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                placeholder="产品的简要描述（可选）"
                disabled={isAddingProduct}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsAddProductOpen(false)}
              disabled={isAddingProduct}
            >
              取消
            </Button>
            <Button
              onClick={handleAddProduct}
              disabled={isAddingProduct || !newProduct.name.trim() || !newProduct.code.trim()}
            >
              {isAddingProduct ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  创建中...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  创建产品
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}