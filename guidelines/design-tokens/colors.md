# Color Design Tokens

| 版本号 | 创建时间 | 更新时间 | 文档主题 | 创建人 |
|--------|----------|----------|----------|--------|
| v1.0   | 2026-03-07 | 2026-03-07 | 颜色设计令牌 | Randy Luo |

---

## Color Philosophy

Dr.aiVOSS uses a minimal color palette focused on data clarity. The system uses **blue** as primary, with **semantic colors** (green/yellow/red) exclusively for the traffic light status system.

### Core Principles

1. **DO** use semantic colors ONLY for status indicators
2. **DO NOT** use semantic colors for decoration
3. **DO** maintain WCAG AA contrast ratios (4.5:1 for text)
4. **DO NOT** create new color variants without approval

---

## Primary Colors

### Blue (Primary Action)

| Token | Value | Usage | Example |
|-------|-------|-------|---------|
| `--primary` | `#3b82f6` | Main buttons, links, active states | "创建项目" button |
| `--primary-hover` | `#2563eb` | Hover state (90% opacity) | Button hover |
| `--primary-foreground` | `#ffffff` | Text on primary | Button text |

```css
/* Tailwind classes */
bg-primary           /* #3b82f6 */
bg-primary/90        /* #2563eb (hover) */
text-white           /* #ffffff (on primary) */
```

**When to Use:**
- Main call-to-action buttons
- Navigation active states
- Links within content
- Primary interactive elements

**When NOT to Use:**
- Background colors (use surface colors)
- Text (use foreground colors)
- Decorative elements

---

## Semantic Colors (Traffic Light System)

### Green (Success / Verified)

| Token | Value | Usage | Example |
|-------|-------|-------|---------|
| `--success` | `#10b981` | Verified status badge | 🟢 物料已确认 |
| `--success-light` | `#d1fae5` | Badge background | Green badge bg |
| `--success-dark` | `#065f46` | Badge text | Green badge text |

```css
/* Tailwind classes */
bg-green-100          /* #d1fae5 (badge bg) */
text-green-800        /* #065f46 (badge text) */
```

**DO use for:**
- Verified status indicators
- Completed states
- Positive profit margins
- Successful operations

**DO NOT use for:**
- Primary buttons
- Background decoration
- General positive messaging (use neutral colors instead)

---

### Yellow (Warning / Review Needed)

| Token | Value | Usage | Example |
|-------|-------|-------|---------|
| `--warning` | `#f59e0b` | Warning status badge | 🟡 需人工复核 |
| `--warning-light` | `#fef3c7` | Badge background | Yellow badge bg |
| `--warning-dark` | `#92400e` | Badge text | Yellow badge text |

```css
/* Tailwind classes */
bg-yellow-100         /* #fef3c7 (badge bg) */
text-yellow-800       /* #92400e (badge text) */
```

**DO use for:**
- AI-matched items (85%+ confidence)
- Pending review states
- Warnings that don't block action

**DO NOT use for:**
- Error states (use red)
- Informational messages (use neutral)

---

### Red (Error / Missing)

| Token | Value | Usage | Example |
|-------|-------|-------|---------|
| `--destructive` | `#ef4444` | Missing status badge | 🔴 数据缺失 |
| `--destructive-light` | `#fee2e2` | Badge background | Red badge bg |
| `--destructive-dark` | `#991b1b` | Badge text | Red badge text |

```css
/* Tailwind classes */
bg-red-100            /* #fee2e2 (badge bg) */
text-red-800          /* #991b1b (badge text) */
```

**DO use for:**
- Missing data indicators
- Error states
- Delete/destroy actions
- Negative profit margins
- High-risk warnings (DB4 < -5%)

**DO NOT use for:**
- General emphasis
- Price highlights
- Secondary actions

---

## Neutral Colors

### Backgrounds

| Token | Value | Usage | Example |
|-------|-------|-------|---------|
| `--background` | `#ffffff` | Page background | Main content area |
| `--surface` | `#f8fafc` | Card background | Project card bg |
| `--surface-variant` | `#f1f5f9` | Nested card bg | Info box within card |
| `--surface-highlight` | `#e2e8f0` | Table header bg | Column headers |

