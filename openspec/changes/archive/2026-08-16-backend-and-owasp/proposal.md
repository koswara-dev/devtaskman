## Why

The current prototype runs entirely client-side, storing task state in LocalStorage. To support authentic multi-user operations, the system must separate the frontend code from a secure server. We will create distinct `/frontend` and `/backend` directories, move the React files, and establish an ExpressJS backend implementing the OWASP Top 10 2021 security standards.

## What Changes

- **Project Reorganization (BREAKING)**: Create a monorepo structure. Move the existing React-Vite frontend files into a `/frontend` subdirectory.
- **ExpressJS Backend Service**: Create a backend server under `/backend` with endpoints to retrieve and modify tasks, users, logs, and notification alerts.
- **Frontend API Integration**: Swap local context mocks inside `DevTaskContext` with fetch operations pointing to the Express backend.
- **OWASP Top 10 2021 Security Mitigations**:
  - **A01:2021-Broken Access Control**: Implement role authorization middlewares on mutation endpoints.
  - **A03:2021-Injection**: Apply schema-based request validation and string sanitization.
  - **A04:2021-Insecure Design / A05:2021-Security Misconfiguration**: Configure Helmet secure headers, CORS constraints, and API rate limits.

## Capabilities

### New Capabilities
- `backend-rest-api`: REST API endpoints mapping task actions, notifications, and reset hooks.
- `backend-security-owasp`: Security requirements incorporating rate limiting, helmet headers, input validation, and custom Role-based Access Control (RBAC).

### Modified Capabilities
- None

## Impact

- All root level React and Vite files (e.g. `src/`, `public/`, `package.json`) are relocated to `/frontend`.
- A new package configuration (`package.json`, `index.js`, security middlewares) is introduced under `/backend`.
- `src/context/DevTaskContext.tsx` is updated to trigger asynchronous HTTP calls instead of modifying LocalStorage directly.
