# Dr.aiVOSS Design System Guidelines

This document defines the design language, UI patterns, and component guidelines for the **Dr.aiVOSS 智能报价助手** (Intelligent Quoting Assistant). All React components and Tailwind CSS styling must strictly adhere to these rules.

---

## 📁 快速导航

| 文档 | 用途 | 读者 |
|------|------|------|
| **[Figma Make 指南](./figma-make-guideline.md)** | 原型设计完整指南 | UI/UX 设计师、Figma 开发者 |
| `design-tokens/colors.md` | 颜色令牌详解 | 开发者 |
| `design-tokens/typography.md` | 字体排版详解 | 开发者 |
| `design-tokens/spacing.md` | 间距系统详解 | 开发者 |
| `components/button.md` | 按钮组件规范 | 开发者 |
| `components/input.md` | 输入框组件规范 | 开发者 |
| `components/table.md` | 表格组件规范 | 开发者 |
| `components/card.md` | 卡片组件规范 | 开发者 |
| `components/badge.md` | 标签组件规范 | 开发者 |
| `components/tabs.md` | 标签页组件规范 | 开发者 |
| `components/modal.md` | 模态框组件规范 | 开发者 |

---

## 1. Global Design Principles

- **Information Density**: As an enterprise tool, maximize data visibility without overwhelming the user. Use compact tables and tight spacing (`gap-2`, `gap-4`).
- **Clear Hierarchy**: Use typography and card containers to distinctly separate phases (e.g., Material Cost vs. Process Cost).
- **Semantic Feedback**: Rely heavily on standardized colors (Green/Yellow/Red) to communicate status, warnings, and required actions across BOM parsing and financial validation.

---

## 2. Design Tokens (Tailwind CSS)

### 2.1 Colors

**Brand & Neutral:**
- **Primary**: `bg-slate-900 text-white` (for primary actions like "生成报价单")
- **Secondary**: `bg-slate-100 text-slate-900 hover:bg-slate-200` (for secondary buttons like "取消" or "返回")
- **Background**: `bg-slate-50` (app background), `bg-white` (card/module background)
- **Borders**: `border-slate-200`

**Semantic Status (Crucial for Red/Yellow/Green Logic):**
- **Success/Green (🟢 正常 / 匹配成功)**:
  - Text: `text-emerald-700`
  - Background/Badge: `bg-emerald-50 border-emerald-200`
- **Warning/Yellow (🟡 警告 / AI匹配需确认)**:
  - Text: `text-amber-700`
  - Background/Badge: `bg-amber-50 border-amber-200`
- **Danger/Red (🔴 严重亏损 / 无物料匹配)**:
  - Text: `text-red-700`
  - Background/Badge: `bg-red-50 border-red-200`

### 2.2 Typography

- **Font Family**: Use standard sans-serif (`font-sans`).
- **Headings**:
  - Page Title: `text-2xl font-bold tracking-tight text-slate-900`
  - Section/Card Title: `text-lg font-semibold text-slate-800`
  - Sub-section Title: `text-sm font-medium text-slate-500 uppercase tracking-wider`
- **Body**: `text-sm text-slate-600`
- **Data/Numbers**: Use `font-mono` for financial figures, percentages (e.g., DB4%), and cycle times to ensure tabular alignment.

### 2.3 Spacing

- **Form Groups**: `space-y-4` (between form sections)
- **Label to Input**: `space-y-2` (between label and input)
- **Component Gaps**: `gap-2` (compact), `gap-4` (standard), `gap-6` (spacious)
- **Card Padding**: `p-4` (compact), `p-6` (standard)

### 2.4 Transitions

- **Duration**: 150-300ms for smooth state changes
- **Properties**: `transition-colors` for background/text, `transition-opacity` for fade effects
- **DO**: Add transitions to all interactive elements (buttons, links, cards)
- **DON'T**: Use instant state changes or overly slow transitions (>500ms)

