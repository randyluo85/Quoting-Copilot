# Modal Component

| 版本号 | 创建时间 | 更新时间 | 文档主题 | 创建人 |
|--------|----------|----------|----------|--------|
| v1.0   | 2026-03-07 | 2026-03-07 | 模态框组件规范 | Randy Luo |

---

## Purpose

Modals (dialogs) overlay content to require user attention or collect input. They temporarily block interaction with the main content.

---

## When to Use

**DO use a modal when:**
- Requesting user confirmation ("确定要删除吗？")
- Collecting complex input ("创建项目" form)
- Displaying detailed information ("项目详情")
- Critical actions that need focus

**DO NOT use a modal when:**
- Simple confirmations (use confirmation toast)
- Non-critical information (use inline expansion)
- Navigation (use page or drawer)
- Long forms that need persistence (use dedicated page)

---

## Modal Structure

```
┌─────────────────────────────────────────────────────────┐
│  ┌───────────────────────────────────────────────────┐ │
│  │  Modal Header                        [X]         │ │
│  │  Title                                           │ │
│  ├───────────────────────────────────────────────────┤ │
│  │  Modal Body                                      │ │
│  │  Content area...                                 │ │
│  │                                                  │ │
│  ├───────────────────────────────────────────────────┤ │
│  │  Modal Footer                                    │ │
│  │           [Cancel]              [Confirm]        │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## Default Modal

```html
<div class="fixed inset-0 z-50 flex items-center justify-center">
  <!-- Backdrop -->
  <div class="fixed inset-0 bg-black/50" aria-hidden="true"></div>

  <!-- Modal -->
  <div class="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-hidden flex flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between px-6 py-4 border-b">
      <h2 class="text-lg font-semibold text-slate-900">模态框标题</h2>
      <button class="text-slate-400 hover:text-slate-600">
        <XIcon class="w-5 h-5" />
      </button>
    </div>

    <!-- Body -->
    <div class="px-6 py-4 overflow-y-auto flex-1">
      <p class="text-slate-700">模态框内容...</p>
    </div>

    <!-- Footer -->
    <div class="flex items-center justify-end gap-3 px-6 py-4 border-t bg-slate-50">
      <button class="px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-md">取消</button>
      <button class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">确认</button>
    </div>
  </div>
</div>
```

---

## Modal Sizes

| Size | Max Width | Usage | Example |
|------|-----------|-------|---------|
| Small | 400px | Simple confirmations | Delete confirmation |
| Medium (default) | 512px | Standard forms | Create project |
| Large | 768px | Complex forms | BOM upload form |
| XLarge | 1024px | Wide content | Quote summary preview |

```html
<!-- Small -->
<div class="max-w-sm">...</div>

<!-- Medium (default) -->
<div class="max-w-md">...</div>

<!-- Large -->
<div class="max-w-lg">...</div>

<!-- XLarge -->
<div class="max-w-4xl">...</div>
```

---

## Modal Variants

### Confirmation Modal

```html
<div class="fixed inset-0 z-50 flex items-center justify-center">
  <div class="fixed inset-0 bg-black/50" aria-hidden="true"></div>
  <div class="relative bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 p-6">
    <div class="flex items-center gap-3 mb-4">
      <div class="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
        <AlertTriangleIcon class="w-6 h-6 text-red-600" />
      </div>
      <h3 class="text-lg font-semibold text-slate-900">确认删除</h3>
    </div>
    <p class="text-slate-600 mb-6">确定要删除此项目吗？此操作无法撤销。</p>
    <div class="flex justify-end gap-3">
      <button class="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-md">取消</button>
      <button class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">删除</button>
    </div>
  </div>
</div>
```

---

### Form Modal

```html
<div class="fixed inset-0 z-50 flex items-center justify-center">
  <div class="fixed inset-0 bg-black/50" aria-hidden="true"></div>
  <div class="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between px-6 py-4 border-b">
      <h2 class="text-xl font-semibold text-slate-900">新建项目</h2>
      <button class="text-slate-400 hover:text-slate-600">
        <XIcon class="w-5 h-5" />
      </button>
    </div>

    <!-- Body (scrollable) -->
    <div class="px-6 py-6 overflow-y-auto flex-1 space-y-6">
      <!-- Form sections -->
    </div>

    <!-- Footer -->
    <div class="flex items-center justify-between px-6 py-4 border-t bg-slate-50">
      <button class="text-sm text-slate-500 hover:text-slate-700">保存草稿</button>
      <div class="flex gap-3">
        <button class="px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-md">取消</button>
        <button class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">创建项目</button>
      </div>
    </div>
  </div>
