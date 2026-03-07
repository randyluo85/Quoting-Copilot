# Badge Component

| 版本号 | 创建时间 | 更新时间 | 文档主题 | 创建人 |
|--------|----------|----------|----------|--------|
| v1.0   | 2026-03-07 | 2026-03-07 | 标签组件规范 | Randy Luo |

---

## Purpose

Badges display status, categories, or counts. They provide visual context at a glance.

---

## When to Use

**DO use a badge when:**
- Showing status (Verified, Pending, Missing)
- Displaying counts (Items, Notifications)
- Categorizing items (Tag, Label)
- Indicating state (New, Updated)

**DO NOT use a badge when:**
- Displaying complex information (use Card)
- Showing detailed status (use Progress/Status component)
- Primary actions (use Button)

---

## Traffic Light Status Badges

### Verified (Green)

```html
<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
  ✓ 已确认
</span>
```

**Use when:** Data is verified from database, auto-approved, no action needed.

**Background:** `#d1fae5` (green-100)
**Text:** `#065f46` (green-800)

---

### Warning (Yellow)

```html
<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
  △ 待确认
</span>
```

**Use when:** AI match >85%, estimated values, needs human review.

**Background:** `#fef3c7` (yellow-100)
**Text:** `#92400e` (yellow-800)

---

### Missing (Red)

```html
<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
  ⚠ 缺失
</span>
```

**Use when:** No data found, manual intervention required, urgent action needed.

**Background:** `#fee2e2` (red-100)
**Text:** `#991b1b` (red-800)

---

## Badge Variants

### Pill Badge (Default)

```html
<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
  标签
</span>
```

**Use for:** Most cases, standard status labels

---

### Square Badge

```html
<span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
  标签
</span>
```

**Use for:** When badges need to align with square UI elements

---

### Dot Badge

```html
<span class="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700">
  <span class="w-2 h-2 rounded-full bg-green-500"></span>
  在线
</span>
```

**Use for:** Compact status indicators, user presence states

---

## Badge with Icon

```html
<!-- Icon + Text -->
<span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
  <CheckIcon class="w-3 h-3" />
  已完成
</span>

<!-- Text + Icon -->
<span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
  新建
  <SparklesIcon class="w-3 h-3" />
</span>
```

---

## Badge Sizes

| Size | Padding | Font | Icon | Usage |
|------|---------|------|------|-------|
| Small | 4px 8px | 11px | 12px | Compact tables |
| Medium (default) | 4px 8px | 12px | 14px | Most cases |
| Large | 6px 12px | 14px | 16px | Emphasis |

```html
<!-- Small -->
<span class="px-2 py-1 rounded-full text-xs">标签</span>

<!-- Medium -->
<span class="px-2.5 py-1 rounded-full text-sm">标签</span>

<!-- Large -->
<span class="px-3 py-1.5 rounded-full text-base">标签</span>
```

---

## Count Badges

### Notification Count

```html
<div class="relative">
  <BellIcon class="w-5 h-5 text-slate-600" />
  <span class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
    3
  </span>
</div>
```

### Tab Count

```html
<button class="flex items-center gap-2 px-4 py-2">
  <span>物料清单</span>
  <span class="px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 text-xs font-medium">
    24
  </span>
</button>
```

---

## Color Meanings

| Color | Background | Text | Meaning | Use Case |
|-------|-----------|------|---------|----------|
| Green | `bg-green-100` | `text-green-800` | Positive, verified | 已确认, 完成 |
| Yellow | `bg-yellow-100` | `text-yellow-800` | Warning, pending | 待确认, 审核中 |
| Red | `bg-red-100` | `text-red-800` | Negative, missing | 缺失, 错误 |
| Blue | `bg-blue-100` | `text-blue-800` | Information | 新建, 进行中 |
| Gray | `bg-slate-100` | `text-slate-700` | Neutral | 默认, 其他 |
| Purple | `bg-purple-100` | `text-purple-800` | Special | VIP, 优先 |
| Orange | `bg-orange-100` | `text-orange-800` | Attention | 重要, 紧急 |

---

## Badge Placement

### In Table Cells

```html
<td class="px-4 py-3 text-center">
  <span class="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">🟢</span>
</td>
```

### On Cards

```html
<div class="flex items-start justify-between">
  <h3>项目名称</h3>
  <span class="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">🟢 进行中</span>
</div>
```

### Next to Text

```html
<div class="flex items-center gap-2">
  <span>项目状态</span>
  <span class="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs">🟡 待审核</span>
</div>
```

---

## Status Badge Combinations

### Single Status

```html
<span class="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">🟢 已确认</span>
```

### Status + Count

```html
<span class="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">
  🟢 已确认 <span class="text-green-900 font-medium">24</span>
</span>
```

### Multiple Badges

```html
<div class="flex gap-1">
  <span class="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs">新业务</span>
  <span class="px-2 py-1 rounded-full bg-purple-100 text-purple-800 text-xs">样件阶段</span>
</div>
```

---

## Interactive Badges

```html
<!-- Clickable -->
<button class="px-2 py-1 rounded-full bg-slate-100 text-slate-700 text-xs hover:bg-slate-200 transition-colors">
  标签
</button>

<!-- Removable -->
<span class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs">
  标签
  <button class="hover:bg-blue-200 rounded-full p-0.5">
    <XIcon class="w-3 h-3" />
  </button>
</span>
```

---

## Gradient Badges (Special Use Only)

```html
<!-- Reserved for premium/special status -->
<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white">
  ⭐ 重要
</span>
```

**DO NOT** use gradient badges for standard status indicators.

---

## Badge Accessibility

Badges MUST:

1. Have sufficient contrast (4.5:1 minimum)
2. Include visible text (icon-only badges need aria-label)
3. Be readable at small sizes
4. Convey meaning through color AND text/icon

```html
<!-- Good: Text + Color -->
<span class="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">已确认</span>

<!-- Good: Icon + Label -->
<span class="sr-only">状态</span>
<span aria-label="已确认" class="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">🟢</span>

<!-- Bad: Color only (no meaning without color) -->
<!-- Don't do this -->
<span class="px-2 py-1 rounded-full text-xs"></span>
```

---

## Quick Reference

```
┌─────────────────────────────────────────────────────────┐
│  Badge Quick Reference                                  │
├─────────────────────────────────────────────────────────┤
│  Padding: 4px 8px (px-2 py-1)                           │
│  Radius: full (rounded-full)                           │
│  Font: text-xs (12px), font-medium                      │
│                                                         │
│  Traffic Light System:                                  │
│    🟢 Green:  #d1fae5 bg, #065f46 text                 │
│              ✓ Verified, completed                     │
│    🟡 Yellow: #fef3c7 bg, #92400e text                 │
│              △ Pending, needs review                   │
│    🔴 Red:    #fee2e2 bg, #991b1b text                 │
│              ⚠ Missing, error                          │
│                                                         │
│  Colors:                                               │
│    Blue:    Information, new, in-progress              │
│    Gray:    Neutral, default                           │
│    Purple:  Special, VIP                               │
│    Orange:  Important, urgent                          │
│                                                         │
│  Placement:                                            │
│    Table: Center-align in cell                         │
│    Card: Top-right corner                               │
│    Text: After label with gap-2                        │
│                                                         │
│  With icon: gap-1 between icon and text                │
│  Count: Absolute position on top-right                 │
└─────────────────────────────────────────────────────────┘
```
