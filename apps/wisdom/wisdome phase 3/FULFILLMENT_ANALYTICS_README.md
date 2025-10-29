# Fulfillment Analytics System

## Overview

The Fulfillment Analytics System provides comprehensive comparative analytics for the Fulfillment Display v5, enabling users to track their life fulfillment trends over time with month-over-month (MoM) and year-over-year (YoY) comparisons.

## Architecture

### Components

```
apps/web/
├── lib/
│   └── fulfillment-analytics.ts          # Core analytics service
├── components/
│   └── analytics/
│       ├── GFSTrendChart.tsx             # Line chart for GFS trends
│       ├── AreaComparisonChart.tsx       # Bar chart for area comparisons
│       ├── AreaRadarChart.tsx            # Radar chart for area distribution
│       └── HeatmapCalendar.tsx           # GitHub-style contribution calendar
└── app/
    └── fulfillment-v5/
        └── analytics/
            └── page.tsx                   # Main analytics dashboard
```

### Technology Stack

- **Chart Library**: Recharts (chosen for React compatibility, TypeScript support, and ease of customization)
- **Styling**: TailwindCSS with Phoenix theme colors
- **Animations**: Framer Motion
- **Data Fetching**: Supabase client
- **Type Safety**: Full TypeScript throughout

## Features

### 1. Overview Cards

Three prominent cards showing:
- **Current GFS**: Current Global Fulfillment Score (0-100)
- **Month-over-Month**: Change from last month with percentage
- **Year-over-Year**: Change from last year with percentage

### 2. AI-Generated Insights

Contextual insights based on:
- Overall GFS level (exceptional, strong, building, etc.)
- Significant changes (MoM and YoY)
- Top improving and declining areas
- Area balance analysis

### 3. Trend Graph

Line/Area chart showing GFS over the last 12 months:
- Smooth animations on load
- Interactive tooltips with detailed data
- Phoenix-themed color gradients
- Responsive to screen size

### 4. Top Movers

Two sections highlighting:
- **Top Improving Areas**: Areas with biggest positive changes
- **Areas Needing Attention**: Areas with biggest negative changes

Each showing:
- Area emoji and name
- Current score
- Change amount and percentage

### 5. Area Comparison Charts

Multiple visualization options:
- **Bar Chart**: Side-by-side comparison of current vs last month vs last year
- **Radar Chart**: Spider chart showing current area distribution
- All 16 life areas displayed with their codes and emojis

### 6. Heatmap Calendar

GitHub-style contribution calendar:
- Daily GFS values (approximated from monthly data)
- 5-level color intensity system (0-100 scale)
- Interactive tooltips on hover
- Scrollable for full year view

## Analytics Calculations

### Global Fulfillment Score (GFS)

```typescript
GFS = Σ(area_score × area_weight) × 20
```

Where:
- `area_score`: Individual area score (0-5)
- `area_weight`: Area weight (default 1/16 = 0.0625)
- Result scaled to 0-100 range

### Month-over-Month (MoM) Change

```typescript
MoM_Change = Current_GFS - Last_Month_GFS
MoM_Percentage = ((Current_GFS - Last_Month_GFS) / Last_Month_GFS) × 100
```

### Year-over-Year (YoY) Change

```typescript
YoY_Change = Current_GFS - Last_Year_GFS
YoY_Percentage = ((Current_GFS - Last_Year_GFS) / Last_Year_GFS) × 100
```

### Trend Determination

For individual areas:
- **Up**: MoM change > +0.2
- **Down**: MoM change < -0.2
- **Stable**: -0.2 ≤ MoM change ≤ +0.2

### Contribution Level (Heatmap)

```typescript
Level 4: GFS ≥ 80  (Exceptional)
Level 3: 60 ≤ GFS < 80  (Strong)
Level 2: 40 ≤ GFS < 60  (Solid)
Level 1: 20 ≤ GFS < 40  (Building)
Level 0: GFS < 20  (Starting)
```

## API Usage

### Fetch Complete Analytics

```typescript
import { fetchAnalytics } from '@/lib/fulfillment-analytics'

const data = await fetchAnalytics(userId)
// Returns: { summary, areaScores, trendData, heatmapData }
```

### Fetch Trend Data

```typescript
import { fetchTrendData } from '@/lib/fulfillment-analytics'

const trendData = await fetchTrendData(userId, 12) // Last 12 months
```

### Fetch Heatmap Data

```typescript
import { fetchHeatmapData } from '@/lib/fulfillment-analytics'

const heatmapData = await fetchHeatmapData(userId, 365) // Last 365 days
```

### Fetch Area Comparison

```typescript
import { fetchAreaComparison } from '@/lib/fulfillment-analytics'

const comparison = await fetchAreaComparison(userId, areaId)
// Returns: { area, current, lastMonth, lastYear, trend }
```

## Database Queries

