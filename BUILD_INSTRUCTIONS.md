# Murimi Build Instructions

This file documents how the current Murimi frontend solution was built and must be updated whenever the codebase changes.

## Update Rule

- Whenever any feature, route, component, dependency, styling token, or project structure changes, update this file in the same change.
- Keep entries concise and accurate.
- Apply the same rule for backend changes when backend work starts (API, database, auth, infrastructure, integrations).

## Code Reviews

- Code reviews are enabled as a required part of the workflow.
- Every meaningful change should be reviewed before merge/push to shared branches where possible.
- Review focus should prioritize:
  - Bugs and regressions
  - Data/API contract mismatches
  - Security and validation gaps
  - Missing tests for changed behavior
  - UI/UX breakage and accessibility issues (frontend)
- When code review feedback changes architecture, routes, APIs, or behavior, update this file in the same change.

## Project Overview

- Project name: `murimi`
- Current scope: full-stack in progress (frontend exists, backend scaffold and core MVP APIs added under `backend/`)
- Domain: piggery / farm operations management
- App style: dashboard + operational modules

## Tech Stack

- Frontend:
- Vite
- React 18
- TypeScript
- React Router (`react-router-dom`)
- Tailwind CSS
- shadcn-ui / Radix UI components
- TanStack React Query (provider set up, backend integration not yet implemented)
- Vitest (basic scaffold test present)
- Backend:
- NestJS + TypeScript
- Prisma ORM
- PostgreSQL
- Redis (foundation for BullMQ/background jobs)
- JWT auth (access + refresh token rotation)
- Argon2 password hashing
- `class-validator` for DTO validation
- Swagger/OpenAPI (`/api/docs`)

## How The App Is Structured

- Entry point: `src/main.tsx`
  - Mounts React app and loads global styles from `src/index.css`
- App composition: `src/App.tsx`
  - Wraps app with:
    - `QueryClientProvider`
    - `TooltipProvider`
    - Toasters (`toaster` + `sonner`)
    - `BrowserRouter`
  - Uses a shared app shell (`AppLayout`) around routes

## Backend Structure (NestJS)

- Backend root: `backend/`
- Bootstrap:
  - `backend/src/main.ts` (global validation, exception filter, response interceptor, Swagger)
  - `backend/src/app.module.ts`
- Shared/common:
  - `backend/src/common/guards/*` (JWT, farm membership, permissions)
  - `backend/src/common/decorators/*` (`Authz`, `RequirePermissions`, `CurrentUser`, `Public`)
  - `backend/src/common/filters/*` / `interceptors/*`
- Prisma:
  - `backend/prisma/schema.prisma` (domain schema + audit + sync + RBAC models)
  - `backend/prisma/seed.ts`
  - `backend/src/prisma/prisma.service.ts`
- Domain modules:
  - `auth`, `farms`, `memberships`, `users`, `roles`, `permissions`
  - `animals`, `pens`, `batches`
  - `nutrition`, `breeding`, `health`, `slaughter`
  - `farm-map`, `reports`, `audit`, `sync`

## Layout / Navigation

- `src/components/AppLayout.tsx`
  - Provides the main page shell (sidebar + top bar + content area)
- `src/components/AppSidebar.tsx`
  - Left navigation with operational and system modules
- `src/components/TopBar.tsx`
  - Farm selector
  - Sync badge (currently mock status)
  - Search box (UI only)
  - Notifications button (UI only)
- `src/components/NavLink.tsx`
  - Wrapper around React Router `NavLink` with `activeClassName` compatibility

## Routes Implemented

Defined in `src/App.tsx`:

- `/` -> `Dashboard`
- `/pigs` -> `Pigs`
- `/pigs/:id` -> `PigProfile`
- `/nutrition` -> `Nutrition`
- `/breeding` -> `Breeding`
- `/health` -> `Health`
- `/slaughter` -> `Slaughter`
- `/farm-map` -> Placeholder
- `/reports` -> Placeholder
- `/audit` -> Placeholder
- `/settings` -> Placeholder
- `*` -> `NotFound`

## Feature Modules (Current State)

### Dashboard (`src/pages/Dashboard.tsx`)

- KPI/task cards
- Active alerts list
- Quick action buttons
- Mini breeding overview
- Uses hardcoded mock data arrays

