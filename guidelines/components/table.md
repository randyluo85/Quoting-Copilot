# Table Component

| 版本号 | 创建时间 | 更新时间 | 文档主题 | 创建人 |
|--------|----------|----------|----------|--------|
| v1.0   | 2026-03-07 | 2026-03-07 | 表格组件规范 | Randy Luo |

---

## Purpose

Tables display structured data in rows and columns. They are ideal for comparing, scanning, and analyzing data.

---

## When to Use

**DO use a table when:**
- Displaying material lists (BOM)
- Showing process routes
- Presenting cost breakdowns
- Comparing quotation data
- Users need to scan across data points

**DO NOT use a table when:**
- Showing single data items (use Card)
- Displaying hierarchical data (use Tree)
- Layout purposes (use Grid)
- Simple lists (use List)

---

## Table Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  Table Controls (Search, Filter, Actions)                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Column 1    │ Column 2    │ Column 3    │ Status │ Actions│ │
│  ├───────────────────────────────────────────────────────────┤ │
│  │ Data        │ Data        │ Data        │  🟢    │ [Edit] │ │
│  │ Data        │ Data        │ Data        │  🟡    │ [Edit] │ │
│  │ Data        │ Data        │ Data        │  🔴    │ [Edit] │ │
│  └───────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  Pagination: [< 1] [2] [3] ... [16] [>]  Total: 156 items      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Column Sizing

### Recommended Column Widths

| Column Type | Width | Example |
|-------------|-------|---------|
| Row number | 60px | 1, 2, 3... |
| Status badge | 80px | 🟢, 🟡, 🔴 |
| Checkbox | 40px | ☑ |
| Small code | 100px | PRJ-001 |
| Code | 120px | A356-T6 |
| Name | 200px | 铝合金材料 |
| Quantity | 100px | 3.5 kg |
| Price | 100px | ¥28.50 |
| Date | 120px | 2026-03-07 |
| Actions | 100px | [编辑] [删除] |
| Flexible | 1fr | Auto-stretch |

```html
<!-- Example table layout -->
<table class="w-full">
  <colgroup>
    <col style="width: 60px;">   <!-- Row number -->
    <col style="width: 120px;">  <!-- Material code -->
    <col style="width: 200px;">  <!-- Material name -->
    <col style="width: 100px;">  <!-- Quantity -->
    <col style="width: 80px;">   <!-- Unit -->
    <col style="width: 100px;">  <!-- Unit price -->
    <col style="width: 100px;">  <!-- Total -->
    <col style="width: 80px;">   <!-- Status -->
    <col style="width: 100px;">  <!-- Actions -->
  </colgroup>
  <!-- ... -->
</table>
```

---

## Table Header

### Styling

```css
/* Header background */
thead { background-color: #f1f5f9; }

/* Header text */
th {
  padding: 12px 16px;
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  color: #334155;
  border-bottom: 1px solid #e2e8f0;
}

/* Sortable header */
th.sortable {
  cursor: pointer;
  user-select: none;
}

th.sortable:hover {
  background-color: #e2e8f0;
}
```

```html
<thead>
  <tr>
    <th class="px-4 py-3 text-left text-sm font-semibold text-slate-700">
      行号
    </th>
    <th class="px-4 py-3 text-left text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-200">
      物料号 ↑
    </th>
    <th class="px-4 py-3 text-left text-sm font-semibold text-slate-700">
      物料名称
    </th>
    <th class="px-4 py-3 text-right text-sm font-semibold text-slate-700">
      单价
    </th>
    <th class="px-4 py-3 text-center text-sm font-semibold text-slate-700">
      状态
    </th>
    <th class="px-4 py-3 text-right text-sm font-semibold text-slate-700">
      操作
    </th>
  </tr>
</thead>
```

---

## Table Body

### Row Styling

```css
/* Default row */
tbody tr {
  background-color: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  transition: background-color 150ms;
}

/* Hover state */
tbody tr:hover {
  background-color: #f8fafc;
}

/* Status-based backgrounds */
tbody tr.status-verified { background-color: #ffffff; }
tbody tr.status-warning { background-color: #fefce8; }
tbody tr.status-missing { background-color: #fef2f2; }

/* Selected row */
tbody tr.selected {
  background-color: #eff6ff;
  box-shadow: inset 2px 0 0 #3b82f6;
}
```

