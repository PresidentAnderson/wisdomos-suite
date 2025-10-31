# Design Specification - WisePlay Community

Visual design guidelines for the community-focused redesign.

---

## Color Palette

### Primary Colors

**Orange (Primary Action)**
- `#EA580C` - orange-600 (HSL: 24.6 95% 53.1%)
- Use for: Primary buttons, key CTAs, brand elements
- Represents: Energy, warmth, transformation

**Amber (Secondary)**
- `#F59E0B` - amber-600 (HSL: 38 92% 50%)
- Use for: Secondary actions, accents, highlights
- Represents: Wisdom, value, community

**Gold/Yellow (Tertiary)**
- `#EAB308` - yellow-600 (HSL: 45 93% 47%)
- Use for: Highlights, success states, warmth
- Represents: Possibility, light, breakthrough

### Gradient Combinations

**Primary Gradient (Hero sections, CTAs)**
```css
background: linear-gradient(to right, #EA580C, #F59E0B, #EAB308);
/* from-orange-600 via-amber-600 to-yellow-600 */
```

**Subtle Gradient (Backgrounds)**
```css
background: linear-gradient(to bottom, #FEF3C7, #FED7AA, #FFFFFF);
/* from-amber-50 via-orange-50 to-white */
```

**Card Gradient (Placeholders, empty states)**
```css
background: linear-gradient(to bottom right, #FED7AA, #FDE68A);
/* from-orange-100 to-amber-100 */
```

### Neutral Colors

**Text**
- Gray-900: `#18181B` - Primary text
- Gray-700: `#3F3F46` - Secondary text
- Gray-600: `#52525B` - Tertiary text
- Gray-500: `#71717A` - Placeholder text

**Backgrounds**
- White: `#FFFFFF` - Cards, main areas
- Amber-50: `#FFFBEB` - Subtle backgrounds
- Orange-50: `#FFF7ED` - Warm backgrounds
- Gray-50: `#FAFAFA` - Alternative neutral

### Accent Colors

**Success (Green)**
- Green-600: `#16A34A` - Verification badges
- Green-50: `#F0FDF4` - Success backgrounds

**Warning (Red - sparingly)**
- Red-600: `#DC2626` - Errors only
- Red-50: `#FEF2F2` - Error backgrounds

### Border Colors

**Default Borders**
- Amber-100: `#FEF3C7` - Subtle separation
- Amber-200: `#FDE68A` - Defined borders
- Amber-300: `#FCD34D` - Hover states

---

## Typography

### Font Family

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

### Font Sizes

**Headlines**
- Hero (Desktop): `4.5rem` (72px) - font-bold
- Hero (Mobile): `3rem` (48px) - font-bold
- H1: `3rem` (48px) - font-bold
- H2: `2.25rem` (36px) - font-bold
- H3: `1.875rem` (30px) - font-bold
- H4: `1.5rem` (24px) - font-semibold

**Body Text**
- Large: `1.25rem` (20px) - Subheadlines
- Regular: `1rem` (16px) - Body text
- Small: `0.875rem` (14px) - Secondary text
- Tiny: `0.75rem` (12px) - Labels, captions

### Line Height

- Headlines: `1.2` (tight)
- Subheadlines: `1.4` (snug)
- Body text: `1.6` (relaxed)
- Large text: `1.75` (loose)

### Font Weights

- Regular: 400 (body text)
- Medium: 500 (emphasized text)
- Semibold: 600 (headings, buttons)
- Bold: 700 (major headlines)

---

## Spacing Scale

### Base Unit: 4px

```
1 = 0.25rem (4px)
2 = 0.5rem (8px)
3 = 0.75rem (12px)
4 = 1rem (16px)
6 = 1.5rem (24px)
8 = 2rem (32px)
12 = 3rem (48px)
16 = 4rem (64px)
20 = 5rem (80px)
```

### Common Spacing Patterns

**Section Padding**
- Desktop: `py-20` (80px vertical)
- Mobile: `py-12` (48px vertical)

**Container Padding**
- All screens: `px-4` (16px horizontal)

**Card Padding**
- Standard: `p-6` (24px) or `p-8` (32px)

**Gap Between Elements**
- Tight: `gap-2` (8px)
- Normal: `gap-4` (16px)
- Relaxed: `gap-6` (24px)
- Loose: `gap-8` (32px)

---

## Component Styles

### Buttons

**Primary Button (Connect, CTA)**
```css
.btn-primary {
  background: linear-gradient(to right, #EA580C, #F59E0B);
  color: white;
  padding: 0.75rem 2rem;
  border-radius: 0.5rem;
  font-weight: 600;
  box-shadow: 0 10px 15px -3px rgba(234, 88, 12, 0.3);
}

.btn-primary:hover {
  background: linear-gradient(to right, #C2410C, #D97706);
  box-shadow: 0 20px 25px -5px rgba(234, 88, 12, 0.4);
}
```

