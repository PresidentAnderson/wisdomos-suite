# 🔥 WisdomOS Phoenix Brand Guidelines

## Table of Contents
1. [Brand Narrative](#brand-narrative)
2. [Visual Identity](#visual-identity)
3. [Color System](#color-system)
4. [Typography](#typography)
5. [Logo Usage](#logo-usage)
6. [UI Components](#ui-components)
7. [Animations & Effects](#animations--effects)
8. [Voice & Tone](#voice--tone)
9. [Implementation Examples](#implementation-examples)

---

## Brand Narrative

### Core Concept
WisdomOS is a **Phoenix Operating System for Life Transformation**. Users enter with burdens, old stories, or unfulfilled areas of life. Through journaling, displays, and tracking, they "burn away" limiting patterns. Out of the ashes emerges renewal, clarity, and fulfillment.

### Taglines
- Primary: **"Rise into Fulfillment"**
- Secondary: **"From Ashes to Clarity"**
- Tertiary: **"Every cycle begins anew"**

### The Phoenix Cycle Metaphor
1. **Ashes (Reflection)** 🌑 - Journaling upsets, patterns, fulfillment gaps
2. **Fire (Breakthrough)** 🔥 - Conversations, reframing, commitments
3. **Rebirth (Fulfillment)** 🌟 - Dashboard lights up with thriving areas
4. **Flight (Legacy)** 🦅 - Archiving, sharing, contribution

---

## Visual Identity

### Logo Symbol
- **Design**: Abstract phoenix rising in geometric lines
- **Style**: Modern, tech-forward yet timeless
- **Animation**: Rising motion with ember particles
- **Usage**: Always maintain clear space equal to the height of the phoenix head

### Visual Principles
- **Transformation**: Every visual element should suggest movement and change
- **Warmth**: Use warm gradients and glowing effects
- **Depth**: Layer elements with glass morphism and shadows
- **Energy**: Incorporate particle effects and animations

---

## Color System

### Phoenix Palette

```css
/* Primary Phoenix Colors */
--phoenix-gold: #FFD700;      /* Solar Gold - wisdom, vitality */
--phoenix-red: #E63946;       /* Phoenix Red - fire of transformation */
--phoenix-orange: #FF914D;    /* Ember Orange - energy, progress */
--phoenix-indigo: #1D3557;    /* Midnight Indigo - reflection, depth */

/* Supporting Colors */
--phoenix-ash: #2C3E50;       /* Deep ash gray - the before state */
--phoenix-ember: #F77F00;     /* Bright ember - active transformation */
--phoenix-flame: #FCBF49;     /* Flame yellow - illumination */
--phoenix-smoke: #1A1F2E;     /* Dark smoke - mystery, potential */
```

### Wisdom Status Colors

```css
/* Life Area Status */
--wisdom-green: #10B981;      /* Thriving 🟢 */
--wisdom-yellow: #F59E0B;     /* Attention needed 🟡 */
--wisdom-red: #EF4444;        /* Breakdown 🔴 */
```

### Gradients

```css
/* Phoenix Gradient */
background: linear-gradient(135deg, #E63946 0%, #FF914D 25%, #FFD700 50%, #FCBF49 75%, #F77F00 100%);

/* Ash Gradient */
background: linear-gradient(180deg, #1A1F2E 0%, #2C3E50 50%, #1D3557 100%);

/* Ember Radial */
background: radial-gradient(circle at center, #FF914D 0%, #E63946 50%, #1D3557 100%);
```

---

## Typography

### Font Stack

```css
/* Headings - Futuristic Sans-Serif */
font-family: 'Futura', 'Helvetica Neue', system-ui, sans-serif;

/* Body Text - Humanist Serif */
font-family: 'Garamond', 'Georgia', serif;

/* UI Elements - System Sans */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Type Scale
- **Display**: 4rem (64px) - Hero headlines
- **H1**: 3rem (48px) - Page titles
- **H2**: 2rem (32px) - Section headers
- **H3**: 1.5rem (24px) - Card headers
- **Body**: 1rem (16px) - Main content
- **Small**: 0.875rem (14px) - Supporting text
- **Micro**: 0.75rem (12px) - Labels, badges

---

## Logo Usage

### Clear Space
Maintain minimum clear space around the logo equal to the height of the phoenix head element.

### Minimum Size
- Digital: 32px height minimum
- Print: 0.5 inch height minimum

### Color Variations
1. **Full Color**: Default on dark backgrounds
2. **Monochrome Gold**: On complex backgrounds
3. **White**: On brand color backgrounds
4. **Black**: For print/high contrast needs

### Don'ts
- ❌ Don't rotate the logo
- ❌ Don't change logo colors
- ❌ Don't add effects or shadows
- ❌ Don't stretch or distort
- ❌ Don't place on busy backgrounds

---

## UI Components

### Buttons

```typescript
// Primary Button - Phoenix gradient
<PhoenixButton variant="primary">Rise Now</PhoenixButton>

// Secondary Button - Indigo gradient
<PhoenixButton variant="secondary">Learn More</PhoenixButton>

// Ghost Button - Transparent with gold border
<PhoenixButton variant="ghost">View Details</PhoenixButton>
```

### Cards

```css
/* Glass Morphism Card */
.glass-card {
  backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
}
```

### Life Area States

```css
/* Green State - Thriving */
.life-area-green {
  background: linear-gradient(to bottom right, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1));
  border-color: rgba(16, 185, 129, 0.3);
  box-shadow: 0 0 30px rgba(16, 185, 129, 0.2);
}

/* Yellow State - Attention */
.life-area-yellow {
  background: linear-gradient(to bottom right, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.1));
  border-color: rgba(245, 158, 11, 0.3);
  box-shadow: 0 0 30px rgba(245, 158, 11, 0.2);
}

/* Red State - Breakdown */
.life-area-red {
  background: linear-gradient(to bottom right, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1));
  border-color: rgba(239, 68, 68, 0.3);
  box-shadow: 0 0 30px rgba(239, 68, 68, 0.2);
}
```

---

## Animations & Effects

### Phoenix Rise
```css
@keyframes phoenixRise {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.8; }
  50% { transform: translateY(-20px) scale(1.1); opacity: 1; }
}
```

### Ember Glow
```css
@keyframes emberGlow {
  0%, 100% { box-shadow: 0 0 20px rgba(255, 145, 77, 0.5); }
  50% { box-shadow: 0 0 40px rgba(255, 145, 77, 0.8); }
}
```

### Flame Flicker
```css
@keyframes flameFlicker {
  0%, 100% { transform: scaleY(1) rotate(0deg); }
  25% { transform: scaleY(1.1) rotate(-2deg); }
  75% { transform: scaleY(0.95) rotate(2deg); }
}
```

### Particle Effects
- **Floating Embers**: Small orange particles rising from bottom
- **Ash Scatter**: Gray particles dispersing on transitions
- **Phoenix Burst**: Radial particle explosion on achievements

---

## Voice & Tone

### Voice Attributes
- **Inspirational**: Uplifting without being preachy
- **Mythic**: Drawing on timeless metaphors
- **Pragmatic**: Bridging ancient wisdom with digital tools
- **Empowering**: Focusing on user agency and transformation

### Tone by Context

#### Reflective (Journaling)
- "What ashes are you ready to rise from?"
- "Which patterns no longer serve your flight?"

#### Empowering (Dashboard)
- "You're in the fire — transformation is here."
- "Your phoenix is rising. Trust the process."

#### Celebratory (Achievements)
- "You've risen — a new cycle begins!"
- "From ashes to glory — you did it!"

### Writing Guidelines
1. Use active voice
2. Keep sentences concise but meaningful
3. Include phoenix metaphors naturally
4. Focus on transformation and growth
5. Avoid technical jargon

---

## Implementation Examples

### Onboarding Welcome
```typescript
<motion.div className="text-center">
  <PhoenixLogo size="lg" animated />
  <h1 className="flame-text">Welcome to WisdomOS</h1>
  <p className="text-phoenix-gold/60">Where every ending is a beginning</p>
</motion.div>
```

### Dashboard Header
```typescript
<header className="bg-phoenix-smoke/80 backdrop-blur-lg">
  <div className="flex items-center gap-4">
    <PhoenixLogo size="sm" />
    <h1 className="flame-text">WisdomOS</h1>
    <span className="wisdom-badge">Phoenix Stage: {stage}</span>
  </div>
</header>
```

### Life Area Card
```typescript
<motion.div className="glass-card life-area-{status}">
  <h3>{area.name}</h3>
  <p className="text-phoenix-gold/60">{area.phoenixName}</p>
  <div className="cycle-indicator">
    <div className="cycle-progress" style={{width: `${progress}%`}} />
  </div>
</motion.div>
```

### Achievement Notification
```typescript
<motion.div className="phoenix-notification">
  <span className="text-8xl">{badge.icon}</span>
  <h2 className="flame-text">Achievement Unlocked!</h2>
  <p>{badge.name} - {badge.description}</p>
</motion.div>
```

---

## Brand Applications

### Digital
- **App Icon**: Simplified golden phoenix feather
- **Loading Screen**: Phoenix rising animation with progress bar
- **Error States**: "Even phoenixes need rest" messaging
- **Empty States**: "Your transformation begins here"

### Marketing
- **Hero Images**: Phoenix silhouette with particle effects
- **Social Media**: #RiseIntoFulfillment hashtag
- **Email Templates**: Gradient headers with phoenix watermark

### Physical (if applicable)
- **Journals**: Embossed phoenix on covers
- **Merchandise**: Subtle phoenix feather patterns
- **Workshop Materials**: "Phoenix Labs" branding

---

## Accessibility

### Color Contrast
- Ensure all text meets WCAG AA standards
- Provide alternative color indicators beyond red/yellow/green
- Use patterns or icons alongside color coding

### Motion
- Respect prefers-reduced-motion settings
- Provide pause controls for animations
- Ensure content is accessible without animations

### Text
- Maintain minimum 16px font size for body text
- Use sufficient line height (1.5x minimum)
- Ensure flame text effects don't impact readability

---

## Version History
- **v1.0** (2025-01-19): Initial Phoenix brand system
- Creator: WisdomOS Design Team
- Last Updated: January 19, 2025

---

*"From ashes to clarity, every transformation begins with a single spark."*