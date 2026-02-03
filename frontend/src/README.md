# DR.aiVOSS 智能报价助手

## 项目简介

DR.aiVOSS 智能报价助手是一个专为制造业报价工程师设计的 AI 驱动报价管理系统。系统覆盖完整的 VOSS 报价流程，从询价管理到报价输出，提供智能化、自动化的报价解决方案。

### 核心特点

- 🎯 **超简洁设计**：黑白灰配色，shadcn/ui 组件风格
- 🤖 **AI 智能化**：AI 解析询价单、智能识别 BOM、自动计算成本
- 📦 **多产品支持**：一个项目包含多个产品，每个产品独立管理 BOM 和工艺
- 💰 **全成本核算**：物料、工艺、投资、其他四项成本独立计算
- 📊 **投资分析**：支持分摊年份设定（4-5年），自动计算 ROI

---

## 功能特性

### 1. 项目管理
- **PM 软件同步**：从 PM 软件同步项目信息
- **智能创建**：AI 解析询价单，自动识别关键信息
- **项目总览**：统一管理所有报价项目
- **状态跟踪**：草稿、进行中、已完成三种状态

### 2. BOM 管理
- **多产品架构**：项目 → 产品 → BOM 的三层结构
- **Tab 切换**：每个产品独立 Tab，独立管理 BOM
- **AI 识别**：上传 Excel/PDF，AI 自动识别物料信息
- **手动编辑**：支持添加、编辑、删除物料行项
- **数据验证**：自动检测重复物料、缺失信息

### 3. 成本核算
- **四项成本清单**：
  - 物料成本（Material Cost）
  - 工艺成本（Process Cost）
  - 投资成本（Investment Cost）
  - 其他成本（Other Cost）
- **同步展示**：四个成本清单与产品 Tab 同步切换
- **智能计算**：基于 BOM 数据自动计算各项成本
- **成本汇总**：按产品和项目维度汇总总成本

### 4. QS 报价摘要
- **分摊年份**：每个产品独立设定分摊年份（4-5年）
- **投资分摊**：按年份分摊投资成本
- **ROI 计算**：计算投资回报率
- **报价汇总**：生成最终报价摘要

### 5. 报价输出
- **多格式导出**：支持 Excel、PDF 格式
- **模板定制**：VOSS 标准报价模板
- **一键生成**：自动生成完整报价文档

---

## 技术栈

### 前端框架
- **React 18**：现代化 UI 框架
- **TypeScript**：类型安全
- **Tailwind CSS v4**：原子化 CSS 框架

### UI 组件库
- **shadcn/ui**：高质量 React 组件
- **Radix UI**：无障碍访问组件基础
- **Lucide React**：图标库

### 工具库
- **date-fns**：日期处理
- **recharts**：图表可视化

---

## 项目结构

```
/
├── App.tsx                          # 主应用入口
├── components/
│   ├── Dashboard.tsx                # 项目总览
│   ├── NewProject.tsx               # 新建项目
│   ├── ProjectCreationSuccess.tsx   # 项目创建成功
│   ├── BOMManagement.tsx            # BOM 管理
│   ├── ProcessAssessment.tsx        # 工艺评估（施工中）
│   ├── CostCalculation.tsx          # 成本核算
│   ├── QuoteSummary.tsx             # QS 报价摘要（施工中）
│   ├── InvestmentRecovery.tsx       # Payback 投资回收（施工中）
│   ├── QuotationOutput.tsx          # 报价输出（施工中）
│   ├── WorkflowGuide.tsx            # 流程导航
│   ├── AppSidebar.tsx               # 侧边栏
│   ├── UnderConstruction.tsx        # 施工中页面
│   └── ui/                          # shadcn/ui 组件
│       ├── button.tsx
│       ├── card.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       └── ...
├── styles/
│   └── globals.css                  # 全局样式
└── README.md                        # 项目文档
```

---

## 业务流程

### VOSS 报价流程（7步）

```
1. 新建项目
   └── 从 PM 软件同步或手动创建
   └── AI 解析询价单识别关键信息
   
2. BOM 管理
   └── 多产品 Tab 管理
   └── AI 识别 BOM 表
   └── 手动编辑物料清单
   
3. 工艺评估（施工中）
   └── 定义工艺路线
   └── 评估工时和工艺成本
   
4. 成本核算
   └── 物料成本计算
   └── 工艺成本计算
   └── 投资成本计算
   └── 其他成本计算
   
5. QS 报价摘要（施工中）
   └── 设定分摊年份
   └── 分摊投资成本
   └── 计算 ROI
   
6. Payback 投资回收分析（施工中）
   └── 投资回收期分析
   └── 现金流预测
   
7. 报价输出（施工中）
   └── 生成报价文档
   └── 导出 Excel/PDF
```

### 数据架构

