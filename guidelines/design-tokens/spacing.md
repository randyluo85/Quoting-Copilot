# Spacing Design Tokens

| 版本号 | 创建时间 | 更新时间 | 文档主题 | 创建人 |
|--------|----------|----------|----------|--------|
| v1.0   | 2026-03-07 | 2026-03-07 | 间距设计令牌 | Randy Luo |

---

## Spacing Scale

### Base Unit: 4px

All spacing values are multiples of 4px, following the 8pt grid system.

| Token | Value | Rem | Usage | Example |
|-------|-------|-----|-------|---------|
| `--spacing-0` | 0px | 0 | No spacing | Reset margins |
| `--spacing-1` | 4px | 0.25rem | Tiny gap | Icon + text |
| `--spacing-2` | 8px | 0.5rem | Small gap | Form fields |
| `--spacing-3` | 12px | 0.75rem | Compact gap | Card sections |
| `--spacing-4` | 16px | 1rem | Default gap | Content spacing |
| `--spacing-5` | 20px | 1.25rem | Medium gap | Form sections |
| `--spacing-6` | 24px | 1.5rem | Large gap | Page sections |
| `--spacing-8` | 32px | 2rem | XL gap | Container padding |
| `--spacing-10` | 40px | 2.5rem | XXL gap | Major sections |
| `--spacing-12` | 48px | 3rem | XXXL gap | Hero sections |

```css
/* Tailwind classes */
p-0 p-1 p-2 p-3 p-4 p-5 p-6 p-8 p-10 p-12
m-0 m-1 m-2 m-3 m-4 m-5 m-6 m-8 m-10 m-12
gap-1 gap-2 gap-3 gap-4 gap-5 gap-6 gap-8
```

---

## Component Padding

### Standard Paddings

| Component | Padding | Token | Example |
|-----------|---------|-------|---------|
| Button (sm) | 8px 12px | `px-3 py-2` | Small button |
| Button (md) | 12px 16px | `px-4 py-3` | Default button |
| Button (lg) | 16px 24px | `px-6 py-4` | Large button |
| Input | 12px | `px-3 py-2` | Form input |
| Card | 16px | `p-4` | Default card |
| Modal | 24px | `p-6` | Modal content |
| Table cell | 12px 8px | `px-3 py-2` | Table data |

```html
<!-- Button Padding -->
<button class="px-4 py-2">Button</button>

<!-- Input Padding -->
<input class="px-3 py-2" />

<!-- Card Padding -->
<div class="p-4">Card content</div>

<!-- Modal Padding -->
<div class="p-6">Modal content</div>
```

---

## Container Spacing

### Layout Containers

| Container | Padding | Max Width | Usage |
|-----------|---------|-----------|-------|
| Page | 24px | none | Mobile layout |
| Container (sm) | 24px | 640px | Narrow content |
| Container (md) | 24px | 768px | Article content |
| Container (lg) | 32px | 1024px | Standard layout |
| Container (xl) | 32px | 1280px | Wide layout |

```css
/* Tailwind classes */
.container { max-width: 1280px; margin: 0 auto; padding: 0 32px; }
@media (max-width: 768px) { .container { padding: 0 24px; } }
```

---

## Grid & Gap Spacing

### Grid Gaps

| Context | Gap | Token | Example |
|---------|-----|-------|---------|
| Form rows | 16px | `gap-4` | Vertical form |
| Form columns | 24px | `gap-6` | Two-column form |
| Card grid | 24px | `gap-6` | Dashboard cards |
| Button group | 8px | `gap-2` | Related buttons |
| Tab buttons | 4px | `gap-1` | Compact tabs |

```html
<!-- Form with spacing -->
<form class="space-y-4">
  <!-- Fields with 16px gap -->
</form>

<!-- Two column layout -->
<div class="grid grid-cols-2 gap-6">
  <!-- Columns with 24px gap -->
</div>

<!-- Button group -->
<div class="flex gap-2">
  <!-- Buttons with 8px gap -->
</div>
```

---

## Margin Patterns

### Vertical Spacing

