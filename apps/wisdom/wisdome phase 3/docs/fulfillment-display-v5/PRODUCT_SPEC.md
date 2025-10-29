# Fulfillment Display v5 — Product Specification

**Engineer Edition**

---

## 0) Purpose (1-liner)

A structured, measurable life-ops dashboard that tracks fulfillment across clearly defined Areas, rolls up to monthly & quarterly reviews, and links daily Journals → Autobiography → Actions → Integrity.

---

## 1) Scope & Non-Goals

### In-Scope
- ✅ Data model (Areas, Dimensions, Scores, Reviews)
- ✅ Scoring algorithm (0-5 scale, weighted GFS)
- ✅ UI views (Dashboard, Area Detail, Reviews, Profitability Board)
- ✅ Monthly/Quarterly review cadences
- ✅ Agent hooks (Journal, Integrity, Narrative, Finance, Justice)
- ✅ Reports with interpretation key
- ✅ Permissions (RLS per user)
- ✅ Bilingual labels infrastructure

### Non-Goals (v5)
- ❌ Gamification achievements
- ❌ Social graphs and sharing
- ❌ Mobile offline mode
- ❌ Public profile sharing
- ❌ Third-party integrations (v6+)

---

## 2) Canonical Areas & Codes (FD-v5)

Each Area has: **code**, **name**, **emoji**, **hexColor**, **weight_default**

| Code | Area | Emoji | Color | Weight |
|------|------|-------|-------|--------|
| WRK | Work/Enterprise | 🧱 | #6B4EFF | 0.08 |
| PUR | Purpose/Calling | ✨ | #FF7A59 | 0.08 |
| MUS | Music (Creative) | 🎵 | #2EC5B6 | 0.06 |
| WRT | Writing (Creative) | ✍️ | #FFCE00 | 0.06 |
| SPE | Public Speaking | 🎤 | #8855FF | 0.04 |
| LRN | Learning & Growth | 📚 | #3FA9F5 | 0.07 |
| HLT | Health & Vitality | 🩺 | #E83F6F | 0.10 |
| SPF | Spiritual Development | 🕊️ | #7CC576 | 0.07 |
| FIN | Finance & Wealth Health | 💹 | #1F6FEB | 0.12 |
| FAM | Family | 🏡 | #F97316 | 0.09 |
| FRD | Friendship | 🤝 | #10B981 | 0.06 |
| COM | Community | 🏘️ | #A855F7 | 0.05 |
| LAW | Law & Justice | ⚖️ | #111827 | 0.04 |
| INT | Integrity & Recovery | 🧭 | #64748B | 0.04 |
| FOR | Forgiveness & Reconciliation | 🤍 | #9CA3AF | 0.02 |
| AUT | Autobiography (Narrative) | 📖 | #0EA5E9 | 0.02 |

### Design Notes
- **MUS/WRT/SPE** are first-class Areas (tied to WRK/PUR via relations)
- **FRD and COM** are separate for granular tracking
- **LAW** is explicit for governance/justice focus
- **INT and FOR** are foundational practices across all Areas
- **Total weights** sum to 1.00 (adjustable per user in Quarterly Reviews)

---

## 3) Dimensions per Area

Each Area has **3-6 Dimensions** scored 0–5.

See [Full Dimensions List](./DIMENSIONS.md) for complete breakdown.

### Example: MUS — Music (Creative)

| Code | Dimension | Description |
|------|-----------|-------------|
| COMPOSITION | Composition Cadence | Frequency and quality of new compositions |
| PRODUCTION | Production Pipeline | Production workflow health |
| RELEASE | Release Velocity | Publishing and distribution momentum |
| ENGAGEMENT | Audience Engagement | Listener interaction and growth |
| IP_HYGIENE | IP/Metadata Hygiene | Rights management and documentation |

---

## 4) Scoring Model

### Dimension Score
- **Range**: 0–5 (integers or 0.5 steps)
- **Source**: Manual input, AI suggestion, or computed from data

### Area Score
- **Formula**: Weighted average of Dimensions
- **Default**: Equal weights per dimension unless customized

### Global Fulfillment Score (GFS)
- **Range**: 0–100
- **Formula**: `GFS = Σ(AreaScore × AreaWeight) × 20`
- **Example**: If all Areas score 4.0, GFS = 80

### Confidence
- **Range**: 0–1
- **Derived from**: Data density (entries, actions, check-ins)
- **High confidence**: ≥10 data points in period
- **Low confidence**: <3 data points

