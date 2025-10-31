# Coach Factory - End-to-End Testing Guide

**Created**: 2025-10-29
**Status**: Ready for Testing
**Version**: 1.0.0

---

## 🎯 Overview

This guide provides step-by-step instructions for testing the Coach Factory system with all 30 life areas, mode switching, and integration points.

---

## 📋 Pre-Testing Checklist

### 1. Database Migration
```bash
cd "/Volumes/DevOPS 2025/01_DEVOPS_PLATFORM/wisdomOS 2026"

# Apply the Coach Factory migration
supabase db push

# Or execute directly:
supabase db execute --file supabase/migrations/20251030_coach_factory_schema.sql
```

**Verify:**
```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('coach_factory_config', 'coach_sessions_extended', 'fulfillment_signals', 'we_assessment_triggers');

-- Check coach configs seeded (should return 30)
SELECT COUNT(*) FROM coach_factory_config;

-- Check all 30 life areas
SELECT life_area_id, coach_name FROM coach_factory_config ORDER BY life_area_id;
```

### 2. Environment Variables
Ensure these are set in `.env.local`:
```bash
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_KEY=...
NEXT_PUBLIC_APP_URL=http://localhost:3000  # or your deployment URL
```

### 3. Start Development Server
```bash
cd apps/web
pnpm dev
```

---

## 🧪 Test Cases

### Test 1: Voice Recording & Transcription
**Objective**: Verify basic Phoenix Wisdom Coach functionality

**Steps:**
1. Navigate to `/wisdom-coach` or wherever VoiceCoach is mounted
2. Click the microphone button to start recording
3. Speak a reflection about work (30-60 seconds):
   ```
   "I've been feeling really stressed at work lately. The new project is overwhelming
   and I'm working 12-hour days. I feel like I'm losing my work-life balance and it's
   affecting my health and relationships."
   ```
4. Click stop button
5. Wait for processing

**Expected Results:**
- ✅ Transcription appears
- ✅ Tags extracted (e.g., "work", "stress", "work-life balance")
- ✅ Coach response generated
- ✅ **Routing info displayed** showing:
  - Life Area: "work"
  - Coach: "Work Coach"
  - Mode: "restoration" (if work score < 30) or "unknown" or "play"
  - Area Score: displayed with color-coded bar
- ✅ Session saved to database

**Verify in Database:**
```sql
SELECT id, life_area_id, area_score, coach_mode, created_at
FROM wisdom_coach_sessions
WHERE user_id = 'YOUR_USER_ID'
ORDER BY created_at DESC
LIMIT 1;

SELECT * FROM coach_sessions_extended
WHERE session_id = 'SESSION_ID_FROM_ABOVE';
```

---

### Test 2: Life Area Classification (Work)
**Objective**: Verify classification into "work" area

**Test Transcript:**
```
"I got promoted today! My manager recognized all the hard work I've been putting in.
I'm excited about this new role and the opportunities it brings. Finally feel aligned
with my career goals."
```

**Expected Routing:**
- Life Area: `work`
- Coach: "Work Coach"
- Mode: "play" (if score ≥ 40)
- Fulfillment Signal: Possible "breakthrough" detected

---

### Test 3: Life Area Classification (Romantic & Intimacy)
**Objective**: Verify classification into "romantic-intimacy" area

**Test Transcript:**
```
"My partner and I had a deep conversation last night about our future together.
We talked about getting married and starting a family. I feel so connected and loved.
This relationship brings me so much joy and peace."
```

**Expected Routing:**
- Life Area: `romantic-intimacy`
- Coach: "Intimacy Coach"
- Mode: "play" (likely high score)
- Relationship Context: Should detect partner mention
- WE Assessment Trigger: Possibly triggered

**Verify WE Trigger:**
```sql
SELECT * FROM we_assessment_triggers
WHERE user_id = 'YOUR_USER_ID'
ORDER BY created_at DESC
LIMIT 1;
```

---

### Test 4: Mode Switching - Restoration Mode
**Objective**: Verify restoration mode activation for low scores

**Setup:**
1. Manually set a life area score to < 30 in fulfillment_display_items
```sql
UPDATE fulfillment_display_items
SET current_score = 25
WHERE user_id = 'YOUR_USER_ID' AND area_slug = 'financial-abundance';
```

2. Record session about finances:
```
"I'm really struggling with money right now. My credit card debt is out of control
and I can't seem to save anything. I feel anxious and ashamed about my financial
situation. I don't know where to start."
```

