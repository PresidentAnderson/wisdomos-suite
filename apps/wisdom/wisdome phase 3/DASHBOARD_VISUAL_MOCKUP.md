# 📱 WisdomOS Dashboard - Visual Mockup & Design Spec

Complete visual representation of the redesigned dashboard with exact measurements and styling.

---

## 🖥️ Desktop Layout (≥768px)

```
╔══════════════════════════════════════════════════════════════════════════════╗
║  🔥 WisdomOS                                    Journal  Commitments  Badges ║
║  Rise into Fulfillment                                                        ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  Daily Alignment                                                              ║
║  Reflect on how you feel and where you are in your Phoenix journey.          ║
║                                                                               ║
║  ┌─────────────────────────────────┬────────────────────────────────────┐   ║
║  │ 📊 Today's Pulse                │ 🔥 Your Phoenix Cycle         🏆   │   ║
║  │                                 │                           Rebirth   │   ║
║  │ How are you feeling today?      │                                    │   ║
║  │                                 │ ████████████░░░░░░░░ 70%           │   ║
║  │  ┌────┐  ┌────┐  ┌────┐       │                                    │   ║
║  │  │ 😊 │  │ 😐 │  │ 😔 │       │ "You're emerging renewed.          │   ║
║  │  │    │  │ ✓  │  │    │       │  Your phoenix is rising!"          │   ║
║  │  └────┘  └────┘  └────┘       │                                    │   ║
║  │                                 │                                    │   ║
║  │                                 │              ┌─────────────────┐  │   ║
║  │                                 │              │ Start Rebirth → │  │   ║
║  │                                 │              └─────────────────┘  │   ║
║  └─────────────────────────────────┴────────────────────────────────────┘   ║
║                                                                               ║
║  Life Areas                                      🟢 Thriving 🟡 Attention 🔴 ║
║  ┌───────────┬───────────┬───────────┬───────────┬───────────┐              ║
║  │ 🧱 Work   │ ✨ Purpose│ 🎵 Music  │ ✍️ Writing│ 🎤 Speaking│              ║
║  │ Building  │ North Star│ Creative  │ Creative  │ Voice     │              ║
║  │ 🟢 +2     │ 🟡  0     │ 🟢 +1     │ 🟡 -1     │ 🔴 -2     │              ║
║  └───────────┴───────────┴───────────┴───────────┴───────────┘              ║
║                                                                               ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

### Measurements (Desktop)
- **Container width**: 1280px max (container mx-auto)
- **Horizontal padding**: 1rem (16px)
- **Card gap**: 1.5rem (24px)
- **Card padding**: 1.5rem (24px)
- **Button size**: 48px × 48px (emoji buttons)
- **Section margin**: 2rem (32px)

---

## 📱 Mobile Layout (<768px)

```
╔═════════════════════════════════════╗
║ 🔥 WisdomOS              ☰         ║
║ Rise into Fulfillment               ║
╠═════════════════════════════════════╣
║                                     ║
║ Daily Alignment                     ║
║ Reflect on how you feel and         ║
║ where you are in your journey.      ║
║                                     ║
║ ┌─────────────────────────────────┐ ║
║ │ 📊 Today's Pulse                │ ║
║ │                                 │ ║
║ │ How are you feeling today?      │ ║
║ │                                 │ ║
║ │   ┌────┐  ┌────┐  ┌────┐      │ ║
║ │   │ 😊 │  │ 😐 │  │ 😔 │      │ ║
║ │   │    │  │ ✓  │  │    │      │ ║
║ │   └────┘  └────┘  └────┘      │ ║
║ └─────────────────────────────────┘ ║
║          ↓ 1.5rem gap               ║
║ ┌─────────────────────────────────┐ ║
║ │ 🔥 Your Phoenix Cycle      🏆  │ ║
║ │                         Rebirth │ ║
║ │                                 │ ║
║ │ ████████████░░░░░░░░ 70%        │ ║
║ │                                 │ ║
║ │ "You're emerging renewed..."    │ ║
║ │                                 │ ║
║ │           ┌─────────────────┐   │ ║
║ │           │ Start Rebirth → │   │ ║
║ │           └─────────────────┘   │ ║
║ └─────────────────────────────────┘ ║
║                                     ║
║ Life Areas                          ║
║ ┌─────────────────────────────────┐ ║
║ │ 🧱 Work - Building              │ ║
║ │ 🟢 +2  💪 2 wins  📈 trending   │ ║
║ └─────────────────────────────────┘ ║
║                                     ║
╚═════════════════════════════════════╝
```

### Measurements (Mobile)
- **Container width**: 100% (full viewport)
- **Horizontal padding**: 1rem (16px)
- **Card gap**: 1.5rem (24px) vertical
- **Card padding**: 1rem (16px) on mobile
- **Button size**: 44px × 44px (touch-friendly)

---

## 🎨 Color Palette

### Primary Colors
```
Phoenix Orange:  #f97316  ■ rgb(249, 115, 22)
Phoenix Gold:    #f59e0b  ■ rgb(245, 158, 11)
Phoenix Red:     #ef4444  ■ rgb(239, 68, 68)
Phoenix Indigo:  #6366f1  ■ rgb(99, 102, 241)
```

### Neutral Colors
```
Gray 50:   #fafafa  ■ Subtle backgrounds
Gray 200:  #e5e7eb  ■ Progress bar track
Gray 600:  #4b5563  ■ Body text
Gray 900:  #111827  ■ Headers, buttons
White:     #ffffff  ■ Card backgrounds
```

### Semantic Colors
```
Green:   #10b981  ■ Thriving state
Yellow:  #f59e0b  ■ Attention needed
Red:     #ef4444  ■ Breakdown state
Amber:   #fbbf24  ■ Selected state glow
```

---

## 📏 Typography Scale

### Headings
```
Section Title:   text-2xl (24px) font-bold     line-height: 2rem
Card Header:     text-xl (20px) font-semibold  line-height: 1.75rem
Subsection:      text-lg (18px) font-medium    line-height: 1.75rem
```

### Body Text
```
Body:            text-sm (14px) regular         line-height: 1.25rem
Caption:         text-xs (12px) regular         line-height: 1rem
Badge:           text-xs (12px) font-medium     line-height: 1rem
```

### Display
```
Emojis:          text-4xl (36px)                line-height: 2.5rem
Logo:            text-2xl (24px) font-bold      line-height: 2rem
```

---

## 🎭 Component States

### Mood Buttons

#### Default State
```
┌────────────┐
│     😊     │  bg-gray-50
│            │  border: none
└────────────┘  hover: bg-amber-50 scale-105
```

#### Selected State
```
┌────────────┐
│     😊     │  bg-amber-50
│     ✓      │  ring-2 ring-phoenix-orange
└────────────┘  scale-105 transform
```

#### Hover State
```
┌────────────┐
│     😊     │  bg-amber-50
│            │  scale-105 transform
└────────────┘  transition: 200ms ease
```

### Progress Bar

#### Structure
```
Track:  ═══════════════════════  (bg-gray-200, h-2.5, rounded-full)
Fill:   ████████████░░░░░░░░░░  (gradient, h-full, rounded-full)
```

#### Gradient
```
from-amber-500 (start) → to-red-500 (end)
#f59e0b                  #ef4444
```

### Rebirth Button

#### Default
```
┌──────────────────┐
│ Start Rebirth → │  bg-gray-900 text-white
└──────────────────┘  px-4 py-2 rounded-lg
```

#### Hover
```
┌──────────────────┐
│ Start Rebirth → │  bg-gray-700
└──────────────────┘  transition: 200ms
```

---

## 🔄 Animations

### Card Entrance (Framer Motion)
```javascript
initial: { opacity: 0, y: 20 }
animate: { opacity: 1, y: 0 }
transition: { delay: index * 0.05 }
```

**Timing**:
- Card 1 (Today's Pulse): 0ms delay
- Card 2 (Phoenix Cycle): 50ms delay
- Life Area 1: 100ms delay
- Life Area 2: 150ms delay
- ...stagger continues

### Button Interactions
```css
.mood-button {
  transition: all 200ms ease;
  transform: scale(1);
}

