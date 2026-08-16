## MODIFIED Requirements

### Requirement: Authentication Session Issuance
The system SHALL expose login endpoints validating credentials and returning signed JWT session tokens.

#### Scenario: Successful Login
- **WHEN** a user posts matching email and password credentials to `/api/v1/auth/login`
- **THEN** the server SHALL issue a JSON response containing a signed JWT token valid for 24 hours with HTTP status code 200

### Requirement: Protected Task Middleware Guard
The system SHALL validate the presence and authenticity of JWT bearer tokens in the authorization header before servicing route paths under `/api/v1/tasks`, `/api/v1/users`, and `/api/v1/notifications` (excluding the notification SSE stream, which cannot carry an Authorization header).

#### Scenario: Deny Unauthenticated Request
- **WHEN** a client issues an API call to create or update a task without providing a valid `Authorization: Bearer <token>` header
- **THEN** the server SHALL reject the request with HTTP status code 401
