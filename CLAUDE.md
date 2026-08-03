# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository overview

NyayaOne is a multi-tenant legal-tech platform (TrailBlaze Tech) for Nepali law firms. It is a monorepo of five independent apps that all talk to one Express/Prisma backend:

| App | Stack | Who uses it |
|---|---|---|
| `backend/` | Express + TypeScript + Prisma + PostgreSQL | REST API for everything below |
| `company-web/` | Vite + React + MUI | TrailBlaze staff "Company Control Center" (approve firms, manage courts, library, subscriptions) |
| `law-firm-web/` | Vite + React + MUI | Law firm admin/lawyer dashboard (cases, clients, hearings, reports) |
| `lawyer-mobile/` | Expo + expo-router + React Native | Lawyer mobile app |
| `client-mobile/` | Expo + expo-router + React Native | Client-facing mobile portal |

Each app has its own `package.json`, `node_modules`, and is developed/built independently — there is no shared workspace tooling (no turborepo/nx/lerna).

## Common commands

### Backend (`backend/`)
```bash
npm run dev              # nodemon + ts-node, watches src/, http://localhost:5000/api/v1
npm run build            # tsc -> dist/
npm start                # run compiled dist/server.js
npm run lint             # eslint src/**/*.ts
npm test                 # jest --runInBand (no test files currently exist in the repo)

npm run prisma:generate  # regenerate Prisma client after schema.prisma changes
npm run prisma:migrate   # create + apply a dev migration
npm run prisma:studio    # DB GUI at http://localhost:5555
npm run prisma:seed      # bootstraps Super Admin (admin@trailblazetech.com) + RBAC roles
npm run prisma:seed-courts

docker compose up -d     # local Postgres (see backend/docker-compose.yml)
```
Env vars are defined in `backend/.env` (copy from `.env.example`); `src/config/env.ts` throws at startup if a required var (`DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`) is missing.

### Web apps (`company-web/`, `law-firm-web/`)
```bash
npm run dev       # vite dev server
npm run build     # tsc && vite build
npm run lint      # eslint src/**/*.{ts,tsx}
```
API base URL comes from `VITE_API_BASE_URL` (`.env.example` in each app).

### Mobile apps (`lawyer-mobile/`, `client-mobile/`)
```bash
npm start          # expo start --dev-client
npm run android    # expo run:android
npm run ios        # expo run:ios
```
API base URL comes from `app.json` → `expo.extra.apiBaseUrl`. On a physical device this must be the dev machine's LAN IP, not `localhost` (see comment in `src/api/client.ts`). Both mobile apps require a custom dev client (`expo-dev-client`) — Expo Go alone won't work because of native modules (notifications, secure-store, etc.).

## Backend architecture

Strict layered "Clean Architecture" per module, enforced by convention (not by tooling):

```
controller → service → repository → prisma
```

- **Controller** (`src/modules/<name>/controller/*.ts`): HTTP only — parses `req.body` with a Zod schema from `dto/`, calls the service, sends the JSON envelope `{ success, data }` or `{ success, message, errors }`. No business logic.
- **Service** (`src/modules/<name>/service/*.ts`): all business logic and orchestration. Always takes `lawFirmId` explicitly as a parameter (never reads `req` directly).
- **Repository** (`src/modules/<name>/repository/*.ts`): the *only* place that imports `prisma` from `src/database/prisma.ts`. No business logic.
- **DTO** (`src/modules/<name>/dto/*.ts`): Zod schemas, parsed in the controller via `schema.parse(req.body)`.
- **Routes** (`src/modules/<name>/routes/*.ts`): wires `authenticate` / `authorize(...)` middleware to controller methods, registered in `src/routes.ts`.

New backend features are added as a new module under `src/modules/<name>/` following this same controller/service/repository/dto/routes folder structure, then registered in `src/routes.ts`.

### Multi-tenancy — the most important invariant

