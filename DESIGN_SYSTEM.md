# Leasing Assist - Design System Documentation

## Design Philosophy

This project uses a **Neo-Brutal "Cute-alism"** aesthetic - a vibrant, playful take on brutalism that combines:
- Sharp geometric forms (NO rounded corners on components)
- Bold, thick black borders (3-4px)
- Hard, offset shadows (brutal shadows)
- Pastel color palette
- Glassmorphism effects
- Dynamic time-based background gradients

---

## Color Palette

### Primary Colors
```css
Lavender:     #C8B6FF  /* Primary buttons, info badges */
Mint:         #B4F8C8  /* Success states */
Peach:        #FFB4B4  /* Danger/high priority */
Soft Yellow:  #FFF4B4  /* Medium priority */
Pale Blue:    #B4D4FF  /* Secondary buttons, low priority */
Black:        #000000  /* Borders, text */
White:        #FFFFFF  /* Text on dark backgrounds */
```

### Color Usage
- **Buttons**: Primary (lavender), Secondary (pale blue), Danger (peach)
- **Priority Indicators**: High (peach), Medium (soft yellow), Low (pale blue)
- **Badges**: High/urgent (peach), Medium (soft yellow), Low (pale blue), Success (mint), Info (lavender)

---

## Typography

### Font Families
```css
Sans-serif (Body/UI): 'Inter', sans-serif
Monospace (Badges):   'Space Mono', monospace
```

### Font Weights
- Regular: 400
- Semibold: 600
- Bold: 700

### Import
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Space+Mono:wght@400;700&display=swap');
```

---

## Component Standards

### 1. Buttons (`src/components/ui/Button.tsx`)

**Visual Properties:**
- **Border**: 3px solid black, sharp edges (NO rounding)
- **Shadow**: Brutal offset shadow (4px 4px 0px rgba(0, 0, 0, 0.8))
  - Hover: 6px 6px 0px
  - Active: 2px 2px 0px
- **Padding**: 6px vertical, 3px horizontal (px-6 py-3)
- **Font**: Bold, sans-serif

**Animation:**
- Hover: Translate x: -2px, y: -2px (moves up-left)
- Tap: Scale 0.98
- Transition: 100ms (duration: 0.1, ease: 'easeOut')

**Code Reference:**
```tsx
className="font-bold px-6 py-3 border-[3px] border-black shadow-brutal hover:shadow-brutal-hover active:shadow-brutal-active"
whileTap={{ scale: 0.98 }}
whileHover={{ x: -2, y: -2 }}
transition={{ duration: 0.1, ease: 'easeOut' }}
```

---

### 2. Cards (`src/components/ui/Card.tsx`)

**Visual Properties:**
- **Background**: `bg-white/15` (15% white opacity) with `backdrop-blur-md`
- **Border**: 3px solid (color varies by priority)
- **Padding**: p-5
- **Edges**: Sharp, NO rounding

**Priority Styling:**
- **High**: Border peach, pulse-glow animation
- **Medium**: Border soft yellow
- **Low**: Border pale blue, 80% opacity
- **Default**: Border black

**Hover (if interactive):**
- Translate Y: -1px (moves up slightly)
- Scale: 1.02
- Shadow: brutal (4px 4px 0px)
- Background: white/25
- Transition: 200ms CSS transition

**Code Reference:**
```tsx
className="bg-white/15 backdrop-blur-md border-[3px] {priorityClass} p-5"
hoverClass="hover:-translate-y-1 hover:scale-[1.02] hover:shadow-brutal hover:bg-white/25 cursor-pointer transition-all duration-200"
```

---

### 3. Badges (`src/components/ui/Badge.tsx`)

**Visual Properties:**
- **Font**: Monospace (Space Mono), bold, extra small (text-xs)
- **Border**: 2px solid black, sharp edges
- **Padding**: px-3 py-1
- **Display**: Inline-block
- **NO shadows, NO rounding**

**Code Reference:**
```tsx
className="inline-block font-mono font-bold text-xs px-3 py-1 border-2 border-black"
```

---

### 4. Input Fields (`src/components/ui/Input.tsx`)

**Visual Properties:**
- **Background**: `bg-white/10` with `backdrop-blur-sm`
- **Border**: 3px solid black (changes to peach on error)
- **Padding**: px-4 py-2
- **Focus State**: 4px ring with lavender/40 opacity
- **Edges**: Sharp, NO rounding

**Code Reference:**
```tsx
className="px-4 py-2 border-[3px] border-black bg-white/10 backdrop-blur-sm font-sans focus:outline-none focus:ring-4 focus:ring-lavender/40"
```

---

### 5. Modal (`src/components/ui/Modal.tsx`)

**Visual Properties:**
- **Background**: `bg-white/95` with `backdrop-blur-xl`
- **Border**: 4px solid black, sharp edges
- **Shadow**: Brutal large (12px 12px 0px rgba(0, 0, 0, 0.9))
- **Backdrop**: Black/60 with blur

**Animation:**
- Type: Spring (damping: 25, stiffness: 300)
- Initial: Scale 0.8, opacity 0
- Animate: Scale 1, opacity 1

**Code Reference:**
```tsx
className="bg-white/95 backdrop-blur-xl border-4 border-black shadow-brutal-lg"
transition={{ type: 'spring', damping: 25, stiffness: 300 }}
```

---

### 6. ContentContainer (`src/components/layout/ContentContainer.tsx`)

**Visual Properties:**
- **Background**: `rgba(180, 212, 255, 0.15)` (pale blue glass, 15% opacity)
- **Backdrop Blur**: xl
- **Border**: 4px solid black/20
- **Padding**: p-8
- **Max Width**: 7xl


**Code Reference:**
```tsx
className="w-full max-w-7xl p-8 backdrop-blur-xl border-4 border-black/20"
style={{ background: 'rgba(180, 212, 255, 0.15)' }}
```

---

## Shadow System

### Brutal Shadows (Tailwind Utilities - `src/index.css`)

```css
.shadow-brutal {
  box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.8);
}

