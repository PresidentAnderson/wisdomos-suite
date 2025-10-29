/**
 * WisdomOS Multi-Agent System — Main Entry Point
 *
 * Purpose: Bootstrap and run the orchestrator with all registered agents
 *
 * @module main
 * @version 1.0
 */

import { Orchestrator } from './orchestrator';
import { AgentType } from '../types';

// Import specialist agents
import JournalAgent from '../specialists/journal-agent';
import CommitmentAgent from '../specialists/commitment-agent';
import AreaGenerator from '../specialists/area-generator';
import FulfilmentAgent from '../specialists/fulfilment-agent';
import NarrativeAgent from '../specialists/narrative-agent';
import IntegrityAgent from '../specialists/integrity-agent';

// =====================================================
// CONFIGURATION
// =====================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('  - SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_KEY');
  process.exit(1);
}

// =====================================================
// MAIN
// =====================================================

async function main() {
  console.log('🚀 Starting WisdomOS Multi-Agent System...\n');

  // Initialize orchestrator
  const orchestrator = new Orchestrator(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    poll_interval_ms: 5000, // 5 seconds
    batch_size: 10,
    timezone: 'America/Toronto',
  });

  // Initialize agents
  console.log('📦 Initializing agents...\n');

  const journalAgent = new JournalAgent(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const commitmentAgent = new CommitmentAgent(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const areaGenerator = new AreaGenerator(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const fulfilmentAgent = new FulfilmentAgent(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const narrativeAgent = new NarrativeAgent(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const integrityAgent = new IntegrityAgent(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Register agents with orchestrator
  console.log('🔌 Registering agents...\n');

  orchestrator.registerAgent(
    AgentType.JOURNAL,
    (message: any) => journalAgent.execute(message)
  );

  orchestrator.registerAgent(
    AgentType.COMMITMENT,
    (message: any) => commitmentAgent.execute(message)
  );

  orchestrator.registerAgent(
    AgentType.AREA_GENERATOR,
    (message: any) => areaGenerator.execute(message)
  );

  orchestrator.registerAgent(
    AgentType.FULFILMENT,
    (message: any) => fulfilmentAgent.execute(message)
  );

  orchestrator.registerAgent(
    AgentType.NARRATIVE,
    (message: any) => narrativeAgent.execute(message)
  );

  orchestrator.registerAgent(
    AgentType.INTEGRITY,
    (message: any) => integrityAgent.execute(message)
  );

  console.log('✅ All agents registered\n');

  // Health check
  console.log('🏥 Running health check...\n');
  const health = await orchestrator.healthCheck();
  console.log('Health status:', JSON.stringify(health, null, 2));
  console.log('');

  // Start orchestrator
  console.log('▶️  Starting orchestration loop...\n');
  console.log('Press Ctrl+C to stop\n');

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n⏹️  Shutting down gracefully...');
    orchestrator.stop();
    setTimeout(() => {
      console.log('✅ Shutdown complete');
      process.exit(0);
    }, 2000);
  });

  process.on('SIGTERM', () => {
    console.log('\n\n⏹️  Received SIGTERM, shutting down...');
    orchestrator.stop();
    setTimeout(() => {
      console.log('✅ Shutdown complete');
      process.exit(0);
    }, 2000);
  });

  // Start processing
  await orchestrator.start();
}

// =====================================================
// RUN
// =====================================================

main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
