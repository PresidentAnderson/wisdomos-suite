#!/bin/bash

# Auto-save keys from .env files to 1Password
# This script scans .env files and saves new keys to 1Password

echo "🔍 Scanning for API keys and secrets in WisdomOS project..."
echo "============================================"

# Check if 1Password CLI is installed
if ! command -v op &> /dev/null; then
    echo "❌ 1Password CLI not found. Please install it first."
    echo "   brew install --cask 1password-cli"
    exit 1
fi

# Sign in to 1Password (if not already signed in)
if ! op whoami &> /dev/null; then
    echo "Please sign in to 1Password:"
    eval $(op signin)
fi

# Project root
PROJECT_ROOT="/Volumes/DevOps/08-incoming-projects/wisdomOS"

# Function to save a key to 1Password
save_key_to_1password() {
    local key_name=$1
    local key_value=$2
    local description=$3
    local tags=$4
    
    if [ -z "$key_value" ] || [[ "$key_value" == *"your"* ]] || [[ "$key_value" == *"xxx"* ]] || [[ "$key_value" == *"change"* ]]; then
        echo "⏭️  Skipping $key_name (placeholder value)"
        return
    fi
    
    echo "📝 Saving $key_name..."
    
    # Create temporary JSON file
    cat > /tmp/key-item.json << EOF
{
  "title": "WisdomOS - $key_name",
  "category": "API_CREDENTIAL",
  "fields": [
    {
      "id": "credential",
      "type": "CONCEALED",
      "label": "$key_name",
      "value": "$key_value"
    },
    {
      "id": "project",
      "type": "STRING",
      "label": "Project",
      "value": "WisdomOS"
    },
    {
      "id": "added_date",
      "type": "STRING",
      "label": "Added",
      "value": "$(date +%Y-%m-%d)"
    }
  ],
  "tags": $tags,
  "notes": "$description\n\nProject: WisdomOS Phoenix Journey Platform\nAuto-saved: $(date)"
}
EOF
    
    if op item create --template /tmp/key-item.json 2>/dev/null; then
        echo "✅ $key_name saved"
    else
        echo "⚠️  $key_name may already exist"
    fi
    
    rm -f /tmp/key-item.json
}

# Scan .env files
echo ""
echo "📂 Scanning environment files..."
echo ""

# Find all .env files
env_files=$(find "$PROJECT_ROOT" -name ".env*" -type f ! -path "*/node_modules/*" 2>/dev/null)

for env_file in $env_files; do
    echo "📄 Processing: $(basename $env_file)"
    
    # Parse environment variables
    while IFS='=' read -r key value; do
        # Skip comments and empty lines
        if [[ "$key" =~ ^#.*$ ]] || [ -z "$key" ]; then
            continue
        fi
        
        # Remove quotes from value
        value=$(echo "$value" | sed 's/^"//;s/"$//')
        
        # Categorize and save based on key name
        case "$key" in
            *API_KEY*|*API_TOKEN*)
                save_key_to_1password "$key" "$value" "API Key for external service integration" '["wisdomos", "api", "integration"]'
                ;;
            *SECRET*)
                save_key_to_1password "$key" "$value" "Secret key for authentication" '["wisdomos", "secret", "auth"]'
                ;;
            *DATABASE_URL*|*DB_*)
                save_key_to_1password "$key" "$value" "Database connection configuration" '["wisdomos", "database"]'
                ;;
            *HUBSPOT*)
                save_key_to_1password "$key" "$value" "HubSpot integration credential" '["wisdomos", "hubspot", "crm"]'
                ;;
            *DEEPGRAM*)
                save_key_to_1password "$key" "$value" "Deepgram AI/ML service credential" '["wisdomos", "deepgram", "ai"]'
                ;;
            *PASSWORD*)
                save_key_to_1password "$key" "$value" "Password credential" '["wisdomos", "password"]'
                ;;
            *TOKEN*)
                save_key_to_1password "$key" "$value" "Authentication token" '["wisdomos", "token", "auth"]'
                ;;
            *KEY*)
                save_key_to_1password "$key" "$value" "Security key" '["wisdomos", "key"]'
                ;;
        esac
    done < "$env_file"
done

echo ""
echo "============================================"
echo "✅ Environment scan complete!"
echo ""
echo "📋 To view all WisdomOS items in 1Password:"
echo "   op item list --tags wisdomos"
echo ""
echo "🔐 To retrieve a specific item:"
echo "   op item get 'WisdomOS - KEY_NAME' --reveal"
echo "============================================"

# Create git hook to auto-save on commit
HOOK_FILE="$PROJECT_ROOT/.git/hooks/pre-commit"
if [ -d "$PROJECT_ROOT/.git/hooks" ]; then
    echo ""
    echo "📎 Installing git pre-commit hook..."
    
    cat > "$HOOK_FILE" << 'EOF'
#!/bin/bash
# Auto-save keys to 1Password before commit

# Check for new or modified .env files
if git diff --cached --name-only | grep -q "\.env"; then
    echo "🔐 Detected .env file changes, saving keys to 1Password..."
    bash scripts/auto-save-keys-to-1password.sh
fi
EOF
    
    chmod +x "$HOOK_FILE"
    echo "✅ Git hook installed. Keys will auto-save on commits with .env changes."
fi