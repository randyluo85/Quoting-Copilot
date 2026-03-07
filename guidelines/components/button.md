# Button Component

| 版本号 | 创建时间 | 更新时间 | 文档主题 | 创建人 |
|--------|----------|----------|----------|--------|
| v1.0   | 2026-03-07 | 2026-03-07 | 按钮组件规范 | Randy Luo |

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
- Canceling an operation

**DO NOT use a button when:**
- Displaying information (use text or badge)
- Linking to external sites (use a link with button styling)
- Selecting from options (use radio or select)

---

## Variants

### Primary Button

The main action on a page. Each page or section should have only ONE primary button.

```html
<button class="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90">
  创建项目
</button>
```

**Styling:**
- Background: `#3b82f6` (primary blue)
- Text: `#ffffff` (white)
- Padding: 12px 16px (px-4 py-3)
- Border radius: 6px (rounded-md)
- Hover: 90% opacity

**Use for:**
- Main form submit
- Primary page action
- Call-to-action

---

### Secondary Button

Alternative actions that are less important than the primary action.

```html
<button class="bg-secondary text-white px-4 py-2 rounded-md hover:bg-secondary/90">
  取消
</button>
```

**Styling:**
- Background: `#64748b` (gray)
- Text: `#ffffff` (white)
- Same padding and radius as primary

**Use for:**
- Cancel actions
- Go back
- Alternative options

---

### Destructive Button

Dangerous or irreversible actions.

```html
<button class="bg-destructive text-white px-4 py-2 rounded-md hover:bg-destructive/90">
  删除
</button>
```

**Styling:**
- Background: `#ef4444` (red)
- Text: `#ffffff` (white)
- Same padding and radius as primary

**Use for:**
- Delete actions
- Remove operations
- Cancel subscriptions

**DO NOT** use for:
- Navigation
- Normal form actions
- Non-destructive operations

---

### Ghost Button

Low-emphasis actions that don't need visual weight.

```html
<button class="text-slate-700 hover:bg-slate-100 px-4 py-2 rounded-md">
  编辑
</button>
```

**Styling:**
- Background: transparent
- Text: `#334155` (slate-700)
- Hover background: `#f1f5f9` (slate-100)

**Use for:**
- Edit actions in tables
- View details
- Minor operations

---

### Icon Button

Buttons with only an icon, no text. Include a tooltip for accessibility.

```html
<button class="p-2 hover:bg-slate-100 rounded-md" aria-label="Edit">
  <EditIcon class="w-4 h-4" />
</button>
```

**Styling:**
- Padding: 8px (p-2)
- Hover background: `#f1f5f9`
- Icon size: 16px (w-4 h-4)

**Use for:**
- Toolbar actions
- Table row actions
- Compact controls

**ALWAYS include** `aria-label` for screen readers.

---

## Sizes

| Size | Padding | Font Size | Icon | Usage |
|------|---------|-----------|------|-------|
| Small | 8px 12px | 14px | 16px | Compact areas, tables |
| Medium (default) | 12px 16px | 16px | 18px | Most cases |
| Large | 16px 24px | 16px | 20px | Prominent CTAs |

```html
<!-- Small -->
<button class="px-3 py-2 text-sm">Small Button</button>

<!-- Medium -->
<button class="px-4 py-3 text-base">Medium Button</button>

<!-- Large -->
<button class="px-6 py-4 text-base">Large Button</button>
```

---

## States

| State | Visual Treatment | Example |
|-------|------------------|---------|
| Default | Base styling | Normal appearance |
| Hover | Darken background 10% | Mouse over |
| Focus | Blue ring (`ring-2 ring-primary`) | Keyboard navigation |
| Active | Scale 0.98 | Being clicked |
| Disabled | 50% opacity, not-allowed cursor | Form not valid |
| Loading | Spinner + disabled state | Processing action |

```html
<!-- Disabled -->
<button disabled class="bg-primary text-white px-4 py-2 rounded-md opacity-50 cursor-not-allowed">
  保存
</button>

<!-- Loading -->
<button disabled class="bg-primary text-white px-4 py-2 rounded-md opacity-70">
  <LoadingIcon class="animate-spin mr-2 w-4 h-4" />
  处理中...
</button>

<!-- Focus -->
<button class="bg-primary text-white px-4 py-2 rounded-md focus:ring-2 focus:ring-primary focus:ring-offset-2">
  按钮
</button>
```

