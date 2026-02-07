# UI Quick Reference Guide
## AuraSutra Delivery Dashboard

**For Developers:** Quick copy-paste reference for common UI patterns

---

## 🎨 Color Variables

```css
/* Use these CSS variables in your components */
var(--primary)              /* #4f46e5 - Primary actions */
var(--primary-hover)        /* #4338ca - Hover states */
var(--background)           /* #f8fafc - Page background */
var(--foreground)           /* #0f172a - Text color */
var(--card)                 /* #ffffff - Card backgrounds */
var(--muted)                /* #f1f5f9 - Muted backgrounds */
var(--muted-foreground)     /* #64748b - Secondary text */
var(--success)              /* #10b981 - Success states */
var(--error)                /* #ef4444 - Error states */
var(--warning)              /* #f59e0b - Warning states */
var(--border)               /* #e2e8f0 - Borders */
var(--radius)               /* 0.75rem - Border radius */
```

---

## 📦 Common Component Patterns

### Card with Cloud Background

```tsx
<div className="card">
  <h3 className="text-xl font-semibold mb-2">Card Title</h3>
  <p className="text-muted-foreground">Card content goes here</p>
</div>
```

### Primary Button

```tsx
<button className="btn btn-primary px-8 py-3">
  Click Me
</button>
```

### Status Badge

```tsx
<span className="badge badge-pending">Pending</span>
<span className="badge badge-accepted">Accepted</span>
<span className="badge badge-delivered">Delivered</span>
<span className="badge badge-in-transit">In Transit</span>
```

### Grid Layout (3 Columns)

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div className="card">Item 1</div>
  <div className="card">Item 2</div>
  <div className="card">Item 3</div>
</div>
```

### Flex Container (Centered)

```tsx
<div className="flex items-center justify-center gap-4">
  <button>Button 1</button>
  <button>Button 2</button>
</div>
```

### Section Header with Action Link

```tsx
<div className="flex justify-between items-center mb-4">
  <h2 className="text-2xl font-semibold">Section Title</h2>
  <Link href="/view-all" className="text-primary hover:underline text-sm font-medium">
    View All
  </Link>
</div>
```

---

## 🎭 Animation Classes

```tsx
/* Fade in animation */
<div className="animate-fade-in">Content</div>

/* Pulse animation (loading) */
<div className="animate-pulse">Loading...</div>
```

---

## 📱 Responsive Utilities

```tsx
/* Hide on mobile, show on tablet+ */
<div className="hidden md:block">Desktop content</div>

/* Show on mobile, hide on tablet+ */
<div className="block md:hidden">Mobile content</div>

/* Responsive grid */
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Items */}
</div>

/* Responsive padding */
<div className="p-4 md:p-8">Content</div>
```

---

## 🎯 Spacing Scale

```css
/* Padding */
.p-2  = 0.5rem  (8px)
.p-3  = 0.75rem (12px)
.p-4  = 1rem    (16px)
.p-8  = 2rem    (32px)

/* Margin */
.mb-2  = 0.5rem  (8px)
.mb-4  = 1rem    (16px)
.mb-8  = 2rem    (32px)
.mb-12 = 3rem    (48px)

/* Gap */
.gap-2 = 0.5rem  (8px)
.gap-4 = 1rem    (16px)
.gap-6 = 1.5rem  (24px)
.gap-8 = 2rem    (32px)
```

---

## 🔤 Typography

```tsx
/* Headings */
<h1 className="text-4xl font-bold">Page Title</h1>
<h2 className="text-2xl font-semibold">Section Header</h2>
<h3 className="text-xl font-semibold">Card Title</h3>

/* Body Text */
<p className="text-lg">Large text</p>
<p>Normal text (16px)</p>
<p className="text-sm">Small text</p>
<p className="text-xs">Extra small text</p>

/* Muted Text */
<p className="text-muted-foreground">Secondary information</p>

/* Colored Text */
<p className="text-primary">Primary color text</p>
<p className="text-success">Success message</p>
<p className="text-error">Error message</p>
```

---

## 🎨 Cloud Background Gradients

### Sidebar Cloud (Vertical)

```css
background: linear-gradient(180deg,
  rgba(186, 230, 253, 0.4) 0%,
  rgba(224, 242, 254, 0.5) 20%,
  rgba(240, 249, 255, 0.3) 40%,
  rgba(224, 242, 254, 0.5) 60%,
  rgba(186, 230, 253, 0.4) 100%);
