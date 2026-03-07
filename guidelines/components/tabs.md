# Tabs Component

| 版本号 | 创建时间 | 更新时间 | 文档主题 | 创建人 |
|--------|----------|----------|----------|--------|
| v1.0   | 2026-03-07 | 2026-03-07 | 标签页组件规范 | Randy Luo |

---

## Purpose

Tabs organize related content into separate panels. Users can switch between panels without leaving the page.

---

## When to Use

**DO use tabs when:**
- Organizing related content sections (BOM Management: 物料/工艺/投资/采购/成本/报价/导出)
- Switching between views of same data
- Reducing page complexity

**DO NOT use tabs when:**
- Content is independent (use separate pages)
- Only one tab (remove tabs)
- Navigation between different pages (use Sidebar)

---

## Tab Structure

```
┌─────────────────────────────────────────────────────────┐
│  [Tab 1] [Tab 2] [Tab 3]          Active Tab Line ─────│
├─────────────────────────────────────────────────────────┤
│  Tab Panel Content                                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Default Tabs

### Underline Style (Recommended)

```html
<div class="border-b border-slate-200">
  <nav class="flex gap-6" aria-label="Tabs">
    <button class="py-3 px-1 border-b-2 border-primary text-primary font-medium text-sm">
      物料清单
    </button>
    <button class="py-3 px-1 border-b-2 border-transparent text-slate-500 hover:text-slate-700 font-medium text-sm">
      工艺路线
    </button>
    <button class="py-3 px-1 border-b-2 border-transparent text-slate-500 hover:text-slate-700 font-medium text-sm">
      投资项
    </button>
    <button class="py-3 px-1 border-b-2 border-transparent text-slate-500 hover:text-slate-700 font-medium text-sm">
      采购询价
    </button>
  </nav>
</div>

<!-- Tab Panel -->
<div class="py-4">
  <!-- Tab content -->
</div>
```

**Styling:**
- Padding: 12px vertical (py-3)
- Border bottom: 2px
- Active: `border-primary`, `text-primary`
- Inactive: `border-transparent`, `text-slate-500`

---

## BOM Management Tabs (7 Items)

```html
<div class="border-b border-slate-200 overflow-x-auto">
  <nav class="flex gap-6 min-w-max" aria-label="BOM Management Tabs">
    <button class="flex items-center gap-2 py-3 px-1 border-b-2 border-primary text-primary font-medium text-sm whitespace-nowrap">
      <PackageIcon class="w-4 h-4" />
      物料清单
    </button>
    <button class="flex items-center gap-2 py-3 px-1 border-b-2 border-transparent text-slate-500 hover:text-slate-700 font-medium text-sm whitespace-nowrap">
      <RouteIcon class="w-4 h-4" />
      工艺路线
    </button>
    <button class="flex items-center gap-2 py-3 px-1 border-b-2 border-transparent text-slate-500 hover:text-slate-700 font-medium text-sm whitespace-nowrap">
      <BuildingIcon class="w-4 h-4" />
      投资项
    </button>
    <button class="flex items-center gap-2 py-3 px-1 border-b-2 border-transparent text-slate-500 hover:text-slate-700 font-medium text-sm whitespace-nowrap">
      <ShoppingCartIcon class="w-4 h-4" />
      采购询价
    </button>
    <button class="flex items-center gap-2 py-3 px-1 border-b-2 border-transparent text-slate-500 hover:text-slate-700 font-medium text-sm whitespace-nowrap">
      <CalculatorIcon class="w-4 h-4" />
      成本计算
    </button>
    <button class="flex items-center gap-2 py-3 px-1 border-b-2 border-transparent text-slate-500 hover:text-slate-700 font-medium text-sm whitespace-nowrap">
      <FileTextIcon class="w-4 h-4" />
      报价汇总
    </button>
    <button class="flex items-center gap-2 py-3 px-1 border-b-2 border-transparent text-slate-500 hover:text-slate-700 font-medium text-sm whitespace-nowrap">
      <DownloadIcon class="w-4 h-4" />
      导出
    </button>
  </nav>
