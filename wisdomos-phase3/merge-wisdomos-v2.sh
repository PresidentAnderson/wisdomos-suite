#!/bin/bash
set -e

TARGET_ORG="PresidentAnderson"
DEST_REPO="wisdomos-suite"

REPOS=(
  "wisdomos-phase3"
  "wisdomos-android"
  "wisdomos-api"
  "wisdomos-community-hub"
  "wisdomos-core"
  "wisdomos-desktop"
  "wisdomos-documentation"
  "wisdomos-infrastructure"
  "wisdomos-ios"
  "wisdomos-phoenix"
  "wisdomos-web"
)

echo "🧩 Starting merge of all wisdomos repos into $TARGET_ORG/$DEST_REPO..."

for repo in "${REPOS[@]}"; do
  echo "-------------------------------------------"
  echo "🔄 Processing $repo..."

  # Check if remote already exists
  if git remote get-url $repo 2>/dev/null; then
    echo "Remote $repo already exists, removing..."
    git remote remove $repo
  fi

  git remote add $repo https://github.com/$TARGET_ORG/$repo.git
  git fetch $repo

  # Try main first, then master
  if git rev-parse --verify $repo/main >/dev/null 2>&1; then
    BRANCH="$repo/main"
  elif git rev-parse --verify $repo/master >/dev/null 2>&1; then
    BRANCH="$repo/master"
  else
    echo "⚠️  Could not find main or master for $repo, skipping..."
    git remote remove $repo
    continue
  fi

  # Make sure we're on main
  git checkout main

  # Create a new branch for this repo
  git checkout -b $repo-branch $BRANCH

  # Create the target directory
  mkdir -p $repo

  # Move all files into the subfolder (excluding .git)
  shopt -s dotglob nullglob
  for item in *; do
    if [ "$item" != ".git" ] && [ "$item" != "$repo" ]; then
      mv "$item" "$repo/" 2>/dev/null || true
    fi
  done
  shopt -u dotglob nullglob

  git add -A
  git commit -m "Move $repo files into $repo/ folder" || true

  # Return to main and merge
  git checkout main
  git merge --allow-unrelated-histories --no-edit $repo-branch || true

  # Clean up
  git branch -D $repo-branch || true
  git remote remove $repo

  echo "✅ Finished merging $repo"
done

echo "-------------------------------------------"
echo "🎉 All wisdomos repos merged successfully!"
echo "Now pushing to GitHub..."
git push origin main
echo "🚀 Done!"