```typescript
Project (项目)
├── id: string
├── projectName: string
├── clientName: string
├── annualVolume: string
├── products: Product[]        // 多个产品
└── owners: Owners

Product (产品)
├── id: string
├── name: string
├── partNumber: string
├── annualVolume: number
├── bom: BOMItem[]            // BOM 表
├── processes: Process[]      // 工艺流程
└── costs: Costs              // 成本数据

BOMItem (物料)
├── id: string
├── itemNumber: string
├── name: string
├── specification: string
├── quantity: number
├── unit: string
├── unitPrice: number
└── supplier: string

Costs (成本)
├── materialCost: CostItem[]   // 物料成本
├── processCost: CostItem[]    // 工艺成本
├── investmentCost: CostItem[] // 投资成本
└── otherCost: CostItem[]      // 其他成本
```

---

## 页面说明

### 1. 项目总览 (Dashboard)
- **路由**：`/dashboard`
- **功能**：
  - 展示所有报价项目
  - 从 PM 软件同步新项目
  - 搜索和筛选项目
  - 查看项目统计数据
- **交互**：
  - 点击项目进入详情
  - Tab 切换状态筛选（全部/草稿/进行中/已完成）
  - 同步按钮模拟从 PM 软件拉取数据

### 2. 新建项目 (NewProject)
- **路由**：`/new-project`
- **功能**：
  - 手动填写项目信息
  - 上传询价单，AI 自动解析
  - 识别客户名称、项目名称、年量等
  - 支持多产品信息录入
- **AI 功能**：
  - Excel/PDF 文件解析
  - 智能识别置信度显示
  - 未识别字段提示手动补充

### 3. 项目创建成功 (ProjectCreationSuccess)
- **路由**：`/project-success`
- **功能**：
  - 确认项目信息
  - 查看产品清单
  - 查看团队成员
  - AI 推荐相似项目
- **交互**：
  - 开始报价按钮进入 BOM 管理
  - 查看相似项目 Drawer

### 4. BOM 管理 (BOMManagement)
- **路由**：`/bom`
- **功能**：
  - 多产品 Tab 切换
  - 上传 BOM 表格，AI 识别
  - 手动添加/编辑/删除物料
  - 数据验证（重复检测、缺失检测）
  - 导出 BOM 表
- **Tab 结构**：
  - 每个产品一个 Tab
  - 独立的 BOM 表格
  - 独立的操作区域
- **继续下一步**：进入成本核算

### 5. 成本核算 (CostCalculation)
- **路由**：`/cost-calc`
- **功能**：
  - 产品 Tab 与 BOM 同步
  - 四个成本清单独立展示
  - 基于 BOM 智能计算成本
  - 成本汇总统计
- **成本清单**：
  - 物料成本（Material）
  - 工艺成本（Process）
  - 投资成本（Investment）
  - 其他成本（Other）
- **数据联动**：
  - BOM 数据自动生成物料成本
  - 切换产品 Tab，四个成本清单同步切换

### 6. 工艺评估 (ProcessAssessment) - 施工中
- **状态**：开发中
- **计划功能**：
  - 定义工艺路线
  - 工时评估
  - 工艺成本计算

### 7. QS 报价摘要 (QuoteSummary) - 施工中
- **状态**：开发中
- **计划功能**：
  - 每个产品设定分摊年份（4-5年）
  - 分摊投资成本
  - 计算 ROI

### 8. Payback 投资回收 (InvestmentRecovery) - 施工中
- **状态**：���发中
- **计划功能**：
  - 投资回收期分析
  - 现金流预测
  - ROI 可视化

### 9. 报价输出 (QuotationOutput) - 施工中
- **状态**：开发中
- **计划功能**：
  - 生成 VOSS 标准报价单
  - 导出 Excel/PDF
  - 邮件发送

---

## 核心组件说明

### WorkflowGuide (流程导航)
- **位置**：所有主流程页面顶部
- **功能**：
  - 显示 7 步流程
  - 高亮当前步骤
  - 已完成步骤标记
  - 点击跳转到任意步骤

### AppSidebar (侧边栏)
- **功能**：
  - 主导航菜单
  - 流程步骤展示
  - 当前步骤高亮
  - 支持折叠/展开

### UnderConstruction (施工中页面)
- **用途**：标记未完成的功能模块
- **参数**：
  - `title`：页面标题
  - `description`：页面描述
  - `backView`：返回的视图
  - `backLabel`：返回按钮文本

---

## 设计规范

### 配色方案
- **主色调**：黑白灰
- **强调色**：
  - 蓝色：`blue-600`（主要操作）
  - 绿色：`green-600`（成功、完成）
  - 紫色：`purple-600`（AI 功能）
  - 橙色：`orange-600`（警告）
  - 红色：`red-600`（错误）

### 组件尺寸规范