Every table that belongs to a law firm (`Case`, `Client`, `Document`, `Hearing` via `Case`, `User` when not COMPANY, etc.) carries a `lawFirmId`. **Every repository query for firm-scoped data must filter by `lawFirmId`**, sourced from `req.auth.lawFirmId` (set by the `authenticate` middleware from the JWT). This isolation is the core security boundary between law firm tenants — see `src/common/middleware/authenticate.ts` and any `*.repository.ts` (e.g. `case.repository.ts`'s `findByIdScoped`/`updateScoped`) for the pattern. `COMPANY` accounts have `lawFirmId = null` and operate platform-wide (courts, library, law firm approval, subscriptions).

### Auth model

- JWT access + refresh tokens (`src/common/utils/jwt.ts`); refresh tokens are persisted in the `RefreshToken` table so they can be revoked on logout.
- `AccountType` enum drives everything: `COMPANY | LAW_FIRM_ADMIN | LAWYER | STAFF | CLIENT`.
- `authenticate` middleware verifies the bearer token and attaches `req.auth` (`{ userId, lawFirmId, accountType, ... }`).
- `authorize(...accountTypes)` middleware restricts a route to specific account types (coarse-grained). Fine-grained RBAC (`Role`/`Permission`/`RolePermission` tables) exists in the schema for COMPANY staff but is not yet fully wired into route guards everywhere.
- Law firms self-register (`POST /auth/register/law-firm`) in `PENDING` status and require Company approval before becoming `ACTIVE`.

### Error handling

Throw `AppError` (see `src/common/errors/AppError.ts`, static helpers `badRequest`/`unauthorized`/`forbidden`/`notFound`/`conflict`/`internal`) from services/controllers — never handle errors with try/catch in controllers. `express-async-errors` (imported first in `app.ts`) forwards thrown/rejected errors to the global `errorHandler` (`src/common/middleware/errorHandler.ts` — must stay registered last), which also normalizes Zod validation errors (422) and known Prisma error codes (`P2002` → 409, `P2025` → 404).

### File uploads

`src/common/middleware/upload.ts` uses `multer.diskStorage`. Case/client documents are namespaced under `uploads/<lawFirmId>/` (mirrors DB-level tenant isolation); Library resources (Company-managed, not tenant-scoped) go under `uploads/library/`. Storage is intentionally driver-agnostic (`env.storage.driver`, currently only `local`) so it can be swapped for cloud storage later without touching calling code.

### Hearing reminders

`src/jobs/reminderScheduler.ts` runs an in-process `setInterval` (every 30s) that finds due, unsent `HearingReminder` rows and pushes notifications via `pushRepository.sendPushBatch`. Reminder rows themselves are created by `hearing.service.ts` when a hearing is scheduled — this job only delivers them. Started once at boot from `server.ts`.

### Document templates

`DocumentTemplate` (Company-managed, `{{placeholder}}` bodies) + the `document-template` module let a lawyer pick a template and a case, and the backend fills placeholders from that case's real data — see `document-template/service/*` for the supported placeholder list.

### Subscriptions

`SubscriptionPlan` / `FirmSubscription` model plan tiers and firm-plan assignment only. There is no real payment gateway integration — Company staff manually flip a firm's subscription to `ACTIVE` after confirming payment out-of-band (see comment block above these models in `prisma/schema.prisma`).

### Data model reference

Full schema lives in `backend/prisma/schema.prisma`. Key relations: `LawFirm` 1–N `User`/`Client`/`Case`/`Document`, 1–1 `FirmSubscription`; `Case` M–N `Client` (via `CaseClient`) and M–N `User`/lawyer (via `CaseLawyer`, with an `isLead` flag); `Hearing` belongs to `Case` and chains to the next hearing via self-relation (`nextHearingId`); `Court` and `LibraryResource` are Company-managed and not tenant-scoped.

## Frontend architecture (shared across company-web / law-firm-web / lawyer-mobile / client-mobile)

All four frontend apps follow the same pattern, just with React Router (web) vs expo-router (mobile) for navigation:

- **API layer** (`src/api/client.ts`): a single axios instance. Request interceptor reads `accessToken` from the Zustand auth store and sets `Authorization: Bearer`. Response interceptor logs the user out on any `401`. Per-domain calls live in `src/api/<domain>.api.ts`.
- **State**: Zustand for auth (`src/store/authStore.ts`, persisted — `zustand/middleware`'s `persist`), TanStack Query (`@tanstack/react-query`) for all server data, wrapped in per-domain hooks under `src/hooks/use<Domain>.ts` / `useDomainData.ts`.
- **Types**: hand-written TypeScript types under `src/types/`, one file per domain, mirroring the backend DTOs/Prisma models — there is no codegen from the backend, so keep these in sync manually when backend contracts change.
- **Routing guard**: `components/common/ProtectedRoute.tsx` (web) reads `isAuthenticated` from the auth store; mobile apps use an `(auth)` route group plus a root redirect in `app/index.tsx`.
- Web apps use MUI + CSS Modules (`*.module.css`) for styling; mobile apps use a custom `theme/theme.ts` and hand-rolled components (`src/components/Card.tsx`, etc.) since there's no UI kit.
- Mobile apps share near-identical `src/i18n/` (English/Nepali via `LanguageContext`), `src/utils/pushNotifications.ts`, and `src/utils/downloadDocument.ts` — when fixing a bug in one of `lawyer-mobile`/`client-mobile`, check whether the same file exists in the other and needs the same fix (they are copy-pasted, not shared via a package).

## Working across the monorepo

Because there's no shared package, a backend API change (new field, renamed route, changed response shape) typically needs matching edits in up to four places: the relevant `src/api/*.api.ts` and `src/types/*.types.ts` in every frontend app that consumes it. Grep for the endpoint path or DTO field name across `company-web/`, `law-firm-web/`, `lawyer-mobile/`, `client-mobile/` before considering an API change complete.
