# Implementation Plan: MVP Core

## Phase 1: Foundation & Aesthetics
- [x] Task: Initialize Nuxt 3 project (TypeScript)
- [x] Task: Install Dependencies (Clerk, Turso client, Lucide Icons)
- [x] Task: Setup Design System (Global CSS Variables, Fonts, Reset)
    *   Implement "Aurora" background animations.
    *   Define `.glass-card` utility classes.
- [x] Task: Configure Clerk Authentication (Login/Protect Routes)

## Phase 2: Data Layer (Turso)
- [x] Task: Design Database Schema (SQL definitions)
- [x] Task: create `db` module (Client initialization)
- [/] Task: Implement API routes for Goals (L1) and Milestones (L2)
- [/] Task: Implement API routes for Tasks (L4)

## Phase 3: The Wizard (Feature)
- [x] Task: Build Wizard Layout (Full screen, step orchestration)
- [x] Task: Implement Step 1 (North Star Input)
- [x] Task: Implement Step 2 (Milestone Breakdown)
- [x] Task: Implement Step 3 (Domain Selection)
- [x] Task: Implement "Generate" Logic (Save to DB)

## Phase 4: The Dashboard (Feature)
- [ ] Task: Build Dashboard Layout (Sidebar + Main Content)
- [ ] Task: Implement "Today's View" (Fetch tasks for today)
- [ ] Task: Implement Task Card Component (Glass style, Checkbox)
- [ ] Task: Implement "Push to Tomorrow" interaction

## Phase 5: Polish & Deployment
- [ ] Task: Mobile Responsiveness Check
- [ ] Task: Deploy to Vercel (Connect Env Vars)