</div>
```

**Tab labels:**
1. 物料清单 (Materials)
2. 工艺路线 (Process Routes)
3. 投资项 (Investment)
4. 采购询价 (Procurement)
5. 成本计算 (Cost Calculation)
6. 报价汇总 (Quotation)
7. 导出 (Export)

---

## Tab States

| State | Border | Text | Background |
|-------|--------|------|------------|
| Active | `border-primary` (2px) | `text-primary` | transparent |
| Inactive | `border-transparent` | `text-slate-500` | transparent |
| Hover | `border-transparent` | `text-slate-700` | transparent |
| Disabled | `border-transparent` | `text-slate-300` | transparent |

```html
<!-- Active -->
<button class="py-3 px-1 border-b-2 border-primary text-primary font-medium text-sm">
  物料清单
</button>

<!-- Inactive -->
<button class="py-3 px-1 border-b-2 border-transparent text-slate-500 hover:text-slate-700 font-medium text-sm">
  工艺路线
</button>

<!-- Disabled -->
<button disabled class="py-3 px-1 border-b-2 border-transparent text-slate-300 font-medium text-sm cursor-not-allowed">
  导出
</button>
```

---

## Tab with Badge

```html
<button class="flex items-center gap-2 py-3 px-1 border-b-2 border-transparent text-slate-500 hover:text-slate-700 font-medium text-sm">
  物料清单
  <span class="px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 text-xs font-medium">
    24
  </span>
</button>

<!-- Active with badge -->
<button class="flex items-center gap-2 py-3 px-1 border-b-2 border-primary text-primary font-medium text-sm">
  物料清单
  <span class="px-1.5 py-0.5 rounded bg-primary/20 text-primary text-xs font-medium">
    24
  </span>
</button>

<!-- Warning badge -->
<button class="flex items-center gap-2 py-3 px-1 border-b-2 border-transparent text-slate-500 hover:text-slate-700 font-medium text-sm">
  物料清单
  <span class="px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700 text-xs font-medium">
    3
  </span>
</button>
```

---

## Tab Panel

```html
<div role="tabpanel" aria-labelledby="tab-materials" tabindex="0">
  <div class="py-4">
    <!-- Tab content -->
  </div>
</div>
```

**Accessibility:**
- Use `role="tabpanel"` on content
- Link with `aria-labelledby` to tab button
- Make panel keyboard accessible with `tabindex="0"`

---

## Full Tab Component Example

```html
<div class="tabs">
  <!-- Tab List -->
  <div class="border-b border-slate-200" role="tablist">
    <nav class="flex gap-6">
      <button
        id="tab-materials"
        role="tab"
        aria-selected="true"
        aria-controls="panel-materials"
        class="py-3 px-1 border-b-2 border-primary text-primary font-medium text-sm"
      >
        物料清单
      </button>
      <button
        id="tab-processes"
        role="tab"
        aria-selected="false"
        aria-controls="panel-processes"
        class="py-3 px-1 border-b-2 border-transparent text-slate-500 hover:text-slate-700 font-medium text-sm"
      >
        工艺路线
      </button>
      <button
        id="tab-investment"
        role="tab"
        aria-selected="false"
        aria-controls="panel-investment"
        class="py-3 px-1 border-b-2 border-transparent text-slate-500 hover:text-slate-700 font-medium text-sm"
      >
        投资项
      </button>
    </nav>
  </div>

  <!-- Tab Panels -->
  <div>
    <div
      id="panel-materials"
      role="tabpanel"
      aria-labelledby="tab-materials"
      class="py-4"
    >
      <!-- Materials content -->
    </div>
    <div
      id="panel-processes"
      role="tabpanel"
      aria-labelledby="tab-processes"
      class="py-4 hidden"
    >
      <!-- Processes content -->
    </div>
    <div
      id="panel-investment"
      role="tabpanel"
      aria-labelledby="tab-investment"
      class="py-4 hidden"
    >
      <!-- Investment content -->
    </div>
  </div>
