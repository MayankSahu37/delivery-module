# Component Showcase
## AuraSutra Delivery Dashboard - Visual Component Library

This document showcases all UI components with visual descriptions and usage examples.

---

## 🎨 Layout Components

### 1. Dashboard Container Wrapper

**Description:** The main glassmorphism container that holds the entire dashboard interface.

**Visual Characteristics:**
- Semi-transparent white background (75% opacity)
- 20px backdrop blur for frosted glass effect
- 32px rounded corners
- Multi-layered shadow for depth
- 30px margin from screen edges
- Inset highlight on top edge

**Usage:**
```tsx
<div className="min-h-screen p-8">
  <div className="dashboard-container-wrapper">
    {/* Sidebar and main content */}
  </div>
</div>
```

**Dimensions:**
- Desktop: `calc(100vw - 60px)` × `calc(100vh - 60px)`
- Mobile: `calc(100vw - 32px)` × `calc(100vh - 32px)`

---

### 2. Sidebar

**Description:** Fixed-width navigation panel with cloudy sky background.

**Visual Characteristics:**
- 260px width (70px on mobile)
- Vertical cloud gradient background
- Subtle 30-second drift animation
- Inset glow effect
- Semi-transparent dividers

**Sections:**
1. **Header** - Logo/Title area
2. **Navigation** - Menu items with icons
3. **Footer** - Logout button

**Navigation States:**
- **Default:** Gray text, transparent background
- **Hover:** Light gray background, darker text
- **Active:** Primary color background, white text, shadow

**Mobile Behavior:**
- Collapses to icon-only mode (70px width)
- Text labels hidden
- Icons centered

---

### 3. Main Content Area

**Description:** Flexible content area next to the sidebar.

**Visual Characteristics:**
- Flexes to fill available space
- 2rem padding (1rem on mobile)
- Scrollable overflow
- Transparent background (inherits from parent)

---

## 🎴 Card Components

### 1. Standard Card

**Description:** Primary container for content sections.

**Visual Characteristics:**
- Diagonal cloud gradient background
- 25-second drift animation
- 10px backdrop blur
- 12px rounded corners
- Inset glow + outer shadow
- Hover: Lifts 2px with enhanced shadow

**Content Types:**
- Statistics displays
- Order information
- Form sections
- Data tables

**Padding:** 24px (1.5rem)

---

### 2. Circular Progress Card

**Description:** Card containing circular statistics visualization.

**Visual Characteristics:**
- Same card styling as standard card
- Centered content alignment
- Extra vertical padding (2rem)
- Flex layout for centering

**Contains:**
- SVG circular progress indicator
- Numeric value display
- Icon (CheckCircle, Truck, XCircle)
- Label text

**Dimensions:** 140px circle diameter

