# Vidyavriksha 🌳

*The Engineer's Command Center for Academic Analytics*

Vidyavriksha is a commercial-grade SaaS platform built for engineering students to replace scattered spreadsheets and generic student apps. It serves as a centralized, data-driven control panel to track CGPA, manage daily attendance, log granular marks, and visualize semester trajectories with precision.

## 🚀 Tech Stack

- **Framework:** Next.js (App Router)
- **Database:** MongoDB & Mongoose
- **Authentication:** Auth.js (NextAuth) via Google/Zoho
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Charts:** Recharts 
- **UI Components:** shadcn/ui & Aceternity UI

## 🎨 Design System: "Pure Tech"

The UI relies on a functional, data-heavy engineer's aesthetic. We strictly avoid playful styles, cartoonish elements, and generic AI gradients. 

- **Background:** Deep obsidian `#080A0C`) to reduce eye strain during long sessions.
- **Surfaces (Glassmorphism):** Frosted glass panels `bg-white/[0.02]` with `backdrop-blur-xl`).
- **Borders:** Razor-thin and translucent `border-white/[0.08]`).
- **Primary Accent:** Solid Cobalt Blue `#2D5BFF`) for high-contrast action states.
- **Typography:** `Inter` or `Geist Sans` for UI readability, paired strictly with `JetBrains Mono` for all numeric data, grades, and code.

## ✨ Core Features

1. **The Command Center:** A bento-grid dashboard featuring live CGPA tracking, a target deficit calculator, and a daily schedule overview.
2. **Daily Operations:** A 7-day interactive timetable with live class highlighting and 1-click attendance tracking (Attended/Missed/Cancelled).
3. **The Academic Vault:** A granular, semester-wise database mapping out subjects, teacher details, and specific breakdowns of internal, minor, and end-semester marks.
4. **Deep Analytics:** Visual charts mapping internal vs. external exam performance and historical SGPA trend lines.

## 🗂️ Architecture & Folder Structure

This project follows a strict separation of concerns, utilizing Next.js Serverless architecture and cached MongoDB connections.

```text

vidyavriksha/

├── app/                        # Next.js App Router (Frontend & Backend API)

│   ├── (auth)/                 # Grouped routes for Login/Register pages

│   ├── api/                    # Serverless Backend Endpoints

│   │   ├── auth/[...nextauth]/ # Auth.js API route

│   │   └── subjects/           # CRUD API for subjects & marks

│   ├── dashboard/              # Main protected application routes

│   │   ├── analytics/          

│   │   ├── timetable/          

│   │   └── page.js             # Dashboard Command Center

│   ├── layout.js               # Root layout (Providers & Fonts)

│   └── page.js                 # Landing Page

│

├── components/                 # Reusable React UI Elements

│   ├── ui/                     # Base elements (shadcn/ui buttons, inputs, modals)

│   ├── layout/                 # Sidebar, Top Navigation

│   └── dashboard/              # Complex widgets (CgpaCard, TimetableGrid)

│

├── lib/                        # Utilities & Configs

│   ├── db.js                   # Cached MongoDB connection logic

│   └── utils.js                # Helper functions (Tailwind merge, grade calculation)

│

├── models/                     # MongoDB Mongoose Schemas

│   ├── User.js                 # Extended user profile (Target CGPA, settings)

│   └── Subject.js              # Core schema (Subject info, marks ledger, attendance)

│

├── public/                     # Static assets (Logos, icons)

├── .env.local                  # Environment variables (MongoDB URI, Auth secrets)

├── tailwind.config.js          # Tailwind theme and custom colors

└── package.json                # Project dependencies
```

