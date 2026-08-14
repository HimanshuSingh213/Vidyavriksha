# Student Dashboard Platform

A modern, high-performance, and feature-rich Student Dashboard built with Next.js (App Router) and MongoDB. Designed from the ground up to help university students manage their academic lifecycle, track detailed grades, and organize weekly schedules with precision.

The platform features a computational grading engine built to strictly adhere to university grading standards (GGSIPU Ordinance 11), ensuring that Earned Credits, SGPA, and CGPA are always computed with absolute accuracy.

---

## Core Features

### 1. Interactive Academic Vault
* Comprehensive Subject Tracking: Manage semesters, subjects, credits, and distinguish between theory and lab courses.
* Granular Marks Management: Track internal assessments (Minor 1, Minor 2, Internal) and External End-Semester marks independently.
* Dynamic Evaluation Logic: Distinguishes between evaluated subjects and pending courses, ensuring ongoing semesters do not artificially deflate historical GPA.
* PDF Marksheet Exports: Generate pixel-perfect, downloadable semester marksheets locally using html2canvas-pro and jspdf.

### 2. Multi-Day & Multi-Slot Timetable Engine
* Visual Weekly Schedule: Responsive grid-based view of the student's entire week with real-time day tracking.
* Multi-Day & Multi-Timing Scheduler: Schedule classes across multiple days (e.g., Monday, Wednesday, Friday) and add multiple distinct timeslots (e.g., theory lectures and practical labs) in a single batch operation.
* Unscheduled Subject Detection: Automatically identifies registered subjects for the active semester that lack scheduled slots and provides single-click scheduling workflows.

### 3. Data-Driven Analytics & Grade Simulator
* Performance Visualization: Dynamic charting powered by Recharts, including radial progress gauges, stacked internal vs. external bar charts, and multi-semester SGPA progression trends.
* Target CGPA Simulator: An interactive simulation tool that projects required future grades based on past performance and target academic milestones.

### 4. Personalization & Configuration
* Dynamic Preferences: Configure university grading scales, set custom target CGPA thresholds, and update active semester contexts.
* Direct Server Architecture: Powered exclusively by Next.js Server Actions for fast, secure mutations with immediate UI revalidation.

---

## Technology Stack

* Framework: Next.js (App Router, Server Actions)
* Database: MongoDB with Mongoose ODM
* Authentication: NextAuth.js
* Styling & UI: Tailwind CSS, Lucide React
* Animations: Framer Motion
* Data Visualization: Recharts
* Export Utilities: html2canvas-pro, jspdf

---

## Technical Architecture

### Server-First App Router Architecture
The application leverages React Server Components (RSC) to minimize client-side JavaScript bundle sizes and ensure rapid initial page loads.

### Direct Database Execution
To maximize responsiveness and eliminate stale data artifacts, data fetching communicates directly with MongoDB using lean queries. State mutations use Next.js Server Actions coupled with targeted layout revalidation (`revalidatePath`), delivering real-time UI updates without the overhead of client-side request waterfalls.

### Ordinance 11 Grade Computation
The GPA engine adheres to GGSIPU Ordinance 11 regulations:
* Grade O (Outstanding): 90 - 100 Marks (10 Grade Points)
* Grade A+ (Excellent): 75 - 89 Marks (9 Grade Points)
* Grade A (Very Good): 65 - 74 Marks (8 Grade Points)
* Grade B+ (Good): 55 - 64 Marks (7 Grade Points)
* Grade B (Above Average): 50 - 54 Marks (6 Grade Points)
* Grade C (Average): 45 - 49 Marks (5 Grade Points)
* Grade P (Pass): 40 - 44 Marks (4 Grade Points)
* Grade F (Fail): < 40 Marks (0 Grade Points)
