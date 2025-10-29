# AI Journal Analysis - Quick Start

## Overview

AI-powered system that automatically extracts fulfillment scores from journal entries using OpenAI GPT-4.

## Installation

### 1. Install Dependencies

```bash
npm install openai
# or
pnpm add openai
```

### 2. Set Up Environment Variables

Add to your `.env.local`:

```bash
# OpenAI API
OPENAI_API_KEY=sk-your-key-here

# Supabase (should already be configured)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Get your OpenAI API key from: https://platform.openai.com/api-keys

## Files Created

```
apps/web/
├── lib/
│   ├── ai-journal-analysis.ts           # Core AI service
│   └── journal-analysis-integration.ts  # Supabase integration
├── hooks/
│   └── useJournalAnalysis.ts           # React hook
├── components/
│   ├── fulfillment/
│   │   └── JournalAnalysisPreview.tsx  # UI component
│   └── journal/
│       └── JournalAnalysisModal.tsx    # Modal wrapper

examples/
└── journal-analysis-demo.ts             # Demo script

docs/
└── AI_JOURNAL_ANALYSIS.md              # Full documentation
```

## Quick Test

### 1. Test with Demo Script

```bash
# Set your OpenAI API key
export OPENAI_API_KEY=sk-your-key-here

# Run demo
cd "/Volumes/DevOPS 2025/01_DEVOPS_PLATFORM/wisdomOS 2026/apps/wisdom/wisdome phase 3"
npx ts-node examples/journal-analysis-demo.ts
```

### 2. Test in Browser

Add this to any page in your Next.js app:

```typescript
import { JournalAnalysisModal } from '@/components/journal/JournalAnalysisModal';
import { useState } from 'react';

export default function TestPage() {
  const [showModal, setShowModal] = useState(false);

  const sampleJournal = `
    Today was incredibly productive! Wrapped up the client project ahead of schedule.
    The team meeting went smoothly. After work, went to the gym for a solid workout.
    Had a great dinner with the family. Financially feeling secure with the new client
    locked in for Q1. Overall feeling grateful and aligned with my purpose.
  `;

  return (
    <div className="p-8">
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Test AI Analysis
      </button>

      <JournalAnalysisModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        journalText={sampleJournal}
        userId="test-user"
        tenantId="test-tenant"
        autoAnalyze={true}
        onScoresSaved={(scores) => {
          console.log('Saved scores:', scores);
          alert(`Saved ${scores.length} scores!`);
        }}
      />
    </div>
  );
}
```

## Usage Examples

### Example 1: Analyze Journal Text

```typescript
import { analyzeJournalEntry } from '@/lib/ai-journal-analysis';

const result = await analyzeJournalEntry("Today at work...");

if ('error' in result) {
  console.error(result.error);
} else {
  console.log(`Sentiment: ${result.sentiment}`);
  console.log(`Found ${result.scores.length} areas:`);

  result.scores.forEach(score => {
    console.log(`${score.area_code}: ${score.score}/5 (confidence: ${score.confidence})`);
    console.log(`Reasoning: ${score.reasoning}`);
  });
}
```

### Example 2: Save to Database

```typescript
import { saveScoresToSupabase } from '@/lib/journal-analysis-integration';

const saveResult = await saveScoresToSupabase(analyzedScores, {
  userId: 'user-123',
  tenantId: 'tenant-456',
  source: 'journal_ai',
});

console.log(`Saved ${saveResult.savedCount} scores`);
```

### Example 3: Complete Workflow

```typescript
import { createAnalyzeAndSaveJournal } from '@/lib/journal-analysis-integration';

const result = await createAnalyzeAndSaveJournal(journalText, {
  userId: 'user-123',
  tenantId: 'tenant-456',
  minConfidence: 0.5,
});

