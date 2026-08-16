## ADDED Requirements

### Requirement: Frontend Control For Marking Notifications Read
The frontend SHALL provide a user-facing control that invokes `POST /api/v1/notifications/read` and reflects the cleared unread state in the notification badge.

#### Scenario: User marks all notifications read
- **WHEN** the user clicks the "mark all read" control in the Slack/System notification drawer
- **THEN** the client SHALL call `POST /api/v1/notifications/read` and the unread notification badge SHALL clear