.shadow-brutal-hover {
  box-shadow: 6px 6px 0px rgba(0, 0, 0, 0.8);
}

.shadow-brutal-active {
  box-shadow: 2px 2px 0px rgba(0, 0, 0, 0.8);
}

.shadow-brutal-lg {
  box-shadow: 12px 12px 0px rgba(0, 0, 0, 0.9);
}
```

**Usage:**
- Standard components: `shadow-brutal`
- Button hover: `shadow-brutal-hover`
- Button active: `shadow-brutal-active`
- Modals/large elements: `shadow-brutal-lg`

**IMPORTANT**: NO soft/blurred shadows. NO neumorphic dual-light shadows. Only hard, offset brutal shadows.

---

## Animation Standards

### Button Animations
- **Duration**: 100ms (fast and snappy)
- **Easing**: easeOut
- **Hover**: x: -2, y: -2 (moves up-left)
- **Tap**: scale: 0.98

### Card Animations
- **Hover Duration**: 200ms (smoother for larger scale changes)
- **Hover Transform**: translateY(-1px), scale(1.02)
- **Entry Animation**: opacity 0→1, y 20→0, 300ms

### Modal Animations
- **Type**: Spring animation
- **Settings**: damping: 25, stiffness: 300
- **Entry**: Scale 0.8→1, opacity 0→1

---

## Background System

### Dynamic Gradient Wave Background (`src/components/ui/GradientBackground.tsx`)

**Key Principle**: ONLY the `lightnessEndColor` value changes based on time of day. ALL other settings remain constant.

**Fixed Settings:**
```javascript
const settings = {
  amplitudeX: 100,
  amplitudeY: 20,
  lines: 20,
  hueStartColor: 12,        // CONSTANT
  saturationStartColor: 15, // CONSTANT
  lightnessStartColor: 67,  // CONSTANT
  hueEndColor: 216,         // CONSTANT
  saturationEndColor: 50,   // CONSTANT
  lightnessEndColor: 7,     // DYNAMIC (0-50 based on time)
  smoothness: 3,
  offsetX: 10,
  fill: true,
  crazyness: false
};
```

**Time-Based Lightness:**
- **12:00 PM (noon)**: lightness = 50 (brightest)
- **12:00 AM (midnight)**: lightness = 0 (darkest)
- **Linear interpolation** between these values throughout the day
- Updates every 60 seconds

**Z-Index Layering:**
```
GradientBackground (z-index: -1, fixed, full viewport)
  ↓
ContentContainer (auto, glassmorphic pale blue)
  ↓
