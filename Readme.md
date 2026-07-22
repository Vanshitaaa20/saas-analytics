# Multi-Tenant SaaS Analytics Platform

A mini analytics SaaS: organizations send events through an ingestion API, a queue-backed worker aggregates usage into rollups, and a dashboard visualizes analytics — with JWT auth, role-based access control, and tenant isolation throughout.

**Stack:** Next.js (TypeScript, Tailwind) · NestJS · PostgreSQL · Prisma · Redis · BullMQ

---

<img width="1918" height="905" alt="image" src="https://github.com/user-attachments/assets/f7a6a6b6-41a1-4ef8-a9b5-8b8367858120" />

## Architecture

```
┌─────────────┐       ┌──────────────────────────────┐       ┌─────────────┐
│   Next.js   │──────▶│           NestJS API          │──────▶│  PostgreSQL │
│  Frontend   │       │  Auth · Org/RBAC · Ingestion  │       │  (Prisma)   │
│  (web/)     │◀──────│  Dashboard                    │◀──────│             │
└─────────────┘       └──────────────┬────────────────┘       └─────────────┘
                                      │
                              ┌───────▼────────┐
                              │  Redis + BullMQ │
                              │  (event queue)  │
                              └───────┬────────┘
                                      │
                              ┌───────▼────────┐
                              │  Ingestion      │
                              │  Worker         │
                              │  (rollup writer)│
                              └────────────────┘
```

**Request lifecycle for an ingested event:**
1. Authenticated request hits `POST /orgs/:orgId/events`
2. `JwtAuthGuard` validates the token, attaches `{ userId, email }` to the request
3. `IngestionService` checks the org's plan-tier daily event cap (Postgres count query) before accepting
4. Event is pushed onto a BullMQ queue backed by Redis — the HTTP response returns immediately (`{ queued: true }`)
5. `IngestionProcessor` (separate worker process/handler) consumes the queue asynchronously: writes the raw `Event` row, then `upsert`s the matching hourly `Rollup` row (atomic increment)
6. Dashboard endpoints read from `Rollup`/`Event` tables, scoped strictly by `orgId`

---

## Data Model

| Model | Purpose |
|---|---|
| `Organization` | A tenant. Holds `planTier` (FREE/PRO). |
| `User` | An account; can belong to multiple orgs. |
| `Membership` | Join table: `userId` + `orgId` + `role` (OWNER/ADMIN/MEMBER). Unique per user-org pair — this is the tenant-isolation and RBAC backbone. |
| `Invite` | Pending invitation, keyed by `email` (not `userId`, since the invitee may not have an account yet) + a random `token`. Converted to a `Membership` on acceptance, then deleted. |
| `RefreshToken` | Long-lived, revocable credential. Stored as a **SHA-256 hash**, never raw — mitigates impact of a DB leak. |
| `Event` | Raw ingested event: `orgId`, `name`, `payload`, `createdAt`. |
| `Rollup` | Aggregated counts per `orgId` + `bucketType` (hourly) + `bucketAt` + `eventName`. Unique constraint enables atomic `upsert`-based incrementing instead of per-event row scans. |

---

## Auth & Security

- **JWT access tokens** (15 min expiry, stateless) + **refresh tokens** (7 days, DB-backed, revocable) — short-lived access tokens limit exposure if leaked; refresh tokens let the DB actually revoke a session.
- **Refresh tokens are hashed (SHA-256)** before storage, not encrypted or stored raw — same breach-mitigation principle as password hashing, but a fast hash is appropriate here since refresh tokens are high-entropy random strings (not brute-forceable the way human-chosen passwords are), unlike bcrypt for passwords.
- **Generic "Invalid credentials" error** on both login failure modes (wrong email vs. wrong password) — prevents user enumeration.
- **RBAC via `Membership.role`**, enforced with a `RolesGuard` reading `@Roles()` metadata + a DB lookup scoped to `userId` + `orgId`.
- **Tenant isolation enforced at the query layer**, not just the route guard — every service method that reads org-scoped data explicitly filters by `orgId` and checks the requester's `Membership` before returning data.

---

## Known Limitations & Tradeoffs

