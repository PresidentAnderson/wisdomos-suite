# Real-time Supabase Subscriptions System for Fulfillment Display v5

Complete documentation for the real-time score update system using Supabase real-time channels.

## Overview

The real-time subscriptions system enables live updates to the Fulfillment Dashboard v5 when scores change in the database. Users see instant notifications when their scores are updated, whether from their own actions or AI-driven updates.

## Architecture

### Components

1. **`useRealtimeScores` Hook** (`/apps/web/hooks/useRealtimeScores.ts`)
   - Manages Supabase real-time channel subscriptions
   - Filters updates by user ID and period
   - Handles connection lifecycle and cleanup
   - Provides connection status and error states

2. **`RealtimeNotification` Component** (`/apps/web/components/fulfillment/RealtimeNotification.tsx`)
   - Phoenix-themed toast notifications
   - Shows score changes with visual indicators
   - Auto-dismisses after 3 seconds
   - Smooth animations with Framer Motion

3. **Dashboard Integration** (`/apps/web/app/fulfillment-v5/page.tsx`)
   - Uses the hook to subscribe to updates
   - Displays notifications when scores change
   - Shows live connection status indicator
   - Automatically refreshes data on updates

### Data Flow

```
Supabase Database (fd_score_raw)
         ↓
    Real-time Channel
         ↓
  useRealtimeScores Hook
         ↓
  Dashboard Component
         ↓
  RealtimeNotification
```

## Features

### 1. Real-time Score Updates
- Instant notifications when scores change
- Shows old vs new scores
- Displays area name and source
- Visual indicators for improvements/declines

### 2. Connection Management
- Automatic connection on mount
- Graceful reconnection on auth changes
- Manual reconnect capability
- Connection status indicator in UI

### 3. Error Handling
- Catches and logs subscription errors
- Provides error callbacks for custom handling
- Displays connection errors in UI
- Prevents memory leaks with proper cleanup

### 4. Type Safety
- Full TypeScript support
- Typed payload structures
- Type-safe callbacks
- Supabase type integration

## Usage

### Basic Implementation

```tsx
import { useRealtimeScores } from '@/hooks/useRealtimeScores'
import RealtimeNotification from '@/components/fulfillment/RealtimeNotification'

function MyDashboard() {
  const { user } = useAuth()

  const { isConnected, lastUpdate, error } = useRealtimeScores({
    userId: user?.id || null,
    period: '2025-10',
    enabled: !!user,
    onScoreUpdate: (payload) => {
      console.log('Score updated:', payload)
      // Refresh your data here
    }
  })

  return (
    <div>
      <RealtimeNotification update={lastUpdate} />

      <div className="connection-status">
        {isConnected ? '🟢 Live' : '⚫ Offline'}
      </div>

      {/* Your dashboard content */}
    </div>
  )
}
```

### Advanced Configuration

```tsx
const { isConnected, lastUpdate, error, reconnect } = useRealtimeScores({
  userId: user?.id || null,
  period: '2025-10',
  enabled: !!user,

  // Called when any score updates
  onScoreUpdate: (payload) => {
    console.log('Score update:', payload)
    refetchDashboard()

    // Track analytics
    analytics.track('score_updated', {
      area: payload.area_name,
      score: payload.score,
      source: payload.source
    })
  },

  // Called on errors
  onError: (error) => {
    console.error('Subscription error:', error)
    showErrorToast(error.message)
  },

  // Called when connection status changes
  onConnectionChange: (connected) => {
    console.log('Connection status:', connected)
    setConnectionIndicator(connected)
  }
})

// Manual reconnection
if (error) {
  return <button onClick={reconnect}>Reconnect</button>
}
```

### Multiple Notifications