</div>
```

---

## Vertical Tabs

```html
<div class="flex gap-6">
  <!-- Tab List -->
  <div class="flex flex-col gap-2 w-40" role="tablist">
    <button class="px-4 py-2 text-left rounded-md bg-primary text-white font-medium text-sm">
      物料清单
    </button>
    <button class="px-4 py-2 text-left rounded-md text-slate-600 hover:bg-slate-100 font-medium text-sm">
      工艺路线
    </button>
    <button class="px-4 py-2 text-left rounded-md text-slate-600 hover:bg-slate-100 font-medium text-sm">
      投资项
    </button>
  </div>

  <!-- Tab Panel -->
  <div class="flex-1">
    <div role="tabpanel" class="py-4">
      <!-- Content -->
    </div>
  </div>
</div>
```

---

## Responsive Tabs

### Desktop (Horizontal)

```html
<div class="hidden md:flex border-b">
  <button class="px-4 py-3 border-b-2 border-primary">Tab 1</button>
  <button class="px-4 py-3 border-b-2 border-transparent">Tab 2</button>
</div>
```

### Mobile (Dropdown/Scroll)

```html
<!-- Option 1: Scrollable -->
<div class="md:hidden flex overflow-x-auto gap-4 border-b">
  <button class="px-4 py-3 border-b-2 border-primary whitespace-nowrap">Tab 1</button>
  <button class="px-4 py-3 border-b-2 border-transparent whitespace-nowrap">Tab 2</button>
</div>

<!-- Option 2: Dropdown select -->
<div class="md:hidden">
  <select class="w-full px-3 py-2 border rounded-md">
    <option>物料清单</option>
    <option>工艺路线</option>
    <option>投资项</option>
  </select>
</div>
```

---

## Tab Spacing

| Context | Gap | Example |
|---------|-----|---------|
| Default | 24px (gap-6) | Standard tabs |
| Compact | 16px (gap-4) | Many tabs |
| With icons | 20px (gap-5) | Icon + text |

```html
<!-- Default spacing -->
<nav class="flex gap-6">...</nav>

<!-- Compact spacing -->
<nav class="flex gap-4">...</nav>
```

---

## Tab with Icon

```html
<button class="flex items-center gap-2 py-3 px-1 border-b-2 border-primary text-primary font-medium text-sm">
  <PackageIcon class="w-4 h-4" />
  <span>物料清单</span>
</button>
```

---

## Tab Accessibility

Tabs MUST:

1. Use `role="tablist"` on container
2. Use `role="tab"` on each tab button
3. Use `aria-selected` to indicate active tab
4. Use `aria-controls` to link to panel
5. Support arrow key navigation
6. Have visible focus indicator

```html
<div role="tablist" aria-label="BOM Management">
  <button
    role="tab"
    aria-selected="true"
    aria-controls="panel-materials"
    id="tab-materials"
    tabindex="0"
  >
    物料清单
  </button>
  <button
    role="tab"
    aria-selected="false"
    aria-controls="panel-processes"
    id="tab-processes"
    tabindex="-1"
  >
    工艺路线
  </button>
</div>
```

---

## Quick Reference

```
┌─────────────────────────────────────────────────────────┐
│  Tabs Quick Reference                                   │
├─────────────────────────────────────────────────────────┤
│  Style: Underline (border-b-2)                          │
│  Padding: 12px vertical (py-3)                          │
│  Gap: 24px between tabs (gap-6)                         │
│                                                         │
│  Active:   border-primary, text-primary                │
│  Inactive: border-transparent, text-slate-500           │
│  Hover:    text-slate-700                               │
│  Disabled: text-slate-300, cursor-not-allowed          │
│                                                         │
│  Font: text-sm (14px), font-medium                     │
│  Border: 2px bottom                                    │
│                                                         │
│  BOM Management Tabs (7):                               │
│    1. 物料清单 (Materials)                             │
│    2. 工艺路线 (Process Routes)                        │
│    3. 投资项 (Investment)                              │
│    4. 采购询价 (Procurement)                           │
│    5. 成本计算 (Cost Calculation)                      │
│    6. 报价汇总 (Quotation)                             │
│    7. 导出 (Export)                                    │
│                                                         │
│  Badge: Right aligned, pill shape                      │
│  Icons: Left of text, w-4 h-4, gap-2                   │
│                                                         │
│  Panel: py-4, role="tabpanel", aria-labelledby         │
└─────────────────────────────────────────────────────────┘
```
