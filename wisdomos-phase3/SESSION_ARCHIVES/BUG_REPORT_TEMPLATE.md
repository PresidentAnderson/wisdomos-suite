# Bug Report Template

**Bug ID**: BUG-YYYY-MM-DD-XXX
**Severity**: 🔴 Critical / 🟠 High / 🟡 Medium / 🟢 Low
**Status**: 🚨 Open / 🔍 Investigating / 🔧 In Progress / ✅ Resolved
**Created**: YYYY-MM-DD HH:MM:SS
**Session**: [Link to session archive](./YYYY-MM-DD_Session_Name.md)

---

## Summary

Brief one-sentence description of the bug.

---

## Deployment Details

**Target Platform**: Vercel / Netlify / Railway / AWS / Other
**Environment**: Production / Staging / Development
**Branch**: `branch-name`
**Commit**: `abc1234` - "commit message"
**Deployment ID**: (if applicable)
**Build/Deployment URL**: (if applicable)

---

## Timestamp & Context

**Failure Occurred**: YYYY-MM-DD HH:MM:SS
**Deployment Step**: Build / Deploy / Migration / Post-Deploy / Other
**Session Phase**: What we were trying to accomplish when this failed

---

## Error Output

### Primary Error Message
```
[Main error message here]
```

### Full Stack Trace
```
[Complete stack trace with line numbers]
```

### Build/Deployment Logs
```bash
# Full output from deployment command
$ vercel deploy
...
[Full log output]
```

---

## Environment Details

**Platform**: darwin / linux / windows
**OS Version**: Darwin 24.6.0 / Ubuntu 22.04 / etc.
**Node Version**: vXX.XX.XX
**pnpm/npm Version**: vX.XX.X
**Package Manager**: pnpm / npm / yarn

**Key Dependencies**:
```json
{
  "next": "14.x.x",
  "react": "18.x.x",
  "@prisma/client": "x.x.x"
}
```

**Environment Variables**:
- ✅ DATABASE_URL: Configured
- ✅ OPENAI_API_KEY: Configured
- ❌ MISSING_VAR: Not set
- 🔍 SUSPICIOUS_VAR: Value seems incorrect

---

## Steps to Reproduce

1. **Step 1**: Description of action
   ```bash
   $ command executed
   ```

2. **Step 2**: Description of action
   ```bash
   $ command executed
   ```

3. **Step 3**: Description of action
   ```bash
   $ command executed
   ```

4. **Result**: Error occurs at this point

---

## Files/Commits Involved

### Modified Files
- `path/to/file1.ts` - Description of changes
- `path/to/file2.tsx` - Description of changes
- `package.json` - Dependency changes

### Recent Commits
```bash
abc1234 - feat: Description of change that may have caused issue
def5678 - fix: Previous fix attempt
ghi9012 - chore: Configuration change
```

### Relevant Code Sections

**File**: `path/to/problematic/file.ts`
**Lines**: 123-145

```typescript
// Code that may be causing the issue
export function problematicFunction() {
  // ...
}
```

---

## Root Cause Analysis

### Initial Hypothesis
What we first thought was causing the issue.

### Investigation Steps
1. Checked X - Result: ...
2. Verified Y - Result: ...
3. Tested Z - Result: ...

### Confirmed Root Cause
The actual root cause after investigation (if known).

**Technical Explanation**:
Detailed explanation of why this is happening at a technical level.

---

## Attempted Solutions

### Attempt 1: [Solution Description]
**Action Taken**:
```bash
$ commands executed
```

**Result**: ❌ Failed / ⚠️ Partial Success / ✅ Worked

**Output**:
```
[Output or error message]
```

**Why it didn't work**: Explanation

---

### Attempt 2: [Solution Description]
**Action Taken**:
```bash
$ commands executed
```

**Result**: ❌ Failed / ⚠️ Partial Success / ✅ Worked

**Output**:
```
[Output or error message]
```

**Why it didn't work**: Explanation

---

### Attempt 3: [Solution Description]
**Action Taken**:
```bash
$ commands executed
```

**Result**: ❌ Failed / ⚠️ Partial Success / ✅ Worked

**Output**:
```
[Output or error message]
```

---

## Recommended Fix

### Short-term Workaround
Immediate steps to unblock deployment (if any):
1. Action 1
2. Action 2
3. Action 3

