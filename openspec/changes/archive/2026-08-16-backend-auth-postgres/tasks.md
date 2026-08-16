## 1. Database Library Setup & Schema

- [x] 1.1 Add dependencies `pg`, `jsonwebtoken`, `bcryptjs`, and devDependencies `@types/pg`, `@types/jsonwebtoken`, `@types/bcryptjs` inside `backend/package.json`.
- [x] 1.2 Create database connection helper `backend/src/db/db.ts` initializing a connection pool and executing table queries (users, tasks, logs, comments, notifications).

## 2. Authentication Controllers & Routers

- [x] 2.1 Add authentication router (`backend/src/routes/authRoutes.ts`) and controller (`backend/src/controllers/authController.ts`) for registration (`POST /api/auth/register`) hashing passwords using bcrypt.
- [x] 2.2 Add login validation route (`POST /api/auth/login`) in `authController.ts` verifying credentials and returning signed JSON Web Tokens (JWT).

## 3. Modular Routers, Controllers, & Middlewares

- [x] 3.1 Implement a `verifyJWT` request authentication middleware in `backend/src/middlewares/auth.ts`.
- [x] 3.2 Separate endpoint controllers (`taskController.ts`, `userController.ts`) and register route handlers (`taskRoutes.ts`, `userRoutes.ts`, `resetRoutes.ts`) mapping protected access paths.
