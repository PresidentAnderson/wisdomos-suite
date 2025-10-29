#!/bin/bash

# Script to update all @wisdomos/ imports to @wisdom/ namespace
# This updates package names across the entire wisdom/ directory

echo "Starting import path migration..."

# Navigate to wisdom directory
cd "/Volumes/DevOps/01-active-projects/wisdomOS 2025/wisdom"

# Function to replace in files
replace_in_files() {
  local old_pattern="$1"
  local new_pattern="$2"
  local file_types="$3"

  echo "Replacing '$old_pattern' with '$new_pattern' in $file_types files..."

  find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.json" \) \
    -exec sed -i '' "s|$old_pattern|$new_pattern|g" {} +
}

# Replace package imports
replace_in_files "@wisdomos/core" "@wisdom/shared-core" "all"
replace_in_files "@wisdomos/ui" "@wisdom/shared-ui" "all"
replace_in_files "@wisdomos/db" "@wisdom/shared-database" "all"
replace_in_files "@wisdomos/types" "@wisdom/shared-types" "all"
replace_in_files "@wisdomos/api-client" "@wisdom/shared-api-client" "all"
replace_in_files "@wisdomos/i18n" "@wisdom/shared-i18n" "all"
replace_in_files "@wisdomos/database" "@wisdom/shared-database-utils" "all"

# Replace platform package imports
replace_in_files "@wisdomos/web" "@wisdom/platform-web" "all"
replace_in_files "@wisdomos/api" "@wisdom/platform-api" "all"
replace_in_files "@wisdomos/mobile" "@wisdom/platform-mobile" "all"

# Replace edition package imports
replace_in_files "@wisdomos/community" "@wisdom/edition-community-hub" "all"

echo "Import path migration complete!"
echo "Please review the changes and test the build."
