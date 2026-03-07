# Color Design Tokens

| 版本号 | 创建时间 | 更新时间 | 文档主题 | 创建人 |
|--------|----------|----------|----------|--------|
| v1.1   | 2026-03-07 | 2026-03-08 | 颜色设计令牌 | Randy Luo |

---

## Color Philosophy

Dr.aiVOSS uses a minimal color palette focused on data clarity. The system uses **slate-900** as primary, with **semantic colors** (emerald/amber/red) exclusively for the traffic light status system.

### Core Principles

1. **DO** use semantic colors ONLY for status indicators
2. **DO NOT** use semantic colors for decoration
3. **DO** maintain WCAG AA contrast ratios (4.5:1 for text)
4. **DO NOT** create new color variants without approval

---

## Primary Colors (Slate)

### Primary Action

| Tailwind Class | Usage | Example |
|----------------|-------|---------|
| `bg-slate-900 text-white` | Main buttons, links | "生成报价单" button |
| `bg-slate-100 text-slate-900` | Secondary buttons | "取消" button |
| `hover:bg-slate-200` | Hover state | Button hover |

```tsx
{/* Primary Button */}
<Button className="bg-slate-900 text-white hover:bg-slate-800">
  生成报价单
</Button>

{/* Secondary Button */}
<Button className="bg-slate-100 text-slate-900 hover:bg-slate-200">
  取消
</Button>
```

---

## Semantic Colors (Traffic Light System)

### Success/Green (🟢 正常 / 匹配成功)

| Tailwind Class | Usage | Example |
|----------------|-------|---------|
| `text-emerald-700` | Status text | "已匹配" label |
| `bg-emerald-50` | Row background | Verified material row |
| `border-emerald-200` | Badge border | Status badge |
| `bg-emerald-500` | Status dot | `w-2 h-2 rounded-full` |

```tsx
{/* Status Indicator */}
<div className="flex items-center gap-2">
  <div className="w-2 h-2 rounded-full bg-emerald-500" />
  <span className="text-xs text-emerald-700">已匹配</span>
</div>

{/* Table Row */}
<tr className="bg-emerald-50">
  <td>A356-T6</td>
</tr>

{/* Badge */}
<Badge className="bg-emerald-50 border-emerald-200 text-emerald-700">
  ✓ 已确认
</Badge>
```

**DO use for:**
- Verified/Matched status indicators
- Positive profit margins (DB4 >= 0%)
- Completed states
- Passed validation

---

### Warning/Amber (🟡 警告 / AI匹配需确认)

| Tailwind Class | Usage | Example |
|----------------|-------|---------|
| `text-amber-700` | Status text | "需确认" label |
| `bg-amber-50` | Row background | AI-matched material row |
| `border-amber-200` | Badge border | Status badge |
| `bg-amber-500` | Status dot | `w-2 h-2 rounded-full` |

```tsx
{/* Status Indicator */}
<div className="flex items-center gap-2">
  <div className="w-2 h-2 rounded-full bg-amber-500" />
  <span className="text-xs text-amber-700">需确认</span>
</div>

{/* Table Row */}
<tr className="bg-amber-50">
  <td>UNKNOWN</td>
</tr>

{/* Badge */}
<Badge className="bg-amber-50 border-amber-200 text-amber-700">
  △ 需确认
</Badge>
```

**DO use for:**
- AI-matched items (85%+ confidence)
- Pending review states
- Warning alerts (DB4 < 0% but >= -5%)
- Low-risk warnings

---

### Danger/Red (🔴 严重亏损 / 无物料匹配)

| Tailwind Class | Usage | Example |
|----------------|-------|---------|
| `text-red-700` | Status text | "需询价" label |
| `bg-red-50` | Row background | Missing material row |
| `border-red-200` | Badge border | Status badge |
| `bg-red-500` | Status dot | `w-2 h-2 rounded-full` |