**Expected Routing:**
- Life Area: `finance` (or `financial-abundance`)
- Coach: "Finance Coach"
- Mode: **"restoration"** (red/ash badge)
- Coach Response: Should be compassionate, supportive, gentle
- Prompt Used: restoration_prompt from coach_factory_config

---

### Test 5: Mode Switching - Play Mode
**Objective**: Verify play mode activation for high scores

**Setup:**
1. Set score to ≥ 40
```sql
UPDATE fulfillment_display_items
SET current_score = 75
WHERE user_id = 'YOUR_USER_ID' AND area_slug = 'physical-health';
```

2. Record session about health:
```
"Just ran my first 10K! Training has been going amazing. I feel strong, energized,
and confident in my body. Looking to push myself even further and maybe sign up
for a half marathon."
```

**Expected Routing:**
- Life Area: `physical-health`
- Coach: "Physical Health Coach"
- Mode: **"play"** (green/gold badge)
- Coach Response: Should be energetic, challenging, empowering
- Prompt Used: play_prompt from coach_factory_config

---

### Test 6: Fulfillment Signal Detection
**Objective**: Verify breakthrough/setback detection

**Breakthrough Test:**
```
"I finally finished writing my book! After two years of work, it's done and I'm
submitting it to publishers. This feels like such a huge accomplishment. I'm so proud
of myself for not giving up."
```

**Expected:**
- Fulfillment Signal Created
- Signal Type: "breakthrough"
- Emotional Charge: +4 or +5
- Description: Should mention book completion

**Verify:**
```sql
SELECT * FROM fulfillment_signals
WHERE user_id = 'YOUR_USER_ID'
ORDER BY occurred_at DESC
LIMIT 1;
```

---

### Test 7: Relationship Context & WE Assessment
**Objective**: Verify relationship detection and WE trigger

**Test Transcript:**
```
"My relationship with Sarah has been difficult lately. We keep arguing about the same
things and I feel like we're growing apart. I'm not sure if this is just a rough patch
or something more serious. I feel confused and sad."
```

**Expected:**
- Relationship Context: Detected
- Relationship Name: "Sarah"
- Should Trigger Assessment: true
- Trigger Reason: "Mentioned relationship stress" or similar

**Verify:**
```sql
SELECT * FROM we_assessment_triggers
WHERE user_id = 'YOUR_USER_ID'
AND completed = false
ORDER BY created_at DESC;
```

---

### Test 8: Multiple Life Areas Coverage
**Objective**: Test classification across different clusters

**Test Each Cluster:**

**A. Systemic/Structural**
- `work`: "Project deadline stress..."
- `finance`: "Debt concerns..."
- `living-environment`: "Moving apartments..."
- `legal-civic`: "Dealing with legal paperwork..."
- `time-energy-management`: "Feeling overwhelmed by schedule..."

**B. Relational/Human**
- `romantic-intimacy`: "Date night with partner..."
- `family`: "Visited my parents..."
- `friendships`: "Catching up with old friends..."
- `professional-network`: "Networking event..."
- `community-belonging`: "Joined a local group..."

**C. Inner/Personal**
- `physical-health`: "Started workout routine..."
- `mental-health`: "Therapy session helped..."
- `emotional-wellbeing`: "Processing grief..."
- `personal-growth`: "Reading self-help books..."
- `spirituality-meaning`: "Meditation practice..."

**D. Creative/Expressive**
- `creative-expression`: "Painting in my studio..."
- `hobbies-play`: "Playing video games..."
- `style-aesthetics`: "Updating my wardrobe..."
- `humor-levity`: "Comedy show made me laugh..."
- `sensuality-pleasure`: "Enjoying massage..."

**E. Exploratory/Expansive**
- `travel-adventure`: "Planning trip to Japan..."
- `learning-education`: "Taking online course..."
- `innovation-experimentation`: "Trying new recipes..."
- `nature-environment`: "Hiking in mountains..."
- `curiosity-wonder`: "Stargazing last night..."

**F. Integrative/Legacy**
- `purpose-mission`: "Reflecting on life purpose..."
- `values-integrity`: "Making ethical decisions..."
- `legacy-impact`: "What I want to leave behind..."
- `contribution-service`: "Volunteering at shelter..."
- `wisdom-integration`: "Lessons from past experiences..."

---

### Test 9: AreaSessionsWidget Component
**Objective**: Verify recent sessions display

**Steps:**
1. Create component instance in a test page:
```tsx
import { AreaSessionsWidget } from '@/components/coach/AreaSessionsWidget'

<AreaSessionsWidget
  lifeAreaId="work"
  areaName="Work & Purpose"
  userId={user.id}
  limit={3}
/>
```