| Context | Margin | Token | Example |
|---------|--------|-------|---------|
| Section separator | 48px | `my-12` | Page sections |
| Card to card | 24px | `mb-6` | Stacked cards |
| Form section | 32px | `mb-8` | Form groups |
| Paragraph | 16px | `mb-4` | Text paragraphs |
| List item | 8px | `mb-2` | Compact list |

```html
<!-- Section spacing -->
<section class="mb-12">
  <h2>Section Title</h2>
</section>

<!-- Card stack -->
<div class="mb-6">Card 1</div>
<div class="mb-6">Card 2</div>

<!-- Form section -->
<div class="mb-8">
  <label>Section Label</label>
  <input />
</div>
```

---

## Spacing by Component Type

### Buttons

```css
/* Internal spacing */
.button { padding: 12px 16px; }       /* Default */

/* External spacing */
.button-group { gap: 8px; }            /* Button group */
.button-stack { gap: 12px; }           /* Vertical stack */
```

### Forms

```css
/* Label to input */
.form-group label { margin-bottom: 4px; }

/* Input to help text */
.form-group .help { margin-top: 4px; }

/* Between form groups */
.form-group { margin-bottom: 16px; }
```

### Cards

```css
/* Card padding */
.card { padding: 16px; }

/* Card header to body */
.card-header { margin-bottom: 12px; }

/* Card body to footer */
.card-body { margin-bottom: 16px; }
```

### Tables

```css
/* Cell padding */
th, td { padding: 12px 16px; }

/* Table to controls */
.table-controls { margin-bottom: 16px; }
```

### Modals

```css
/* Modal padding */
.modal-content { padding: 24px; }

/* Header to body */
.modal-header { margin-bottom: 16px; }

/* Body to footer */
.modal-body { margin-bottom: 24px; }
```

---

## Responsive Spacing

### Desktop (1024px+)

| Element | Spacing |
|---------|---------|
| Page padding | 32px |
| Section gap | 48px |
| Card padding | 16px |
| Grid gap | 24px |

### Tablet (768px - 1023px)

| Element | Spacing |
|---------|---------|
| Page padding | 24px |
| Section gap | 32px |
| Card padding | 16px |
| Grid gap | 16px |

### Mobile (< 768px)

| Element | Spacing |
|---------|---------|
| Page padding | 16px |
| Section gap | 24px |
| Card padding | 12px |
| Grid gap | 12px |

---

## Common Spacing Mistakes

### DON'T: Inconsistent spacing

```html
<!-- Bad: Mixed spacing values -->
<div class="space-y-[13px]">
  <div class="p-[7px]">
    <button class="px-[9px] py-[11px]">Button</button>
  </div>
</div>
```

### DO: Use consistent scale

```html
<!-- Good: Standard spacing scale -->
<div class="space-y-4">
  <div class="p-4">
    <button class="px-4 py-3">Button</button>
  </div>
</div>
```

### DON'T: Magic numbers

```css
/* Bad */
.card { padding: 17px; margin-bottom: 23px; }
```

### DO: Token-based spacing

```css
/* Good */
.card { padding: var(--spacing-4); margin-bottom: var(--spacing-6); }
```

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────┐
│  Spacing Quick Reference (4px base unit)                │
├─────────────────────────────────────────────────────────┤
│  Scale:  0, 4, 8, 12, 16, 20, 24, 32, 40, 48           │
│  Tokens: 0, 1, 2, 3, 4, 5, 6, 8, 10, 12                │
│                                                         │
│  Padding:                                               │
│    Button:   12px 16px (px-4 py-3)                     │
│    Input:    12px (px-3 py-2)                          │
│    Card:     16px (p-4)                                │
│    Modal:    24px (p-6)                                │
│                                                         │
│  Margins:                                               │
│    Section:  48px (my-12)                              │
│    Card:     24px (mb-6)                               │
│    Paragraph: 16px (mb-4)                              │
│                                                         │
│  Gaps:                                                  │
│    Grid:     24px (gap-6)                              │
│    Buttons:  8px (gap-2)                               │
│    Form:     16px (space-y-4)                          │
│                                                         │
│  Responsive:                                           │
│    Desktop: 32px page padding                          │
│    Tablet:  24px page padding                          │
│    Mobile:  16px page padding                          │
└─────────────────────────────────────────────────────────┘
```
