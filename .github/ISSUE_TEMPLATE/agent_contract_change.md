---
name: Agent Contract Change
about: Propose changes to message envelopes, events, or agent contracts
title: '[CONTRACT] '
labels: contract, breaking-change, agents
assignees: ''
---

## Change Summary
<!-- Brief description of the proposed contract change -->

## Affected Components
- [ ] MessageEnvelope
- [ ] Event Types
- [ ] QueueJob
- [ ] Agent Interface
- [ ] Database Schema
- [ ] Other: <!-- specify -->

## What Changed?

### Before
```typescript
// Existing contract
```

### After
```typescript
// New contract
```

## Reason for Change
<!-- Why is this change necessary? -->

## Impact Assessment

### Affected Agents
- [ ] Orchestrator
- [ ] PlannerAgent
- [ ] JournalAgent
- [ ] CommitmentAgent
- [ ] FulfilmentAgent
- [ ] NarrativeAgent
- [ ] IntegrityAgent
- [ ] FinanceAgent
- [ ] JusticeAgent
- [ ] UIUXAgent
- [ ] AnalyticsAgent
- [ ] I18nAgent
- [ ] SecurityAgent
- [ ] DevOpsAgent

### Breaking Changes
- [ ] Yes (requires migration)
- [ ] No (backwards compatible)

## Migration Steps

### Database Migration
```sql
-- Migration SQL if applicable
```

### Code Changes Required
1. <!-- Step 1 -->
2. <!-- Step 2 -->
3. <!-- Step 3 -->

### Data Migration
<!-- How will existing data be migrated? -->

## Backwards Compatibility

### Version Support
- **Current Version**: <!-- e.g., 1.0.0 -->
- **New Version**: <!-- e.g., 1.1.0 -->
- **Deprecation Timeline**: <!-- e.g., 90 days -->

### Compatibility Layer
<!-- How will we support both old and new contracts during transition? -->

## Testing Strategy
- [ ] Unit tests updated
- [ ] Integration tests cover old → new transition
- [ ] E2E tests verify end-to-end flow
- [ ] Load tests confirm performance
- [ ] Rollback plan tested

## Rollout Plan
1. <!-- Deploy to dev -->
2. <!-- Deploy to staging -->
3. <!-- Monitor for issues -->
4. <!-- Deploy to production (canary) -->
5. <!-- Full production rollout -->

## Documentation Updates
- [ ] API documentation
- [ ] Agent documentation
- [ ] Migration guide
- [ ] CHANGELOG.md

## Review Checklist
- [ ] Contract change reviewed by lead architect
- [ ] Impact assessment complete
- [ ] Migration plan approved
- [ ] Tests cover all scenarios
- [ ] Documentation ready
- [ ] Team notified

## Timeline
**Target Date**: <!-- YYYY-MM-DD -->
**Deprecation Date**: <!-- YYYY-MM-DD if applicable -->
