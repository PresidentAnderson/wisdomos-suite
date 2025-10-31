# Authentication

WisdomOS uses Supabase Auth with JWT tokens.

## Sign Up

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password',
  options: {
    data: {
      full_name: 'John Doe',
    },
  },
});
```

## Sign In

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'secure-password',
});
```

## Get Session

```typescript
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;
```

## Sign Out

```typescript
await supabase.auth.signOut();
```

## Password Reset

```typescript
// Request reset
await supabase.auth.resetPasswordForEmail('user@example.com');

// Update password (after clicking email link)
await supabase.auth.updateUser({
  password: 'new-password',
});
```

## Token Refresh

```typescript
const { data, error } = await supabase.auth.refreshSession();
```

Tokens expire after 1 hour. Refresh tokens last 30 days.
