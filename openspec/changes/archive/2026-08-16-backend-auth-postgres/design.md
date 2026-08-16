## Context

We are migrating the ExpressJS backend storage layer to a PostgreSQL database and protecting routes with signed JSON Web Tokens (JWT). See [proposal.md](file:///C:/Projects/fullstack/devtaskman/openspec/changes/backend-auth-postgres/proposal.md) for detail on motivation.

## Goals / Non-Goals

**Goals:**
- Connect the backend to PostgreSQL via the native `pg` client library.
- Set up connection pooling and table schema migrations in [backend/src/db/db.ts](file:///c:/Projects/fullstack/devtaskman/backend/src/db/db.ts).
- Seed tables on database launch if not already initialized.
- Implement `/api/auth/register` and `/api/auth/login` using `bcryptjs` for salting passwords and `jsonwebtoken` for session signing.
- Develop a `verifyJWT` middleware in `backend/src/middlewares/auth.ts` to validate request headers.
- Restructure project to follow a standard modular Express + TypeScript layout:
  - `backend/src/config/`: Environment configuration.
  - `backend/src/db/`: Relational database connection pool.
  - `backend/src/middlewares/`: JWT validators, rate limiters, validation errors, and custom RBAC authorizers.
  - `backend/src/controllers/`: Separate controller modules (`authController.ts`, `taskController.ts`, `userController.ts`).
  - `backend/src/routes/`: Distinct routing maps (`authRoutes.ts`, `taskRoutes.ts`, `userRoutes.ts`, `resetRoutes.ts`).
  - `backend/src/types/`: TS interfaces mapping express request typings.

**Non-Goals:**
- Designing complex multi-factor authentication (MFA) flows.
- Connecting to external PostgreSQL cloud clusters. The local service configuration is sufficient.

## Decisions

### 1. Database Client Integration (pg client)
- **Chosen Option**: Use standard `pg` (node-postgres) with connection pooling (`pg.Pool`).
- **Rationale**: Lightweight, direct control over SQL executions, and has minimal configuration overhead compared to ORMs (Prisma, Sequelize).

### 2. Password Cryptographic Salting (bcryptjs)
- **Chosen Option**: Salting passwords using `bcryptjs` with a work factor of 10.
- **Rationale**: Secure hashing algorithm (mitigates A02:2021 Cryptographic Failures) and does not require local node-gyp native compilation headers.

### 3. JWT Header Verification Middleware
- **Chosen Option**: Check incoming headers for `Authorization: Bearer <token>`. Verify using a local secret key.
  - Add verified payload (`id`, `role`, `name`) to `req.user`.
  - The downstream access control (RBAC) middleware checks `req.user.role` instead of client-supplied headers.

## Risks / Trade-offs

- **[Risk]** SQL Injection vulnerability when inserting parameters.
  → **Mitigation**: Strictly use parameterized SQL queries (e.g. `$1, $2` variables) for all select/insert/update operations (mitigates A03:2021 Injection).
