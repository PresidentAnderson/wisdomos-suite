# Session Archive Template

**Date Range**: YYYY-MM-DD to YYYY-MM-DD
**Duration**: X hours
**Topic**: [Feature/Task Name]
**Branch**: [Git branch name]
**Status**: ✅ Complete / 🚧 In Progress / ⚠️ Blocked

---

## Executive Summary

Brief 2-3 paragraph overview of what was accomplished in this session.

### Key Deliverables
- ✅ Deliverable 1
- ✅ Deliverable 2
- ✅ Deliverable 3

### Key Metrics
- **Files Created**: X
- **Files Modified**: X
- **Lines of Code**: X additions, X deletions
- **Git Commits**: X
- **Deployments**: X

---

## User's Primary Requests

List all primary requests from the user in chronological order:

1. **Request 1**: "exact quote from user"
   - Intent: What they wanted to achieve
   - Response: How we addressed it

2. **Request 2**: "exact quote from user"
   - Intent: What they wanted to achieve
   - Response: How we addressed it

---

## Chronological Conversation Log

### Section 1: [Phase Name] (HH:MM - HH:MM)

**User Message 1:**
```
[Exact user message verbatim]
```

**Assistant Response:**
```
[Exact assistant response verbatim]
```

**Tools Used:**
- Tool 1: [Purpose and result]
- Tool 2: [Purpose and result]

**Code Changes:**
```typescript
// Show relevant code snippets
```

---

### Section 2: [Phase Name] (HH:MM - HH:MM)

[Continue pattern...]

---

## All Files Created/Modified

### New Files Created

#### 1. `path/to/file.ts` (XXX lines)
**Purpose**: Brief description
**Key Functions**:
- Function 1: Description
- Function 2: Description

```typescript
// Representative code snippet
```

#### 2. `path/to/file2.ts` (XXX lines)
[Continue pattern...]

### Modified Files

#### 1. `path/to/existing.ts`
**Changes Made**:
- Change 1: Description
- Change 2: Description

**Before:**
```typescript
// Old code
```

**After:**
```typescript
// New code
```

---

## Technical Decisions & Architecture

### Decision 1: [Technology Choice]
**Context**: Why this decision was needed
**Options Considered**:
1. Option A - Pros/Cons
2. Option B - Pros/Cons
3. Option C (CHOSEN) - Pros/Cons

**Rationale**: Why we chose this option
**Trade-offs**: What we gave up

### Decision 2: [Architecture Pattern]
[Continue pattern...]

---

## Database Changes

### Schema Modifications

```prisma
// Show Prisma schema changes
model NewModel {
  // ...
}
```

### Migrations Created
1. **Migration Name**: `YYYYMMDD_description.sql`
   - Tables added: X
   - Columns added: X
   - Indexes added: X

### RLS Policies
```sql
-- Show any Row-Level Security policies
```

---

## API Changes

### New Endpoints
1. **`POST /api/endpoint`**
   - Purpose: Description
   - Request: Type definition
   - Response: Type definition
   - Authentication: Required/Optional

### Modified Endpoints
[List changes to existing endpoints]

---

## UI/UX Changes

### New Components
1. **ComponentName** (`path/to/component.tsx`)
   - Purpose: Description
   - Props: List key props
   - Styling: Phoenix theme patterns used

### Modified Components
[List changes to existing components]

---

## Errors Encountered & Resolutions

### Error 1: [Error Name/Type]
**When**: What action triggered it
**Symptoms**: Error message or behavior
**Root Cause**: Technical explanation
**Solution**: How it was fixed
**Prevention**: How to avoid in future

```bash
# Error output
[Error message]
```

### Error 2: [Error Name/Type]
[Continue pattern...]

---

## Deployment Failures & Bug Reports

**Note**: If any deployment failures occurred, detailed bug reports are created in separate files.

### Deployment Failure 1: [Brief Description]
**Severity**: 🔴 Critical / 🟠 High / 🟡 Medium / 🟢 Low
**Status**: 🚨 Open / 🔍 Investigating / 🔧 In Progress / ✅ Resolved
**Bug Report**: [BUG_REPORT_YYYY-MM-DD_Description.md](./BUG_REPORT_YYYY-MM-DD_Description.md)

**Quick Summary**:
- Platform: Vercel / Netlify / etc.
- Error: Brief error description
- Impact: Production blocked / Feature broken / etc.
- Status: How it was resolved or current state

### Deployment Failure 2: [Brief Description]
[Continue pattern...]

**All Bug Reports from This Session**:
- [BUG_REPORT_2025-10-30_Vercel_Build_Failure.md](./BUG_REPORT_2025-10-30_Vercel_Build_Failure.md)
- [BUG_REPORT_2025-10-30_Database_Migration_Error.md](./BUG_REPORT_2025-10-30_Database_Migration_Error.md)

---

## Testing & Validation