### Trend
- **7-day**: Short-term momentum
- **30-day**: Monthly trajectory
- **90-day**: Quarterly pattern
- **Calculation**: EMA (Exponential Moving Average) deltas

### Interpretation Key

| Score Range | Status | Icon | Action Prompt |
|-------------|--------|------|---------------|
| 0–1 | 🚨 Critical gap | 🚨 | Pick 1 micro-action |
| 2–3 | ⚠️ Friction | ⚠️ | Schedule a weekly ritual |
| 4 | ✅ Healthy | ✅ | Maintain cadence |
| 5 | 🟢 Excellent | 🟢 | Consider mentoring/teaching-back |

**Display**: Interpretation Key shown below every score table

---

## 5) Cadences & Reports

### Daily (Optional)
- Journal entry with Area/Dimension tags
- Micro-actions (1-3 per day)

### Weekly (Optional)
- Review lagging Areas
- Commit to 1 action per area needing attention

### Monthly (MANDATORY)
- **Roll-up report** with GFS, area scores, trends
- **Profitability & Contribution Board** (WRK/MUS/WRT/SPE × FIN)
- **Integrity check**: Open items count
- **Forgiveness summary**: Acts completed

### Quarterly (MANDATORY)
- **Deep review**: All Areas analyzed
- **Re-weight Areas**: Adjust priorities for next quarter
- **OKRs**: Set objectives and key results
- **Archive highlights**: Capture wins and lessons

---

## 6) Special Board: Work & Finance Integration

### Profitability & Contribution Alignment

**Purpose**: Track financial outcomes of creative/professional work

**Views**: Monthly and Quarterly

**Inputs**:
- WRK/MUS/WRT/SPE outputs (revenue, costs, time)
- FIN metrics (cashflow, streams)
- Social impact notes

**Output**:
- **Profitability Ratio**: (Revenue - Costs) / Time Invested
- **Contribution Notes**: Social/community impact
- **Next Bets**: Strategic decisions for next period

---

## 7) Information Architecture (UI)

### 1. Home Dashboard
**Path**: `/fd/dashboard`

**Components**:
- GFS gauge (0-100 with confidence band)
- Top ↑3 trending Areas (30-day improvement)
- Bottom ↓3 lagging Areas (attention needed)
- "Do next" micro-actions (AI-generated)
- Interpretation Key (persistent footer)

### 2. Area Detail
**Path**: `/fd/area/:code`

**Components**:
- Radar chart (Dimensions scored)
- Journal highlights (last 10 entries)
- Linked actions (pending, completed)
- INT/FOR flags (integrity issues, forgiveness acts)
- Trend graph (30/90-day history)

### 3. Journal → Narrative
**Path**: `/fd/journal`

**Components**:
- Daily entry composer (markdown editor)
- Area/Dimension tags (multi-select)
- AI summary preview
- Link to AUT chapter(s)
- Sentiment indicator

### 4. Monthly Review
**Path**: `/fd/review/month/:YYYY-MM`

**Components**:
- Scorecards per Area (table view)
- Trend lines (30-day charts)
- Profitability & Contribution Board
- Integrity ledger (open items)
- Export to PDF/HTML

### 5. Quarterly Review
**Path**: `/fd/review/quarter/:YYYY-QQ`

**Components**:
- Re-weight Areas (drag sliders)
- OKRs for next quarter (form)
- Integrity ledger (summary)
- Forgiveness summary (acts completed)
- Archive highlights (markdown notes)

### 6. Law & Justice Console
**Path**: `/fd/law`

**Components**:
- Active cases tracker (e.g., 500-17-135909-250)
- Filings calendar (deadlines, status)
- Evidence health (documentation quality)
- Risk heat map

---

## 8) Data Model (Supabase/Postgres)

### Core Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `fd_area` | Canonical Areas | code, name, emoji, color, weight_default |
| `fd_dimension` | Sub-metrics | area_id, code, name, weight |
| `fd_entry` | Journal entries | user_id, date, content_md, sentiment |
| `fd_entry_link` | Entries → Areas | entry_id, area_id, dimension_id, strength |
| `fd_action` | Commitments | user_id, area_id, title, status, due_date |
| `fd_score_raw` | Manual/AI scores | user_id, area_id, period, score, source |
| `fd_score_rollup` | Aggregated scores | user_id, area_id, period, score, confidence, trends |
| `fd_review_month` | Monthly reports | user_id, month, report_json, gfs |
| `fd_review_quarter` | Quarterly reports | user_id, quarter, report_json, reweights_json |
| `fd_integrity_log` | Promise tracking | user_id, area_id, issue, resolved_at |
| `fd_forgiveness_log` | Amends tracking | user_id, area_id, act_type, completed_at |
| `fd_autobiography_chapter` | Narrative structure | user_id, title, status, coherence_score |
| `fd_autobiography_link` | Entries → Chapters | chapter_id, entry_id, weight |
| `fd_user_area_weight` | Custom weights | user_id, area_id, weight, effective_from |

