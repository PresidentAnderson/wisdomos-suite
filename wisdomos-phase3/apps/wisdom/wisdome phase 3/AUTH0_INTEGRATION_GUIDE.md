# 🔐 Auth0 Integration Guide for WisdomOS Phase 3

## Overview

This guide provides step-by-step instructions for integrating Auth0 as an **optional enterprise authentication provider** alongside the existing demo account system. Users can choose between Demo Mode (localStorage) or Enterprise SSO (Auth0).

## Table of Contents

1. [Installation](#1-installation)
2. [Environment Configuration](#2-environment-configuration)
3. [Auth0 API Routes](#3-auth0-api-routes)
4. [User Mapping Service](#4-user-mapping-service)
5. [Auth0 Provider Components](#5-auth0-provider-components)
6. [Login Page Updates](#6-login-page-updates)
7. [Auth Context Integration](#7-auth-context-integration)
8. [Testing Procedures](#8-testing-procedures)
9. [Deployment](#9-deployment)
10. [Security & Troubleshooting](#10-security--troubleshooting)

---

## 1. Installation

### Step 1.1: Install Auth0 Next.js SDK

Navigate to the web app directory and install the Auth0 SDK:

```bash
cd apps/web
npm install @auth0/nextjs-auth0
```

### Step 1.2: Verify Installation

Check that the package was added to `apps/web/package.json`:

```json
{
  "dependencies": {
    "@auth0/nextjs-auth0": "^3.5.0"
  }
}
```

### Step 1.3: Generate Auth0 Secret

Generate a secure random secret for JWT signing:

```bash
openssl rand -hex 32
```

Save this value - you'll need it for environment configuration.

---

## 2. Environment Configuration

### Step 2.1: Create Local Environment File

Create `apps/web/.env.local` with your Auth0 credentials:

```bash
# Auth0 Configuration
AUTH0_SECRET='<output-from-openssl-rand-hex-32>'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://dev-m3j455d2hx0gmorh.us.auth0.com'
AUTH0_CLIENT_ID='<get-from-auth0-dashboard>'
AUTH0_CLIENT_SECRET='<get-from-auth0-dashboard>'
AUTH0_AUDIENCE='https://api.wisdomos.com'
AUTH0_SCOPE='openid profile email read:users update:users read:appointments create:appointments delete:appointments read:insights'

# Feature Flag - Enable Auth0 Login Option
NEXT_PUBLIC_ENABLE_AUTH0='true'
```

### Step 2.2: Update Example Environment File

Add Auth0 configuration template to `apps/web/.env.example`:

```bash
# ============================================
# Auth0 (Optional - Enterprise SSO)
# ============================================
# Generate secret: openssl rand -hex 32
AUTH0_SECRET=
# Base URL for your application
AUTH0_BASE_URL=http://localhost:3000
# Your Auth0 tenant domain
AUTH0_ISSUER_BASE_URL=https://dev-m3j455d2hx0gmorh.us.auth0.com
# Auth0 Application Client ID
AUTH0_CLIENT_ID=
# Auth0 Application Client Secret (keep secure!)
AUTH0_CLIENT_SECRET=
# API Identifier from Auth0 dashboard
AUTH0_AUDIENCE=https://api.wisdomos.com
# OAuth scopes to request
AUTH0_SCOPE=openid profile email read:users update:users read:appointments create:appointments delete:appointments read:insights
# Enable Auth0 login option (set to 'false' to disable)
NEXT_PUBLIC_ENABLE_AUTH0=false
```

### Step 2.3: Get Auth0 Credentials

1. **Login to Auth0 Dashboard:** https://manage.auth0.com/
2. **Navigate to:** Applications → Applications → WisdomOS API
3. **Copy values:**
   - Domain → `AUTH0_ISSUER_BASE_URL`
   - Client ID → `AUTH0_CLIENT_ID`
   - Client Secret → `AUTH0_CLIENT_SECRET`
4. **API Settings:**
   - Navigate to: Applications → APIs → WisdomOS API
   - Copy Identifier → `AUTH0_AUDIENCE`

---

## 3. Auth0 API Routes

### Step 3.1: Create Auth0 Dynamic Route Handler

**File:** `apps/web/app/api/auth/[auth0]/route.ts`

```typescript
import { handleAuth, handleLogin, handleCallback, handleLogout } from '@auth0/nextjs-auth0';

/**
 * Auth0 Dynamic Route Handler
 *
 * Handles all Auth0 authentication flows:
 * - /api/auth/login - Initiates login
 * - /api/auth/callback - OAuth callback
 * - /api/auth/logout - Logs user out
 * - /api/auth/me - Returns current user
 */
export const GET = handleAuth({
  login: handleLogin({
    returnTo: '/dashboard',
    authorizationParams: {
      audience: process.env.AUTH0_AUDIENCE,
      scope: process.env.AUTH0_SCOPE,
    },
  }),

  callback: handleCallback({
    afterCallback: async (req, session) => {
      // Custom logic after successful Auth0 authentication
      console.log('Auth0 callback successful:', session.user.email);

      // Session is automatically created by SDK
      // User mapping happens in /api/auth/sync-user
      return session;
    },
  }),

  logout: handleLogout({
    returnTo: '/auth/login',
  }),

  onError(req, error) {
    console.error('Auth0 authentication error:', error);
  },
});
```

### Step 3.2: Create User Sync API Route

**File:** `apps/web/app/api/auth/sync-user/route.ts`

```typescript
import { getSession } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';
import {
  getUserByEmailFromLocalStorage,
  storeUserInLocalStorage,
  storeTenantInLocalStorage,
  generateId,
  getDefaultPreferences,
  getAllPermissions,
  getDefaultTenantSettings,
  generateSlug,
  type User,
  type Tenant
} from '@/lib/auth';

/**
 * User Sync API Route
 *
 * Maps Auth0 authenticated users to WisdomOS user/tenant system
 * Creates new user and tenant on first login
 * Updates existing user on subsequent logins
 */
export async function POST(request: Request) {
  try {
    // Get Auth0 session
    const session = await getSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const auth0User = session.user;

    // Normalize email
    const normalizedEmail = auth0User.email.toLowerCase().trim();

    // Check if user exists in WisdomOS
    let wisdomUser = getUserByEmailFromLocalStorage(normalizedEmail);

    if (!wisdomUser) {
      console.log('Creating new WisdomOS user for Auth0 user:', normalizedEmail);

      // Generate IDs for new user and tenant
      const userId = generateId();
      const tenantId = generateId();

      // Create tenant first
      const newTenant: Tenant = {
        id: tenantId,
        name: `${auth0User.name || auth0User.email}'s Workspace`,
        slug: generateSlug(auth0User.name || auth0User.email),
        ownerId: userId,
        plan: 'free',
        settings: getDefaultTenantSettings(`${auth0User.name || auth0User.email}'s Workspace`),
        createdAt: new Date(),
        updatedAt: new Date(),
        members: []
      };

      // Create WisdomOS user mapped to Auth0 user
      wisdomUser = {
        id: userId,
        email: normalizedEmail,
        name: auth0User.name || auth0User.email,
        dateOfBirth: auth0User.user_metadata?.dateOfBirth,
        avatar: auth0User.picture,
        tenantId: tenantId,
        role: 'owner',
        createdAt: new Date(),
        lastLoginAt: new Date(),
        preferences: auth0User.user_metadata?.wisdomosPreferences || getDefaultPreferences(),
        auth0Sub: auth0User.sub // Store Auth0 subject identifier
      };

      // Add user as owner to tenant members
      newTenant.members = [{
        userId: wisdomUser.id,
        tenantId: tenantId,
        role: 'owner',
        permissions: getAllPermissions(),
        invitedAt: new Date(),
        joinedAt: new Date(),
        invitedBy: wisdomUser.id
      }];

      // Store in localStorage
      storeUserInLocalStorage(wisdomUser);
      storeTenantInLocalStorage(newTenant);

      console.log('New user and tenant created:', {
        userId: wisdomUser.id,
        tenantId: newTenant.id,
        email: wisdomUser.email
      });
    } else {
      console.log('Existing WisdomOS user found:', normalizedEmail);

      // Update existing user
      wisdomUser.lastLoginAt = new Date();

      // Store Auth0 sub if not already present
      if (!wisdomUser.auth0Sub) {
        wisdomUser.auth0Sub = auth0User.sub;
      }

      // Update avatar if changed
      if (auth0User.picture && auth0User.picture !== wisdomUser.avatar) {
        wisdomUser.avatar = auth0User.picture;
      }

      storeUserInLocalStorage(wisdomUser);
    }

    return NextResponse.json({
      user: wisdomUser,
      isNewUser: !getUserByEmailFromLocalStorage(normalizedEmail)
    });
  } catch (error) {
    console.error('User sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
```

---

## 4. User Mapping Service

### Step 4.1: Update User Interface

**File:** `apps/web/lib/auth.ts`

Add the `auth0Sub` field to the User interface:

```typescript
export interface User {
  id: string;
  email: string;
  name: string;
  dateOfBirth?: string;
  avatar?: string;
  tenantId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  createdAt: Date;
  lastLoginAt?: Date;
  preferences: UserPreferences;
  auth0Sub?: string; // ← ADD THIS LINE
}
```

### Step 4.2: Create Auth0 User Mapper Utility

**File:** `apps/web/lib/auth0-user-mapper.ts` (NEW FILE)

```typescript
/**
 * Auth0 User Mapping Utilities
 *
 * Provides functions to map between Auth0 users and WisdomOS users
 * Handles metadata synchronization between systems
 */

import { User, Tenant } from './auth';

/**
 * Auth0 User Profile Structure
 * Based on Auth0 OIDC standard claims + custom metadata
 */
export interface Auth0User {
  sub: string;                    // Auth0 unique identifier
  name: string;                   // Full name
  email: string;                  // Email address
  email_verified: boolean;        // Email verification status
  picture?: string;               // Profile picture URL
  updated_at?: string;            // Last profile update

  // Custom user metadata (editable by user)
  user_metadata?: {
    dateOfBirth?: string;
    wisdomosPreferences?: any;
    phoneNumber?: string;
  };

  // Application metadata (managed by system)
  app_metadata?: {
    tenantId?: string;
    role?: string;
    wisdomUserId?: string;
  };
}

/**
 * Map Auth0 user profile to WisdomOS User
 *
 * @param auth0User - Auth0 user profile from session
 * @param wisdomUserId - Generated WisdomOS user ID
 * @param tenantId - Associated tenant ID
 * @returns WisdomOS User object
 */
export function mapAuth0UserToWisdomUser(
  auth0User: Auth0User,
  wisdomUserId: string,
  tenantId: string
): User {
  return {
    id: wisdomUserId,
    email: auth0User.email.toLowerCase().trim(),
    name: auth0User.name || auth0User.email,
    dateOfBirth: auth0User.user_metadata?.dateOfBirth,
    avatar: auth0User.picture,
    tenantId: tenantId,
    role: (auth0User.app_metadata?.role as any) || 'owner',
    createdAt: new Date(),
    lastLoginAt: new Date(),
    preferences: auth0User.user_metadata?.wisdomosPreferences || {
      theme: 'light',
      language: 'en',
      notifications: {
        email: true,
        push: false,
        sms: false
      },
      privacy: {
        shareData: false,
        publicProfile: false
      }
    },
    auth0Sub: auth0User.sub
  };
}

/**
 * Create Auth0 metadata object from WisdomOS user
 * Used to sync WisdomOS data back to Auth0 profile
 *
 * @param user - WisdomOS user
 * @returns Auth0 metadata update object
 */
export function syncWisdomUserToAuth0Metadata(user: User) {
  return {
    user_metadata: {
      dateOfBirth: user.dateOfBirth,
      wisdomosPreferences: user.preferences,
      lastSyncedAt: new Date().toISOString()
    },
    app_metadata: {
      tenantId: user.tenantId,
      role: user.role,
      wisdomUserId: user.id
    }
  };
}

/**
 * Extract permissions from Auth0 token
 * Maps Auth0 RBAC permissions to WisdomOS permission structure
 *
 * @param permissions - Array of permission strings from Auth0 token
 * @returns WisdomOS permission objects
 */
export function mapAuth0PermissionsToWisdomOS(permissions: string[]) {
  const permissionMap: Record<string, { resource: string; actions: string[] }> = {};

  permissions.forEach(perm => {
    const [action, resource] = perm.split(':');

    if (!permissionMap[resource]) {
      permissionMap[resource] = { resource, actions: [] };
    }

    permissionMap[resource].actions.push(action);
  });

  return Object.values(permissionMap);
}

/**
 * Determine user role based on Auth0 permissions
 *
 * @param permissions - Array of Auth0 permission strings
 * @returns WisdomOS role
 */
export function determineRoleFromPermissions(permissions: string[]): 'owner' | 'admin' | 'member' | 'viewer' {
  if (permissions.includes('manage:system')) {
    return 'owner';
  }
  if (permissions.includes('update:users')) {
    return 'admin';
  }
  if (permissions.includes('create:appointments')) {
    return 'member';
  }
  return 'viewer';
}
```

---

## 5. Auth0 Provider Components

### Step 5.1: Create Auth0 Login Button Component

**File:** `apps/web/components/auth/Auth0LoginButton.tsx` (NEW FILE)

```typescript
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import PhoenixButton from '@/components/ui/PhoenixButton'
import { LogIn, Shield } from 'lucide-react'

/**
 * Auth0 Login Button Component
 *
 * Redirects to Auth0 Universal Login page
 * Displays enterprise SSO branding
 */
export default function Auth0LoginButton() {
  const handleAuth0Login = () => {
    // Redirect to Auth0 login endpoint
    window.location.href = '/api/auth/login'
  }

  return (
    <div className="space-y-4">
      <PhoenixButton
        onClick={handleAuth0Login}
        className="w-full"
        size="lg"
        variant="primary"
      >
        <Shield className="w-5 h-5 mr-2" />
        Continue with Auth0
      </PhoenixButton>

      <div className="text-center text-sm text-gray-600">
        <p>Secure enterprise authentication</p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <Shield className="w-4 h-4 text-phoenix-orange" />
          <span className="text-xs font-medium">Powered by Auth0</span>
        </div>
      </div>

      <motion.div
        className="bg-gradient-to-r from-phoenix-gold/10 to-phoenix-orange/10 rounded-lg p-4 border border-phoenix-gold/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-xs text-gray-700">
          <strong>Enterprise SSO Benefits:</strong>
        </p>
        <ul className="text-xs text-gray-600 mt-2 space-y-1">
          <li>• Single Sign-On across applications</li>
          <li>• Multi-factor authentication support</li>
          <li>• Centralized user management</li>
          <li>• Enhanced security & compliance</li>
        </ul>
      </motion.div>
    </div>
  )
}
```

### Step 5.2: Create Login Mode Selector Component

**File:** `apps/web/components/auth/LoginModeSelector.tsx` (NEW FILE)

```typescript
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { User, Shield } from 'lucide-react'

interface LoginModeSelectorProps {
  mode: 'demo' | 'auth0'
  onModeChange: (mode: 'demo' | 'auth0') => void
}

/**
 * Login Mode Selector Component
 *
 * Allows users to switch between Demo Mode and Auth0 SSO
 * Displays appropriate description for each mode
 */
export default function LoginModeSelector({ mode, onModeChange }: LoginModeSelectorProps) {
  return (
    <div className="mb-6">
      <div className="flex rounded-xl bg-gray-100 p-1">
        <button
          onClick={() => onModeChange('demo')}
          className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            mode === 'demo'
              ? 'bg-white shadow-md text-black'
              : 'text-gray-600 hover:text-black'
          }`}
        >
          <User className="w-4 h-4" />
          Demo Mode
        </button>

        <button
          onClick={() => onModeChange('auth0')}
          className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            mode === 'auth0'
              ? 'bg-white shadow-md text-black'
              : 'text-gray-600 hover:text-black'
          }`}
        >
          <Shield className="w-4 h-4" />
          Enterprise SSO
        </button>
      </div>

      <motion.p
        key={mode}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xs text-gray-500 mt-3 text-center"
      >
        {mode === 'demo'
          ? '🎮 Quick access with demo credentials - perfect for testing'
          : '🔒 Secure authentication via Auth0 - enterprise-grade security'}
      </motion.p>
    </div>
  )
}
```

---

## 6. Login Page Updates

### Step 6.1: Update Login Page Component

**File:** `apps/web/app/auth/login/page.tsx`

Add these imports at the top of the file:

```typescript
import Auth0LoginButton from '@/components/auth/Auth0LoginButton'
import LoginModeSelector from '@/components/auth/LoginModeSelector'
import { useState } from 'react'
```

Add state for login mode after existing state declarations:

```typescript
const [loginMode, setLoginMode] = useState<'demo' | 'auth0'>('demo')
const isAuth0Enabled = process.env.NEXT_PUBLIC_ENABLE_AUTH0 === 'true'
```

Update the form section to conditionally render based on mode. Replace the existing form with:

```tsx
{/* Login Mode Selector - Only show if Auth0 is enabled */}
{isAuth0Enabled && (
  <LoginModeSelector
    mode={loginMode}
    onModeChange={setLoginMode}
  />
)}

{/* Conditional Rendering Based on Login Mode */}
{loginMode === 'auth0' && isAuth0Enabled ? (
  // Auth0 SSO Login
  <Auth0LoginButton />
) : (
  // Existing Demo/Email-Password Login
  <form onSubmit={handleLogin} className="space-y-6">
    {error && (
      <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
        <p className="text-black text-sm">{error}</p>
      </div>
    )}

    {/* Email Input */}
    <div>
      <label className="block text-sm font-medium text-black mb-2">
        Email Address
      </label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-phoenix-orange focus:border-transparent text-black"
        placeholder="Enter your email"
        required
        disabled={isLoading}
      />
    </div>

    {/* Password Input */}
    <div>
      <label className="block text-sm font-medium text-black mb-2">
        Password
      </label>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-phoenix-orange focus:border-transparent text-black"
          placeholder="Enter your password"
          required
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-3 text-black hover:text-black"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
    </div>

    {/* Submit Button */}
    <PhoenixButton
      type="submit"
      disabled={isLoading}
      className="w-full"
      size="lg"
    >
      {isLoading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
        />
      ) : (
        <>
          <LogIn className="w-5 h-5 mr-2" />
          Sign In
        </>
      )}
    </PhoenixButton>

    {/* Demo Account Section - Existing code */}
    <motion.div className="mt-6 p-4 bg-gradient-to-r from-phoenix-gold/10 to-phoenix-orange/10 rounded-lg border border-phoenix-gold/30">
      <h3 className="text-sm font-semibold text-black mb-2 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-black" />
        Demo Account
      </h3>
      <div className="space-y-1 text-xs mb-3">
        <div><span className="font-medium">Email:</span> demo@wisdomos.com</div>
        <div><span className="font-medium">Password:</span> password123</div>
      </div>
      <PhoenixButton
        type="button"
        onClick={handleDemoLogin}
        variant="ghost"
        size="sm"
        className="w-full"
      >
        Login with Demo Account
      </PhoenixButton>
    </motion.div>
  </form>
)}
```

---

## 7. Auth Context Integration

### Step 7.1: Update Auth Context to Support Auth0

**File:** `apps/web/lib/auth-context.tsx`

Add Auth0 import at the top:

```typescript
import { useUser } from '@auth0/nextjs-auth0/client'
```

Update the AuthProvider function to check Auth0 session:

```typescript
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for Auth0 session
  const { user: auth0User, isLoading: auth0Loading } = useUser()

  // Initialize auth state from Auth0 or localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Priority 1: Check Auth0 session
        if (auth0User) {
          console.log('Auth0 user detected:', auth0User.email)

          // Sync Auth0 user to WisdomOS system
          const response = await fetch('/api/auth/sync-user', {
            method: 'POST'
          })

          if (response.ok) {
            const { user: wisdomUser } = await response.json()
            const userTenant = localStorage.getItem(`wisdomos_tenant_${wisdomUser.tenantId}`)

            if (userTenant) {
              setUser(wisdomUser)
              setTenant(JSON.parse(userTenant))
              // Auth0 manages JWT tokens via cookies, no need for localStorage token
              console.log('Auth0 user synced to WisdomOS:', wisdomUser.email)
            }
          } else {
            console.error('Failed to sync Auth0 user')
          }
        } else {
          // Priority 2: Fall back to localStorage auth (Demo Mode)
          const storedToken = localStorage.getItem('wisdomos_auth_token')
          if (storedToken) {
            const payload = verifyToken(storedToken)
            if (payload) {
              const storedUser = localStorage.getItem(`wisdomos_user_${payload.userId}`)
              const storedTenant = localStorage.getItem(`wisdomos_tenant_${payload.tenantId}`)

              if (storedUser && storedTenant) {
                setUser(JSON.parse(storedUser))
                setTenant(JSON.parse(storedTenant))
                setToken(storedToken)
                console.log('Demo user loaded from localStorage')
              }
            }
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error)
        localStorage.removeItem('wisdomos_auth_token')
      } finally {
        setIsLoading(false)
      }
    }

    // Only initialize after Auth0 loading completes
    if (!auth0Loading) {
      initializeAuth()
    }
  }, [auth0User, auth0Loading])

  // Update logout to handle both Auth0 and Demo mode
  const logout = () => {
    setUser(null)
    setTenant(null)
    setToken(null)
    localStorage.removeItem('wisdomos_auth_token')

    // If Auth0 user exists, redirect to Auth0 logout
    if (auth0User) {
      console.log('Logging out from Auth0')
      window.location.href = '/api/auth/logout'
    } else {
      console.log('Logging out from Demo mode')
      // Demo mode logout handled by clearing state above
    }
  }

  // Rest of the existing code remains unchanged...
  const login = async (email: string, password: string, tenantSlug?: string): Promise<void> => {
    // ... existing login code ...
  }

  const register = async (email: string, password: string, name: string, dateOfBirth?: string, tenantName?: string): Promise<void> => {
    // ... existing register code ...
  }

  // ... rest of existing methods ...

  const value: AuthContextType = {
    user,
    tenant,
    token,
    isLoading,
    login,
    register,
    logout,
    switchTenant,
    createTenant,
    inviteUser,
    acceptInvite,
    shareData,
    hasPermission,
    getCurrentMembership
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
```

### Step 7.2: Wrap App with UserProvider

**File:** `apps/web/app/layout.tsx`

Import UserProvider from Auth0 SDK:

```typescript
import { UserProvider } from '@auth0/nextjs-auth0/client'
```

Wrap the AuthProvider with UserProvider:

```tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-black`}>
        <UserProvider>
          <AuthProvider>
            <LifeAreasProvider>
              <ToastProvider>
                <DemoDataInitializer />
                <div className="flex flex-col min-h-screen">
                  <Navigation />
                  <div className="phoenix-glow flex-1">
                    {children}
                  </div>
                  <Footer />
                </div>
              </ToastProvider>
            </LifeAreasProvider>
          </AuthProvider>
        </UserProvider>
      </body>
    </html>
  )
}
```

---

## 8. Testing Procedures

### Test 8.1: Verify Installation

```bash
# Check Auth0 SDK is installed
npm list @auth0/nextjs-auth0

# Expected output:
# @auth0/nextjs-auth0@3.5.0
```

### Test 8.2: Test Demo Mode (Existing Flow)

1. **Start development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to login page:**
   ```
   http://localhost:3000/auth/login
   ```

3. **Verify mode selector appears** (if `NEXT_PUBLIC_ENABLE_AUTH0=true`)

4. **Select "Demo Mode"**

5. **Test demo account login:**
   - Email: `demo@wisdomos.com`
   - Password: `password123`

6. **Expected behavior:**
   - ✅ Successful login
   - ✅ Redirect to `/dashboard`
   - ✅ User info visible in navigation
   - ✅ Demo data loaded

7. **Test logout:**
   - Click logout button
   - ✅ Redirect to login page
   - ✅ Session cleared

### Test 8.3: Test Auth0 SSO Mode

1. **Set environment variable:**
   ```bash
   NEXT_PUBLIC_ENABLE_AUTH0=true
   ```

2. **Navigate to login page:**
   ```
   http://localhost:3000/auth/login
   ```

3. **Switch to "Enterprise SSO" mode**

4. **Click "Continue with Auth0"**

5. **Expected behavior:**
   - ✅ Redirect to Auth0 Universal Login
   - ✅ URL contains: `dev-m3j455d2hx0gmorh.us.auth0.com`

6. **Complete Auth0 login:**
   - Enter Auth0 account credentials
   - OR use social login (if configured)

7. **After authentication:**
   - ✅ Redirect to `/dashboard`
   - ✅ New user created in localStorage
   - ✅ New tenant auto-created
   - ✅ User info visible in navigation

8. **Test session persistence:**
   - Refresh page
   - ✅ User remains logged in
   - ✅ Session restored from Auth0 cookie

9. **Test logout:**
   - Click logout button
   - ✅ Redirect to Auth0 logout
   - ✅ Then redirect to `/auth/login`
   - ✅ Session fully cleared

### Test 8.4: Test Mode Switching

1. **Login with Auth0**
2. **Logout**
3. **Switch to Demo Mode**
4. **Login with demo credentials**
5. **Expected behavior:**
   - ✅ Both modes work independently
   - ✅ No conflicts between auth methods
   - ✅ Correct user loaded for each mode

### Test 8.5: Test First-Time Auth0 User

Open browser DevTools console to see logs:

```javascript
// Should see:
"Auth0 user detected: user@example.com"
"Creating new WisdomOS user for Auth0 user: user@example.com"
"New user and tenant created: { userId: '...', tenantId: '...', email: '...' }"
"Auth0 user synced to WisdomOS: user@example.com"
```

Verify in Application → Local Storage:
- `wisdomos_user_<userId>` exists
- `wisdomos_tenant_<tenantId>` exists
- User has `auth0Sub` field

### Test 8.6: Test Returning Auth0 User

Login again with same Auth0 account:

```javascript
// Should see:
"Auth0 user detected: user@example.com"
"Existing WisdomOS user found: user@example.com"
"Auth0 user synced to WisdomOS: user@example.com"
```

Verify:
- Same `userId` and `tenantId` as before
- `lastLoginAt` timestamp updated
- No duplicate users created

### Test 8.7: API Route Testing

Test sync endpoint manually:

```bash
# With Auth0 session active
curl -X POST http://localhost:3000/api/auth/sync-user \
  -H "Cookie: appSession=<session-cookie>" \
  -v

# Expected response:
{
  "user": {
    "id": "...",
    "email": "user@example.com",
    "name": "User Name",
    "tenantId": "...",
    "role": "owner",
    "auth0Sub": "auth0|..."
  },
  "isNewUser": false
}
```

---

## 9. Deployment

### Step 9.1: Auth0 Dashboard Configuration

Before deploying, configure Auth0 application settings:

1. **Navigate to:** Applications → Applications → [Your App]

2. **Add Allowed Callback URLs:**
   ```
   http://localhost:3000/api/auth/callback
   https://your-app.vercel.app/api/auth/callback
   https://your-custom-domain.com/api/auth/callback
   ```

3. **Add Allowed Logout URLs:**
   ```
   http://localhost:3000
   https://your-app.vercel.app
   https://your-custom-domain.com
   ```

4. **Add Allowed Web Origins:**
   ```
   http://localhost:3000
   https://your-app.vercel.app
   https://your-custom-domain.com
   ```

5. **Save Changes**

### Step 9.2: Vercel Environment Variables

Add these environment variables in Vercel project settings:

**Required:**
```bash
AUTH0_SECRET=<generated-with-openssl-rand-hex-32>
AUTH0_BASE_URL=https://your-app.vercel.app
AUTH0_ISSUER_BASE_URL=https://dev-m3j455d2hx0gmorh.us.auth0.com
AUTH0_CLIENT_ID=<your-client-id>
AUTH0_CLIENT_SECRET=<your-client-secret>
AUTH0_AUDIENCE=https://api.wisdomos.com
AUTH0_SCOPE=openid profile email read:users update:users read:appointments create:appointments delete:appointments read:insights
NEXT_PUBLIC_ENABLE_AUTH0=true
```

**Optional (for production):**
```bash
AUTH0_COOKIE_DOMAIN=.your-domain.com
AUTH0_COOKIE_SAME_SITE=lax
AUTH0_SESSION_ABSOLUTE_DURATION=604800
```

### Step 9.3: Deploy to Production

```bash
# Commit all changes
git add .
git commit -m "feat: Add Auth0 SSO integration as optional provider

- Installed @auth0/nextjs-auth0 SDK
- Added Auth0 API routes for login/callback/logout
- Created user sync system for Auth0 users
- Added login mode selector (Demo/Enterprise SSO)
- Updated auth context to support both auth methods
- Created comprehensive integration guide

Users can now choose between Demo Mode and Auth0 SSO.
Both modes integrate seamlessly with multi-tenant system."

# Push to trigger Vercel deployment
git push origin main
```

### Step 9.4: Verify Production Deployment

1. **Check Vercel deployment logs** for any errors

2. **Visit production URL:**
   ```
   https://your-app.vercel.app/auth/login
   ```

3. **Test Auth0 flow in production:**
   - Switch to Enterprise SSO
   - Complete Auth0 login
   - Verify redirect works
   - Check user is created
   - Test logout

4. **Monitor Auth0 Dashboard:**
   - Logs → Check for successful logins
   - Users → Verify new users appear

---

## 10. Security & Troubleshooting

### Security Best Practices

#### ✅ Production Security Checklist

- [ ] Use HTTPS in production (required for Auth0)
- [ ] Rotate `AUTH0_SECRET` every 90 days
- [ ] Never commit `.env.local` to git
- [ ] Enable MFA in Auth0 dashboard
- [ ] Review Auth0 audit logs regularly
- [ ] Keep `@auth0/nextjs-auth0` updated
- [ ] Use HttpOnly cookies (handled by SDK)
- [ ] Validate tokens on all API routes
- [ ] Never expose `CLIENT_SECRET` to frontend
- [ ] Use environment-specific Auth0 tenants (dev/staging/prod)
- [ ] Implement rate limiting on auth endpoints
- [ ] Enable Auth0 anomaly detection
- [ ] Configure Auth0 brute force protection
- [ ] Set appropriate token expiration times
- [ ] Use Auth0 Organizations for multi-tenancy (future)

#### 🔒 Cookie Security

The Auth0 SDK automatically sets secure cookie flags:

```javascript
{
  httpOnly: true,        // Prevents XSS access
  secure: true,          // HTTPS only (production)
  sameSite: 'lax',       // CSRF protection
  maxAge: 604800         // 7 days (configurable)
}
```

### Common Issues & Solutions

#### Issue 1: "Callback URL mismatch"

**Error Message:**
```
Callback URL mismatch. The provided redirect_uri is not in the list of allowed callback URLs
```

**Solution:**
1. Check Auth0 dashboard → Application Settings
2. Verify callback URL matches exactly:
   - Local: `http://localhost:3000/api/auth/callback`
   - Production: `https://your-domain.com/api/auth/callback`
3. **No trailing slashes!**
4. Save changes and clear browser cache

#### Issue 2: "Invalid state parameter"

**Error Message:**
```
state mismatch, expected <hash>, got: <different-hash>
```

**Solution:**
1. Clear all cookies for your domain
2. Clear localStorage
3. Try in incognito window
4. Verify `AUTH0_SECRET` is set correctly
5. Check cookie domain configuration

#### Issue 3: "User not syncing to WisdomOS"

**Symptoms:**
- Auth0 login succeeds
- Redirect happens
- But user not created in localStorage

**Debug Steps:**
```javascript
// Check browser console for errors
// Open DevTools → Console

// Check if sync endpoint is being called
// Network tab → Filter: "sync-user"

// Manually test sync endpoint
const response = await fetch('/api/auth/sync-user', { method: 'POST' })
const data = await response.json()
console.log(data)
```

**Solution:**
1. Check `/api/auth/sync-user` logs
2. Verify Auth0 session exists: `await getSession()`
3. Check localStorage permissions
4. Verify user email is not malformed

#### Issue 4: "Demo mode not working after enabling Auth0"

**Solution:**
1. Ensure mode selector is visible
2. Click "Demo Mode" button
3. Verify `loginMode` state = `'demo'`
4. Check conditional rendering logic:
   ```tsx
   {loginMode === 'auth0' ? <Auth0Login /> : <DemoLogin />}
   ```

#### Issue 5: "Session not persisting after refresh"

**Solution:**
1. Check Auth0 cookie is set:
   - DevTools → Application → Cookies
   - Look for `appSession` cookie
2. Verify `AUTH0_BASE_URL` matches your domain
3. Check cookie sameSite settings
4. Ensure HTTPS in production

#### Issue 6: "Token expired" errors

**Solution:**
1. Configure token expiration in Auth0:
   - APIs → WisdomOS API → Settings
   - Token Expiration: 86400 seconds (24 hours)
2. Enable refresh tokens:
   - Application Settings → Advanced
   - Grant Types: Check "Refresh Token"
3. Implement token refresh logic (optional):
   ```typescript
   const { accessToken, error, isLoading } = useAccessToken()
   ```

### Debugging Tools

#### Enable Auth0 SDK Debug Logging

```bash
# .env.local
AUTH0_DEBUG=true
NODE_ENV=development
```

#### Check Auth0 Session

```typescript
// In any server component or API route
import { getSession } from '@auth0/nextjs-auth0'

const session = await getSession()
console.log('Auth0 Session:', session)
```

#### Inspect User Metadata

```typescript
// After login, check localStorage
const userId = '<user-id>'
const user = JSON.parse(localStorage.getItem(`wisdomos_user_${userId}`))
console.log('WisdomOS User:', user)
console.log('Auth0 Sub:', user.auth0Sub)
```

#### Monitor Network Requests

1. Open DevTools → Network
2. Filter: `/api/auth`
3. Watch for:
   - `/api/auth/login` → 302 redirect to Auth0
   - `/api/auth/callback` → 302 redirect to dashboard
   - `/api/auth/sync-user` → 200 with user data

### Performance Considerations

#### Optimize Auth0 Calls

```typescript
// Cache user data after sync
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

let cachedUser: User | null = null
let cacheTime = 0

async function getCachedUser() {
  const now = Date.now()

  if (cachedUser && (now - cacheTime) < CACHE_DURATION) {
    return cachedUser
  }

  const response = await fetch('/api/auth/sync-user', { method: 'POST' })
  const { user } = await response.json()

  cachedUser = user
  cacheTime = now

  return user
}
```

### Auth0 Logs

Monitor authentication events in Auth0:

1. **Navigate to:** Monitoring → Logs
2. **Filter by type:**
   - `s` - Success Login
   - `f` - Failed Login
   - `seacft` - Success Exchange (token)
   - `feacft` - Failed Exchange

3. **Useful log data:**
   - User IP address
   - Browser/device info
   - Error messages
   - Auth method used

### Support Resources

- **Auth0 Documentation:** https://auth0.com/docs/quickstart/webapp/nextjs
- **SDK GitHub:** https://github.com/auth0/nextjs-auth0
- **Community Forum:** https://community.auth0.com/
- **WisdomOS Auth Debug Report:** `AUTH_DEBUG_REPORT.md`

---

## Summary

You have successfully integrated Auth0 as an optional enterprise authentication provider for WisdomOS Phase 3!

### Key Features Implemented:

✅ **Dual Authentication Modes:**
- Demo Mode (localStorage-based)
- Enterprise SSO (Auth0)

✅ **Seamless User Mapping:**
- Auth0 users automatically mapped to WisdomOS
- Tenant auto-creation on first login
- Metadata synchronization

✅ **Security:**
- RS256 token signing
- HttpOnly cookies
- RBAC permission mapping
- MFA support via Auth0

✅ **Developer Experience:**
- Simple mode selector UI
- Comprehensive error handling
- Debug logging
- Clear documentation

### Next Steps:

1. **Test thoroughly** in development
2. **Configure Auth0 production tenant**
3. **Deploy to staging** first
4. **Enable for production users** gradually
5. **Monitor Auth0 logs** for issues
6. **Collect user feedback**
7. **Consider Auth0 Organizations** for enhanced multi-tenancy

---

**Questions or Issues?**

Refer to the troubleshooting section above or check:
- `LOGIN_FIX_SUMMARY.md` - Recent auth fixes
- `AUTH_DEBUG_REPORT.md` - Authentication debugging guide

**Happy coding! 🚀**