### Long-term Solution
Proper fix to prevent recurrence:

**Code Changes Required**:
```typescript
// File: path/to/file.ts

// Before (problematic code)
const broken = ...;

// After (fixed code)
const fixed = ...;
```

**Configuration Changes**:
```json
// package.json or config file
{
  "setting": "new-value"
}
```

**Deployment Steps**:
1. Step 1
2. Step 2
3. Step 3

---

## Impact Assessment

**Severity Justification**: Why this is Critical/High/Medium/Low

**User Impact**:
- Production deployment blocked: Yes / No
- Feature broken: Yes / No
- Data loss risk: Yes / No
- Security vulnerability: Yes / No

**Business Impact**:
- Revenue impact: Yes / No
- User-facing: Yes / No
- Internal tooling only: Yes / No

**Urgency**:
- Immediate fix required: Yes / No
- Can wait until next sprint: Yes / No
- Low priority enhancement: Yes / No

---

## Related Issues

**Similar Past Issues**:
- [BUG-2025-10-15-001](./BUG_REPORT_2025-10-15_Similar_Issue.md) - Similar error in different context
- [BUG-2025-09-20-003](./BUG_REPORT_2025-09-20_Related_Bug.md) - Related to same component

**GitHub Issues**:
- Issue #123: Description
- PR #456: Related pull request

**Documentation**:
- [Relevant docs](url): Description
- [Stack Overflow](url): Similar question

---

## Testing & Verification

### How to Verify Fix

**Manual Testing**:
1. Test step 1
2. Test step 2
3. Expected result

**Automated Testing**:
```bash
# Commands to run tests
pnpm test
pnpm build
```

**Deployment Verification**:
1. Deploy to staging
2. Verify X works
3. Check Y is not broken
4. Deploy to production

### Regression Prevention

**Tests to Add**:
- Unit test for component X
- Integration test for flow Y
- E2E test for scenario Z

**Monitoring to Add**:
- Alert on error pattern X
- Dashboard for metric Y
- Log specific events Z

---

## Timeline

| Time | Event | Action Taken | Result |
|------|-------|--------------|--------|
| HH:MM | Deployment initiated | `vercel deploy` | Started normally |
| HH:MM | Build started | Running build process | In progress |
| HH:MM | Error occurred | Build failed | ❌ Failed |
| HH:MM | Investigation started | Checking logs | Found error X |
| HH:MM | Fix attempt 1 | Changed config Y | ❌ Still failing |
| HH:MM | Fix attempt 2 | Updated dependency Z | ⚠️ Different error |
| HH:MM | Root cause found | Identified issue in file A | - |
| HH:MM | Proper fix applied | Updated code in A | ✅ Build passed |

---

## Resolution

**Status**: ✅ Resolved / 🔧 In Progress / 🚨 Open

**Final Solution**:
Description of what finally fixed the issue.

**Code Changes**:
- Commit: `xyz7890` - "fix: Description of fix"
- Files modified: List of files

**Verification**:
- ✅ Build successful
- ✅ Deployment successful
- ✅ Feature working
- ✅ Tests passing

**Deployed**:
- Environment: Production
- Deployment URL: https://...
- Timestamp: YYYY-MM-DD HH:MM:SS

---

## Prevention

**How to Prevent This in Future**:

1. **Code Changes**:
   - Add validation for X
   - Improve error handling in Y
   - Add type safety to Z

2. **Process Changes**:
   - Add pre-deploy check for X
   - Update deployment checklist
   - Add to code review guidelines

3. **Documentation Updates**:
   - Document gotcha in README
   - Add to troubleshooting guide
   - Update deployment docs

4. **Tooling/Automation**:
   - Add pre-commit hook for X
   - Add CI check for Y
   - Add monitoring for Z

---

## Lessons Learned

### What Went Well
- Thing 1
- Thing 2

### What Could Be Improved
- Thing 1
- Thing 2

### Key Takeaways
- Insight 1
- Insight 2
- Insight 3

---

## Additional Notes

Any other relevant information, screenshots, references, or context.

---

**Report Generated**: YYYY-MM-DD HH:MM:SS
**Last Updated**: YYYY-MM-DD HH:MM:SS
**Updated By**: Claude Code / User Name
**Template Version**: 1.0
