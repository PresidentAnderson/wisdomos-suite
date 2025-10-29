# Fulfillment Display v5 Dashboard — User Guide

Complete guide to using the WisdomOS Fulfillment Dashboard for tracking life fulfillment across 16 areas.

---

## 🎯 Overview

The **Fulfillment Display v5 Dashboard** is your central hub for monitoring and improving fulfillment across all areas of your life. It provides:

- **Global Fulfillment Score (GFS)** — Overall life fulfillment (0-100)
- **16 Life Areas** — Detailed tracking of each area with scores, trends, and insights
- **Area Detail Views** — Deep dive into dimensions, history, and goals per area
- **Score Input** — Manual scoring with confidence tracking
- **Trend Analysis** — 30-day trend indicators for each area
- **Quick Actions** — Fast access to journaling, goal creation, and ritual tracking

---

## 📊 Global Fulfillment Score (GFS)

### What is GFS?

Your Global Fulfillment Score is a **weighted average** of all 16 life areas, scaled to 0-100:

```
GFS = (Sum of WeightedScores / TotalWeight) × 20
```

### Score Ranges

| GFS Range | Status | Description |
|-----------|--------|-------------|
| 80-100 | 🔥 Exceptional | Thriving across all areas |
| 60-79 | ✨ Strong | Solid overall fulfillment |
| 40-59 | 📈 Solid | Good foundation with growth opportunities |
| 0-39 | 💪 Focus Needed | Areas requiring attention identified |

### How It's Calculated

Each life area has a **default weight** based on its importance in overall fulfillment:

- **Work/Purpose**: Weight 1.5 (higher impact)
- **Health**: Weight 1.5
- **Intimacy**: Weight 1.5
- **Most others**: Weight 1.0
- **Some secondary**: Weight 0.75

Example calculation:
```
Area 1: Score 4.0, Weight 1.5 → Weighted = 6.0
Area 2: Score 3.5, Weight 1.0 → Weighted = 3.5
...
Total Weight = 20.0
Total Weighted Score = 68.0
GFS = (68.0 / 20.0) × 20 = 68/100
```

---

## 🌟 Life Areas (16 Total)

### Core Areas

1. **Work & Purpose** (WORK) 💼
   - Career, vocation, calling
   - Professional development
   - Impact and contribution

2. **Health & Recovery** (HEAL) 🏃
   - Physical health, fitness
   - Sleep, recovery, energy
   - Medical care, prevention

3. **Finance** (FINAN) 💰
   - Income, savings, investments
   - Budget management
   - Financial security

4. **Intimacy & Love** (INTIM) ❤️
   - Romantic relationship(s)
   - Emotional connection
   - Sexual fulfillment

5. **Time & Energy** (TIME) ⏰
   - Schedule management
   - Energy optimization
   - Work-life balance

6. **Spiritual** (SPIR) ✨
   - Faith, beliefs, practices
   - Meaning and purpose
   - Connection to something greater

### Creative & Social Areas

7. **Music** (MUSIC) 🎵
   - Playing instruments
   - Listening, appreciation
   - Musical expression

8. **Writing** (WRITE) ✍️
   - Creative writing
   - Journaling
   - Professional writing

9. **Creativity & Arts** (CREATE) 🎨
   - Visual arts, crafts
   - Creative projects
   - Artistic expression

10. **Community & Friendship** (FRIEND) 👥
    - Social connections
    - Friendships
    - Belonging

### Growth & Development Areas

11. **Learning & Growth** (LEARN) 📚
    - Education, courses
    - Skill development
    - Personal growth

12. **Home & Environment** (HOME) 🏡
    - Living space
    - Organization
    - Comfort and aesthetics

13. **Emotional Intelligence** (EMOT) 🧠
    - Self-awareness
    - Emotional regulation
    - Empathy and connection

### Family & Legacy Areas

14. **Parenting & Family** (PARENT) 👨‍👩‍👧
    - Children, parenting
    - Extended family
    - Family relationships

15. **Legacy & Contribution** (LEGACY) 🌍
    - Long-term impact
    - What you leave behind
    - Generational contribution

16. **Identity & Authenticity** (IDENT) 🦅
    - Self-expression
    - Living authentically
    - Being true to yourself

---

## 📈 Scoring System

### Score Scale (0-5)

Each area is scored on a **0-5 scale**:

