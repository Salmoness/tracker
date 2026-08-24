# Tracker — Resume Project Context

> **Purpose:** Source material for an AI resume-writing agent. Treat statements under **Implemented** as current repository evidence. Treat statements under **Designed roadmap** as architecture/product design work, not shipped functionality. Do not convert roadmap items into implementation claims.
>
> **Evidence date:** August 19, 2026. The current production build succeeds and ESLint completes without errors. Automated tests, a live production deployment, and measured user-impact metrics are not present in the repository.

## Project Snapshot

**Project name:** Tracker  
**Project type:** Responsive personal productivity and life-management web application  
**Current maturity:** Working Phase 2 prototype; authentication, visual system, task management, routine templates, and daily priorities are implemented. Calendar planning, time tracking, bills, reminders, analytics, and deployment are designed but not yet implemented end to end.

### Short description

Tracker is an ADHD-aware productivity application that helps a user turn an overwhelming collection of responsibilities into a short, actionable daily plan. Its current dashboard combines categorized tasks, subtasks, reusable daily routines, and a constrained “Must-Win 3” priority system. The broader product is designed to connect task intent, calendar time blocks, actual time entries, and bill obligations in one privacy-conscious application.

### Who it serves

- Individuals managing work, household, health, and personal responsibilities in one place.
- People with mild ADHD-related focus challenges who benefit from reduced choice, low-friction planning, and visible progress.
- A design-oriented, mobile-conscious audience that wants a polished interface without distracting or manipulative gamification.
- Initially, a single personal user; the data model and authentication architecture are intended to support multiple isolated accounts.

## Problem It Solves

Many productivity tools separate task capture, daily planning, actual time tracking, and financial due dates. That fragmentation adds context switching and makes it difficult to answer three practical questions: “What matters today?”, “What should I do now?”, and “What obligations are approaching?” Feature-heavy tools can also increase cognitive load for users with attention difficulties.

Tracker addresses that problem by:

- limiting the daily focus surface to three Must-Win priorities;
- turning recurring routines into reusable one-click task sets instead of repeated manual entry;
- supporting tasks with categories, urgency, dates, duration estimates, and smaller checklist steps;
- presenting a cohesive, high-contrast interface with restrained motion and persistent appearance preferences;
- designing future planning, time, and bill records as related but distinct concepts so planned work and actual outcomes can be compared without corrupting history.

## Major Features

### Implemented in the current repository

- **Authentication and routing:** registration, login, logout, password-reset request, session persistence, public-route guards, and a protected dashboard. The app uses Supabase Auth when environment credentials are configured and a browser-local demonstration mode otherwise.
- **Task management:** create, view, edit, complete, search, filter, and archive tasks with descriptions, categories, priority levels, estimated durations, due dates, and subtasks.
- **Checklist behavior:** toggle individual subtasks, display checklist progress, and complete the parent task when every subtask is complete.
- **Categories:** create reusable task categories with a color and icon value, plus seeded defaults in local demonstration mode.
- **Daily Routine Templates:** create reusable multi-item routines and apply a routine to generate dated tasks with one action. The UI prevents a second application for the same template and date in its current service flow.
- **Must-Win 3:** assign at most three date-scoped priorities, retain completed priority tasks with completed styling, remove assignments, and compact remaining slots in the current client service.
- **Responsive dashboard:** combines Must-Win priorities, routine shortcuts, task filters, task cards, modals, status feedback, and responsive layouts.
- **Custom visual system:** neofuturist design tokens using OKLCH colors, Syne display typography, Manrope interface typography, light/dark/system modes, and three persistent accent presets—Chlorophyll, Ultraviolet, and Solar.
- **Reusable interface primitives:** typed Button, Card, Badge, Input, Modal, and appearance-selector components organized in a shadcn-style UI layer. Motion is used for button and modal interactions, while Lucide supplies icons.
- **Design-system reference page:** an in-app route that demonstrates tokens, typography, appearance controls, components, and styling rules.
- **Dual data adapter:** service modules select Supabase or user-scoped `localStorage` at runtime, allowing UI development and demonstrations without provisioned cloud credentials.

