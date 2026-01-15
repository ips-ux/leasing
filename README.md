# Leasing Assist

A property management leasing assistance tool with a vibrant Neo-Brutal "Cute-alism" design aesthetic.

## 🎨 Design System

**IMPORTANT**: Before making any UI changes, read the **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)** file.

This project follows strict design standards:
- Neo-Brutal aesthetic with sharp edges and brutal shadows
- Glassmorphism effects with backdrop blur
- Pastel color palette (lavender, mint, peach, soft yellow, pale blue)
- Time-based dynamic gradient background
- NO rounded corners on components (except ContentContainer)
- NO neumorphic soft shadows

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Firebase Setup

1. Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** → Email/Password provider
3. Enable **Firestore Database** (start in production mode)
4. Copy your Firebase config from Project Settings → Add web app

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_app_id
```

> **Note**: Never commit `.env.local` to version control. It's already in `.gitignore`.

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to see the app.

## 📦 Tech Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Tailwind CSS v4** - Styling
- **Framer Motion** - Animations
- **React Router v7** - Client-side routing
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Zustand** - State management

### Backend
- **Firebase Authentication** - User authentication
- **Firestore** - NoSQL database
- **Firestore Security Rules** - Access control

### Build & Deploy
- **GitHub Pages** - Static hosting (free)
- **GitHub Actions** - CI/CD (planned)

## 🏗️ Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   └── layout/          # Layout components
├── index.css            # Tailwind + custom utilities
└── App.tsx              # Main application
```

## 📝 Development Status

### ✅ Completed (Day 1-3)

**Day 1-2: Foundation & Authentication**
- ✓ Project setup (Vite + React 19 + TypeScript)
- ✓ Design system implementation (Neo-Brutal "Cute-alism")
- ✓ Core UI components (Button, Card, Badge, Input, Modal, DatePicker)
- ✓ Dynamic gradient wave background with time-based lightness
- ✓ Glassmorphic content container
- ✓ Neo-brutal aesthetic with sharp edges and brutal shadows
- ✓ Firebase Authentication integration
- ✓ Login/Signup pages
- ✓ Protected routes with ProtectedRoute component
- ✓ Zustand auth store with real-time Firebase sync
- ✓ Navbar with user menu and sign out
- ✓ Sidebar navigation
- ✓ Layout wrapper (Navbar + Sidebar + Content)
- ✓ Dashboard placeholder page

- [✓] **Day 3: Applicant CRUD Basics**
  - [✓] Firestore Service (`src/firebase/firestore.ts`)
  - [✓] `useApplicants` Hook
  - [✓] Applicant List & Detail Views (Refactored to List View)
  - [✓] Create/Edit Forms

- [x] **Day 4: Workflow System Foundation**
  - [✓] `useApplicant` Hook (Single Applicant)
  - [✓] `WorkflowStep` Component (Sub-steps, Notes)
  - [✓] `WorkflowChecklist` Component (Progress Tracking)
  - [✓] 6-Step Workflow Configuration (Sub-checkboxes, Textboxes, N/A logic)
  - [✓] Integration with Applicant Detail Page

### 🔄 Next Steps (Day 4+)
- Add "Leasing Professional" field to new applicant form. Dispaly this at the top of the applicant form once we create the applicant.
- Include the ability to edit the initial "New Applicant" fields once the applicant has been created. (Name, Unit Number, Date Applied, Move-In Date & Concession Applied, Leasing Professional)
- "Promote to Resident": new required button placed in center of page between "Move-In Prep" and "Post Move-in". This locks the previous sections of the checklist and finalizes the applicant entry in the system. "Post Move-In" checklist items cannot be started until this has been clicked. This button cannot be clicked until all previous required items are completed.
- "Cancel Applicant": new button at the top of our applicant checklist that can show up in the bottom right corner of our applicant information window. Smaller in size than our other buttons (we don't want people clicking it accidentally). This should prompt a custom modal warning to pop up asking if the user is sure they want to cancel the application and notifying them that they'll need to provide a reason for cancelling. Upon confirmation, another custom modal will appear asking for "Reason For Cancelling" - once submitted, the applicants list entry should show visibly "cancelled" and be greyed out, with the cancellation reason listed in the at a glance info. Once cancelled, the "Cancel Applicant" button should be replaced with "Restore Applicant" and "Remove Entry" buttons that reverse the action, or removes the entry from the database entirely. "Remove Entry" will trigger another warning modal asking if the user is sure they want to remove the entire entry from the system.
- Resident inquiry tracking with monthly migration
- Add "Copy HTML" and "Copy Text" to e-mail list items on applicant checklist
- Add "Set Templates" feature to edit e-mail templates. Needs to show 2 columns, Text formatted view & HTML view
- Dashboard statistics and recent activity logging


## 🎯 Component Library

All components follow the Neo-Brutal design system. See [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for detailed specifications.

### Available Components

- **Button** - Primary, secondary, danger variants
- **Card** - Glassmorphic cards with priority levels (high/medium/low)
- **Badge** - Status indicators with color coding
- **Input** - Form inputs with error states
- **DatePicker** - Hybrid native date input with custom calendar popover, month navigation, and visual selection
- **Modal** - Spring-animated modals with backdrop blur
- **GradientBackground** - Time-based SVG wave gradient background
- **ContentContainer** - Main content wrapper with glass effect

## 🛠️ Build & Deploy

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

**Deployment**: Configured for GitHub Pages (see deployment plan for setup)

## 📖 Documentation

- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - Complete design system documentation
- [Implementation Plan](C:/Users/RJ's PC/.claude/plans/gentle-dancing-origami.md) - Project roadmap

## 🎨 Color Palette

```
Lavender:     #C8B6FF
Mint:         #B4F8C8
Peach:        #FFB4B4
Soft Yellow:  #FFF4B4
Pale Blue:    #B4D4FF
Black:        #000000
White:        #FFFFFF
```

## ⚡ Performance

- Optimized animations (100ms buttons, 200ms cards)
- Respects `prefers-reduced-motion`
- Lazy-loaded components (planned)
- Code splitting (planned)

## 🔧 Configuration

### Tailwind CSS v4
Custom utilities are defined in `src/index.css` using `@layer utilities`. No JavaScript config needed.

### PostCSS
```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

## 🤝 Contributing

When contributing to this project:
1. **Read [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) first**
2. Follow the established design patterns
3. Maintain sharp edges (no rounding except ContentContainer)
4. Use brutal shadows, not soft/neumorphic shadows
5. Stick to the pastel color palette
6. Keep animations within specified timings

## 📄 License

This project is for internal use.

---

**Note to Future Developers**: The design system is intentionally strict and detailed. This ensures visual consistency and prevents design drift. Please respect the established patterns and consult DESIGN_SYSTEM.md before making UI changes.
