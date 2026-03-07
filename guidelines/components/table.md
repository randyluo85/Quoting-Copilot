# Table Component

| 版本号 | 创建时间 | 更新时间 | 文档主题 | 创建人 |
|--------|----------|----------|----------|--------|
| v1.1   | 2026-03-07 | 2026-03-08 | 表格组件规范 | Randy Luo |

---

## Purpose

Tables display structured data in rows and columns. Used extensively in BOMView, ProcessMhrLibrary, and Quotation Summary.

---

## When to Use

**DO use a table when:**
- Displaying material lists (BOM)
- Showing process routes
- Presenting cost breakdowns
- Comparing quotation data

**DO NOT use a table when:**
- Showing single data items (use Card)
- Displaying hierarchical data (use Tree)

---

## Shadcn UI Table Pattern

```tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

<Table>
  <TableHeader>
    <TableRow className="bg-slate-50 hover:bg-slate-50">
      <TableHead className="text-xs font-semibold text-slate-500">物料号</TableHead>
      <TableHead className="text-xs font-semibold text-slate-500 text-right">单价</TableHead>
      <TableHead className="text-xs font-semibold text-slate-500 text-center">状态</TableHead>
      <TableHead className="text-xs font-semibold text-slate-500 text-right">操作</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow className="hover:bg-slate-50/50">
      <TableCell className="p-2 font-mono">A356-T6</TableCell>
      <TableCell className="p-2 text-right font-mono">¥28.50</TableCell>
      <TableCell className="p-2 text-center">
        <div className="w-2 h-2 rounded-full bg-emerald-500 mx-auto" />
      </TableCell>
      <TableCell className="p-2 text-right">
        <Button variant="ghost" size="sm">编辑</Button>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>
```

---

## Table Styling Rules

### Header

```tsx
<TableRow className="bg-slate-50 hover:bg-slate-50">
  <TableHead className="text-xs font-semibold text-slate-500 p-2">
    Column Name
  </TableHead>
</TableRow>
```

**Rules:**
- Background: `bg-slate-50`
- Text: `text-xs font-semibold text-slate-500`
- Padding: `p-2` or `p-3` (compact)
- No hover effect on header

### Row

```tsx
<TableRow className="hover:bg-slate-50/50">
  <TableCell className="p-2">Data</TableCell>
</TableRow>
```

**Rules:**
- Default: `bg-white`
- Hover: `hover:bg-slate-50/50`
- Border bottom: automatic with Shadcn

### Status-based Row Backgrounds

```tsx
{/* 🟢 Verified - Matched */}
<TableRow className="bg-emerald-50 hover:bg-emerald-50/80">
  <TableCell className="p-2">A356-T6</TableCell>
</TableRow>

{/* 🟡 Warning - AI Matched */}
<TableRow className="bg-amber-50 hover:bg-amber-50/80">
  <TableCell className="p-2">UNKNOWN</TableCell>
</TableRow>

{/* 🔴 Missing - No Match */}
<TableRow className="bg-red-50 hover:bg-red-50/80">
  <TableCell className="p-2">MISSING</TableCell>
</TableRow>
```

---

## Column Alignment

| Content Type | Alignment | Class |
|--------------|-----------|--------|
| Text | Left | `text-left` (default) |
| Numbers | Right | `text-right` |
| Currency | Right | `text-right font-mono` |
| Percentages | Right | `text-right font-mono` |
| Status | Center | `text-center` |
| Actions | Right | `text-right` |

```tsx
<TableCell className="p-2 text-left">铝合金</TableCell>
<TableCell className="p-2 text-right font-mono">¥28.50</TableCell>
<TableCell className="p-2 text-center">
  <div className="w-2 h-2 rounded-full bg-emerald-500" />
</TableCell>
<TableCell className="p-2 text-right">120,000</TableCell>
```

---

## Status Indicators

### Dot Style (Compact)

```tsx
{/* 🟢 Verified */}
<div className="w-2 h-2 rounded-full bg-emerald-500" />

{/* 🟡 Warning */}
<div className="w-2 h-2 rounded-full bg-amber-500" />

{/* 🔴 Missing */}
<div className="w-2 h-2 rounded-full bg-red-500" />
```

### With Label

```tsx
<div className="flex items-center gap-2">
  <div className="w-2 h-2 rounded-full bg-emerald-500" />
  <span className="text-xs text-emerald-700">已匹配</span>
</div>
```

---

## Number Formatting

### Currency

```tsx
<TableCell className="p-2 text-right font-mono">¥1,234.56</TableCell>
<TableCell className="p-2 text-right font-mono">€21.76</TableCell>
```

### Thousands Separator

```tsx
<TableCell className="p-2 text-right font-mono">120,000</TableCell>
```

### Percentage

