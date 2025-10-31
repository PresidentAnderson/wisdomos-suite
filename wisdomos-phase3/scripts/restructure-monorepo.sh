#!/bin/bash

# WisdomOS Monorepo Restructure Script
# This script flattens the nested folder structure into a proper monorepo layout

set -e  # Exit on error

echo "🚀 WisdomOS Monorepo Restructure"
echo "================================"
echo ""

# Get the root directory
ROOT_DIR="/Volumes/DevOPS 2025/01_DEVOPS_PLATFORM/wisdomOS 2026"
cd "$ROOT_DIR"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Step 1: Flattening apps to /apps/ directory${NC}"
echo "-------------------------------------------"

# Move API
if [ -d "apps/LTOS/Phase 5 Completion/apps/CORE App/api" ]; then
  echo -e "${YELLOW}Moving api...${NC}"
  mv "apps/LTOS/Phase 5 Completion/apps/CORE App/api" "apps/api-temp"
  echo -e "${GREEN}✓ API moved${NC}"
fi

# Move Community
if [ -d "apps/LTOS/Phase 5 Completion/apps/CORE App/community" ]; then
  echo -e "${YELLOW}Moving community...${NC}"
  mv "apps/LTOS/Phase 5 Completion/apps/CORE App/community" "apps/community-temp"
  echo -e "${GREEN}✓ Community moved${NC}"
fi

# Move Course Leader
if [ -d "apps/LTOS/Phase 5 Completion/apps/CORE App/course-leader" ]; then
  echo -e "${YELLOW}Moving course-leader...${NC}"
  mv "apps/LTOS/Phase 5 Completion/apps/CORE App/course-leader" "apps/course-leader-temp"
  echo -e "${GREEN}✓ Course Leader moved${NC}"
fi

# Move Web (from Distribution Version)
if [ -d "apps/LTOS/Phase 5 Completion/apps/CORE App/Distribution Version/web/web" ]; then
  echo -e "${YELLOW}Moving web app...${NC}"
  mv "apps/LTOS/Phase 5 Completion/apps/CORE App/Distribution Version/web/web" "apps/web-temp"
  echo -e "${GREEN}✓ Web moved${NC}"
fi

# Move Mobile (from Distribution Version)
if [ -d "apps/LTOS/Phase 5 Completion/apps/CORE App/Distribution Version/mobile" ]; then
  echo -e "${YELLOW}Moving mobile app...${NC}"
  mv "apps/LTOS/Phase 5 Completion/apps/CORE App/Distribution Version/mobile" "apps/mobile-temp"
  echo -e "${GREEN}✓ Mobile moved${NC}"
fi

# Move Admin
if [ -d "apps/LTOS/Phase 5 Completion/apps/CORE App/wisdom-admin" ]; then
  echo -e "${YELLOW}Moving admin app...${NC}"
  mv "apps/LTOS/Phase 5 Completion/apps/CORE App/wisdom-admin" "apps/admin-temp"
  echo -e "${GREEN}✓ Admin moved${NC}"
fi

echo ""
echo -e "${BLUE}Step 2: Moving editions and platforms to root${NC}"
echo "--------------------------------------------"

# Move editions
if [ -d "apps/LTOS/Phase 5 Completion/apps/CORE App/editions" ]; then
  echo -e "${YELLOW}Moving editions...${NC}"
  mv "apps/LTOS/Phase 5 Completion/apps/CORE App/editions" "editions-temp"
  echo -e "${GREEN}✓ Editions moved${NC}"
fi

# Move platforms
if [ -d "apps/LTOS/Phase 5 Completion/apps/CORE App/platforms" ]; then
  echo -e "${YELLOW}Moving platforms...${NC}"
  mv "apps/LTOS/Phase 5 Completion/apps/CORE App/platforms" "platforms-temp"
  echo -e "${GREEN}✓ Platforms moved${NC}"
fi

echo ""
echo -e "${BLUE}Step 3: Merging shared folders with /packages/${NC}"
echo "-------------------------------------------------"

# Move shared/config to packages
if [ -d "apps/LTOS/Phase 5 Completion/shared/config" ]; then
  echo -e "${YELLOW}Merging shared/config with packages/config...${NC}"
  if [ -d "packages/config" ]; then
    # Merge files from shared/config to packages/config
    cp -R "apps/LTOS/Phase 5 Completion/shared/config/." "packages/config/"
  else
    mv "apps/LTOS/Phase 5 Completion/shared/config" "packages/config-temp"
  fi
  echo -e "${GREEN}✓ Config merged${NC}"
fi

# Move shared/core to packages
if [ -d "apps/LTOS/Phase 5 Completion/shared/core" ]; then
  echo -e "${YELLOW}Merging shared/core with packages/core...${NC}"
  if [ -d "packages/core" ]; then
    cp -R "apps/LTOS/Phase 5 Completion/shared/core/." "packages/core/"
  else
    mv "apps/LTOS/Phase 5 Completion/shared/core" "packages/core-temp"
  fi
  echo -e "${GREEN}✓ Core merged${NC}"
fi

# Move shared/ui-components to packages
if [ -d "apps/LTOS/Phase 5 Completion/shared/ui-components" ]; then
  echo -e "${YELLOW}Moving shared/ui-components to packages/ui...${NC}"
  mv "apps/LTOS/Phase 5 Completion/shared/ui-components" "packages/ui-temp"
  echo -e "${GREEN}✓ UI components moved${NC}"
fi

echo ""
echo -e "${BLUE}Step 4: Cleaning up temp names${NC}"
echo "------------------------------"

# Rename temp directories
for dir in apps/*-temp; do
  if [ -d "$dir" ]; then
    newname="${dir%-temp}"
    echo -e "${YELLOW}Renaming $(basename $dir) to $(basename $newname)${NC}"

    # Remove existing if present
    if [ -d "$newname" ]; then
      rm -rf "$newname"
    fi

    mv "$dir" "$newname"
    echo -e "${GREEN}✓ Renamed${NC}"
  fi
done

for dir in packages/*-temp; do
  if [ -d "$dir" ]; then
    newname="${dir%-temp}"
    echo -e "${YELLOW}Renaming $(basename $dir) to $(basename $newname)${NC}"
    mv "$dir" "$newname"
    echo -e "${GREEN}✓ Renamed${NC}"
  fi
done

for dir in *-temp; do
  if [ -d "$dir" ]; then
    newname="${dir%-temp}"
    echo -e "${YELLOW}Renaming $(basename $dir) to $(basename $newname)${NC}"
    mv "$dir" "$newname"
    echo -e "${GREEN}✓ Renamed${NC}"
  fi
done

echo ""
echo -e "${BLUE}Step 5: Cleaning up old structure${NC}"
echo "--------------------------------"

if [ -d "apps/LTOS" ]; then
  echo -e "${YELLOW}Removing old LTOS structure...${NC}"
  rm -rf "apps/LTOS"
  echo -e "${GREEN}✓ Old structure removed${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Restructure complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Update TypeScript configurations"
echo "2. Update package.json files"
echo "3. Update pnpm-workspace.yaml"
echo "4. Reinstall dependencies"
