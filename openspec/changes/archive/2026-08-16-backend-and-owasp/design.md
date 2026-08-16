## Context

We are moving from a mock client state to a decoupled Client-Server architecture. The backend will serve REST API endpoints and integrate security guards corresponding to OWASP Top 10 requirements. See [proposal.md](file:///C:/Projects/fullstack/devtaskman/openspec/changes/backend-and-owasp/proposal.md) for detail on motivation.

## Goals / Non-Goals

**Goals:**
- Move existing React client code into `/frontend`.
- Build an ExpressJS backend in TypeScript under `/backend` with endpoints:
  - `GET /api/tasks`, `POST /api/tasks`, `PUT /api/tasks/:id`, `DELETE /api/tasks/:id`
  - `GET /api/users`, `PUT /api/users/:id/role`
  - `GET /api/notifications`, `POST /api/notifications/read`
  - `POST /api/reset` (restores default seed task dataset)
- Configure TypeScript compiler settings (`tsconfig.json`) and runtime support using `ts-node` inside the backend.
- Secure the backend with Helmet headers, CORS policies, express-validator validations, API rate limits, and custom Role-based Access Control (RBAC) verification middleware.
- Configure `frontend/src/context/DevTaskContext.tsx` to communicate with these backend endpoints.

**Non-Goals:**
- Configuring production Docker containers or Kubernetes services.
- Connecting to a permanent SQL/NoSQL database server. A file-based or in-memory seed controller is sufficient for this application prototype.

## Decisions

### 1. Codebase Directory Reorganization
- **Chosen Option**: Create a clean monorepo folder layout. Move all client files into `/frontend`. Place the new backend API files into `/backend`.
- **Rationale**: Keeps frontend and backend dependencies isolated, preventing version conflicts (e.g. Vite dev-dependencies interfering with backend package definitions).

### 2. OWASP Top 10 2021 Security Implementations
- **A01:2021-Broken Access Control**: Custom middleware verification. Checks the `X-User-Role` header on mutate requests. Blocks modifications if the active role doesn't have privileges (e.g., QA deleting tasks).
- **A03:2021-Injection**: Request validation using `express-validator` to sanitize inputs and enforce schema limits on Task title, status, and description fields.
- **A04:2021-Insecure Design / A05:2021-Security Misconfiguration**:
  - `helmet`: Inject secure headers (e.g., hiding `X-Powered-By`).
  - `cors`: Limit requests to the frontend port (`http://localhost:5173`).
  - `express-rate-limit`: Rate limit requests to 100 per 15 minutes.

### 3. Asynchronous Sync in DevTaskContext
- **Chosen Option**: Refactor state methods in `DevTaskContext.tsx` to trigger asynchronous `fetch` calls. Manage loading/error indicators while operations complete.

## Risks / Trade-offs

- **[Risk]** Dynamic CORS blocked requests during local runs on port mismatches.
  → **Mitigation**: Configure CORS origin parameters dynamically on the backend to match the client's Vite server address.
