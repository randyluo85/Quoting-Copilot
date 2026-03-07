# Dr.aiVOSS Figma Make 设计指南

| 版本号 | 创建时间 | 更新时间 | 文档主题 | 创建人 |
|--------|----------|----------|----------|--------|
| v1.0   | 2026-03-08 | 2026-03-08 | Figma Make 原型设计指南 | Randy Luo |

---

## 📋 目录

1. [设计系统基础](#1-设计系统基础)
2. [颜色设计令牌](#2-颜色设计令牌)
3. [字体与排版](#3-字体与排版)
4. [间距与布局](#4-间距与布局)
5. [组件规范](#5-组件规范)
6. [业务场景模式](#6-业务场景模式)
7. [响应式设计](#7-响应式设计)
8. [无障碍标准](#8-无障碍标准)

---

## 1. 设计系统基础

### 1.1 设计原则

- **信息密度优先**：B端企业工具，最大化数据可见性，使用紧凑表格和紧密间距
- **清晰层级**：使用字体和卡片容器明确区分阶段（物料成本 vs 工艺成本）
- **语义化反馈**：使用标准化颜色（绿/黄/红）传达状态、警告和必需操作

### 1.2 技术栈

| 层级 | 技术 |
|------|------|
| Frontend | Vite 6 + React 18 + TypeScript |
| UI Framework | **ShadcnUI** (基于 Radix UI) |
| Styling | **TailwindCSS** |

### 1.3 图标规范

- **图标库**：Lucide Icons (Shadcn UI 默认)
- **尺寸**：16px (w-4 h-4) 默认，20px (w-5 h-5) 标题
- **禁止**：不使用 emoji 作为 UI 图标

---

## 2. 颜色设计令牌

### 2.1 主色调

| 用途 | Tailwind Class | Hex |
|------|---------------|-----|
| 主按钮 | `bg-slate-900 text-white` | #0f172a |
| 次按钮 | `bg-slate-100 text-slate-900` | #f1f5f9 |
| 悬停态 | `hover:bg-slate-800` | #1e293b |

### 2.2 红绿灯状态系统（核心）

#### 🟢 Green (已匹配/正常)

| 元素 | Class |
|------|-------|
| 文本 | `text-emerald-700` |
| 背景 | `bg-emerald-50` |
| 边框 | `border-emerald-200` |
| 状态点 | `bg-emerald-500` |

**用途**：物料库完全匹配、DB4 >= 0%、已通过验证

#### 🟡 Amber (需确认/AI匹配)

| 元素 | Class |
|------|-------|
| 文本 | `text-amber-700` |
| 背景 | `bg-amber-50` |
| 边框 | `border-amber-200` |
| 状态点 | `bg-amber-500` |

**用途**：AI 匹配 >85%、DB4 < 0% 但 >= -5%、需人工复核

#### 🔴 Red (缺失/高风险)

| 元素 | Class |
|------|-------|
| 文本 | `text-red-700` |
| 背景 | `bg-red-50` |
| 边框 | `border-red-200` |
| 状态点 | `bg-red-500` |

**用途**：库中无数据、DB4 < -5%、需询价、错误状态

### 2.3 中性色

| 用途 | Class | Hex |
|------|-------|-----|
| 应用背景 | `bg-slate-50` | #f8fafc |
| 卡片背景 | `bg-white` | #ffffff |
| 边框 | `border-slate-200` | #e2e8f0 |
| 标题 | `text-slate-900` | #0f172a |
| 正文 | `text-slate-600` | #475569 |
| 辅助 | `text-slate-500` | #64748b |

---

## 3. 字体与排版

### 3.1 字体家族

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

### 3.2 字体尺寸

| 级别 | Tailwind | px | 用途 |
|------|---------|----|----|
| xs | `text-xs` | 12 | 元数据、标签 |
| sm | `text-sm` | 14 | 正文、表格 |
| base | `text-base` | 16 | 默认 |
| lg | `text-lg` | 18 | 卡片标题 |
| xl | `text-xl` | 20 | 页面副标题 |
| 2xl | `text-2xl` | 24 | 页面标题 |

### 3.3 字重

| 用途 | Class |
|------|-------|
| 正文 | `font-normal` (400) |
| 标签、按钮 | `font-medium` (500) |
| 标题 | `font-semibold` (600) |
| 强调 | `font-bold` (700) |

### 3.4 数字字体

**财务数据、百分比、工时必须使用等宽数字**：
```
font-mono tabular-nums
```

示例：`¥1,234.56`、`+5.2%`、`120,000`

---

## 4. 间距与布局

### 4.1 间距系统（4px 基准）

| Token | px | rem | 用途 |
|-------|----|----|----|
| 1 | 4 | 0.25 | 图标+文字 |
| 2 | 8 | 0.5 | 按钮组 |
| 3 | 12 | 0.75 | 紧凑 |
| 4 | 16 | 1 | 默认 |
| 6 | 24 | 1.5 | 卡片间距 |
| 8 | 32 | 2 | 容器内边距 |

### 4.2 组件内边距

| 组件 | Padding |
|------|---------|
| 按钮 | `px-4 py-2` |
| 输入框 | `px-3 py-2` |
| 卡片 | `p-4` |
| 模态框 | `p-6` |
| 表格单元格 | `p-2` |

### 4.3 网格断点

```css
/* Mobile: 1列 */
.grid { grid-template-columns: 1fr; }

/* Tablet: 2列 */
@media (min-width: 768px) { .grid { grid-template-columns: 2fr; } }

/* Desktop: 4列 */
@media (min-width: 1024px) { .grid-template-columns: 4fr; }
```

Tailwind 类：`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4`

---

## 5. 组件规范

### 5.1 按钮

#### 主按钮
```
Background: bg-slate-900
Text: text-white
Padding: px-4 py-2
Radius: rounded-md
Hover: hover:bg-slate-800
Transition: transition-colors duration-200
```

**Figma Make Prompt**：
```
Primary Button:
- Background: Slate-900 (#0f172a)
- Text: White
- Hover: Slate-800 (#1e293b)
- Padding: 16px 12px (px-4 py-2)
- Radius: 6px (rounded-md)
```

#### 次按钮
```
Background: bg-slate-100
Text: text-slate-900
Hover: hover:bg-slate-200
```

#### 危险按钮
```
Background: bg-red-600
Text: text-white
Hover: hover:bg-red-700
```

#### 图标按钮
```
Variant: ghost
Size: icon (h-8 w-8)
必须包含: aria-label="操作名称"
Icon: w-4 h-4
```

### 5.2 输入框

#### 标准输入框
```
Padding: px-3 py-2
Border: border border-slate-300
Radius: rounded-md
Focus: focus:ring-2 focus:ring-slate-400
```

#### 货币输入框
```
前缀符号: ¥ / € / $
数字对齐: tabular-nums
```

#### 错误状态
```
Border: border-red-500
Ring: focus:ring-red-500
提示文字: text-sm text-red-600
```

**Figma Make Prompt**：
```
Input Field:
- Padding: 12px (px-3 py-2)
- Border: #e2e8f0, 1px
- Radius: 6px
- Focus: Slate-400 ring, 2px
- Error: Red-500 border + ring
```

### 5.3 表格

#### 表头
```
Background: bg-slate-50
Text: text-xs font-semibold text-slate-500
Padding: p-2 (紧凑)
```

#### 表格行
```
Background: bg-white
Hover: hover:bg-slate-50/50
Padding: p-2
```

#### 状态行样式
```
🟢 已匹配: bg-emerald-50 hover:bg-emerald-50/80
🟡 需确认: bg-amber-50 hover:bg-amber-50/80
🔴 缺失: bg-red-50 hover:bg-red-50/80
```

#### 列对齐
```
文字: left (默认)
数字: text-right font-mono
状态: text-center
操作: text-right
```

**Figma Make Prompt**：
```
Data Table:
- Header: Slate-50 (#f8fafc) bg, 12px semibold slate-500 text
- Row: White bg, Slate-50/50 hover, 8px padding (p-2)
- Status Row: Emerald-50/Amber-50/Red-50 bg based on status
- Status Dot: 8px (w-2 h-2), rounded-full, Emerald-500/Amber-500/Red-500
- Numbers: Right align, tabular-nums, comma separators
```

### 5.4 标签

#### 状态标签
```
Padding: px-2 py-1
Radius: rounded-full
Font: text-xs

🟢 已匹配: bg-emerald-50 border-emerald-200 text-emerald-700
🟡 需确认: bg-amber-50 border-amber-200 text-amber-700
🔴 需询价: bg-red-50 border-red-200 text-red-700
```

#### 点样式（紧凑）
```
尺寸: w-2 h-2
形状: rounded-full
```

### 5.5 卡片

#### 标准卡片
```
Background: bg-white
Border: border border-slate-200
Radius: rounded-lg
Shadow: shadow-md
Padding: p-4
```

#### 项目卡片
```
尺寸: 280px × 200px (最小)
悬停: hover:shadow-lg cursor-pointer
过渡: transition-shadow duration-200
```

#### 成本汇总卡片
```
标题区: flex items-center justify-between mb-4
大数字: text-3xl font-bold tabular-nums
进度条: w-full bg-slate-100 h-2 rounded-full
```

### 5.6 标签页

#### BOM管理标签（7项）
```
样式: border-b-2
内边距: py-3 px-1
间距: gap-6
字体: text-sm font-medium

激活: border-primary text-primary
非激活: border-transparent text-slate-500 hover:text-slate-700
```

**标签列表**：
1. 物料清单
2. 工艺路线
3. 投资项
4. 采购询价
5. 成本计算
6. 报价汇总
7. 导出

### 5.7 模态框

#### 结构
```
遮罩: fixed inset-0 bg-black/50
容器: relative bg-white rounded-lg shadow-xl
最大高度: max-h-[90vh]

页眉: px-6 py-4 border-b
主体: px-6 py-4 overflow-y-auto flex-1
页脚: px-6 py-4 border-t bg-slate-50
```

#### 尺寸
```
Small: max-w-sm (400px) - 确认对话框
Medium: max-w-md (512px) - 标准表单
Large: max-w-lg (768px) - 复杂表单
XLarge: max-w-4xl (1024px) - 报价预览
```

---

## 6. 业务场景模式

### 6.1 工时计算设定（4种类型）

#### 固定型
```
布局: flex items-center gap-2
输入框: 数字类型
单位文字: "秒/件" (text-sm text-slate-500)
```

#### 公式型
```
文本域: Textarea, font-mono, bg-slate-50
变量标签: Badge cursor-pointer hover:bg-slate-100
示例: Length, Weight
```

#### 分段型
```
布局: space-y-2
每行: Min输入 - 分隔符 - Max输入 - 单位选择 = 结果输入 + 单位文字
添加按钮: + 添加区间
```

#### 条件型
```
布局: grid grid-cols-2 gap-2
选择列: 材质下拉
数值列: 数字输入 + "秒/件"
添加按钮: + 添加条件
```

### 6.2 分摊策略选择器

```
布局: grid grid-cols-1 md:grid-cols-2 gap-6
左侧: 商业参数输入
右侧: 分摊策略

单选模式:
- 一次性支付: 模具费单独收取
- 分摊进单价: 模具费按年分摊

实时预览:
- 显示: "预计单件分摊额"
- 样式: mt-4 p-4 bg-slate-50 rounded-lg
- 数字: text-2xl font-bold
```

### 6.3 物料状态指示器

```
紧凑样式 (表格用):
<div className="w-2 h-2 rounded-full bg-emerald-500 mx-auto" />

带标签样式:
<div className="flex items-center gap-2">
  <div className="w-2 h-2 rounded-full bg-emerald-500" />
  <span className="text-xs text-emerald-700">已匹配</span>
</div>
```

### 6.4 财务汇总布局

```
顶部KPI卡片:
- 布局: grid grid-cols-4 gap-4
- 内容: 标签 + 大数字 + 状态徽章

成本构成列表:
- 布局: space-y-3
- 行: flex justify-between
- 分隔线: Separator
- 总计: font-bold

警告横幅 (DB4 < 0):
- Alert variant="destructive"
- 图标: AlertTriangle
- 背景: bg-red-50 border-red-200
```

### 6.5 年降配置器

```
布局: 单选组 RadioGroup
选项:
- 比例: 数字输入 (0-100%)
- 年限: 数字输入 (1-5年)
- 开始年份: 下拉选择 (第2年↓)
```

---

## 7. 响应式设计

### 7.1 断点

| 设备 | 宽度 | 列数 |
|------|----|----|
| Mobile | < 768px | 1 |
| Tablet | 768px - 1023px | 2 |
| Desktop | ≥ 1024px | 4 |

### 7.2 表格响应式

**Option 1: 水平滚动**
```
<div className="overflow-x-auto">
  <Table>...</Table>
</div>
```

**Option 2: 卡片视图**
```
桌面端: <div className="hidden md:table">
移动端: <div className="md:hidden">
```

### 7.3 侧边栏

```
桌面: 固定 240px
平板: 可折叠
移动端: 抽屉式 (从左侧滑出)
```

---

## 8. 无障碍标准

### 8.1 颜色对比

所有组合已通过 WCAG 2.1 AA (4.5:1)

| 组合 | 对比比 |
|------|--------|
| text-slate-900 on bg-white | 15.7:1 |
| text-slate-600 on bg-white | 7.1:1 |
| text-white on bg-slate-900 | 13.5:1 |
| text-emerald-700 on bg-emerald-50 | 6.8:1 |
| text-amber-700 on bg-amber-50 | 6.2:1 |
| text-red-700 on bg-red-50 | 5.9:1 |

### 8.2 交互元素

```
可点击: cursor-pointer
焦点环: focus:ring-2 focus:ring-slate-400 focus:ring-offset-2
```

### 8.3 图标按钮

**必须包含 aria-label**：
```
<Button aria-label="编辑项目">
  <Pencil className="h-4 w-4" />
</Button>
```

### 8.4 错误信息

**必须使用 role="alert"**：
```
<Alert role="alert" variant="destructive">
  <AlertDescription>错误信息</AlertDescription>
</Alert>
```

### 8.5 表单标签

**禁止仅用 placeholder**：
```
❌ <Input placeholder="项目名称" />
✅ <Label htmlFor="project-name">项目名称</Label>
✅ <Input id="project-name" />
```

### 8.6 颜色+图标

**禁止仅用颜色传达信息**：
```
❌ <span className="text-red-600">警告</span>
✅ <AlertTriangle className="h-4 w-4 text-amber-600" />
✅ <span className="text-amber-700">警告</span>
```

---

## 附录：页面级 Figma Make 提示词模板

### Dashboard 页面

```
Create a B2B dashboard page for Dr.aiVOSS quoting system:

Layout:
- Left sidebar (240px) with 5 menu items
- Top bar with search and user profile
- Main content with project cards grid

Design System:
- Primary: Slate-900 (#0f172a)
- Font: Inter, 16px base
- Radius: 6px
- Card shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1)

Content:
- Page title: "项目看板" (text-2xl font-bold)
- Filter bar with status dropdown, customer dropdown, date range
- Project grid: 4 columns on desktop
- Each card: 280px × 200px, shows project number, name, customer, volume (formatted), status badge, last update

Status Badges:
- In progress: bg-emerald-50 text-emerald-700
- Pending review: bg-amber-50 text-amber-700
- Waiting quotation: bg-red-50 text-red-700
- Completed: bg-slate-100 text-slate-700

Make it clean, professional, data-focused. No decorative illustrations.
```

### BOM 管理页面

```
Create a BOM management page for Dr.aiVOSS:

Layout:
- Top: Project info bar with customer, volume, edit button
- Below: 7 tabs (物料清单/工艺路线/投资项/采购询价/成本计算/报价汇总/导出)
- Content area: Cost summary cards + data table

Cost Summary:
- 4 cards in a row
- Each shows: title, amount (large number), percentage, progress bar

Data Table:
- Columns: 行号(60px), 物料号(120px), 物料名称(200px), 数量(100px), 单位(80px), 单价(100px), 小计(100px), 状态(80px), 操作(100px)
- Header: Slate-50 bg, 12px semibold slate-500 text, 8px padding
- Row: White bg, Slate-50/50 hover, 8px padding
- Status rows: Emerald-50/Amber-50/Red-50 bg based on status
- Status dot: 8px rounded-full, Emerald-500/Amber-500/Red-500
- Numbers: Right align, tabular-nums font, comma separators

Buttons at bottom: [重新计算] [VM确认→Sales] [保存草稿]
```

### 报价汇总页面

```
Create a quotation summary page for Dr.aiVOSS:

Layout:
- Two column layout (md:grid-cols-2)
- Left: Business parameters input form
- Right: QS calculation results

Business Parameters:
- Quote price: Number input with € prefix
- Exchange rate: Number input (€1 = ¥7.83)
- Annual reduction: Configuration box with rate (3%), years (3), start year (Year 2↓)
- Amortization strategy: Radio buttons (一次性支付 / 分摊进单价)

QS Results:
- Quote Summary table with columns: Year, Volume, VP, HK III, SK-2, DB4%
- Summary cards: Total net profit, Weighted avg margin, Breakeven year
- Action buttons: [重新计算] [预览报价单] [导出PDF]

Alert Styles:
- High Risk (DB4 < -5%): Red-50 bg, Red-800 text, warning icon
- Warning (DB4 < 0%): Amber-50 bg, Amber-800 text, warning icon
- Pass (DB4 >= 0%): Emerald-50 bg, Emerald-800 text, check icon
```

---

**文档结束**

> 本指南整合了所有设计令牌和组件规范，供 Figma Make 原型设计使用。
> 详细组件文档请参考：guidelines/components/ 和 guidelines/design-tokens/
