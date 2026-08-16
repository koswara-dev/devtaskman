# task-comments-api Specification

## Purpose
Defines endpoint requirements to append stand-alone text comments to specific task items.

## Requirements

### Requirement: Post Comment To Task
The system SHALL expose a `POST /api/v1/tasks/:id/comments` endpoint allowing authenticated users to add comments to cards.

#### Scenario: Successfully Post Card Comment
- **WHEN** an authenticated user posts a valid comment payload containing the text string to `/api/v1/tasks/TSK-103/comments`
- **THEN** the server SHALL store the comment, append a history log entry, and return the new comment object with HTTP status code 201