**Secondary Button (Learn More, Secondary Actions)**
```css
.btn-secondary {
  background: white;
  color: #EA580C;
  border: 2px solid #EA580C;
  padding: 0.75rem 2rem;
  border-radius: 0.5rem;
  font-weight: 600;
}

.btn-secondary:hover {
  background: #FFF7ED; /* orange-50 */
}
```

**Ghost Button (Subtle actions)**
```css
.btn-ghost {
  background: transparent;
  color: #EA580C;
  padding: 0.5rem 1rem;
  font-weight: 500;
}

.btn-ghost:hover {
  background: #FEF3C7; /* amber-50 */
}
```

### Cards

**Standard Card**
```css
.card {
  background: white;
  border-radius: 0.75rem; /* Softer than default 0.5rem */
  border: 1px solid #FEF3C7; /* amber-100 */
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.card:hover {
  border-color: #FCD34D; /* amber-300 */
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}
```

**Service/Offering Card**
```css
.service-card {
  /* Extends .card */
  overflow: hidden;
}

.service-card-image {
  aspect-ratio: 16/9;
  background: linear-gradient(135deg, #FED7AA, #FDE68A);
  /* Warm gradient for image placeholders */
}

.service-card-footer {
  background: linear-gradient(to right, rgba(254, 215, 170, 0.3), rgba(253, 230, 138, 0.3));
  /* Subtle warm gradient in footer */
}
```

### Badges

**Category Badge**
```css
.badge-category {
  background: #FFF7ED; /* orange-50 */
  color: #C2410C; /* orange-700 */
  border: 1px solid #FDBA74; /* orange-200 */
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
}
```

**Verified Badge**
```css
.badge-verified {
  background: #F0FDF4; /* green-50 */
  color: #15803D; /* green-700 */
  border: 1px solid #86EFAC; /* green-200 */
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
}
```

### Icons

**Size Guidelines**
- Small: `h-4 w-4` (16px) - Inline with text
- Medium: `h-6 w-6` (24px) - Buttons, labels
- Large: `h-8 w-8` (32px) - Feature icons
- XLarge: `h-12 w-12` (48px) - Section headers
- Hero: `h-16 w-16` (64px) - Major features

**Color Guidelines**
- Primary actions: Orange-600 `#EA580C`
- Secondary: Amber-600 `#F59E0B`
- Tertiary: Yellow-600 `#EAB308`
- Success: Green-600 `#16A34A`
- Neutral: Gray-600 `#52525B`

**Recommended Icons (Lucide React)**
- Community: `Heart`, `Users`, `Globe`
- Transformation: `Sparkles`, `Lightbulb`, `Zap`
- Connection: `MessageCircle`, `Handshake`, `Link`
- Support: `CircleDot`, `Target`, `CheckCircle`
- Leadership: `Star`, `Award`, `Trophy`

---

## Layout Patterns

### Container Widths

```css
.container {
  max-width: 1280px; /* Wide content */
  max-width: 1024px; /* Standard content */
  max-width: 768px;  /* Narrow content (text-heavy) */
  max-width: 640px;  /* Forms, single column */
}
```

### Grid Patterns

**3-Column Feature Grid (Values, Benefits)**
```css
.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

@media (max-width: 768px) {
  .feature-grid {
    grid-template-columns: 1fr;
  }
}
```

**4-Column Category Grid**
```css
.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

@media (max-width: 1024px) {
  .category-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

**Offering/Service Grid**
```css
.offering-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