```tsx
{/* Positive */}
<TableCell className="p-2 text-right font-mono text-emerald-700">+5.2%</TableCell>

{/* Negative */}
<TableCell className="p-2 text-right font-mono text-red-700">-3.8%</TableCell>
```

---

## Action Buttons

### Inline Actions

```tsx
<TableCell className="p-2 text-right">
  <div className="flex justify-end gap-2">
    <Button variant="ghost" size="sm">编辑</Button>
    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">删除</Button>
  </div>
</TableCell>
```

### Icon Actions (Compact)

```tsx
<TableCell className="p-2 text-right">
  <div className="flex justify-end gap-1">
    <Button variant="ghost" size="icon" className="h-8 w-8">
      <Pencil className="h-4 w-4" />
    </Button>
    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600">
      <Trash2 className="h-4 w-4" />
    </Button>
  </div>
</TableCell>
```

---

## Empty State

```tsx
<TableBody>
  <TableRow>
    <TableCell colSpan={5} className="h-24 text-center">
      <div className="flex flex-col items-center justify-center text-slate-500">
        <span className="text-2xl mb-2">📭</span>
        <p className="text-sm">暂无物料数据</p>
      </div>
    </TableCell>
  </TableRow>
</TableBody>
```

---

## Loading State (Skeleton)

```tsx
<TableBody>
  {[...Array(5)].map((_, i) => (
    <TableRow key={i}>
      <TableCell className="p-2"><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell className="p-2"><Skeleton className="h-4 w-32" /></TableCell>
      <TableCell className="p-2"><Skeleton className="h-4 w-16" /></TableCell>
      <TableCell className="p-2"><Skeleton className="h-4 w-20" /></TableCell>
    </TableRow>
  ))}
</TableBody>
```

---

## Responsive Tables

### Mobile (< 768px)

**Option 1: Horizontal Scroll**

```tsx
<div className="overflow-x-auto">
  <Table>
    {/* Normal table */}
  </Table>
</div>
```

**Option 2: Card View**

```tsx
<div className="md:hidden space-y-3">
  {materials.map((mat) => (
    <Card key={mat.id} className="p-4">
      <div className="flex justify-between mb-2">
        <span className="font-mono text-sm">{mat.code}</span>
        <div className={`w-2 h-2 rounded-full ${getStatusColor(mat.status)}`} />
      </div>
      <div className="text-sm text-slate-600">
        <div>名称: {mat.name}</div>
        <div>单价: {mat.price}</div>
      </div>
    </Card>
  ))}
</div>
```

---

## Quick Reference

```
┌─────────────────────────────────────────────────────────┐
│  Table Quick Reference                                   │
├─────────────────────────────────────────────────────────┤
│  Header: bg-slate-50, text-xs font-semibold             │
│  Row: bg-white, hover:bg-slate-50/50                   │
│  Cell: p-2 (compact), p-3 (standard)                    │
│                                                         │
│  Status Rows:                                            │
│    🟢 Verified: bg-emerald-50                            │
│    🟡 Warning:   bg-amber-50                             │
│    🔴 Missing:   bg-red-50                               │
│                                                         │
│  Alignment:                                              │
│    Text: left (default)                                 │
│    Numbers: right + font-mono                            │
│    Status: center                                       │
│    Actions: right                                       │
│                                                         │
│  Status Dot: w-2 h-2 rounded-full                        │
│    🟢 bg-emerald-500                                    │
│    🟡 bg-amber-500                                      │
│    🔴 bg-red-500                                        │
│                                                         │
│  Numbers: tabular-nums, comma separators               │
│    Currency: ¥1,234.56                                  │
│    Percent: +5.2% (emerald), -3.8% (red)                │
└─────────────────────────────────────────────────────────┘
```

---

## Figma Make Prompt

```
Data Table for Dr.aiVOSS BOM Management:

Header:
- Background: Slate-50 (#f8fafc)
- Text: 12px (text-xs), semibold, slate-500
- Padding: 12px

Row:
- Background: White (#ffffff)
- Hover: Slate-50 (#f8fafc) with 50% opacity
- Padding: 8px (p-2) for compact, 12px (p-3) for standard
- Border bottom: 1px Slate-200 (#e2e8f0)

Status Rows:
- 🟢 Verified: Emerald-50 (#ecfdf5) background
- 🟡 Warning: Amber-50 (#fffbeb) background
- 🔴 Missing: Red-50 (#fef2f2) background

Status Dot:
- 8px (w-2 h-2), rounded-full
- Colors: Emerald-500, Amber-500, Red-500

Columns:
- Material Code: left align, 120px, monospace font
- Name: left align, 200px
- Quantity: right align, 100px, monospace
- Unit Price: right align, 100px, monospace
- Status: center align, 80px
- Actions: right align, 100px

Numbers:
- Use comma separators (120,000)
- Currency prefix (¥28.50)
- Percentage with color (+5.2% green, -3.8% red)
```