```html
<tbody>
  <!-- Verified row (green) -->
  <tr class="bg-white hover:bg-slate-50">
    <td class="px-4 py-3 text-sm">1</td>
    <td class="px-4 py-3 text-sm font-mono">A356-T6</td>
    <td class="px-4 py-3 text-sm">铝合金</td>
    <td class="px-4 py-3 text-sm text-right">¥28.50</td>
    <td class="px-4 py-3 text-sm">
      <span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">🟢</span>
    </td>
    <td class="px-4 py-3 text-sm text-right">
      <button class="text-slate-600 hover:text-primary">编辑</button>
    </td>
  </tr>

  <!-- Warning row (yellow) -->
  <tr class="bg-yellow-50 hover:bg-yellow-100">
    <td class="px-4 py-3 text-sm">2</td>
    <td class="px-4 py-3 text-sm font-mono">UNKNOWN</td>
    <td class="px-4 py-3 text-sm">未知物料</td>
    <td class="px-4 py-3 text-sm text-right">—</td>
    <td class="px-4 py-3 text-sm">
      <span class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">🟡</span>
    </td>
    <td class="px-4 py-3 text-sm text-right">
      <button class="text-slate-600 hover:text-primary">编辑</button>
    </td>
  </tr>

  <!-- Missing row (red) -->
  <tr class="bg-red-50 hover:bg-red-100">
    <td class="px-4 py-3 text-sm">3</td>
    <td class="px-4 py-3 text-sm font-mono text-red-600">MISSING</td>
    <td class="px-4 py-3 text-sm text-red-600">数据缺失</td>
    <td class="px-4 py-3 text-sm text-right">—</td>
    <td class="px-4 py-3 text-sm">
      <span class="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">🔴</span>
    </td>
    <td class="px-4 py-3 text-sm text-right">
      <button class="text-red-600 hover:text-red-800">询价</button>
    </td>
  </tr>
</tbody>
```

---

## Cell Content

### Text Alignment

| Content Type | Alignment | Example |
|--------------|-----------|---------|
| Text (left) | `text-left` | Names, descriptions |
| Numbers | `text-right` | Prices, quantities |
| Status | `text-center` | Badges |
| Actions | `text-right` | Buttons |

```html
<!-- Left aligned text -->
<td class="px-4 py-3 text-sm text-left">铝合金</td>

<!-- Right aligned number -->
<td class="px-4 py-3 text-sm text-right tabular-nums">¥28.50</td>

<!-- Center aligned status -->
<td class="px-4 py-3 text-sm text-center">
  <span class="badge">🟢</span>
</td>
```

### Number Formatting

```html
<!-- Currency -->
<td class="px-4 py-3 text-sm text-right font-mono">¥1,234.56</td>

<!-- Quantity -->
<td class="px-4 py-3 text-sm text-right font-mono">120,000</td>

<!-- Percentage -->
<td class="px-4 py-3 text-sm text-right font-mono">15.5%</td>

<!-- Profit (positive) -->
<td class="px-4 py-3 text-sm text-right font-mono text-green-600">+5.2%</td>

<!-- Profit (negative) -->
<td class="px-4 py-3 text-sm text-right font-mono text-red-600">-3.8%</td>
```

---

## Status Badges in Tables

### Badge Positioning

Place status badges in the rightmost column before actions, or in a dedicated status column.

```html
<td class="px-4 py-3 text-sm text-center">
  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
    ✓ 已确认
  </span>
</td>
```

### Traffic Light Colors

| Status | Background | Text | Badge |
|--------|-----------|------|-------|
| 🟢 Verified | `#d1fae5` | `#065f46` | ✓ 已确认 |
| 🟡 Warning | `#fef3c7` | `#92400e` | △ 待确认 |
| 🔴 Missing | `#fee2e2` | `#991b1b` | ⚠ 缺失 |

```html
<!-- Verified -->
<span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">🟢 已确认</span>

<!-- Warning -->
<span class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">🟡 待确认</span>

<!-- Missing -->
<span class="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">🔴 缺失</span>
```

---

## Action Buttons

### Inline Actions

```html
<td class="px-4 py-3 text-sm text-right">
  <div class="flex justify-end gap-2">
    <button class="text-slate-600 hover:text-primary hover:bg-slate-100 px-2 py-1 rounded">
      编辑
    </button>
    <button class="text-slate-600 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded">
      删除
    </button>
  </div>
</td>
```

### Icon Actions (Compact)

```html
<td class="px-4 py-3 text-sm text-right">
  <div class="flex justify-end gap-1">
    <button class="p-1.5 hover:bg-slate-100 rounded" aria-label="编辑">
      <EditIcon class="w-4 h-4 text-slate-600" />
    </button>
    <button class="p-1.5 hover:bg-red-50 rounded" aria-label="删除">
      <TrashIcon class="w-4 h-4 text-red-600" />
    </button>
  </div>
</td>
```

---

## Empty State