| Score | Status | Icon | Description |
|-------|--------|------|-------------|
| 4.5-5.0 | Excellent | 🟢 | Thriving, optimal fulfillment |
| 3.5-4.4 | Healthy | ✅ | Strong, sustainable |
| 2.0-3.4 | Friction | ⚠️ | Attention needed, some struggle |
| 0-1.9 | Critical | 🚨 | Breakdown zone, urgent action |

### How to Score

**When entering a score, ask yourself:**

1. **How fulfilled am I in this area RIGHT NOW?**
2. **Is this sustainable or do I sense friction?**
3. **Am I thriving or just surviving?**

**Tips for accurate scoring:**

- **Be honest** — No one sees this but you
- **Consider recent patterns** — Not just today, but the past week
- **Factor in trajectory** — Where are you headed?
- **Trust your gut** — Your intuition knows

### Confidence Level

Each score has a **confidence rating** (0-1):

- **0.8-1.0**: High confidence (manual entry, recent data)
- **0.5-0.7**: Medium confidence (inferred from journals)
- **0.3-0.4**: Low confidence (auto-generated, sparse data)

---

## 🎯 Using the Dashboard

### Accessing the Dashboard

1. Navigate to **Phoenix Tools → Fulfillment Dashboard v5**
2. Or visit: `/fulfillment-v5`

**Requirements:**
- Must be logged in
- Redirects to login if not authenticated

### Dashboard Layout

```
┌─────────────────────────────────────────┐
│  Header: Back button, Title, Period     │
├─────────────────────────────────────────┤
│  Global Fulfillment Score (GFS)         │
│  ┌───────────────────────────────┐      │
│  │  GFS: 68/100  ✨ Strong       │      │
│  └───────────────────────────────┘      │
├─────────────────────────────────────────┤
│  Quick Actions                          │
│  [Journal] [Create Goal] [Log Ritual]   │
├─────────────────────────────────────────┤
│  Life Areas Grid (16 cards)             │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │
│  │ Work │ │Health│ │Finance│ │Love  │   │
│  │ 4.2  │ │ 3.8  │ │ 3.5   │ │ 4.5  │   │
│  │ 🟢   │ │ ✅   │ │ ⚠️    │ │ 🟢   │   │
│  └──────┘ └──────┘ └──────┘ └──────┘   │
│  ... (12 more cards)                    │
└─────────────────────────────────────────┘
```

### Quick Actions

**Journal Entry** 📔
- Click to open journal
- Reflect on your day
- Scores are auto-extracted from journal text

**Create Goal** 🎯
- Set new intentions
- Link to life areas
- Track progress over time

**Log Ritual** 🔁
- Track daily/weekly rituals
- Build consistency
- Monitor completion rates

### Life Area Cards

Each card shows:

**Header:**
- Emoji icon
- Area name
- Area code (e.g., "WORK")
- Health status icon (🟢✅⚠️🚨)

**Score:**
- Current score (0-5)
- Animated progress bar
- Color-coded by health

**Footer:**
- 30-day trend (↗️ up, ↘️ down, → stable)
- Number of data points

**Interaction:**
- **Click card** → Opens area detail view

---

## 🔍 Area Detail View

### Accessing

1. Click any life area card on the dashboard
2. Or visit: `/fulfillment-v5/[areaId]`

### Detail View Layout

```
┌─────────────────────────────────────────┐
│  Header: Back, Area Name, Update Button │
├─────────────────────────────────────────┤
│  Current Score Card (big gradient)      │
│  ┌───────────────────────────────┐      │
│  │  4.2/5.0  ✅ Healthy          │      │
│  │  30-day trend: +0.3 ↗️        │      │
│  └───────────────────────────────┘      │
├─────────────────────────────────────────┤
│  Stats Grid                             │
│  [Data Points] [Journal Entries] [Goals]│
├─────────────────────────────────────────┤
│  Dimensions List                        │
│  ┌──────────────────────────────┐       │
│  │ Career Development (Weight 2)│       │
│  │ Work-Life Balance (Weight 1) │       │
│  │ Professional Growth (Weight 1.5)     │
│  └──────────────────────────────┘       │
├─────────────────────────────────────────┤
│  Recent History (Last 30 Days)          │
│  [Timeline of score changes]            │
└─────────────────────────────────────────┘
```

### Updating Scores

