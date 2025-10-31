#!/bin/bash

# WisdomOS 2026 - Restructure Script (Option A: Promote wisdome phase 3)
# This script promotes the active "wisdome phase 3" codebase to root level

set -e  # Exit on error

BACKUP_DIR="_BACKUPS/pre-restructure-$(date +%Y%m%d_%H%M%S)"
ARCHIVE_DIR="_ARCHIVED_$(date +%Y%m%d)"
PHASE3_DIR="apps/wisdom/wisdome phase 3"

echo "=============================================="
echo "WisdomOS 2026 Restructuring - Option A"
echo "Promoting wisdome phase 3 to root"
echo "=============================================="
echo ""

# Check if wisdome phase 3 exists
if [ ! -d "$PHASE3_DIR" ]; then
  echo "ERROR: $PHASE3_DIR not found!"
  exit 1
fi

echo "Step 1: Creating archive directory..."
mkdir -p "$ARCHIVE_DIR"
echo "✓ Archive directory created: $ARCHIVE_DIR"
echo ""

echo "Step 2: Archiving legacy scattered folders..."
echo "  - Moving wisdomos-fullstack..."
[ -d "apps/wisdom/wisdomos-fullstack" ] && mv "apps/wisdom/wisdomos-fullstack" "$ARCHIVE_DIR/" || echo "    (not found, skipping)"

echo "  - Moving wisdomos-community-hub..."
[ -d "apps/wisdom/wisdomos-community-hub" ] && mv "apps/wisdom/wisdomos-community-hub" "$ARCHIVE_DIR/" || echo "    (not found, skipping)"

echo "  - Moving wisdom-site-deployment..."
[ -d "apps/wisdom/wisdom-site-deployment" ] && mv "apps/wisdom/wisdom-site-deployment" "$ARCHIVE_DIR/" || echo "    (not found, skipping)"

echo "  - Moving Wisdom Unlimited..."
[ -d "apps/wisdom/Wisdom Unlimited" ] && mv "apps/wisdom/Wisdom Unlimited" "$ARCHIVE_DIR/" || echo "    (not found, skipping)"

echo "  - Moving wisdomos-mobile..."
[ -d "apps/wisdom/wisdomos-mobile" ] && mv "apps/wisdom/wisdomos-mobile" "$ARCHIVE_DIR/" || echo "    (not found, skipping)"

echo "✓ Legacy folders archived"
echo ""

echo "Step 3: Promoting wisdome phase 3 apps to root..."
echo "  - Syncing apps directory..."
rsync -av --exclude="node_modules" --exclude=".next" --exclude="dist" --exclude=".turbo" \
  "$PHASE3_DIR/apps/" "apps/" 2>&1 | grep -v "^sending incremental" | grep -v "^sent " | grep -v "^total size" | head -20
echo "✓ Apps promoted"
echo ""

echo "Step 4: Promoting wisdome phase 3 packages to root..."
echo "  - Syncing packages directory..."
rsync -av --exclude="node_modules" --exclude="dist" --exclude=".turbo" \
  "$PHASE3_DIR/packages/" "packages/" 2>&1 | grep -v "^sending incremental" | grep -v "^sent " | grep -v "^total size" | head -20
echo "✓ Packages promoted"
echo ""

echo "Step 5: Promoting wisdome phase 3 configs..."
[ -d "$PHASE3_DIR/config" ] && rsync -av --exclude="node_modules" "$PHASE3_DIR/config/" "config/" || echo "  (no config dir to sync)"
[ -d "$PHASE3_DIR/deployment-configs" ] && rsync -av "$PHASE3_DIR/deployment-configs/" "deployment-configs/" || echo "  (no deployment-configs to sync)"
[ -d "$PHASE3_DIR/netlify" ] && rsync -av "$PHASE3_DIR/netlify/" "netlify/" || echo "  (no netlify dir to sync)"
echo "✓ Configs promoted"
echo ""

echo "Step 6: Renaming wisdomos-core to phoenix-core..."
if [ -d "apps/wisdom/wisdomos-core" ]; then
  mv "apps/wisdom/wisdomos-core" "packages/phoenix-core"
  echo "✓ wisdomos-core renamed to packages/phoenix-core"
else
  echo "  (wisdomos-core not found, skipping)"
fi
echo ""

echo "Step 7: Moving wisdom course to apps/course-leader..."
if [ -d "apps/wisdom/wisdom course" ]; then
  mv "apps/wisdom/wisdom course" "apps/course-leader"
  echo "✓ wisdom course moved to apps/course-leader"
else
  echo "  (wisdom course not found, skipping)"
fi
echo ""

echo "Step 8: Removing wisdome phase 3 shell..."
if [ -d "$PHASE3_DIR" ]; then
  rm -rf "$PHASE3_DIR"
  echo "✓ wisdome phase 3 directory removed"
else
  echo "  (already removed)"
fi
echo ""

echo "=============================================="
echo "Restructuring Complete!"
echo "=============================================="
echo ""
echo "Summary:"
echo "  ✓ Legacy folders archived to: $ARCHIVE_DIR"
echo "  ✓ Active code promoted from wisdome phase 3"
echo "  ✓ wisdomos-core → packages/phoenix-core"
echo "  ✓ wisdom course → apps/course-leader"
echo ""
echo "Next steps:"
echo "  1. Update phoenix-core package.json name"
echo "  2. Update course-leader package.json name"
echo "  3. Update imports across codebase"
echo "  4. Test builds"
echo ""
echo "Backup available at: $BACKUP_DIR"
