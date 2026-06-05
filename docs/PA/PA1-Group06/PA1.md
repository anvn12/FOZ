# PA1

# B - Project Proposal

## Introduction

This project is a web-based forum application focused on fundamental community discussions. Its value lies in providing a simple, intuitive platform where users can easily ask questions, share knowledge, and connect over shared interests without navigating overly complex interfaces.

## Target users and environments

The target audience is general **web** users seeking online community spaces. They will use the application exclusively through standard web browsers on any internet-connected device, including desktop computers, laptops, and smartphones.

## Key features

**Post Creation:** Users can easily create text-based posts to initiate new discussion threads on topics they care about. This feature allows users to share their thoughts, ask questions, and start conversations with the community.

**Feed Generation:** The application will generate a feed of posts based on current trends, calculated by recent engagement metrics like comment velocity and like counts. This ensures that users see content that is relevant to them, enhancing their overall experience on the platform.

**User Interactions:** Members can browse existing threads, read ongoing discussions, and interact by leaving their own comments or likes. This fosters engagement and allows users to contribute to the community dialogue.

**Search & Discovery:** Users can search for specific topics, posts, or other users to find relevant content. This feature helps users discover desired discussions and enhance their overall experience.

**Administration & Moderation:** The application includes a robust reporting system that allows users to report inappropriate content. Moderators can review these reports and forwarding them to administrators for further review or removing offending content. This helps maintain a safe and respectful community environment.

### AI feature

**Post Summarize (TL;DR):** The application utilizes an AI engine to generate brief on-demand overviews of lengthy discussion posts. This feature helps users quickly understand the main points of a conversation without having to read through every comment, making it easier to stay informed and engaged with the community discussions.

### User Roles

| Role | Description |
| --- | --- |
| Guest (Unauthenticated User) | Can view profiles, read posts, and see comments. Cannot post, like, report. Any interaction attempt should trigger the authentication flow. |
| Standard User (Authenticated User) | Can create posts, like, comment, report, and delete their own content. Can manage their own profile. |
| Moderator | Inherits all Standard User abilities. Can review reports from Standard Users, then forward to Administrator if needed. Cannot delete users or posts from the database or alter system-wide configurations. |
| Administrator | This is the highest level of access. Complete access over all database records. Can permanently remove users account, instantly delete any content, assign Moderator roles. |

### Functional Groups

| Group Name | Functions |
| --- | --- |
| Authentication | Sign up, log in, log out |
| Profile management | Edit profile info, change password, change avatar |
| Post Creation | Creating a new post, deleting posts (restricted by the post owner check) |
| Feed Generation | Post recommendation |
| User Interactions | Comment to the post, like/unlike a post or comment. |
| Search & Discovery | User profile or post search |
| Administration & Moderation | User reporting system (Standard User can report posts), Moderator reporting system (review the reports from users and forward to admin), Admin reporting system (post removal and user removal. Assign Moderator) |
| Post Summarize | On-demand summarization inside a post. |

# C - Existing App Survey

# D - Team Contract

## 1. Team Roles and Responsibilities

> **Note:** *All team members are expected to act as **Full-Stack Engineers** throughout the project lifecycle. The roles below designate leadership and domain ownership for specific project phases, meaning the assigned member will guide and manage that area while the entire team participates in the execution.*
> 

| Member | Role | Responsibilities |
| --- | --- | --- |
| Nguyễn Tuấn An (24127011) | Project Manager | Facilitates meetings, tracks sprint progress, manages the project board (Jira), and ensures deadlines are met. Contributes to full-stack development. |
| Member 2 | UI/UX Designer | Leads the wireframing, prototyping, and user journey mapping phases. Ensures design consistency across the application. Guides the team during frontend UI implementation. Contributes to full-stack development. |
| Member 4 | Backend & Database Developer | Designs the database schema, establishes API architectures, and leads server-side performance strategies. Guides the team on database queries and backend logic. Contributes to full-stack development. |
| Member 5 | QA Engineer (Tester) | Defines testing protocols. Leads the team in writing test cases and performing bug hunts. Contributes to full-stack development. |
| Võ An Phú (24127494) | Frontend Developer | Establishes frontend coding standards, selects frontend frameworks/libraries, and ensures responsive, accessible design implementation. Contributes to full-stack development. |

