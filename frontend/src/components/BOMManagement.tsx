import { useState, useEffect } from 'react';
import {
  Upload,
  FileSpreadsheet,
  Sparkles,
  Box,
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from './ui/sheet';
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

export function BOMManagement({ onNavigate }: BOMManagementProps) {
  const project = useProjectStore((state) => state.selectedProject)!;
  const updateProject = useProjectStore((state) => state.updateProject);

  // 状态声明 - 必须在所有检查之前
  const [selectedProduct, setSelectedProduct] = useState<Product>(
    project?.products?.[0] || { id: '', name: '', partNumber: '', annualVolume: 0, description: '' }
  );
  const [bomData, setBomData] = useState<Record<string, ProductBOMData>>({});
  const [fileName, setFileName] = useState('');

  // 新增产品状态
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    code: '',
    routeCode: '',
    annualVolume: project?.annualVolume || '0',
    description: '',
  });

  // 多产品 BOM 解析状态
  const [multiProductPreview, setMultiProductPreview] = useState<{
    products: Array<{
      product_code: string;
      product_name: string | null;
      material_count: number;
    }>;
    products_grouped?: Array<{
      product_code: string;
      product_name: string | null;
      materials: any[];
      processes: any[];
    }>;
    total_materials: number;
    materials: any[];
    processes: any[];
  } | null>(null);
  const [showMultiProductDialog, setShowMultiProductDialog] = useState(false);

  // 当产品列表变化时，更新 selectedProduct - 必须在条件返回之前
  useEffect(() => {
    if (project?.products && project.products.length > 0) {
      if (!selectedProduct.id || !project.products.find(p => p.id === selectedProduct.id)) {
        setSelectedProduct(project.products[0]);
      }
    }
  }, [project?.products]);

  // 加载项目的 BOM 数据（从后端恢复已保存的数据）
  useEffect(() => {
    const loadBOMData = async () => {
      if (!project?.id || project.products.length === 0) return;

      try {
        const response = await api.bom.getProjectBOMData(project.id);
        if (response.status === 'success' && response.products) {
          const newBomData: Record<string, ProductBOMData> = {};

          for (const productData of response.products) {
            newBomData[productData.productId] = {
              productId: productData.productId,
              isUploaded: productData.isParsed,
              isParsing: false,
              isParsed: productData.isParsed,
              parseProgress: 100,
              materials: productData.materials || [],
              processes: productData.processes || [],
              isRoutingKnown: (productData.processes || []).length > 0,
              needsIEReview: (productData.materials || []).filter((m: any) => !m.hasHistoryData).length > 0
            };
          }

          setBomData(newBomData);
        }
      } catch (error) {
        // 如果加载失败，保持空状态（可能是新项目）
        console.log('No BOM data found or loading failed:', error);
      }
    };

    loadBOMData();
  }, [project?.id]);

  // 添加空值检查
  if (!project) {
    return (
      <div className="px-4 py-8 lg:px-8">
        <div className="max-w-7xl">
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

  // 处理空产品状态下的 BOM 上传（与有产品时使用相同的逻辑）
  const handleBOMUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    // 设置解析状态（使用第一个产品的ID，如果是新创建的会使用临时ID）
    const productId = selectedProduct?.id || 'temp';

    setBomData(prev => ({
      ...prev,
      [productId]: {
        productId: productId,
        isUploaded: true,
        isParsing: true,
        parseProgress: 0,
        isParsed: false,
        materials: [],
        processes: [],
      }
    }));

    try {
      // 调用 API 解析文件
      const response = await api.bom.upload(project.id, file);

      // 检查是否是多产品
      const detectedProducts = response.summary?.products || [];
      const totalProducts = response.summary?.total_products || 1;
      const productsGrouped = response.products_grouped || [];

      if (totalProducts > 1 && detectedProducts.length > 0) {
        // 显示多产品预览对话框
        setMultiProductPreview({
          products: detectedProducts,
          products_grouped: productsGrouped,
          total_materials: response.summary.total_materials,
          materials: response.materials || [],
          processes: response.processes || [],
        });
        setShowMultiProductDialog(true);

        // 清除解析状态
        setBomData(prev => {
          const updated = { ...prev };
          if (prev[productId]) {
            updated[productId] = { ...prev[productId], isParsing: false };
          }
          return updated;
        });
      } else {
        // 单产品，正常处理
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress += 20;
          setBomData(prev => {
            const updated = { ...prev };
            if (updated[productId]) {
              updated[productId] = {
                ...updated[productId],
                parseProgress: Math.min(progress, 90)
              };
            }
            return updated;
          });

          if (progress >= 90) {
            clearInterval(progressInterval);
          }
        }, 100);

        clearInterval(progressInterval);

        // 转换响应数据为前端格式
        const materials = (response.materials || []).map((m: any) => ({
          id: m.id,
          level: m.level || '1',
          partNumber: m.part_number || m.partNumber || '',
          partName: m.part_name || m.partName || '',
          version: m.version || '1.0',
          type: m.type || 'I',
          status: m.stock_status || m.stockStatus || 'N',  // BOM 文件的 "St" 列
          material: m.material || '',
          supplier: m.supplier || '',
          quantity: m.quantity,
          unit: m.unit || 'PC',
          unitPrice: m.unitPrice,
          vavePrice: m.vavePrice,
          comments: m.comments || '',
          hasHistoryData: m.hasHistoryData || false,
        }));

        const processes = (response.processes || []).map((p: any) => ({
          id: p.id,
          opNo: p.opNo || '',
          name: p.name || '',
          workCenter: p.workCenter || '',
          standardTime: p.standardTime || 0,
          spec: p.spec || '',
          unit: '件',
          quantity: 1,
          unitPrice: p.unitPrice,
          vavePrice: p.vavePrice,
          hasHistoryData: p.hasHistoryData || false,
        }));

        // 先更新本地状态（立即显示）
        setBomData(prev => {
          const updated = { ...prev };
          updated[productId] = {
            ...updated[productId],
            isParsing: false,
            isParsed: true,
            parseProgress: 100,
            materials,
            processes,
            isRoutingKnown: (processes || []).length > 0,
            needsIEReview: materials.filter((m: any) => !m.hasHistoryData).length > 0
          };
          return updated;
        });

        // 调用 confirmCreate 保存数据到数据库
        try {
          // 将数据转换为 confirmCreate 期望的格式
          const products_grouped = [{
            product_info: {
              product_code: selectedProduct.partNumber || selectedProduct.id,
              product_name: selectedProduct.name,
              product_number: selectedProduct.partNumber || '',
              product_version: '01',
              customer_version: '01',
              customer_number: null,
              issue_date: null,
              material_count: materials.length,
              process_count: processes.length,
            },
            materials: materials.map((m: any) => ({
              level: m.level || '1',
              part_number: m.partNumber,
              part_name: m.partName,
              version: m.version,
              type: m.type,
              status: m.status,
              material: m.material,
              supplier: m.supplier,
              quantity: m.quantity,
              unit: m.unit,
              comments: m.comments,
            })),
            processes: processes.map((p: any) => ({
              op_no: p.opNo,
              name: p.name,
              work_center: p.workCenter,
              standard_time: p.standardTime,
              spec: p.spec,
            })),
          }];

          await api.bom.confirmCreate(project.id, products_grouped);
          console.log('BOM data saved to database successfully');
        } catch (saveError) {
          console.error('Failed to save BOM data to database:', saveError);
          // 不中断用户流程，数据已在本地显示
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '上传失败，请重试';
      setBomData(prev => {
        const updated = { ...prev };
        if (updated[productId]) {
          updated[productId] = {
            ...updated[productId],
            isParsing: false,
            isParsed: false,
            uploadError: errorMessage
          };
        }
        return updated;
      });
    }
  };

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

  // 处理多产品确认 - 创建新产品并分配物料
  const handleMultiProductConfirm = async () => {
    if (!multiProductPreview) return;

    // 为每个检测到的产品创建新的 Product 对象
    const newProducts: Product[] = multiProductPreview.products.map((p, idx) => ({
      id: `P-${Date.now()}-${idx}`,
      name: p.product_name || p.product_code,
      partNumber: p.product_code,
      annualVolume: parseInt(project.annualVolume) || 100000,
      description: `从 BOM 文件自动导入`,
    }));

    // 为每个新产品分配对应的物料数据
    const newBomData: Record<string, ProductBOMData> = { ...bomData };

    // 准备发送给 confirmCreate 的数据
    const products_grouped_for_api = [];

    // 使用 products_grouped 来分配物料
    if (multiProductPreview.products_grouped && multiProductPreview.products_grouped.length > 0) {
      multiProductPreview.products_grouped.forEach((groupedProduct: any, idx: number) => {
        const product = newProducts[idx];
        if (product) {
          // 转换物料数据为 API 期望的格式
          const materials_for_api = (groupedProduct.materials || []).map((m: any) => ({
            level: m.level || '1',
            part_number: m.part_number || m.partNumber,
            part_name: m.part_name || m.partName,
            version: m.version || '1.0',
            type: m.type || 'I',
            status: m.stock_status || m.stockStatus || m.status || 'N',
            material: m.material || '',
            supplier: m.supplier || '',
            quantity: m.quantity,
            unit: m.unit || 'PC',
            comments: m.comments || '',
          }));

          // 转换工艺数据为 API 期望的格式
          const processes_for_api = (groupedProduct.processes || []).map((p: any) => ({
            op_no: p.opNo || p.op_no,
            name: p.name,
            work_center: p.workCenter || p.work_center || '',
            standard_time: p.standardTime || p.standard_time || 0,
            spec: p.spec || '',
          }));

          products_grouped_for_api.push({
            product_info: {
              product_code: groupedProduct.product_code,
              product_name: groupedProduct.product_name,
              product_number: groupedProduct.product_number,
              product_version: '01',
              customer_version: '01',
              customer_number: groupedProduct.customer_number,
              issue_date: null,
              material_count: materials_for_api.length,
              process_count: processes_for_api.length,
            },
            materials: materials_for_api,
            processes: processes_for_api,
          });

          newBomData[product.id] = {
            productId: product.id,
            isUploaded: true,
            isParsing: false,
            isParsed: true,
            parseProgress: 100,
            materials: groupedProduct.materials || [],
            processes: groupedProduct.processes || [],
            isRoutingKnown: false,
            needsIEReview: (groupedProduct.materials || []).filter((m: any) => !m.hasHistoryData).length > 0
          };
        }
      });
    }

    // 调用 API 保存数据到数据库
    try {
      await api.bom.confirmCreate(project.id, products_grouped_for_api);
      console.log('Multi-product BOM data saved to database successfully');
    } catch (saveError) {
      console.error('Failed to save multi-product BOM data to database:', saveError);
      // 不中断用户流程
    }

    // 更新项目的产品列表
    const updatedProject = {
      ...project,
      products: [...project.products, ...newProducts],
    };
    updateProject(updatedProject);

    setBomData(newBomData);

    // 自动选中第一个新产品
    if (newProducts.length > 0) {
      setSelectedProduct(newProducts[0]);
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
    <div className="px-4 py-8 lg:px-8">
      <div className="w-full space-y-6 overflow-x-auto">
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
                onClick={() => {
                  console.log('新增产品按钮被点击');
                  setIsAddProductOpen(true);
                  console.log('isAddProductOpen 设置为 true');
                }}
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
        {(!currentBomData?.isUploaded || selectedProduct.id === '') ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                {selectedProduct.name ? `上传 ${selectedProduct.name} 的BOM表` : '上传 BOM 文件'}
              </CardTitle>
              <CardDescription>
                支持 Excel (.xlsx, .xls) 或 CSV 格式，AI将自动解析物料清单和工艺清单
                {project.products.length === 0 && ' · 可直接上传多产品BOM文件，系统将自动识别创建产品'}
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
                <label
                  htmlFor="bom-file-input"
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 cursor-pointer"
                >
                  <Upload className="h-4 w-4" />
                  选择文件
                </label>
                <input
                  id="bom-file-input"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  style={{ position: 'absolute', width: '1px', height: '1px', opacity: 0, overflow: 'hidden', clip: 'rect(0, 0, 0, 0)' }}
                  onChange={handleBOMUpload}
                />
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
              <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-blue-600 mb-1 font-medium">物料项数</p>
                      <p className="text-2xl font-bold text-blue-700">{stats.materials}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-blue-100">
                      <Package className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-purple-600 mb-1 font-medium">工艺项数</p>
                      <p className="text-2xl font-bold text-purple-700">{stats.processes}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-purple-100">
                      <Settings className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-orange-600 mb-1 font-medium">需询价</p>
                      <p className="text-2xl font-bold text-orange-700">{stats.needInquiry}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-orange-100">
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-green-600 mb-1 font-medium">单件成本</p>
                      <p className="text-2xl font-bold text-green-700">
                        ¥{stats.totalCost.toFixed(2)}
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-green-100">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Materials & Processes Tables */}
            <Card className="border-zinc-200 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-zinc-200">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-zinc-900">
                      <div className="p-1.5 rounded-lg bg-purple-100">
                        <Sparkles className="h-4 w-4 text-purple-600" />
                      </div>
                      AI 解析结果
                    </CardTitle>
                    <CardDescription className="text-zinc-600">
                      物料清单和工艺清单已从BOM表中识别，数据库查询完成
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="gap-1 bg-green-50 text-green-700 border-green-200 hover:bg-green-50">
                    <CheckCircle2 className="h-3 w-3" />
                    {fileName}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <Tabs defaultValue="materials" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-zinc-100/80 p-1 rounded-xl">
                    <TabsTrigger value="materials" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      <Package className="h-4 w-4 mr-2" />
                      物料清单 ({currentBomData.materials.length})
                    </TabsTrigger>
                    <TabsTrigger value="processes" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      <Settings className="h-4 w-4 mr-2" />
                      工艺清单 ({currentBomData.processes.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="materials" className="mt-6">
                    <div className="rounded-xl border border-zinc-200 overflow-hidden overflow-x-auto shadow-sm">
                      <Table>
                        <TableHeader className="bg-gradient-to-r from-zinc-50 to-zinc-100/50">
                          <TableRow className="border-b-zinc-200 hover:bg-transparent">
                            <TableHead className="w-[60px] text-xs font-semibold text-zinc-700">层级</TableHead>
                            <TableHead className="w-[140px] text-xs font-semibold text-zinc-700">零件号</TableHead>
                            <TableHead className="text-xs font-semibold text-zinc-700">零件名称</TableHead>
                            <TableHead className="w-[70px] text-xs font-semibold text-zinc-700">版本</TableHead>
                            <TableHead className="w-[70px] text-xs font-semibold text-zinc-700">类型</TableHead>
                            <TableHead className="w-[70px] text-xs font-semibold text-zinc-700">状态</TableHead>
                            <TableHead className="text-xs font-semibold text-zinc-700">材料</TableHead>
                            <TableHead className="w-[120px] text-xs font-semibold text-zinc-700">供应商</TableHead>
                            <TableHead className="text-right w-[90px] text-xs font-semibold text-zinc-700">数量</TableHead>
                            <TableHead className="text-right w-[110px] text-xs font-semibold text-zinc-700">单价</TableHead>
                            <TableHead className="text-right w-[110px] text-xs font-semibold text-zinc-700">VAVE单价</TableHead>
                            <TableHead className="w-[150px] text-xs font-semibold text-zinc-700">备注</TableHead>
                            <TableHead className="text-right w-[100px] text-xs font-semibold text-zinc-700">操作</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentBomData.materials.map((material, idx) => (
                            <TableRow
                              key={material.id}
                              className="border-b-zinc-100 hover:bg-blue-50/50 transition-colors"
                            >
                              <TableCell className="text-xs text-zinc-500">
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-zinc-100 text-zinc-600 font-medium">
                                  {material.level}
                                </span>
                              </TableCell>
                              <TableCell className="font-mono text-xs text-blue-700 font-medium">
                                {material.partNumber}
                              </TableCell>
                              <TableCell className="font-medium text-sm text-zinc-900">
                                {material.partName}
                              </TableCell>
                              <TableCell className="text-xs">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-medium border border-indigo-100">
                                  v{material.version}
                                </span>
                              </TableCell>
                              <TableCell className="text-xs">
                                {material.type === 'F' ? (
                                  <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100 font-medium">
                                    自制
                                  </Badge>
                                ) : material.type === 'I' ? (
                                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 font-medium">
                                    外购
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="font-medium">
                                    {material.type}
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-xs">
                                {material.status === 'N' ? (
                                  <Badge className="bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-100 font-medium">
                                    正常
                                  </Badge>
                                ) : material.status === 'C' ? (
                                  <Badge className="bg-cyan-100 text-cyan-700 border-cyan-200 hover:bg-cyan-100 font-medium">
                                    确认
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="font-medium">
                                    {material.status}
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="min-w-[180px]">
                                <Select
                                  value={material.material}
                                  onValueChange={(value) => handleMaterialTypeChange(material.id, value)}
                                >
                                  <SelectTrigger className="h-8 text-xs bg-white border-zinc-200">
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
                                {material.supplier || (
                                  <span className="text-zinc-400 italic">未指定</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right text-sm font-medium text-zinc-700">
                                {material.quantity} <span className="text-zinc-500">{material.unit}</span>
                              </TableCell>
                              <TableCell className="text-right">
                                {material.hasHistoryData && material.unitPrice ? (
                                  <div className="space-y-0.5">
                                    <div className="font-semibold text-zinc-900">
                                      ¥{material.unitPrice.toFixed(2)}
                                    </div>
                                    {getPriceValidationBadge(material.material, material.unitPrice)}
                                  </div>
                                ) : (
                                  <span className="text-zinc-300 text-sm">-</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                {material.hasHistoryData && material.vavePrice ? (
                                  <div className="flex items-center justify-end gap-1">
                                    <TrendingDown className="h-3.5 w-3.5 text-green-600" />
                                    <span className="font-semibold text-green-600">
                                      ¥{material.vavePrice.toFixed(2)}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-zinc-300 text-sm">-</span>
                                )}
                              </TableCell>
                              <TableCell className="text-xs text-zinc-500 max-w-[150px] truncate" title={material.comments || ''}>
                                {material.comments || <span className="text-zinc-300">-</span>}
                              </TableCell>
                              <TableCell className="text-right">
                                {material.hasHistoryData ? (
                                  <Badge variant="secondary" className="gap-1 bg-green-50 text-green-700 border-green-200 hover:bg-green-50">
                                    <CheckCircle2 className="h-3 w-3" />
                                    已匹配
                                  </Badge>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1 text-xs h-8 bg-white hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
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
                    <div className="rounded-xl border border-zinc-200 overflow-hidden overflow-x-auto shadow-sm">
                      <Table>
                        <TableHeader className="bg-gradient-to-r from-purple-50 to-indigo-50/50">
                          <TableRow className="border-b-zinc-200 hover:bg-transparent">
                            <TableHead className="w-[90px] text-xs font-semibold text-zinc-700">工序号</TableHead>
                            <TableHead className="text-xs font-semibold text-zinc-700">工序名称</TableHead>
                            <TableHead className="text-xs font-semibold text-zinc-700">工作中心</TableHead>
                            <TableHead className="text-right w-[110px] text-xs font-semibold text-zinc-700">标准工时</TableHead>
                            <TableHead className="text-right w-[110px] text-xs font-semibold text-zinc-700">单价</TableHead>
                            <TableHead className="text-right w-[110px] text-xs font-semibold text-zinc-700">VAVE单价</TableHead>
                            <TableHead className="text-xs font-semibold text-zinc-700">规格要求</TableHead>
                            <TableHead className="text-right w-[100px] text-xs font-semibold text-zinc-700">操作</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentBomData.processes.map((process) => (
                            <TableRow
                              key={process.id}
                              className="border-b-zinc-100 hover:bg-purple-50/50 transition-colors"
                            >
                              <TableCell className="font-mono text-sm">
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-purple-700 font-semibold text-xs">
                                  {process.opNo}
                                </span>
                              </TableCell>
                              <TableCell className="font-medium text-sm text-zinc-900">
                                {process.name}
                              </TableCell>
                              <TableCell className="text-sm">
                                <Input
                                  value={process.workCenter}
                                  className="h-8 text-xs bg-white border-zinc-200"
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
                                    className="h-8 w-20 text-xs text-right bg-white border-zinc-200"
                                    disabled={currentBomData.isRoutingKnown && process.isOperationKnown}
                                    onChange={(e) => handleStandardTimeChange(process.id, parseFloat(e.target.value))}
                                  />
                                  <span className="text-xs text-zinc-500 font-medium">h</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                {process.hasHistoryData && process.unitPrice ? (
                                  <span className="font-semibold text-zinc-900">
                                    ¥{process.unitPrice.toFixed(2)}
                                  </span>
                                ) : (
                                  <span className="text-zinc-300 text-sm">-</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                {process.hasHistoryData && process.vavePrice ? (
                                  <div className="flex items-center justify-end gap-1">
                                    <TrendingDown className="h-3.5 w-3.5 text-green-600" />
                                    <span className="font-semibold text-green-600">
                                      ¥{process.vavePrice.toFixed(2)}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-zinc-300 text-sm">-</span>
                                )}
                              </TableCell>
                              <TableCell className="text-xs text-zinc-500 max-w-[200px] truncate" title={process.spec || ''}>
                                {process.spec || <span className="text-zinc-300">-</span>}
                              </TableCell>
                              <TableCell className="text-right">
                                {currentBomData.needsIEReview ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1 text-xs h-8 bg-white hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700"
                                  >
                                    <Settings className="h-3 w-3" />
                                    IE确认
                                  </Button>
                                ) : process.hasHistoryData ? (
                                  <Badge variant="secondary" className="gap-1 bg-green-50 text-green-700 border-green-200 hover:bg-green-50">
                                    <CheckCircle2 className="h-3 w-3" />
                                    已匹配
                                  </Badge>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1 text-xs h-8 bg-white hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
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

      {/* 新增产品抽屉 */}
      <Sheet open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
        <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              新增产品
            </SheetTitle>
            <SheetDescription>
              为项目 {project.id} 添加新产品，带 * 的字段为必填项
            </SheetDescription>
          </SheetHeader>

          <div className="px-6 space-y-4 py-4">
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

          <div className="flex justify-end gap-3 px-6 pt-4 border-t">
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
        </SheetContent>
      </Sheet>

      {/* 多产品 BOM 预览对话框 */}
      {showMultiProductDialog && multiProductPreview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <Card className="w-1/2 max-w-md max-h-[75vh] overflow-hidden flex flex-col shadow-2xl border-zinc-200">
            {/* Header */}
            <CardHeader className="border-b border-zinc-200 py-4 px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <div>
                    <CardTitle className="text-sm text-zinc-900">检测到多个产品</CardTitle>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      识别到 <span className="font-semibold text-purple-600">{multiProductPreview.products.length}</span> 个产品，共 <span className="font-semibold">{multiProductPreview.total_materials}</span> 个物料
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowMultiProductDialog(false);
                    setMultiProductPreview(null);
                  }}
                  className="p-1 rounded hover:bg-zinc-200/50 transition-colors"
                >
                  <X className="h-4 w-4 text-zinc-500" />
                </button>
              </div>
            </CardHeader>

            {/* Content - Table */}
            <CardContent className="flex-1 overflow-y-auto p-0">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 border-b border-zinc-200 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-zinc-600 w-8">#</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-zinc-600">产品代码</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-zinc-600">产品名称</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-zinc-600 w-16">物料数</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-zinc-600 w-16">状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {multiProductPreview.products.map((product, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50">
                      <td className="px-3 py-2 text-zinc-400 text-xs">{idx + 1}</td>
                      <td className="px-3 py-2 font-medium text-zinc-900 text-xs">{product.product_code}</td>
                      <td className="px-3 py-2 text-zinc-600 text-xs truncate max-w-[120px]">{product.product_name || <span className="italic text-zinc-400">未命名</span>}</td>
                      <td className="px-3 py-2 text-right text-zinc-600 text-xs">{product.material_count}</td>
                      <td className="px-3 py-2 text-center">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500 inline" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>

            {/* Footer */}
            <div className="flex justify-between items-center px-4 py-3 border-t border-zinc-200 bg-zinc-50">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowMultiProductDialog(false);
                  setMultiProductPreview(null);
                }}
              >
                取消
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowMultiProductDialog(false);
                    setMultiProductPreview(null);
                    // 仅导入到当前选中的产品
                    if (multiProductPreview) {
                      setBomData(prev => ({
                        ...prev,
                        [selectedProduct.id]: {
                          productId: selectedProduct.id,
                          isUploaded: true,
                          isParsing: false,
                          isParsed: true,
                          parseProgress: 100,
                          materials: multiProductPreview.materials,
                          processes: multiProductPreview.processes,
                          isRoutingKnown: false,
                          needsIEReview: multiProductPreview.materials.filter((m: any) => !m.hasHistoryData).length > 0
                        }
                      }));
                    }
                  }}
                >
                  仅导入当前
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    // 创建新产品并分配物料
                    handleMultiProductConfirm();
                    setShowMultiProductDialog(false);
                    setMultiProductPreview(null);
                  }}
                >
                  创建 {multiProductPreview.products.length} 个产品
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}