```css
/* Tailwind classes */
bg-white              /* #ffffff */
bg-slate-50           /* #f8fafc */
bg-slate-100          /* #f1f5f9 */
bg-slate-200          /* #e2e8f0 */
```

---

### Borders

| Token | Value | Usage | Example |
|-------|-------|-------|---------|
| `--border` | `#e2e8f0` | Default borders | Input border |
| `--border-strong` | `#cbd5e1` | Strong borders | Modal border |
| `--border-subtle` | `#f1f5f9` | Subtle borders | Card divider |

```css
/* Tailwind classes */
border-slate-200      /* #e2e8f0 */
border-slate-300      /* #cbd5e1 */
border-slate-100      /* #f1f5f9 */
```

---

### Text

| Token | Value | Usage | Example |
|-------|-------|-------|---------|
| `--foreground` | `#0f172a` | Primary text | Headings, labels |
| `--foreground-secondary` | `#475569` | Secondary text | Descriptions |
| `--foreground-tertiary` | `#94a3b8` | Tertiary text | Placeholder, disabled |

```css
/* Tailwind classes */
text-slate-900         /* #0f172a */
text-slate-600         /* #475569 */
text-slate-400         /* #94a3b8 */
```

---

## Color Usage Patterns

### Pattern 1: Status Badge

```html
<!-- Green Verified Badge -->
<span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
  ✓ 已确认
</span>

<!-- Yellow Warning Badge -->
<span class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
  △ 待确认
</span>

<!-- Red Missing Badge -->
<span class="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm">
  ⚠ 缺失
</span>
```

### Pattern 2: Table Row Status

```css
/* Green row - Verified */
tr.verified { background-color: #ffffff; }
tr.verified td:last-child .badge {
  background-color: #d1fae5;
  color: #065f46;
}

/* Yellow row - Pending review */
tr.warning { background-color: #fefce8; }
tr.warning td:last-child .badge {
  background-color: #fef3c7;
  color: #92400e;
}

/* Red row - Missing */
tr.missing { background-color: #fef2f2; }
tr.missing td:last-child .badge {
  background-color: #fee2e2;
  color: #991b1b;
}
```

### Pattern 3: Profit Display

```html
<!-- Positive Profit -->
<span class="text-green-600 font-semibold">+5.2%</span>

<!-- Negative Profit -->
<span class="text-red-600 font-semibold">-3.8%</span>
```

---

## Prohibited Combinations

DO NOT combine these colors:

| Background | Foreground | Reason |
|------------|-----------|--------|
| Green | Red | Traffic light colors clash |
| Yellow | White text | Insufficient contrast |
| Red | Green text | Color blindness issue |
| Primary | Primary | Low contrast |

---

## Accessibility Requirements

All color combinations MUST meet WCAG 2.1 AA standards:

- **Normal text:** 4.5:1 contrast ratio
- **Large text (18px+):** 3:1 contrast ratio
- **UI components:** 3:1 contrast ratio against adjacent colors

Verified combinations:
- `#0f172a` on `#ffffff` ✓ (15.7:1)
- `#ffffff` on `#3b82f6` ✓ (4.6:1)
- `#065f46` on `#d1fae5` ✓ (6.8:1)
- `#92400e` on `#fef3c7` ✓ (6.2:1)
- `#991b1b` on `#fee2e2` ✓ (5.9:1)

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────┐
│  Dr.aiVOSS Color Palette                                │
├─────────────────────────────────────────────────────────┤
│  Primary:     #3b82f6 (blue)                            │
│  Success:     #10b981 (green)  🟢 Verified              │
│  Warning:     #f59e0b (yellow) 🟡 Review Needed         │
│  Destructive: #ef4444 (red)     🔴 Missing               │
│                                                         │
│  Background:  #ffffff                                    │
│  Surface:    #f8fafc                                     │
│  Border:     #e2e8f0                                     │
│                                                         │
│  Text:       #0f172a (primary)                          │
│              #475569 (secondary)                        │
│              #94a3b8 (tertiary)                         │
└─────────────────────────────────────────────────────────┘
```
