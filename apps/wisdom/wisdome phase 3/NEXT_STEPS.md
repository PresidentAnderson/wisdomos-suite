# WisdomOS MAS - Next Steps

## 🚀 Immediate Actions (Today)

### 1. Run Setup (5 minutes)
```bash
cd "/Volumes/DevOPS 2025/01_DEVOPS_PLATFORM/wisdomOS 2026"
./scripts/setup-agents.sh
```

### 2. Configure Environment (2 minutes)
Edit `.env.agents`:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=sk-... # Optional for now
TZ=America/Toronto
```

### 3. Deploy Database (5 minutes)
```bash
supabase db push
```

Verify:
```sql
SELECT count(*) FROM fd_eras; -- Should return 13
SELECT count(*) FROM fd_area_templates; -- Should return 10
SELECT count(*) FROM fd_dimension_templates; -- Should return 6
```

### 4. Test the Flow (10 minutes)
```typescript
// Save as test-agents.ts
import { JournalAgent } from '@wisdomos/agents';

const agent = new JournalAgent({ version: '1.0.0' });

await agent.handleHttpEntry({
  content: 'I commit to exercising 5 days a week',
  date: '2025-10-29',
  userId: 'test-user-123',
});

// Watch logs for:
// [INFO] [JournalAgent] Entry ingested
// [INFO] [CommitmentAgent] Commitment detected
// [INFO] [CommitmentAgent] Area spawned
// [INFO] [FulfilmentAgent] Rollup completed
// [INFO] [NarrativeAgent] Chapter updated
```

---

## 📅 This Week

### Day 1 (Today) - Deploy MVP
- [ ] Run setup script
- [ ] Deploy migrations
- [ ] Test with 3 real entries
- [ ] Verify agent_logs table

### Day 2 - Build Minimal UI
- [ ] Home Dashboard (GFS gauge, Top 3/Bottom 3)
- [ ] Journal entry form
- [ ] Area list (show spawned CMT_xxx)
- [ ] Connect to agents via API

### Day 3 - Security & Analytics
- [ ] Implement SecurityAgent
- [ ] Enable field-level encryption
- [ ] Implement AnalyticsAgent
- [ ] Track KPIs (Activation, Retention, Outcome)

### Day 4 - Integration
- [ ] Connect Supabase Realtime for events
- [ ] Integrate LLM for classification
- [ ] Replace console logs with DB writes
- [ ] Set up scheduled rollups (cron)

### Day 5 - Testing & Polish
- [ ] Write E2E test: Journal → Area → Score → Chapter
- [ ] Load test orchestrator
- [ ] Fix any bugs found
- [ ] Deploy to production

---

## 🎯 Next 2 Weeks

### Week 1: Core Agents
- [ ] IntegrityAgent (promise tracking)
- [ ] FinanceAgent (ledger ingestion, profitability)
- [ ] JusticeAgent (LAW console sync)
- [ ] I18nAgent (EN/FR support)

### Week 2: Platform & UI
- [ ] DevOpsAgent (CI/CD integration)
- [ ] Area Detail view (radar charts)
- [ ] Monthly Review interface
- [ ] Quarterly Review (re-weighting)
- [ ] Lifeline visualization (1975-2100)

---

## 📋 Priority Order

### Critical Path (Must Have)
1. ✅ Database schema
2. ✅ Core agents (Journal, Commitment, Fulfilment, Narrative)
3. 🔲 Minimal UI (Dashboard + Entry Form)
4. 🔲 SecurityAgent (encryption, audit)
5. 🔲 Production integrations (Realtime, LLM)

### Important (Should Have)
6. 🔲 IntegrityAgent
7. 🔲 FinanceAgent
8. 🔲 AnalyticsAgent
9. 🔲 E2E tests
10. 🔲 Full UI (Area Detail, Reviews, Timeline)

### Nice to Have (Could Have)
11. 🔲 JusticeAgent (LAW console)
12. 🔲 PlannerAgent (DAG generation)
13. 🔲 DevOpsAgent (CI/CD)
14. 🔲 I18nAgent (bilingual)
15. 🔲 UIUXAgent (auto-dashboard)

---

## 🔧 Quick Commands

### Development
```bash
# Start agents in dev mode
cd packages/agents
pnpm dev

