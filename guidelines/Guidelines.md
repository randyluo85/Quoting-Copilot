# Dr.aiVOSS Design Guidelines

| 版本号 | 创建时间 | 更新时间 | 文档主题 | 创建人 |
|--------|----------|----------|----------|--------|
| v1.0   | 2026-03-07 | 2026-03-07 | Dr.aiVOSS Figma Make 设计指南入口 | Randy Luo |

---

## Overview

**Dr.aiVOSS 智能快速报价助手 (Quoting-Copilot)** 是一个面向制造业的 B 端成本核算与报价系统。本指南使用 Figma Make 创建高保真原型。

### 核心设计原则

1. **极简至上** - B 端界面保持简洁，避免装饰元素
2. **数据优先** - 突出数据展示，减少视觉干扰
3. **红绿灯系统** - 状态标识必须使用 🟢🟡🔴 颜色编码
4. **一致性** - 所有页面遵循相同的布局模式

### 技术栈

- **Frontend:** Vite 6 + React 18 + TypeScript, TailwindCSS, **ShadcnUI**
- **图标库:** Lucide Icons (Shadcn UI 默认)

---

## Quick Start: Creating a Page

Follow these steps when creating a new page in Figma Make:

### Step 1: Base Layout

Every page MUST include:
1. **Left Sidebar** - 240px fixed width, 5 main navigation items
2. **Top Bar** - Search input + User profile + Notifications
3. **Main Content Area** - Page title + content

### Step 2: Navigation Items

Use these exact 5 items in sidebar:
1. 🏠 Dashboard (项目看板)
2. 📋 Projects (项目管理)
3. 📦 BOM Management (BOM 管理)
4. 💰 Cost Calculation (成本计算)
5. 📄 Quotation (报价汇总)

### Step 3: Apply Design Tokens

- **Primary Color:** `#3b82f6` (blue)
- **Font:** Inter, 16px base size
- **Border Radius:** 6px (cards), 8px (modals)
- **Card Shadow:** `0 4px 6px -1px rgb(0 0 0 / 0.1)`

### Step 4: Use Components

Always use predefined components from `components/` folder:
- Buttons → See `components/button.md`
- Inputs → See `components/input.md`
- Tables → See `components/table.md`
- Cards → See `components/card.md`
- Modals → See `components/modal.md`

---

## Design Tokens Reference

| Token | Value | Usage |
|-------|-------|-------|
| `--primary` | `#3b82f6` | Main actions, links |
| `--success` | `#10b981` | Verified status, positive indicators |
| `--warning` | `#f59e0b` | Warning status, needs review |
| `--destructive` | `#ef4444` | Missing status, errors, delete |
| `--background` | `#ffffff` | Page background |
| `--surface` | `#f8fafc` | Card backgrounds |
| `--border` | `#e2e8f0` | Borders, dividers |

See full design token documentation:
- `design-tokens/colors.md`
- `design-tokens/typography.md`
- `design-tokens/spacing.md`

---

## Component Library

Available components with usage guidelines:

| Component | File | When to Use |
|-----------|------|-------------|
| Button | `components/button.md` | Primary/secondary actions |
| Input | `components/input.md` | Text, number, select inputs |
| Table | `components/table.md` | Data lists, BOM items |
| Card | `components/card.md` | Project cards, summary boxes |
| Modal | `components/modal.md` | Forms, confirmations |
| Badge | `components/badge.md` | Status indicators |
| Tabs | `components/tabs.md` | Page-level navigation |

---

## Page Templates

### Dashboard (项目看板)

```
Layout: Grid of project cards (4 cols desktop, 3 tablet, 1 mobile)
Filter Bar: Status dropdown + Customer dropdown + Date range + "New Project" button
Card Content: Project ID, Name, Customer, Volume, Status Badge, Update Time
```

### BOM Management (BOM 管理)

