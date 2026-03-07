# Input Component

| 版本号 | 创建时间 | 更新时间 | 文档主题 | 创建人 |
|--------|----------|----------|----------|--------|
| v1.0   | 2026-03-07 | 2026-03-07 | 输入框组件规范 | Randy Luo |

---

## Purpose

Input fields collect user data. They are the primary way users enter information into forms.

---

## When to Use

**DO use an input when:**
- Collecting short text ("项目名称")
- Entering numbers ("年量", "单价")
- Selecting from options (use Select variant)
- Entering dates (use Date variant)
- Capturing currency values

**DO NOT use an input when:**
- Collecting long text (use Textarea)
- Selecting from many options (use Select/Dropdown)
- Boolean choice (use Checkbox/Radio)
- Displaying read-only data (use Text)

---

## Text Input

### Default State

```html
<div class="space-y-1">
  <label for="project-name" class="text-sm font-medium text-slate-700">
    项目名称 <span class="text-red-500">*</span>
  </label>
  <input
    type="text"
    id="project-name"
    placeholder="请输入项目名称"
    class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
  />
</div>
```

**Styling:**
- Padding: 12px (px-3 py-2)
- Border: `#e2e8f0` (slate-200)
- Radius: 6px (rounded-md)
- Focus ring: Blue, 2px

---

## Number Input

### Integer Values

```html
<div class="space-y-1">
  <label for="annual-volume" class="text-sm font-medium text-slate-700">
    项目年量 <span class="text-red-500">*</span>
  </label>
  <div class="relative">
    <input
      type="number"
      id="annual-volume"
      placeholder="0"
      class="w-full px-3 py-2 pr-16 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary tabular-nums"
    />
    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
      件/年
    </span>
  </div>
</div>
```

### Decimal Values

```html
<div class="space-y-1">
  <label for="unit-price" class="text-sm font-medium text-slate-700">
    单价
  </label>
  <div class="relative">
    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
      ¥
    </span>
    <input
      type="number"
      id="unit-price"
      placeholder="0.00"
      step="0.01"
      min="0"
      class="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary tabular-nums"
    />
  </div>
</div>
```

---

## Currency Input

### CNY (人民币)

```html
<div class="space-y-1">
  <label for="target-price" class="text-sm font-medium text-slate-700">
    客户目标价
  </label>
  <div class="relative">
    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
      €
    </span>
    <input
      type="number"
      id="target-price"
      placeholder="0.00"
      step="0.01"
      min="0"
      class="w-full pl-8 pr-16 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary tabular-nums"
    />
    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
      / 件
    </span>
  </div>
</div>
```

**Currency symbols:**
- CNY: `¥` (left)
- EUR: `€` (left)
- USD: `$` (left)

---

## Select Input

### Default Select

```html
<div class="space-y-1">
  <label for="factory" class="text-sm font-medium text-slate-700">
    所属工厂
  </label>
  <select
    id="factory"
    class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white"
  >
    <option value="">请选择...</option>
    <option value="suzhou">苏州工厂</option>
    <option value="changzhou">常州工厂</option>
  </select>
</div>
```

---

## Input States

### Default

```html
<input class="w-full px-3 py-2 border border-slate-300 rounded-md" placeholder="请输入..." />
```

### Focus

```html
<input class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
```

**Focus ring:** `#3b82f6`, 2px, offset 2px

### Disabled

```html
<input disabled class="w-full px-3 py-2 border border-slate-200 rounded-md bg-slate-50 text-slate-400 cursor-not-allowed" placeholder="不可编辑" />
```

### Error

```html
<div class="space-y-1">
  <label class="text-sm font-medium text-slate-700">项目名称</label>
  <input class="w-full px-3 py-2 border border-red-500 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="请输入项目名称" />
  <p class="text-sm text-red-600">项目名称不能为空</p>
</div>
```

**Error styling:**
- Border: `#ef4444` (red-500)
- Ring: `#ef4444`
- Helper text: `text-red-600`

### Success

```html
<div class="space-y-1">
  <label class="text-sm font-medium text-slate-700">项目名称</label>
  <div class="relative">
    <input class="w-full px-3 py-2 pr-10 border border-green-500 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" value="制动管路总成" />
    <CheckIcon class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
  </div>
</div>
```

---