### Designed roadmap — do not present as shipped

- A 30-minute daily calendar with tap-to-block creation and accessible pointer, touch, and keyboard drag-and-drop.
- Calendar-block rescheduling with overlap handling, optimistic rollback, and Undo.
- Start/stop timers, focus mode, manual time entries, and planned-versus-actual reporting.
- Monthly and chronological bill views, payment history, variable bill amounts, due-state warnings, and month-end due-date clamping.
- Opt-in bill reminder emails using Supabase Cron, Edge Functions, and Resend.
- JSON export, summaries, optional static PWA behavior, regression/security testing, and production deployment.

## Technology Inventory

### Current implementation

| Area | Technology | How it is used |
| --- | --- | --- |
| Languages | TypeScript, TSX, SQL, CSS | Typed React application, PostgreSQL migration, and theme/component styling |
| Frontend | React 19 | Component-based SPA and Context providers |
| Build tooling | Vite 8 | Local development and optimized production builds |
| Routing | React Router 7 | Public, protected, authentication, dashboard, and design-system routes |
| Styling | Tailwind CSS 4, CSS custom properties, OKLCH | Responsive utilities and semantic theme tokens |
| UI approach | Custom typed primitives in a shadcn-style structure | Reusable buttons, cards, badges, inputs, and modals; the repo does not currently contain a generated shadcn manifest or Radix dependency |
| Animation | Motion for React (`motion/react`) | Button feedback and modal entrance/exit transitions |
| Icons | Lucide React | Consistent interface iconography |
| Typography | Fontsource Syne and Manrope | Self-hosted display and interface fonts |
| Backend client/API | Supabase JavaScript client | Auth sessions and browser access to Supabase's generated database API |
| Authentication | Supabase Auth; local mock adapter for demos | Email/password workflows, token/session state, and route protection |
| Database | PostgreSQL through Supabase | Relational schema, constraints, indexes, triggers, and row-level security foundations |
| Client state | React Context and hooks | Authentication, appearance, task/routine/priority state, loading states, and toasts |
| Local persistence | Browser `localStorage` | Demo accounts, user-scoped task data, routines, priorities, and appearance preferences |
| Quality checks | ESLint 10, TypeScript compilation through Vite | Static analysis and build-time type checking |

### Deployment and planned integrations

- **Current state:** no production hosting configuration or deployed URL is evidenced in the repository.
- **Planned frontend hosting:** Vercel.
- **Planned managed backend:** Supabase Cloud for PostgreSQL, Auth, generated APIs, Edge Functions, and Cron.
- **Planned email API:** Resend, called only from a private Supabase Edge Function.
- **Planned planner library:** `@dnd-kit/react` for accessible drag-and-drop; it is specified but not currently installed.
- **Planned validation/data libraries:** TanStack Query, React Hook Form, Zod, `date-fns`, and timezone helpers; these are architectural selections, not current dependencies.

## Architecture

Tracker currently follows a feature-oriented React SPA architecture with an adapter-style service layer:

```text
React pages and feature components
        |
        v
Context providers (Auth, Appearance, Tasks)
        |
        v
Domain services (tasks, routines, daily priorities)
        |
        +--> Supabase JS client --> Auth + generated PostgREST API --> PostgreSQL/RLS
        |
        +--> user-scoped browser localStorage fallback
```

### Frontend boundaries

- `src/pages` owns route-level screens.
- `src/features` groups task, category, routine, and priority workflows.
- `src/components/ui` contains reusable visual primitives.
- `src/context` coordinates session and feature state for the component tree.
- `src/services` isolates persistence logic from rendering code.
- `src/types` defines domain and authentication contracts.
- `supabase/migrations` contains the relational schema and security foundation.

### Important data flows

