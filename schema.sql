-- Enable UUID extension (usually already enabled)
create extension if not exists "uuid-ossp";

-- 1. Modify Existing Orders Table to support Delivery Module
-- Drop old constraint to allow new statuses
alter table public.orders drop constraint if exists orders_status_check;

-- Add new constraint with all statuses
alter table public.orders add constraint orders_status_check check (
  status = any (
    array[
      'pending'::text, 
      'paid'::text, 
      'cancelled'::text,
      'PENDING_DELIVERY'::text,
      'ACCEPTED_FOR_DELIVERY'::text,
      'OUT_FOR_DELIVERY'::text,
      'DELIVERED'::text
    ]
  )
);

-- 2. New Tables for Delivery Module

-- Delivery Agents
create table if not exists delivery_agents (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text unique not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Assignments
create table if not exists order_delivery_assignments (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid unique not null references orders(id) on delete cascade,
  delivery_boy_id uuid not null references delivery_agents(id) on delete cascade,
  assigned_at timestamptz default now()
);

-- Ignored Orders (Per agent)
create table if not exists ignored_orders (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  delivery_boy_id uuid not null references delivery_agents(id) on delete cascade,
  ignored_at timestamptz default now(),
  unique(order_id, delivery_boy_id)
);

-- 3. Seed Data
-- Insert a test delivery agent
insert into delivery_agents (name, email)
values ('John Doe', 'john@delivery.com')
on conflict (email) do nothing;

-- NOTE: We are NOT inserting orders here anymore to avoid conflicting with your existing flows.
-- You should manually update some existing 'paid' orders to 'PENDING_DELIVERY' to test.
-- Example: update orders set status = 'PENDING_DELIVERY' where status = 'paid';
