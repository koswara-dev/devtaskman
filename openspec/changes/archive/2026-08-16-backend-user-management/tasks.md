## 1. Relational Schema & Cascades

- [x] 1.1 Update `backend/src/db/db.ts` table queries to support `ON DELETE SET NULL` on task assignments when users are removed.

## 2. User CRUD Operations

- [x] 2.1 Implement `POST /api/users` endpoint to register new user accounts (Admin-only) in `backend/src/controllers/userController.ts` and `backend/src/routes/userRoutes.ts`.
- [x] 2.2 Implement `PUT /api/users/:id` endpoint to modify details (Admin-only for role modifications) in `userController.ts` and `userRoutes.ts`.
- [x] 2.3 Implement `DELETE /api/users/:id` endpoint to terminate user accounts (Admin-only) in `userController.ts` and `userRoutes.ts`.
