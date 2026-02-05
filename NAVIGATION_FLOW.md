# Delivery Agent Module - Navigation Flow

## Page Navigation Map

```
┌─────────────────────────────────────────────────────────────┐
│                      /delivery/login                         │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Email Input: ___________________________          │     │
│  │  [Login Button]                                    │     │
│  └────────────────────────────────────────────────────┘     │
│                           │                                  │
│                           ▼                                  │
└───────────────────────────┼──────────────────────────────────┘
                            │
                            │ (on success)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   /delivery/dashboard                        │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Header: [Delivery Dashboard] [Order History] [N]  │     │
│  ├────────────────────────────────────────────────────┤     │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐         │     │
│  │  │ Order #1 │  │ Order #2 │  │ Order #3 │         │     │
│  │  │ 5 Items  │  │ 3 Items  │  │ 8 Items  │         │     │
│  │  │ $125.00  │  │ $89.50   │  │ $234.75  │         │     │
│  │  └──────────┘  └──────────┘  └──────────┘         │     │
│  └────────────────────────────────────────────────────┘     │
│         │                                    │               │
│         │ (click order)                      │ (click link)  │
│         ▼                                    ▼               │
└─────────┼────────────────────────────────────┼───────────────┘
          │                                    │
          │                                    │
┌─────────▼────────────────────────┐  ┌────────▼──────────────┐
│  /delivery/orders/[orderId]      │  │  /delivery/history    │
│  ┌────────────────────────────┐  │  │  ┌─────────────────┐  │
│  │ [← Back]  Order Details    │  │  │  │ [← Back]        │  │
│  ├────────────────────────────┤  │  │  ├─────────────────┤  │
│  │ Order #abc123              │  │  │  │ Accepted Orders │  │
│  │ Status: PAID               │  │  │  │                 │  │
│  │                            │  │  │  │ ┌─────────────┐ │  │
│  │ 📦 Pickup:                 │  │  │  │ │ Order #xyz  │ │  │
│  │    AuraSutra Medical Ltd   │  │  │  │ │ DELIVERED   │ │  │
│  │                            │  │  │  │ └─────────────┘ │  │
│  │ 📍 Delivery:               │  │  │  │ ┌─────────────┐ │  │
│  │    123 Main St, NY         │  │  │  │ │ Order #abc  │ │  │
│  │                            │  │  │  │ │ ACCEPTED    │ │  │
│  │ Items:                     │  │  │  │ └─────────────┘ │  │
│  │ • Medicine A x2 - $50      │  │  │  └─────────────────┘  │
│  │ • Medicine B x3 - $75      │  │  └──────────────────────┘
│  │                            │  │
│  │ Total: $125.00             │  │
│  ├────────────────────────────┤  │
│  │ [Ignore] [Accept Order]    │  │
│  └────────────────────────────┘  │
│           │                      │
│           ▼                      │
│    (redirects to dashboard)      │
└──────────────────────────────────┘
```

## User Actions & Results

### 1. Login Flow
```
User enters email
    ↓
System checks delivery_agents table
    ↓
┌─────────────┬──────────────┐
│ Email found │ Email not    │
│ & active    │ found/inactive│
└──────┬──────┴──────┬───────┘
       ↓             ↓
   Set cookie    Show error
       ↓
   Redirect to
   dashboard
```

### 2. Order Acceptance Flow
```
User clicks order card
    ↓
View order details
    ↓
User clicks "Accept Order"
    ↓
Confirm dialog
    ↓
API checks order status = 'paid'
    ↓
┌──────────────┬─────────────────┐
│ Still paid   │ Already taken   │
└──────┬───────┴────────┬────────┘
       ↓                ↓
   Update to        Show error
   ACCEPTED_FOR_    message
   DELIVERY
       ↓
   Create assignment
   record
       ↓
   Redirect to
   dashboard
```

### 3. Order Ignore Flow
```
User clicks "Ignore"
    ↓
Confirm dialog
    ↓
Insert into ignored_orders
    ↓
Redirect to dashboard
    ↓
Order no longer visible
to this agent
```

### 4. History View Flow
```
User clicks "Order History"
    ↓
Fetch all assignments
for current agent
    ↓
Display with status badges
    ↓
Orders sorted by
acceptance date (newest first)
```

## API Call Sequence

### Dashboard Load
```
1. GET /api/delivery/orders
   ├─ Check session cookie
   ├─ Get ignored orders for agent
   ├─ Query orders WHERE status='paid'
   ├─ Filter out ignored & assigned
   └─ Return order list

2. Render OrderCard components
```

### Order Details
```
1. GET /api/delivery/orders/[orderId]
   ├─ Check session cookie
   ├─ Query order with items
   ├─ Parse shipping address
   └─ Return order details

2. Render order information
3. Enable Accept/Ignore buttons
```

### Accept Order
```
1. POST /api/delivery/orders/[orderId]/accept
   ├─ Check session cookie
   ├─ Verify order status = 'paid'
   ├─ Update status to 'ACCEPTED_FOR_DELIVERY'
   ├─ Create assignment record
   └─ Return success

2. Show success message
3. Redirect to dashboard
```

### View History
```
1. GET /api/delivery/history
   ├─ Check session cookie
   ├─ Query order_delivery_assignments
   ├─ Join with orders table
   ├─ Include order_items
   └─ Return order list

2. Render history cards
3. Show status badges
```

## Session Management

```
Login Success
    ↓
Set HTTP-only cookie:
  - Name: delivery_session
  - Value: agent_id (UUID)
  - Max-Age: 7 days
  - Secure: true (production)
  - SameSite: strict
    ↓
All API calls check cookie
    ↓
If missing/invalid → 401
    ↓
Frontend redirects to /delivery/login
```

## Database Relationships

```
delivery_agents (1) ──┐
                      │
                      │ has many
                      ▼
        order_delivery_assignments (N)
                      │
                      │ belongs to
                      ▼
                  orders (1)
                      │
                      │ has many
                      ▼
                order_items (N)
                      │
                      │ references
                      ▼
                  medicines (1)


delivery_agents (1) ──┐
                      │
                      │ has many
                      ▼
              ignored_orders (N)
                      │
                      │ references
                      ▼
                  orders (1)
```

## Status Transitions

```
Order Created
    ↓
PAID (customer completes payment)
    ↓
PENDING_DELIVERY (visible to all agents)
    ↓
ACCEPTED_FOR_DELIVERY (agent accepts)
    ↓
OUT_FOR_DELIVERY (agent starts delivery)
    ↓
DELIVERED (delivery complete)
```

## Key Features Summary

✅ **Authentication**: Email-only, session-based
✅ **Dashboard**: Available orders, filtered & sorted
✅ **Order Details**: Full information, accept/ignore
✅ **History**: All accepted orders with status
✅ **Navigation**: Intuitive flow, back buttons
✅ **Security**: Protected routes, session validation
✅ **UX**: Loading states, empty states, confirmations
✅ **Design**: Responsive, modern, clean UI