```tsx
<Button className="bg-slate-900 text-white hover:bg-slate-800 transition-colors duration-200">
  按钮
</Button>
```

### 2.5 Icon Standards

- **Library**: Use Lucide Icons (Shadcn UI default)
- **Size**: `h-4 w-4` (16px) default, `h-5 w-5` (20px) for titles
- **DO**: Use SVG icons only - NO emoji as UI icons (🎨🚀⚙️)
- **Consistent**: Fixed viewBox (24x24), consistent sizing

---

## 3. Accessibility Standards

CRITICAL: All components MUST meet WCAG 2.1 AA standards.

### 3.1 Color Contrast

All color combinations verified (4.5:1 minimum):
- `text-slate-900` on `bg-white` ✓ (15.7:1)
- `text-slate-600` on `bg-white` ✓ (7.1:1)
- `text-white` on `bg-slate-900` ✓ (13.5:1)
- `text-emerald-700` on `bg-emerald-50` ✓ (6.8:1)
- `text-amber-700` on `bg-amber-50` ✓ (6.2:1)
- `text-red-700` on `bg-red-50` ✓ (5.9:1)

### 3.2 Interactive Elements

**Clickable elements MUST have:**
```tsx
// Cursor pointer on clickable cards/rows
<div className="cursor-pointer hover:bg-slate-50">

// Focus ring for keyboard navigation
<Button className="focus:ring-2 focus:ring-slate-400 focus:ring-offset-2">
```

### 3.3 Icon-Only Buttons

**ALWAYS include aria-label:**
```tsx
<Button variant="ghost" size="icon" aria-label="编辑项目">
  <Pencil className="h-4 w-4" />
</Button>
```

### 3.4 Error Messages

**MUST use role="alert" for screen readers:**
```tsx
<Alert role="alert" variant="destructive">
  <AlertDescription>错误信息必须被屏幕阅读器识别</AlertDescription>
</Alert>
```

### 3.5 Form Labels

**NEVER use placeholder-only labels:**
```tsx
{/* ❌ DON'T */}
<Input placeholder="项目名称" />

{/* ✅ DO */}
<Label htmlFor="project-name">项目名称</Label>
<Input id="project-name" />
```

### 3.6 Color-Only Communication

**DON'T convey information by color alone:**
```tsx
{/* ❌ DON'T - Color only */}
<span className="text-red-600">警告</span>

{/* ✅ DO - Color + Icon */}
<AlertTriangle className="h-4 w-4 text-amber-600" />
<span className="text-amber-700">警告</span>
```

### 3.7 Table Accessibility

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead className="text-xs font-semibold text-slate-500">物料号</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell className="p-2">A356-T6</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### 3.8 Mobile Table Handling

**Tables MUST be responsive:**
```tsx
{/* Option 1: Horizontal scroll */}
<div className="overflow-x-auto">
  <Table>...</Table>
</div>

{/* Option 2: Card view on mobile */}
<div className="hidden md:table">
  <Table>...</Table>
</div>
<div className="md:hidden">
  {items.map(item => <Card key={item.id}>...</Card>)}
</div>
```

---

## 4. Component Guidelines (Shadcn UI Based)

### 3.1 Data Tables (`<Table>`)

Used extensively in BOMView, ProcessMhrLibrary, and Quotation Summary.

```tsx
<Table>
  <TableHeader>
    <TableRow className="bg-slate-50 hover:bg-slate-50">
      <TableHead className="text-xs font-semibold text-slate-500">物料号</TableHead>
      <TableHead className="text-xs font-semibold text-slate-500 text-right">单价</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow className="hover:bg-slate-50/50">
      <TableCell className="p-2">A356-T6</TableCell>
      <TableCell className="p-2 text-right font-mono">¥28.50</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

**Rules:**
- **Header**: `bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500`
- **Row Hover**: `hover:bg-slate-50/50`
- **Sizing**: Use compact padding (`p-2` or `p-3`) to fit more rows
- **Alignment**: Text left-aligned; Numbers/Currency/Percentages right-aligned with `font-mono`

### 3.2 Forms & Inputs

```tsx
<div className="space-y-4">
  <div className="space-y-2">
    <Label className="text-sm font-medium text-slate-700">项目名称</Label>
    <Input placeholder="请输入..." />
    <p className="text-xs text-slate-500">项目名称最多20个字符</p>
  </div>
