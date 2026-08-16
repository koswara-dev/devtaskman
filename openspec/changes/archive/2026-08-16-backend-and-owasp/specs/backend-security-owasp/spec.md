## Purpose

Establishes API security controls on the ExpressJS server, mitigating security risks in compliance with the OWASP Top 10 2021 guidelines.

## ADDED Requirements

### Requirement: CORS Constraints
The backend server SHALL restrict resource sharing by defining explicit CORS settings to only trust requests originating from the React client.

#### Scenario: Blocking Unauthorized Origin Requests
- **WHEN** a client initiates an HTTP request from an unrecognized origin (e.g. `http://attacker.com`)
- **THEN** the backend server SHALL deny cross-origin resource sharing access

### Requirement: API Rate Limiting
The backend server SHALL throttle API requests per IP address to prevent denial-of-service and brute-force traffic.

#### Scenario: Triggering Rate Limiter Block
- **WHEN** an IP address sends more than 100 requests to `/api/` endpoints within a 15-minute period
- **THEN** the backend server SHALL reject subsequent requests with HTTP status code 429

### Requirement: Input Schema Validation & Sanitization
The backend server SHALL validate payload structures and sanitize inputs for all write operations (`POST`/`PUT`) to protect against injection (A03:2021).

#### Scenario: Rejecting Injection & Malformed Payloads
- **WHEN** a client POST payload contains HTML script tags or violates schema validation constraints
- **THEN** the backend server SHALL reject the write transaction with HTTP status code 400

### Requirement: Role-Based Authorization Guards
The backend server SHALL verify the active role permissions of requesting users (based on `X-User-Role` headers) before executing mutations, enforcing proper Access Control (A01:2021).

#### Scenario: Blocking Unauthorized Deletion
- **WHEN** a user with the `Developer` role initiates a DELETE request to `/api/tasks/TSK-103`
- **THEN** the backend server SHALL block the operation and respond with HTTP status code 403