### Pigs (`src/pages/Pigs.tsx`)

- Pig registry list with mock data
- Search filter (ID / pen)
- Stage filter
- Click-through navigation to pig profile
- "Add Pig" button is UI-only (no handler/backend)

### Pig Profile (`src/pages/PigProfile.tsx`)

- Reads `:id` from route params
- Shows static mock profile header
- Timeline tab with mock events
- Other tabs are placeholders (nutrition, breeding, health, slaughter)

### Nutrition (`src/pages/Nutrition.tsx`)

- Feeding plans tab
- Feed log form UI
- FCR summary stats
- Water checks list
- All data is mock/static

### Breeding (`src/pages/Breeding.tsx`)

- Breeding stats cards
- Event timeline/calendar-style list
- Record Heat / Service / Farrowing form UIs
- No persistence yet

### Health (`src/pages/Health.tsx`)

- Treatment stats
- Treatments list
- Symptom suggestion tool UI
- Treatment logging form UI
- No backend/medical rules engine yet

### Slaughter & Sales (`src/pages/Slaughter.tsx`)

- Eligibility list with mock statuses
- Record slaughter form UI
- Admin rules UI for eligibility thresholds
- No rule engine or persistence yet

### Placeholder Modules (`src/pages/PlaceholderPage.tsx`)

- Generic "Coming Soon" page used for:
  - Farm Map
  - Reports
  - Audit Log
  - Settings

## Styling / Theme Setup

- Global styles: `src/index.css`
- Tailwind config: `tailwind.config.ts`
- Theme uses CSS custom properties (HSL values) for semantic tokens:
  - `primary`, `secondary`, `muted`, `accent`
  - `success`, `warning`, `info`, `destructive`
  - sidebar-specific colors
- Typography:
  - Headings: `Fraunces`
  - Body: `DM Sans`

## UI Component System

- Reusable UI primitives live in `src/components/ui/`
- Mostly generated/assembled shadcn components backed by Radix UI
- Shared utility:
  - `src/lib/utils.ts` -> `cn()` for class merging (`clsx` + `tailwind-merge`)

## Data & State (Current)

- Frontend state:
- Most page data is still embedded directly in page components as arrays/objects
- React Query is prepared for future API integration but not yet wired to live endpoints
- Backend state:
- PostgreSQL + Prisma schema defined for multi-tenant farms, RBAC, pigs, nutrition, breeding, health, slaughter, map, audit, and sync
- Audit log + change cursor models included for write tracking and sync pull
- Offline sync versioning strategy implemented with `version`, `updatedAt`, `deletedAt` on sync-capable entities

## Testing (Current)

- Test setup exists (`vitest`)
- Example placeholder test exists: `src/test/example.test.ts`
- No feature/component tests implemented yet
- Backend tests added (`jest`):
- Unit tests for slaughter eligibility logic
- Unit tests for sync conflict version mismatch logic
- Guard-level integration-oriented tests for farm membership / tenant isolation behavior

## Known Gaps / Notes

- Some UI strings show character encoding artifacts (garbled emoji/punctuation) in a few files.
- `src/pages/Index.tsx` exists as template/fallback content but is not used by current routing.
- Forms are currently presentation-only and do not submit to any backend.
- Frontend is not yet integrated with backend endpoints.
- Backend codebase is scaffolded with broad module coverage and core business logic, but should be validated locally with `npm install`, Prisma migration generation, and test runs before production use.
- MVP tenant isolation is enforced in application layer (guards + scoping); PostgreSQL RLS is planned as a future hardening layer.

## Local Development

### Install

```bash
npm install
```

### Run

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Test

```bash
npm run test
```

## Backend Local Development

### Start Dependencies

```bash
cd backend
docker compose up -d
```

### Install + Generate + Migrate

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
```

### Seed

```bash
cd backend
npm run prisma:seed
```

### Run Backend

```bash
cd backend
npm run start:dev
```

### Backend Tests

```bash
cd backend
npm test
```

## Change Log Guidance (for future updates)

When updating this file after changes, include:

- New/changed routes
- New/changed pages/components
- State management or API integration changes
- Styling/theme token changes
- Dependency additions/removals that affect architecture
- Any backend contract assumptions introduced by the frontend
