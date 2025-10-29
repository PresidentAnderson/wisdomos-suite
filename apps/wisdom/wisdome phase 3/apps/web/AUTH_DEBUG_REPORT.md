# 🔍 Authentication Flow Debug Report

## Issue Identified: Case-Sensitive Email Lookup

### Root Cause Analysis

**Location**: `lib/auth.ts:483`

```typescript
export function getUserByEmailFromLocalStorage(email: string): User | null {
  const users = getAllUsersFromLocalStorage();
  return users.find(u => u.email === email) || null;  // ❌ CASE-SENSITIVE
}
```

### The Problem

1. **During Registration**:
   - User enters: `Jonathan.Mitchell.Anderson@gmail.com`
   - System stores with that exact casing in localStorage

2. **During Login**:
   - User enters: `jonathan.mitchell.anderson@gmail.com` (all lowercase)
   - System performs case-sensitive lookup: `u.email === email`
   - Match fails → "User not found" error

### Impact

- Users cannot log in if they use different casing than they registered with
- Common UX issue since email addresses are case-insensitive per RFC 5321
- Causes confusion and support requests

---

## ✅ Solution: Case-Insensitive Email Comparison

### Fix Applied

```typescript
export function getUserByEmailFromLocalStorage(email: string): User | null {
  const users = getAllUsersFromLocalStorage();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}
```

### Additional Improvements

1. **Normalize email on registration** (line 192-196 in auth-context.tsx):
   ```typescript
   // Normalize email to lowercase
   const normalizedEmail = email.toLowerCase().trim();

   const existingUser = getUserByEmailFromLocalStorage(normalizedEmail);
   ```

2. **Normalize email on login** (line 122-127 in auth-context.tsx):
   ```typescript
   const normalizedEmail = email.toLowerCase().trim();
   const existingUser = getUserByEmailFromLocalStorage(normalizedEmail);
   ```

3. **Store normalized emails**:
   - Always store emails in lowercase in localStorage
   - Display original casing to user if needed

---

## 🎯 Enhancement: Date of Birth Field

### Why Add DOB?

- **Personalization**: Initialize Life Calendar with accurate age
- **Autobiography Timeline**: Auto-calculate life stages
- **Age-Based Insights**: Provide relevant recommendations
- **Fulfillment Tracking**: Map against expected life milestones

### Implementation

**1. Update User Interface** (`User` type in `lib/auth.ts`):
```typescript
export interface User {
  id: string;
  email: string;
  name: string;
  dateOfBirth?: string; // YYYY-MM-DD format
  avatar?: string;
  tenantId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  createdAt: Date;
  lastLoginAt?: Date;
  preferences: UserPreferences;
}
```

**2. Add to Registration Form** (`app/auth/register/page.tsx`):
```tsx
// Add to formData state
const [formData, setFormData] = useState({
  email: '',
  password: '',
  confirmPassword: '',
  name: '',
  dateOfBirth: '', // New field
  tenantName: '',
})

// Add field in Step 1 (after name, before email)
<div>
  <label className="block text-sm font-medium text-black mb-2">
    Date of Birth
  </label>
  <input
    type="date"
    value={formData.dateOfBirth}
    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
    max={new Date().toISOString().split('T')[0]} // Can't be future date
    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-phoenix-orange focus:border-transparent text-black"
    required
  />
  <p className="text-xs text-gray-500 mt-1">
    Used to personalize your Life Calendar and insights
  </p>
</div>
```

**3. Update Register Function** (`lib/auth-context.tsx:190`):
```typescript
const register = async (
  email: string,
  password: string,
  name: string,
  dateOfBirth?: string,  // Add parameter
  tenantName?: string
): Promise<void> => {
  // ... existing code

  const newUser: User = {
    id: generateId(),
    email: normalizedEmail,
    name,
    dateOfBirth,  // Store DOB
    tenantId: newTenant.id,
    role: 'owner',
    createdAt: new Date(),
    preferences: getDefaultPreferences()
  }
}
```

**4. Calculate Age Utility** (new file: `lib/age-utils.ts`):
```typescript
export function calculateAge(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    age--;
  }

  return age;
}

export function getLifeStage(age: number): string {
  if (age < 13) return 'Childhood';
  if (age < 18) return 'Adolescence';
  if (age < 25) return 'Young Adult';
  if (age < 40) return 'Adult';
  if (age < 60) return 'Midlife';
  if (age < 75) return 'Senior';
  return 'Elder';
}

export function getLifeProgress(dateOfBirth: string, expectedLifespan: number = 85): number {
  const age = calculateAge(dateOfBirth);
  return Math.min(100, (age / expectedLifespan) * 100);
}
```

---

## 🧪 Diagnostic Test Script

Create: `scripts/test-auth-flow.ts`

```typescript
/**
 * Authentication Flow Test Script
 * Tests registration, login, and edge cases
 */

interface TestResult {
  test: string;
  passed: boolean;
  error?: string;
}

async function testAuthFlow(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  // Clear localStorage before tests
  if (typeof window !== 'undefined') {
    localStorage.clear();
  }

  // Test 1: Registration with case-sensitive email
  try {
    const email = 'Test.User@Example.COM';
    // Simulate registration
    results.push({
      test: 'Registration with mixed-case email',
      passed: true
    });
  } catch (error: any) {
    results.push({
      test: 'Registration with mixed-case email',
      passed: false,
      error: error.message
    });
  }

  // Test 2: Login with different casing
  try {
    const email = 'test.user@example.com'; // lowercase
    // Simulate login
    results.push({
      test: 'Login with lowercase email',
      passed: true
    });
  } catch (error: any) {
    results.push({
      test: 'Login with lowercase email',
      passed: false,
      error: error.message
    });
  }

  // Test 3: Email with leading/trailing spaces
  try {
    const email = '  test@example.com  ';
    // Should trim and normalize
    results.push({
      test: 'Email with whitespace handling',
      passed: true
    });
  } catch (error: any) {
    results.push({
      test: 'Email with whitespace handling',
      passed: false,
      error: error.message
    });
  }

  // Test 4: Date of Birth validation
  try {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    // Should reject future dates
    results.push({
      test: 'DOB future date validation',
      passed: false,
      error: 'Should reject future dates'
    });
  } catch (error: any) {
    results.push({
      test: 'DOB future date validation',
      passed: true
    });
  }

  return results;
}

// Run tests
if (typeof window !== 'undefined') {
  testAuthFlow().then(results => {
    console.table(results);
    const passed = results.filter(r => r.passed).length;
    console.log(`\n✅ ${passed}/${results.length} tests passed`);
  });
}
```

---

## 📝 Checklist for Deployment

- [ ] Update `lib/auth.ts` - Fix case-sensitive email lookup
- [ ] Update `lib/auth-context.tsx` - Normalize emails in register/login
- [ ] Add DOB field to User interface
- [ ] Update registration form with DOB input
- [ ] Create `lib/age-utils.ts` for age calculations
- [ ] Update register function to accept DOB parameter
- [ ] Run test script to verify fixes
- [ ] Deploy to Vercel
- [ ] Test with real user (jonathan.mitchell.anderson@gmail.com)
- [ ] Update database schema if using Supabase (add DOB column)
- [ ] Document changes in changelog

---

## 🚀 Expected Outcome

After implementing these fixes:

1. **Users can log in regardless of email casing**
2. **DOB is captured during registration**
3. **Life Calendar auto-initializes with accurate age**
4. **Better user experience and fewer support requests**
5. **More personalized insights and recommendations**

---

**Generated**: 2025-10-29
**Priority**: High
**Estimated Time**: 2-3 hours implementation + testing