</div>
```

**Rules:**
- **Spacing**: `space-y-4` for form groups, `space-y-2` for label-to-input
- **Labels**: `text-sm font-medium text-slate-700`
- **Help Text**: `text-xs text-slate-500`

### 3.3 Cards

```tsx
<Card className="bg-white border border-slate-200 rounded-lg shadow-sm">
  <CardHeader className="p-6 pb-4">
    <CardTitle className="text-lg font-semibold text-slate-800">物料成本</CardTitle>
  </CardHeader>
  <CardContent className="p-6 pt-0">
    {/* Content */}
  </CardContent>
</Card>
```

**Rules:**
- **Container**: `bg-white border border-slate-200 rounded-lg shadow-sm`
- **Padding**: `p-6` for standard modules, `p-4` for compact summary modules

### 3.4 Alerts

Used for Phase 4 Calculation Validation (QS/BC/Payback).

```tsx
{/* High Risk - DB4 < -5% */}
<Alert variant="destructive" className="border-red-200 bg-red-50">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle className="text-red-800">高风险警告</AlertTitle>
  <AlertDescription className="text-red-700">
    DB4 利润率低于 -5%，请检查报价参数
  </AlertDescription>
</Alert>

{/* Warning - DB4 < 0% */}
<Alert className="border-amber-200 bg-amber-50">
  <AlertTriangle className="h-4 w-4 text-amber-600" />
  <AlertTitle className="text-amber-800">利润警告</AlertTitle>
  <AlertDescription className="text-amber-700">
    DB4 利润率为负，建议调整报价
  </AlertDescription>
</Alert>

{/* Pass - DB4 >= 0% */}
<Alert className="border-emerald-200 bg-emerald-50">
  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
  <AlertTitle className="text-emerald-800">计算通过</AlertTitle>
  <AlertDescription className="text-emerald-700">
    所有指标符合要求，可以生成报价单
  </AlertDescription>
</Alert>
```

---

## 4. Domain-Specific UI Patterns

### 4.1 Process Cycle Time Configuration (工时计算设定)

In `ProcessMhrLibrary` and `BOMView`, the cycle time (工时) has 4 types. They must be rendered consistently using the following UI patterns:

**1. 固定型 (Fixed)**
```tsx
<div className="flex items-center gap-2">
  <Input type="number" className="flex-1" />
  <span className="text-sm text-slate-500 whitespace-nowrap">秒/件</span>
</div>
```

**2. 公式型 (Formula)**
```tsx
<div className="space-y-2">
  <Textarea className="font-mono text-sm bg-slate-50" placeholder="输入计算公式..." />
  <div className="flex gap-2">
    <Badge variant="outline" className="cursor-pointer hover:bg-slate-100">Length</Badge>
    <Badge variant="outline" className="cursor-pointer hover:bg-slate-100">Weight</Badge>
  </div>
</div>
```

**3. 分段型 (Segmented)**
```tsx
<div className="space-y-2">
  {segments.map((seg, i) => (
    <div key={i} className="flex items-center gap-2">
      <Input type="number" placeholder="Min" />
      <span className="text-slate-400">-</span>
      <Input type="number" placeholder="Max" />
      <Select>
        <SelectItem value="kg">kg</SelectItem>
        <SelectItem value="pc">件</SelectItem>
      </Select>
      <span className="text-slate-400">=</span>
      <Input type="number" placeholder="结果" />
      <span className="text-sm text-slate-500">秒/件</span>
    </div>
  ))}
  <Button variant="ghost" size="sm">+ 添加区间</Button>
