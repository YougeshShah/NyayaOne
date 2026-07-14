# NyayaOne — Law Firm Dashboard (Web)

Web dashboard used by **law firm admins, lawyers, and staff** to manage clients,
cases, hearings, and (for admins) their firm's lawyers/staff.

Runs on **port 3001** (Company Control Center runs on 3000 — both can run at the
same time on the same machine).

## Local Setup

```bash
npm install
npm approve-scripts --allow-scripts-pending   # if prompted, for esbuild
cp .env.example .env
npm run dev
```

Opens at: **http://localhost:3001**

⚠️ Backend (`~/nyayaone/backend`, port 5000) must be running at the same time.

## Login

Use the law firm admin created earlier:
- Email: `ram@kla.com.np`
- Password: `SecurePass123!`

(Or a lawyer account, e.g. `sita@kla.com.np` / `LawyerPass123!` — lawyers see
everything except the "Lawyers & Staff" management page, which is admin-only.)

## Folder Structure

Same separation-of-concerns pattern as `company-web`:

```
src/
  api/          → axios calls per module (auth, client, court, case, hearing, user)
  components/
    common/     → StatusBadge, PriorityBadge, ProtectedRoute
    layout/     → DashboardLayout.tsx + its .module.css
  hooks/        → React Query hooks wrapping api/ calls
  pages/        → one folder per page, each with its .tsx (+ .module.css where needed)
  routes/       → AppRoutes.tsx
  store/        → authStore.ts (Zustand)
  styles/       → global.css + theme.ts
  types/        → shared TypeScript types, grouped by domain
```

## What's Built

- ✅ Login (firm accounts only — company accounts are rejected)
- ✅ Dashboard — case/client stats, today's + upcoming hearings
- ✅ Clients — list, search, create
- ✅ Cases — list, filter by status, create (with court/client/lawyer pickers)
- ✅ Hearings — list, create (backend auto-generates the 4 reminders)
- ✅ Lawyers & Staff — admin-only: list, add, suspend/activate

## Next to Build
- Case detail page (hearing history timeline, documents, remarks)
- Document upload (per case)
- Reports (PDF/Excel export)
- Calendar view for hearings (daily/weekly/monthly)