### Indexes
- `(user_id, area_id, period)` on rollups
- `(user_id, date DESC)` on entries
- GIN index on `fd_entry.content_md` for full-text search

### Computed Functions
- `fn_fd_rollup_month(user_id, month)` → Monthly report JSON
- `fn_fd_rollup_quarter(user_id, quarter)` → Quarterly report JSON

---

## 9) API (Edge Functions)

### Base URL
`https://wisdomos-phoenix-frontend.vercel.app/api/fd`

### Endpoints

```typescript
// Areas
GET    /fd/areas                    // List all canonical Areas
GET    /fd/dimensions/:area_code    // Dimensions for Area

// Scores
GET    /fd/scores?period=2025-10    // Monthly rollups + confidence
POST   /fd/score                    // Upsert manual score

// Entries
POST   /fd/entry                    // Create journal entry
GET    /fd/entries?area=MUS&start=2025-10-01&end=2025-10-31

// Reviews
POST   /fd/review/month             // Generate monthly report (idempotent)
GET    /fd/review/month/:YYYY-MM    // Retrieve monthly report
POST   /fd/review/quarter           // Generate quarterly report
GET    /fd/review/quarter/:YYYY-QQ  // Retrieve quarterly report

// Profitability
GET    /fd/profitability?period=2025-10&type=month

// Actions
GET    /fd/actions?status=pending   // List actions
POST   /fd/actions                  // Create action
PATCH  /fd/actions/:id              // Update action status

// Integrity & Forgiveness
GET    /fd/integrity?resolved=false // Open integrity issues
POST   /fd/integrity                // Log integrity issue
POST   /fd/forgiveness              // Log forgiveness act
```

See [API Implementation Guide](./API_IMPLEMENTATION.md) for detailed specs.

---

## 10) Agent Hooks (Contract)

All agents return: `{proposedUpdates[], rationale, provenance}`

### JournalAgent
**Trigger**: New journal entry created
**Task**: Summarize → propose (Area, Dimension, score guess, confidence)
**Output**:
```json
{
  "proposed_updates": [
    {
      "type": "score",
      "data": {
        "area_code": "MUS",
        "dimension_code": "COMPOSITION",
        "score": 4.5,
        "confidence": 0.87
      },
      "rationale": "Entry mentions completing 3 new tracks this week"
    }
  ],
  "provenance": "JournalAgent v2.1"
}
```

### IntegrityAgent
**Trigger**: Weekly scan of promises vs. actions
**Task**: Diff commitments vs. actual behavior
**Output**: Create `fd_integrity_log` entries for broken promises

### NarrativeAgent
**Trigger**: Monthly review generation
**Task**: Cluster entries → link to `fd_autobiography_chapter`
**Output**: Chapter coherence scores, suggested links

### FinanceAgent
**Trigger**: Monthly review generation
**Task**: Ingest ledger → calculate profitability ratios
**Output**: `fd_score_raw` for FIN dimensions

### JusticeAgent
**Trigger**: Case metadata sync (weekly)
**Task**: Update LAW dimensions (momentum, evidence health)
**Output**: `fd_score_raw` for LAW dimensions

---

## 11) Analytics & KPIs

### Product Metrics

| Metric | Definition | Target |
|--------|------------|--------|
| **Activation** | First 3 Areas scored within 48h | ≥80% of new users |
| **Retention** | ≥1 monthly review for 3 consecutive months | ≥60% of activated users |
| **Outcome** | GFS +10 points in 90 days | ≥40% of retained users |
| **Laggard Recovery** | Laggard Area +1.0 in 30 days | ≥50% of users with laggard |
| **Integrity** | <3 unresolved INT items for 80% of weeks | ≥70% of active users |

---

## 12) Localization & Accessibility

### i18n
- Language keys for all labels (`/locales/en.json`, `/locales/es.json`)
- User language preference stored in profile
- Right-to-left (RTL) support for Arabic (future)

### Accessibility
- **WCAG AA compliance**: Focus states, keyboard nav, high-contrast mode
- **Screen reader support**: Semantic HTML, ARIA labels
- **Colorblind-friendly**: Use icons + text, not just color

---

## 13) Security & Privacy

