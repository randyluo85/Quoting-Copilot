# Typography Design Tokens

| 版本号 | 创建时间 | 更新时间 | 文档主题 | 创建人 |
|--------|----------|----------|----------|--------|
| v1.0   | 2026-03-07 | 2026-03-07 | 字体设计令牌 | Randy Luo |

---

## Font Family

### Primary Font

```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
```

**DO use Inter as the primary font.**
**DO NOT mix multiple font families in the same context.**

### Fallback Stack

1. **Inter** - Primary choice (loads from CDN or local)
2. **-apple-system** - macOS/iOS system font
3. **BlinkMacSystemFont** - Older macOS
4. **"Segoe UI"** - Windows
5. **Roboto** - Android
6. **sans-serif** - Final fallback

---

## Font Size Scale

### Size Tokens

| Token | Size | Rem |_px_ | Usage | Example |
|-------|------|-----|-----|-------|---------|
| `--text-xs` | 12px | 0.75rem | 12 | Tiny labels, metadata | "更新: 2h前" |
| `--text-sm` | 14px | 0.875rem | 14 | Secondary text, captions | Form descriptions |
| `--text-base` | 16px | 1rem | 16 | Body text, default | Table content |
| `--text-lg` | 18px | 1.125rem | 18 | Subheadings | Section titles |
| `--text-xl` | 20px | 1.25rem | 20 | Card titles | Project name |
| `--text-2xl` | 24px | 1.5rem | 24 | Page titles | "项目看板" |
| `--text-3xl` | 30px | 1.875rem | 30 | Large headers | Modal titles |
| `--text-4xl` | 36px | 2.25rem | 36 | Hero titles | Landing page |

```css
/* Tailwind classes */
text-xs text-sm text-base text-lg text-xl text-2xl text-3xl text-4xl
```

### Usage Guidelines

| Context | Size | Line Height | Example |
|---------|------|-------------|---------|
| Page title | `text-2xl` | 1.2 | Dashboard pages |
| Card title | `text-xl` | 1.3 | Project card header |
| Section title | `text-lg` | 1.4 | Form sections |
| Body text | `text-base` | 1.5 | Table rows, descriptions |
| Secondary text | `text-sm` | 1.5 | Help text, timestamps |
| Metadata | `text-xs` | 1.4 | Tags, badges |

---

## Font Weight Scale

### Weight Tokens

| Token | Weight | Usage | Example |
|-------|--------|-------|---------|
| `--font-normal` | 400 | Body text | Description text |
| `--font-medium` | 500 | Emphasized text | Form labels |
| `--font-semibold` | 600 | Headings, buttons | Card titles |
| `--font-bold` | 700 | Strong emphasis | Alert headers |

```css
/* Tailwind classes */
font-normal font-medium font-semibold font-bold
```

### Usage Guidelines

| Element | Weight | Example |
|---------|--------|---------|
| Page title | Semibold (600) | "项目看板" |
| Card title | Semibold (600) | "制动管路总成" |
| Button text | Medium (500) | "创建项目" |
| Form label | Medium (500) | "项目名称 *" |
| Body text | Normal (400) | Description content |
| Table header | Semibold (600) | Column names |
| Table cell | Normal (400) | Data rows |

---

## Line Height

### Height Tokens

| Token | Ratio | Usage | Example |
|-------|-------|-------|---------|
| `--leading-none` | 1 | Tight spacing | Large headlines |
| `--leading-tight` | 1.25 | Headings | Page titles |
| `--leading-snug` | 1.375 | Card titles | Project names |
| `--leading-normal` | 1.5 | Body text | Descriptions |
| `--leading-relaxed` | 1.625 | Readable text | Long content |
| `--leading-loose` | 2 | Spaced text | Legal text |

```css
/* Tailwind classes */
leading-none leading-tight leading-snug leading-normal leading-relaxed leading-loose
```

---

## Letter Spacing

### Spacing Tokens

| Token | Value | Usage | Example |
|-------|-------|-------|---------|
| `--tracking-tighter` | -0.05em | Large text | Hero titles |
| `--tracking-tight` | -0.025em | Headings | Page titles |
| `--tracking-normal` | 0 | Default | Body text |
| `--tracking-wide` | 0.025em | Emphasis | Uppercase labels |
| `--tracking-wider` | 0.05em | More emphasis | Buttons |
| `--tracking-widest` | 0.1em | Maximum | Acronyms |

