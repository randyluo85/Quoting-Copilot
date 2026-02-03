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
}

/**
 * API Client
 */
export const api = {
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

    getMaterials: (projectId: string) =>
      apiRequest<any>(`/bom/${projectId}/materials`),

    getProcesses: (projectId: string) =>
      apiRequest<any>(`/bom/${projectId}/processes`),
  },

  // ========== 成本计算相关 ==========
  cost: {
    calculate: (projectId: string, productId: string) =>
      apiRequest<any>(`/cost/calculate?project_id=${projectId}&product_id=${productId}`),

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