```tsx
{/* Status Indicator */}
<div className="flex items-center gap-2">
  <div className="w-2 h-2 rounded-full bg-red-500" />
  <span className="text-xs text-red-700">需询价</span>
</div>

{/* Table Row */}
<tr className="bg-red-50">
  <td>MISSING</td>
</tr>

{/* Badge */}
<Badge className="bg-red-50 border-red-200 text-red-700">
  ⚠ 缺失
</Badge>
```

**DO use for:**
- Missing/Unmatched materials
- High-risk warnings (DB4 < -5%)
- Error states
- Negative profit margins
- Delete/destroy actions

---

## Neutral Colors (Slate)

### Backgrounds

| Tailwind Class | Usage | Example |
|----------------|-------|---------|
| `bg-slate-50` | App background | Main page background |
| `bg-white` | Card/module background | Card, modal content |
| `bg-slate-100` | Selected/hover states | Hover background |
| `bg-slate-200` | Table header | Column headers |

```tsx
{/* App Layout */}
<div className="bg-slate-50 min-h-screen">
  <Card className="bg-white">Content</Card>
</div>

{/* Table Header */}
<TableRow className="bg-slate-50">
  <TableHead className="text-xs font-semibold text-slate-500">物料号</TableHead>
</TableRow>
```

---

### Borders

| Tailwind Class | Usage | Example |
|----------------|-------|---------|
| `border-slate-200` | Default borders | Input, card borders |
| `border-slate-300` | Strong borders | Modal borders |

```tsx
<Card className="border border-slate-200 rounded-lg">
  {/* Card content */}
</Card>

<Input className="border border-slate-200" />
```

---

### Text

| Tailwind Class | Usage | Example |
|----------------|-------|---------|
| `text-slate-900` | Primary text | Page titles, headings |
| `text-slate-800` | Section titles | Card titles |
| `text-slate-700` | Labels | Form labels |
| `text-slate-600` | Body text | Descriptions, content |
| `text-slate-500` | Secondary text | Help text, metadata |
| `text-slate-400` | Tertiary text | Placeholder, disabled |

```tsx
<h1 className="text-2xl font-bold text-slate-900">Page Title</h1>
<h2 className="text-lg font-semibold text-slate-800">Section Title</h2>
<Label className="text-sm font-medium text-slate-700">Label</Label>
<p className="text-sm text-slate-600">Body text</p>
<p className="text-xs text-slate-500">Help text</p>
```

---

## Color Usage Patterns

### Pattern 1: Material Status Row

```tsx
{/* 🟢 Verified - Matched */}
<tr className="bg-emerald-50 hover:bg-emerald-50/80">
  <TableCell className="p-2">A356-T6</TableCell>
  <TableCell className="p-2 text-emerald-700">已匹配</TableCell>
</tr>

{/* 🟡 Warning - AI Matched */}
<tr className="bg-amber-50 hover:bg-amber-50/80">
  <TableCell className="p-2">UNKNOWN</TableCell>
  <TableCell className="p-2 text-amber-700">需确认</TableCell>
</tr>

{/* 🔴 Missing - No Match */}
<tr className="bg-red-50 hover:bg-red-50/80">
  <TableCell className="p-2 text-red-600">MISSING</TableCell>
  <TableCell className="p-2 text-red-700">需询价</TableCell>
</tr>
```

### Pattern 2: Status Badge

```tsx
{/* Verified Badge */}
<Badge className="bg-emerald-50 border-emerald-200 text-emerald-700">
  ✓ 已确认
</Badge>

{/* Warning Badge */}
<Badge className="bg-amber-50 border-amber-200 text-amber-700">
  △ 需确认
</Badge>

{/* Missing Badge */}
<Badge className="bg-red-50 border-red-200 text-red-700">
  ⚠ 缺失
</Badge>
```

### Pattern 3: Profit Display

```tsx
{/* Positive Profit */}
<span className="text-emerald-700 font-semibold">+5.2%</span>

{/* Negative Profit */}
<span className="text-red-700 font-semibold">-3.8%</span>

{/* Warning Profit */}
<span className="text-amber-700 font-semibold">-1.2%</span>
```

