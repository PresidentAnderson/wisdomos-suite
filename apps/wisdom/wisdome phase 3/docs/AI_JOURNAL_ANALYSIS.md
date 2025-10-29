# AI Journal Analysis System

## Overview

The AI Journal Analysis system automatically extracts fulfillment scores from journal entries using OpenAI's GPT-4. It identifies which life areas are mentioned, assigns confidence-weighted scores (0-5), and provides reasoning for each score.

## Features

- **Automatic Score Extraction**: AI reads journal text and identifies relevant life areas
- **16 Life Areas Coverage**: Analyzes across all canonical WisdomOS life dimensions
- **Confidence Scoring**: Each score includes a confidence level (0-1)
- **Reasoning Transparency**: Explains why each score was assigned
- **Phoenix-Themed UI**: Beautiful, animated interface for reviewing AI suggestions
- **User Control**: Accept, reject, or adjust AI-suggested scores
- **Batch Save**: Efficiently save multiple scores to Supabase
- **Fallback Support**: Graceful degradation when OpenAI is unavailable

## Architecture

### Core Components

1. **AI Analysis Service** (`/apps/web/lib/ai-journal-analysis.ts`)
   - OpenAI GPT-4 integration
   - Prompt engineering for accurate extraction
   - Validation and error handling
   - Fallback keyword-based analysis

2. **Preview Component** (`/apps/web/components/fulfillment/JournalAnalysisPreview.tsx`)
   - Phoenix-themed UI with animations
   - Score visualization and editing
   - Accept/reject controls
   - Loading and error states

3. **Integration Layer** (`/apps/web/lib/journal-analysis-integration.ts`)
   - Supabase database integration
   - Save to `fd_score_raw` table
   - Link entries to areas via `fd_entry_link`
   - Workflow orchestration

4. **React Hook** (`/apps/web/hooks/useJournalAnalysis.ts`)
   - State management
   - Loading and error handling
   - Simplified API for components

## The 16 Life Areas

| Code | Area | Description |
|------|------|-------------|
| WRK | Work/Enterprise | Professional work, business operations, career |
| PUR | Purpose/Calling | Life mission, calling, meaningful contribution |
| MUS | Music (Creative) | Musical composition, production, performances |
| WRT | Writing (Creative) | Written works, manuscripts, publications |
| SPE | Public Speaking | Presentations, talks, teaching |
| LRN | Learning & Growth | Continuous learning, skill development |
| HLT | Health & Vitality | Physical health, fitness, nutrition, sleep |
| SPF | Spiritual Development | Spiritual practices, meditation, faith |
| FIN | Finance & Wealth | Financial security, wealth building, budgeting |
| FAM | Family | Family relationships, boundaries, rituals |
| FRD | Friendship | Close friendships, social connections |
| COM | Community | Community engagement, service, belonging |
| LAW | Law & Justice | Legal matters, justice, compliance |
| INT | Integrity & Recovery | Personal integrity, promise-keeping |
| FOR | Forgiveness & Reconciliation | Forgiveness work, amends, healing |
| AUT | Autobiography (Narrative) | Life narrative, story coherence, legacy |

## Scoring Scale

| Score | Status | Meaning | Action |
|-------|--------|---------|--------|
| 0-1 | 🚨 Critical | Significant struggle or absence | Pick 1 micro-action |
| 2-3 | ⚠️ Friction | Challenges being addressed | Schedule weekly ritual |
| 4 | ✅ Healthy | Functioning well | Maintain cadence |
| 5 | 🟢 Excellent | Thriving, exceptional | Consider mentoring |

## Usage

### Basic Usage

```typescript
import { analyzeJournalEntry } from '@/lib/ai-journal-analysis';

const journalText = "Today was great at work...";
const result = await analyzeJournalEntry(journalText);

if ('error' in result) {
  console.error(result.error);
} else {
  console.log(`Found ${result.scores.length} areas`);
  result.scores.forEach(score => {
    console.log(`${score.area_code}: ${score.score}/5 (${score.confidence})`);
  });
}
```

### With React Hook

```typescript
import { useJournalAnalysis } from '@/hooks/useJournalAnalysis';

function JournalPage() {
  const { analyze, isAnalyzing, analysisResult } = useJournalAnalysis();

  const handleAnalyze = async () => {
    await analyze(journalText);
  };

  return (
    <div>
      <button onClick={handleAnalyze} disabled={isAnalyzing}>
        Analyze Journal
      </button>
      {analysisResult && (
        <div>Found {analysisResult.scores.length} areas!</div>
      )}
    </div>
  );
}
```

