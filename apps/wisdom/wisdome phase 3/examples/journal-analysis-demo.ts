/**
 * Journal Analysis Demo
 *
 * Purpose: Demonstrate AI journal analysis with sample journal texts
 * Usage: node examples/journal-analysis-demo.ts
 */

import {
  analyzeJournalEntry,
  getAreaName,
  getScoreInterpretation,
  estimateTokenUsage,
  estimateCost,
  isOpenAIAvailable,
} from '../apps/web/lib/ai-journal-analysis';

// =====================================================
// SAMPLE JOURNAL ENTRIES
// =====================================================

const SAMPLE_ENTRIES = {
  positive: `
Today was incredibly productive! I wrapped up the client project ahead of schedule and the
feedback was glowing. The team meeting went smoothly, and I felt really aligned with my
colleagues. I'm making steady progress on systemizing our workflows, which is already
saving us time.

After work, I went to the gym for a solid workout - hit a new PR on deadlifts! Feeling
strong and energized. Had a great dinner with Sarah and the kids. They're doing well in
school and we laughed a lot tonight.

Financially, I'm feeling secure. The new client is locked in for Q1, which gives us good
runway. I'm starting to think about investments for next year.

Overall feeling grateful and aligned with my purpose. This is the work I was meant to do.
  `,

  challenging: `
Tough day. The project hit a major snag - client changed requirements last minute and now
we're scrambling. Deadline is still the same. Team is stressed and I can feel the tension.
My quality standards are slipping because we're rushing.

Missed the gym again this week. Too tired. Sleep has been terrible - averaging 5 hours.
Diet is all over the place, just grabbing whatever is convenient.

Had an argument with mom on the phone. Same old boundary issues. Why can't she just respect
my decisions? I love her but these conversations drain me.

Money is tight this month. Unexpected car repair. Need to look at the budget again.

Feeling stuck and frustrated. Not sure what my next move should be.
  `,

  mixed: `
Mixed bag today. Work was okay - got through my task list but nothing spectacular. Client
meeting was fine, though I could tell they're not 100% sold on the direction. Need to build
more trust there.

Made it to yoga class this morning which felt good. My shoulder has been bothering me though,
might need to see a physical therapist.

Lunch with an old friend was the highlight - we haven't caught up in months. Reminded me how
important those connections are. Need to be more intentional about maintaining friendships.

Been reading this book on purpose and meaning. It's got me thinking about whether I'm truly
aligned with my calling or just going through the motions. Some soul-searching needed.

Finances are stable but not growing. I'm not taking risks or investing in new opportunities.
Playing it safe.
  `,

  spiritual: `
Woke up early for meditation today. 30 minutes of just sitting with my breath. The stillness
was profound. I felt this deep sense of connection to something larger than myself.

Spent the afternoon journaling about my life narrative - trying to make sense of the patterns
and themes. There's something coherent emerging. The struggles, the breakthroughs, the
relationships - they're all part of this larger story of transformation.

Called my dad to apologize for something I said last month. It was uncomfortable but necessary.
We had a real conversation, maybe the first one in years. I feel lighter. Forgiveness work is
hard but essential.

Reading scripture before bed. Certain passages are speaking to me in new ways. My faith feels
more real, more embodied, less intellectual.

Grateful for this journey. Grateful for the hard things that crack me open.
  `,

  creative: `
Finished a new song today! Been working on it for weeks and it finally came together. The
bridge gave me trouble but I found the right chord progression. Can't wait to record it.

Started outlining my next article - about the intersection of creativity and discipline. The
words are flowing. I've been writing daily for 30 days straight now and it's making a real
difference in my craft.

Got invited to speak at a conference in March. Excited but nervous. Need to start preparing
my talk. Maybe something about overcoming creative blocks?

The manuscript is at 40,000 words. Slow but steady progress. My editor gave great feedback on
the last chapter. The structure is getting tighter.

Feeling alive when I'm creating. This is when I'm most myself.
  `,
};

// =====================================================
// DEMO FUNCTIONS
// =====================================================