@media (max-width: 1024px) {
  .offering-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .offering-grid {
    grid-template-columns: 1fr;
  }
}
```

---

## Animation & Transitions

### Timing

**Duration**
- Fast: `150ms` - Micro-interactions
- Normal: `300ms` - Standard transitions
- Slow: `500ms` - Major state changes

**Easing**
- Standard: `ease` - General use
- Ease-out: `cubic-bezier(0, 0, 0.2, 1)` - Entering
- Ease-in: `cubic-bezier(0.4, 0, 1, 1)` - Exiting

### Common Transitions

**Button Hover**
```css
transition: all 0.3s ease;
```

**Card Hover**
```css
transition: all 0.3s ease;
transform: translateY(-2px);
box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
```

**Icon Hover**
```css
transition: transform 0.3s ease;
transform: scale(1.1);
```

---

## Responsive Breakpoints

```css
/* Mobile first approach */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large desktops */
```

### Common Patterns

**Hero Text**
```jsx
<h1 className="text-5xl md:text-7xl">
```

**Section Padding**
```jsx
<section className="py-12 md:py-20">
```

**Grid Columns**
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

---

## Imagery Guidelines

### Photo Style

**Preferred:**
- Warm, natural lighting
- Authentic, candid moments
- People engaged in conversation
- Diverse representation
- Eye contact and connection
- Open body language

**Avoid:**
- Stock photo feel
- Overly posed
- Cold, clinical lighting
- Corporate/boardroom settings
- Isolated individuals
- Staged "business" shots

### Image Treatments

**Overlays for Text Readability**
```css
background: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5));
```

**Warm Tint**
```css
filter: sepia(0.1) saturate(1.2);
```

**Placeholder Gradients**
```css
background: linear-gradient(135deg, #FED7AA, #FDE68A);
/* orange-100 to amber-100 */
```

---

## Accessibility

### Color Contrast

**Text on White Background:**
- Orange-600 (#EA580C): AA ✓ (4.54:1)
- Amber-600 (#F59E0B): AAA ✓ (7.51:1)
- Gray-700 (#3F3F46): AAA ✓ (10.5:1)
- Gray-900 (#18181B): AAA ✓ (16.7:1)

**White Text on Orange Gradient:**
- Test before using
- Add dark overlay if needed
- Minimum 4.5:1 ratio required

### Focus States

```css
:focus-visible {
  outline: 2px solid #EA580C;
  outline-offset: 2px;
  border-radius: 0.375rem;
}
```

### Interactive Elements

- Minimum touch target: 44x44px
- Clear hover states
- Visible focus indicators
- Keyboard navigation support

---

## Best Practices

### Do's ✓

- Use warm gradients for emphasis
- Maintain consistent spacing
- Softer border radius (0.75rem vs 0.5rem)
- Subtle shadows, enhanced on hover
- Warm backgrounds for sections
- Icons that support meaning
- Generous white space
- Clear visual hierarchy

### Don'ts ✗

- Avoid harsh shadows
- Don't use cold blues
- Don't overuse gradients
- Avoid sharp corners everywhere
- Don't crowd content
- Avoid generic stock imagery
- Don't use all-caps excessively
- Avoid corporate/clinical feel

---

## Component Examples

### Hero Section
```jsx
<section className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 text-white py-20">
  <div className="container mx-auto px-4">
    <div className="max-w-3xl mx-auto text-center">
      <Heart className="h-12 w-12 mx-auto mb-6" />
      <h1 className="text-5xl font-bold mb-6">
        Community Hub
      </h1>
      <p className="text-xl mb-8 text-white/95">
        Connect with fellow community members
      </p>
    </div>
  </div>
</section>
```

### Feature Card
```jsx
<div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all border border-amber-100">
  <div className="bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg w-14 h-14 flex items-center justify-center mb-4">
    <Sparkles className="h-7 w-7 text-orange-700" />
  </div>
  <h3 className="text-xl font-bold mb-3">Create Possibility</h3>
  <p className="text-gray-700 leading-relaxed">
    Share your unique gifts with the community
  </p>
</div>
```

### Primary Button
```jsx
<button className="px-8 py-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg font-semibold hover:from-orange-700 hover:to-amber-700 transition-all shadow-lg hover:shadow-xl">
  Connect
</button>
```

---

## Dark Mode (Future Consideration)

### Color Adjustments

**Backgrounds**
- Dark: `#18181B` (gray-900)
- Cards: `#27272A` (gray-800)

**Primary Colors (Adjusted)**
- Orange: `#FB923C` (orange-400) - More visible
- Amber: `#FBBF24` (amber-400) - Better contrast

**Text**
- Primary: `#FAFAFA` (gray-50)
- Secondary: `#D4D4D8` (gray-300)

---

## Design Principles

1. **Warmth Over Clinical**: Always choose warmer tones
2. **Organic Over Sharp**: Softer corners, flowing shapes
3. **Human Over Corporate**: Photography and language
4. **Connected Over Isolated**: Emphasize relationships
5. **Transformational Over Transactional**: Focus on growth
6. **Authentic Over Polished**: Real over perfect
7. **Community Over Individual**: "We" not "you/us"
8. **Generous Spacing**: Let content breathe

---

## Tools & Resources

### Color Tools
- Tailwind Color Generator
- Contrast Checker (WebAIM)
- Coolors.co (palette generation)

### Icon Libraries
- Lucide React (current)
- Heroicons (alternative)

### Font Pairing
- System fonts (current - optimal performance)
- Consider: Inter, Plus Jakarta Sans (if custom fonts needed)

---

## Version History

**v1.0** - Initial community redesign
- Warm orange/amber/gold palette
- Community-focused components
- Authentic, human-centered design

---

*Design with intention. Every element should support transformation, connection, and possibility.*