```css
/* Tailwind classes */
tracking-tighter tracking-tight tracking-normal tracking-wide tracking-wider tracking-widest
```

---

## Text Color Combinations

### Primary Text

| Context | Color | Example |
|---------|-------|---------|
| Heading | `text-slate-900` (#0f172a) | Page titles |
| Body | `text-slate-700` (#334155) | Descriptions |
| Secondary | `text-slate-500` (#64748b) | Metadata |
| Disabled | `text-slate-300` (#cbd5e1) | Disabled inputs |

### Semantic Text

| Context | Color | Example |
|---------|-------|---------|
| Success | `text-green-600` (#16a34a) | Positive profit |
| Warning | `text-yellow-600` (#ca8a04) | Warning message |
| Error | `text-red-600` (#dc2626) | Negative profit |
| Link | `text-primary` (#3b82f6) | Navigation |

---

## Typography Patterns

### Pattern 1: Page Header

```
Page Title: text-2xl font-semibold text-slate-900
Subtitle:   text-sm text-slate-500 mt-1
```

### Pattern 2: Card Content

```
Title:     text-lg font-semibold text-slate-900
Subtitle:  text-sm text-slate-500 mt-1
Body:      text-base text-slate-700 mt-2
Metadata:  text-xs text-slate-400 mt-3
```

### Pattern 3: Table Cell

```
Header: text-sm font-semibold text-slate-700
Cell:   text-sm text-slate-600
Number: text-sm font-medium text-slate-900 (tabular-nums)
```

### Pattern 4: Form Label

```
Label:    text-sm font-medium text-slate-700
Required: text-red-500 ml-1
Helper:   text-xs text-slate-500 mt-1
```

---

## Number Formatting

### Tabular Numbers

For aligned numbers in tables and data displays:

```css
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
```

**DO use** tabular numbers for:
- Price columns
- Quantity columns
- Percentage columns
- Any tabular numeric data

### Currency Display

| Format | Template | Example |
|--------|----------|---------|
| CNY | `¥` + thousands | `¥1,234.56` |
| EUR | `€` + thousands | `€21.76` |
| USD | `$` + thousands | `$1,234.56` |

**Always use** comma as thousands separator.
**Always show** 2 decimal places for currency.

### Percentage Display

| Context | Format | Example |
|---------|--------|---------|
| Standard | value + `%` | `15.5%` |
| Integer | value + `%` | `3%` |
| Positive (profit) | Green | `<span class="text-green-600">+5.2%</span>` |
| Negative (loss) | Red | `<span class="text-red-600">-3.8%</span>` |

---

## Text Truncation

### Single Line Truncation

```css
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

**Use for:**
- Table cells with long content
- Card titles
- Navigation items

### Multi-line Truncation

```css
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

**Use for:**
- Descriptions in cards
- Comments or notes
- Preview text

---

## Responsive Typography

### Desktop (1024px+)

| Element | Size |
|---------|------|
| Page title | text-2xl (24px) |
| Card title | text-xl (20px) |
| Body text | text-base (16px) |

### Tablet (768px - 1023px)

| Element | Size |
|---------|------|
| Page title | text-xl (20px) |
| Card title | text-lg (18px) |
| Body text | text-base (16px) |

### Mobile (< 768px)

| Element | Size |
|---------|------|
| Page title | text-lg (18px) |
| Card title | text-base (16px) |
| Body text | text-sm (14px) |

---

## Quick Reference

```
┌─────────────────────────────────────────────────────────┐
│  Typography Quick Reference                             │
├─────────────────────────────────────────────────────────┤
│  Font: Inter (system fallback)                          │
│                                                         │
│  Sizes:                                                 │
│    xs:  12px - Metadata                                 │
│    sm:  14px - Secondary text                           │
│    base: 16px - Body text                               │
│    lg:  18px - Subheadings                              │
│    xl:  20px - Card titles                              │
│    2xl: 24px - Page titles                              │
│                                                         │
│  Weights:                                               │
│    400 - Body text                                      │
│    500 - Form labels, buttons                          │
│    600 - Headings, table headers                       │
│    700 - Strong emphasis                                │
│                                                         │
│  Line Heights:                                          │
│    1.25 - Headings                                      │
│    1.5  - Body text (default)                          │
│                                                         │
│  Numbers: tabular-nums for alignment                   │
│  Currency: ¥1,234.56 (2 decimals)                      │
│  Percent: +5.2% (green), -3.8% (red)                    │
└─────────────────────────────────────────────────────────┘
```