console.log(`Entry ID: ${result.entryId}`);
console.log(`Saved ${result.saveResult.savedCount} scores`);
```

## Integration with Journal Modal

To add AI analysis to your existing journal save flow:

```typescript
// In your journal save handler:
const handleSave = async () => {
  // 1. Save journal entry (existing code)
  const entry = await saveJournalEntry(journalData);

  // 2. Show AI analysis modal
  setShowAnalysisModal(true);
  setCurrentJournalId(entry.id);
};

// Add modal to your component:
<JournalAnalysisModal
  isOpen={showAnalysisModal}
  onClose={() => setShowAnalysisModal(false)}
  journalText={journalBody}
  journalId={currentJournalId}
  userId={userId}
  tenantId={tenantId}
  autoAnalyze={true}
  onScoresSaved={(scores) => {
    // Optional: Update UI or refresh data
    console.log(`Saved ${scores.length} fulfillment scores`);
    setShowAnalysisModal(false);
  }}
/>
```

## Expected Output

When you analyze a journal entry, you'll get:

```json
{
  "sentiment": 0.75,
  "summary": "Productive work day with team success, fitness achievement, and family connection",
  "areas_mentioned": ["WRK", "HLT", "FAM", "FIN", "PUR"],
  "scores": [
    {
      "area_code": "WRK",
      "score": 5,
      "confidence": 0.95,
      "reasoning": "Exceptional productivity completing project ahead of schedule with positive team dynamics"
    },
    {
      "area_code": "HLT",
      "score": 5,
      "confidence": 0.90,
      "reasoning": "Solid workout completed, demonstrating consistent fitness commitment"
    },
    // ... more scores
  ],
  "token_usage": {
    "prompt": 1200,
    "completion": 450,
    "total": 1650
  }
}
```

## Cost Estimates

- **Per Analysis**: $0.05 - $0.12
- **100 Journals/month**: ~$5 - $12
- **Daily Analysis (30/month)**: ~$2 - $4

## Troubleshooting

### "OPENAI_API_KEY not found"
- Add key to `.env.local`
- Restart dev server after adding

### "Unable to connect to OpenAI API"
- Check internet connection
- Verify API key is valid
- Check OpenAI service status: https://status.openai.com/

### "Analysis returns no scores"
- Journal text may be too short (minimum 20 characters)
- Text may be too vague - encourage detailed entries
- Check AI reasoning in response

### Scores seem inaccurate
- Review the AI's reasoning explanation
- Adjust scores manually in the UI
- Confidence scores indicate certainty level

## Next Steps

1. ✅ Test with demo script
2. ✅ Test in browser with sample text
3. ✅ Integrate with existing journal save flow
4. ✅ Review and adjust scores in UI
5. ✅ Monitor token usage and costs
6. ✅ Collect user feedback on accuracy

## Full Documentation

See `/docs/AI_JOURNAL_ANALYSIS.md` for:
- Complete API reference
- Prompt engineering details
- Database schema
- Performance optimization
- Best practices
- Advanced usage

## Support

For issues:
1. Check browser console for errors
2. Verify environment variables are set
3. Test with demo script first
4. Review full documentation
5. Check OpenAI API status

## Sample Journal Texts for Testing

### Positive Entry
```
Today was incredibly productive! Wrapped up the client project ahead of schedule.
The team meeting went smoothly and I felt really aligned. After work, went to the
gym and hit a new PR. Had a great dinner with the family. Financially feeling
secure with new client locked in. Overall feeling grateful and aligned with my purpose.
```

### Challenging Entry
```
Tough day. Project hit a snag and deadline is still the same. Team is stressed.
Missed the gym again this week, too tired. Sleep has been terrible. Had an
argument with mom about boundaries. Money is tight this month. Feeling stuck
and frustrated.
```

### Mixed Entry
```
Mixed bag today. Work was okay, got through my tasks but nothing spectacular.
Made it to yoga which felt good. Lunch with an old friend was the highlight.
Been reading about purpose and meaning, got me thinking. Finances are stable
but not growing.
```

---

**Ready to analyze journals with AI!** 🚀