## 2. Communication Plan

- **Primary Communication Tool:** Messenger and Discord (Messenger used for daily communications, quick questions. Discord for updates).
- **Meeting Frequency:**
    - **Weekly Sync:** One 60-minute video meeting to plan the week’s sprint.
    - **Frequent Stand-up:** Asynchronous update via a dedicated Discord thread (What I did yesterday, what I am doing today, any blockers).
- **Response Time Expectations:** Team members are expected to acknowledge or respond to direct messages in Discord within **12 hours** (or 24 hours on weekends). Deliverables must be submitted to the shared repository at least 4 hours before any hard deadline to allow for integration.
- **Protocols:** General discussions happen in the main Discord group; technical deep-dives should happen on a quick call or a dedicated thread to avoid cluttering the main chat.

## 3. Work Schedule and Deadlines

- **Milestones:** The project will be divided into 2-week Sprints. Deadlines for specific features will be set during the Weekly Sync.
- **Availability:** Team members agree to hold core availability between 7:00 PM - 9:30 PM on weekdays for pair programming if necessary.
- **Contingency Plan for Missed Deadlines:**
    - If a team member anticipates missing a deadline, they must notify the Project Manager at least **24 hours in advance**.
    - Tasks will be re-assigned or pair-programmed to ensure the critical path is not blocked.
    - A 2-day “buffer” will be built into all major project milestones to absorb unexpected delays.

## 4. Code and Documentation Standards

- **Coding Conventions:** The team will adhere to standard linting rules by using an automatic formatter named Prettier.
- **Version Control (Git):**
    - Use branches to contribute new features or modifications (e.g., `add-login`).
    - Never push directly to the `main` branch.
- **Code Reviews:** All code must be submitted via Pull Requests (PRs). One team member must review the PR before it can be merged.
- **Testing:** Critical backend endpoints and core frontend components must have accompanying unit tests.
- **Documentation:**
    - Code must be self-documenting with inline comments for complex logic.
    - The project must maintain an up-to-date `README.md` containing setup instructions.
    - API endpoints must be documented.

## 5. Accountability and Performance

- **Measuring Contribution:** Performance is measured by the successful completion of assigned sprint tasks, participation in code reviews or refactors, and attendance at team meetings.
- **Underperformance Process:**
1. **First Instance:** The Project Manager will have a private, constructive conversation with the member to identify blockers and offer support.
2. **Second Instance:** A formal team meeting will be held to discuss the lack of participation and re-align expectations.
3. **Third Instance:** The issue will be officially documented and escalated (see Section 7).
- **Consequences:** Persistent failure to adhere to the contract will result in reduced peer evaluation scores and, ultimately, escalation to the instructors for intervention.

## 6. Decision-Making Process

- **Standard Decisions:** Day-to-day decisions regarding technology choices or features will be made by **consensus** where possible.
- **Voting:** If consensus cannot be reached, decisions will go to a **majority vote** (3 out of 5 members).
- **Final Say:** In the event of a critical stall or an unresolvable technical tie, the Project Manager holds the final executive say for project management issues, while domain leads hold the final say in their respective domains (e.g., Frontend Lead chooses the UI framework if the team is split).

## 7. Conflict Resolution

- **Step 1 (Peer-to-Peer):** The involved members should attempt to resolve the issue directly and professionally via a private call.
- **Step 2 (Mediation):** If unresolved, the Project Manager will step in to mediate the discussion and find a compromise. (If the PM is involved in the conflict, a neutral domain lead will mediate).
- **Step 3 (Escalation):** If the conflict threatens the integrity of the project or creates a toxic environment, the team will formally escalate the issue to the Teaching Assistant (TA) or Instructor for official mediation.

## 8. Review and Update Process

- **Review Schedule:** This contract will be briefly reviewed once a month to ensure it is still serving the team’s needs.
- **Update Process:** Any team member can propose an amendment to the contract. Amendments will be adopted if they pass a simple majority vote (3/5) during a weekly sync.

# E - Development Tools and Process Setup
