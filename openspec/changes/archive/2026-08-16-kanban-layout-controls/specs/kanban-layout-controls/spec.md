## Purpose

Provides layout utility controls for the navigation sidebar, browser fullscreen API, and individual Kanban columns to maximize visual workspace.

## ADDED Requirements

### Requirement: Collapsible Sidebar Control
The system SHALL support toggling the sidebar navigation menu between its default wide layout (`w-64`) and a minimized icon-only view (`w-16`).

#### Scenario: Toggling Sidebar to Collapsed
- **WHEN** the user clicks the sidebar toggle button in the sidebar or navbar
- **THEN** the system SHALL contract the navigation menu and reduce the left padding on the main dashboard container from 64 to 16 units

#### Scenario: Toggling Sidebar to Expanded
- **WHEN** the user clicks the sidebar toggle button while in collapsed state
- **THEN** the system SHALL expand the navigation menu and restore the left padding on the main container to 64 units

### Requirement: Fullscreen View Mode
The system SHALL support standard browser fullscreen mode activation from the user interface.

#### Scenario: Toggling Fullscreen Mode
- **WHEN** the user clicks the fullscreen trigger button in the navbar
- **THEN** the system SHALL request the browser to enter fullscreen mode using the standard Screen/Element API

### Requirement: Collapsible Kanban Column Lanes
The system SHALL support collapsing and expanding individual status columns on the Kanban board (from Backlog to Done).

#### Scenario: Collapsing Column Lane
- **WHEN** the user clicks the collapse icon button on any Kanban column header
- **THEN** the system SHALL collapse that column horizontally to a narrow strip, display its title vertically, and hide its task cards loop

#### Scenario: Expanding Column Lane
- **WHEN** the user clicks the expand icon button on a collapsed column strip
- **THEN** the system SHALL expand that column to its default size and display its task cards list