# Run tests
pnpm test

# Type check
pnpm type-check

# Lint
pnpm lint
```

### Database
```bash
# Push migrations
supabase db push

# Reset database (dev only!)
supabase db reset

# View logs
supabase logs

# Open studio
supabase studio
```

### Monitoring
```sql
-- Check agent activity
SELECT * FROM agent_logs ORDER BY created_at DESC LIMIT 20;

-- Check job queue
SELECT status, COUNT(*) FROM queue_jobs GROUP BY status;

-- Check events
SELECT type, COUNT(*) FROM queue_events GROUP BY type;

-- Check areas (including spawned)
SELECT code, name, is_commitment_spawned FROM fd_areas;
```

---

## 📚 Documentation

- **Overview**: `/docs/agents/README.md`
- **Detailed Status**: `/docs/agents/IMPLEMENTATION_SUMMARY.md`
- **Delivery Report**: `MAS_AGENT_FACTORY_DELIVERED.md`
- **Package Docs**: `/packages/agents/README.md`

---

## 🐛 Known Issues & TODOs

### Technical Debt
1. **Mock Implementations**
   - Classification uses keyword matching (needs LLM)
   - Sentiment analysis is basic (needs model)
   - Theme extraction is stubbed (needs LLM)

2. **Database Integration**
   - Agents log to console (needs DB writes)
   - Event bus not connected to Realtime
   - Job queue polling not active

3. **Error Handling**
   - Basic try-catch (needs production-grade recovery)
   - No circuit breakers
   - No dead letter queue

4. **Performance**
   - No caching layer
   - No connection pooling
   - No rate limiting on external APIs

### Quick Fixes (1-2 hours each)
- [ ] Add database logging instead of console
- [ ] Connect Supabase Realtime
- [ ] Add environment variable validation
- [ ] Add health check endpoint
- [ ] Add metrics collection

---

## 💡 Tips

### Testing Locally
```typescript
// Use Supabase local dev
supabase start

// Point agents to local instance
SUPABASE_URL=http://localhost:54321
```

### Debugging Agents
```typescript
// Enable debug logging
await agent.log('debug', 'Detailed info', { context });

// Query logs
SELECT * FROM agent_logs WHERE agent = 'JournalAgent' AND level = 'error';
```

### Performance Tuning
- Orchestrator: Adjust `pollIntervalMs` (default 5000ms)
- Orchestrator: Adjust `maxConcurrentJobs` (default 10)
- Rollups: Schedule off-peak (02:00 Toronto)

---

## 🎉 Success Criteria

### Week 1 (MVP)
- [ ] 3 users create entries
- [ ] Commitments auto-detected
- [ ] Areas spawned (CMT_xxx)
- [ ] Monthly scores calculated
- [ ] Chapters generated

### Week 2 (Beta)
- [ ] 10 users onboarded
- [ ] All 4 core agents stable
- [ ] UI shows real-time updates
- [ ] No critical bugs
- [ ] Performance acceptable (<1s response)

### Week 4 (v1.0)
- [ ] 50+ active users
- [ ] All 14 agents operational
- [ ] Full UI complete
- [ ] E2E tests passing
- [ ] Ready for marketing

---

## 📞 Get Help

### Questions?
1. Check `/docs/agents/README.md`
2. Check `/docs/agents/IMPLEMENTATION_SUMMARY.md`
3. Review code comments in `/packages/agents/src/`

### Issues?
Create GitHub issue using:
- `.github/ISSUE_TEMPLATE/feature_task.md`
- `.github/ISSUE_TEMPLATE/agent_contract_change.md`

### Bugs?
1. Check `agent_logs` table
2. Check `queue_jobs` for failed jobs
3. Review Supabase logs
4. Check browser console (UI)

---

**Ready to ship? Run this now:**

```bash
./scripts/setup-agents.sh
```

Then test the flow:
```
Journal Entry → Commitment Detection → Area Spawn → Score Rollup → Chapter Update
```

🚀 **Let's build the future!**
