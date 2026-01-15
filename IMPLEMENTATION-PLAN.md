# Leasing Assistance Tool - Implementation Plan
**GitHub Pages + Firebase Architecture**

## Overview
Building a multi-user web application to help leasing professionals track applicant processing and resident inquiries. Deploys to GitHub Pages (static hosting) with Firebase backend services.

## Technology Stack

### Frontend (Client-Side Only)
- **React 18** with TypeScript (via Vite)
- **React Router v6** for routing
- **Tailwind CSS** for styling with custom theme
- **Framer Motion** for micro-interactions and animations
- **React Hook Form** + **Zod** for form validation
- **Zustand** for client state management
- **CSS Custom Properties** for dynamic theming (dark mode, time-based lighting)

### Backend/Database (Firebase)
- **Firebase Firestore** - NoSQL cloud database (free tier: 1GB storage, 50K reads/day, 20K writes/day)
- **Firebase Authentication** - Email/password auth
- **Firebase Storage** - Document/file uploads (5GB free)
- **Firestore Security Rules** - Database access control

### Build & Deployment
- **Vite** for fast dev server and optimized production builds
- **GitHub Pages** for free static hosting
- **GitHub Actions** for CI/CD (auto-deploy on push to main)

### Why This Stack?
- **Zero Hosting Costs**: GitHub Pages + Firebase free tiers
- **No Backend Code**: Firebase SDK handles all backend operations
- **Real-time Multi-User**: Firestore automatically syncs changes across users
- **Production-Ready**: Firebase powers millions of apps (Duolingo, The New York Times, etc.)
- **Familiar to Team**: You've already used Firebase successfully for your scheduler
- **Motion-First**: Framer Motion enables delightful micro-interactions and smooth transitions

## Design Aesthetic: Neo-Brutalist "Cute-alism"

### Core Design Principles

