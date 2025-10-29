# 🔐 WisdomOS Secrets Configuration Checklist

## Required Before Running `./setup-secrets.sh`

### 🗄️ Database & Auth (Required for ALL repositories)
- [ ] **DATABASE_URL** - Your Supabase PostgreSQL URL
  ```
  postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
  ```
- [ ] **JWT_SECRET** - Random 32+ character string
- [ ] **SUPABASE_URL** - Your Supabase project URL
  ```
  https://[PROJECT-REF].supabase.co
  ```
- [ ] **SUPABASE_ANON_KEY** - From Supabase Settings > API
- [ ] **SUPABASE_SERVICE_ROLE_KEY** - From Supabase Settings > API ⚠️ Server-only

### 🤖 AI Services (Required for core functionality)
- [ ] **OPENAI_API_KEY** - OpenAI API key starting with `sk-`

### 🌐 Web Deployment (wisdomos-web)
- [ ] **NEXTAUTH_SECRET** - Random string for NextAuth.js
- [ ] **NETLIFY_AUTH_TOKEN** - Personal access token from Netlify

### 📱 iOS Deployment (wisdomos-ios)
- [ ] **APPLE_DEVELOPER_CERT** - Base64 encoded .p12 certificate
- [ ] **APPLE_CERT_PASSWORD** - Certificate password
- [ ] **APPLE_TEAM_ID** - 10-character team ID from Apple Developer

### 🤖 Android Deployment (wisdomos-android)
- [ ] **ANDROID_KEYSTORE** - Base64 encoded keystore file
- [ ] **ANDROID_KEY_ALIAS** - Keystore key alias
- [ ] **ANDROID_KEY_PASSWORD** - Key password
- [ ] **ANDROID_STORE_PASSWORD** - Keystore password
- [ ] **GOOGLE_PLAY_SERVICE_ACCOUNT** - Base64 encoded service account JSON

### 🖥️ Desktop Deployment (wisdomos-desktop)
- [ ] **WINDOWS_CERT** - Base64 encoded Windows code signing cert
- [ ] **WINDOWS_CERT_PASSWORD** - Windows certificate password
- [ ] **MACOS_CERT** - Base64 encoded macOS code signing cert
- [ ] **MACOS_CERT_PASSWORD** - macOS certificate password

### 🔌 Optional Integrations
- [ ] **HUBSPOT_ACCESS_TOKEN** - HubSpot private app token
- [ ] **FIREBASE_TOKEN** - Firebase CLI token for app distribution

## 🚀 Quick Setup Commands

### Option 1: Interactive Setup (Recommended)
```bash
./setup-secrets.sh
```

### Option 2: Manual Setup Example
```bash
# Add a secret to specific repository
echo "your-secret-value" | /opt/homebrew/bin/gh secret set SECRET_NAME --repo presidentanderson/wisdomos-web

# Add to all repositories
for repo in wisdomos-core wisdomos-api wisdomos-web wisdomos-ios wisdomos-android wisdomos-desktop wisdomos-infrastructure wisdomos-documentation; do
  echo "your-secret-value" | /opt/homebrew/bin/gh secret set SECRET_NAME --repo presidentanderson/$repo
done
```

## 📋 Repository-Specific Secrets

| Secret | Core | API | Web | iOS | Android | Desktop | Infra | Docs |
|--------|------|-----|-----|-----|---------|---------|-------|------|
| DATABASE_URL | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| JWT_SECRET | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| SUPABASE_* | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| OPENAI_API_KEY | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| NEXTAUTH_SECRET |  |  | ✅ |  |  |  |  |  |
| NETLIFY_AUTH_TOKEN |  |  | ✅ |  |  |  |  |  |
| APPLE_* |  |  |  | ✅ |  |  |  |  |
| ANDROID_* |  |  |  |  | ✅ |  |  |  |
| WINDOWS_*/MACOS_* |  |  |  |  |  | ✅ |  |  |
| HUBSPOT_* | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

## 🔍 How to Get Each Secret

### Supabase Secrets
1. Go to your Supabase dashboard
2. Navigate to Settings > API
3. Copy the URL, anon key, and service role key
4. For DATABASE_URL: Settings > Database > Connection string

### Apple Developer Secrets
1. Create certificates in Apple Developer Console
2. Export as .p12 file
3. Convert to base64: `base64 -i certificate.p12 | pbcopy`

### Android Secrets
1. Generate keystore: `keytool -genkey -v -keystore wisdomos.keystore -alias wisdomos -keyalg RSA -keysize 2048 -validity 10000`
2. Convert to base64: `base64 -i wisdomos.keystore | pbcopy`
3. Create Google Play service account in Google Cloud Console
4. Download JSON and convert: `base64 -i service-account.json | pbcopy`

### Code Signing Certificates
- **Windows**: Purchase from trusted CA (Digicert, GlobalSign, etc.)
- **macOS**: Use Apple Developer certificates

## ⚠️ Security Best Practices

1. **Never commit secrets to code repositories**
2. **Use different secrets for development/staging/production**
3. **Rotate secrets regularly (quarterly)**
4. **Use minimum required permissions**
5. **Monitor secret usage in GitHub Actions logs**
6. **Keep backup of certificates in secure password manager**

## 🆘 Troubleshooting

### Common Issues
- **"Secret not found"**: Ensure secret name matches exactly (case-sensitive)
- **"Permission denied"**: Check repository access permissions
- **"Invalid certificate"**: Verify base64 encoding is correct
- **"Build fails"**: Check if all required secrets are configured

### Verify Secrets
```bash
# List secrets for a repository
/opt/homebrew/bin/gh secret list --repo presidentanderson/wisdomos-web

# Check if secret exists (won't show value)
/opt/homebrew/bin/gh secret list --repo presidentanderson/wisdomos-web | grep SECRET_NAME
```

---

🔥 **Ready to secure your Phoenix transformation platform!** 

Run `./setup-secrets.sh` when you have all the required values ready.