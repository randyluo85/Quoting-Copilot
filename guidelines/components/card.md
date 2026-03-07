# Card Component

| 版本号 | 创建时间 | 更新时间 | 文档主题 | 创建人 |
|--------|----------|----------|----------|--------|
| v1.0   | 2026-03-07 | 2026-03-07 | 卡片组件规范 | Randy Luo |

---

## Purpose

Cards group related content and actions into a single container. They are versatile components used throughout the application.

---

## When to Use

**DO use a card when:**
- Displaying project summaries
- Showing cost breakdown tiles
- Grouping form sections
- Presenting statistics
- Creating dashboard widgets

**DO NOT use a card when:**
- Simple lists (use List)
- Tabular data (use Table)
- Full-page content (use Sections)

---

## Card Structure

```
┌─────────────────────────────────────────────┐
│  Card Header (optional)                     │
│  Title + Subtitle + Actions                  │
├─────────────────────────────────────────────┤
│  Card Body                                  │
│  Main content area                          │
│  - Text, images, data                       │
│  - Nested components                        │
├─────────────────────────────────────────────┤
│  Card Footer (optional)                     │
│  Actions, metadata                          │
└─────────────────────────────────────────────┘
```

---

## Default Card

```html
<div class="bg-white rounded-lg shadow-md border border-slate-200 p-4">
  <div class="flex items-center justify-between mb-3">
    <h3 class="text-lg font-semibold text-slate-900">卡片标题</h3>
    <span class="text-sm text-slate-500">副标题</span>
  </div>
  <div class="text-slate-700 text-sm">
    卡片内容区域...
  </div>
  <div class="mt-4 flex justify-end gap-2">
    <button class="text-sm text-slate-600 hover:text-slate-900">取消</button>
    <button class="text-sm bg-primary text-white px-3 py-1.5 rounded-md hover:bg-primary/90">确认</button>
  </div>
</div>
```

**Styling:**
- Background: `#ffffff` (white)
- Border: `#e2e8f0` (slate-200)
- Radius: 8px (rounded-lg)
- Shadow: `0 4px 6px -1px rgb(0 0 0 / 0.1)`
- Padding: 16px (p-4)

---

## Project Card

### Dashboard Project Card

```html
<div class="bg-white rounded-lg shadow-md border border-slate-200 p-4 hover:shadow-lg transition-shadow cursor-pointer">
  <div class="flex items-start justify-between mb-3">
    <div>
      <p class="text-xs text-slate-500 font-mono">PRJ-2024-001</p>
      <h3 class="text-lg font-semibold text-slate-900 mt-1">制动管路总成报价</h3>
    </div>
    <span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
      🟢 进行中
    </span>
  </div>
  <div class="space-y-1 text-sm">
    <div class="flex justify-between">
      <span class="text-slate-500">客户</span>
      <span class="text-slate-900 font-medium">博世汽车部件（苏州）</span>
    </div>
    <div class="flex justify-between">
      <span class="text-slate-500">年量</span>
      <span class="text-slate-900 font-medium tabular-nums">120,000</span>
    </div>
  </div>
  <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
    <span class="text-xs text-slate-400">更新: 2小时前</span>
    <button class="text-sm text-primary hover:text-primary/80">查看详情 →</button>
  </div>
</div>
```

**Size:** 280px × 200px (minimum)

---

## Cost Summary Card

```html
<div class="bg-white rounded-lg shadow-md border border-slate-200 p-5">
  <div class="flex items-center justify-between mb-4">
    <h3 class="text-sm font-medium text-slate-700 uppercase tracking-wide">物料成本</h3>
    <span class="text-xs text-slate-500">60%</span>
  </div>
  <div class="space-y-2">
    <div class="flex items-baseline justify-between">
      <span class="text-3xl font-bold text-slate-900 tabular-nums">¥3.00</span>
      <span class="text-sm text-slate-500">每件</span>
    </div>
    <div class="w-full bg-slate-100 rounded-full h-2 mt-3">
      <div class="bg-blue-500 h-2 rounded-full" style="width: 60%"></div>
    </div>
  </div>
</div>
```

**Use for:** Cost breakdown sections (Material, Process, Investment, R&D)

---

## Stat Card

```html
<div class="bg-white rounded-lg shadow-md border border-slate-200 p-5">
  <div class="flex items-center gap-3 mb-2">
    <div class="p-2 bg-blue-50 rounded-lg">
      <FolderIcon class="w-5 h-5 text-primary" />
    </div>
    <span class="text-sm font-medium text-slate-600">总项目数</span>
  </div>
  <div class="flex items-baseline gap-2">
    <span class="text-3xl font-bold text-slate-900 tabular-nums">24</span>
    <span class="text-sm text-green-600">+3 本月</span>
  </div>
</div>
```

---

## Form Section Card