## Input Sizes

| Size | Padding | Font | Icon | Usage |
|------|---------|------|------|-------|
| Small | 8px | 14px | 16px | Compact forms |
| Medium (default) | 12px | 16px | 20px | Standard forms |
| Large | 16px | 16px | 24px | Prominent inputs |

```html
<!-- Small -->
<input class="px-2 py-1.5 text-sm border rounded-md" />

<!-- Medium -->
<input class="px-3 py-2 text-base border rounded-md" />

<!-- Large -->
<input class="px-4 py-3 text-base border rounded-md" />
```

---

## Input Groups

### Prefix/Suffix

```html
<!-- Prefix -->
<div class="relative">
  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">¥</span>
  <input class="w-full pl-8 pr-3 py-2 border rounded-md" placeholder="0.00" />
</div>

<!-- Suffix -->
<div class="relative">
  <input class="w-full pl-3 pr-12 py-2 border rounded-md" placeholder="数量" />
  <span class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">kg</span>
</div>

<!-- Both -->
<div class="relative">
  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">€</span>
  <input class="w-full pl-8 pr-12 py-2 border rounded-md" placeholder="0.00" />
  <span class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">/件</span>
</div>
```

---

## Helper Text

```html
<div class="space-y-1">
  <label class="text-sm font-medium text-slate-700">AS号</label>
  <input class="w-full px-3 py-2 border border-slate-300 rounded-md" placeholder="AS-2024-001" />
  <p class="text-xs text-slate-500">请输入客户提供的AS编号</p>
</div>
```

---

## Required Fields

Mark required fields with an asterisk in red.

```html
<div class="space-y-1">
  <label for="project-name" class="text-sm font-medium text-slate-700">
    项目名称 <span class="text-red-500">*</span>
  </label>
  <input id="project-name" class="w-full px-3 py-2 border border-slate-300 rounded-md" />
</div>
```

---

## Character Count

```html
<div class="space-y-1">
  <div class="flex justify-between">
    <label class="text-sm font-medium text-slate-700">项目描述</label>
    <span class="text-xs text-slate-400">0 / 200</span>
  </div>
  <input
    maxlength="200"
    oninput="this.nextElementSibling.textContent = this.value.length + ' / 200'"
    class="w-full px-3 py-2 border border-slate-300 rounded-md"
  />
  <span class="text-xs text-slate-400">0 / 200</span>
</div>
```

---

## Search Input

```html
<div class="relative">
  <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
  <input
    type="search"
    placeholder="搜索项目..."
    class="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
  />
</div>
```

---

## Accessibility

Inputs MUST:

1. Have associated labels (visible or aria-label)
2. Show required field indicators
3. Display error messages clearly
4. Support keyboard navigation
5. Announce state changes

```html
<!-- Good: With label -->
<div>
  <label for="input-id">Label</label>
  <input id="input-id" />
</div>

<!-- Good: With aria-label -->
<input aria-label="Search" type="search" />

<!-- Good: With error -->
<div>
  <label for="email">Email</label>
  <input id="email" aria-invalid="true" aria-describedby="error-msg" />
  <p id="error-msg" class="text-red-600">Please enter a valid email</p>
</div>
```

---

## Quick Reference

```
┌─────────────────────────────────────────────────────────┐
│  Input Quick Reference                                  │
├─────────────────────────────────────────────────────────┤
│  Padding: 12px (px-3 py-2)                              │
│  Border: #e2e8f0, 1px, rounded-md                       │
│  Focus: Blue ring, 2px, offset 2px                     │
│                                                         │
│  States:                                                │
│    Default:  #e2e8f0 border                            │
│    Focus:    #3b82f6 ring                              │
│    Error:    #ef4444 border + ring                     │
│    Success:  #22c55e border + check icon               │
│    Disabled: #f1f5f9 bg, 50% opacity                   │
│                                                         │
│  Labels: text-sm, font-medium, slate-700              │
│  Required: * in red-500                                │
│  Helper: text-xs, slate-500                            │
│  Error: text-sm, red-600                               │
│                                                         │
│  Numbers: tabular-nums for alignment                  │
│  Currency: symbol prefix (¥ € $)                       │
│  Units: suffix (kg, 件/年, /件)                         │
└─────────────────────────────────────────────────────────┘
```
