## Purpose

Defines administrative User Account CRUD operations, including profile updates, role adjustments, and account deletion workflows.

## ADDED Requirements

### Requirement: Fetch Users Listing
The system SHALL expose an endpoint returning all user accounts registered in the database.

#### Scenario: Retrieve All Registered Accounts
- **WHEN** the client initiates a GET request to `/api/users`
- **THEN** the server SHALL return a JSON array containing all user profile records with HTTP status code 200

### Requirement: Administrative User Account Mutations
The system SHALL allow only users authenticated with the `Admin` role to register new user profiles, change active roles, or delete user accounts.

#### Scenario: Admin Deletes User Profile
- **WHEN** a user with the `Admin` role issues a DELETE request to `/api/users/u5`
- **THEN** the server SHALL remove the user from the database and respond with HTTP status code 200

#### Scenario: Non-Admin Blocked from User Deletion
- **WHEN** a user with the `Developer` role issues a DELETE request to `/api/users/u5`
- **THEN** the server SHALL block the operation and return HTTP status code 403
