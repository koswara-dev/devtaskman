## Purpose

Defines user registration, credentials hashing, login verification, and JSON Web Token (JWT) authorization guards on protected route paths.

## ADDED Requirements

### Requirement: Secure Password Hashing
The system SHALL salt and hash user passwords using standard bcrypt hash routines before writing credentials to storage.

#### Scenario: Verify Hashed Storage Format
- **WHEN** a new user registers with a plaintext password
- **THEN** the server SHALL compute its bcrypt hash and store only the secure hashed string in the database

### Requirement: Authentication Session Issuance
The system SHALL expose login endpoints validating credentials and returning signed JWT session tokens.

#### Scenario: Successful Login
- **WHEN** a user posts matching email and password credentials to `/api/auth/login`
- **THEN** the server SHALL issue a JSON response containing a signed JWT token valid for 24 hours with HTTP status code 200

### Requirement: Protected Task Middleware Guard
The system SHALL validate the presence and authenticity of JWT bearer tokens in the authorization header before servicing route paths under `/api/tasks`.

#### Scenario: Deny Unauthenticated Request
- **WHEN** a client issues an API call to create or update a task without providing a valid `Authorization: Bearer <token>` header
- **THEN** the server SHALL reject the request with HTTP status code 401