**Color Coding:**
- Blue (#3b82f6) - Orders Accepted
- Green (#22c55e) - Orders Delivered
- Amber (#f59e0b) - Orders Ignored

---

### 3. Order Card

**Description:** Specialized card for displaying order details.

**Visual Characteristics:**
- Standard card styling
- Structured content layout
- Status badge integration
- Action button at bottom

**Content Structure:**
```
┌─────────────────────────────┐
│ Order #12345          [Badge]│
│                              │
│ 👤 Customer Name             │
│ 📍 Delivery Address          │
│ 📦 Items: 3                  │
│ 💰 Total: ₹450               │
│                              │
│ ┌──────────────────────────┐│
│ │  [Accept Order Button]   ││
│ └──────────────────────────┘│
└─────────────────────────────┘
```

**States:**
- Default: Shows "Accept" button
- Accepted: Shows "Complete" button
- Completed: Shows completion status

---

## 🎯 Interactive Components

### 1. Primary Button

**Visual Characteristics:**
- Indigo background (#4f46e5)
- White text
- 12px rounded corners
- 500 font weight
- Smooth hover transition

**States:**
- **Default:** Indigo background
- **Hover:** Darker indigo (#4338ca)
- **Disabled:** 50% opacity, no pointer

**Sizes:**
- Small: `px-4 py-2`
- Medium: `px-6 py-3`
- Large: `px-8 py-3`

---

### 2. Outline Button

**Visual Characteristics:**
- Transparent background
- Light border (#e2e8f0)
- Foreground text color
- 12px rounded corners

**States:**
- **Default:** Transparent with border
- **Hover:** Light gray background (#f1f5f9)
- **Disabled:** 50% opacity

---

### 3. Danger Button

**Visual Characteristics:**
- Red background (#ef4444)
- White text
- Same styling as primary button

**Usage:** Delete, cancel, reject actions

---

### 4. Navigation Link

**Visual Characteristics:**
- Flex layout with icon + text
- 0.75rem gap between icon and text
- Fully rounded (pill shape)
- Padding: 0.75rem 1.5rem
- Margin: 0.25rem 0.75rem

**States:**
- **Default:** Gray text, transparent
- **Hover:** Light background, darker text
- **Active:** Primary background, white text, shadow

**Icon Size:** 20px (w-5 h-5)

---

## 🏷️ Badge Components

### 1. Status Badge

**Visual Characteristics:**
- Fully rounded pill shape
- Uppercase text
- 12px font size
- 600 font weight
- 0.05em letter spacing
- Padding: 0.25rem 0.75rem

**Variants:**

**Pending:**
- Background: #fef3c7 (Amber 100)
- Text: #92400e (Amber 900)

**Accepted:**
- Background: #dbeafe (Blue 100)
- Text: #1e40af (Blue 800)

**Delivered:**
- Background: #d1fae5 (Green 100)
- Text: #065f46 (Green 800)

**In Transit:**
- Background: #fed7aa (Orange 100)
- Text: #9a3412 (Orange 900)

---

## 📊 Data Display Components

### 1. Circular Progress

**Description:** Animated SVG circle showing progress/statistics.

**Visual Characteristics:**
- Circular SVG path
- Animated stroke-dashoffset
- 1-second ease-in-out animation
- Centered numeric display
- Icon at top
- Label at bottom

**Structure:**
```
    [Icon]
   ┌─────┐
  │  75  │  ← Numeric value
   └─────┘
 "Orders Accepted"  ← Label
```

**Customization:**
- `value`: Current value
- `max`: Maximum value
- `color`: Stroke color
- `size`: Circle diameter
- `icon`: Lucide icon component
- `label`: Bottom text

---

### 2. Statistics Grid

**Description:** Responsive grid of circular progress cards.

**Layout:**
- Mobile: 1 column
- Tablet: 3 columns
- Desktop: 3 columns

**Gap:** 2rem (32px)

**Typical Content:**
- Orders Accepted (Blue)
- Orders Delivered (Green)
- Orders Ignored (Amber)

---

## 📝 Form Components

### 1. Input Field

**Visual Characteristics:**
- Full width
- 12px padding (0.75rem)
- 12px rounded corners
- Light border (#e2e8f0)
- Light background (#f8fafc)

**States:**
- **Default:** Light border
- **Focus:** Primary border + 2px primary shadow
- **Error:** Red border
- **Disabled:** Reduced opacity

---

### 2. Text Area

**Visual Characteristics:**
- Same as input field
- Resizable vertically
- Minimum height: 100px

---

## 🎭 Animation Components

### 1. Fade In Container

**Description:** Container that fades in on mount.

**Animation:**
- Duration: 0.5s
- Easing: ease-out
- From: opacity 0, translateY(10px)
- To: opacity 1, translateY(0)

**Usage:**
```tsx
<div className="animate-fade-in">
  {/* Content */}
</div>
```

---

### 2. Pulse Loader

**Description:** Pulsing opacity for loading states.

**Animation:**
- Duration: 2s
- Infinite loop
- Opacity: 1 → 0.5 → 1

**Usage:**
```tsx
<div className="animate-pulse">
  Loading...
</div>
```

---

## 🎨 Background Components

### 1. Page Background

**Description:** Animated multi-color gradient.

**Visual Characteristics:**
- 5-color gradient (blue, teal, mint, lavender, purple)
- Diagonal direction (135deg)
- 400% × 400% size
- 20-second shift animation
- Fixed attachment

**Colors:**
- #e0f2fe (Light blue)
- #ccfbf1 (Teal)
- #f0fdfa (Mint)
- #e0e7ff (Lavender)
- #ddd6fe (Light purple)

---

### 2. Cloud Drift Background

**Description:** Animated cloud-like gradient.

**Variants:**

**Sidebar (Vertical):**
- Direction: 180deg (top to bottom)
- Animation: 30 seconds
- 5 color stops

**Cards (Diagonal):**
- Direction: 135deg
- Animation: 25 seconds
- 5 color stops

**Animation:**
- Background position: 0% 0% → 100% 100% → 0% 0%
- Infinite loop
- Ease-in-out timing

---

## 📐 Layout Patterns

### 1. Section Header

**Description:** Header with title and action link.

**Structure:**
```
┌─────────────────────────────────────┐
│ Section Title          View All →   │
└─────────────────────────────────────┘
```

**Styling:**
- Flex layout with space-between
- Items centered vertically
- Bottom margin: 1rem

**Components:**
- Left: `text-2xl font-semibold`
- Right: `text-primary hover:underline text-sm font-medium`

---

### 2. Grid Layout

**Description:** Responsive grid for cards.

**Breakpoints:**
- Mobile: 1 column
- Tablet (768px+): 2 columns
- Desktop (1024px+): 3 columns

**Gap:** 1.5rem (24px)

**Usage:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => <Card key={item.id} />)}
</div>
```

---

### 3. Centered Container

**Description:** Vertically and horizontally centered content.

**Usage:**
```tsx
<div className="min-h-screen flex items-center justify-center">
  <div className="max-w-md w-full">
    {/* Centered content */}
  </div>
</div>
```

---

## 🎪 Composite Components

### 1. Welcome Header

**Description:** Personalized greeting section.

**Structure:**
```
Welcome, John Doe
Here's your delivery overview
```

**Styling:**
- Title: `text-4xl font-bold mb-2`
- Subtitle: `text-muted-foreground`
- Container: `mb-8 animate-fade-in`

---

### 2. Order List Section

**Description:** Section with header and grid of order cards.

**Structure:**
```
┌─────────────────────────────────────┐
│ Available Orders        View All →  │
├─────────────────────────────────────┤
│ ┌─────┐ ┌─────┐ ┌─────┐            │
│ │Order│ │Order│ │Order│            │
│ │  1  │ │  2  │ │  3  │            │
│ └─────┘ └─────┘ └─────┘            │
└─────────────────────────────────────┘
```

**Components:**
1. Section header with title and link
2. Responsive grid of order cards
3. Fade-in animation

---

### 3. Statistics Dashboard

**Description:** Grid of circular progress indicators.

**Structure:**
```
┌──────────┐ ┌──────────┐ ┌──────────┐
│   [📊]   │ │   [🚚]   │ │   [❌]   │
│    75    │ │    50    │ │    5     │
│ Accepted │ │Delivered │ │ Ignored  │
└──────────┘ └──────────┘ └──────────┘
```

**Layout:**
- 3-column grid on desktop
- 1-column on mobile
- 2rem gap
- Bottom margin: 3rem

---

## 🎨 Visual Effects

### 1. Glassmorphism

**Properties:**
- `background: rgba(255, 255, 255, 0.75)`
- `backdrop-filter: blur(20px)`
- `border: 1px solid rgba(255, 255, 255, 0.4)`

**Usage:** Main container, cards

---

### 2. Inset Glow

**Properties:**
- `box-shadow: inset 0 0 40px rgba(255, 255, 255, 0.4)`

**Usage:** Cards, sidebar for depth

---

### 3. Floating Shadow

**Properties:**
```css
box-shadow: 
  0 20px 60px rgba(31, 38, 135, 0.12),
  0 8px 16px rgba(0, 0, 0, 0.08),
  inset 0 1px 0 rgba(255, 255, 255, 0.6);
```

**Usage:** Main container for elevated appearance

---

### 4. Hover Lift

**Properties:**
- `transform: translateY(-2px)`
- Enhanced shadow
- 0.2s transition

**Usage:** Cards, buttons

---

## 📱 Responsive Behavior

### Mobile (< 768px)
- Sidebar: Icon-only (70px)
- Grid: Single column
- Container margin: 16px
- Reduced padding

### Tablet (768px - 1023px)
- Sidebar: Full width (260px)
- Grid: 2 columns
- Container margin: 30px
- Standard padding

### Desktop (≥ 1024px)
- Sidebar: Full width (260px)
- Grid: 3 columns
- Container margin: 30px
- Full padding

---

## 🎯 Component Combinations

### Dashboard Page Layout

```
┌─────────────────────────────────────────┐
│ ┌─────┐ ┌─────────────────────────────┐│
│ │     │ │ Welcome, User               ││
│ │ S   │ │ Here's your overview        ││
│ │ I   │ ├─────────────────────────────┤│
│ │ D   │ │ [📊] [🚚] [❌]             ││
│ │ E   │ │  75   50   5               ││
│ │ B   │ ├─────────────────────────────┤│
│ │ A   │ │ Incomplete Orders  View All││
│ │ R   │ │ [Order] [Order] [Order]    ││
│ │     │ ├─────────────────────────────┤│
│ │     │ │ Available Orders   View All││
│ │     │ │ [Order] [Order] [Order]    ││
│ └─────┘ └─────────────────────────────┘│
└─────────────────────────────────────────┘
```

---

## 🎨 Color Usage Guide

### When to Use Each Color

**Primary (#4f46e5):**
- Primary action buttons
- Active navigation items
- Important links
- Focus states

**Success (#10b981):**
- Delivered status
- Success messages
- Positive indicators
- Completion states

**Error (#ef4444):**
- Delete buttons
- Error messages
- Failed states
- Warnings

**Warning (#f59e0b):**
- Ignored orders
- Caution messages
- Pending actions

**Muted (#64748b):**
- Secondary text
- Descriptions
- Placeholders
- Disabled states

---

## 📚 Component Hierarchy

```
Page
├── Background (Animated Gradient)
└── Dashboard Container Wrapper (Glassmorphism)
    ├── Sidebar (Cloud Background)
    │   ├── Header
    │   ├── Navigation
    │   │   └── Nav Links (with icons)
    │   └── Footer
    │       └── Logout Button
    └── Main Content Area
        ├── Welcome Header
        ├── Statistics Section
        │   └── Grid of Circular Progress Cards
        ├── Incomplete Orders Section
        │   ├── Section Header
        │   └── Grid of Order Cards
        └── Available Orders Section
            ├── Section Header
            └── Grid of Order Cards
```

---

**Last Updated:** February 7, 2026  
**For:** AuraSutra Delivery Management Dashboard