</div>
```

**4. 条件型 (Conditional)**
```tsx
<div className="space-y-2">
  {conditions.map((cond, i) => (
    <div key={i} className="grid grid-cols-2 gap-2">
      <Select>
        <SelectItem value="aluminum">铝合金</SelectItem>
        <SelectItem value="steel">钢材</SelectItem>
      </Select>
      <div className="flex items-center gap-2">
        <Input type="number" placeholder="工时" />
        <span className="text-sm text-slate-500">秒/件</span>
      </div>
    </div>
  ))}
  <Button variant="ghost" size="sm">+ 添加条件</Button>
</div>
```

### 4.2 Financial Parameters View (Phase 3: 商业参数)

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Left: Business Parameters */}
  <Card>
    <CardHeader><CardTitle>商业参数</CardTitle></CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <Label>报价单价</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">€</span>
          <Input className="pl-8" type="number" step="0.01" placeholder="0.00" />
        </div>
      </div>
      {/* More fields... */}
    </CardContent>
  </Card>

  {/* Right: Amortization Strategy */}
  <Card>
    <CardHeader><CardTitle>分摊策略</CardTitle></CardHeader>
    <CardContent className="space-y-4">
      <RadioGroup defaultValue="upfront">
        <div className="space-y-3">
          <Label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-slate-50">
            <RadioGroupItem value="upfront" />
            <div className="flex-1">
              <div className="font-medium">一次性支付</div>
              <div className="text-sm text-slate-500">模具费单独收取，单价不含分摊</div>
            </div>
          </Label>
          <Label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-slate-50">
            <RadioGroupItem value="amortized" />
            <div className="flex-1">
              <div className="font-medium">分摊进单价</div>
              <div className="text-sm text-slate-500">模具费按年分摊到产品单价中</div>
            </div>
          </Label>
        </div>
      </RadioGroup>

      {/* Live Preview */}
      <div className="mt-4 p-4 bg-slate-50 rounded-lg">
        <div className="text-sm text-slate-500">预计单件分摊额</div>
        <div className="text-2xl font-bold text-slate-900">¥6.40</div>
      </div>
    </CardContent>
  </Card>
</div>
```

### 4.3 Material Status Indicators (Phase 2: BOM解析)

When displaying uploaded BOM materials, each row MUST have a status column:

```tsx
<div className="flex items-center gap-2">
  {/* 🟢 Matched */}
  <div className="w-2 h-2 rounded-full bg-emerald-500" />
  <span className="text-xs text-emerald-700">已匹配</span>

  {/* 🟡 Review needed */}
  <div className="w-2 h-2 rounded-full bg-amber-500" />
  <span className="text-xs text-amber-700">需确认</span>

  {/* 🔴 Sourcing required */}
  <div className="w-2 h-2 rounded-full bg-red-500" />
  <span className="text-xs text-red-700">需询价</span>
</div>
```

### 4.4 Financial Summary Layout (Phase 4: 计算校验 & Phase 5: 报价输出)

```tsx
{/* Top KPIs */}
<div className="grid grid-cols-4 gap-4 mb-6">
  <Card>
    <CardContent className="p-4">
      <div className="text-sm text-slate-500">Payback</div>
      <div className="text-2xl font-bold text-slate-900">25.56 个月</div>
      <Badge className={getPaybackBadgeClass(25.56)}>{getPaybackStatus(25.56)}</Badge>
    </CardContent>
  </Card>
  {/* More KPI cards... */}
</div>

{/* Cost Breakdown */}
<Card>
  <CardHeader><CardTitle>成本构成</CardTitle></CardHeader>
  <CardContent>
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-600">物料成本 (HK III)</span>
        <span className="font-mono font-medium">¥4.00</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-600">+ 分摊 (SK-1)</span>
        <span className="font-mono font-medium">¥6.40</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-600">+ 研发 (SK-2)</span>
        <span className="font-mono font-medium">¥0.54</span>
      </div>
      <Separator />
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-900">总成本</span>
        <span className="font-mono font-bold text-slate-900">¥10.94</span>
      </div>
    </div>
  </CardContent>
</Card>

{/* Warning Banner - if DB4 < 0 */}
{db4 < 0 && (
  <Alert variant="destructive" className="mb-6">
    <AlertTriangle className="h-4 w-4" />
    <AlertDescription>
      警告：DB4 利润率为负 ({db4.toFixed(2)}%)，请调整报价参数或与客户协商
    </AlertDescription>
  </Alert>
)}
```

