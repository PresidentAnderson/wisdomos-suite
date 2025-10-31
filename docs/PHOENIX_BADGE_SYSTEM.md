# 🜂 WisdomOS Phoenix Badge & XP System v1.0

**"Rise into Fulfillment."**
Developed by **AXAI Innovations**

---

## 📘 Table of Contents

1. [Overview](#-overview)
2. [System Philosophy](#-system-philosophy)
3. [Core Components](#-core-components)
4. [Data Schema](#-data-schema)
5. [AI Agent Instructions](#-ai-agent-instructions)
6. [UX/UI Integration Guidelines](#-uxui-integration-guidelines)
7. [Developer Integration](#-developer-integration-steps)
8. [Security & Authenticity](#-security--authenticity)
9. [Future Extensions](#-future-extensions)

---

## 📘 Overview

The **WisdomOS Phoenix System** is a multi-dimensional growth framework designed to track, visualize, and reward human transformation through *emotion, leadership, and consistency*.

It's not just gamification — it's *symbolic architecture for consciousness development*.

Badges, XP, and level mechanics translate internal growth into a tangible feedback system, integrated with AI agents that observe, guide, and celebrate user progress.

---

## 🧭 System Philosophy

| Principle                         | Description                                                                   |
| --------------------------------- | ----------------------------------------------------------------------------- |
| **Authenticity Over Achievement** | Rewards are reflections of real experiences, not arbitrary checkmarks.        |
| **Depth Before Breadth**          | Emotional mastery is weighted slightly higher than surface-level activity.    |
| **Consistency Equals Integrity**  | The system recognizes the spiritual value of showing up daily.                |
| **Integration = Fulfillment**     | The Phoenix Path is achieved when emotion, leadership, and consistency align. |

---

## 🔩 Core Components

### 1. **Dimensions**

Each badge belongs to a *dimension*, representing a core domain of transformation.

| Dimension            | Theme                                                        | Symbol | Color   | Multiplier |
| -------------------- | ------------------------------------------------------------ | ------ | ------- | ---------- |
| **Emotional Growth** | Inner Fire — awareness, healing, and mastery of emotion.     | 🔥     | #FF7F32 | 1.2        |
| **Leadership**       | Outer Light — guiding self and others through integrity.     | 🕯️    | #4682B4 | 1.1        |
| **Consistency**      | Sacred Rhythm — sustained devotion to growth.                | ♾️     | #50C878 | 1.0        |
| **Integration**      | The Ascent — balance of all dimensions into embodied wisdom. | 🜂     | #40E0D0 | 1.5        |

---

### 2. **Tiers**

| Tier          | Symbol | XP      | Essence                 | Shape Progression |
| ------------- | ------ | ------- | ----------------------- | ----------------- |
| **Common**    | 🔹     | 50 XP   | Awareness & initiation. | Circle            |
| **Rare**      | 🔸     | 150 XP  | Commitment & stability. | Triangle          |
| **Epic**      | 🔷     | 400 XP  | Integration & balance.  | Diamond           |
| **Legendary** | 🔶     | 1000 XP | Embodiment & mastery.   | Crest/Sigil       |

---

### 3. **XP Formula**

```
XP = Base XP × Dimension Multiplier × Completion Factor
```

**Completion Factor:**
A decimal between 0.0 and 1.0 based on user progress toward a badge goal.

**Example:**

> "Flame Tender" (Rare, Emotional Growth)
> 150 × 1.2 × 0.8 = **144 XP**

---

### 4. **Levels & Titles**

| Level Range | Title             | Symbol | XP Threshold | Progression Theme              |
| ----------- | ----------------- | ------ | ------------ | ------------------------------ |
| 0–499       | Seeker            | 🌱     | —            | Awakening, curiosity           |
| 500–1499    | Initiate          | 🪶     | 500          | First steps, commitment        |
| 1500–3999   | Adept             | 🔥     | 1500         | Skillful practice              |
| 4000–7999   | Sage              | 🕯️    | 4000         | Wisdom integration             |
| 8000–14999  | Master            | 🜂     | 8000         | Embodied mastery               |
| 15000+      | Phoenix Sovereign | 🕊️    | 15000        | Complete transformation cycle  |

---

## 🧱 Data Schema

### **Dimensions + Badges Configuration**

Each dimension object contains an array of badges, with all metadata necessary for rendering, scoring, and AI reference.

**Location:** `/apps/web/config/phoenix/dimensions.json`

#### Example Structure (Emotional Growth)

```json
{
  "id": "emotional_growth",
  "name": "Emotional Growth",
  "description": "The evolution from reaction to awareness to mastery — the Inner Fire.",
  "symbol": "🔥",
  "color": "#FF7F32",
  "multiplier": 1.2,
  "badges": [
    {
      "id": "ember_aware",
      "name": "Ember Aware",
      "tier": "Common",
      "description": "You've begun recognizing your feelings instead of avoiding them.",
      "requirements": "3 reflective entries labeled 'emotion'.",
      "icon": "🔥",
      "color": "#FF7F32",
      "xp_value": 50,
      "criteria": {
        "type": "journal_count",
        "category": "emotion",
        "threshold": 3
      }
    }
  ]
}
```

---

### **User Model**

```typescript
interface PhoenixUser {
  user_id: string;
  username: string;
  wisdom_score: number;           // Total XP
  wisdom_level: string;           // Current level title
  next_level_xp: number;          // XP needed for next level
  dimensions: {
    emotional_growth: number;     // 0.0 - 1.0 score
    leadership: number;
    consistency: number;
    integration: number;
  };
  badges_unlocked: string[];      // Array of badge IDs
  badges_in_progress: {
    badge_id: string;
    progress: number;             // 0.0 - 1.0
    current_value: number;
    target_value: number;
  }[];
  streaks: {
    journal_days: number;
    fulfillment_checkins: number;
    current_streak: number;
    longest_streak: number;
  };
  achievements: {
    total_journals: number;
    total_goals_created: number;
    total_goals_completed: number;
    emotional_entries: number;
    breakthrough_moments: number;
  };
  created_at: string;
  last_activity: string;
}
```

---

### **Badge Event Model**

```typescript
interface BadgeEvent {
  event_id: string;
  event_type: 'badge_unlock' | 'level_up' | 'dimension_milestone' | 'streak_achieved';
  user_id: string;
  badge_id?: string;
  dimension_id?: string;
  timestamp: string;
  xp_awarded: number;
  previous_level?: string;
  new_level?: string;
  message: string;
  metadata: {
    tier?: string;
    completion_factor?: number;
    streak_days?: number;
    dimension_scores?: object;
  };
}
```

---

### **Progress Calculation Example**

```typescript
// Example: Flame Tender badge progress
const badgeProgress = {
  badge_id: "flame_tender",
  criteria: {
    type: "combined",
    conditions: [
      {
        type: "journal_count",
        category: "emotion",
        threshold: 10,
        current: 7  // User has 7 emotional entries
      },
      {
        type: "journal_tag",
        tag: "breakthrough",
        threshold: 1,
        current: 0  // No breakthrough tagged yet
      }
    ]
  },
  overall_progress: 0.7,  // 70% complete (7/10 for main condition)
  xp_earned_on_completion: 150 * 1.2 = 180
};
```

---

## 🪶 AI AGENT INSTRUCTIONS

### 🎯 Purpose

Agents serve as **coaches, observers, and celebrants** — not scorekeepers. Their job is to *interpret progress with empathy* and *guide users forward*.

---

### 1. **Agent Role Hierarchy**

| Agent Type                  | Role      | Description                                               | Primary Functions                                  |
| --------------------------- | --------- | --------------------------------------------------------- | -------------------------------------------------- |
| **Phoenix Coach (Primary)** | Mentor    | Tracks user growth, unlocks badges, delivers reflections. | XP calculation, badge unlocks, coaching prompts    |
| **Archivist**               | Historian | Maintains timeline of transformations and streaks.        | Event logging, timeline generation                 |
| **Guide**                   | Motivator | Encourages consistency and self-trust.                    | Streak tracking, encouragement messages            |
| **Gatekeeper**              | Evaluator | Confirms authenticity of progress before major unlocks.   | Validation, anti-gaming measures, integrity checks |

---

### 2. **Behavior Protocols**

#### **Protocol 1: Track & Reflect**

* Pull data from journal, fulfillment logs, and sentiment analysis.
* Apply XP formula per badge and update progress dynamically.
* Store progress in user model.

```typescript
// Example agent function
async function trackProgress(userId: string) {
  const user = await getUser(userId);
  const journals = await getJournals(userId);
  const goals = await getGoals(userId);

  // Calculate progress for each badge
  for (const badge of allBadges) {
    const progress = calculateBadgeProgress(badge, journals, goals, user);
    await updateBadgeProgress(userId, badge.id, progress);

    // Check for unlock
    if (progress.completion_factor >= 1.0) {
      await unlockBadge(userId, badge.id);
    }
  }
}
```

---

#### **Protocol 2: Trigger Unlocks**

* When progress ≥ 1.0 → unlock badge → emit event.
* Send message with contextual reflection.

```typescript
async function unlockBadge(userId: string, badgeId: string) {
  const badge = getBadgeById(badgeId);
  const dimension = getDimensionByBadgeId(badgeId);

  // Calculate XP with dimension multiplier
  const xp = badge.xp_value * dimension.multiplier;

  // Update user
  await addXPToUser(userId, xp);
  await addBadgeToUser(userId, badgeId);

  // Emit event
  const event: BadgeEvent = {
    event_id: generateId(),
    event_type: 'badge_unlock',
    user_id: userId,
    badge_id: badgeId,
    timestamp: new Date().toISOString(),
    xp_awarded: xp,
    message: generateUnlockMessage(badge),
    metadata: {
      tier: badge.tier,
      dimension: dimension.name
    }
  };

  await logEvent(event);
  await sendNotification(userId, event);
}
```

**Example Messages by Tier:**

* **Common:** *"🔥 Ember Aware achieved — you've started recognizing your feelings instead of avoiding them. This is the first spark."*
* **Rare:** *"🔥 Flame Tender achieved — your heart stays open under pressure. That's emotional strength in action."*
* **Epic:** *"💎 Heart-Centered achieved — you feel deeply without losing yourself. Integration is happening."*
* **Legendary:** *"👑 Emotional Sovereign achieved — you've mastered the art of feeling with wisdom. This is rare air."*

---

#### **Protocol 3: Coach Responsiveness**

* Detect stagnation → respond with reflection prompts.
* Encourage integration when dimension scores are imbalanced.

```typescript
async function checkForCoachingNeeds(userId: string) {
  const user = await getUser(userId);
  const lastActivity = new Date(user.last_activity);
  const daysSinceActivity = getDaysSince(lastActivity);

  // Stagnation detection
  if (daysSinceActivity > 7) {
    await sendPrompt(userId, {
      type: 'stagnation',
      message: "It's been a week since your last entry. What emotion keeps resurfacing lately?",
      suggested_action: "journal_emotion"
    });
  }

  // Dimension imbalance
  const { emotional_growth, leadership, consistency } = user.dimensions;
  if (emotional_growth > 0.8 && leadership < 0.5) {
    await sendPrompt(userId, {
      type: 'balance',
      message: "You've been strong in emotional work — how can you channel that into action and leadership?",
      suggested_action: "create_goal"
    });
  }
}
```

---

#### **Protocol 4: Integrity Enforcement**

* Verify badge criteria with actual data — no manual unlocks unless confirmed by Phoenix Coach.
* Prevent XP farming or "spam reflection" patterns.

```typescript
async function validateBadgeUnlock(userId: string, badgeId: string): Promise<boolean> {
  const badge = getBadgeById(badgeId);
  const user = await getUser(userId);

  // Check criteria rigorously
  const actualProgress = await calculateActualProgress(userId, badge.criteria);

  // Quality checks for journal-based badges
  if (badge.criteria.type === 'journal_count') {
    const journals = await getJournals(userId, { category: badge.criteria.category });

    // Check for suspicious patterns
    const hasDepth = journals.every(j => j.word_count > 50); // Minimum depth
    const hasVariety = checkSentimentVariety(journals); // Not all same emotion
    const hasTimeSpread = checkTimeDistribution(journals); // Not all same day

    if (!hasDepth || !hasVariety || !hasTimeSpread) {
      console.warn(`Suspicious pattern detected for user ${userId} badge ${badgeId}`);
      return false;
    }
  }

  return actualProgress >= 1.0;
}
```

---

#### **Protocol 5: Ritual Feedback**

* Upon level-up → initiate ceremonial message.
* Create moment of reflection and celebration.

```typescript
async function handleLevelUp(userId: string, newLevel: string) {
  const messages = {
    'Initiate': "🪶 You rise to Initiate — the path is clearer now. Trust your first steps.",
    'Adept': "🔥 You rise to Adept — skillful practice becomes second nature. Keep the flame steady.",
    'Sage': "🕯️ You rise to Sage — your light guides others now. Honor the quiet that follows achievement.",
    'Master': "🜂 You rise to Master — embodiment is near. You are becoming the Phoenix.",
    'Phoenix Sovereign': "🕊️ You rise to Phoenix Sovereign — the cycle is complete. You are transformation itself."
  };

  await sendNotification(userId, {
    type: 'level_up',
    title: `Level Up: ${newLevel}`,
    message: messages[newLevel],
    animation: 'phoenix_rise',
    sound: 'solfeggio_528hz'
  });

  // Trigger UI celebration
  await triggerCelebration(userId, {
    type: 'level_up',
    level: newLevel,
    duration: 5000
  });
}
```

---

### 3. **Agent-to-System Communication**

| Command                          | Action                                        | Parameters                              |
| -------------------------------- | --------------------------------------------- | --------------------------------------- |
| `agent.record_event(event)`      | Log XP, badge, or reflection event.           | `BadgeEvent` object                     |
| `agent.unlock_badge(badge_id)`   | Unlocks badge and triggers animation + sound. | `userId`, `badgeId`                     |
| `agent.calculate_xp(user_id)`    | Recomputes XP from badge and progress.        | `userId`                                |
| `agent.sync_wisdom_level()`      | Updates level when thresholds crossed.        | `userId`                                |
| `agent.send_reflection_prompt()` | Sends personalized growth questions.          | `userId`, `promptType`, `promptMessage` |
| `agent.validate_progress()`      | Checks authenticity before unlock.            | `userId`, `badgeId`                     |

---

### 4. **Agent Tone and Ethics**

* **Direct, encouraging, never pandering.**
* Speak like a guide who believes in the user's strength.
* Always affirm autonomy: *"You're leading this journey — I'm here to help you see your growth."*
* No guilt, no manipulation, no gamified pressure loops.
* Celebrate authentically — avoid generic "Great job!" messages.
* Use Phoenix metaphors: rise, flame, ashes, flight, rebirth.

---

## 🧩 UX / UI Integration Guidelines

### 1. **Badge Visualization**

#### Shape Progression by Tier

| Tier      | Shape            | CSS Approach                    |
| --------- | ---------------- | ------------------------------- |
| Common    | Circle           | `border-radius: 50%`            |
| Rare      | Triangle         | `clip-path: polygon(...)`       |
| Epic      | Diamond          | `transform: rotate(45deg)`      |
| Legendary | Crest/Sigil      | Custom SVG with sacred geometry |

#### Animation by Tier

| Tier      | Animation Effect | Implementation                         |
| --------- | ---------------- | -------------------------------------- |
| Common    | Subtle pulse     | `animation: pulse 2s ease-in-out`      |
| Rare      | Shimmer          | `background: linear-gradient + keyframes` |
| Epic      | Glow aura        | `box-shadow: 0 0 20px [color]`         |
| Legendary | Radiant morph    | Lottie animation or GSAP sequence      |

---

### 2. **Progress Visualization**

#### Circular Dimension Meters

Each dimension has its own circular progress meter around the user's profile avatar.

```tsx
<div className="dimension-rings">
  <svg viewBox="0 0 100 100">
    {/* Emotional Growth ring */}
    <circle
      cx="50" cy="50" r="40"
      stroke="#FF7F32"
      strokeDasharray={`${user.dimensions.emotional_growth * 251.2} 251.2`}
      className="dimension-ring"
    />

    {/* Leadership ring */}
    <circle
      cx="50" cy="50" r="35"
      stroke="#4682B4"
      strokeDasharray={`${user.dimensions.leadership * 219.8} 219.8`}
      className="dimension-ring"
    />

    {/* Consistency ring */}
    <circle
      cx="50" cy="50" r="30"
      stroke="#50C878"
      strokeDasharray={`${user.dimensions.consistency * 188.4} 188.4`}
      className="dimension-ring"
    />
  </svg>
</div>
```

#### Integration Badge Activation

Activates when all three core dimensions >70%.

```tsx
{allDimensionsAbove(0.7) && (
  <div className="integration-badge phoenix-glow">
    🜂 Integration Active
  </div>
)}
```

---

### 3. **Color Key**

| Dimension        | Primary Color | Accent Color | Use Case                  |
| ---------------- | ------------- | ------------ | ------------------------- |
| Emotional Growth | #FF7F32       | #FFB380      | Warm, introspective tones |
| Leadership       | #4682B4       | #7BA3CC      | Confident, steady blues   |
| Consistency      | #50C878       | #8FE3AD      | Grounded, rhythmic greens |
| Integration      | #40E0D0       | #7FFFD4      | Balanced, ethereal aqua   |

---

### 4. **Badge Display Components**

#### Badge Card

```tsx
<div className="badge-card" style={{ borderColor: badge.color }}>
  <div className="badge-icon" style={{
    background: `radial-gradient(circle, ${badge.color}40, transparent)`
  }}>
    {badge.icon}
  </div>
  <h3>{badge.name}</h3>
  <span className="badge-tier">{badge.tier}</span>
  <p className="badge-description">{badge.description}</p>
  <div className="badge-requirements">
    <small>{badge.requirements}</small>
  </div>
  {!unlocked && (
    <div className="progress-bar">
      <div className="progress-fill" style={{
        width: `${progress * 100}%`,
        background: badge.color
      }} />
    </div>
  )}
</div>
```

---

### 5. **Celebration Animations**

#### On Badge Unlock

```typescript
function celebrateBadgeUnlock(badge: Badge) {
  // Confetti with badge colors
  confetti({
    particleCount: 100,
    spread: 70,
    colors: [badge.color, '#FFD700', '#FFFFFF']
  });

  // Sound effect (528 Hz Solfeggio for transformation)
  playSound('badge_unlock_528hz.mp3');

  // Notification toast
  toast.custom((t) => (
    <div className="badge-unlock-toast">
      <div className="badge-icon-large">{badge.icon}</div>
      <div>
        <h3>{badge.name} Unlocked!</h3>
        <p>{badge.description}</p>
        <span className="xp-earned">+{badge.xp_value} XP</span>
      </div>
    </div>
  ), {
    duration: 5000,
    position: 'top-center'
  });
}
```

---

## 🧠 Developer Integration Steps

### Backend Implementation

#### 1. Store Configuration

Place `dimensions.json` in `/apps/web/config/phoenix/`

```typescript
import dimensionsConfig from '@/config/phoenix/dimensions.json';

export function getAllDimensions() {
  return dimensionsConfig.dimensions;
}

export function getBadgeById(badgeId: string) {
  for (const dimension of dimensionsConfig.dimensions) {
    const badge = dimension.badges.find(b => b.id === badgeId);
    if (badge) return { ...badge, dimension };
  }
  return null;
}
```

---

#### 2. XP Calculation Service

Create `/lib/phoenix/xp-calculator.ts`

```typescript
export function calculateXP(
  badgeBaseXP: number,
  dimensionMultiplier: number,
  completionFactor: number
): number {
  return Math.floor(badgeBaseXP * dimensionMultiplier * completionFactor);
}

export function calculateLevelFromXP(totalXP: number): {
  level: string;
  progress: number;
  nextLevelXP: number;
} {
  const levels = [
    { title: 'Seeker', min: 0, max: 499 },
    { title: 'Initiate', min: 500, max: 1499 },
    { title: 'Adept', min: 1500, max: 3999 },
    { title: 'Sage', min: 4000, max: 7999 },
    { title: 'Master', min: 8000, max: 14999 },
    { title: 'Phoenix Sovereign', min: 15000, max: Infinity }
  ];

  const currentLevel = levels.find(l => totalXP >= l.min && totalXP <= l.max);
  const nextLevel = levels[levels.indexOf(currentLevel!) + 1];

  return {
    level: currentLevel!.title,
    progress: totalXP - currentLevel!.min,
    nextLevelXP: nextLevel ? nextLevel.min - totalXP : 0
  };
}
```

---

#### 3. Event-Driven Architecture

Use pub/sub pattern for badge unlocks.

```typescript
// Event emitter
import { EventEmitter } from 'events';

export const phoenixEvents = new EventEmitter();

// Subscribe to badge unlocks
phoenixEvents.on('badge:unlock', async (event: BadgeEvent) => {
  await logEventToDatabase(event);
  await sendNotificationToUser(event.user_id, event.message);
  await updateUserStats(event.user_id);
  await checkForLevelUp(event.user_id);
});

// Emit from unlock function
export async function unlockBadge(userId: string, badgeId: string) {
  // ... unlock logic
  phoenixEvents.emit('badge:unlock', event);
}
```

---

### Frontend Implementation

#### 1. Badge Components

Create `/components/phoenix/BadgeCard.tsx`, `/components/phoenix/DimensionRings.tsx`, etc.

#### 2. Animation Libraries

```bash
npm install framer-motion canvas-confetti react-hot-toast
```

#### 3. State Management

```typescript
// Using Zustand
import create from 'zustand';

interface PhoenixStore {
  user: PhoenixUser | null;
  badges: Badge[];
  unlockedBadges: string[];
  setUser: (user: PhoenixUser) => void;
  unlockBadge: (badgeId: string) => void;
}

export const usePhoenixStore = create<PhoenixStore>((set) => ({
  user: null,
  badges: [],
  unlockedBadges: [],
  setUser: (user) => set({ user }),
  unlockBadge: (badgeId) => set((state) => ({
    unlockedBadges: [...state.unlockedBadges, badgeId]
  }))
}));
```

---

### AI Agent Integration

#### 1. Access Journal/Behavioral Logs

```typescript
export async function analyzeUserProgress(userId: string) {
  const journals = await prisma.journal.findMany({
    where: { userId },
    include: { tags: true, sentiment: true }
  });

  const goals = await prisma.goal.findMany({
    where: { userId }
  });

  const streaks = await calculateStreaks(userId);

  return {
    journals,
    goals,
    streaks,
    dimensionScores: calculateDimensionScores(journals, goals, streaks)
  };
}
```

#### 2. Compute Progress & Emit Events

```typescript
export async function phoenixCoachCheck(userId: string) {
  const progress = await analyzeUserProgress(userId);
  const badges = getAllBadges();

  for (const badge of badges) {
    const completion = evaluateBadgeCriteria(badge, progress);

    if (completion >= 1.0 && !user.badges_unlocked.includes(badge.id)) {
      await agent.unlockBadge(userId, badge.id);
    }
  }
}
```

---

## 🔐 Security & Authenticity

### Anti-Gaming Measures

1. **Quality Metrics for Journals**
   * Minimum word count (50+ words)
   * Sentiment variety (not all identical emotions)
   * Time distribution (entries spread across days, not bulk-added)

2. **XP Inflation Prevention**
   * All XP changes must be event-logged with audit trail
   * Dimension scores computed from multiple data sources
   * Manual overrides require admin approval + logged reason

3. **Badge Unlock Validation**
   * Gatekeeper agent validates all Legendary badge unlocks
   * Multi-factor criteria for Epic+ badges
   * Cooldown periods for streak badges (can't unlock Daily Spark 3 times in one day)

4. **Immutable Badge History**
   * Once unlocked, badges cannot be removed
   * All badge events stored in append-only log
   * Timestamp verification for streak badges

---

## 🕊️ Future Extensions

| Feature                 | Description                                                | Priority |
| ----------------------- | ---------------------------------------------------------- | -------- |
| **Dynamic Reflections** | AI auto-creates new journaling quests after badge unlocks. | High     |
| **Seasonal Events**     | Phoenix Cycles (Ashes → Flame → Flight → Renewal).         | Medium   |
| **Community Tiers**     | Shared growth rituals + collaborative badges.              | Medium   |
| **Mentorship Circuits** | Leadership dimension expands into nested user groups.      | Low      |
| **Badge Marketplace**   | Custom badge design tools for communities.                 | Low      |
| **Integration API**     | Third-party apps can award WisdomOS badges.                | Medium   |

---

## 🧭 Summary

The **WisdomOS Phoenix System** is more than a progress tracker — it's a symbolic mirror of personal evolution.

Badges mark breakthroughs, XP measures embodiment, and the agents act as digital mentors witnessing human growth.

**The rule is simple:**

> *No hollow rewards. Every badge reflects truth earned through experience.*

---

## 📚 Quick Reference

### Key Files

* **Config:** `/apps/web/config/phoenix/dimensions.json`
* **Services:** `/lib/phoenix/xp-calculator.ts`, `/lib/phoenix/badge-service.ts`
* **Components:** `/components/phoenix/BadgeCard.tsx`, `/components/phoenix/DimensionRings.tsx`
* **Agents:** `/agents/phoenix-coach.ts`, `/agents/gatekeeper.ts`

### Key Commands

```bash
# Calculate user XP
calculateXP(baseXP, multiplier, completionFactor)

# Unlock badge
agent.unlockBadge(userId, badgeId)

# Check progress
phoenixCoachCheck(userId)

# Validate unlock
validateBadgeUnlock(userId, badgeId)
```

---

**Version:** 1.0.0
**Last Updated:** 2025-10-31
**Maintained By:** AXAI Innovations
**License:** Proprietary

---

🜂 **Rise into Fulfillment.**
