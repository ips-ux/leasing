# Leasing Assist - Design System Documentation

## Design Philosophy

This project uses a **Soft Neumorphic (Soft UI)** aesthethic, inspired by **Apple's modern design language**.
It combines:
-   **Soft Grey Backgrounds**: `#F5F5F7` (Base)
-   **Neumorphism**: Subtle light/dark shadows to create depth without harsh borders.
-   **Rounded Corners**: `rounded-2xl` (16px) or `rounded-3xl` for a friendly, approachable feel.
-   **Vivid Semantic Colors**: High contrast Red, Green, Blue for accessibility.
-   **Dark Sidebar**: High value contrast between navigation and content.

---

## Color Palette

### Neutral Scale (Apple Grey)
```css
Main Background:      #F5F5F7  /* Body background */
Surface (Cards):      #FFFFFF  /* Card background */
Text Primary:         #1D1D1F  /* Near black */
Text Secondary:       #86868B  /* Cool grey */
Text Tertiary:        #D2D2D7  /* Light grey */
```

### Semantic Colors (Accessible)
```css
Accent (Blue):        #007AFF  /* Primary Actions */
Success (Green):      #008805  /* Success states */
Error (Red):          #D70015  /* Destructive/Error */
Warning (Orange):     #FF9F0A  /* Warnings */
```

### Sidebar (Dark Mode)
```css
Background:           #1C1C1E  /* Dark Grey */
Surface:              #2C2C2E  /* Active/Hover states */
Text:                 #E5E5EA  /* Light text */
Muted:                #8E8E93  /* Muted text */
Border:               #38383A  /* Separators */
```

---

## Typography

### Font Families
```css
Sans-serif: 'Inter', sans-serif
Monospace:  'Space Mono', monospace
```

---

## Component Standards

### 1. Buttons (`src/components/ui/Button.tsx`)
- **Style**: Neumorphic Action (`neu-action`)
- **Radius**: `rounded-xl`
- **Shadows**: Soft, diffused.
- **Interaction**: Tap scale 0.98.

### 2. Cards (`src/components/ui/Card.tsx`)
- **Style**: Neumorphic Flat (`neu-flat`)
- **Background**: White (`bg-surface`)
- **Radius**: `rounded-2xl` (implicit in `neu-flat`)
- **Hover**: Lift (`y: -4px`) with increased soft shadow.

### 3. Inputs (`src/components/ui/Input.tsx`)
- **Style**: Neumorphic Pressed (`neu-pressed`)
- **Appearance**: Inset shadow to look "carved" into the surface.
- **Focus**: Ring with accent color.

### 4. Sidebar
- **Theme**: Dark Neumorphism (`neu-dark-*`)
- **Background**: Dark Grey (`#1C1C1E`)
- **Separation**: Clear distinction from the light main content.

---

## CSS Utilities (Tailwind Layers)

Defined in `src/index.css`:

### Light Mode (Main Content)
- `.neu-flat`: Raised element (Cards, Containers).
- `.neu-pressed`: Inset element (Inputs, Wells).
- `.neu-action`: Clickable raised element (Buttons).

### Dark Mode (Sidebar)
- `.neu-dark-flat`: Raised dark element.
- `.neu-dark-pressed`: Inset dark element.
- `.neu-dark-action`: Clickable dark element.

---

## Dos and Don'ts

### ✅ DO:
- Use `rounded-2xl` or `rounded-3xl` for main containers.
- Use `neu-flat` for content cards.
- Use Semantic colors for status (Green = Good, Red = Bad).
- Keep the main background `#F5F5F7`.

### ❌ DON'T:
- Use sharp corners (`rounded-none`).
- Use harsh black shadows (`shadow-brutal` is DEPRECATED/REMOVED).
- Use pastel colors for text (ensure contrast).
- Mix Dark and Light neumorphism in the same container (Sidebar is Dark, Main is Light).

---

## Version History
- **v2.0** (2026-02-11): Redesign to Soft Apple-Like Neumorphism.
- **v1.0**: (Deprecated) Neo-Brutalism.
