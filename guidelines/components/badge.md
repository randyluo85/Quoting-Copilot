# Badge Component

| 版本号 | 创建时间 | 更新时间 | 文档主题 | 创建人 |
|--------|----------|----------|----------|--------|
| v1.1   | 2026-03-07 | 2026-03-08 | 标签组件规范 | Randy Luo |

---

## Purpose

Badges display status, categories, or counts. They provide visual context at a glance for material matching status and financial validation.

---

## Traffic Light Status Badges

### Verified (Green 🟢)

```tsx
import { Badge } from "@/components/ui/badge";

<Badge className="bg-emerald-50 border-emerald-200 text-emerald-700">
  ✓ 已确认
</Badge>

{/* Compact version */}
<div className="flex items-center gap-2">
  <div className="w-2 h-2 rounded-full bg-emerald-500" />
  <span className="text-xs text-emerald-700">已匹配</span>
</div>
```

**Use when:** Material is matched from database, auto-approved, no action needed.

**Classes:**
- Background: `bg-emerald-50`
- Border: `border-emerald-200`
- Text: `text-emerald-700`
- Dot: `bg-emerald-500`

---

### Warning (Amber 🟡)

```tsx
<Badge className="bg-amber-50 border-amber-200 text-amber-700">
  △ 需确认
</Badge>

{/* Compact version */}
<div className="flex items-center gap-2">
  <div className="w-2 h-2 rounded-full bg-amber-500" />
  <span className="text-xs text-amber-700">需确认</span>
</div>
```

**Use when:** AI match >85%, estimated values, needs human review.

**Classes:**
- Background: `bg-amber-50`
- Border: `border-amber-200`
- Text: `text-amber-700`
- Dot: `bg-amber-500`

---

### Missing (Red 🔴)

```tsx
<Badge className="bg-red-50 border-red-200 text-red-700">
  ⚠ 缺失
</Badge>

{/* Compact version */}
<div className="flex items-center gap-2">
  <div className="w-2 h-2 rounded-full bg-red-500" />
  <span className="text-xs text-red-700">需询价</span>
</div>
```

**Use when:** No data found, manual intervention required, urgent action needed.

**Classes:**
- Background: `bg-red-50`
- Border: `border-red-200`
- Text: `text-red-700`
- Dot: `bg-red-500`

---

## Badge Variants

### Default Badge

```tsx
<Badge variant="outline" className="px-2 py-1 rounded-full text-xs">
  标签
</Badge>
```

### Status Badge with Border

```tsx
<Badge className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-1 rounded-full text-xs">
  ✓ 已确认
</Badge>
```

### Dot Style (Most Compact)

```tsx
{/* In table cells */}
<div className="w-2 h-2 rounded-full bg-emerald-500 mx-auto" />

{/* With gap */}
<div className="flex items-center gap-2">
  <div className="w-2 h-2 rounded-full bg-emerald-500" />
  <span className="text-xs text-emerald-700">已匹配</span>
</div>
```

---

## Badge Sizes

| Size | Padding | Font | Dot | Usage |
|------|---------|------|-----|-------|
| Small | 4px 8px | 11px | 6px | Compact tables |
| Medium (default) | 4px 8px | 12px | 8px | Most cases |

```tsx
{/* Small */}
<Badge className="px-2 py-1 rounded-full text-xs">标签</Badge>

{/* With icon */}
<div className="flex items-center gap-1.5">
  <div className="w-2 h-2 rounded-full bg-emerald-500" />
  <span className="text-xs">已确认</span>
</div>
```

---

## Count Badges

### Tab Count

```tsx
<button className="flex items-center gap-2 px-4 py-2">
  <span>物料清单</span>
  <Badge variant="secondary" className="px-1.5 py-0 bg-slate-200 text-slate-600 text-xs">
    24
  </Badge>
</button>
```

### Notification Count

```tsx
<div className="relative">
  <Bell className="h-5 w-5 text-slate-600" />
  {count > 0 && (
    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
      {count}
    </span>
  )}
</div>
```

---

## Color Meanings

