# Specification: MVP Core - Intelligent Scheduling Engine & Foundation

## 1. Overview
Build the foundational MVP for the "Solo Dev Master Scheduler". This includes the full project scaffolding, the database schema for the 4-layer hierarchy, the interactive "Wizard" for creating the initial plan, and the "Today's Cockpit" dashboard.

## 2. Technical Requirements
*   **Framework**: Nuxt 3 (SSR Mode).
*   **Language**: TypeScript.
*   **Styling**: Vanilla CSS (CSS Variables for theming, `backdrop-filter` for glassmorphism).
*   **Database**: Turso (SQLite) via `libSQL` client.
*   **Auth**: Clerk (via `vue-clerk` or Nuxt module).
*   **Deployment**: Vercel.

## 3. Database Schema (The 4-Layer Hierarchy)
We need to store the following entities in Turso:
*   **L1 - NorthStar**: Top-level annual goals (e.g., "Revenue $1M").
*   **L2 - Milestone**: Strategic checkpoints (e.g., "MVP Launch").
*   **L3 - Domain**: Work streams (Development, Operations, Growth).
*   **L4 - Task**: Actionable units (linked to a Domain and optionally a Milestone). Has `status` (todo, done, delayed) and `scheduled_date`.

## 4. Feature Requirements

### 4.1. Core Foundation
*   Initialize Nuxt project.
*   Setup Global CSS variables for "Ethereal Glass" theme (Aurora gradients, blur constants).
*   Configure Clerk for authentication.
*   Configure Turso client.

### 4.2. The Wizard (排期向导)
*   **Concept**: A step-by-step form to help the user initialize their data.
*   **Steps**:
    1.  **Welcome**: Introduction to the "Ethereal" experience.
    2.  **North Star**: Input the Annual Goal.
    3.  **Milestones**: Break down into Q1/Q2/Q3/Q4 key outcomes.
    4.  **Domains**: Confirm/Edit default domains (Dev, Ops, etc.).
    5.  **Generate**: Save to DB and redirect to Dashboard.
*   **UI**: Full-screen, immersive, glass cards, smooth transitions between steps.

### 4.3. Today's Cockpit (驾驶舱)
*   **View**: A clean dashboard showing *only* today's tasks.
*   **Sections**:
    *   **Morning**: Time block 1.
    *   **Afternoon**: Time block 2.
    *   **Evening**: Time block 3 (Optional).
*   **Actions**:
    *   Mark Done.
    *   Quick Add (Inbox).
    *   Push to Tomorrow (Elastic Adjustment).

## 5. Non-Functional Requirements
*   **Aesthetics**: Must strictly follow the "Produc Guidelines" (Glassmorphism, Serum fonts for headers).
*   **Performance**: Wizard transitions must be 60fps.
*   **Mobile**: Dashboard must be perfectly usable on mobile (PWA-ready layout).
