# Installation Instructions - AI Journal Analysis

## Quick Install (5 minutes)

### Step 1: Install OpenAI Package

```bash
cd "/Volumes/DevOPS 2025/01_DEVOPS_PLATFORM/wisdomOS 2026/apps/wisdom/wisdome phase 3"

# Install in web app
cd apps/web
npm install openai
# or
pnpm add openai

# Return to root
cd ../..
```

### Step 2: Get OpenAI API Key

1. Go to: https://platform.openai.com/api-keys
2. Sign in or create account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)
5. **Important**: Save it somewhere safe - you can't view it again!

### Step 3: Configure Environment

Add to `.env.local` (create if doesn't exist):

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-your-actual-key-here

# These should already exist:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Step 4: Test Installation

```bash
# Quick test
pnpm tsx scripts/test-ai-journal-analysis.ts

# Full demo (optional)
pnpm tsx examples/journal-analysis-demo.ts
```

Expected output:
```
✅ TEST PASSED: AI Journal Analysis is working correctly!
```

### Step 5: Restart Dev Server

```bash
# If dev server is running, restart it:
pnpm web:dev
```

## That's It!

You're ready to use AI journal analysis. See `AI_JOURNAL_ANALYSIS_README.md` for usage examples.

## Troubleshooting

### "OpenAI package not found"
```bash
cd apps/web
npm install openai
```

### "OPENAI_API_KEY not found"
- Check `.env.local` exists in project root
- Key should start with `sk-`
- Restart dev server after adding

### "Failed to connect to OpenAI API"
- Check internet connection
- Verify API key is valid
- Check OpenAI status: https://status.openai.com/

### "Quota exceeded"
- Check billing: https://platform.openai.com/account/billing
- Add payment method or increase limits

## Cost Management

### Free Tier
OpenAI provides $5 free credits for new accounts (expires after 3 months).

### Paid Tier
- ~$0.08 per journal analysis
- ~$5-12 per month for typical usage (30-100 journals)
- Set usage limits in OpenAI dashboard to control costs

## Next Steps

1. ✅ Test with sample journal
2. ✅ Try your own journal text
3. ✅ Integrate into journal save flow
4. ✅ Review documentation
5. ✅ Monitor costs in OpenAI dashboard

## Files Reference

- **Quick Start**: `AI_JOURNAL_ANALYSIS_README.md`
- **Full Docs**: `docs/AI_JOURNAL_ANALYSIS.md`
- **Summary**: `AI_JOURNAL_ANALYSIS_SUMMARY.md`
- **Test Script**: `scripts/test-ai-journal-analysis.ts`
- **Demo Script**: `examples/journal-analysis-demo.ts`

## Support

If you run into issues:
1. Check error message in console
2. Review troubleshooting section above
3. Verify environment variables are set
4. Test with demo script first
5. Check OpenAI API status

---

**Ready to analyze journals!** 🚀