```tsx
import { RealtimeNotificationsContainer } from '@/components/fulfillment/RealtimeNotification'

function MyDashboard() {
  const [updates, setUpdates] = useState<ScoreUpdatePayload[]>([])

  const { lastUpdate } = useRealtimeScores({
    userId: user?.id || null,
    period: '2025-10',
    onScoreUpdate: (payload) => {
      setUpdates(prev => [...prev, payload])
    }
  })

  const dismissNotification = (index: number) => {
    setUpdates(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div>
      <RealtimeNotificationsContainer
        updates={updates}
        onDismiss={dismissNotification}
        autoHideDuration={3000}
      />

      {/* Your dashboard content */}
    </div>
  )
}
```

## API Reference

### `useRealtimeScores` Hook

#### Options

```typescript
interface UseRealtimeScoresOptions {
  userId: string | null        // User to filter updates by
  period: string                // Period to filter (e.g., '2025-10')
  enabled?: boolean             // Enable/disable subscription (default: true)
  onScoreUpdate?: (payload: ScoreUpdatePayload) => void
  onError?: (error: Error) => void
  onConnectionChange?: (connected: boolean) => void
}
```

#### Return Value

```typescript
interface UseRealtimeScoresReturn {
  isConnected: boolean          // Connection status
  error: Error | null           // Last error if any
  lastUpdate: ScoreUpdatePayload | null  // Most recent update
  reconnect: () => void         // Manual reconnection function
}
```

#### Payload Structure

```typescript
interface ScoreUpdatePayload {
  area_id: string              // Area ID
  area_name?: string           // Area name (fetched)
  score: number                // New score (0-5)
  old_score?: number           // Previous score if updated
  source: string               // Source of update (manual, ai, computed)
  timestamp: string            // ISO timestamp
}
```

### `RealtimeNotification` Component

#### Props

```typescript
interface RealtimeNotificationProps {
  update: ScoreUpdatePayload | null   // Update to display
  onDismiss?: () => void               // Called when dismissed
  autoHideDuration?: number            // Auto-hide delay in ms (default: 3000)
}
```

## Database Requirements

### Table: `fd_score_raw`

The real-time subscription listens to changes on the `fd_score_raw` table:

```sql
CREATE TABLE fd_score_raw (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  area_id UUID NOT NULL,
  dimension_id UUID,
  period TEXT NOT NULL,
  score DECIMAL(3,2) NOT NULL CHECK (score >= 0 AND score <= 5),
  source TEXT NOT NULL,
  provenance TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Realtime Configuration

Ensure Supabase real-time is enabled for the table:

```sql
-- Enable realtime for fd_score_raw
ALTER PUBLICATION supabase_realtime ADD TABLE fd_score_raw;
```

### Row-Level Security

The subscription automatically filters by user ID, but ensure RLS policies are in place:

```sql
-- Users can only see their own scores
CREATE POLICY "Users can view own scores"
  ON fd_score_raw
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own scores
CREATE POLICY "Users can update own scores"
  ON fd_score_raw
  FOR UPDATE
  USING (auth.uid() = user_id);
```

## Testing

### Manual Testing

1. **Test Real-time Updates**
   ```typescript
   // In browser console or test file

   // Insert a new score
   await supabase.from('fd_score_raw').insert({
     user_id: 'current-user-id',
     area_id: 'area-id',
     period: '2025-10',
     score: 4.5,
     source: 'manual'
   })

   // Should see notification appear
   ```

2. **Test Connection Status**
   - Open dashboard
   - Check "Live" indicator in header
   - Disable network in DevTools
   - Should show "Offline"
   - Re-enable network
   - Should reconnect automatically

3. **Test Notifications**
   - Update a score in Supabase
   - Should see toast notification
   - Should auto-dismiss after 3 seconds
   - Click X to dismiss manually

### Automated Testing

```typescript
// Example test with React Testing Library
import { renderHook, waitFor } from '@testing-library/react'
import { useRealtimeScores } from '@/hooks/useRealtimeScores'

