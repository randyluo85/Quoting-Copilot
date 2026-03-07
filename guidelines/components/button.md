# Button Component

| 版本号 | 创建时间 | 更新时间 | 文档主题 | 创建人 |
|--------|----------|----------|----------|--------|
| v1.1   | 2026-03-07 | 2026-03-08 | 按钮组件规范 | Randy Luo |

---

## Purpose

Buttons trigger actions or navigate to new locations. They are the primary way users interact with the system.

---

## When to Use

**DO use a button when:**
- Submitting a form ("创建项目", "保存")
- Triggering an action ("重新计算", "导出")
- Opening a modal ("添加物料", "编辑项目")
- Navigating to a new page

**DO NOT use a button when:**
- Displaying information (use text or badge)
- Linking to external sites (use a link with button styling)

---

## Variants

### Primary Button

Main action on a page. Each page or section should have only ONE primary button.

```tsx
import { Button } from "@/components/ui/button";

<Button className="bg-slate-900 text-white hover:bg-slate-800">
  创建项目
</Button>
```

**Styling:**
- Background: `bg-slate-900`
- Text: `text-white`
- Padding: `px-4 py-2`
- Radius: `rounded-md`
- Hover: `hover:bg-slate-800`

**Use for:**
- Main form submit
- Primary page action
- "生成报价单"

---

### Secondary Button

Alternative actions that are less important than the primary action.

```tsx
<Button className="bg-slate-100 text-slate-900 hover:bg-slate-200">
  取消
</Button>
```

**Styling:**
- Background: `bg-slate-100`
- Text: `text-slate-900`
- Hover: `hover:bg-slate-200`

**Use for:**
- Cancel actions
- Go back
- "返回", "重置"

---

### Destructive Button

Dangerous or irreversible actions.

```tsx
<Button className="bg-red-600 text-white hover:bg-red-700">
  删除
</Button>
```

**Styling:**
- Background: `bg-red-600`
- Text: `text-white`
- Hover: `hover:bg-red-700`

**Use for:**
- Delete actions
- "删除项目", "移除"

**DO NOT use for:**
- Navigation
- Normal form actions

---

### Ghost Button

Low-emphasis actions.

```tsx
<Button variant="ghost">
  编辑
</Button>

<Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100">
  编辑
</Button>
```

**Styling:**
- Background: transparent
- Hover: `hover:bg-slate-100`
- Text: `text-slate-700`

**Use for:**
- Edit actions in tables
- View details
- Minor operations

---

### Icon Button

Buttons with only an icon.

```tsx
<Button variant="ghost" size="icon" className="h-8 w-8">
  <Pencil className="h-4 w-4" />
</Button>
```

**ALWAYS include** `aria-label` for screen readers:

```tsx
<Button variant="ghost" size="icon" aria-label="编辑">
  <Pencil className="h-4 w-4" />
</Button>
```

---

## Sizes

| Size | Padding | Font | Icon | Usage |
|------|---------|------|------|-------|
| Small (sm) | 8px 12px | 14px | 16px | Compact areas, tables |
| Medium (default) | 12px 16px | 14px | 18px | Most cases |
| Large (lg) | 16px 24px | 16px | 20px | Prominent CTAs |

```tsx
<Button size="sm">Small Button</Button>
<Button size="default">Default Button</Button>
<Button size="lg">Large Button</Button>
```

---

## States

| State | Class | Example |
|-------|-------|---------|
| Default | Base classes | Normal appearance |
| Hover | `hover:bg-slate-800` (primary) | Mouse over |
| Focus | `focus:ring-2 focus:ring-slate-400` | Keyboard navigation |
| Active | `active:scale-95` | Being clicked |
| Disabled | `disabled:opacity-50 disabled:cursor-not-allowed` | Form not valid |

```tsx
{/* Default */}
<Button>Default</Button>

{/* Hover */}
<Button className="hover:bg-slate-800">Hover</Button>

{/* Focus */}
<Button className="focus:ring-2 focus:ring-slate-400 focus:ring-offset-2">Focus</Button>

{/* Disabled */}
<Button disabled className="opacity-50 cursor-not-allowed">Disabled</Button>
```