```html
<tbody>
  <tr>
    <td colspan="9" class="px-4 py-12 text-center">
      <div class="flex flex-col items-center justify-center">
        <span class="text-4xl mb-4">📭</span>
        <p class="text-slate-600 font-medium">暂无物料数据</p>
        <p class="text-slate-400 text-sm mt-1">请上传 BOM 文件或手动添加物料</p>
        <div class="mt-4 flex gap-2">
          <button class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
            导入Excel
          </button>
          <button class="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-md">
            添加物料
          </button>
        </div>
      </div>
    </td>
  </tr>
</tbody>
```

---

## Loading State

```html
<tbody>
  <tr>
    <td colspan="9" class="px-4 py-12 text-center">
      <div class="flex flex-col items-center justify-center">
        <LoadingIcon class="w-8 h-8 text-primary animate-spin mb-4" />
        <p class="text-slate-600">正在加载数据...</p>
      </div>
    </td>
  </tr>
</tbody>
```

---

## Sorting

### Sortable Headers

```html
<th class="px-4 py-3 text-left text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-200">
  <button class="flex items-center gap-1">
    物料号
    <SortIcon class="w-4 h-4 text-slate-400" />
  </button>
</th>
```

### Sort Indicators

| State | Icon | Description |
|-------|------|-------------|
| Unsorted | ⇅ | Column is sortable |
| Ascending | ↑ | A to Z, 0 to 9 |
| Descending | ↓ | Z to A, 9 to 0 |

---

## Pagination

```html
<div class="flex items-center justify-between px-4 py-3 border-t">
  <div class="text-sm text-slate-600">
    显示 <span class="font-medium">1</span> 到 <span class="font-medium">10</span>
    共 <span class="font-medium">156</span> 条
  </div>
  <div class="flex gap-1">
    <button class="px-3 py-1 text-sm border rounded hover:bg-slate-50 disabled:opacity-50">
      &lt; 上一页
    </button>
    <button class="px-3 py-1 text-sm bg-primary text-white rounded">1</button>
    <button class="px-3 py-1 text-sm border rounded hover:bg-slate-50">2</button>
    <button class="px-3 py-1 text-sm border rounded hover:bg-slate-50">3</button>
    <span class="px-2 py-1">...</span>
    <button class="px-3 py-1 text-sm border rounded hover:bg-slate-50">16</button>
    <button class="px-3 py-1 text-sm border rounded hover:bg-slate-50">
      下一页 &gt;
    </button>
  </div>
</div>
```

---

## Responsive Tables

### Mobile (< 768px)

On mobile, tables have two options:

**Option 1: Card View**
```html
<!-- Each row becomes a card -->
<div class="md:hidden">
  <div class="border rounded-lg p-4 mb-3">
    <div class="flex justify-between mb-2">
      <span class="font-medium">A356-T6</span>
      <span class="badge green">🟢</span>
    </div>
    <div class="text-sm text-slate-600">
      <div>名称: 铝合金</div>
      <div>数量: 3.5 kg</div>
      <div>单价: ¥28.50</div>
    </div>
    <div class="mt-3 flex gap-2">
      <button>编辑</button>
      <button>删除</button>
    </div>
  </div>
</div>
```

**Option 2: Horizontal Scroll**
```html
<div class="overflow-x-auto">
  <table class="min-w-full">
    <!-- Normal table structure -->
  </table>
</div>
```

---

## Accessibility

Tables MUST:

1. Have proper `<thead>`, `<tbody>`, `<tfoot>` structure
2. Include `<caption>` or aria-label for context
3. Use `<th scope="col">` for column headers
4. Use `<th scope="row">` for row headers
5. Support keyboard navigation

```html
<table role="table" aria-label="物料清单">
  <caption class="sr-only">项目物料清单，共156条记录</caption>
  <thead>
    <tr>
      <th scope="col">行号</th>
      <th scope="col">物料号</th>
      <!-- ... -->
    </tr>
  </thead>
  <tbody>
    <!-- ... -->
  </tbody>
</table>
```

---

## Quick Reference

```
┌─────────────────────────────────────────────────────────┐
│  Table Quick Reference                                   │
├─────────────────────────────────────────────────────────┤
│  Header: #f1f5f9 bg, 600 weight, bottom border           │
│  Row: #ffffff bg, hover #f8fafc, bottom border           │
│                                                         │
│  Cell padding: 12px 16px (px-4 py-3)                    │
│  Text size: 14px (text-sm)                              │
│                                                         │
│  Status rows:                                            │
│    🟢 Verified: #ffffff bg                               │
│    🟡 Warning:   #fefce8 bg                              │
│    🔴 Missing:   #fef2f2 bg                              │
│                                                         │
│  Numbers: right align, tabular-nums                     │
│  Status: center align, pill badge                        │
│  Actions: right align, gap-2                            │
│                                                         │
│  Empty: centered, 48px padding, icon + message           │
│  Loading: centered, spinner + "加载中..."               │
└─────────────────────────────────────────────────────────┘
```