</div>
```

---

### Details Modal

```html
<div class="fixed inset-0 z-50 flex items-center justify-center">
  <div class="fixed inset-0 bg-black/50" aria-hidden="true"></div>
  <div class="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between px-6 py-4 border-b">
      <div>
        <h2 class="text-xl font-semibold text-slate-900">项目详情</h2>
        <p class="text-sm text-slate-500 mt-1">PRJ-2024-001</p>
      </div>
      <button class="text-slate-400 hover:text-slate-600">
        <XIcon class="w-5 h-5" />
      </button>
    </div>

    <!-- Body (scrollable) -->
    <div class="px-6 py-6 overflow-y-auto flex-1">
      <!-- Details content -->
    </div>
  </div>
</div>
```

---

## Modal States

### Open

```css
.modal-open {
  opacity: 1;
  pointer-events: auto;
}
```

### Closed

```css
.modal-closed {
  opacity: 0;
  pointer-events: none;
}
```

### Loading

```html
<div class="flex items-center justify-center py-8">
  <LoadingIcon class="w-6 h-6 text-primary animate-spin" />
  <span class="ml-2 text-slate-600">处理中...</span>
</div>
```

---

## Modal Animations

### Fade In

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-backdrop {
  animation: fadeIn 150ms ease-out;
}
```

### Slide In

```css
@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-content {
  animation: slideIn 200ms ease-out;
}
```

---

## Modal Footer Patterns

### Two Buttons (Cancel + Confirm)

```html
<div class="flex justify-end gap-3">
  <button class="px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-md">取消</button>
  <button class="px-4 py-2 bg-primary text-white rounded-md">确认</button>
</div>
```

### Three Buttons

```html
<div class="flex justify-end gap-3">
  <button class="px-4 py-2 text-slate-500 hover:text-slate-700">保存草稿</button>
  <button class="px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-md">取消</button>
  <button class="px-4 py-2 bg-primary text-white rounded-md">确认</button>
</div>
```

### Full Width Button

```html
<div class="px-6 pb-6">
  <button class="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90">
    确认创建
  </button>
</div>
```

---

## Scrollable Modal Content

When modal content exceeds viewport height:

```html
<div class="relative flex flex-col max-h-[90vh]">
  <!-- Fixed header -->
  <div class="flex-shrink-0 px-6 py-4 border-b">
    <h2 class="text-lg font-semibold">标题</h2>
  </div>

  <!-- Scrollable body -->
  <div class="flex-1 overflow-y-auto px-6 py-4">
    <!-- Long content -->
  </div>

  <!-- Fixed footer -->
  <div class="flex-shrink-0 px-6 py-4 border-t">
    <button>确认</button>
  </div>
</div>
```

---

## Modal Accessibility

Modals MUST:

1. Trap keyboard focus within modal
2. Close on Escape key
3. Return focus to trigger element on close
4. Have proper ARIA attributes
5. Manage scroll on body

```html
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">Modal Title</h2>
  <div id="modal-description">Description</div>
  <!-- Content -->
</div>
```

### Focus Management

```javascript
// On open
const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
const firstElement = focusableElements[0];
const lastElement = focusableElements[focusableElements.length - 1];

firstElement.focus();

// Trap focus
modal.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  }
});

// Close on Escape
modal.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
  }
});
```

---

## Backdrop Options

| Type | Opacity | Usage |
|------|--------|-------|
| Default | 50% | Most modals |
| Light | 30% | Non-critical modals |
| Dark | 70% | Critical confirmations |

```html
<!-- Default -->
<div class="fixed inset-0 bg-black/50"></div>

<!-- Light -->
<div class="fixed inset-0 bg-black/30"></div>

<!-- Dark -->
<div class="fixed inset-0 bg-black/70"></div>
```

---

## Quick Reference

```
┌─────────────────────────────────────────────────────────┐
│  Modal Quick Reference                                  │
├─────────────────────────────────────────────────────────┤
│  Size: max-w-sm (400px), md (512px), lg (768px)         │
│  Max height: 90vh (max-h-[90vh])                        │
│                                                         │
│  Backdrop: fixed inset-0 bg-black/50                   │
│  Content: relative bg-white rounded-lg shadow-xl       │
│                                                         │
│  Header: px-6 py-4 border-b, title + close button      │
│  Body: px-6 py-4 overflow-y-auto, flex-1               │
│  Footer: px-6 py-4 border-t bg-slate-50               │
│                                                         │
│  Animations:                                            │
│    Backdrop: fade in 150ms                             │
│    Content: slide in 200ms                             │
│                                                         │
│  Close: Escape key, backdrop click, X button           │
│  Focus: trap within modal, return on close              │
│                                                         │
│  Button layout:                                         │
│    Left: Cancel (secondary)                            │
│    Right: Confirm (primary)                            │
│    Gap: 12px (gap-3)                                   │
└─────────────────────────────────────────────────────────┘
```