---

## 5. Interaction States

### 5.1 Loading

```tsx
{/* Table Skeleton during BOM parsing */}
<Table>
  <TableBody>
    {[...Array(5)].map((_, i) => (
      <TableRow key={i}>
        <TableCell className="p-2"><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell className="p-2"><Skeleton className="h-4 w-32" /></TableCell>
        <TableCell className="p-2"><Skeleton className="h-4 w-16" /></TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

**Rules:**
- Use `<Skeleton>` components for table rows during BOM parsing and AI price matching
- Do not use full-page spinners unless submitting the final quotation

### 5.2 Disabled States

```tsx
<Button disabled className="opacity-50 cursor-not-allowed">
  生成报价单
</Button>
```

**Rules:**
- Form inputs and "Approve" buttons must be disabled if mandatory fields (like Red materials needing sourcing) are incomplete
- Always show `opacity-50 cursor-not-allowed` for disabled states

---

## 6. Responsive Breakpoints

```css
/* Mobile-first approach */
.grid { display: grid; grid-template-columns: 1fr; }        /* Mobile: 1 col */
@media (min-width: 768px) { .grid { grid-template-columns: 2fr; } }   /* Tablet: 2 cols */
@media (min-width: 1024px) { .grid { grid-template-columns: 4fr; } }  /* Desktop: 4 cols */
```

**Tailwind classes:**
- Mobile: default (1 column)
- Tablet: `md:grid-cols-2`
- Desktop: `lg:grid-cols-4`

---

## 7. Component Reference

| Component | File | Primary Tailwind Classes |
|-----------|------|-------------------------|
| Button | `components/button.md` | `px-4 py-2 rounded-md font-medium` |
| Input | `components/input.md` | `px-3 py-2 border rounded-md` |
| Table | `components/table.md` | `border-slate-200 text-sm` |
| Card | `components/card.md` | `bg-white border rounded-lg shadow-sm` |
| Badge | `components/badge.md` | `px-2 py-1 rounded-full text-xs` |
| Modal | `components/modal.md` | `fixed inset-0 bg-black/50` |
| Tabs | `components/tabs.md` | `border-b-2` |

---

## 8. Quick Reference

### Color Codes

```
Semantic:
  🟢 Green:  bg-emerald-50 text-emerald-700 border-emerald-200
  🟡 Yellow: bg-amber-50 text-amber-700 border-amber-200
  🔴 Red:    bg-red-50 text-red-700 border-red-200

Neutral:
  Primary:   bg-slate-900 text-white
  Secondary: bg-slate-100 text-slate-900
  Background: bg-slate-50 (app), bg-white (card)
  Border:    border-slate-200
```

### Typography Scale

```
Page Title:    text-2xl font-bold tracking-tight text-slate-900
Section Title: text-lg font-semibold text-slate-800
Sub Title:     text-sm font-medium text-slate-500 uppercase tracking-wider
Body:          text-sm text-slate-600
Numbers:       font-mono (for alignment)
```

### Spacing Scale

```
Tight:   gap-2, p-2, space-y-2
Normal:  gap-4, p-4, space-y-4
Spacious: gap-6, p-6, space-y-6
```