### With Modal Component

```typescript
import { JournalAnalysisModal } from '@/components/journal/JournalAnalysisModal';

function JournalEntryPage() {
  const [showAnalysis, setShowAnalysis] = useState(false);

  const handleSave = async (scores) => {
    console.log(`Saved ${scores.length} scores`);
    setShowAnalysis(false);
  };

  return (
    <>
      <button onClick={() => setShowAnalysis(true)}>
        Analyze Entry
      </button>

      <JournalAnalysisModal
        isOpen={showAnalysis}
        onClose={() => setShowAnalysis(false)}
        journalText={journalText}
        userId={userId}
        tenantId={tenantId}
        autoAnalyze={true}
        onScoresSaved={handleSave}
      />
    </>
  );
}
```

### Complete Workflow

```typescript
import { createAnalyzeAndSaveJournal } from '@/lib/journal-analysis-integration';

const result = await createAnalyzeAndSaveJournal(journalText, {
  userId: 'user-123',
  tenantId: 'tenant-456',
  minConfidence: 0.5, // Only save scores with >50% confidence
});

console.log(`Entry ID: ${result.entryId}`);
console.log(`Saved ${result.saveResult.savedCount} scores`);
```

## Configuration

### Environment Variables

Add to `.env.local`:

```bash
OPENAI_API_KEY=sk-your-key-here
# or for client-side usage:
NEXT_PUBLIC_OPENAI_KEY=sk-your-key-here

# Supabase (for saving scores)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### OpenAI Model Options

```typescript
const result = await analyzeJournalEntry(journalText, {
  model: 'gpt-4o',        // Default: GPT-4 Optimized
  temperature: 0.3,       // Default: 0.3 (more consistent)
  maxTokens: 1000,        // Default: 1000
});
```

## Prompt Engineering

### System Prompt Strategy

The system prompt is designed to:
1. **Set Context**: Establish role as life coach for WisdomOS
2. **Define Task**: Extract scores across 16 life areas
3. **Provide Scale**: Clear 0-5 scoring guidelines
4. **List Areas**: Complete descriptions of all 16 areas
5. **Set Guidelines**: Conservative extraction, context-aware, confidence scoring
6. **Format Output**: Enforce JSON structure

### Key Prompt Principles

- **Conservative**: Only extract clearly mentioned areas
- **Context-Aware**: Consider overall tone and specific details
- **Confidence-Based**: Lower confidence for ambiguous mentions
- **Synthesizing**: Combine multiple mentions into one score
- **Transparent**: Explain reasoning clearly

## Performance & Costs

### Token Usage

Typical analysis uses:
- **System Prompt**: ~1,200 tokens
- **Journal Entry**: ~200-800 tokens (800-3000 characters)
- **Response**: ~300-600 tokens
- **Total**: ~1,700-2,600 tokens per analysis

### Cost Estimates (GPT-4)

Based on OpenAI pricing (~$0.03 input / $0.06 output per 1K tokens):
- **Per Analysis**: $0.05-$0.12
- **100 Analyses/month**: $5-$12
- **1,000 Analyses/month**: $50-$120

### Optimization Tips

1. **Batch Processing**: Analyze multiple entries in one session
2. **Confidence Filtering**: Only save high-confidence scores (>0.5)
3. **Caching**: Store analysis results to avoid re-analyzing
4. **Rate Limiting**: Prevent excessive API calls
5. **Fallback Mode**: Use keyword-based analysis when budget constrained

## Database Schema

### fd_score_raw

Scores are saved to the `fd_score_raw` table:

```sql
CREATE TABLE fd_score_raw (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  area_id UUID NOT NULL REFERENCES fd_area(id),
  period VARCHAR(10) NOT NULL,        -- 'YYYY-MM'
  score DECIMAL(3,1) NOT NULL,        -- 0.0 to 5.0
  source fd_score_source NOT NULL,    -- 'journal_ai'
  provenance TEXT,                    -- AI details + reasoning
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### fd_entry_link

Journal-to-area links:

```sql
CREATE TABLE fd_entry_link (
  id UUID PRIMARY KEY,
  entry_id UUID NOT NULL REFERENCES fd_entry(id),
  area_id UUID NOT NULL REFERENCES fd_area(id),
  strength DECIMAL(3,2),              -- Confidence 0-1
  created_at TIMESTAMPTZ
);
```

## Error Handling

### Common Errors

1. **Missing API Key**
   ```
   Error: OPENAI_API_KEY not found in environment variables
   ```
   Solution: Add key to `.env.local`

2. **Quota Exceeded**
   ```
   Error: OpenAI API quota exceeded
   ```
   Solution: Check billing in OpenAI dashboard

3. **Invalid Response**
   ```
   Error: Failed to parse AI response as JSON
   ```
   Solution: Usually transient, retry analysis

4. **Network Error**
   ```
   Error: Unable to connect to OpenAI API
   ```
   Solution: Check internet connection

### Fallback Mode

When OpenAI is unavailable, the system falls back to keyword-based analysis:

```typescript
import { fallbackAnalysis } from '@/lib/ai-journal-analysis';

const result = fallbackAnalysis(journalText);
// Returns basic scores with low confidence
```

## Testing

### Run Demo Script

```bash
cd /path/to/project
npx ts-node examples/journal-analysis-demo.ts
```

This will analyze 5 sample journal entries:
- Positive entry (high scores)
- Challenging entry (low scores)
- Mixed entry (varied scores)
- Spiritual entry (SPF, FOR, AUT focus)
- Creative entry (MUS, WRT, SPE focus)

### Sample Output

```
ANALYZING: POSITIVE
Estimated tokens: 2,100
Estimated cost: $0.0945

✓ Analysis complete in 2,341ms

RESULTS:
  Summary: Productive work day with strong team alignment, fitness achievement, quality family time, and financial security
  Sentiment: 0.85 😊
  Areas detected: 5

EXTRACTED SCORES:

  🧱 Work/Enterprise
    Score: 5/5 (Excellent) 🌟
    Confidence: 95%
    Reasoning: "Exceptional productivity with project completion ahead of schedule, positive team dynamics, and progress on systemization."

  🩺 Health & Vitality
    Score: 5/5 (Excellent) 🌟
    Confidence: 90%
    Reasoning: "New personal record in gym, strong energy levels, positive physical feedback."

  ...
```

## Integration Points

### 1. Journal Entry Save

Add analysis button after saving:

```typescript
// In JournalModal.tsx
const handleSave = async () => {
  // Save journal entry
  const entry = await saveJournalEntry(data);

  // Show analysis modal
  setShowAnalysis(true);
  setAnalysisEntryId(entry.id);
};
```

### 2. Batch Processing

Process old entries:

```typescript
const entries = await fetchUnanalyzedEntries();

for (const entry of entries) {
  const result = await analyzeAndSaveJournal(entry.content, {
    userId: entry.user_id,
    tenantId: entry.tenant_id,
    journalEntryId: entry.id,
  });
}
```

### 3. API Endpoint

Create Next.js API route:

```typescript
// /app/api/journal/analyze/route.ts
import { analyzeJournalEntry } from '@/lib/ai-journal-analysis';

export async function POST(request: Request) {
  const { journalText } = await request.json();
  const result = await analyzeJournalEntry(journalText);
  return Response.json(result);
}
```

## Best Practices

1. **User Control**: Always let users review and edit AI suggestions
2. **Transparency**: Show confidence scores and reasoning
3. **Privacy**: Process journal text securely, never log content
4. **Feedback Loop**: Track acceptance/rejection rates to improve prompts
5. **Rate Limiting**: Implement per-user limits to control costs
6. **Caching**: Cache analysis results for 24 hours
7. **Monitoring**: Track API usage and costs
8. **Fallback**: Always provide manual entry option

## Future Enhancements

- [ ] Multi-language support
- [ ] Custom area definitions per user
- [ ] Historical trend analysis
- [ ] Batch analysis API
- [ ] Fine-tuned model for WisdomOS domain
- [ ] Voice journal transcription + analysis
- [ ] Suggested actions based on scores
- [ ] Integration with commitment engine
- [ ] Automated monthly reviews

## Troubleshooting

### Analysis Returns Empty Scores

**Cause**: Journal text too vague or short
**Solution**: Encourage more detailed entries, minimum 100 words

### Low Confidence Scores

**Cause**: Ambiguous language or multiple interpretations
**Solution**: Use confidence threshold (>0.5) to filter uncertain scores

### High API Costs

**Cause**: Frequent re-analysis of same content
**Solution**: Implement caching, batch processing, or manual mode

### Incorrect Area Detection

**Cause**: Prompt needs refinement for edge cases
**Solution**: Review reasoning, adjust system prompt, collect feedback

## Support

For issues or questions:
- Check logs: Browser console and server logs
- Review documentation: This file and inline comments
- Test with demo: `examples/journal-analysis-demo.ts`
- Check OpenAI status: https://status.openai.com/

## License

Internal WisdomOS proprietary system. Not for external distribution.