---

## Button Groups

Related buttons should be grouped with consistent spacing.

```tsx
<div className="flex gap-2">
  <Button className="bg-slate-900 text-white">确认</Button>
  <Button className="bg-slate-100 text-slate-900">取消</Button>
</div>
```

**Spacing: `gap-2` (8px) between buttons**

---

## Text in Buttons

DO follow these rules:

1. **Use verbs** - "创建项目" not "项目创建"
2. **Be specific** - "保存草稿" not "保存"
3. **Show outcome** - "导出 PDF" not "导出"
4. **Keep short** - Maximum 4 Chinese characters

**Good Examples:**
- ✓ "创建项目"
- ✓ "保存草稿"
- ✓ "删除项目"
- ✓ "生成报价单"

**Bad Examples:**
- ✗ "项目创建"
- ✗ "保存" (ambiguous)
- ✗ "执行删除操作"

---

## Button Placement

### Forms

```
┌─────────────────────────────────────┐
│  Form content...                    │
│                                     │
│  [Cancel]              [Submit →]    │
└─────────────────────────────────────┘
```

- Left: Secondary/Cancel action
- Right: Primary action
- Center: Single action

### Tables

```
┌─────────────────────────────────────────────────────┐
│  [Filter] [Search]      [+ Add]    [Export]       │
└─────────────────────────────────────────────────────┘
```

- Left: Context actions
- Right: Primary actions

---

## Loading State

```tsx
<Button disabled className="opacity-50 cursor-not-allowed">
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  处理中...
</Button>
```

---

## Accessibility

Buttons MUST:

1. Have visible text or `aria-label`
2. Support keyboard navigation (Tab, Enter, Space)
3. Show focus state clearly
4. Indicate disabled state properly

```tsx
{/* Good: Text button */}
<Button>创建项目</Button>

{/* Good: Icon with label */}
<Button aria-label="编辑项目">
  <Pencil className="h-4 w-4" />
</Button>

{/* Good: Loading state */}
<Button disabled aria-busy="true">
  <Loader2 className="animate-spin mr-2 h-4 w-4" />
  处理中...
</Button>
```

---

## Quick Reference

```
┌─────────────────────────────────────────────────────────┐
│  Button Quick Reference                                  │
├─────────────────────────────────────────────────────────┤
│  Primary:   bg-slate-900 text-white                    │
│             hover:bg-slate-800                           │
│  Secondary: bg-slate-100 text-slate-900                │
│             hover:bg-slate-200                           │
│  Destructive: bg-red-600 text-white                    │
│             hover:bg-red-700                             │
│  Ghost:     transparent bg, text-slate-700             │
│             hover:bg-slate-100                           │
│                                                         │
│  Padding:    px-4 py-2 (medium)                         │
│  Radius:     rounded-md                                 │
│  Gap (group): gap-2                                    │
│                                                         │
│  States: default → hover → focus → active              │
│           ↓ disabled (50% opacity)                     │
│                                                         │
│  Text: Verbs, specific, short                          │
│        ✓ "创建项目"  ✗ "项目创建"                      │
│                                                         │
│  Icons: 16px in medium buttons                          │
│         Always include aria-label                      │
└─────────────────────────────────────────────────────────┘
```

---

## Figma Make Prompt

```
Button for Dr.aiVOSS:

Primary:
- Background: Slate-900 (#0f172a)
- Text: White
- Hover: Slate-800 (#1e293b)
- Padding: 12px 16px (px-4 py-2)
- Radius: 6px (rounded-md)

Secondary:
- Background: Slate-100 (#f1f5f9)
- Text: Slate-900 (#0f172a)
- Hover: Slate-200 (#e2e8f0)
- Same padding and radius

Destructive:
- Background: Red-600 (#dc2626)
- Text: White
- Hover: Red-700 (#b91c1c)

States:
- Disabled: 50% opacity, not-allowed cursor
- Focus: 2px ring, Slate-400 (#94a3b8)
- Loading: Spinner + "处理中..." text

Text:
- Verbs only: "创建项目" not "项目创建"
- Maximum 4 Chinese characters
- Be specific: "保存草稿" not "保存"
```
