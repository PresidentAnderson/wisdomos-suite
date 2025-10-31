# Backup Directory

## Purpose
Safety backups created before major restructuring operations.

## What's Inside

### Backup Sessions
- **cleanup-backup-20251029_215502/** (5.0GB) - Full pre-cleanup backup
  - apps/wisdom/
  - packages/database/
  - packages/db/
  - editions/
- Other timestamped backup directories

## Why These Exist
Created automatically before:
- Directory restructuring
- File consolidation
- Legacy code archival
- Major refactoring

## Recovery
If something went wrong during cleanup:
```bash
# Restore from backup
cp -r _BACKUPS/cleanup-backup-20251029_215502/apps/wisdom apps/

# Compare with current
diff -r _BACKUPS/cleanup-backup-20251029_215502/apps/wisdom apps/wisdom
```

## Backup Strategy
- Created before destructive operations
- Timestamped for identification
- Complete directory snapshots
- Never automatically deleted

## Maintenance
Review and clean up old backups periodically:
```bash
# List backups by size
du -sh _BACKUPS/*/

# Remove old backups (manual)
rm -rf _BACKUPS/cleanup-backup-YYYYMMDD_HHMMSS/
```

## Importance: ⭐⭐⭐⭐⭐
Critical - Last line of defense against accidental data loss.
