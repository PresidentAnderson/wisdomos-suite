# Archived Code (2025-10-29)

## Purpose
Safe archive of legacy code and duplicate packages removed during cleanup.

## What's Inside

### apps-wisdom/
Legacy application folders:
- **wisdomos-fullstack/** (176K) - Old fullstack implementation
- **wisdomos-community-hub/** (0B) - Legacy community hub
- **wisdom-site-deployment/** (0B) - Old deployment config
- **wisdomos-mobile/** (16K) - Previous mobile app
- **Wisdom Unlimited/** (16K) - Old unlimited edition

### database-packages/
- **db/** (288K) - Duplicate database package (now using `packages/database/`)

### Other Archived Items
Additional folders from previous cleanup sessions

## Why These Were Archived
- **Duplicates** - Multiple implementations of the same functionality
- **Legacy** - Outdated or superseded by newer implementations
- **Consolidation** - Part of monorepo cleanup strategy

## Recovery
If you need to recover anything:
```bash
# Copy back specific folder
cp -r _ARCHIVED_20251029/apps-wisdom/wisdomos-fullstack apps/wisdom/

# Review contents
ls -la _ARCHIVED_20251029/
```

## Safety
- Total size: ~1.6GB
- Nothing deleted, only moved
- Full backup also exists in `_BACKUPS/`

## Importance: ⭐⭐
Low - Archive only, for reference and recovery if needed.