1. **Click "Update Score" button** in header
2. **Score input modal appears:**
   - Slider (0-5 in 0.1 increments)
   - Current value displayed
   - Description of scale
3. **Drag slider** to desired score
4. **Click "Save Score"** to submit
5. **Dashboard refreshes** with new score

**What happens when you save:**
- Score saved to `fd_score_raw` table
- Confidence set to 1.0 (manual entry)
- Source tagged as "manual"
- Metadata includes `manually_entered: true`
- GFS recalculated automatically
- Trend indicators updated

### Dimensions

Each area is broken down into **3-7 dimensions**:

**Example: Work & Purpose**
- Career Development (Weight 2.0)
- Work-Life Balance (Weight 1.0)
- Professional Growth (Weight 1.5)
- Income Satisfaction (Weight 1.0)
- Purpose Alignment (Weight 2.0)

**Dimensions show:**
- Name and code
- Weight (importance multiplier)
- Description

**Future:** Score dimensions individually for more granular tracking

### Score History

**Timeline view** of all scores for this area:

- **Date** of score entry
- **Score value** (0-5)
- **Source** (manual, journal, auto)
- **Color-coded bar** showing health status

**Use this to:**
- See progress over time
- Identify patterns
- Celebrate improvements
- Spot downward trends early

---

## 📊 Trend Indicators

### 30-Day Trend

Each area shows a **trend over the last 30 days**:

**Indicators:**
- **↗️ Trending Up** (green): Score increased +0.1 or more
- **↘️ Trending Down** (red): Score decreased -0.1 or more
- **→ Stable** (gray): Score changed less than ±0.1

**Calculation:**
```
Trend = CurrentScore - OldestScoreInLast30Days
```

**Interpretation:**
- **+0.5 or more**: Strong improvement 🔥
- **+0.1 to +0.4**: Gentle upward trend ✅
- **-0.1 to -0.4**: Slight decline ⚠️
- **-0.5 or more**: Significant drop 🚨

### Data Points

**Count of score entries** in current period (month):

- **0**: No data yet (low confidence, mock score shown)
- **1-3**: Sparse data (medium confidence)
- **4+**: Good data density (high confidence)

**Recommendation:** Score each area at least **once per week** for accurate tracking

---

## 🤖 Automated Scoring

### Score Sources

Scores can come from multiple sources:

1. **Manual Entry** — You update directly in UI
2. **Journal Analysis** — AI extracts scores from journal text
3. **Ritual Tracking** — Completion rates influence scores
4. **Goal Progress** — Achievement updates affect scores
5. **Activity Data** — (Future) Wearables, calendar integration

### AI Journal Analysis

When you write a journal entry:

1. **Text is analyzed** for sentiment and keywords
2. **Life areas are identified** based on content
3. **Scores are inferred** (0-5) with confidence levels
4. **Scores are stored** in `fd_score_raw` table
5. **Source tagged** as "journal_ai"

**Example:**
```
Journal: "Had a great workout this morning, feeling energized!"
→ Area: Health & Recovery
→ Inferred Score: 4.5
→ Confidence: 0.7
```

### Score Rollups

**Automated aggregation** runs daily at 1 AM:

- Raw scores → Daily rollups
- Daily rollups → Monthly rollups
- Monthly rollups → Quarterly rollups

**Tables:**
- `fd_score_raw` — Individual score entries
- `fd_score_rollup` — Aggregated by period (day/month/quarter)

---

## 🔔 Notifications & Reminders

### Ritual Reminders

**Daily at 8 AM:**
- Reminder for daily rituals (meditation, exercise, etc.)

**Weekly on Sunday at 6 PM:**
- Weekly ritual report
- Completion rates by area

### Goal Deadlines

**Daily at 9 AM:**
- Check goals due today or this week
- Notify for approaching deadlines

### Monthly Reviews

**1st of each month at 9 AM:**
- Monthly review notification
- Summary of previous month's GFS and trends
- Suggested focus areas

### Weekly Relationship Check

**Friday at 5 PM:**
- Prompt to score Intimacy & Community areas
- Relationship health check-in

---

## 💡 Best Practices

### Scoring Frequency

**Recommended schedule:**

- **Daily**: Check in during evening reflection
- **Weekly**: Score all areas on Sunday evening
- **Monthly**: Deep review of all areas + update dimensions

**Minimum:**
- Score each area **at least once per week** for accurate trends

### Honest Scoring