The system uses these main tables:
- `fd_area`: Area definitions
- `fd_score_rollup`: Aggregated monthly scores
- `fd_review_month`: Monthly review summaries with GFS

### Efficient Data Fetching

For optimal performance:
1. Uses `fd_score_rollup` for aggregated data (not raw scores)
2. Fetches only required periods (current, -1 month, -12 months)
3. Leverages database indexes on `user_id` and `period`
4. Client-side caching for 5 minutes (future enhancement)

## Performance Considerations

### For Large Datasets

1. **Pagination**: Heatmap limited to 365 days
2. **Aggregation**: Uses pre-computed rollup tables
3. **Lazy Loading**: Charts render only when visible (view switching)
4. **Memoization**: React useMemo for expensive calculations
5. **Batch Requests**: Single fetch for all analytics data

### Optimization Strategies

```typescript
// ✅ Good: Fetch rollup data
await supabase
  .from('fd_score_rollup')
  .select('*')
  .eq('user_id', userId)
  .eq('period', currentPeriod)

// ❌ Bad: Fetch all raw scores and aggregate client-side
await supabase
  .from('fd_score_raw')
  .select('*')
  .eq('user_id', userId)
```

### Responsive Charts

All charts are wrapped in `ResponsiveContainer` from Recharts:
- Auto-adjusts to parent width
- Maintains aspect ratio
- Mobile-optimized with reduced labels
- Touch-friendly tooltips

## Color Palette (Phoenix Theme)

```typescript
const phoenixColors = {
  primary: '#F59E0B',    // Phoenix Orange
  red: '#EF4444',        // Phoenix Red
  gold: '#FCD34D',       // Phoenix Gold
  purple: '#8B5CF6',     // Accent Purple
  green: '#10B981',      // Success Green
  gray: '#6B7280',       // Neutral Gray
}
```

## Sample Analytics Output

```typescript
{
  summary: {
    currentGFS: 72,
    lastMonthGFS: 65,
    lastYearGFS: 58,
    momGFSChange: 7,
    yoyGFSChange: 14,
    momGFSPercentage: 10.77,
    yoyGFSPercentage: 24.14,
    topImproving: [
      {
        area: { code: 'WRK', name: 'Work & Purpose', emoji: '💼', ... },
        currentScore: 4.2,
        lastMonthScore: 3.5,
        momChange: 0.7,
        momPercentage: 20.0,
        trend: 'up'
      },
      // ... more areas
    ],
    topDeclining: [ /* ... */ ],
    insights: [
      'Strong foundation! Your fulfillment score is 72/100 with opportunities to optimize.',
      'Solid improvement of 7.0 points (10.8%) since last month.',
      'Remarkable year! You\'ve grown 14.0 points (24.1%) since last year.',
      '💼 Work & Purpose is your star performer, up 0.7 points!'
    ]
  },
  areaScores: [ /* 16 areas with full comparison data */ ],
  trendData: [ /* 12 monthly data points */ ],
  heatmapData: [ /* 365 daily data points */ ]
}
```

## Future Enhancements

### Phase 2 (Future)
- [ ] Export analytics to PDF
- [ ] Custom date range selection
- [ ] Area-specific deep dives
- [ ] Goal tracking overlay on trends
- [ ] Correlation analysis between areas
- [ ] Predictive analytics (ML-based)
- [ ] Social comparison (anonymized, opt-in)
- [ ] Real-time streaming updates

### Phase 3 (Future)
- [ ] Custom chart configurations
- [ ] Dashboard customization
- [ ] Scheduled email reports
- [ ] Slack/Discord integration
- [ ] Mobile app charts
- [ ] Voice-activated insights

## Testing

Run analytics tests:

```bash
pnpm --filter @wisdomos/web test fulfillment-analytics
```

Tests cover:
- GFS calculation accuracy
- Percentage change calculations
- Trend determination logic
- Top movers sorting
- Insight generation
- Period formatting

## Troubleshooting

### Charts Not Rendering

1. Check Recharts installation: `npm list recharts`
2. Verify data format matches expected types
3. Check browser console for errors
4. Ensure parent container has defined height

### Missing Data

1. Verify user has `fd_review_month` entries
2. Check date range of available data
3. Run seed data migration if needed
4. Verify RLS policies allow data access

### Performance Issues

1. Check network tab for slow queries
2. Verify indexes on `fd_score_rollup` table
3. Limit heatmap to fewer days
4. Enable browser caching
5. Consider pagination for large datasets

## Support

For issues or questions:
1. Check the main [FULFILLMENT_V5_README.md](./FULFILLMENT_V5_README.md)
2. Review database schema in [20251029_fulfillment_display_v5.sql](./supabase/migrations/20251029_fulfillment_display_v5.sql)
3. Open issue on GitHub
4. Contact support team

## License

Part of WisdomOS Phoenix Transformation Platform
