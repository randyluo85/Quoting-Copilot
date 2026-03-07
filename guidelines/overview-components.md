# Component Overview

| 版本号 | 创建时间 | 更新时间 | 文档主题 | 创建人 |
|--------|----------|----------|----------|--------|
| v1.0   | 2026-03-07 | 2026-03-07 | 组件概览指南 | Randy Luo |

---

## Component Library

Dr.aiVOSS uses a component-based design system. All components are built on **ShadcnUI** primitives with custom styling for manufacturing B2B needs.

### Component Categories

1. **Navigation** - Sidebar, Top Bar, Breadcrumbs, Tabs
2. **Data Display** - Table, Card, Badge, Progress
3. **Form Elements** - Input, Select, Checkbox, Radio, Textarea
4. **Feedback** - Modal, Alert, Toast, Loading
5. **Actions** - Button, Button Group, Dropdown

---

## When to Use Each Component

### Button

**Use when:** You need a clickable action element.

**Variants:**
- Primary - Main page-level actions ("创建项目", "保存")
- Secondary - Alternative actions ("取消", "重置")
- Destructive - Dangerous actions ("删除", "移除")
- Ghost - Less prominent actions ("编辑", "查看")

**See:** `components/button.md`

---

### Input

**Use when:** You need to collect text or numeric data.

**Types:**
- Text input - Short text ("项目名称")
- Number input - Numeric values ("年量", "单价")
- Currency input - Money values ("目标价")
- Textarea - Long text ("备注", "评估")

**See:** `components/input.md`

---

### Table

**Use when:** Displaying structured, sortable data.

**Best for:**
- Material lists (BOM)
- Process routes
- Cost breakdowns
- Quotation summaries

**NOT for:**
- Single data items (use Card)
- Hierarchical data (use Tree)

**See:** `components/table.md`

---

### Card

**Use when:** Grouping related content.

**Best for:**
- Project summaries
- Cost overview tiles
- Statistics displays
- Form sections

**See:** `components/card.md`

---

### Badge

**Use when:** Showing status or category.

**Traffic Light Colors:**
- 🟢 Green (#10b981) - Verified, completed
- 🟡 Yellow (#f59e0b) - Warning, pending review
- 🔴 Red (#ef4444) - Missing, error

**DO NOT** use other colors for status indicators.

**See:** `components/badge.md`

---

### Modal

**Use when:** Requiring user attention or input.

**Best for:**
- Forms ("创建项目")
- Confirmations ("删除确认")
- Details ("项目详情")

**NOT for:**
- Information only (use Alert/Tooltip)
- Navigation (use Sidebar/Tabs)

**See:** `components/modal.md`

---

### Tabs

**Use when:** Organizing related content sections.

**Best for:**
- BOM Management (7 tabs: 物料/工艺/投资/采购/成本/报价/导出)
- Switching between views
- Page-level navigation

**NOT for:**
- Independent pages (use Sidebar)
- Single item selection (use Radio)

**See:** `components/tabs.md`

---

## Component Composition Patterns

### Pattern 1: Data Table with Actions

```
┌────────────────────────────────────────────────────┐
│  Table Controls (Filter + Search + Add Button)    │
├────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────┐ │
│  │ Table Header (Sortable columns)              │ │
│  ├──────────────────────────────────────────────┤ │
│  │ Row 1 │ Data │ Data │ Status │ [Edit][Del] │ │
│  │ Row 2 │ Data │ Data │ Status │ [Edit][Del] │ │
│  └──────────────────────────────────────────────┘ │
│  Pagination Controls                              │
└────────────────────────────────────────────────────┘
```

### Pattern 2: Form in Modal

```
┌────────────────────────────────────────┐
│  Modal Header: "创建项目"    [X]       │
├────────────────────────────────────────┤
│  ┌──────────────────────────────────┐  │
│  │ Required Section                │  │
│  │ - Field 1 *                      │  │
│  │ - Field 2 *                      │  │
│  ├──────────────────────────────────┤  │
│  │ Optional Section                │  │
│  │ - Field 3                        │  │
│  │ - Field 4                        │  │
│  └──────────────────────────────────┘  │
├────────────────────────────────────────┤
│  [取消]                    [创建项目 →]  │
└────────────────────────────────────────┘
```

### Pattern 3: Dashboard Card Grid

```
┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
│  Project   │ │  Project   │ │  Project   │ │  Project   │
│  Card      │ │  Card      │ │  Card      │ │  Card      │
│            │ │            │ │            │ │            │
│  Title     │ │  Title     │ │  Title     │ │  Title     │
│  Status ✓  │ │  Status △  │ │  Status ⚠  │ │  Status ✓  │
│  120,000   │ │  50,000    │ │  80,000    │ │  200,000   │
│            │ │            │ │            │ │            │
└────────────┘ └────────────┘ └────────────┘ └────────────┘
```

---

## Component Hierarchy

```
Page
├── Sidebar (Navigation)
├── Top Bar (Search + User)
└── Content Area
    ├── Page Header (Title + Actions)
    ├── Filters
    ├── Data Display
    │   ├── Table
    │   ├── Card
    │   └── Badge
    └── Pagination
```

---

## State Variants

Each component supports these states:

| State | Description | Visual Treatment |
|-------|-------------|------------------|
| Default | Normal state | Base styling |
| Hover | Mouse over | Darken 10% |
| Focus | Keyboard focus | Blue ring outline |
| Active | Currently active | Primary color |
| Disabled | Not available | 50% opacity |
| Error | Validation error | Red border + text |
| Loading | Data loading | Spinner |

---

## Accessibility Requirements

All components MUST:

1. Support keyboard navigation (Tab, Enter, Escape)
2. Have visible focus indicators
3. Include proper ARIA labels
4. Announce state changes to screen readers
5. Meet WCAG 2.1 AA contrast requirements

---

## Quick Reference

| Component | File | Primary Use |
|-----------|------|-------------|
| Button | `components/button.md` | Actions |
| Input | `components/input.md` | Data entry |
| Select | `components/select.md` | Options |
| Table | `components/table.md` | Data lists |
| Card | `components/card.md` | Content grouping |
| Badge | `components/badge.md` | Status labels |
| Modal | `components/modal.md` | Overlays |
| Tabs | `components/tabs.md` | Content sections |
| Alert | `components/alert.md` | Messages |
| Toast | `components/toast.md` | Notifications |

---

## Component Usage Guidelines

### DO

- Use components as defined
- Follow established patterns
- Maintain consistent spacing
- Test keyboard navigation
- Check color contrast

### DON'T

- Create custom button styles
- Mix component variants arbitrarily
- Skip hover/focus states
- Use non-standard spacing
- Ignore accessibility

---

## Related Documentation

- `Guidelines.md` - Overall design system
- `design-tokens/colors.md` - Color specifications
- `design-tokens/typography.md` - Font specifications
- `design-tokens/spacing.md` - Spacing scale
