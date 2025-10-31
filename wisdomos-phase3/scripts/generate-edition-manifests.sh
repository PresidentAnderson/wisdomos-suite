#!/bin/bash

# Generate edition manifests for all editions
# This creates manifest.json files for editions that don't have them yet

EDITIONS_DIR="apps/wisdom/editions"

echo "Generating edition manifests..."
echo ""

# Student Edition
cat > "$EDITIONS_DIR/student/manifest.json" <<'EOF'
{
  "$schema": "../../edition-schema.json",
  "id": "student",
  "name": "WisdomOS — Student",
  "tier": "student",
  "branding": {
    "primaryColor": "#10B981",
    "secondaryColor": "#059669",
    "logoPath": "./assets/logo-student.svg",
    "tagline": "Wisdom for learners"
  },
  "features": {
    "autobiography": true,
    "journal": true,
    "dailyPrompts": true,
    "fulfillmentDisplay": true,
    "relationshipAssessment": true,
    "difficultConversations": true,
    "exportPDF": false,
    "aiAnalysis": false,
    "coachTools": false,
    "clientDashboard": false,
    "orgAdmin": false,
    "sso": false,
    "multiUser": false,
    "publicSharing": false,
    "communityForums": false,
    "classManagement": false,
    "studentReports": false,
    "customFields": false,
    "advancedCharts": false,
    "apiAccess": false,
    "prioritySupport": false
  },
  "limits": {
    "maxEntries": 500,
    "maxAreas": 10,
    "maxClients": 0,
    "maxUsers": 1,
    "storageGB": 5
  },
  "platforms": ["web", "mobile"],
  "pricing": {
    "currency": "USD",
    "monthlyPrice": 4.99,
    "annualPrice": 49.99,
    "custom": false
  }
}
EOF

echo "✓ Created student/manifest.json"

# Standard Edition
cat > "$EDITIONS_DIR/standard/manifest.json" <<'EOF'
{
  "$schema": "../../edition-schema.json",
  "id": "standard",
  "name": "WisdomOS — Standard",
  "tier": "standard",
  "branding": {
    "primaryColor": "#3B82F6",
    "secondaryColor": "#2563EB",
    "logoPath": "./assets/logo-standard.svg",
    "tagline": "Complete wisdom toolkit"
  },
  "features": {
    "autobiography": true,
    "journal": true,
    "dailyPrompts": true,
    "fulfillmentDisplay": true,
    "relationshipAssessment": true,
    "difficultConversations": true,
    "exportPDF": true,
    "aiAnalysis": true,
    "coachTools": false,
    "clientDashboard": false,
    "orgAdmin": false,
    "sso": false,
    "multiUser": false,
    "publicSharing": false,
    "communityForums": false,
    "classManagement": false,
    "studentReports": false,
    "customFields": false,
    "advancedCharts": false,
    "apiAccess": false,
    "prioritySupport": false
  },
  "limits": {
    "maxEntries": "unlimited",
    "maxAreas": "unlimited",
    "maxClients": 0,
    "maxUsers": 1,
    "storageGB": 20
  },
  "platforms": ["web", "mobile", "desktop"],
  "pricing": {
    "currency": "USD",
    "monthlyPrice": 9.99,
    "annualPrice": 99.99,
    "custom": false
  }
}
EOF

echo "✓ Created standard/manifest.json"

# Advanced Edition
cat > "$EDITIONS_DIR/advanced/manifest.json" <<'EOF'
{
  "$schema": "../../edition-schema.json",
  "id": "advanced",
  "name": "WisdomOS — Advanced",
  "tier": "advanced",
  "branding": {
    "primaryColor": "#8B5CF6",
    "secondaryColor": "#7C3AED",
    "logoPath": "./assets/logo-advanced.svg",
    "tagline": "Advanced wisdom analytics"
  },
  "features": {
    "autobiography": true,
    "journal": true,
    "dailyPrompts": true,
    "fulfillmentDisplay": true,
    "relationshipAssessment": true,
    "difficultConversations": true,
    "exportPDF": true,
    "aiAnalysis": true,
    "coachTools": false,
    "clientDashboard": false,
    "orgAdmin": false,
    "sso": false,
    "multiUser": false,
    "publicSharing": false,
    "communityForums": false,
    "classManagement": false,
    "studentReports": false,
    "customFields": true,
    "advancedCharts": true,
    "apiAccess": false,
    "prioritySupport": false
  },
  "limits": {
    "maxEntries": "unlimited",
    "maxAreas": "unlimited",
    "maxClients": 0,
    "maxUsers": 1,
    "storageGB": 50
  },
  "platforms": ["web", "mobile", "desktop"],
  "pricing": {
    "currency": "USD",
    "monthlyPrice": 19.99,
    "annualPrice": 199.99,
    "custom": false
  }
}
EOF

