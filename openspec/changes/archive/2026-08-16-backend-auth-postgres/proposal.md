## Why

The current backend implementation relies on volatile, in-memory mock variables that reset whenever the process restarts. To ensure data persistence and prevent unauthorized access, we need to transition the storage engine to a PostgreSQL database and secure endpoint paths with a JWT-based authentication system.

## What Changes

- **PostgreSQL Database Storage**: Connect the Express backend to a PostgreSQL database containing relational tables for Users, Tasks, Comments, HistoryLogs, and Notifications.
- **Credential Hashing**: Apply secure salting and hashing (`bcryptjs`) to user passwords stored in the database.
- **JWT Auth Endpoints**: Add `/api/auth/register` and `/api/auth/login` to issue JSON Web Tokens (JWT) on success.
- **Route Authorization Verification**: Secure all task mutation and retrieval routes, demanding a valid JWT bearer token inside headers (`Authorization: Bearer <token>`).

## Capabilities

### New Capabilities
- `postgresql-database-integration`: Relational schema tables mapping, query pool setup, and database seeds utility.
- `jwt-user-authentication`: User registration/login endpoints, password salting, and request authorization middleware verification.

### Modified Capabilities
- None

## Impact

- `backend/package.json`: Adds `pg` (PostgreSQL client), `jsonwebtoken`, `bcryptjs`, and their types.
- `backend/src/index.ts`: Modifies database structures, configures pool query parameters, and attaches JWT validation rules to route scopes.
- `backend/src/db.ts` [NEW]: Database pool initialization and initial tables creation scripts.
