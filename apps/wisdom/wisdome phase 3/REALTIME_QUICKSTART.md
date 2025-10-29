# Real-time Subscriptions Quick Start Guide

Get real-time score updates in your Fulfillment Dashboard v5 in under 5 minutes.

## What You Get

- **Live Updates**: See score changes instantly without refreshing
- **Phoenix Notifications**: Beautiful toast notifications when scores update
- **Connection Status**: Visual indicator showing real-time connection state
- **Auto-Refresh**: Dashboard automatically refreshes when data changes

## Prerequisites

1. Supabase project configured
2. `fd_score_raw` table with realtime enabled
3. User authenticated in your app

## Quick Setup

### 1. Enable Realtime in Supabase

Run this SQL in your Supabase SQL editor:

```sql
-- Enable realtime for the scores table
ALTER PUBLICATION supabase_realtime ADD TABLE fd_score_raw;
```

### 2. Use in Your Component

```tsx
import { useRealtimeScores } from '@/hooks/useRealtimeScores'
import RealtimeNotification from '@/components/fulfillment/RealtimeNotification'

function MyDashboard() {
  const { user } = useAuth()

  const { isConnected, lastUpdate } = useRealtimeScores({
    userId: user?.id || null,
    period: '2025-10',
    onScoreUpdate: (payload) => {
      console.log('Score updated!', payload)
      // Refresh your dashboard data here
    }
  })

  return (
    <>
      <RealtimeNotification update={lastUpdate} />

      <div>
        Status: {isConnected ? '🟢 Live' : '⚫ Offline'}
      </div>

      {/* Your dashboard content */}
    </>
  )
}
```

### 3. Test It Out

```bash
# Run the test script
export TEST_USER_ID="your-user-id"
export TEST_TENANT_ID="your-tenant-id"
npx tsx scripts/test-realtime-subscriptions.ts
```

Or manually:

1. Open your dashboard
2. In another browser tab, open Supabase dashboard
3. Insert/update a score in `fd_score_raw` table
4. See the notification appear instantly!

## What Happens Under the Hood

1. Hook subscribes to Supabase realtime channel on mount
2. Filters updates by user ID and period
3. Fetches area name when update received
4. Calls your `onScoreUpdate` callback
5. Shows notification with score details
6. Cleans up subscription on unmount

## Connection States

- **🟢 Live**: Connected and receiving updates
- **⚫ Offline**: Disconnected (network issue, auth expired, etc.)

The hook automatically reconnects when:
- User signs in
- Network comes back online
- Component remounts

## Notification Styles

The notification automatically shows:

- **Green gradient**: Score improved 🎉
- **Orange/Red gradient**: Score declined or changed
- **Phoenix gradient**: New score (no previous value)

## Common Issues

### Not Receiving Updates?

1. Check Supabase realtime is enabled:
   ```sql
   SELECT * FROM pg_publication_tables
   WHERE pubname = 'supabase_realtime';
   ```

2. Verify RLS policies allow reading scores:
   ```sql
   SELECT * FROM fd_score_raw WHERE user_id = 'your-user-id';
   ```

3. Check browser console for errors

### Connection Keeps Dropping?

1. Check your Supabase project status
2. Verify network connection
3. Check quota limits (free tier has limits)

### Notifications Not Appearing?

1. Verify `lastUpdate` has data (check console)
2. Check z-index conflicts with other UI
3. Ensure Tailwind is compiling Phoenix theme colors

## Full Documentation

For complete API reference and advanced usage, see:
- [Full Documentation](./docs/REALTIME_SUBSCRIPTIONS.md)
- [Hook Source Code](./apps/web/hooks/useRealtimeScores.ts)
- [Component Source Code](./apps/web/components/fulfillment/RealtimeNotification.tsx)

## Example: Fulfillment Dashboard v5

See the complete implementation in:
- `/apps/web/app/fulfillment-v5/page.tsx`

This dashboard shows:
- Real-time connection indicator in header
- Toast notifications for score changes
- Automatic data refresh on updates
- All 16 life areas with live scores

## Next Steps

1. Customize notification styling in `RealtimeNotification.tsx`
2. Add sound effects when scores update
3. Implement notification history panel
4. Add desktop/push notifications
5. Create aggregated daily summaries

## Support

Questions? Check the full docs or review the test script to see it in action!

---

**Built with**: Supabase Realtime, React Hooks, Framer Motion, TypeScript
**Part of**: WisdomOS 2026 - Phoenix Transformation Platform