Documented honestly rather than hidden — these are the kinds of decisions any real engineering team makes under time constraints.

- **Billing (Stripe/Razorpay) not integrated.** Both Stripe and Razorpay require business KYC / invite-based access in India that wasn't obtainable in the project timeline. `Organization.planTier` and plan-based rate limiting are fully implemented and functional standalone — only the payment-processor subscription/webhook layer is unbuilt. In production, this would plug in as: `POST /orgs/:orgId/billing/subscribe` → processor checkout → webhook updates `planTier` idempotently (the webhook idempotency and transaction patterns used elsewhere in this codebase — e.g. invite acceptance — would extend directly to this).
- **Invite email delivery not implemented.** `Invite` tokens are generated and stored correctly, and the accept flow (`POST /orgs/invites/accept`) is fully functional — but no email is actually sent. In production, this would integrate a transactional email service (Resend/SendGrid) to email the invite link (`/accept-invite?token=...`) rather than requiring the token to be shared manually.
- **Rate limiting counts `Event` rows directly** (a Postgres `count()` query per ingestion request) rather than using a Redis-backed counter. This is simpler and correct for the current scale, but a high-throughput production system would move this to an in-memory counter (incremented on ingest, expired at midnight) to avoid a DB read on every single ingestion request.
- **Access tokens are stored in `localStorage`** on the frontend for simplicity. An httpOnly cookie would be more resistant to XSS-based token theft, but requires backend changes (cookie-based auth flow, CSRF protection) not implemented here.
- **Multi-step writes with hard dependencies are wrapped in `prisma.$transaction()`** (e.g., org-creation + owner-membership, invite-acceptance + invite-deletion) specifically to prevent partial-write bugs — an early version of this codebase surfaced exactly this failure mode (orphaned `User` rows with no `RefreshToken` after a token-signing error), which is what motivated the transaction pattern used throughout.

---

## Local Development Setup

### Prerequisites
- Node.js, Docker Desktop running

### 1. Start infrastructure
```bash
docker compose up -d
```
Starts Postgres (`localhost:5432`) and Redis (`localhost:6379`).

### 2. Backend
```bash
cd api
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev
```
Set up `.env` in `api/` first:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/saas_analytics?schema=public"
REDIS_URL="redis://localhost:6379"
PORT=3000
JWT_ACCESS_SECRET="your-dev-secret"
JWT_REFRESH_SECRET="your-dev-secret"
```
Verify: `GET http://localhost:3000/health` → `{"status":"ok","db":"connected"}`

### 3. Frontend
```bash
cd web
npm install
npm run dev
```
Runs at `http://localhost:3001` (adjust `CORS` origin in `api/src/main.ts` if your port differs).

---

## API Reference

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | — | Create account, returns access + refresh token |
| POST | `/auth/login` | — | Returns access + refresh token |
| POST | `/orgs` | JWT | Create org; caller becomes OWNER |
| GET | `/orgs/mine` | JWT | List orgs the caller belongs to |
| GET | `/orgs/:orgId/members` | JWT + member | List org members |
| POST | `/orgs/:orgId/invites` | JWT + OWNER/ADMIN | Create an invite |
| POST | `/orgs/invites/accept` | JWT | Accept an invite by token |
| POST | `/orgs/:orgId/events` | JWT + member | Ingest an event (queued) |
| GET | `/orgs/:orgId/dashboard/summary` | JWT + member | Total events, member count, plan tier |
| GET | `/orgs/:orgId/dashboard/top-events` | JWT + member | Event counts grouped by name |
| GET | `/orgs/:orgId/dashboard/event-volume` | JWT + member | Hourly rollup time series |
| GET | `/health` | — | DB connectivity check |

---

## What This Project Demonstrates

- Multi-tenant data modeling and query-layer isolation (not just route-level checks)
- JWT + refresh token auth with proper hashing and revocation design
- Role-based access control enforced via custom guards
- Async processing with a message queue (BullMQ/Redis) decoupling ingestion from aggregation
- Atomic multi-step writes via database transactions, including a real bug (orphaned rows) caught and reasoned through during development
- Honest scoping under real-world constraints (payment processor KYC blockers, timeline-driven feature cuts) — documented rather than hidden
