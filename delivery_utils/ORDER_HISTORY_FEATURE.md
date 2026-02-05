# Order History Feature

## Overview
The Order History feature allows delivery agents to view all orders they have accepted, providing a complete record of their delivery activities.

## Routes

### Frontend
- **Route**: `/delivery/history`
- **Component**: `src/app/delivery/history/page.tsx`

### API
- **Route**: `GET /api/delivery/history`
- **Handler**: `src/app/api/delivery/history/route.ts`

## Features

### 1. Order List Display
- Shows all orders accepted by the logged-in delivery agent
- Sorted by acceptance date (newest first)
- Displays key information:
  - Order ID (truncated)
  - Number of items
  - Total amount
  - Delivery address
  - Current status
  - Acceptance timestamp
  - Order creation date

### 2. Status Indicators
Visual badges and icons for different order statuses:
- **ACCEPTED_FOR_DELIVERY**: Blue badge with checkmark icon
- **OUT_FOR_DELIVERY**: Orange badge with truck icon
- **DELIVERED**: Green badge with checkmark icon

### 3. Empty State
When no orders have been accepted:
- Displays friendly message
- Provides link to browse available orders

### 4. Navigation
- Back button to return to dashboard
- Dashboard header includes "Order History" link

## Database Query
The API fetches orders by:
1. Joining `order_delivery_assignments` with `orders` table
2. Filtering by `delivery_boy_id` (current logged-in agent)
3. Including nested `order_items` data
4. Ordering by `assigned_at` descending

## UI Components
- Responsive card layout
- Status-specific color coding
- Timestamp formatting
- Address display with truncation
- Icon-based visual indicators

## Security
- Protected route requiring valid delivery session
- Returns 401 if not authenticated
- Only shows orders assigned to the logged-in agent

## CSS Classes Added
New utility classes in `globals.css`:
- `.badge-in-transit` - Orange badge for out-for-delivery status
- `.max-w-4xl` - Maximum width container
- `.gap-3` - 0.75rem gap spacing
- `.mb-3`, `.mb-6` - Additional margin utilities
- `.ml-2`, `.ml-auto` - Margin left utilities
- `.w-3`, `.w-5`, `.w-8`, `.w-16` - Width utilities
- `.h-3`, `.h-5`, `.h-8`, `.h-16` - Height utilities
- `.flex-1`, `.inline-flex` - Flex utilities
- `.min-w-0` - Minimum width utility
- `.hover\:underline` - Hover underline effect