---

## Button Groups

Related buttons should be grouped with consistent spacing.

```html
<!-- Horizontal group -->
<div class="flex gap-2">
  <button class="bg-primary text-white px-4 py-2 rounded-md">确认</button>
  <button class="bg-secondary text-white px-4 py-2 rounded-md">取消</button>
</div>

<!-- Vertical group -->
<div class="flex flex-col gap-2">
  <button class="bg-primary text-white px-4 py-2 rounded-md w-full">选项 1</button>
  <button class="bg-slate-100 text-slate-700 px-4 py-2 rounded-md w-full">选项 2</button>
</div>
```

**Spacing: 8px (gap-2) between buttons**

---

## Text in Buttons

DO follow these rules:

1. **Use verbs** - "创建项目" not "项目创建"
2. **Be specific** - "保存草稿" not "保存"
3. **Show outcome** - "导出 PDF" not "导出"
4. **Keep short** - Maximum 4 Chinese characters or 20 letters

**Good Examples:**
- ✓ "创建项目"
- ✓ "保存草稿"
- ✓ "删除项目"
- ✓ "导出报价单"

**Bad Examples:**
- ✗ "项目创建"
- ✗ "保存" (ambiguous - what?)
- ✗ "执行删除操作"
- ✗ "点击此处创建新项目"

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
│  [Filter] [Search]      [+ Add Item]    [Export]   │
└─────────────────────────────────────────────────────┘
```

- Left: Context actions (filter, search)
- Right: Primary actions (add, export)

### Modals

```
┌─────────────────────────────────────┐
│  Modal Title               [X]      │
├─────────────────────────────────────┤
│  Content...                         │
├─────────────────────────────────────┤
│  [Cancel]              [Confirm]    │
└─────────────────────────────────────┘
```

---

## Accessibility

Buttons MUST:

1. Have visible text or `aria-label`
2. Support keyboard navigation (Tab, Enter, Space)
3. Show focus state clearly
4. Indicate disabled state properly
5. Include loading state feedback

```html
<!-- Good: Text button -->
<button>创建项目</button>

<!-- Good: Icon with label -->
<button aria-label="编辑项目">
  <EditIcon />
</button>

<!-- Good: Loading state -->
<button disabled aria-busy="true">
  <Spinner /> 处理中...
</button>
```

---

## Common Patterns

### Pattern 1: Form Actions

```html
<div class="flex justify-end gap-3 mt-6">
  <button type="button" class="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-md">
    取消
  </button>
  <button type="submit" class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
    创建项目
  </button>
</div>
```

### Pattern 2: Table Row Actions

```html
<td class="px-3 py-2">
  <div class="flex gap-2 justify-end">
    <button class="p-1.5 hover:bg-slate-100 rounded" aria-label="编辑">
      <EditIcon class="w-4 h-4 text-slate-600" />
    </button>
    <button class="p-1.5 hover:bg-red-50 rounded" aria-label="删除">
      <TrashIcon class="w-4 h-4 text-red-600" />
    </button>
  </div>
</td>
```

### Pattern 3: Icon + Text Button

```html
<button class="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
  <PlusIcon class="w-4 h-4" />
  添加物料
</button>
```

---

## Quick Reference

```
┌─────────────────────────────────────────────────────────┐
│  Button Quick Reference                                 │
├─────────────────────────────────────────────────────────┤
│  Primary:   #3b82f6 bg, #ffffff text                   │
│  Secondary: #64748b bg, #ffffff text                   │
│  Destructive: #ef4444 bg, #ffffff text                │
│  Ghost:     transparent bg, #334155 text               │
│                                                         │
│  Padding:    12px 16px (medium)                        │
│  Radius:     6px                                       │
│  Gap (group): 8px                                      │
│                                                         │
│  States: default → hover → focus → active              │
│           ↓ disabled (50% opacity)                     │
│                                                         │
│  Text: Verbs, specific, short                          │
│         ✓ "创建项目"  ✗ "项目创建"                      │
│                                                         │
│  Icons: 16px in medium buttons                         │
│         Always include aria-label                      │
└─────────────────────────────────────────────────────────┘
```
