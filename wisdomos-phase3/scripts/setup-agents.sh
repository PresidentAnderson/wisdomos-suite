#!/bin/bash
# WisdomOS Multi-Agent System Setup Script

set -e  # Exit on error

echo "🤖 WisdomOS Multi-Agent System (MAS) Setup"
echo "==========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "pnpm-workspace.yaml" ]; then
    echo "❌ Error: Must run from wisdomOS root directory"
    exit 1
fi

echo "📦 Step 1: Installing dependencies..."
pnpm install

echo ""
echo "🗄️  Step 2: Setting up environment..."
if [ ! -f ".env.agents" ]; then
    cp .env.agents.example .env.agents
    echo "✓ Created .env.agents (please edit with your keys)"
else
    echo "✓ .env.agents already exists"
fi

echo ""
echo "🔨 Step 3: Building agents package..."
cd packages/agents
pnpm build
cd ../..

echo ""
echo "🗃️  Step 4: Database migrations..."
echo "Would you like to run migrations now? (y/n)"
read -r RUN_MIGRATIONS

if [ "$RUN_MIGRATIONS" = "y" ]; then
    echo "Running Supabase migrations..."

    # Check if supabase CLI is installed
    if command -v supabase &> /dev/null; then
        supabase db push
        echo "✓ Migrations applied"
    else
        echo "⚠️  Supabase CLI not found. Please install it:"
        echo "   npm install -g supabase"
        echo "   Then run: supabase db push"
    fi
fi

echo ""
echo "✅ Setup Complete!"
echo ""
echo "📚 Next Steps:"
echo ""
echo "1. Edit .env.agents with your credentials:"
echo "   - SUPABASE_URL"
echo "   - SUPABASE_SERVICE_ROLE_KEY"
echo "   - OPENAI_API_KEY (optional for now)"
echo ""
echo "2. Apply database migrations (if not done):"
echo "   supabase db push"
echo ""
echo "3. Run migrations for seed data:"
echo "   # This will create eras, templates, and metadata"
echo ""
echo "4. Test the agents:"
echo "   cd packages/agents"
echo "   pnpm test"
echo ""
echo "5. Start the orchestrator:"
echo "   pnpm dev"
echo ""
echo "📖 Documentation:"
echo "   - /docs/agents/README.md - Agent system overview"
echo "   - /docs/agents/IMPLEMENTATION_SUMMARY.md - What was built"
echo "   - /packages/agents/README.md - Package documentation"
echo ""
echo "🎯 Quick Test:"
echo "   Create 3 journal entries and watch:"
echo "   - Entry created → Commitment detected → Area spawned"
echo "   - Score rollup → Chapter updated"
echo ""
echo "Happy coding! 🚀"