**Be authentic:**
- Don't score how you "should" be — score reality
- It's okay to have low scores; that's valuable data
- Trends matter more than individual scores

### Using Trends

**When you see ↘️ Trending Down:**
1. Click into area detail
2. Review recent history
3. Check journal entries for patterns
4. Create a goal to address the decline
5. Log relevant rituals to build momentum

**When you see ↗️ Trending Up:**
1. Celebrate! Note what's working
2. Journal about success factors
3. Consider applying same strategies to other areas

### GFS as a Guide

**Don't obsess over GFS:**
- It's a **snapshot**, not a judgment
- **Trends** are more important than absolute numbers
- **Balance** across areas matters more than perfect scores

**Use GFS to:**
- Track overall life trajectory
- Spot systemic issues (e.g., declining across multiple areas)
- Celebrate major improvements

---

## 🔐 Privacy & Data

### Data Storage

**All scores stored in Supabase:**
- `fd_score_raw` table (PostgreSQL)
- Row-Level Security (RLS) enabled
- Only you can see your scores

**Data isolation:**
- Multi-tenant architecture
- `user_id` and `tenant_id` on every row
- No cross-user data leakage

### Who Can See Your Data

**Your data is private:**
- ✅ **You** (the logged-in user)
- ✅ **System** (for aggregation, AI analysis)
- ❌ Other users (even in same tenant)
- ❌ WisdomOS admins (without explicit permission)

**Future sharing features:**
- Share specific areas with accountability partners
- Export data for analysis
- Anonymous aggregate insights (opt-in)

---

## 🚀 Advanced Features

### Custom Weights (Coming Soon)

**Personalize area importance:**
- Adjust weights per user (not just defaults)
- Example: If parenting is central, increase PARENT weight to 2.5
- GFS recalculates with your custom weights

### Dimension Scoring (Coming Soon)

**Score individual dimensions:**
- Break down each area into sub-components
- Get granular insights
- Example: Score "Career Development" separately from "Work-Life Balance"

### Automated Insights (Coming Soon)

**AI-powered recommendations:**
- "Your Health score dropped 0.8 this month. Consider logging more workouts."
- "Work and Time both declining — possible burnout signal?"
- "Strong improvement in Intimacy! What changed?"

### Data Export

**Export your fulfillment data:**
- JSON, CSV, or PDF format
- All scores, trends, and history
- Use for external analysis or archival

---

## 🐛 Troubleshooting

### "No areas found" Error

**Cause:** Seed data not loaded

**Fix:**
1. Run seed migration: `psql $DATABASE_URL -f supabase/migrations/20251029_fulfillment_display_v5_seed.sql`
2. Verify: `SELECT COUNT(*) FROM fd_area;` should return 16

### Scores Not Appearing

**Cause:** No data for current period

**Fix:**
1. Click "Update Score" on any area
2. Enter a score
3. Save
4. Dashboard should refresh with new score

### Trends Showing "Stable" When Scores Changed

**Cause:** Less than 2 data points in last 30 days

**Fix:**
- Enter at least 2 scores over 30 days
- Trend will calculate once history exists

### GFS Not Updating

**Cause:** Cache or calculation error

**Fix:**
1. Refresh the page
2. If persists, check console for errors
3. Verify scores are saving in Supabase dashboard

### Authentication Redirect Loop

**Cause:** Not logged in or session expired

**Fix:**
1. Go to `/auth/login`
2. Sign in with credentials
3. Navigate back to `/fulfillment-v5`

---

## 📚 Related Documentation

- **Fulfillment Backend README**: `docs/FULFILLMENT_BACKEND_README.md`
- **Supabase Setup**: `docs/SUPABASE_SETUP_CHECKLIST.md`
- **API Usage Examples**: `examples/fulfillment-api-usage.ts`
- **Manual Verification**: `MANUAL_VERIFICATION.md`

---

## 🎯 Quick Start Checklist

- [ ] Navigate to `/fulfillment-v5`
- [ ] Log in if prompted
- [ ] View your Global Fulfillment Score (GFS)
- [ ] Browse all 16 life areas
- [ ] Click on an area to see details
- [ ] Click "Update Score" to enter your first score
- [ ] Save score and see dashboard update
- [ ] Repeat for 2-3 more areas
- [ ] Check back weekly to track trends

---

**Ready to track your fulfillment?** Visit `/fulfillment-v5` and start your journey! 🔥