Cards/Buttons/Components (auto, neo-brutal with shadows)
```

---

## Glassmorphism Effects

**Where to Use:**
- ContentContainer: Strong blur (backdrop-blur-xl)
- Cards: Medium blur (backdrop-blur-md)
- Inputs: Light blur (backdrop-blur-sm)
- Modals: Extra strong blur (backdrop-blur-xl)

**Background Opacity Guidelines:**
- Cards: 15% white
- Inputs: 10% white
- Modals: 95% white
- ContentContainer: 15% pale blue

---

## Edge Treatment

### CRITICAL RULE: NO ROUNDING ON COMPONENTS

**Sharp Edges (NO rounding):**
- Buttons
- Cards
- Badges
- Inputs
- Modals (inner content box)

**Rounded Edges (ONLY ONE EXCEPTION):**
- ContentContainer: `rounded-3xl` (provides the soft glass container)

**Border Widths:**
- Buttons: 3px
- Cards: 3px
- Inputs: 3px
- Modals: 4px
- Badges: 2px
- ContentContainer: 4px

---

## Animation Keyframes

### Pulse Glow (High Priority Indicator)
```css
@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(255, 180, 180, 0.4);
  }
  50% {
    box-shadow: 0 0 30px rgba(255, 180, 180, 0.6);
  }
}
```

**Usage**: Applied to high-priority cards
**Duration**: 2s infinite

### Pulse Urgent (Critical Alerts)
```css
@keyframes pulse-urgent {
  0%, 100% {
    box-shadow: 0 0 20px rgba(255, 180, 180, 0.4);
  }
  50% {
    box-shadow: 0 0 30px rgba(255, 180, 180, 0.6);
  }
}
```

**Usage**: Applied to high-priority badges
**Duration**: 1.5s infinite

---

## Accessibility

### Motion Preferences
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Respects user motion preferences** - disables animations for users who prefer reduced motion.

---

## Technology Stack

### Core
- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4

### Animation
- **Library**: Framer Motion
- **Usage**: Buttons, cards, modals

### Backend (Planned)
- Firebase Auth
- Firebase Firestore
- Firebase Storage

### Deployment
- GitHub Pages (static hosting)

---

## File Structure

```
src/
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── GradientBackground.tsx
│   │   └── index.ts
│   └── layout/
│       ├── ContentContainer.tsx
│       └── index.ts
├── index.css (Tailwind imports + custom utilities)
└── App.tsx
```

---

## Design Dos and Don'ts

### ✅ DO:
- Use sharp edges for all interactive components
- Apply brutal (hard offset) shadows
- Use glassmorphism with backdrop-blur
- Maintain the pastel color palette
- Keep animations snappy (100-200ms)
- Use thick black borders (3-4px)

### ❌ DON'T:
- Add rounded corners to buttons, cards, badges, inputs, or modals
- Use soft/blurred shadows (except for priority pulse-glow)
- Use neumorphic dual-light shadows on components
- Change gradient background colors (only lightness varies)
- Slow down animations beyond specified durations
- Use colors outside the defined palette

---

## Implementation Notes

### Tailwind v4 Configuration
- Custom utilities defined in `@layer utilities` in `src/index.css`
- NO JavaScript configuration file needed
- PostCSS plugin: `@tailwindcss/postcss`

### Framer Motion Patterns
```tsx
// Button pattern
<motion.button
  whileTap={{ scale: 0.98 }}
  whileHover={{ x: -2, y: -2 }}
  transition={{ duration: 0.1, ease: 'easeOut' }}
>

// Modal pattern
<motion.div
  initial={{ scale: 0.8, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  exit={{ scale: 0.8, opacity: 0 }}
  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
>

// Card entry pattern
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
```

---

## Common Mistakes to Avoid

1. **Adding neumorphic shadows to components** - The design uses brutal offset shadows ONLY
2. **Changing all gradient colors based on time** - ONLY lightnessEndColor changes
3. **Making card hover animations too fast** - Cards need 200ms (buttons are 100ms)
4. **Adding rounded corners to UI components** - Only ContentContainer has rounding
5. **Removing the glass effect from ContentContainer** - It needs the pale blue transparent background with backdrop-blur

---

## Version History

- **v1.0** (2026-01-10): Initial design system established
  - Neo-brutal aesthetic with sharp edges
  - Glassmorphism effects
  - Time-based gradient background
  - Pastel color palette
  - Brutal shadow system
  - Optimized animation timings

---

## Contact & Questions

This design system is the foundation for the Leasing Assist property management tool. All future development should adhere to these standards to maintain visual consistency and user experience quality.

**Next Steps**: Move to Day 2 development (Firebase Authentication, user flows, protected routes)