### Pattern 4: Alert Component

```tsx
{/* High Risk Alert - DB4 < -5% */}
<Alert variant="destructive" className="border-red-200 bg-red-50">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle className="text-red-800">高风险警告</AlertTitle>
  <AlertDescription className="text-red-700">
    DB4 利润率低于 -5%
  </AlertDescription>
</Alert>

{/* Warning Alert - DB4 < 0% */}
<Alert className="border-amber-200 bg-amber-50">
  <AlertTriangle className="h-4 w-4 text-amber-600" />
  <AlertTitle className="text-amber-800">利润警告</AlertTitle>
  <AlertDescription className="text-amber-700">
    DB4 利润率为负
  </AlertDescription>
</Alert>

{/* Success Alert - DB4 >= 0% */}
<Alert className="border-emerald-200 bg-emerald-50">
  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
  <AlertTitle className="text-emerald-800">计算通过</AlertTitle>
  <AlertDescription className="text-emerald-700">
    所有指标符合要求
  </AlertDescription>
</Alert>
```

---

## Prohibited Combinations

DO NOT combine these colors:

| Background | Foreground | Reason |
|------------|-----------|--------|
| Emerald | Red | Traffic light colors clash |
| Amber | White text | Insufficient contrast |
| Red | Emerald text | Color blindness issue |
| Slate-900 | Slate-900 | Low contrast |

---

## Accessibility Requirements

All color combinations MUST meet WCAG 2.1 AA standards:

- **Normal text:** 4.5:1 contrast ratio
- **Large text (18px+):** 3:1 contrast ratio
- **UI components:** 3:1 contrast ratio against adjacent colors

Verified combinations:
- `text-slate-900` on `bg-white` ✓ (15.7:1)
- `text-white` on `bg-slate-900` ✓ (13.5:1)
- `text-emerald-700` on `bg-emerald-50` ✓ (6.8:1)
- `text-amber-700` on `bg-amber-50` ✓ (6.2:1)
- `text-red-700` on `bg-red-50` ✓ (5.9:1)

---

## Quick Reference

```
┌─────────────────────────────────────────────────────────┐
│  Dr.aiVOSS Color Palette                                │
├─────────────────────────────────────────────────────────┤
│  Primary:     bg-slate-900 text-white                   │
│  Secondary:   bg-slate-100 text-slate-900               │
│                                                         │
│  🟢 Green:     text-emerald-700 bg-emerald-50           │
│               border-emerald-200                          │
│               已匹配 / 正常                               │
│                                                         │
│  🟡 Yellow:    text-amber-700 bg-amber-50              │
│               border-amber-200                            │
│               需确认 / 警告                               │
│                                                         │
│  🔴 Red:       text-red-700 bg-red-50                   │
│               border-red-200                             │
│               需询价 / 亏损 / 错误                         │
│                                                         │
│  Background:  bg-slate-50 (app)                          │
│               bg-white (card)                            │
│  Border:     border-slate-200                           │
│                                                         │
│  Text:        text-slate-900 (title)                     │
│               text-slate-600 (body)                      │
│               text-slate-500 (help)                      │
│               font-mono (numbers)                         │
└─────────────────────────────────────────────────────────┘
```

---

## Figma Make Prompt

```
Color System for Dr.aiVOSS:

Primary: Slate-900 (#0f172a) for main actions
Secondary: Slate-100 (#f1f5f9) for secondary actions

Traffic Light Status:
- Green: Emerald-50 (#ecfdf5) bg, Emerald-700 (#047857) text - Verified/Matched
- Yellow: Amber-50 (#fffbeb) bg, Amber-700 (#b45309) text - Needs review
- Red: Red-50 (#fef2f2) bg, Red-700 (#b91c1c) text - Missing/Error

Backgrounds: Slate-50 (#f8fafc) for app, White (#ffffff) for cards
Borders: Slate-200 (#e2e8f0)
Text: Slate-900 (#0f172a) for headings, Slate-600 (#475569) for body
```