```html
<div class="bg-white rounded-lg border border-slate-200 overflow-hidden">
  <div class="px-5 py-4 bg-slate-50 border-b border-slate-200">
    <h3 class="text-base font-semibold text-slate-900">必填信息</h3>
    <p class="text-sm text-slate-500 mt-1">请填写以下信息以创建项目</p>
  </div>
  <div class="p-5 space-y-4">
    <!-- Form fields -->
  </div>
</div>
```

---

## Card Variants

### Bordered Card

```html
<div class="bg-white border border-slate-200 rounded-lg p-4">
  <!-- No shadow, just border -->
</div>
```

### Elevated Card

```html
<div class="bg-white rounded-lg shadow-lg border border-slate-200 p-4">
  <!-- Larger shadow for emphasis -->
</div>
```

### Flat Card

```html
<div class="bg-slate-50 rounded-lg p-4">
  <!-- No border, no shadow -->
</div>
```

### Interactive Card

```html
<div class="bg-white rounded-lg shadow-md border border-slate-200 p-4 cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all">
  <!-- Hover effects -->
</div>
```

---

## Card Header Patterns

### Title + Badge

```html
<div class="flex items-center justify-between mb-4">
  <h3 class="text-lg font-semibold text-slate-900">制动管路总成</h3>
  <span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">🟢 进行中</span>
</div>
```

### Title + Subtitle + Actions

```html
<div class="flex items-start justify-between mb-4">
  <div>
    <h3 class="text-lg font-semibold text-slate-900">制动管路总成</h3>
    <p class="text-sm text-slate-500 mt-1">PRJ-2024-001</p>
  </div>
  <button class="p-1.5 hover:bg-slate-100 rounded-md">
    <MoreIcon class="w-5 h-5 text-slate-400" />
  </button>
</div>
```

### Icon + Title

```html
<div class="flex items-center gap-3 mb-4">
  <div class="p-2 bg-blue-50 rounded-lg">
    <CalculatorIcon class="w-5 h-5 text-primary" />
  </div>
  <div>
    <h3 class="text-lg font-semibold text-slate-900">成本计算</h3>
    <p class="text-sm text-slate-500">自动计算项目成本</p>
  </div>
</div>
```

---

## Card Content Layouts

### Vertical Stack

```html
<div class="space-y-3">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

### Two Columns

```html
<div class="grid grid-cols-2 gap-4">
  <div>Left</div>
  <div>Right</div>
</div>
```

### Left Icon + Content

```html
<div class="flex gap-3">
  <div class="flex-shrink-0">
    <Icon class="w-5 h-5 text-slate-400" />
  </div>
  <div class="flex-1">
    <h4 class="font-medium">Title</h4>
    <p class="text-sm text-slate-500">Description</p>
  </div>
</div>
```

---

## Card Footer Patterns

### Action Buttons (Right)

```html
<div class="mt-4 flex justify-end gap-2">
  <button class="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-md">取消</button>
  <button class="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary/90">确认</button>
</div>
```

### Action Buttons (Centered)

```html
<div class="mt-4 flex justify-center gap-2">
  <button class="px-4 py-2 text-sm bg-primary text-white rounded-md">查看详情</button>
</div>
```

### Metadata

```html
<div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
  <span>更新于 2026-03-07 14:30</span>
  <span>版本 v1.0</span>
</div>
```

---

## Empty Card State

```html
<div class="bg-white rounded-lg shadow-md border border-slate-200 p-8 text-center">
  <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
    <FolderIcon class="w-6 h-6 text-slate-400" />
  </div>
  <h3 class="text-base font-medium text-slate-900">暂无项目</h3>
  <p class="text-sm text-slate-500 mt-1">点击下方按钮创建新项目</p>
  <button class="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
    + 创建项目
  </button>
</div>
```

---

## Card Grid Layout

```html
<!-- Desktop: 4 columns -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <div class="card">Card 1</div>
  <div class="card">Card 2</div>
  <div class="card">Card 3</div>
  <div class="card">Card 4</div>
</div>
```

**Responsive breakpoints:**
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 4 columns

---

## Hover Effects

### Subtle Lift

```css
.card {
  transition: transform 150ms, box-shadow 150ms;
}

.card:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}
```

### Border Highlight

```css
.card:hover {
  border-color: #3b82f6;
}
```

---

## Quick Reference

```
┌─────────────────────────────────────────────────────────┐
│  Card Quick Reference                                   │
├─────────────────────────────────────────────────────────┤
│  Background: #ffffff                                    │
│  Border: #e2e8f0, 1px, rounded-lg                       │
│  Shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1)               │
│  Padding: 16px (p-4)                                    │
│                                                         │
│  Header: mb-4, title + badge/actions                   │
│  Body: Default content area                            │
│  Footer: mt-4, pt-3, border-top                        │
│                                                         │
│  Hover: lift (-1px) + shadow-lg                        │
│  Selected: blue ring inset                             │
│                                                         │
│  Project Card: 280px × 200px                           │
│  Cost Card: Amount + percentage bar                    │
│  Stat Card: Icon + big number + trend                  │
│  Form Card: Header + body + footer                     │
└─────────────────────────────────────────────────────────┘
```