background-size: 200% 200%;
animation: cloud-drift 30s ease-in-out infinite;
```

### Card Cloud (Diagonal)

```css
background: linear-gradient(135deg,
  rgba(186, 230, 253, 0.5) 0%,
  rgba(224, 242, 254, 0.6) 25%,
  rgba(240, 249, 255, 0.4) 50%,
  rgba(224, 242, 254, 0.6) 75%,
  rgba(186, 230, 253, 0.5) 100%);
background-size: 200% 200%;
animation: cloud-drift 25s ease-in-out infinite;
```

---

## 🎪 Custom Components

### Circular Progress

```tsx
import CircularProgress from '../components/CircularProgress';

<CircularProgress
  value={75}
  max={100}
  label="Orders Accepted"
  color="#3b82f6"
  size={140}
  icon={CheckCircle}
/>
```

### Order Card

```tsx
import OrderCard from '../components/OrderCard';

<OrderCard 
  key={order.id} 
  order={order} 
  showCompleteButton={true}
/>
```

---

## 🎬 Loading States

```tsx
/* Loading container */
<div className="container min-h-screen py-8 flex items-center justify-center">
  <div className="text-muted-foreground animate-pulse">
    Loading dashboard...
  </div>
</div>
```

---

## 🎯 Form Elements

### Input Field

```tsx
<input 
  type="text"
  className="input"
  placeholder="Enter text..."
/>
```

### Button Variants

```tsx
/* Primary */
<button className="btn btn-primary">Primary Action</button>

/* Outline */
<button className="btn btn-outline">Secondary Action</button>

/* Danger */
<button className="btn btn-danger">Delete</button>
```

---

## 🎨 Shadow Utilities

```tsx
/* Light shadow */
<div className="shadow-sm">Content</div>

/* Medium shadow */
<div className="shadow-lg">Content</div>

/* Large shadow */
<div className="shadow-xl">Content</div>

/* Primary colored shadow */
<div className="shadow-xl shadow-primary/20">Content</div>
```

---

## 📐 Border Radius

```tsx
/* Small radius */
<div className="rounded-md">Content</div>

/* Medium radius (default) */
<div className="rounded-lg">Content</div>

/* Fully rounded */
<div className="rounded-full">Badge</div>
```

---

## 🎪 Layout Containers

### Page Wrapper (with integrated container)

```tsx
<div className="min-h-screen p-8">
  <div className="dashboard-container-wrapper">
    <Sidebar />
    <main className="delivery-main-integrated">
      {/* Page content */}
    </main>
  </div>
</div>
```

### Standalone Dashboard Container

```tsx
<div className="dashboard-container">
  {/* Content goes here */}
</div>
```

### Standard Container

```tsx
<div className="container py-8">
  {/* Content with max-width and auto margins */}
</div>
```

---

## 🎨 Status Colors Reference

```tsx
/* Circular Progress Colors */
Orders Accepted:  #3b82f6 (Blue)
Orders Delivered: #22c55e (Green)
Orders Ignored:   #f59e0b (Amber)

/* Badge Background Colors */
Pending:    #fef3c7 (Amber 100)
Accepted:   #dbeafe (Blue 100)
Delivered:  #d1fae5 (Green 100)
In Transit: #fed7aa (Orange 100)
```

---

## 💡 Best Practices

1. **Always use utility classes** from globals.css instead of inline styles
2. **Maintain consistent spacing** using the spacing scale
3. **Use semantic HTML** elements (`<nav>`, `<main>`, `<header>`)
4. **Apply animations sparingly** to avoid performance issues
5. **Test responsive layouts** at all breakpoints (mobile, tablet, desktop)
6. **Ensure color contrast** meets WCAG AA standards
7. **Use CSS variables** for colors to maintain consistency

---

## 🔗 Related Documentation

- [Full UI Design Document](./UI_DESIGN_DOCUMENT.md)
- [Component Documentation](./COMPONENTS.md)
- [API Documentation](./API.md)

---

**Last Updated:** February 7, 2026