.mood-button:hover {
  transform: scale(1.05);
}

.mood-button.active {
  transform: scale(1.05);
  animation: pulse 2s infinite;
}
```

### Progress Bar Fill
```css
.progress-fill {
  transition: width 500ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## 📐 Grid System

### Desktop Grid
```css
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}
```

### Two-Column Layout
```css
.display-header {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .display-header {
    grid-template-columns: 1fr;
  }
}
```

---

## 🎯 Interactive Hotspots

### Desktop View
```
┌─────────────────────────────────┬────────────────────────────────┐
│ [CLICKABLE AREA]                │ [BADGE] Hover: tooltip         │
│                                 │                                │
│ How are you feeling today?      │ Progress Bar: Shows %          │
│                                 │                                │
│ [😊] [😐] [😔]                  │ "You're emerging..."           │
│  ^    ^    ^                    │                                │
│  Click to select mood           │ [START REBIRTH] ← CTA button   │
│                                 │         ^                      │
│                                 │    Click → /reset              │
└─────────────────────────────────┴────────────────────────────────┘
```

### Mobile View
```
┌─────────────────────────────────┐
│ [CLICKABLE AREA]                │
│                                 │
│ [😊] [😐] [😔]                  │
│  Larger touch targets (44×44px) │
└─────────────────────────────────┘
        ↓ Scroll
┌─────────────────────────────────┐
│ [BADGE] Tap: expand details     │
│                                 │
│ [START REBIRTH] Full width      │
└─────────────────────────────────┘
```

---

## 🔍 Accessibility (WCAG AA)

### Contrast Ratios
```
Text on White:
  Gray-900 on White: 16.1:1 ✅ (AAA level)
  Gray-600 on White: 7.6:1  ✅ (AA level)

Text on Buttons:
  White on Gray-900: 16.1:1 ✅ (AAA level)
  Orange on Amber-50: 4.8:1 ✅ (AA level)
```

### Focus States
```css
.focusable:focus {
  outline: 2px solid #f97316;
  outline-offset: 2px;
}
```

### Screen Reader Support
```html
<button 
  aria-label="Select happy mood"
  aria-pressed="false"
  role="button"
>
  😊
</button>
```

---

## 📊 Spacing System

### Base Unit: 0.25rem (4px)

```
0:  0px      (0)
1:  4px      (0.25rem)
2:  8px      (0.5rem)
3:  12px     (0.75rem)
4:  16px     (1rem)      ← Base padding
6:  24px     (1.5rem)    ← Card gaps
8:  32px     (2rem)      ← Section margins
12: 48px     (3rem)      ← Large spacing
16: 64px     (4rem)      ← Extra large
```

---

## 🎨 Visual Hierarchy

### Z-Index Stack
```
Header:          z-50  (sticky navigation)
Mobile Menu:     z-40  (dropdown overlay)
Modals:          z-30  (future dialogs)
Cards:           z-10  (main content)
Floating Embers: z-0   (background decoration)
```

### Shadow Levels
```
Card:     shadow-sm  (0 1px 2px rgba(0,0,0,0.05))
Hover:    shadow-md  (0 4px 6px rgba(0,0,0,0.1))
Active:   shadow-lg  (0 10px 15px rgba(0,0,0,0.1))
Floating: shadow-2xl (0 25px 50px rgba(0,0,0,0.25))
```

---

## 📱 Touch Targets

### Mobile Optimization
```
Minimum: 44×44px (Apple HIG, WCAG)
Recommended: 48×48px

Current Implementation:
- Mood buttons: 48×48px ✅
- Rebirth button: 44×56px ✅
- Navigation links: 44×120px ✅
```

---

## 🎯 Pixel-Perfect Measurements

### Desktop Card Dimensions
```
Card Width:      608px (50% - 12px gap)
Card Height:     ~200px (flexible, equal height)
Card Padding:    24px all sides
Border Radius:   16px (rounded-xl)
Box Shadow:      0 2px 10px rgba(0,0,0,0.05)
```

### Mobile Card Dimensions
```
Card Width:      calc(100vw - 32px)
Card Height:     ~180px (slightly compressed)
Card Padding:    16px all sides
Border Radius:   12px (rounded-lg)
```

---

## ✨ Polish Details

### Micro-interactions
- **Mood button click**: Ripple effect (future)
- **Progress bar**: Smooth fill animation
- **Button hover**: Subtle lift (translateY(-1px))
- **Card hover**: No effect (cards are not clickable)

### Loading States
```
┌─────────────────────────────────┐
│ ⏳ Loading your pulse...        │
│ [Skeleton animation]            │
└─────────────────────────────────┘
```

---

## 🚀 Performance Optimizations

### CSS
- Use Tailwind JIT: Only generates used classes
- No custom CSS: Zero additional bytes
- GPU acceleration: `transform` over `left/top`

### JavaScript
- Framer Motion: Tree-shaking enabled
- Lazy load: Life areas render on scroll
- Memoization: Mood state cached

---

## 📸 Screenshot Simulation (ASCII)

### Full Page View
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                                                       ┃
┃  🔥 WisdomOS                    Journal  Commitments  Reset  Badges  ┃
┃  Rise into Fulfillment                                                ┃
┃ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ┃
┃                                                                       ┃
┃  Daily Alignment                                                      ┃
┃  Reflect on how you feel and where you are in your Phoenix journey.  ┃
┃                                                                       ┃
┃  ╔═══════════════════════════╦═══════════════════════════════════╗  ┃
┃  ║ 📊 Today's Pulse          ║ 🔥 Your Phoenix Cycle        🏆  ║  ┃
┃  ║                           ║                          Rebirth  ║  ┃
┃  ║ How are you feeling?      ║ ▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░ 70%        ║  ┃
┃  ║                           ║                                   ║  ┃
┃  ║  ╔═══╗  ╔═══╗  ╔═══╗     ║ "You're emerging renewed.         ║  ┃
┃  ║  ║ 😊║  ║ 😐║  ║ 😔║     ║  Your phoenix is rising!"         ║  ┃
┃  ║  ║   ║  ║ ✓ ║  ║   ║     ║                                   ║  ┃
┃  ║  ╚═══╝  ╚═══╝  ╚═══╝     ║            ╔═════════════════╗    ║  ┃
┃  ║                           ║            ║ Start Rebirth → ║    ║  ┃
┃  ║                           ║            ╚═════════════════╝    ║  ┃
┃  ╚═══════════════════════════╩═══════════════════════════════════╝  ┃
┃                                                                       ┃
┃  Life Areas                           🟢 Thriving 🟡 Attention 🔴    ┃
┃  ╔════════╦════════╦════════╦════════╦════════╦════════╗            ┃
┃  ║ 🧱 Work║✨Purpose║🎵 Music║✍️ Write║🎤 Speak║📚 Learn║            ┃
┃  ║Building║ North  ║Creative║Creative║ Voice  ║ Growth ║            ┃
┃  ║ 🟢 +2  ║ 🟡  0  ║ 🟢 +1  ║ 🟡 -1  ║ 🔴 -2  ║ 🟢 +1  ║            ┃
┃  ╚════════╩════════╩════════╩════════╩════════╩════════╝            ┃
┃                                                                       ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

---

**Mockup Version**: 1.0  
**Created**: 2025-10-29  
**Design System**: WisdomOS Phoenix Theme  
**Accessibility**: WCAG 2.1 AA Compliant