### Manual Testing Completed
- ✅ Test case 1
- ✅ Test case 2
- ⚠️ Test case 3 (blocked by X)

### Automated Tests
- Unit tests: X passing
- Integration tests: X passing
- E2E tests: X passing

### Testing Checklist for Next Session
- [ ] Test case 1
- [ ] Test case 2
- [ ] Test case 3

---

## Deployment Process

### Git Activity

**Commits:**
```bash
abc1234 - feat: Description of change
def5678 - fix: Description of fix
ghi9012 - chore: Description of chore
```

**Branch Operations:**
- Created branch: `feature/branch-name`
- Merged from: `main`
- Pushed to: `origin/feature/branch-name`

### Vercel Deployment

**Build Details:**
- Build ID: [Vercel build ID]
- Build time: XX seconds
- Build status: ✅ Success / ❌ Failed

**Deployment URLs:**
- Preview: https://preview-url.vercel.app
- Production: https://production-url.vercel.app

**Environment Variables:**
- Added: VAR_NAME
- Modified: VAR_NAME
- Removed: VAR_NAME

### Database Deployment
- Migration applied: ✅ Yes / ❌ No
- Applied via: Supabase Dashboard / Prisma CLI
- Timestamp: YYYY-MM-DD HH:MM:SS

---

## Performance Metrics

### Bundle Size
- Before: XX KB
- After: XX KB
- Change: +/- XX KB

### Build Time
- Before: XX seconds
- After: XX seconds
- Change: +/- XX seconds

### Database Queries
- New queries: X
- Optimized queries: X
- Query time impact: Description

---

## Dependencies Added/Modified

### Added
```json
{
  "package-name": "^version"
}
```

### Modified
```json
{
  "package-name": "^old-version" → "^new-version"
}
```

### Removed
```json
{
  "package-name": "^version"
}
```

---

## Knowledge & Insights Gained

### Technical Learnings
1. **Learning 1**: Description of what was learned
2. **Learning 2**: Description of what was learned

### Gotchas & Pitfalls
1. **Gotcha 1**: What to watch out for
2. **Gotcha 2**: What to watch out for

### Best Practices Established
1. **Practice 1**: Description
2. **Practice 2**: Description

---

## Resources & References

### Documentation
- [Link to docs](url): Description
- [Link to docs](url): Description

### External Libraries
- Library 1: Purpose and why chosen
- Library 2: Purpose and why chosen

### Relevant Issues/PRs
- Issue #123: Description
- PR #456: Description

---

## Completed Tasks Checklist

### Implementation
- ✅ Task 1: Description
- ✅ Task 2: Description
- ✅ Task 3: Description

### Deployment
- ✅ Code pushed to GitHub
- ✅ Vercel deployment successful
- ✅ Database migration applied
- ✅ Environment variables configured

### Documentation
- ✅ Code comments added
- ✅ Session summary created
- ✅ Session archive created
- ✅ README updated

---

## Pending Tasks for Next Session

### High Priority
- [ ] Task 1: Description
- [ ] Task 2: Description

### Medium Priority
- [ ] Task 3: Description
- [ ] Task 4: Description

### Low Priority / Nice to Have
- [ ] Task 5: Description
- [ ] Task 6: Description

### Blocked
- ⚠️ Task 7: Description (blocked by X)

---

## Future Enhancements

### Short Term (Next Session)
1. Enhancement 1: Description
2. Enhancement 2: Description

### Medium Term (This Sprint)
1. Enhancement 3: Description
2. Enhancement 4: Description

### Long Term (Future Sprints)
1. Enhancement 5: Description
2. Enhancement 6: Description

---

## Session Continuation Points

### Context for Next Session
Brief paragraph on where we left off and what the next logical steps are.

### Quick Start Commands
```bash
# Commands to resume work
cd path/to/project
pnpm install
pnpm dev
```

### Files to Review First
1. `path/to/important/file.ts`: Why to review
2. `path/to/another/file.ts`: Why to review

### Questions to Address
1. Question 1?
2. Question 2?

---

## Session Statistics

**Total Messages**: XX
**User Messages**: XX
**Assistant Messages**: XX
**Tool Invocations**: XX
**Code Blocks**: XX
**Files Read**: XX
**Files Written**: XX
**Bash Commands**: XX
**Git Operations**: XX

---

## Appendix

### Full Tool Outputs

#### Tool Use 1: [Tool Name]
```
[Complete output]
```

#### Tool Use 2: [Tool Name]
```
[Complete output]
```

### Complete Code Diffs

#### File 1: `path/to/file.ts`
```diff
- old line
+ new line
```

### Environment Details
- Node version: vXX.XX.XX
- pnpm version: vX.XX.X
- Platform: darwin/linux/win32
- OS Version: XX.X.X
- Working Directory: /path/to/project

---

**Session Archive Generated**: YYYY-MM-DD HH:MM:SS
**Archive Version**: 1.0
**Template Version**: 1.0