2. Record 3+ sessions in same area
3. Verify widget displays:
   - Transcript previews
   - Mode badges
   - Score indicators
   - Dates (Today, Yesterday, X days ago)
   - Trending icons (↑ ↓)

---

### Test 10: API Endpoints Direct Testing

**A. Test Coach Factory Endpoint**
```bash
curl -X POST http://localhost:3000/api/coach-factory \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "SESSION_UUID",
    "transcript": "I am feeling stressed about work deadlines",
    "tags": ["work", "stress", "deadlines"],
    "themes": ["career", "pressure"],
    "sentiment": {"overall": "negative", "intensity": 7}
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "routing": {
    "lifeArea": "work",
    "areaScore": 65,
    "coachMode": "unknown",
    "coachName": "Work Coach",
    "contextualResponse": "I hear that work stress...",
    "relationshipContext": null,
    "fulfillmentSignal": null
  }
}
```

**B. Test Assessment Triggers**
```bash
curl http://localhost:3000/api/coach-factory/assess-relationship
```

**C. Test Fulfillment Signals**
```bash
curl "http://localhost:3000/api/coach-factory/add-fulfillment-signal?lifeAreaId=work&limit=10"
```

---

## 🔍 Verification Checklist

### Database Verification
- [ ] All 4 tables created
- [ ] 30 coach configs seeded
- [ ] RLS policies active
- [ ] Sessions being created
- [ ] Extended data being saved
- [ ] Signals being logged
- [ ] WE triggers being created

### UI Verification
- [ ] VoiceCoach shows routing info
- [ ] Mode badges color-coded correctly
- [ ] Score progress bar displays
- [ ] Relationship context shown
- [ ] Fulfillment signals shown
- [ ] AreaSessionsWidget loads

### Functionality Verification
- [ ] Voice recording works
- [ ] Transcription completes
- [ ] Classification accurate (test 10+ areas)
- [ ] Mode switches correctly (< 30, ≥ 40)
- [ ] Scores fetched from fulfillment display
- [ ] Relationship detection works
- [ ] WE triggers created
- [ ] Signals detected

### Edge Cases
- [ ] No fulfillment score exists (defaults to 50)
- [ ] Coach Factory fails (main flow continues)
- [ ] Invalid life area classification (defaults to personal-growth)
- [ ] No relationship mentions (context = null)
- [ ] No significant signals (signal = null)

---

## 🐛 Common Issues & Solutions

### Issue 1: "Edition manifest not found"
**Solution**: Ensure `EDITION` env var is set or use default
```bash
export EDITION=coach
```

### Issue 2: Coach Factory routing returns null
**Possible Causes:**
- Migration not applied
- Coach configs not seeded
- API endpoint not accessible
- OpenAI API key missing

**Debug:**
```sql
SELECT COUNT(*) FROM coach_factory_config;  -- Should return 30
```

### Issue 3: Mode always shows "unknown"
**Cause**: Score is between 30-39 (transitional zone)
**Solution**: This is expected behavior. Test with scores < 30 or ≥ 40.

### Issue 4: Supabase client import error
**Solution**: Use correct import path:
```typescript
import { createClient } from '@/lib/supabase/server'  // Server components
import { createClient } from '@/lib/supabase/client'  // Client components
```

---

## 📊 Success Metrics

**System is working correctly if:**
- ✅ 90%+ of sessions correctly classified
- ✅ Mode switching triggered at correct thresholds
- ✅ Relationship context detected when mentioned
- ✅ Fulfillment signals logged for major events
- ✅ UI displays routing data clearly
- ✅ No errors in console/logs
- ✅ Database entries created correctly

---

## 🚀 Production Deployment Checklist

Before deploying to production:
- [ ] Run all 10 test cases
- [ ] Verify database migration applied
- [ ] Test in Coach Edition (feature enabled)
- [ ] Test in Personal Edition (feature disabled)
- [ ] Verify RLS policies protect user data
- [ ] Check API endpoint authentication
- [ ] Monitor OpenAI API usage/costs
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Document for users
- [ ] Train customer support team

---

## 📚 Additional Resources

- Coach Factory Library: `/apps/web/lib/coach-factory.ts`
- API Endpoints: `/apps/web/app/api/coach-factory/*`
- Database Schema: `/supabase/migrations/20251030_coach_factory_schema.sql`
- UI Components: `/apps/web/components/coach/*`
- Edition Manifests: `/_BACKUPS/.../editions/*/manifest.json`

---

**Happy Testing! 🎉**

If you encounter any issues, check the console logs and database entries first.
