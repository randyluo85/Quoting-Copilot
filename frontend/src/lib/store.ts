/**
 * Zustand Stores for SmartQuote
 *
 * 全局状态管理，使用 Zustand 实现。
 * 每个 store 遵循单一职责原则。
 */

import { create } from 'zustand';
import { api, ProjectData, ProjectCreate } from './api';

// ==================== 项目 Store ====================

interface ProjectState {
  // 状态
  projects: ProjectData[];
  selectedProject: ProjectData | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchProjects: () => Promise<void>;
  createProject: (data: ProjectCreate) => Promise<ProjectData>;
  selectProject: (id: string | null) => void;
  updateProject: (project: ProjectData) => void;
  clearError: () => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  // 初始状态
  projects: [],
  selectedProject: null,
  loading: false,
  error: null,

  // 获取项目列表
  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      const projects = await api.projects.list();
      set({ projects, loading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : '获取项目列表失败';
      set({ error: message, loading: false });
    }
  },

  // 创建新项目
  createProject: async (data) => {
    set({ loading: true, error: null });
    try {
      const project = await api.projects.create(data);
      set((state) => ({
        projects: [...state.projects, project],
        selectedProject: project, // 自动选中新创建的项目
        loading: false,
      }));
      return project;
    } catch (err) {
      const message = err instanceof Error ? err.message : '创建项目失败';
      set({ error: message, loading: false });
      throw err;
    }
  },

  // 选择项目
  selectProject: (id) => {
    if (!id) {
      set({ selectedProject: null });
      return;
    }
    const project = get().projects.find((p) => p.id === id);
    set({ selectedProject: project || null });
  },

  // 更新项目（当新增产品后调用）
  updateProject: (project) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === project.id ? project : p
      ),
      selectedProject:
        state.selectedProject?.id === project.id
          ? project
          : state.selectedProject,
    }));
  },

  // 清除错误
  clearError: () => set({ error: null }),
}));

// ==================== BOM Store ====================

export interface Material {
  id: string;
  partNumber: string;
  partName: string;
  material: string;
  supplier: string;
  quantity: number;
  unit?: string;
  unitPrice?: number;
  vavePrice?: number;
  hasHistoryData: boolean;
  comments: string;
  status?: 'verified' | 'warning' | 'missing';
  // 新增字段（与后端对齐）
  level?: string; // 物料层级
  version?: string; // 版本
  materialType?: string; // made/bought
  stdCost?: number;
  vaveCost?: number;
  confidence?: number; // 匹配置信度 0-100
  aiSuggestion?: string;
}

export interface Process {
  id: string;
  opNo: string;
  name: string;
  workCenter: string;
  standardTime: number;
  unitPrice?: number;
  vavePrice?: number;
  hasHistoryData: boolean;
  // 新增字段（与后端对齐）
  processCode?: string; // 工序编码
  sequenceOrder?: number; // 工序顺序
  cycleTime?: number; // 工时（秒）
  spec?: string; // 规格要求
  unit?: string;
  quantity?: number;
  isOperationKnown?: boolean; // 该工序是否在系统中已知
  stdCost?: number;
  vaveCost?: number;
}

interface BOMState {
  materials: Material[];
  processes: Process[];
  uploading: boolean;
  parseId: string | null;
  error: string | null;

  uploadBOM: (projectId: string, file: File) => Promise<void>;
  clearBOM: () => void;
}

export const useBOMStore = create<BOMState>((set) => ({
  materials: [],
  processes: [],
  uploading: false,
  parseId: null,
  error: null,

  uploadBOM: async (projectId, file) => {
    set({ uploading: true, error: null });
    try {
      const result = await api.bom.upload(projectId, file);
      set({
        materials: result.materials || [],
        processes: result.processes || [],
        parseId: result.parseId,
        uploading: false,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'BOM 上传失败';
      set({ error: message, uploading: false });
      throw err;
    }
  },

  clearBOM: () => set({ materials: [], processes: [], parseId: null, error: null }),
}));

// ==================== 成本计算 Store ====================

export interface PricePair {
  std: number;
  vave: number;
  savings: number;
  savingsRate: number;
}

export interface CostResult {
  productId: string;
  materialCost: PricePair;
  processCost: PricePair;
  totalCost: PricePair;
}

interface CostState {
  result: CostResult | null;
  calculating: boolean;
  error: string | null;

  calculate: (
    projectId: string,
    productId: string,
    materials: Array<{ code: string; quantity: number }>,
    processes: Array<{ name: string; cycle_time: number }>
  ) => Promise<void>;
  clearResult: () => void;
}

export const useCostStore = create<CostState>((set) => ({
  result: null,
  calculating: false,
  error: null,

  calculate: async (projectId, productId, materials, processes) => {
    set({ calculating: true, error: null });
    try {
      const result = await api.cost.calculate(projectId, productId, { materials, processes });
      set({ result, calculating: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : '成本计算失败';
      set({ error: message, calculating: false });
      throw err;
    }
  },

  clearResult: () => set({ result: null, error: null }),
}));

// ==================== UI State Store ====================

type View =
  | 'dashboard'
  | 'project-success'
  | 'bom'
  | 'process'
  | 'cost-calc'
  | 'quotation'
  | 'investment'
  | 'output';

interface UIState {
  currentView: View;
  setCurrentView: (view: View) => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  currentView: 'dashboard',
  setCurrentView: (view) => set({ currentView: view }),
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