async function runDemo() {
  console.log('='.repeat(80));
  console.log('AI JOURNAL ANALYSIS DEMO');
  console.log('='.repeat(80));
  console.log('');

  // Check OpenAI availability
  console.log('Checking OpenAI API availability...');
  const apiAvailable = isOpenAIAvailable();
  console.log(`✓ OpenAI API: ${apiAvailable ? 'Available' : 'Not configured'}`);
  console.log('');

  if (!apiAvailable) {
    console.log('ERROR: OPENAI_API_KEY not found in environment');
    console.log('Please set OPENAI_API_KEY in your .env file');
    console.log('');
    return;
  }

  // Analyze each sample entry
  for (const [name, text] of Object.entries(SAMPLE_ENTRIES)) {
    console.log('='.repeat(80));
    console.log(`ANALYZING: ${name.toUpperCase()}`);
    console.log('='.repeat(80));
    console.log('');

    // Estimate token usage
    const estimatedTokens = estimateTokenUsage(text);
    const estimatedCost = estimateCost(estimatedTokens);
    console.log(`Estimated tokens: ${estimatedTokens}`);
    console.log(`Estimated cost: $${estimatedCost.toFixed(4)}`);
    console.log('');

    // Run analysis
    console.log('Analyzing...');
    const startTime = Date.now();

    try {
      const result = await analyzeJournalEntry(text);

      const duration = Date.now() - startTime;
      console.log(`✓ Analysis complete in ${duration}ms`);
      console.log('');

      if ('error' in result) {
        console.log(`ERROR: ${result.error}`);
        console.log('');
        continue;
      }

      // Display results
      console.log('RESULTS:');
      console.log(`  Summary: ${result.summary}`);
      console.log(`  Sentiment: ${result.sentiment.toFixed(2)} ${getSentimentEmoji(result.sentiment)}`);
      console.log(`  Areas detected: ${result.scores.length}`);
      console.log('');

      if (result.token_usage) {
        console.log('TOKEN USAGE:');
        console.log(`  Prompt: ${result.token_usage.prompt}`);
        console.log(`  Completion: ${result.token_usage.completion}`);
        console.log(`  Total: ${result.token_usage.total}`);
        console.log(`  Cost: $${estimateCost(result.token_usage.total).toFixed(4)}`);
        console.log('');
      }

      // Display scores
      console.log('EXTRACTED SCORES:');
      console.log('');

      for (const score of result.scores) {
        const interpretation = getScoreInterpretation(score.score);
        const areaName = getAreaName(score.area_code);

        console.log(`  ${areaName}`);
        console.log(`    Score: ${score.score}/5 (${interpretation.message}) ${getScoreEmoji(score.score)}`);
        console.log(`    Confidence: ${(score.confidence * 100).toFixed(0)}%`);
        console.log(`    Reasoning: "${score.reasoning}"`);
        console.log('');
      }

      // Summary statistics
      const avgScore = result.scores.reduce((sum, s) => sum + s.score, 0) / result.scores.length;
      const avgConfidence = result.scores.reduce((sum, s) => sum + s.confidence, 0) / result.scores.length;

      console.log('SUMMARY STATISTICS:');
      console.log(`  Average score: ${avgScore.toFixed(2)}/5`);
      console.log(`  Average confidence: ${(avgConfidence * 100).toFixed(0)}%`);
      console.log(`  High confidence scores (>70%): ${result.scores.filter(s => s.confidence > 0.7).length}`);
      console.log('');

    } catch (error: any) {
      console.log(`ERROR: ${error.message}`);
      console.log('');
    }

    console.log('');
  }

  console.log('='.repeat(80));
  console.log('DEMO COMPLETE');
  console.log('='.repeat(80));
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function getSentimentEmoji(sentiment: number): string {
  if (sentiment > 0.5) return '😊';
  if (sentiment > 0.2) return '🙂';
  if (sentiment > -0.2) return '😐';
  if (sentiment > -0.5) return '😟';
  return '😔';
}

function getScoreEmoji(score: number): string {
  if (score >= 5) return '🌟';
  if (score >= 4) return '✅';
  if (score >= 3) return '⚠️';
  if (score >= 2) return '⚠️';
  return '🚨';
}

// =====================================================
// RUN DEMO
// =====================================================

runDemo().catch(console.error);