### Row Level Security (RLS)
- All user-specific tables have RLS policies
- Users can only access their own data
- Tenant isolation enforced at database level

### Privacy
- Journals marked **private by default**
- Export functionality (GDPR compliance)
- Soft deletes with 30-day recovery window

### Audit Trail
- All agent writes include `provenance` field
- Changes are reversible (soft delete)
- Immutable audit logs for compliance

---

## 14) Acceptance Criteria (MVP FD-v5)

### Must-Have

1. ✅ User can score at least 10 Areas; GFS computes correctly
2. ✅ Monthly Review generates PDF/HTML report with interpretation key
3. ✅ Profitability & Contribution Board renders with WRK/MUS/WRT/SPE × FIN
4. ✅ INT/FOR logs can be created from entries and shown in Area Detail
5. ✅ LAW console shows at least one active case with status + evidence health
6. ✅ Area weights editable in Quarterly Review; rollups recompute
7. ✅ Dashboard shows GFS gauge, top/bottom 3 Areas, micro-actions

### Nice-to-Have

- 🔄 AI-suggested scores (behind confirmation modal)
- 🔄 Trend graphs (7/30/90-day visualization)
- 🔄 Mobile-responsive views
- 🔄 Dark mode toggle

---

## 15) Migration Notes (v4 → v5)

### Data Migration Tasks

1. **Split FRD/COM**: Re-map historical tags from "Friends & Community" → separate Areas
2. **Promote MUS/WRT/SPE**: Move from sub-categories of "Creative" to first-class Areas
3. **Add LAW/INT/FOR/AUT**: Backfill minimal records to keep rollups stable
4. **Re-weight defaults**: Raise FIN to 0.12; cap any single Area at 0.15
5. **Update dimensions**: Map old sub-categories to new dimension codes

### Migration Script
See `supabase/migrations/20251029_v4_to_v5_migration.sql`

---

## 16) Engineer Task List (Do Now)

### Phase 1: Database & API (Week 1)
1. ✅ Run migration: `20251029_fulfillment_display_v5.sql`
2. ✅ Run seed data: `20251029_fulfillment_display_v5_seed.sql`
3. ⏳ Implement Edge Functions: `/fd/areas`, `/fd/scores`, `/fd/entry`
4. ⏳ Test RLS policies: Ensure user isolation works
5. ⏳ Deploy to Supabase staging

### Phase 2: Monthly Review (Week 2)
1. ⏳ Build Monthly Review page (`/fd/review/month/:YYYY-MM`)
2. ⏳ Implement `fn_fd_rollup_month` function
3. ⏳ Add PDF export (puppeteer or react-pdf)
4. ⏳ Include Interpretation Key in report footer
5. ⏳ Deploy to staging

### Phase 3: Area Detail & Actions (Week 3)
1. ⏳ Build Area Detail page with radar chart
2. ⏳ Implement INT/FOR log display
3. ⏳ Add action creation/management
4. ⏳ Wire up trend graphs (30/90-day)
5. ⏳ Deploy to staging

### Phase 4: Profitability Board (Week 4)
1. ⏳ Build Profitability & Contribution Board component
2. ⏳ Implement `/fd/profitability` endpoint
3. ⏳ Connect WRK/MUS/WRT/SPE × FIN data
4. ⏳ Add "Next Bets" input form
5. ⏳ Deploy to staging

### Phase 5: Agent Integration (Week 5)
1. ⏳ Wire JournalAgent → auto-proposed scores
2. ⏳ Add confirmation modal for AI suggestions
3. ⏳ Implement IntegrityAgent weekly scan
4. ⏳ Connect FinanceAgent to monthly review
5. ⏳ Test end-to-end agent flows

### Phase 6: Polish & Launch (Week 6)
1. ⏳ Mobile responsive testing
2. ⏳ Accessibility audit (WCAG AA)
3. ⏳ Performance optimization (Lighthouse >90)
4. ⏳ User acceptance testing
5. ⏳ Deploy to production

---

## 17) Resources

- **Database Schema**: `supabase/migrations/20251029_fulfillment_display_v5.sql`
- **Seed Data**: `supabase/migrations/20251029_fulfillment_display_v5_seed.sql`
- **TypeScript Types**: `packages/types/fulfillment-display.ts`
- **API Docs**: `docs/fulfillment-display-v5/API_IMPLEMENTATION.md`
- **UI Components**: `docs/fulfillment-display-v5/UI_COMPONENTS.md`

---

**Document Version**: 5.0
**Last Updated**: 2025-10-29
**Status**: Ready for Implementation

---

*"Measure what matters. Transform with intention."*
