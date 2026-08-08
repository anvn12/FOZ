# Moderator UI Feature Specification

## Overview
Implement the Moderator Dashboard and Reports Queue to allow Moderators to view, review, and manage user reports in the FOZ application.

## User Scenarios
1. **Moderator Views Dashboard**: A logged-in Moderator accesses `/moderator` to view system metrics and moderation queue status.
2. **Moderator Reviews Reports**: A logged-in Moderator accesses `/moderator/queue` to view the list of pending reports, including details about the target content and reason.
3. **Moderator Dismisses Report**: A Moderator determines a report is invalid or doesn't violate rules, clicking "Dismiss" to close the report.
4. **Moderator Escalates Report**: A Moderator determines a report requires Admin action (e.g., banning user, deleting content permanently), clicking "Escalate" to forward it to Administrators.

## Functional Requirements
- **FR-001 (Role Enforcement)**: The `/moderator` routes and backend `/api/v1/moderation` endpoints MUST only be accessible to users with the `moderator` or `administrator` role. Standard users and guests MUST be denied access (403 Forbidden / Redirect to Homepage).
- **FR-002 (Dashboard Metrics)**: The dashboard MUST display metrics including total reports and pending reports.
- **FR-003 (Reports List)**: The system MUST display a list of reports, showing the report target, reporter, reason, timestamp, and current status.
- **FR-004 (Report Actions)**: Moderators MUST be able to change a report's status to `dismissed` or `escalated`.
- **FR-005 (Audit Trail)**: Changing a report status MUST update the `reports` table in the database.

## Non-Functional Requirements
- **NFR-001 (UI Consistency)**: The UI MUST strictly follow the HTML templates in `docs/ui-designs/moderator`.
- **NFR-002 (Accessibility)**: The UI MUST adhere to WCAG 2.1 AA (Constitution Principle VII).
- **NFR-003 (Security)**: Endpoints MUST be protected by role-based access control (RBAC).

## Success Criteria
- Moderators can access the dashboard and see metrics.
- Moderators can view pending reports.
- Moderators can successfully dismiss or escalate a report, and the database updates correctly.
- Non-moderator users are explicitly blocked from these views and endpoints.
