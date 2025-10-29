#!/usr/bin/env tsx
/**
 * Test AI Journal Analysis
 *
 * Quick script to verify OpenAI integration is working
 * Usage: pnpm test:journal-ai
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') });
config({ path: resolve(__dirname, '../.env') });

// Import after env is loaded
import {
  analyzeJournalEntry,
  isOpenAIAvailable,
  estimateTokenUsage,
  estimateCost,
  getAreaName,
  getScoreInterpretation,
} from '../apps/web/lib/ai-journal-analysis';

// =====================================================
// SIMPLE TEST JOURNAL
// =====================================================

const TEST_JOURNAL = `
Had a really productive day at work today. Finished the big project I've been
working on for weeks. The client loved the results and gave great feedback.
My team was super supportive throughout.

After work, I made it to the gym and had a great workout. Been consistent with
exercise this week, feeling stronger every day. Sleep has been good too.

Financially things are looking up. Just got confirmation of the new contract
which will help with savings goals. Budget is on track.

Feeling grateful for my health, work, and the people in my life.
`;

// =====================================================
// MAIN TEST FUNCTION
// =====================================================

async function testAnalysis() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║        AI JOURNAL ANALYSIS - INTEGRATION TEST              ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');

  // Step 1: Check API key
  console.log('Step 1: Checking OpenAI API configuration...');
  const apiAvailable = isOpenAIAvailable();

  if (!apiAvailable) {
    console.log('❌ FAILED: OPENAI_API_KEY not found');
    console.log('');
    console.log('Please add your OpenAI API key:');
    console.log('  1. Get key from: https://platform.openai.com/api-keys');
    console.log('  2. Add to .env.local: OPENAI_API_KEY=sk-...');
    console.log('  3. Restart and try again');
    console.log('');
    process.exit(1);
  }

  console.log('✅ OpenAI API key found');
  console.log('');

  // Step 2: Estimate cost
  console.log('Step 2: Estimating analysis cost...');
  const estimatedTokens = estimateTokenUsage(TEST_JOURNAL);
  const estimatedCost = estimateCost(estimatedTokens);
  console.log(`  Estimated tokens: ~${estimatedTokens}`);
  console.log(`  Estimated cost: ~$${estimatedCost.toFixed(4)}`);
  console.log('');

  // Step 3: Run analysis
  console.log('Step 3: Analyzing test journal entry...');
  console.log('  (This may take 2-5 seconds...)');
  console.log('');

  const startTime = Date.now();

  try {
    const result = await analyzeJournalEntry(TEST_JOURNAL);

    const duration = Date.now() - startTime;

    if ('error' in result) {
      console.log('❌ FAILED: Analysis returned error');
      console.log(`  Error: ${result.error}`);
      console.log('');
      process.exit(1);
    }

    console.log(`✅ Analysis completed in ${duration}ms`);
    console.log('');

    // Step 4: Display results
    console.log('Step 4: Analysis Results');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');

    console.log(`Summary: ${result.summary}`);
    console.log('');

    console.log(`Sentiment: ${result.sentiment.toFixed(2)} ${getSentimentEmoji(result.sentiment)}`);
    console.log('');

    console.log(`Areas Detected: ${result.scores.length}`);
    console.log('');

    if (result.scores.length === 0) {
      console.log('⚠️  WARNING: No areas detected');
      console.log('  This could indicate the journal text is too vague');
      console.log('');
    } else {
      console.log('Extracted Scores:');
      console.log('─────────────────────────────────────────────────────────');
      console.log('');

      result.scores.forEach((score, index) => {
        const interpretation = getScoreInterpretation(score.score);
        const areaName = getAreaName(score.area_code);
        const emoji = getScoreEmoji(score.score);

        console.log(`${index + 1}. ${areaName}`);
        console.log(`   Score: ${score.score}/5 ${emoji} (${interpretation.message})`);
        console.log(`   Confidence: ${(score.confidence * 100).toFixed(0)}%`);
        console.log(`   Reasoning: "${score.reasoning}"`);
        console.log('');
      });
    }

    // Step 5: Token usage
    if (result.token_usage) {
      console.log('Token Usage:');
      console.log('─────────────────────────────────────────────────────────');
      console.log(`  Input tokens:  ${result.token_usage.prompt}`);
      console.log(`  Output tokens: ${result.token_usage.completion}`);
      console.log(`  Total tokens:  ${result.token_usage.total}`);
      console.log(`  Actual cost:   $${estimateCost(result.token_usage.total).toFixed(4)}`);
      console.log('');
    }

    // Step 6: Statistics
    const avgScore = result.scores.reduce((sum, s) => sum + s.score, 0) / result.scores.length;
    const avgConfidence = result.scores.reduce((sum, s) => sum + s.confidence, 0) / result.scores.length;
    const highConfidence = result.scores.filter(s => s.confidence > 0.7).length;

    console.log('Statistics:');
    console.log('─────────────────────────────────────────────────────────');
    console.log(`  Average score: ${avgScore.toFixed(2)}/5`);
    console.log(`  Average confidence: ${(avgConfidence * 100).toFixed(0)}%`);
    console.log(`  High confidence (>70%): ${highConfidence}/${result.scores.length}`);
    console.log('');

    // Final status
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log('✅ TEST PASSED: AI Journal Analysis is working correctly!');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Review the extracted scores above');
    console.log('  2. Test with your own journal text');
    console.log('  3. Run full demo: pnpm demo:journal-ai');
    console.log('  4. Integrate into your app');
    console.log('');

  } catch (error: any) {
    console.log('❌ FAILED: Unexpected error');
    console.log('');
    console.log('Error details:');
    console.log(error.message);
    if (error.stack) {
      console.log('');
      console.log('Stack trace:');
      console.log(error.stack);
    }
    console.log('');
    process.exit(1);
  }
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function getSentimentEmoji(sentiment: number): string {
  if (sentiment > 0.5) return '😊 (Very positive)';
  if (sentiment > 0.2) return '🙂 (Positive)';
  if (sentiment > -0.2) return '😐 (Neutral)';
  if (sentiment > -0.5) return '😟 (Negative)';
  return '😔 (Very negative)';
}

function getScoreEmoji(score: number): string {
  if (score >= 5) return '🌟';
  if (score >= 4) return '✅';
  if (score >= 2) return '⚠️';
  return '🚨';
}

// =====================================================
// RUN TEST
// =====================================================

testAnalysis().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
