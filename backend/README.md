# NyayaOne Backend — Phase 0 / Phase 1 Foundation

Legal Technology Platform backend for TrailBlaze Tech.
Clean Architecture: `controller → service → repository → database`.

## Local Setup (Ubuntu)

Run these commands **inside the `backend/` folder** in order.

### 1. Install dependencies
```bash
npm install
```

### 2. Start local PostgreSQL (Docker)
```bash
docker compose up -d
```
Check it's running:
```bash
docker ps
```

### 3. Create your .env file
```bash
cp .env.example .env
```
Open `.env` and replace `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` with random strings.
You can generate strong secrets with:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```
Run it twice and paste each result into the two JWT secret fields.

### 4. Generate Prisma client + run migration
```bash
npm run prisma:generate
npm run prisma:migrate
```
When prompted for a migration name, type: `init`

### 5. Seed the database (creates first Super Admin)
```bash
npm run prisma:seed
```
This creates:
- Login: `admin@trailblazetech.com`
- Password: `ChangeMe123!`

⚠️ Change this password after first login (once the "change password" endpoint is built).

### 6. Run the dev server
```bash
npm run dev
```

Server runs at: `http://localhost:5000/api/v1`

### 7. Test it
```bash
curl http://localhost:5000/api/v1/health
```
Expected response:
```json
{"success":true,"message":"NyayaOne API is running","timestamp":"..."}
```

Test login:
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@trailblazetech.com","password":"ChangeMe123!"}'
```

### 8. Inspect the database visually (optional)
```bash
npm run prisma:studio
```
Opens a browser UI at `http://localhost:5555` to view/edit tables.

---

## Project Structure

```
src/
  config/          → environment config
  common/
    errors/        → AppError class
    middleware/     → auth, authorize, error handler
    utils/          → jwt, password hashing, logger
  database/        → Prisma client singleton
  modules/
    auth/          → controller, service, repository, dto, routes
    lawfirm/       → (next module to build)
    user/
    court/
    case/
    hearing/
    document/
    notification/
    report/
  app.ts           → Express app + middleware stack
  server.ts        → server bootstrap
prisma/
  schema.prisma    → full multi-tenant database schema
  seed.ts          → bootstraps Super Admin + RBAC roles
```

## Architecture Rules

- **Controller**: HTTP only (parse request, call service, send response). No business logic.
- **Service**: All business logic, validation rules, orchestration.
- **Repository**: All Prisma/database queries. Nothing else touches `prisma` directly.
- **Multi-tenancy**: every query for law-firm-scoped data MUST filter by `lawFirmId` from `req.auth.lawFirmId`.

## What's Built So Far (Phase 0)

- ✅ Multi-tenant database schema (LawFirm, User, Client, Case, Hearing, Document, Court, Library, Notifications, RBAC, AuditLog)
- ✅ JWT authentication (access + refresh tokens)
- ✅ Law firm self-registration (pending approval workflow)
- ✅ Login / Refresh / Logout
- ✅ Global error handling
- ✅ RBAC foundation (Role/Permission tables + seed data)
- ✅ Audit log table (ready to be used by services)

## What's Next (Phase 1)

- Law Firm module (Company approves/suspends firms)
- User module (lawyer/staff management within a firm)
- Court module
- Case module
- Hearing module + automatic reminder scheduler
- Document upload (local storage first, cloud-swappable later)
- Notification module
- Company Control Center dashboard APIs