echo "✓ Created advanced/manifest.json"

# Premium Edition
cat > "$EDITIONS_DIR/premium/manifest.json" <<'EOF'
{
  "$schema": "../../edition-schema.json",
  "id": "premium",
  "name": "WisdomOS — Premium",
  "tier": "premium",
  "branding": {
    "primaryColor": "#F59E0B",
    "secondaryColor": "#D97706",
    "logoPath": "./assets/logo-premium.svg",
    "tagline": "Professional coaching platform"
  },
  "features": {
    "autobiography": true,
    "journal": true,
    "dailyPrompts": true,
    "fulfillmentDisplay": true,
    "relationshipAssessment": true,
    "difficultConversations": true,
    "exportPDF": true,
    "aiAnalysis": true,
    "coachTools": true,
    "clientDashboard": true,
    "orgAdmin": false,
    "sso": false,
    "multiUser": false,
    "publicSharing": true,
    "communityForums": false,
    "classManagement": false,
    "studentReports": false,
    "customFields": true,
    "advancedCharts": true,
    "apiAccess": true,
    "prioritySupport": true
  },
  "limits": {
    "maxEntries": "unlimited",
    "maxAreas": "unlimited",
    "maxClients": 50,
    "maxUsers": 1,
    "storageGB": 100
  },
  "platforms": ["web", "mobile", "desktop"],
  "pricing": {
    "currency": "USD",
    "monthlyPrice": 49.99,
    "annualPrice": 499.99,
    "custom": false
  }
}
EOF

echo "✓ Created premium/manifest.json"

# Teacher Edition
cat > "$EDITIONS_DIR/teacher/manifest.json" <<'EOF'
{
  "$schema": "../../edition-schema.json",
  "id": "teacher",
  "name": "WisdomOS — Teacher",
  "tier": "teacher",
  "branding": {
    "primaryColor": "#EF4444",
    "secondaryColor": "#DC2626",
    "logoPath": "./assets/logo-teacher.svg",
    "tagline": "Wisdom education platform"
  },
  "features": {
    "autobiography": true,
    "journal": true,
    "dailyPrompts": true,
    "fulfillmentDisplay": true,
    "relationshipAssessment": true,
    "difficultConversations": true,
    "exportPDF": true,
    "aiAnalysis": true,
    "coachTools": false,
    "clientDashboard": false,
    "orgAdmin": false,
    "sso": false,
    "multiUser": false,
    "publicSharing": true,
    "communityForums": false,
    "classManagement": true,
    "studentReports": true,
    "customFields": true,
    "advancedCharts": true,
    "apiAccess": false,
    "prioritySupport": true
  },
  "limits": {
    "maxEntries": "unlimited",
    "maxAreas": "unlimited",
    "maxClients": 100,
    "maxUsers": 1,
    "storageGB": 100
  },
  "platforms": ["web", "mobile", "desktop"],
  "pricing": {
    "currency": "USD",
    "monthlyPrice": 29.99,
    "annualPrice": 299.99,
    "custom": false
  }
}
EOF

echo "✓ Created teacher/manifest.json"

# Institutional Edition
cat > "$EDITIONS_DIR/institutional/manifest.json" <<'EOF'
{
  "$schema": "../../edition-schema.json",
  "id": "institutional",
  "name": "WisdomOS — Institutional",
  "tier": "institutional",
  "branding": {
    "primaryColor": "#1F2937",
    "secondaryColor": "#111827",
    "logoPath": "./assets/logo-institutional.svg",
    "tagline": "Enterprise wisdom platform"
  },
  "features": {
    "autobiography": true,
    "journal": true,
    "dailyPrompts": true,
    "fulfillmentDisplay": true,
    "relationshipAssessment": true,
    "difficultConversations": true,
    "exportPDF": true,
    "aiAnalysis": true,
    "coachTools": true,
    "clientDashboard": true,
    "orgAdmin": true,
    "sso": true,
    "multiUser": true,
    "publicSharing": true,
    "communityForums": true,
    "classManagement": true,
    "studentReports": true,
    "customFields": true,
    "advancedCharts": true,
    "apiAccess": true,
    "prioritySupport": true
  },
  "limits": {
    "maxEntries": "unlimited",
    "maxAreas": "unlimited",
    "maxClients": "unlimited",
    "maxUsers": "unlimited",
    "storageGB": "unlimited"
  },
  "platforms": ["web", "desktop"],
  "pricing": {
    "currency": "USD",
    "monthlyPrice": 0,
    "annualPrice": 0,
    "custom": true
  }
}
EOF

echo "✓ Created institutional/manifest.json"

