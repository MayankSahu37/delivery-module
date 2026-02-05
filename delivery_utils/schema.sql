-- Database Schema for Delivery Module

-- 1. Delivery Agents Table
CREATE TABLE IF NOT EXISTS public.delivery_agents (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    name text NOT NULL,
    email text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp within time zone DEFAULT now(),
    CONSTRAINT delivery_agents_pkey PRIMARY KEY (id),
    CONSTRAINT delivery_agents_email_key UNIQUE (email)
);

-- 2. Update Orders Table (if needed) to support new statuses
-- Ensure the status check constraint includes delivery statuses
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check 
CHECK (status IN (
    'pending', 
    'paid', 
    'cancelled', 
    'PENDING_DELIVERY', 
    'ACCEPTED_FOR_DELIVERY', 
    'OUT_FOR_DELIVERY', 
    'DELIVERED'
));

-- 3. Order Delivery Assignments Table
CREATE TABLE IF NOT EXISTS public.order_delivery_assignments (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    order_id uuid NOT NULL,
    delivery_boy_id uuid NOT NULL,
    assigned_at timestamp within time zone DEFAULT now(),
    CONSTRAINT order_delivery_assignments_pkey PRIMARY KEY (id),
    CONSTRAINT order_delivery_assignments_order_id_key UNIQUE (order_id), -- One active assignment per order
    CONSTRAINT order_delivery_assignments_delivery_boy_id_fkey FOREIGN KEY (delivery_boy_id) REFERENCES public.delivery_agents(id) ON DELETE CASCADE,
    CONSTRAINT order_delivery_assignments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE
);

-- 4. Ignored Orders Table (Delivery boys can hide orders they don't want)
CREATE TABLE IF NOT EXISTS public.ignored_orders (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    order_id uuid NOT NULL,
    delivery_boy_id uuid NOT NULL,
    ignored_at timestamp within time zone DEFAULT now(),
    CONSTRAINT ignored_orders_pkey PRIMARY KEY (id),
    CONSTRAINT ignored_orders_delivery_boy_id_fkey FOREIGN KEY (delivery_boy_id) REFERENCES public.delivery_agents(id) ON DELETE CASCADE,
    CONSTRAINT ignored_orders_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_assignments_delivery_boy ON public.order_delivery_assignments(delivery_boy_id);
CREATE INDEX IF NOT EXISTS idx_ignored_delivery_boy ON public.ignored_orders(delivery_boy_id);
