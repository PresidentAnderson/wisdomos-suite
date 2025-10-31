# WisdomOS Coaches Admin

A React admin interface for managing WisdomOS life areas, coaches, signals, and WE2 assessments.

## Features

- **Fulfillment Dashboard**: View 30-day signal averages and 90-day assessment averages
- **Area Management**: Create and manage life areas with commitments
- **Coach Management**: Auto-created WE2/WE3-informed coaches per area
- **Signal Entry**: Quick entry for dimension signals (0-5 scale)
- **Assessment Entry**: WE2 relationship assessments (Relatedness, Workability, Reliability, Openness)

## Setup

1. **Install dependencies:**
   ```bash
   cd apps/wisdom-admin
   pnpm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Ensure database schema is applied:**
   ```bash
   # From repository root
   supabase db push
   ```

4. **Deploy edge functions:**
   ```bash
   # From repository root
   supabase functions deploy
   ```

5. **Start development server:**
   ```bash
   pnpm dev
   ```

   The app will open at `http://localhost:3012`

## Usage

### Adding a Life Area

1. Enter area name (e.g., "Health & Vitality")
2. Enter slug (e.g., "health-vitality")
3. Enter commitment statement
4. Click "Add + Coach" - this creates both the area and an AI coach

### Recording a Signal

1. Select area from dropdown
2. Enter dimension key (e.g., "vitality", "strength")
3. Set value (0-5, decimals allowed)
4. Add optional note
5. Click "Save"

### Creating a WE2 Assessment

1. Select area
2. Enter person's full name
3. Set weekend number (2-5)
4. Rate on 4 dimensions (0-5 each):
   - Relatedness
   - Workability
   - Reliability
   - Openness
5. Click "Save" - overall score is auto-calculated

## Technology Stack

- **React 18** with TypeScript
- **Vite** for fast development
- **Supabase** for backend (PostgreSQL + Edge Functions)
- Minimal CSS for simplicity

## Project Structure

```
apps/wisdom-admin/
├── src/
│   ├── App.tsx           # Main admin interface
│   ├── supabase.ts       # Supabase client
│   ├── main.tsx          # Entry point
│   └── index.css         # Styles
├── package.json
├── vite.config.ts
├── tsconfig.json
└── .env.example
```

## Integration with wisdomOS

This admin interface is part of the wisdomOS 2026 monorepo and integrates with:

- `supabase/migrations/20251029_wisdom_schema.sql` - Database schema
- `supabase/functions/coach-factory/` - Coach creation
- `supabase/functions/coach-turn/` - Conversation logging
- `supabase/functions/signal-write/` - Signal recording

## WE2/WE3 Framework

The coaching system is aligned with:

- **WE2**: Assess relational capability (not feelings)
  - Relatedness, Workability, Reliability, Openness
  - 0-5 scale for each dimension
  - Auto-calculated overall score

- **WE3**: "Issue-free" living
  - Reframe to: "This is what having what I want looks like now"
  - Modes: Immediate, Structural, Generative, Representational
  - Coaching strategy based on scores

## Development

```bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Lint
pnpm lint
```

## Troubleshooting

**"Missing Supabase environment variables"**
- Ensure `.env` file exists with correct values
- Copy from `.env.example` if needed

**"Failed to load data"**
- Check Supabase connection
- Ensure database schema is applied
- Verify RLS policies allow access

**"Failed to create coach"**
- Ensure edge functions are deployed
- Check function logs in Supabase dashboard

## Next Steps

- Add coach conversation interface
- Implement autobiography viewer
- Add charts for signal trends
- Create mobile-responsive layout
- Add authentication

## Related Documentation

- [Wisdom Coaches Integration Guide](../../WISDOM-COACHES-INTEGRATION-GUIDE.md)
- [Restructuring Summary](../../RESTRUCTURING-COMPLETE-SUMMARY.md)
- [Supabase Edge Functions](../../supabase/functions/)