```
Layout: Project info bar + 7 tabs + Product selector + Cost summary + Material table
Tabs: 物料清单 | 工艺路线 | 投资 | 采购 | 成本 | 报价 | 导出
Table Columns: 行号 | 物料号 | 物料名称 | 数量 | 单位 | 单价 | 小计 | 状态 | 操作
```

### Quotation Summary (报价汇总)

```
Layout: Split view (Left: Business params | Right: QS results)
Left Panel: Quote price, Exchange rate, Annual reduction, Amortization strategy
Right Panel: Quote summary table + Business Case cards + Action buttons
```

---

## Traffic Light System (红绿灯系统)

DO use these exact colors for status indicators:

| Status | Color | Icon | Meaning |
|--------|-------|------|---------|
| 🟢 Verified | `#10b981` | ✓ | Data confirmed, auto-approved |
| 🟡 Warning | `#f59e0b` | △ | AI match >85%, needs review |
| 🔴 Missing | `#ef4444` | ⚠ | No data, manual intervention required |

DO NOT use other colors for status indicators.
DO NOT mix traffic light colors with decorative colors.

---

## Data Formatting Rules

| Type | Format | Example |
|------|--------|---------|
| Currency (CNY) | ¥ + thousands separator | ¥1,234.56 |
| Currency (EUR) | € + thousands separator | €21.76 |
| Volume | Thousands separator | 120,000 |
| Percentage | 1-2 decimals + % | 15.5% |
| Profit (positive) | Green text | <span class="text-green-600">+5.2%</span> |
| Profit (negative) | Red text | <span class="text-red-600">-3.8%</span> |

---

## Common Patterns

### Pattern 1: Project Card

```
Size: 280px × 200px
Content: ID (top left), Status badge (top right), Name, Customer, Volume, Update time
Hover: Shadow + slight lift (translate-y: -1px)
```

### Pattern 2: Data Table with Status

```
Header: Gray background (#f1f5f9), sortable
Rows: White background, border bottom, hover #f8fafc
Status Badge: Top-right corner, pill shape
Actions: Edit + Delete buttons in last column
```

### Pattern 3: Cost Summary

```
Layout: 4 columns (Material | Process | Investment | R&D)
Each: Amount + percentage below
Total row: HK III highlighted
```

---

## Icon Usage

Use **Lucide Icons** for consistency:

| Function | Icon | Name |
|----------|------|------|
| Dashboard | 🏠 | LayoutDashboard |
| Projects | 📋 | FolderOpen |
| BOM | 📦 | Package |
| Cost | 💰 | Calculator |
| Quotation | 📄 | FileText |
| Settings | ⚙️ | Settings |
| Edit | ✏️ | Edit |
| Delete | 🗑️ | Trash2 |
| Add | ➕ | Plus |
| Upload | ⬆️ | Upload |

DO NOT mix icon libraries within the same page.

---

## Responsive Breakpoints

```css
Mobile:  max-width: 768px   /* Single column, drawer sidebar */
Tablet:  769px - 1024px     /* 3 columns, collapsible sidebar */
Desktop: min-width: 1025px  /* 4 columns, fixed sidebar */
```

---

## Figma Make Prompt Template

```
Create a [PAGE NAME] page for Dr.aiVOSS quoting system:

Layout:
- Left sidebar (240px) with 5 nav items: Dashboard, Projects, BOM, Cost, Quotation
- Top bar with search and user profile
- Main content: [DESCRIBE CONTENT]

Design System:
- Primary: #3b82f6 (blue)
- Font: Inter, 16px base
- Border radius: 6px cards, 8px modals
- Shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1)

Content:
- [LIST CONTENT ELEMENTS]

Status Badges:
- Green (#10b981): Verified/Completed
- Yellow (#f59e0b): Warning/Pending
- Red (#ef4444): Missing/Error

Make it clean, professional, data-focused. No decorative illustrations.
```

---

## Related Documentation

- `PROJECT_CONTEXT.md` - Business logic reference
- `CLAUDE.md` - Technical specifications
- `产品需求文档.md` - Product requirements
- `术语表.md` - Domain terminology