describe('useRealtimeScores', () => {
  it('should connect and receive updates', async () => {
    const onScoreUpdate = jest.fn()

    const { result } = renderHook(() =>
      useRealtimeScores({
        userId: 'test-user',
        period: '2025-10',
        onScoreUpdate
      })
    )

    // Wait for connection
    await waitFor(() => {
      expect(result.current.isConnected).toBe(true)
    })

    // Simulate database update
    // (requires test database setup)

    // Verify callback was called
    await waitFor(() => {
      expect(onScoreUpdate).toHaveBeenCalled()
    })
  })
})
```

### Integration Testing Script

Create `/scripts/test-realtime.ts`:

```typescript
import { supabase } from '@/lib/supabase'

async function testRealtimeUpdates() {
  const userId = 'your-test-user-id'
  const areaId = 'your-test-area-id'
  const period = '2025-10'

  console.log('Testing real-time score updates...')

  // Subscribe to changes
  const subscription = supabase
    .channel('test-channel')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'fd_score_raw',
      filter: `user_id=eq.${userId}`
    }, (payload) => {
      console.log('Received update:', payload)
    })
    .subscribe()

  // Wait for connection
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Insert test score
  const { data, error } = await supabase
    .from('fd_score_raw')
    .insert({
      user_id: userId,
      area_id: areaId,
      period,
      score: 4.2,
      source: 'manual',
      tenant_id: 'test-tenant-id'
    })

  if (error) {
    console.error('Insert failed:', error)
  } else {
    console.log('Test score inserted:', data)
  }

  // Wait for real-time event
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Cleanup
  supabase.removeChannel(subscription)
  console.log('Test complete')
}

testRealtimeUpdates()
```

Run with:
```bash
npx tsx scripts/test-realtime.ts
```

## Troubleshooting

### No Real-time Updates Received

1. **Check Supabase Configuration**
   ```bash
   # Verify realtime is enabled for table
   SELECT * FROM pg_publication_tables
   WHERE pubname = 'supabase_realtime'
   AND tablename = 'fd_score_raw';
   ```

2. **Check RLS Policies**
   - Ensure user has SELECT permissions
   - Verify auth.uid() matches user_id

3. **Check Browser Console**
   - Look for connection errors
   - Verify subscription status logs

### Connection Keeps Dropping

1. **Check Network**
   - Verify stable internet connection
   - Check firewall/proxy settings

2. **Check Supabase Project**
   - Verify project is not paused
   - Check quota limits

3. **Implement Reconnection Logic**
   - Hook already handles automatic reconnection
   - Use `reconnect()` for manual retry

### Notifications Not Appearing

1. **Check Component Rendering**
   - Verify `RealtimeNotification` is in DOM
   - Check z-index conflicts

2. **Check Update State**
   - Verify `lastUpdate` is populated
   - Check console for payload data

3. **Check Styling**
   - Ensure Tailwind classes are compiled
   - Verify Phoenix theme colors exist

## Performance Considerations

### Memory Management
- Subscriptions auto-cleanup on unmount
- Area name cache prevents repeated queries
- Single channel per user/period combination

### Network Efficiency
- Filters applied server-side
- Only subscribes when user authenticated
- Disconnects when component unmounts

### Best Practices
1. Only enable subscriptions when needed
2. Use `enabled` prop to control activation
3. Limit number of active subscriptions
4. Clear old notifications from state

## Security

### Authentication
- Subscriptions require valid Supabase session
- Auto-reconnects on auth state changes
- Disconnects on sign-out

### Authorization
- Row-Level Security enforced
- User can only see own scores
- Filter by user_id prevents data leaks

### Data Validation
- Scores validated (0-5 range)
- Period format validated
- Type safety prevents invalid data

## Future Enhancements

### Planned Features
1. Batch notification handling
2. Notification sound effects
3. Custom notification themes
4. Notification history panel
5. Desktop notifications (via Web API)
6. Push notifications (mobile)
7. Aggregated notifications

### Potential Optimizations
1. WebSocket connection pooling
2. Delta updates (only changed fields)
3. Optimistic UI updates
4. Offline queue with sync

## Support

For issues or questions:
1. Check console for error logs
2. Review this documentation
3. Check Supabase dashboard for realtime logs
4. File an issue with reproduction steps

## License

Part of WisdomOS 2026 - Phoenix Transformation Platform