#### 页面容器
```tsx
// 列表/数据展示页
<div className="p-8">
  <div className="max-w-7xl mx-auto space-y-6">

// 表单/详情页
<div className="p-8">
  <div className="max-w-4xl mx-auto">
```

#### 标题系统
- 主标题：`text-2xl mb-1`
- 副标题：`text-sm text-zinc-500`
- 卡片标题：`CardTitle`（默认）

#### 间距
- 卡片容器：`space-y-6`
- CardContent：`p-4`（紧凑）或 `p-6`（宽松）
- 表单字段：`space-y-4`

#### 按钮
- 主要操作：默认或 `size="lg"`
- 次要操作：`size="sm"`
- 按钮图标：`h-4 w-4`

#### 图标
- 标题图标：`h-5 w-5`
- 按钮图标：`h-4 w-4`
- Badge 图标：`h-3 w-3`

#### 表格
- 编号字段：`font-mono text-xs`
- 普通内容：`text-sm`
- 次要信息：`text-xs text-zinc-500`

#### Badge
- 默认尺寸
- 带图标：`gap-1`，图标 `h-3 w-3`
- 变体：
  - `outline`：默认边框
  - `secondary`：已完成
  - `destructive`：错误/必填

### AI 功能标识
- **紫色卡片**：`border-purple-200 bg-purple-50`
- **Sparkles 图标**：标识 AI 功能
- **置信度显示**：AI 识别准确度

---

## 状态管理

### 全局状态 (App.tsx)
```typescript
- currentView: View           // 当前视图
- projects: ProjectData[]     // 所有项目
- currentProject: ProjectData // 当前选中项目
```

### 视图路由
```typescript
type View = 
  | 'dashboard'           // 项目总览
  | 'new-project'         // 新建项目
  | 'project-success'     // 项目创建成功
  | 'bom'                 // BOM 管理
  | 'process'             // 工艺评估
  | 'cost-calc'           // 成本核算
  | 'quotation'           // QS 报价摘要
  | 'investment'          // 投资回收
  | 'output';             // 报价输出
```

---

## 使用指南

### 1. 创建新项目
1. 点击「新建项目」或从 PM 软件同步
2. 选择「手动创建」或「导入报价单」
3. 填写必填信息（客户名称、项目名称、年量、描述）
4. 如有多个产品，AI 会自动识别产品清单
5. 点击「创建项目」

### 2. 管理 BOM
1. 项目创建后进入 BOM 管理
2. 切换产品 Tab 选择要编辑的产品
3. 上传 BOM 表格，AI 自动识别物料
4. 或手动添加物料行项
5. 点击「继续下一步」进入成本核算

### 3. 成本核算
1. 系统基于 BOM 数据自动生成物料成本
2. 切换产品 Tab 查看不同产品的成本
3. 四个成本清单（物料、工艺、投资、其他）独立展示
4. 查看成本汇总统计
5. 继续下一步进入报价摘要

### 4. 完成报价
1. 在 QS 报价摘要设定分摊年份
2. 查看投资分摊和 ROI
3. 进行 Payback 分析
4. 生成并导出报价文档

---

## 开发计划

### ✅ 已完成
- [x] 项目架构搭建
- [x] 基础组件库集成
- [x] 项目总览功能
- [x] 新建项目功能（含 AI 解析）
- [x] BOM 管理完整功能
- [x] 成本核算页面
- [x] 流程导航组件
- [x] 设计规范统一

### 🚧 进行中
- [ ] 工艺评估页面
- [ ] QS 报价摘要页面
- [ ] Payback 投资回收分析
- [ ] 报价输出功能

### 📋 待开发
- [ ] 真实 AI API 集成
- [ ] 数据持久化（数据库）
- [ ] 用户权限管理
- [ ] 报价模板定制
- [ ] 导出 Excel/PDF
- [ ] 邮件发送集成

---

## 注意事项

### AI 功能
- 当前 AI 功能为模拟演示
- 生产环境需集成真实 AI API
- 建议使用 OpenAI、Claude 或自建模型

### 数据持久化
- 当前数据存储在内存中
- 刷新页面数据会丢失
- 生产环境需集成数据库（Supabase、PostgreSQL）

### 多产品架构
- 项目可包含多个产品
- 每个产品独立管理 BOM、工艺、成本
- 成本核算按产品维度分别计算
- 最终报价按项目维度汇总

### 成本分摊
- QS 报价摘要环节针对每个产品设定分摊年份
- 典型分摊周期：4-5年
- 投资成本按年分摊
- ROI 基于分摊后的年度成本计算

---

## 技术支持

如有问题或建议，请联系开发团队。

---

## 更新日志

### v0.1.0 (2026-02-03)
- 🎉 项目初始化
- ✨ 完成项目总览、新建项目、BOM 管理、成本核算功能
- 🎨 统一设计规范和组件尺寸
- 📝 完善项目文档

---

**DR.aiVOSS 智能报价助手** - 让报价更智能，让制造更高效