# Community Hub Edition
cat > "$EDITIONS_DIR/community-hub/manifest.json" <<'EOF'
{
  "$schema": "../../edition-schema.json",
  "id": "community-hub",
  "name": "WisdomOS — Community Hub",
  "tier": "community-hub",
  "branding": {
    "primaryColor": "#06B6D4",
    "secondaryColor": "#0891B2",
    "logoPath": "./assets/logo-community.svg",
    "tagline": "Connect and grow together"
  },
  "features": {
    "autobiography": true,
    "journal": true,
    "dailyPrompts": true,
    "fulfillmentDisplay": true,
    "relationshipAssessment": true,
    "difficultConversations": true,
    "exportPDF": true,
    "aiAnalysis": true,
    "coachTools": false,
    "clientDashboard": false,
    "orgAdmin": false,
    "sso": false,
    "multiUser": false,
    "publicSharing": true,
    "communityForums": true,
    "classManagement": false,
    "studentReports": false,
    "customFields": false,
    "advancedCharts": true,
    "apiAccess": false,
    "prioritySupport": false
  },
  "limits": {
    "maxEntries": "unlimited",
    "maxAreas": "unlimited",
    "maxClients": 0,
    "maxUsers": 1,
    "storageGB": 25
  },
  "platforms": ["web", "mobile"],
  "pricing": {
    "currency": "USD",
    "monthlyPrice": 14.99,
    "annualPrice": 149.99,
    "custom": false
  }
}
EOF

echo "✓ Created community-hub/manifest.json"

# Personal Edition
cat > "$EDITIONS_DIR/personal edition/manifest.json" <<'EOF'
{
  "$schema": "../../edition-schema.json",
  "id": "personal",
  "name": "WisdomOS — Personal Edition",
  "tier": "personal",
  "branding": {
    "primaryColor": "#EC4899",
    "secondaryColor": "#DB2777",
    "logoPath": "./assets/logo-personal.svg",
    "tagline": "Complete personal transformation"
  },
  "features": {
    "autobiography": true,
    "journal": true,
    "dailyPrompts": true,
    "fulfillmentDisplay": true,
    "relationshipAssessment": true,
    "difficultConversations": true,
    "exportPDF": true,
    "aiAnalysis": true,
    "coachTools": false,
    "clientDashboard": false,
    "orgAdmin": false,
    "sso": false,
    "multiUser": false,
    "publicSharing": true,
    "communityForums": false,
    "classManagement": false,
    "studentReports": false,
    "customFields": true,
    "advancedCharts": true,
    "apiAccess": false,
    "prioritySupport": true
  },
  "limits": {
    "maxEntries": "unlimited",
    "maxAreas": "unlimited",
    "maxClients": 0,
    "maxUsers": 1,
    "storageGB": 50
  },
  "platforms": ["web", "mobile", "desktop"],
  "pricing": {
    "currency": "USD",
    "monthlyPrice": 24.99,
    "annualPrice": 249.99,
    "custom": false
  }
}
EOF

echo "✓ Created personal edition/manifest.json"

# Experimental Edition
cat > "$EDITIONS_DIR/experimental/manifest.json" <<'EOF'
{
  "$schema": "../../edition-schema.json",
  "id": "experimental",
  "name": "WisdomOS — Experimental",
  "tier": "experimental",
  "branding": {
    "primaryColor": "#A855F7",
    "secondaryColor": "#9333EA",
    "logoPath": "./assets/logo-experimental.svg",
    "tagline": "Bleeding edge features"
  },
  "features": {
    "autobiography": true,
    "journal": true,
    "dailyPrompts": true,
    "fulfillmentDisplay": true,
    "relationshipAssessment": true,
    "difficultConversations": true,
    "exportPDF": true,
    "aiAnalysis": true,
    "coachTools": true,
    "clientDashboard": true,
    "orgAdmin": true,
    "sso": true,
    "multiUser": true,
    "publicSharing": true,
    "communityForums": true,
    "classManagement": true,
    "studentReports": true,
    "customFields": true,
    "advancedCharts": true,
    "apiAccess": true,
    "prioritySupport": false
  },
  "limits": {
    "maxEntries": "unlimited",
    "maxAreas": "unlimited",
    "maxClients": "unlimited",
    "maxUsers": 10,
    "storageGB": 100
  },
  "platforms": ["web"],
  "pricing": {
    "currency": "USD",
    "monthlyPrice": 0,
    "annualPrice": 0,
    "custom": false
  }
}
EOF

echo "✓ Created experimental/manifest.json"

echo ""
echo "=========================================="
echo "All edition manifests generated!"
echo "=========================================="
echo ""
echo "Created manifests for:"
echo "  • free"
echo "  • student"
echo "  • standard"
echo "  • advanced"
echo "  • premium"
echo "  • teacher"
echo "  • institutional"
echo "  • community-hub"
echo "  • personal edition"
echo "  • experimental"
echo ""
echo "Next step: Build @wisdomos/config package to load these manifests"
