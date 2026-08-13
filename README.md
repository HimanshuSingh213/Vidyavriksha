# Student Dashboard Platform

A modern, high-performance, and feature-rich Student Dashboard built with **Next.js 14 (App Router)** and **MongoDB**. Designed from the ground up to help university students manage their academic lifecycle, track detailed grades, and organize weekly schedules with precision. 

The platform features a proprietary calculation engine built to strictly adhere to university grading standards (including GGSIPU Ordinance 11), ensuring that Earned Credits, SGPA, and CGPA are always computed with absolute accuracy.

---

## 🌟 Core Features

### 1. Interactive Academic Vault
*   **Comprehensive Subject Tracking:** Manage semesters, subjects, credits, and distinguish between theory and lab courses.
*   **Granular Marks Management:** Track internal assessments (Minor 1, Minor 2, Internal) and External End-Semester marks independently.
*   **Smart Evaluation Logic:** The system intelligently distinguishes between "Unevaluated" subjects and "Backlogs/Fails". Subjects pending examination are marked as "N/A" and dynamically excluded from the CGPA denominator to prevent artificial grade deflation.
*   **PDF Generation:** Generate pixel-perfect, downloadable semester marksheets locally using `html2canvas-pro` and `jspdf`.

### 2. Intelligent Timetable Manager
*   **Visual Weekly Schedule:** A highly responsive grid-based view of the student's entire week.
*   **Streamlined Slot Creation:** When adding class slots, the system automatically pre-fills the subject's default instructor and assigned room, significantly reducing data entry friction.
*   **Unscheduled Subject Alerts:** The system actively monitors the active semester's course load and flags subjects that have not yet been placed on the weekly schedule.

### 3. Data-Driven Analytics & Simulator
*   **Performance Visualization:** Leverages **Recharts** to generate dynamic, interactive graphs including:
    *   Radial charts for overall aggregate performance.
    *   Stacked bar charts comparing internal vs. external marks across subjects.
    *   Line graphs tracking SGPA progression across multiple semesters.
*   **Grade Simulator:** An advanced "what-if" analysis tool allowing students to simulate hypothetical future grades and determine exactly what they need to score to hit their target CGPA.

### 4. Smart Settings & Personalization
*   **Dynamic Configurations:** Configure university grading scales (e.g., 10-point scale), define a target CGPA goal, and set the currently active semester to instantly re-contextualize the entire dashboard.

---

## 🛠️ Technology Stack

*   **Core Framework:** Next.js 14 (App Router)
*   **Backend & Data Mutation:** Next.js Server Actions
*   **Database:** MongoDB (Mongoose ODM)
*   **Authentication:** NextAuth.js
*   **Styling & UI:** Tailwind CSS, Lucide React (Icons)
*   **Animations:** Framer Motion
*   **Data Visualization:** Recharts
*   **Export Utilities:** html2canvas-pro, jspdf

---

## 🏗️ Technical Architecture & Optimization

### Server-First Architecture
The application heavily utilizes the Next.js App Router paradigm. By relying on React Server Components (RSC), the platform ships significantly less JavaScript to the client, improving initial load times and overall performance.

### Data Mutation via Server Actions
All database operations (creating semesters, updating marks, deleting subjects) are handled natively through asynchronous Next.js Server Actions. This eliminates the need for maintaining complex, decoupled REST API routes and allows for seamless type-safe data handling.

### Performance & Caching Strategy
To ensure that academic calculations (like tweaking marks and instantly seeing the CGPA update) feel real-time and snappy, the architecture consciously bypasses aggressive intermediate caching layers (such as Next.js `unstable_cache`). By connecting to MongoDB directly and leveraging lean Mongoose queries, the platform achieves zero-latency data reflection across the UI without stale-state bugs.