1. **Authentication:** A user submits an auth form. `AuthContext` delegates to Supabase Auth when configured, stores the returned session/JWT in React state, listens for auth-state changes, loads the matching profile, and allows `ProtectedRoute` to render the dashboard. In demo mode, the same context contract is backed by local storage.
2. **Task mutation:** A task modal emits typed input to `TaskContext`; the context calls `taskService`; the service writes to Supabase or user-scoped local storage; the context replaces its local collection and raises a toast; the task list rerenders from context state.
3. **Routine application:** The routine UI selects a template and date; `routineService` checks whether that template has already run for the date, creates one task per routine item, records the run, and refreshes dashboard state. The production design replaces this multi-step client flow with one idempotent database RPC.
4. **Daily priorities:** The priority card selects a task and slot for a date. The priority service enforces a maximum of three in its current adapter, rewrites positions into a compact order after removal, and returns the ordered list. Completed tasks remain assigned so the user can see progress against the original daily commitment.
5. **Appearance:** `AppearanceContext` reads saved preferences, resolves system/light/dark mode, writes `data-theme` and `data-accent` attributes on the document root, and lets CSS variables update the application without duplicating component styles.
6. **Planned time model:** A task represents intent, a calendar block represents scheduled time, and a time entry represents actual work. Nullable links preserve standalone records while allowing planned-versus-actual comparisons and automatic timer-to-active-block linking.

## Specific Technical Contributions

Use the following as first-person source notes. They describe work evidenced by the repository but do not assert whether the project was solo or collaborative.

- Defined the product scope and phased architecture for an ADHD-aware application spanning task management, routines, time blocking, actual-time tracking, and bill management.
- Built the Vite/React/TypeScript application shell, route structure, protected navigation, Supabase client setup, and environment-aware local demonstration mode.
- Implemented email/password authentication workflows, session listeners, profile loading, JWT handling, and guarded public/private routes.
- Designed and implemented the current Phase 2 task domain: typed task/category/subtask models, persistence services, React context orchestration, CRUD/archive workflows, filters, completion logic, and user feedback.
- Implemented reusable Daily Routine Templates and date-scoped Must-Win 3 interactions to reduce repetitive entry and daily decision overload.
- Authored a relational PostgreSQL/Supabase schema covering profiles, tasks, subtasks, routines, priorities, calendar blocks, time entries, bills, payments, and notification preferences, with constraints, indexes, timestamps, and initial RLS policies.
- Created a distinctive neofuturist design specification and translated its core tokens into the app through OKLCH semantic colors, self-hosted fonts, three accent presets, theme persistence, and reusable UI components.
- Separated UI, state coordination, domain types, and persistence services so the same feature components can operate against either Supabase or local storage.
- Established build and lint quality gates; the current app passes a Vite production build and ESLint scan.

## Difficult Problems and Solutions

### 1. Reducing ADHD planning friction without adding distracting gamification

**Problem:** A large unrestricted task list can create choice paralysis, while heavy streaks, animations, or rewards can become another distraction.  
**Solution:** Constrained the main dashboard to three Must-Win priorities, kept completed priorities visible, added subtasks for smaller next actions, and introduced one-click routine templates. Visual emphasis is concentrated on current state and primary actions rather than points or competitive mechanics.  
**Outcome:** The current UI provides a shorter path from task capture to an actionable daily focus list.

### 2. Supporting cloud integration before infrastructure is provisioned

**Problem:** Authentication and persistence work can block interface development when Supabase credentials or migrations are unavailable.  
**Solution:** Implemented a consistent context/service contract with runtime selection between Supabase and user-scoped local storage. Components do not need a separate demo-only implementation.  
**Outcome:** The application can be developed and demonstrated locally while preserving a clear migration path to a managed backend.

### 3. Building a unique visual identity without relying on expensive effects

**Problem:** A design-forward audience expects a recognizable interface, but glassmorphism, excessive gradients, and constant animation can feel generic and hurt clarity or device performance.  
**Solution:** Created a token-driven optimistic neofuturist system using high-contrast flat surfaces, OKLCH colors, Syne/Manrope typography, restrained Motion transitions, light/dark/system modes, and three switchable accents.  
**Outcome:** The design can change globally through root attributes and CSS variables while component markup stays stable. The production build succeeds, although JavaScript code splitting remains a future optimization.

### 4. Modeling related productivity records without collapsing their meanings