**1. Neo-Brutalist Foundation**
- **Thick Borders**: 3-4px black borders on all interactive elements
- **High Contrast**: Stark blacks (#000) against soft pastels
- **Monospaced Typography**: JetBrains Mono or Space Mono for data/labels
- **Sans-Serif Headings**: Inter or Public Sans for readable hierarchy
- **Sharp Corners with Selective Rounding**: Buttons/cards get subtle border-radius (8px), but borders stay sharp

**2. Cute-alism Softening**
- **Pastel Palette**:
  - Soft lavender (#C8B6FF) for primary actions
  - Mint green (#B4F8C8) for success/completed states
  - Peachy pink (#FFB4B4) for high priority/urgent
  - Soft yellow (#FFF4B4) for medium priority
  - Pale blue (#B4D4FF) for low priority/info
- **Playful Micro-Illustrations**: Tiny emoji-style icons (📋 clipboard, ✨ sparkles, 🏠 house)
- **Bouncy Interactions**: Buttons "squish" on click, cards "wobble" on hover

**3. Glassmorphism & Depth**
- **Frosted Glass Layers**: Active modals/overlays use `backdrop-filter: blur(12px)`
- **Translucent Backgrounds**: `background: rgba(200, 182, 255, 0.15)` with blur
- **Z-Axis Hierarchy**:
  - Background layer (z-0): Blurred, low contrast
  - Content layer (z-10): Normal opacity
  - Active/focused layer (z-20): Full opacity, sharp glass borders
- **Depth Shadows**: `box-shadow: 4px 4px 0px rgba(0,0,0,0.8)` for raised elements

**4. Chromatic Urgency System**
- **High Priority**: Pulsing bioluminescent glow (peach with soft animation)
- **Medium Priority**: Static soft yellow border
- **Low Priority**: Pale blue, slightly transparent
- **Completed**: Fades to 40% opacity, recedes into background

**5. Time-Based Lighting (Dynamic Theme)**
- **Morning (6am-12pm)**: Bright pastels, high contrast, minimal blur
- **Afternoon (12pm-6pm)**: Standard theme, balanced lighting
- **Evening (6pm-12am)**: Darker mode, deeper glass panels, moodier shadows
- **Night (12am-6am)**: Full dark mode, bioluminescent accents glow brighter

### UI Component Design Specs

**Buttons**
```css
/* Primary Button - Neo-Brutal Cute */
.btn-primary {
  background: #C8B6FF; /* Lavender */
  border: 3px solid #000;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  padding: 12px 24px;
  box-shadow: 4px 4px 0px rgba(0,0,0,0.8);
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-primary:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0px rgba(0,0,0,0.8);
}

.btn-primary:active {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0px rgba(0,0,0,0.8);
  /* Morphs into loading spinner on submit */
}
```

**Glass Cards (Applicant Cards, Inquiry Cards)**
```css
.glass-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  border: 3px solid #000;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.glass-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 8px 8px 0px rgba(0,0,0,0.8);
  background: rgba(255, 255, 255, 0.25);
}

.glass-card.priority-high {
  border-color: #FFB4B4;
  animation: pulse-glow 2s infinite;
  box-shadow: 0 0 20px rgba(255, 180, 180, 0.4);
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(255, 180, 180, 0.4); }
  50% { box-shadow: 0 0 30px rgba(255, 180, 180, 0.6); }
}
```

**Workflow Progress Steps**
```css
.workflow-step {
  background: rgba(180, 212, 255, 0.1);
  border: 3px solid #000;
  border-left: 6px solid #B4D4FF;
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 8px;
}

.workflow-step.completed {
  opacity: 0.4;
  transform: scale(0.98);
  border-left-color: #B4F8C8;
  /* Checkmark icon morphs in with bounce */
}

.workflow-step.active {
  border-left-color: #C8B6FF;
  background: rgba(200, 182, 255, 0.2);
  box-shadow: 0 0 24px rgba(200, 182, 255, 0.3);
}

.workflow-step:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  filter: grayscale(0.7);
}
```

**Modal Overlays (Task Details, Forms)**
```css
.modal-overlay {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  /* Background content blurs when modal opens */
}

.modal-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(16px);
  border: 4px solid #000;
  border-radius: 16px;
  box-shadow: 12px 12px 0px rgba(0,0,0,0.9);
  transform-origin: center;
  /* Scales in from 0.8 to 1.0 with spring animation */
}
```

**File Upload Zone**
```css
.upload-zone {
  border: 3px dashed #000;
  border-radius: 12px;
  background: rgba(180, 212, 255, 0.1);
  padding: 40px;
  transition: all 0.3s ease;
}

.upload-zone:hover {
  background: rgba(180, 212, 255, 0.2);
  border-style: solid;
}

.upload-zone.dragging {
  transform: scale(1.05);
  border-color: #C8B6FF;
  background: rgba(200, 182, 255, 0.3);
  box-shadow: inset 0 0 20px rgba(200, 182, 255, 0.4);
  /* "Magnetically catches" file */
}

.upload-zone .file-icon {
  /* Morphs into progress bar on drop */
  transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

**Priority Badges**
```css
.badge-high {
  background: #FFB4B4;
  border: 2px solid #000;
  padding: 4px 12px;
  border-radius: 20px;
  font-family: 'Space Mono', monospace;
  font-size: 12px;
  font-weight: 700;
  animation: pulse-urgent 1.5s infinite;
}

.badge-medium {
  background: #FFF4B4;
  border: 2px solid #000;
}

.badge-low {
  background: #B4D4FF;
  border: 2px solid #000;
  opacity: 0.8;
}
```

### Micro-Interactions Specifications

**1. Button Click → Loading → Success**
```
[Initial State: Lavender button]
  ↓ Click (squish down animation)
[Loading State: Button morphs into spinner]
  ↓ Morphing animation (width shrinks, becomes circular)
[Spinner: Rotating lavender circle with black border]
  ↓ Success received
[Success State: Morphs to green checkmark]
  ↓ Checkmark pops in with bounce
[Final: Returns to button after 1s]
```

**2. Workflow Step Completion**
```
[Unchecked: Pale blue border, normal opacity]
  ↓ User clicks checkbox
[Checking: Checkbox fills with lavender]
  ↓ 0.3s delay
[Morphing: Checkbox transforms to checkmark icon]
  ↓ Checkmark bounces in
[Completed: Entire step fades to 40% opacity, green left-border]
  ↓ Simultaneously
[Next Step: Animates in from disabled state, glows softly]
```

**3. File Upload Flow**
```
[Idle: Dashed border, pale blue background]
  ↓ File dragged over
[Magnetic Catch: Zone expands 5%, border solidifies, lavender glow]
  ↓ File dropped
[Catching: File icon "snaps" to center with spring physics]
  ↓ Icon morphs
[Uploading: Icon transforms to progress bar (0-100%)]
  ↓ Progress bar fills with lavender
[Complete: Progress bar morphs to green checkmark with "pop" sound effect]
  ↓ Checkmark bounces
[Success: Checkmark fades, filename appears with slide-in from right]
```

**4. Inquiry Card Priority Change**
```
[Medium Priority: Yellow border, static]
  ↓ User changes to High
[Transition: Yellow fades out, peach fades in]
  ↓ Border color morphs
[High Priority: Peach border begins pulsing glow]
  ↓ Card "floats" up 4px
[Final State: Pulsing bioluminescent glow, elevated z-index]
```

**5. Monthly Inquiry Migration**
```
[Previous Month Tab: Contains 5 incomplete inquiries]
  ↓ User clicks "Migrate to Current Month"
[Confirmation Modal: Slides in from bottom with glass effect]
  ↓ User confirms
[Migration Animation: Each inquiry card "lifts" from previous month]
  ↓ Cards fly to current month tab with stagger (0.1s delay each)
[Landing: Cards drop into current month with bounce]
  ↓ Priority badges morph to "HIGH" with color change
[Complete: Toast notification slides in from top-right with success]
```

### Typography System

**Font Stack**
- **Headings**: `'Inter', 'Public Sans', sans-serif` (700 weight)
- **Body Text**: `'Inter', sans-serif` (400 weight)
- **Data/Monospace**: `'Space Mono', 'JetBrains Mono', monospace` (for unit numbers, dates, counts)
- **Labels**: `'Inter', sans-serif` (600 weight)

**Type Scale**
- Hero (Dashboard): 48px / 700 / -1% letter-spacing
- H1 (Page Titles): 36px / 700 / -0.5% letter-spacing
- H2 (Section Headers): 24px / 700 / normal
- H3 (Card Titles): 18px / 600 / normal
- Body: 16px / 400 / normal
- Small (Metadata): 14px / 400 / normal
- Mono Data: 14px / 400 / monospace

**Dynamic Typography**
- **Workflow Step Numbers**: Kinetic animation when step becomes active (scales 1.2x and bounces)
- **Priority Labels**: "Wiggle" on update (slight rotation -2° to +2°)
- **Data Counts**: Increment with counting animation (0 → final value over 0.5s)

### Color Palette

**Primary Colors**
- Lavender: `#C8B6FF` (Primary actions, active states)
- Mint: `#B4F8C8` (Success, completed)
- Peach: `#FFB4B4` (High priority, urgent)
- Soft Yellow: `#FFF4B4` (Medium priority)
- Pale Blue: `#B4D4FF` (Low priority, info)

**Neutral Colors**
- Black: `#000000` (All borders, text)
- White: `#FFFFFF` (Backgrounds, light mode base)
- Glass White: `rgba(255, 255, 255, 0.15)` (Card backgrounds)
- Glass Dark: `rgba(0, 0, 0, 0.6)` (Modal overlays)

**Time-Based Theme Colors**
```css
/* Morning (6am-12pm) */
--bg-primary: #FFFFFF;
--glass-opacity: 0.15;
--shadow-intensity: 0.8;

/* Evening (6pm-12am) */
--bg-primary: #1A1A2E;
--glass-opacity: 0.25;
--shadow-intensity: 0.95;
--glow-intensity: 1.5; /* Bioluminescent accents brighter */
```

### Layout: "Hyper-Physical" Glass Tables

**Applicant List (Table View)**
- Not a flat grid - series of floating glass panels
- Each row is a card with:
  - Translucent background
  - 3px black border
  - 8px border-radius
  - 4px gap between rows
  - Hover: Card lifts 4px, shadow increases
  - Click: Card scales 0.98x (press effect), then expands to detail view

**Sorting/Filtering Animation**
- Cards don't just reorder - they "fly" to new positions
- Stagger animation: Each card delays 50ms after previous
- Filtered-out cards: Fade to 0 opacity and scale to 0.8x
- New cards: Slide in from top with spring physics

**Applicant Detail Workflow View**
- Background: Blurs with `backdrop-filter`
- Active workflow card: Floats "above" with strong shadow
- Inactive cards: Recede into background depth (lower opacity, smaller shadows)
- Scrolling: Parallax effect - background moves slower than foreground

### Responsive Behavior

**Desktop (>1024px)**
- Full glass effects with blur
- All micro-animations enabled
- Sidebar navigation visible
- Multi-column layouts for workflows

**Tablet (768px-1024px)**
- Simplified glass effects (less blur for performance)
- Sidebar collapses to hamburger
- Single column for workflows
- Touch-friendly hit targets (min 44px)

**Mobile (<768px)**
- Minimal glass effects
- Essential animations only (button presses, checkmarks)
- Bottom navigation bar
- Cards stack vertically

### Accessibility Considerations

**Motion Preferences**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**High Contrast Mode**
- All text minimum 7:1 contrast ratio against backgrounds
- Borders increase to 4px in high contrast mode
- Glass effects disabled, solid backgrounds used

**Screen Readers**
- ARIA labels for all interactive elements
- Live regions announce workflow step completions
- Focus indicators use lavender outline (4px solid)

## Firestore Database Structure

### Collection: `users/`
User profiles (automatically created with Firebase Auth)
```typescript
{
  uid: string,              // Firebase Auth UID
  email: string,
  displayName: string,
  role: 'agent' | 'admin',
  createdAt: Timestamp,
  isActive: boolean
}
```

### Collection: `applicants/`
Main applicant records with nested workflow data
```typescript
{
  id: string,               // Auto-generated doc ID
  name: string,
  unit: string,
  dateApplied: Timestamp,
  moveInDate: Timestamp,
  concessionApplied: string,
  currentStep: number,      // 0-10 (tracks workflow progress)
  status: 'in_progress' | 'approved' | 'completed' | 'cancelled',
  assignedTo: string,       // User UID
  createdBy: string,        // User UID
  createdAt: Timestamp,
  updatedAt: Timestamp,
  completedAt: Timestamp | null,

  // Nested workflow object (avoids need for subcollection)
  workflow: {
    '1': { stepName: string, isCompleted: boolean, completedAt: Timestamp | null, completedBy: string | null, notes: string },
    '2': { ... },
    // ... steps 1-10
  },

  // Rentables array (Step 5)
  rentables: Array<{
    itemType: 'parking' | 'storage',
    itemName: string,       // 'Uncovered', 'Medium', etc.
    quantity: number,
    monthlyRate: number
  }>,

  // Documents map (Steps 1, 3, 6, 10)
  documents: {
    'screening': { status: 'complete', fileUrl: string, fileName: string, uploadedAt: Timestamp, uploadedBy: string },
    'income': { ... },
    'guarantor': { status: 'not_applicable' | 'complete', ... },
    // ... all document types
  }
}
```

### Collection: `inquiries/`
Resident to-do items with monthly organization
```typescript
{
  id: string,
  name: string,
  unitNumber: string,
  inquiryNote: string,
  priority: 'high' | 'medium' | 'low',
  status: 'open' | 'in_progress' | 'completed',
  resolution: string,
  createdMonth: string,     // 'YYYY-MM' format for grouping
  createdAt: Timestamp,
  updatedAt: Timestamp,
  completedAt: Timestamp | null,
  assignedTo: string | null,
  createdBy: string
}
```

### Collection: `activityLog/`
Audit trail for all changes
```typescript
{
  id: string,
  userId: string,
  userName: string,
  entityType: 'applicant' | 'inquiry',
  entityId: string,
  action: string,           // 'created', 'updated_workflow_step', 'added_rentable', etc.
  details: Record<string, any>,
  createdAt: Timestamp
}
```

### Firestore Composite Indexes
(Create these in Firebase Console)
- `applicants`: `status` ASC, `updatedAt` DESC
- `applicants`: `assignedTo` ASC, `status` ASC
- `inquiries`: `createdMonth` ASC, `priority` ASC
- `inquiries`: `status` ASC, `createdAt` DESC

## Project Structure

```
leasing_assist/
├── .github/
│   └── workflows/
│       └── deploy.yml                    # GitHub Actions auto-deploy
├── public/
│   └── assets/                           # Static images, icons
├── src/
│   ├── firebase/
│   │   ├── config.ts                     # Firebase init (CRITICAL #1)
│   │   ├── auth.ts                       # Auth functions
│   │   ├── firestore.ts                  # Firestore CRUD functions
│   │   └── storage.ts                    # File upload/download
│   ├── lib/
│   │   ├── workflow-steps.ts             # Workflow config (CRITICAL #2)
│   │   ├── rentables.ts                  # Rentables config
│   │   └── validations.ts                # Zod schemas
│   ├── hooks/
│   │   ├── useAuth.ts                    # Firebase auth hook
│   │   ├── useApplicants.ts              # Real-time applicant data
│   │   ├── useInquiries.ts               # Real-time inquiry data
│   │   └── useStorage.ts                 # File upload hook
│   ├── store/
│   │   ├── authStore.ts                  # Zustand auth state
│   │   └── uiStore.ts                    # Modals, toasts, etc.
│   ├── types/
│   │   ├── applicant.ts
│   │   ├── inquiry.ts
│   │   └── user.ts
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Layout.tsx
│   │   │   └── ProtectedRoute.tsx        # Auth guard component
│   │   ├── ui/                           # Reusable components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── ...
│   │   ├── applicants/
│   │   │   ├── ApplicantForm.tsx
│   │   │   ├── ApplicantList.tsx
│   │   │   ├── ApplicantCard.tsx
│   │   │   ├── WorkflowChecklist.tsx     # (CRITICAL #3)
│   │   │   ├── WorkflowStep.tsx
│   │   │   ├── RentablesManager.tsx
│   │   │   └── DocumentsManager.tsx
│   │   └── inquiries/
│   │       ├── InquiryForm.tsx
│   │       ├── InquiryList.tsx
│   │       ├── InquiryCard.tsx
│   │       └── MonthlyInquiryView.tsx    # (CRITICAL #4)
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── ApplicantsList.tsx
│   │   ├── ApplicantDetail.tsx
│   │   ├── NewApplicant.tsx
│   │   └── InquiriesList.tsx
│   ├── utils/
│   │   ├── date.ts                       # date-fns helpers
│   │   └── helpers.ts
│   ├── App.tsx                           # Root with React Router
│   ├── main.tsx                          # Vite entry point
│   └── index.css                         # Tailwind directives
├── .env.local                            # Firebase keys (gitignored)
├── .env.example                          # Template
├── .gitignore
├── index.html                            # Vite HTML template
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts                        # Vite config (base path for GH Pages)
└── README.md
```

## Implementation Phases

### Phase 1: Foundation Setup (Days 1-2)

#### Day 1: Project Initialization
1. **Create Vite Project**
   ```bash
   npm create vite@latest leasing-assist -- --template react-ts
   cd leasing-assist
   ```

2. **Install Dependencies**
   ```bash
   npm install
   npm install firebase
   npm install react-router-dom
   npm install zustand
   npm install react-hook-form @hookform/resolvers zod
   npm install date-fns
   npm install framer-motion
   npm install react-hot-toast
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

3. **Configure Tailwind** (`tailwind.config.js`)
   ```js
   module.exports = {
     content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
     theme: {
       extend: {
         colors: {
           lavender: '#C8B6FF',
           mint: '#B4F8C8',
           peach: '#FFB4B4',
           'soft-yellow': '#FFF4B4',
           'pale-blue': '#B4D4FF',
         },
         fontFamily: {
           sans: ['Inter', 'Public Sans', 'sans-serif'],
           mono: ['Space Mono', 'JetBrains Mono', 'monospace'],
         },
         boxShadow: {
           'brutal': '4px 4px 0px rgba(0,0,0,0.8)',
           'brutal-hover': '6px 6px 0px rgba(0,0,0,0.8)',
           'brutal-active': '2px 2px 0px rgba(0,0,0,0.8)',
           'brutal-lg': '12px 12px 0px rgba(0,0,0,0.9)',
         },
         animation: {
           'pulse-glow': 'pulse-glow 2s infinite',
           'pulse-urgent': 'pulse-urgent 1.5s infinite',
         },
         keyframes: {
           'pulse-glow': {
             '0%, 100%': { boxShadow: '0 0 20px rgba(255, 180, 180, 0.4)' },
             '50%': { boxShadow: '0 0 30px rgba(255, 180, 180, 0.6)' },
           },
         },
       },
     },
   };
   ```

4. **Set Up Global Styles with Neo-Brutal Theme** (`src/index.css`)
   ```css
   @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Space+Mono:wght@400;700&display=swap');

   @tailwind base;
   @tailwind components;
   @tailwind utilities;

   :root {
     /* Color System */
     --color-lavender: #C8B6FF;
     --color-mint: #B4F8C8;
     --color-peach: #FFB4B4;
     --color-soft-yellow: #FFF4B4;
     --color-pale-blue: #B4D4FF;
     --color-black: #000000;
     --color-white: #FFFFFF;

     /* Time-based theme variables (default: afternoon) */
     --bg-primary: #FFFFFF;
     --glass-opacity: 0.15;
     --shadow-intensity: 0.8;
     --glow-intensity: 1.0;
   }

   /* Evening theme (6pm-12am) */
   body.theme-evening {
     --bg-primary: #1A1A2E;
     --glass-opacity: 0.25;
     --shadow-intensity: 0.95;
     --glow-intensity: 1.5;
   }

   /* Night theme (12am-6am) */
   body.theme-night {
     --bg-primary: #0F0F1E;
     --glass-opacity: 0.3;
     --shadow-intensity: 1.0;
     --glow-intensity: 2.0;
   }

   body {
     font-family: 'Inter', sans-serif;
     background: var(--bg-primary);
     transition: background 0.5s ease;
   }

   /* Reduced motion support */
   @media (prefers-reduced-motion: reduce) {
     *,
     *::before,
     *::after {
       animation-duration: 0.01ms !important;
       animation-iteration-count: 1 !important;
       transition-duration: 0.01ms !important;
     }
   }
   ```

4. **Configure Vite for GitHub Pages** (`vite.config.ts`)
   ```ts
   export default defineConfig({
     base: '/leasing_assist/',  // Your repo name
     build: { outDir: 'dist' }
   })
   ```

5. **Create Folder Structure & Design System Files**
   - Create all folders from project structure above
   - Create `src/utils/theme.ts` for time-based theme switching:
     ```typescript
     export const getTimeBasedTheme = () => {
       const hour = new Date().getHours();
       if (hour >= 6 && hour < 12) return 'morning';
       if (hour >= 12 && hour < 18) return 'afternoon';
       if (hour >= 18 && hour < 24) return 'evening';
       return 'night';
     };

     export const applyTheme = (theme: string) => {
       document.body.className = `theme-${theme}`;
     };
     ```
   - Create `src/components/ui/` folder with base components (Button, Card, Badge, Modal, Input)

#### Day 2: Firebase Setup & Authentication
1. **Create Firebase Project**
   - Go to https://console.firebase.google.com
   - Create new project "leasing-assist"
   - Enable Firestore Database (production mode for now)
   - Enable Authentication → Email/Password provider
   - Enable Storage

2. **Get Firebase Config**
   - Project Settings → Add web app
   - Copy config to `.env.local`:
     ```
     VITE_FIREBASE_API_KEY=...
     VITE_FIREBASE_AUTH_DOMAIN=...
     VITE_FIREBASE_PROJECT_ID=...
     VITE_FIREBASE_STORAGE_BUCKET=...
     VITE_FIREBASE_MESSAGING_SENDER_ID=...
     VITE_FIREBASE_APP_ID=...
     ```

3. **Create `src/firebase/config.ts`** (CRITICAL FILE #1)
   ```typescript
   import { initializeApp } from 'firebase/app';
   import { getAuth } from 'firebase/auth';
   import { getFirestore } from 'firebase/firestore';
   import { getStorage } from 'firebase/storage';

   const firebaseConfig = {
     apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
     // ... other config
   };

   export const app = initializeApp(firebaseConfig);
   export const auth = getAuth(app);
   export const db = getFirestore(app);
   export const storage = getStorage(app);
   ```

4. **Create Auth Service** (`src/firebase/auth.ts`)
   - `signUp(email, password, displayName)`
   - `signIn(email, password)`
   - `signOut()`
   - `onAuthStateChanged(callback)`

5. **Create `useAuth` Hook** (`src/hooks/useAuth.ts`)
   - Manages auth state with Zustand
   - Listens to Firebase auth changes
   - Returns: `{ user, loading, signIn, signUp, signOut }`

6. **Build Login Page**
   - Email/password form
   - Sign up option
   - Error handling

7. **Set up React Router**
   - Create `<ProtectedRoute>` wrapper
   - Routes: `/login`, `/dashboard`, `/applicants`, `/applicants/:id`, `/applicants/new`, `/inquiries`

8. **Create Basic Layout**
   - Navbar with user menu & sign out
   - Sidebar navigation
   - Main content area

### Phase 2: Applicant Processing (PRIMARY FEATURE - Days 3-7)

#### Day 3: Applicant CRUD Basics
1. **Define Types** (`src/types/applicant.ts`)
   ```typescript
   export interface Applicant {
     id: string;
     name: string;
     unit: string;
     dateApplied: Timestamp;
     moveInDate: Timestamp;
     concessionApplied: string;
     currentStep: number;
     status: 'in_progress' | 'approved' | 'completed' | 'cancelled';
     // ... rest
   }
   ```

2. **Create Firestore Service** (`src/firebase/firestore.ts`)
   ```typescript
   // Applicant CRUD
   export const createApplicant = async (data: Omit<Applicant, 'id'>) => { ... }
   export const getApplicants = () => query(collection(db, 'applicants'), ...)
   export const getApplicant = (id: string) => doc(db, 'applicants', id)
   export const updateApplicant = (id: string, data: Partial<Applicant>) => { ... }
   export const deleteApplicant = (id: string) => { ... }
   ```

3. **Create `useApplicants` Hook** (`src/hooks/useApplicants.ts`)
   - Uses Firestore `onSnapshot` for real-time updates
   - Returns: `{ applicants, loading, error, createApplicant, updateApplicant, deleteApplicant }`

4. **Build ApplicantForm Component**
   - Fields: Name, Unit, Date Applied, Move-In Date, Concession Applied
   - React Hook Form + Zod validation
   - Submit creates applicant with initialized workflow

5. **Build ApplicantList Component**
   - Table view with columns: Name, Unit, Status, Current Step, Last Updated
   - Search by name/unit
   - Filter by status
   - Sort by date
   - Click row → navigate to detail

6. **Create Pages**
   - `ApplicantsList.tsx` - Uses ApplicantList component
   - `NewApplicant.tsx` - Uses ApplicantForm component
   - `ApplicantDetail.tsx` - Detail view (placeholder for now)

#### Day 4: Workflow System Foundation
1. **Define Workflow Steps** (`src/lib/workflow-steps.ts`) (CRITICAL FILE #2)
   ```typescript
   export const WORKFLOW_STEPS = [
     { step: 1, name: "Upload Screening Documents to File", type: "document" as const },
     { step: 2, name: "Begin Income Verification - Mark Income Approved", type: "checkbox" as const },
     { step: 3, name: "Upload Verified Income to File", type: "document" as const },
     { step: 4, name: "Send Application Approved E-mail", type: "checkbox" as const },
     { step: 5, name: "Note rentable items for resident", type: "rentables" as const },
     { step: 6, name: "Upload Conditional Documents", type: "documents-group" as const },
     { step: 7, name: "Generate Lease", type: "checkbox" as const },
     { step: 8, name: "Collect Resident Signature", type: "checkbox" as const },
     { step: 9, name: "Countersign Lease", type: "checkbox" as const },
     { step: 10, name: "Upload Final Documents", type: "documents-group" as const }
   ] as const;

   export type WorkflowStepType = 'checkbox' | 'document' | 'rentables' | 'documents-group';
   ```

2. **Initialize Workflow on Applicant Creation**
   - Modify `createApplicant()` to add workflow object:
     ```typescript
     workflow: {
       '1': { stepName: WORKFLOW_STEPS[0].name, isCompleted: false, completedAt: null, completedBy: null, notes: '' },
       '2': { ... },
       // ... all 10 steps
     }
     ```

3. **Build WorkflowStep Component** (`src/components/applicants/WorkflowStep.tsx`)
   - Props: `stepNumber`, `stepData`, `isEnabled`, `onComplete`
   - Shows:
     - Step number & name
     - Checkbox (if enabled)
     - Completion status (✓ + timestamp + user if completed)
     - Notes textarea
     - Disabled state if previous step incomplete

4. **Build WorkflowChecklist Component** (CRITICAL FILE #3)
   - Maps over WORKFLOW_STEPS
   - Renders WorkflowStep for each
   - Implements sequential logic:
     ```typescript
     const isStepEnabled = (stepNumber: number) => {
       if (stepNumber === 1) return true;
       return applicant.workflow[String(stepNumber - 1)]?.isCompleted === true;
     };
     ```
   - Handles step completion with Firestore update

5. **Add Workflow to ApplicantDetail Page**
   - Show applicant basic info at top
   - WorkflowChecklist below
   - Real-time updates via `useApplicant(id)` hook

6. **Create `updateWorkflowStep` Function**
   - Uses Firestore transaction to prevent race conditions:
     ```typescript
     await runTransaction(db, async (transaction) => {
       const docRef = doc(db, 'applicants', applicantId);
       const docSnap = await transaction.get(docRef);
       transaction.update(docRef, {
         [`workflow.${stepNumber}.isCompleted`]: true,
         [`workflow.${stepNumber}.completedAt`]: serverTimestamp(),
         [`workflow.${stepNumber}.completedBy`]: currentUser.uid,
         currentStep: stepNumber,
         updatedAt: serverTimestamp()
       });
     });
     ```

#### Day 5: Rentables Management (Step 5)
1. **Define Rentables Config** (`src/lib/rentables.ts`)
   ```typescript
   export const RENTABLES = {
     parking: [
       { name: "Uncovered", price: 20 },
       { name: "Covered", price: 35 },
       { name: "Premium", price: 75 }
     ],
     storage: [
       { name: "Medium", price: 75 },
       { name: "Medium Plus", price: 85 },
       { name: "Large", price: 100 },
       { name: "X-Large", price: 125 }
     ]
   } as const;
   ```

2. **Build RentablesManager Component** (`src/components/applicants/RentablesManager.tsx`)
   - UI:
     - Dropdown: Item Type (Parking/Storage)
     - Dropdown: Item Name (filtered by type, shows price)
     - Number input: Quantity
     - Button: Add Item
     - List of added rentables with Remove button
     - Total monthly cost display
   - State: Local form state + applicant.rentables from Firestore
   - Add rentable: Updates Firestore `rentables` array using `arrayUnion`
   - Remove rentable: Uses `arrayRemove`

3. **Integrate into WorkflowStep**
   - When `step.type === 'rentables'`, render RentablesManager
   - Step is complete when at least one rentable added (or manual checkbox)

4. **Add Rentable Functions to firestore.ts**
   ```typescript
   export const addRentable = async (applicantId: string, rentable: Rentable) => {
     await updateDoc(doc(db, 'applicants', applicantId), {
       rentables: arrayUnion(rentable)
     });
   };
   ```

#### Day 6: Document Upload System
1. **Create Storage Service** (`src/firebase/storage.ts`)
   ```typescript
   export const uploadDocument = async (
     applicantId: string,
     documentType: string,
     file: File
   ): Promise<string> => {
     const storageRef = ref(storage, `applicants/${applicantId}/${documentType}/${file.name}`);
     await uploadBytes(storageRef, file);
     return await getDownloadURL(storageRef);
   };

   export const deleteDocument = async (fileUrl: string) => {
     const fileRef = ref(storage, fileUrl);
     await deleteObject(fileRef);
   };
   ```

2. **Build FileUpload Component** (`src/components/ui/FileUpload.tsx`)
   - Drag-and-drop zone
   - File input fallback
   - File type validation (PDF, JPG, PNG, DOCX)
   - Size limit validation (10MB)
   - Upload progress indicator
   - Preview uploaded file name

3. **Build DocumentsManager Component** (`src/components/applicants/DocumentsManager.tsx`)
   - Props: `applicantId`, `documentType`, `allowMultiple`
   - Shows:
     - FileUpload component
     - List of uploaded documents (from `applicant.documents[documentType]`)
     - Download button (opens fileUrl)
     - Delete button
   - On upload:
     1. Upload file to Firebase Storage
     2. Get download URL
     3. Update Firestore document:
        ```typescript
        [`documents.${documentType}`]: {
          status: 'complete',
          fileUrl: downloadUrl,
          fileName: file.name,
          uploadedAt: serverTimestamp(),
          uploadedBy: currentUser.uid
        }
        ```

4. **Create `useStorage` Hook** (`src/hooks/useStorage.ts`)
   - Manages upload state (uploading, progress, error)
   - Returns: `{ uploadFile, deleteFile, uploading, progress, error }`

#### Day 7: Conditional & Final Documents (Steps 6 & 10)
1. **Step 6: Conditional Documents**
   - Build `ConditionalDocumentsStep` component
   - Four documents with Complete/N/A toggle:
     - Guarantor Document
     - Rabies Document
     - ESA Document
     - HUD Document
   - Each shows:
     - Radio buttons: Complete / N/A
     - If Complete: FileUpload + DocumentsManager
     - If N/A: Just mark as N/A in Firestore
   - Step complete when all 4 are either Complete (with file) or N/A

2. **Step 10: Final Documents**
   - Build `FinalDocumentsStep` component
   - Sub-steps:
     a. **Insurance Sent to Assurant** - Checkbox only
     b. **Xcel Account Number** - Text input field
     c. **Cashier's Check** - File upload (single file)
     d. **Balance Sheet Signed & Checklist** - File upload (single file)
     e. **Inventory & Condition Form** - File upload + date validation
        - Shows warning if uploaded < 2 days after move-in date
        - Can still upload, just warns user
   - Step complete when all sub-steps complete

3. **Update WorkflowStep Component**
   - Add cases for `type === 'documents-group'`
   - Render ConditionalDocumentsStep or FinalDocumentsStep based on step number

4. **Test End-to-End Workflow**
   - Create new applicant
   - Complete all 10 steps in order
   - Verify sequential logic works
   - Test file uploads/downloads
   - Test rentables add/remove
   - Verify Firestore data structure correct

### Phase 3: Resident Inquiries (SECONDARY FEATURE - Days 8-9)

#### Day 8: Basic Inquiry System
1. **Define Types** (`src/types/inquiry.ts`)
   ```typescript
   export interface Inquiry {
     id: string;
     name: string;
     unitNumber: string;
     inquiryNote: string;
     priority: 'high' | 'medium' | 'low';
     status: 'open' | 'in_progress' | 'completed';
     resolution: string;
     createdMonth: string; // 'YYYY-MM'
     createdAt: Timestamp;
     updatedAt: Timestamp;
     completedAt: Timestamp | null;
     assignedTo: string | null;
     createdBy: string;
   }
   ```

2. **Add Inquiry Functions to firestore.ts**
   ```typescript
   export const createInquiry = async (data: Omit<Inquiry, 'id' | 'createdAt' | 'updatedAt' | 'createdMonth'>) => {
     await addDoc(collection(db, 'inquiries'), {
       ...data,
       createdMonth: format(new Date(), 'yyyy-MM'),
       createdAt: serverTimestamp(),
       updatedAt: serverTimestamp()
     });
   };
   // ... getInquiries, updateInquiry, deleteInquiry
   ```

3. **Create `useInquiries` Hook** (`src/hooks/useInquiries.ts`)
   - Real-time subscription with filters:
     ```typescript
     const q = query(
       collection(db, 'inquiries'),
       where('createdMonth', '==', currentMonth),
       orderBy('priority', 'asc'),
       orderBy('createdAt', 'desc')
     );
     ```

4. **Build InquiryForm Component**
   - Fields: Name, Unit Number, Inquiry/Note, Priority (default: Medium)
   - Date/Time auto-set on backend
   - Submit creates inquiry

5. **Build InquiryCard Component**
   - Shows:
     - Priority badge (color-coded: red=high, yellow=medium, green=low)
     - Name & Unit
     - Inquiry note (truncated)
     - Created date
     - Status badge
     - Action buttons: Mark In Progress, Mark Complete, Delete
   - Click card → expand to show:
     - Full inquiry note
     - Resolution textarea (if completing)
     - Save button

6. **Build InquiriesList Page**
   - Uses MonthlyInquiryView component (create placeholder)
   - "New Inquiry" button → modal with InquiryForm

#### Day 9: Monthly Organization & Migration
1. **Build MonthlyInquiryView Component** (CRITICAL FILE #4)
   - Shows tabs for months:
     - Current month (default selected)
     - Previous month(s) if have inquiries
     - Future months if exist
   - Each tab shows InquiryCard list filtered by that month
   - Filter buttons: All / High / Medium / Low priority
   - Status filter: Open / In Progress / Completed
   - Sort options: Priority, Date Created, Date Updated

2. **Create Monthly Migration Function**
   ```typescript
   export const migrateMonthlyInquiries = async () => {
     const currentMonth = format(new Date(), 'yyyy-MM');
     const previousMonth = format(subMonths(new Date(), 1), 'yyyy-MM');

     const q = query(
       collection(db, 'inquiries'),
       where('createdMonth', '==', previousMonth),
       where('status', '!=', 'completed')
     );

     const snapshot = await getDocs(q);
     const batch = writeBatch(db);

     snapshot.forEach((doc) => {
       batch.update(doc.ref, {
         createdMonth: currentMonth,
         priority: 'high',
         updatedAt: serverTimestamp()
       });
     });

     await batch.commit();
   };
   ```

3. **Add Migration UI**
   - Button in InquiriesList: "Migrate Previous Month"
   - Shows count of inquiries to migrate
   - Confirmation modal before running
   - Success toast after completion

4. **Completed Inquiries Archive**
   - Separate tab/section for completed items
   - Filter by month
   - Read-only view (can delete but not edit)

### Phase 4: Multi-User & Polish (Days 10-11)

#### Day 10: Multi-User Features
1. **User Assignment**
   - Add user selector dropdown to ApplicantForm
   - Show assigned user in ApplicantList
   - Filter applicants by assigned user
   - Same for inquiries

2. **Activity Logging**
   - Create `logActivity` function:
     ```typescript
     await addDoc(collection(db, 'activityLog'), {
       userId: currentUser.uid,
       userName: currentUser.displayName,
       entityType: 'applicant',
       entityId: applicantId,
       action: 'completed_workflow_step',
       details: { stepNumber: 5, stepName: '...' },
       createdAt: serverTimestamp()
     });
     ```
   - Log on:
     - Applicant created/updated/deleted
     - Workflow step completed
     - Rentable added/removed
     - Document uploaded/deleted
     - Inquiry created/updated/completed

3. **Activity Feed Component**
   - Shows recent activity (last 50 items)
   - Real-time updates
   - Format: "User X completed Step 3 for Applicant Y" (2 mins ago)

4. **Real-time Sync Testing**
   - Open app in 2 browser windows with different users
   - Create applicant in window 1 → should appear in window 2
   - Complete workflow step → should update in other window
   - Test conflicts (both users editing same item)

#### Day 11: Dashboard & UI Polish
1. **Dashboard Home Page**
   - Statistics cards:
     - Total Active Applicants
     - Applicants by Status (pie chart or bars)
     - High Priority Inquiries Count
     - Average Workflow Completion Time
   - Recent Activity feed
   - Quick actions: New Applicant, New Inquiry

2. **Loading States**
   - Skeleton loaders for lists
   - Spinner for forms
   - Disable buttons during async operations

3. **Error Handling**
   - Toast notifications for errors (use `react-hot-toast` or similar)
   - Error boundaries for component crashes
   - Retry logic for failed uploads

4. **Responsive Design**
   - Mobile-friendly (works on tablets)
   - Sidebar collapses on mobile
   - Tables become cards on small screens

5. **Accessibility**
   - Keyboard navigation
   - ARIA labels
   - Focus management

### Phase 5: Deployment (Days 12-13)

#### Day 12: GitHub Pages Setup
1. **Create GitHub Actions Workflow** (`.github/workflows/deploy.yml`)
   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches: [ main ]

   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: 18
         - run: npm ci
         - run: npm run build
         - uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

2. **Set GitHub Secrets**
   - Go to repo Settings → Secrets → Actions
   - Add all `VITE_FIREBASE_*` env vars as secrets
   - Update workflow to inject env vars during build

3. **Enable GitHub Pages**
   - Repo Settings → Pages
   - Source: gh-pages branch
   - URL will be: `https://yourusername.github.io/leasing_assist/`

4. **Update Vite Base Path**
   - In `vite.config.ts`, ensure `base: '/leasing_assist/'` matches repo name

#### Day 13: Firestore Security & Testing
1. **Firestore Security Rules**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read: if request.auth != null;
         allow write: if request.auth.uid == userId;
       }

       match /applicants/{applicantId} {
         allow read: if request.auth != null;
         allow create: if request.auth != null;
         allow update, delete: if request.auth != null;
       }

       match /inquiries/{inquiryId} {
         allow read, write: if request.auth != null;
       }

       match /activityLog/{logId} {
         allow read: if request.auth != null;
         allow create: if request.auth != null;
       }
     }
   }
   ```

2. **Firebase Storage Rules**
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /applicants/{applicantId}/{allPaths=**} {
         allow read: if request.auth != null;
         allow write: if request.auth != null
                      && request.resource.size < 10 * 1024 * 1024  // 10MB
                      && request.resource.contentType.matches('image/.*|application/pdf|application/vnd.openxmlformats-officedocument.*');
       }
     }
   }
   ```

3. **Production Testing**
   - Test with real Firebase project (not emulator)
   - Create test accounts
   - Upload real documents
   - Test all workflows end-to-end
   - Test on mobile devices
   - Cross-browser testing

4. **Documentation**
   - Update README with:
     - Setup instructions
     - How to run locally
     - Firebase configuration steps
     - Deployment process
   - Create user guide (simple PDF or MD file)

## Critical Implementation Details

### Workflow Sequential Logic
```typescript
// Step is only enabled if previous step is completed
const isStepEnabled = (stepNumber: number, workflow: Record<string, WorkflowStepData>) => {
  if (stepNumber === 1) return true;
  const prevStep = workflow[String(stepNumber - 1)];
  return prevStep?.isCompleted === true;
};
```

### Monthly Inquiry Migration
- Runs manually (button click) or can be automated with scheduled Cloud Function
- Finds all incomplete inquiries from previous month
- Updates `createdMonth` to current month
- Sets `priority` to 'high'
- Uses Firestore batch writes for efficiency

### File Upload Flow
1. User selects file → validate type/size
2. Upload to Firebase Storage: `applicants/{applicantId}/{documentType}/{filename}`
3. Get download URL
4. Update Firestore document with file metadata
5. On delete: Remove from Storage + clear Firestore metadata

### Real-time Subscriptions
Use Firestore `onSnapshot` for real-time updates:
```typescript
const unsubscribe = onSnapshot(
  query(collection(db, 'applicants'), orderBy('updatedAt', 'desc')),
  (snapshot) => {
    const applicants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setApplicants(applicants);
  }
);
// Clean up on unmount
return () => unsubscribe();
```

## Security Considerations

1. **Firebase Auth**: All users must be authenticated
2. **Firestore Rules**: Enforce read/write permissions at database level
3. **Storage Rules**: Validate file types and sizes server-side
4. **Environment Variables**: Keep Firebase config in `.env.local` (gitignored)
5. **Activity Log**: Track all changes for audit trail
6. **No Sensitive Data**: Don't store SSN, credit cards, etc. in Firestore

## Backup & Data Safety

1. **Firestore Backups**:
   - Firebase automatically backs up Firestore
   - Can export collections manually via Firebase Console
   - Consider scheduled exports for critical data

2. **Storage Backups**:
   - Firebase Storage has redundancy built-in
   - Important: Don't delete files without user confirmation

3. **Activity Log**: Never delete, provides audit trail

## Success Metrics

After deployment:
- Track applicant workflow completion rate
- Monitor average time per workflow step
- Inquiry resolution time by priority
- User engagement (logins, actions per session)
- Firebase quota usage (reads/writes per day)

## Fallback Plans

### If Firebase Free Tier Exceeded
- Upgrade to Firebase Blaze (pay-as-you-go)
- Optimize queries (fewer real-time listeners)
- Add pagination to lists

### If GitHub Pages Has Issues
- Deploy to Firebase Hosting instead (also free)
- Or use Netlify, Vercel (both free tiers available)

## Critical Files to Create First

1. **src/firebase/config.ts** - Firebase initialization
2. **src/lib/workflow-steps.ts** - Workflow configuration
3. **src/utils/theme.ts** - Time-based theme system
4. **src/components/ui/Button.tsx** - Neo-brutal button component with Framer Motion
5. **src/components/ui/Card.tsx** - Glass card component with depth/hover effects
6. **src/components/applicants/WorkflowChecklist.tsx** - Main workflow UI with micro-interactions
7. **src/components/inquiries/MonthlyInquiryView.tsx** - Monthly organization with card animations
8. **src/hooks/useApplicants.ts** - Real-time applicant data hook
9. **src/hooks/useInquiries.ts** - Real-time inquiry data hook

## Design Implementation Checklist

### Day 1 Additions
- [ ] Configure Tailwind with Neo-Brutal color palette
- [ ] Set up global CSS with time-based theme variables
- [ ] Import Google Fonts (Inter, Space Mono)
- [ ] Create theme utility functions
- [ ] Build base UI components (Button, Card, Badge, Input, Modal)

### Throughout Development
- [ ] **All Buttons**: 3px black border, lavender background, brutal shadow, squish animation
- [ ] **All Cards**: Glass background with blur, 3px border, hover lift effect
- [ ] **Priority Badges**: Monospace font, rounded, color-coded with pulses for HIGH
- [ ] **Workflow Steps**: Sequential enable/disable with opacity transitions, checkmark morphing
- [ ] **File Uploads**: Magnetic catch animation, progress bar morphing, pop success
- [ ] **Modals**: Backdrop blur, glass content, spring scale-in animation
- [ ] **Lists**: Stagger animations on load, fly-to-position on sort/filter
- [ ] **Forms**: Input focus states with lavender glow
- [ ] **Toasts**: Slide-in from top-right with glass effect

### Animation Timing Reference
- Button press: 150ms cubic-bezier(0.4, 0, 0.2, 1)
- Card hover: 300ms ease
- Checkmark morph: 400ms spring physics
- Modal open: 500ms spring
- List stagger: 50ms delay per item
- Glow pulse: 2s infinite

## Final Notes

### Implementation Priorities
- **Primary Focus**: Applicant Processing workflow (Days 3-7)
- **Secondary Focus**: Resident Inquiries with monthly migration (Days 8-9)
- **Design Focus**: Neo-Brutal Cute-alism aesthetic throughout
- **Estimated Timeline**: 13 days to production-ready deployment

### Technical Specs
- **Team Size**: Designed for 2-10 concurrent users
- **Scalability**: Firebase free tier handles 50K reads/day (plenty for small team)
- **Cost**: $0 with free tiers (GitHub Pages + Firebase Spark plan)
- **Browser Support**: Modern browsers (Chrome, Edge, Firefox, Safari)
- **Performance**: Glassmorphism optimized for desktop, simplified on mobile

### Design Deliverables
- Neo-Brutalist UI with 3-4px black borders on all elements
- Soft pastel palette (lavender, mint, peach, soft yellow, pale blue)
- Time-based dynamic theming (morning → evening → night transitions)
- Micro-interactions on every user action (clicks, hovers, completions)
- Glassmorphism with frosted blur effects on overlays
- Chromatic urgency system (high priority = pulsing glow)
- "Hyper-physical" glass table layout with depth and shadows
- Monospace typography for data, sans-serif for headings
- Framer Motion animations for delightful feedback loops

### Success Criteria
✅ Zero hosting costs
✅ Professional Neo-Brutal aesthetic
✅ Real-time multi-user collaboration
✅ 10-step sequential workflow with file uploads
✅ Monthly inquiry migration with priority tracking
✅ Time-based theme that adapts throughout the day
✅ Micro-interactions that make the app feel "alive"
✅ Accessibility support (reduced motion, high contrast, screen readers)
✅ Mobile-responsive with simplified glass effects
✅ Deploy-ready on GitHub Pages with Firebase backend
