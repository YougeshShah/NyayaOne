# NyayaOne — Company Control Center (Web Dashboard)

Web dashboard used by **Technocraftx** to manage the entire NyayaOne platform:
approve/suspend law firms, manage courts, and (in later phases) view platform analytics,
manage the legal library, and send notifications.

## Folder Structure (Separation of Concerns)

```
src/
  api/          → all backend API calls (axios), grouped by module (auth, lawfirm, court)
  components/
    common/     → reusable UI pieces (StatusBadge, ProtectedRoute)
    layout/     → DashboardLayout.tsx + DashboardLayout.module.css (sidebar/topbar)
  hooks/        → React Query hooks wrapping api/ calls (useLawFirms, useCourts, useAuth)
  pages/        → one folder per page; each page has its .tsx and its own .module.css
  routes/       → route definitions (AppRoutes.tsx)
  store/        → Zustand global state (authStore.ts)
  styles/       → global.css (Tailwind + resets) and theme.ts (MUI theme)
  types/        → shared TypeScript types, grouped by domain
```

**Rule followed:** JSX/logic (`.tsx`), styling (`.css` / `.module.css`), and data-fetching
logic (`api/`, `hooks/`) are always in separate files — never mixed in one file.

## Local Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```
Default already points to `http://localhost:5000/api/v1` (your backend). Change only if
your backend runs on a different port.

### 3. Run dev server
```bash
npm run dev
```
Opens at: `http://localhost:3000`

### 4. Login
Use the Super Admin account created by the backend seed script:
- Email: `admin@technocraftx.com`
- Password: `ChangeMe123!`

## What's Built (Phase 1 so far)

- ✅ Login (COMPANY accounts only — law firm/lawyer accounts are rejected with a message)
- ✅ Dashboard with live stat cards (total/pending/active firms, courts)
- ✅ Law Firm management (list, filter by status, search, approve, suspend, reactivate)
- ✅ Court management (list, create, deactivate, activate)
- ✅ Persistent session (Zustand + localStorage) — refresh-safe login
- ✅ Auto-logout on expired/invalid token (401 interceptor)

## Next to Build
- Company Staff & RBAC management screens
- Legal Library management
- Notification Center
- Audit Log viewer
- Platform analytics charts (Phase 3)