**Problem:** Treating tasks, scheduled blocks, and timers as one record makes rescheduling and historical reporting unreliable.  
**Solution:** Designed separate relational entities for intention (`tasks`), reservation (`calendar_blocks`), and execution (`time_entries`), connected by nullable foreign keys and ownership rules. Date-only obligations are also separated from timestamped events to avoid timezone drift.  
**Outcome:** The roadmap can support planned-versus-actual reporting and historical integrity without overloading the task table. This model is designed in the schema/plan; the planner and timer UI are not yet shipped.

### 5. Preserving daily-priority and routine invariants

**Problem:** Priority deletion can leave positional gaps, completed priorities can disappear from the user's sense of progress, and repeated routine application can duplicate tasks.  
**Solution:** The current client adapter compacts Must-Win slots, keeps completed tasks assigned with completed styling, and records routine runs by template/date before allowing another application. The production plan moves these multi-row operations into transactional, idempotent PostgreSQL RPCs.  
**Outcome:** Demo behavior matches the intended UX, with an explicit path to eliminate race conditions in the production backend.

## Current Engineering Limitations

These constraints should not appear as accomplishments on a resume, but they matter when generating accurate interview talking points:

- The current TypeScript service fields for tasks, routine items/runs, and daily priorities do not fully match the checked-in SQL column names and status values. The local-storage path works, but Supabase-backed Phase 2 behavior needs schema/client alignment.
- Several domain tables have RLS enabled without complete least-privilege policies in the current migration. Two-user isolation tests have not been added.
- Routine application and Must-Win compaction are multi-step client operations rather than transactional RPCs, so production concurrency and partial-failure guarantees are unfinished.
- No automated unit, integration, accessibility, or end-to-end test suite is currently present.
- `shadcn/ui`, TanStack Query, Zod, React Hook Form, date utilities, and dnd-kit are specified in the plan but not currently installed/used.
- The planner, drag-and-drop, timer, billing, email-reminder, analytics, export, PWA, and production deployment phases are not implemented.
- The Vite build passes, but its main JavaScript chunk is approximately 661 KB minified (about 189 KB gzip); route-level code splitting is a reasonable next performance task.
- Do not claim user-growth, time-saved, retention, accessibility-compliance, test-coverage, or performance metrics until they have been measured.

## Five Potential Resume Bullets

Each bullet follows **action + technical implementation + outcome** and avoids unverified numerical claims.

1. **Built** an ADHD-aware productivity dashboard with React 19, TypeScript, and Tailwind CSS, implementing categorized tasks, subtasks, reusable daily routines, and a constrained Must-Win 3 workflow to reduce repetitive entry and daily decision overload.
2. **Engineered** environment-aware authentication and persistence adapters using Supabase Auth/PostgreSQL and user-scoped `localStorage`, enabling the same typed React components to support both cloud-backed operation and credential-free local demonstrations.
3. **Designed** a relational PostgreSQL domain model separating tasks, calendar blocks, time entries, recurring bill obligations, and payment history, establishing a scalable foundation for planned-versus-actual analysis and date-safe financial tracking.
4. **Created** a responsive neofuturist design system with OKLCH semantic tokens, Syne and Manrope typography, persistent light/dark/system modes, three switchable accents, and restrained Motion interactions, delivering a distinctive interface without graphics-heavy effects.
5. **Structured** the application into feature components, Context-based state orchestration, typed domain contracts, reusable UI primitives, and persistence services, producing a maintainable Phase 2 prototype that passes ESLint and a Vite production build.

## Guidance for the Resume-Writing Agent

- Lead with the implemented task/routine/priority experience and the architecture/design work.
- Use **built**, **implemented**, or **engineered** only for current features listed as implemented.
- Use **designed**, **modeled**, or **specified** for the planner, timers, billing, reminders, and production architecture until those phases ship.
- Do not say the app is deployed, production-ready, fully secure, tested end to end, or used by real customers based on the current repository.
- If space permits, frame this as a work-in-progress full-stack product and distinguish the operational React prototype from the broader implementation roadmap.
- Replace qualitative outcomes with measured metrics only after collecting bundle, Lighthouse, test-coverage, task-entry, or user-study data.
