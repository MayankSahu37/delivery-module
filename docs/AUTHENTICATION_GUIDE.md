# Authentication Implementation Guide
## Kinde Auth + Supabase Integration for Delivery Agent Module

This document provides a complete guide to implementing Kinde Auth + Supabase authentication for the Delivery Agent Module.

---

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Step-by-Step Implementation](#step-by-step-implementation)
5. [Code Components](#code-components)
6. [Database Schema](#database-schema)
7. [Testing & Troubleshooting](#testing--troubleshooting)
8. [Security Considerations](#security-considerations)

---

## Overview

### Authentication Flow
```
User Login → Kinde Auth → Sync to Supabase → Role Check → Dashboard Access
```

### Key Features
- **OAuth Provider**: Kinde (handles authentication, sessions, tokens)
- **Database**: Supabase (stores user data, roles, profiles)
- **Auto-Sync**: Automatic user synchronization between Kinde and Supabase
- **Role-Based Access**: Supports `delivery_boy` role
- **Account Linking**: Links existing database records to new auth accounts
- **Profile Management**: Automatic profile creation via database triggers

---

## Architecture

### Components
1. **Kinde Auth** - Authentication provider
2. **Supabase** - Database and user management
3. **AuthSync Component** - Client-side sync trigger
4. **API Routes** - Server-side sync logic
5. **Protected Layouts** - Role-based access control

### Data Flow
```
┌─────────────┐
│  Kinde Auth │ (OAuth, Sessions)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Next.js App │
└──────┬──────┘
       │
       ├──► AuthSync Component (Client)
       │
       ├──► /api/auth/sync (Server)
       │
       ▼
┌─────────────┐
│  Supabase   │ (User Data, Roles, Profiles)
└─────────────┘
```

---

## Prerequisites

### 1. Kinde Account Setup
1. Create account at [kinde.com](https://kinde.com)
2. Create a new application
3. Note down:
   - Client ID
   - Client Secret
   - Issuer URL (e.g., `https://yourapp.kinde.com`)

### 2. Supabase Project Setup
1. Create project at [supabase.com](https://supabase.com)
2. Note down:
   - Project URL
   - Anon Key
   - Service Role Key (for admin operations)

### 3. Install Dependencies
```bash
npm install @kinde-oss/kinde-auth-nextjs
npm install @supabase/supabase-js
```

---

## Step-by-Step Implementation

### Step 1: Environment Variables

Create `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Kinde Auth Configuration
KINDE_CLIENT_ID=your-client-id
KINDE_CLIENT_SECRET=your-client-secret
KINDE_ISSUER_URL=https://yourapp.kinde.com
KINDE_SITE_URL=http://localhost:3000
KINDE_POST_LOGOUT_REDIRECT_URL=http://localhost:3000
KINDE_POST_LOGIN_REDIRECT_URL=http://localhost:3000/delivery/dashboard

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important Notes:**
- Update URLs for production deployment
- Keep Service Role Key secure (server-side only)

---

### Step 2: Supabase Client Setup

Update `lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

// Client-side Supabase (uses anon key)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Server-side Supabase Admin (uses service role key)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
```

**Why Two Clients?**
- `supabase`: For client-side operations (respects RLS policies)
- `supabaseAdmin`: For server-side admin operations (bypasses RLS)

---

### Step 3: Kinde Auth Routes

Create `app/api/auth/[kindeAuth]/route.ts`:

```typescript
import { handleAuth } from '@kinde-oss/kinde-auth-nextjs/server';

export const GET = handleAuth();
```

This single file handles all auth routes:
- `/api/auth/login`
- `/api/auth/register`
- `/api/auth/logout`
- `/api/auth/callback`

---

### Step 4: Auth Sync API Route

Create `app/api/auth/sync/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { getUser } = getKindeServerSession();
    const kindeUser = await getUser();
    
    if (!kindeUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user already exists by auth_id
    const { data: existingUserByAuthId } = await supabaseAdmin
      .from('delivery_agents')
      .select('id, email, name, is_active')
      .eq('auth_id', kindeUser.id)
      .maybeSingle();

    if (existingUserByAuthId) {
      return NextResponse.json({ 
        success: true, 
        user: existingUserByAuthId,
        message: 'User already synced'
      });
    }

    // Check if user exists by email (pre-created account)
    const { data: existingUserByEmail } = await supabaseAdmin
      .from('delivery_agents')
      .select('id, email, name, is_active, auth_id')
      .eq('email', kindeUser.email)
      .maybeSingle();

    if (existingUserByEmail) {
      if (existingUserByEmail.auth_id) {
        return NextResponse.json({ 
          error: 'Email already linked to another account' 
        }, { status: 409 });
      }

      // Link auth_id to existing user
      const { data: linkedUser, error: linkError } = await supabaseAdmin
        .from('delivery_agents')
        .update({ auth_id: kindeUser.id })
        .eq('id', existingUserByEmail.id)
        .select()
        .single();

      if (linkError) {
        return NextResponse.json({ error: linkError.message }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        user: linkedUser,
        message: 'Account linked successfully!'
      });
    }

    // Create new delivery agent
    const { data: newUser, error: createError } = await supabaseAdmin
      .from('delivery_agents')
      .insert({
        auth_id: kindeUser.id,
        email: kindeUser.email || '',
        name: `${kindeUser.given_name || ''} ${kindeUser.family_name || ''}`.trim() || kindeUser.email || 'User',
        is_active: true
      })
      .select()
      .single();

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      user: newUser,
      message: 'Account created successfully'
    });

  } catch (error: any) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

**Key Points:**
1. Checks if user exists by `auth_id` (already synced)
2. Checks if user exists by `email` (pre-created, needs linking)
3. Creates new user if neither exists
4. Uses `supabaseAdmin` to bypass RLS policies

---

### Step 5: AuthSync Client Component

Create `components/AuthSync.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthSync() {
  const [synced, setSynced] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function syncUser() {
      if (synced) return;

      try {
        const res = await fetch('/api/auth/sync', {
          method: 'POST',
        });

        const data = await res.json();

        if (data.success) {
          setSynced(true);
          // Refresh if new account or linked
          if (data.message.includes('created') || data.message.includes('linked')) {
            router.refresh();
          }
        } else {
          console.error('Sync failed:', data.error);
        }
      } catch (error) {
        console.error('Sync error:', error);
      }
    }

    syncUser();
  }, [synced, router]);

  return null; // Invisible component
}
```

**Purpose:**
- Runs automatically when user logs in
- Syncs Kinde user to Supabase
- Triggers page refresh if needed
- Runs only once per session

---

### Step 6: Protected Dashboard Layout

Update `app/delivery/layout.tsx`:

```typescript
import { redirect } from 'next/navigation';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { supabase } from '@/lib/supabase';
import AuthSync from '@/components/AuthSync';
import Sidebar from './components/Sidebar';
import { LogoutLink } from '@kinde-oss/kinde-auth-nextjs/components';

export default async function DeliveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication
  const { isAuthenticated, getUser } = getKindeServerSession();
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    redirect('/api/auth/login');
  }

  const user = await getUser();

  // Verify user exists in database
  const { data: dbUser } = await supabase
    .from('delivery_agents')
    .select('id, is_active')
    .eq('auth_id', user?.id)
    .maybeSingle();

  // Check if user exists
  if (!dbUser) {
    redirect('/unauthorized');
  }

  // Check if account is active
  if (!dbUser.is_active) {
    redirect('/account-suspended');
  }

  return (
    <>
      <AuthSync />
      <div className="min-h-screen p-8">
        <div className="dashboard-container-wrapper">
          <Sidebar />
          <main className="delivery-main-integrated">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
```

**Security Features:**
1. Server-side authentication check
2. Database verification
3. Active account check
4. Automatic redirects for unauthorized access
5. AuthSync component included

---

## Database Schema

### Delivery Agents Table Updates

```sql
-- Add auth_id column for Kinde authentication
ALTER TABLE public.delivery_agents 
ADD COLUMN IF NOT EXISTS auth_id TEXT NULL;

-- Add unique constraint
ALTER TABLE public.delivery_agents 
ADD CONSTRAINT delivery_agents_auth_id_key UNIQUE (auth_id);

-- Create index for faster auth lookups
CREATE INDEX IF NOT EXISTS idx_delivery_agents_auth_id 
ON public.delivery_agents USING btree (auth_id);
```

**Updated Schema:**
```sql
CREATE TABLE public.delivery_agents (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  auth_id TEXT NULL,  -- Kinde user ID
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT delivery_agents_pkey PRIMARY KEY (id),
  CONSTRAINT delivery_agents_email_key UNIQUE (email),
  CONSTRAINT delivery_agents_auth_id_key UNIQUE (auth_id)
);
```

---

## Testing & Troubleshooting

### Testing Checklist

1. **New User Registration**
   - [ ] User can register via Kinde
   - [ ] User is created in Supabase `delivery_agents` table
   - [ ] User is redirected to dashboard

2. **Existing User Login**
   - [ ] User can login via Kinde
   - [ ] User data is synced to Supabase
   - [ ] User is redirected to dashboard

3. **Account Linking**
   - [ ] Pre-created agent can link Kinde account
   - [ ] `auth_id` is updated correctly
   - [ ] No duplicate users are created

4. **Session Management**
   - [ ] User stays logged in across page refreshes
   - [ ] Logout works correctly
   - [ ] Session expires appropriately

### Common Issues

**Issue: "User already synced" but can't access dashboard**
- **Solution**: Check if `auth_id` in database matches Kinde user ID
- **Debug**: Log `kindeUser.id` and compare with database

**Issue: "Email already linked to another account"**
- **Solution**: User has multiple Kinde accounts with same email
- **Fix**: Delete duplicate Kinde accounts or use different email

**Issue: AuthSync not triggering**
- **Solution**: Component not included in layout
- **Fix**: Add `<AuthSync />` to delivery layout

**Issue: Infinite redirect loop**
- **Solution**: Authentication check failing
- **Debug**: Check Kinde session and database connection

---

## Security Considerations

### 1. Environment Variables
- ✅ Never commit `.env` files to git
- ✅ Use different keys for development/production
- ✅ Rotate keys periodically
- ✅ Keep Service Role Key server-side only

### 2. API Routes
- ✅ Always verify authentication in API routes
- ✅ Use `supabaseAdmin` only when necessary
- ✅ Validate user roles before data access
- ✅ Sanitize user inputs

### 3. Database Security
- ✅ Enable Row Level Security (RLS) on all tables
- ✅ Create policies for each role
- ✅ Use foreign key constraints
- ✅ Audit sensitive operations

### 4. Session Management
- ✅ Use secure cookies (httpOnly, secure, sameSite)
- ✅ Implement session timeout
- ✅ Clear sessions on logout
- ✅ Validate session on each request

---

## Production Deployment

### 1. Update Environment Variables
```env
KINDE_SITE_URL=https://delivery.aurasutra.com
KINDE_POST_LOGOUT_REDIRECT_URL=https://delivery.aurasutra.com
KINDE_POST_LOGIN_REDIRECT_URL=https://delivery.aurasutra.com/delivery/dashboard
NEXT_PUBLIC_APP_URL=https://delivery.aurasutra.com
```

### 2. Kinde Dashboard Settings
- Add production URLs to allowed callbacks
- Add production URLs to allowed logout redirects
- Enable production mode

### 3. Supabase Settings
- Update RLS policies for production
- Enable email verification (optional)
- Configure custom SMTP (optional)

### 4. Security Checklist
- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] Database backups configured
- [ ] Error logging setup
- [ ] Rate limiting implemented
- [ ] CORS configured correctly

---

**Document Version**: 1.0  
**Last Updated**: February 2026  
**Module**: Delivery Agent Module