| Color | Classes | Meaning | Use Case |
|-------|---------|---------|----------|
| Green | `bg-emerald-50 border-emerald-200 text-emerald-700` | Positive, verified | 已确认, 完成, DB4 >= 0% |
| Amber | `bg-amber-50 border-amber-200 text-amber-700` | Warning, pending | 需确认, 审核中, DB4 < 0% |
| Red | `bg-red-50 border-red-200 text-red-700` | Negative, missing | 缺失, 错误, DB4 < -5% |
| Slate | `bg-slate-100 text-slate-700` | Neutral | 默认, 其他 |
| Blue | `bg-blue-50 text-blue-700` | Information | 新建, 进行中 |

---

## Badge Placement

### In Table Cells

```tsx
<TableCell className="p-2 text-center">
  <div className="w-2 h-2 rounded-full bg-emerald-500 mx-auto" />
</TableCell>
```

### On Cards

```tsx
<Card>
  <CardHeader className="flex items-center justify-between">
    <CardTitle>项目名称</CardTitle>
    <Badge className="bg-emerald-50 border-emerald-200 text-emerald-700">
      🟢 进行中
    </Badge>
  </CardHeader>
</Card>
```

### Next to Text

```tsx
<div className="flex items-center gap-2">
  <span>项目状态</span>
  <Badge className="bg-amber-50 border-amber-200 text-amber-700">
    🟡 待审核
  </Badge>
</div>
```

---

## Financial Status Badges

### DB4 Profit Status

```tsx
{/* Pass - DB4 >= 0% */}
<Badge className="bg-emerald-50 border-emerald-200 text-emerald-700">
  ✓ 计算通过
</Badge>

{/* Warning - DB4 < 0% */}
<Badge className="bg-amber-50 border-amber-200 text-amber-700">
  ⚠ 利润为负
</Badge>

{/* High Risk - DB4 < -5% */}
<Badge className="bg-red-50 border-red-200 text-red-700">
  🔴 高风险
</Badge>
```

### Payback Status

```tsx
<Badge className={getPaybackBadgeClass(months)}>
  {getPaybackStatus(months)}
</Badge>

// Helper
function getPaybackBadgeClass(months: number) {
  if (months <= 24) return "bg-emerald-50 border-emerald-200 text-emerald-700";
  if (months <= 36) return "bg-amber-50 border-amber-200 text-amber-700";
  return "bg-red-50 border-red-200 text-red-700";
}
```

---

## Quick Reference

```
┌─────────────────────────────────────────────────────────┐
│  Badge Quick Reference                                   │
├─────────────────────────────────────────────────────────┤
│  Padding: 4px 8px (px-2 py-1)                           │
│  Radius: rounded-full                                    │
│  Font: text-xs (12px)                                   │
│                                                         │
│  Traffic Light System:                                  │
│    🟢 Green:  bg-emerald-50 border-emerald-200           │
│              text-emerald-700                            │
│              ✓ 已确认, 已匹配                             │
│                                                         │
│    🟡 Amber:   bg-amber-50 border-amber-200             │
│              text-amber-700                              │
│              △ 需确认, AI匹配                            │
│                                                         │
│    🔴 Red:     bg-red-50 border-red-200                 │
│              text-red-700                               │
│              ⚠ 缺失, 需询价                              │
│                                                         │
│  Dot Style: w-2 h-2 rounded-full (most compact)         │
│    Use in tables: mx-auto for center alignment          │
│                                                         │
│  With text: gap-2 between dot and label                 │
│  Count badge: Absolute position, top-right              │
└─────────────────────────────────────────────────────────┘
```

---

## Figma Make Prompt

```
Status Badge for Dr.aiVOSS:

Size: 4px padding (px-2), rounded-full
Font: 12px (text-xs), font-medium

Traffic Light Colors:
- 🟢 Green (Verified): Emerald-50 bg, Emerald-200 border, Emerald-700 text
- 🟡 Amber (Warning): Amber-50 bg, Amber-200 border, Amber-700 text
- 🔴 Red (Missing): Red-50 bg, Red-200 border, Red-700 text

Dot Style (for tables):
- 8px diameter (w-2 h-2)
- rounded-full
- Colors: Emerald-500, Amber-500, Red-500

Placement:
- Table: center-align in cell
- Card: top-right corner
- Inline: gap-2 from label
```
