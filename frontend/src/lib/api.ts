/**
 * API Client for SmartQuote Backend
 *
 * 统一的 API 调用封装，处理错误、类型安全和响应转换。
 */

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api/v1';

/**
 * API 错误类
 */
export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

/**
 * 通用 API 请求封装
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await window.fetch(url, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: '请求失败' }));
      throw new ApiError(
        error.message || error.detail || '请求失败',
        response.status,
        error.code
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('网络请求失败', 0);
  }
}

/**
 * 类型定义（与后端 Schema 对齐）
 */

// 项目状态
export type ProjectStatus = 'draft' | 'in-progress' | 'completed';

// 产品
export interface Product {
  id: string;
  name: string;
  partNumber: string;
  annualVolume: number;
  description: string;
}

// 创建产品请求
export interface ProductCreate {
  projectId: string;
  productName: string;
  productCode: string;
  routeCode?: string;
  productVersion?: string;
  annualVolume?: string;  // 前端暂存，不传给后端
  description?: string;   // 前端暂存，不传给后端
}

// 产品响应
export interface ProductResponse {
  id: string;
  projectId: string;
  productName: string;
  productCode: string;
  routeCode?: string;
  productVersion?: string;
  createdAt: string;
}

// 负责人
export interface ProjectOwner {
  sales: string;
  vm: string;
  ie: string;
  pe: string;
  controlling: string;
}

// 项目数据
export interface ProjectData {
  id: string;
  asacNumber: string;
  customerNumber: string;
  productVersion: string;
  customerVersion: string;
  clientName: string;
  projectName: string;
  annualVolume: string;
  description: string;
  products: Product[];
  owners: ProjectOwner;
  status: ProjectStatus;
  createdDate: string;
  updatedDate: string;
}

// 创建项目请求
export interface ProjectCreate {
  asacNumber: string;
  customerNumber: string;
  productVersion: string;
  customerVersion: string;
  clientName: string;
  projectName: string;
  annualVolume: string;
  description: string;
  products: Product[];
  owners: ProjectOwner;
  targetMargin?: number; // 目标利润率(%)
}

// 项目数据（扩展）
export interface ProjectDataExtended extends ProjectData {
  targetMargin?: number; // 目标利润率(%)
  owner?: string; // 负责人（简化字段）
  remarks?: string; // 备注
}

// 双轨价格封装
export interface PricePair {
  std: number; // 标准成本
  vave: number; // VAVE 目标成本
  savings: number; // 节省金额
  savingsRate: number; // 节省率
}

// 状态灯
export type StatusLight = 'verified' | 'warning' | 'missing';

// 物料详情（扩展）
export interface MaterialDetail {
  id: number;
  itemCode: string;
  name: string;
  spec?: string;
  version?: string;
  materialType?: string; // made/bought
  status?: string; // active/inactive
  material?: string; // 材料描述
  supplier?: string;
  remarks?: string;
  stdPrice?: number;
  vavePrice?: number;
  supplierTier?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

// 报价汇总
export interface QuoteSummary {
  id: string;
  projectId: string;
  totalStdCost?: number;
  totalVaveCost?: number;
  totalSavings?: number;
  savingsRate?: number;
  quotedPrice?: number;
  actualMargin?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * API Client
 */
export const api = {
  // ========== 产品相关 ==========
  products: {
    create: (data: ProductCreate) =>
      apiRequest<ProductResponse>('/project-products', {
        method: 'POST',
        body: JSON.stringify({
          projectId: data.projectId,
          productName: data.productName,
          productCode: data.productCode,
          ...(data.routeCode && { routeCode: data.routeCode }),
          ...(data.productVersion && { productVersion: data.productVersion }),
        }),
      }),

    list: (projectId: string) =>
      apiRequest<ProductResponse[]>(`/project-products/${projectId}`),
  },

  // ========== 项目相关 ==========
  projects: {
    list: () => apiRequest<ProjectData[]>('/projects'),

    get: (id: string) => apiRequest<ProjectData>(`/projects/${id}`),

    create: (data: ProjectCreate) =>
      apiRequest<ProjectData>('/projects', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: Partial<ProjectCreate>) =>
      apiRequest<ProjectData>(`/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      apiRequest<void>(`/projects/${id}`, {
        method: 'DELETE',
      }),
  },

  // ========== BOM 相关 ==========
  bom: {
    upload: async (projectId: string, file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('project_id', projectId);

      const response = await window.fetch(`${API_BASE}/bom/upload?project_id=${projectId}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new ApiError('BOM 上传失败', response.status);
      }

      return response.json();
    },

    // 确认创建产品及 BOM 数据（保存到数据库）
    confirmCreate: (projectId: string, productsGrouped: any[]) =>
      apiRequest<any>('/bom/confirm-create', {
        method: 'POST',
        body: JSON.stringify({
          projectId: projectId,
          products: productsGrouped,
        }),
      }),

    // 获取项目中所有产品的 BOM 数据
    getProjectBOMData: (projectId: string) =>
      apiRequest<any>(`/bom/products/${projectId}`),

    getMaterials: (projectId: string) =>
      apiRequest<any>(`/bom/${projectId}/materials`),

    getProcesses: (projectId: string) =>
      apiRequest<any>(`/bom/${projectId}/processes`),
  },

  // ========== 成本计算相关 ==========
  cost: {
    calculate: (projectId: string, productId: string, data: {
      materials: Array<{ code: string; quantity: number }>;
      processes: Array<{ name: string; cycle_time: number }>;
    }) =>
      apiRequest<any>(`/cost/calculate?project_id=${projectId}&product_id=${productId}`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getResult: (projectId: string) =>
      apiRequest<any>(`/cost/${projectId}`),
  },

  // ========== 报价相关 ==========
  quotation: {
    generate: (projectId: string) =>
      apiRequest<any>(`/quotation/generate`, {
        method: 'POST',
        body: JSON.stringify({ projectId }),
      }),

    get: (projectId: string) =>
      apiRequest<any>(`/quotation/${projectId}`),
  },
};

export default api;
