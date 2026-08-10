<div style="text-align: center; margin: 0 auto; padding: 40px 20px; min-height: 85vh; display: flex; flex-direction: column;">
  <div style="text-transform: uppercase; line-height: 1.8;">
    <div>VNUHCM - University of Science</div>
    <div>Faculty of Information Technology</div>
  </div>

  <div style="border-top: 2px solid black; margin: 30px 0;"></div>

  <div style="margin: 20px 0;">
    <h1 style="margin: 0; padding: 0 0 10px 0; font-size: 2.2em; border: none;">PA5 Report</h1>
    <div style="font-size: 1.2em; font-weight: bold;">Group 6: PDF</div>
  </div>

  <div style="border-top: 2px solid black; margin: 30px 0;"></div>

  <div style="font-size: 1.2em; font-weight: bold; margin-bottom: 40px;">
    CSC13002 - Introduction to Software Engineering
  </div>

  <div style="display: flex; justify-content: space-between; margin: 0 5%; text-align: left; line-height: 1.8;">
    <div style="width: 50%;">
      <div style="font-style: italic;">Author:</div>
      <div>Nguyễn Tuấn An - 24127011</div>
      <div>Nguyễn Hải Nam - 24127088</div>
      <div>Nguyễn Hải Trọng - 24127311</div>
      <div>Phạm Đinh Gia Khánh - 24127420</div>
      <div>Võ An Phú - 24127494</div>
    </div>
    <div style="width: 45%;">
      <div style="font-style: italic;">Lecturer:</div>
      <div>Ms. Nguyễn Thị Minh Tuyền</div>
      <div>Mr. Hồ Tuấn Thanh</div>
      <div>Mr. Mai Anh Tuấn</div>
    </div>
  </div>

  <div style="margin-top: auto; padding-top: 60px;">
    July 21, 2026
  </div>
</div>

<div style="page-break-after: always;"></div>

# Table of Contents

1. [A - How to add Table of Contents](#a---how-to-add-table-of-contents)
	1. [1. Requirements](#1-requirements)
		1. [1.1. How to export to PDF](#11-how-to-export-to-pdf)
2. [B - Export to PDF](#b---export-to-pdf)
	1. [1. Requirements](#1-requirements)
		1. [1.1 How to export to PDF](#11-how-to-export-to-pdf)
3. [C - Diagram example](#c---diagram-example)
	1. [1. Diagram rules](#1-diagram-rules)
4. [D - Image example](#d---image-example)
	1. [1. Insert image rule](#1-insert-image-rule)

<div style="page-break-after: always;"></div>

# A - Test Plan and Test Cases
*Work performed by: Nguyen Hai Nam | Reviewed and Edited by: Nguyen Hai Nam,*

## 1. Test Plan

### 1.1 Test Objectives and Scope

#### 1.1.1 Test Objectives

* **Primary Functional Correctness:** To verify that the core user flows of the FOZ forum perform according to specifications without critical errors or UI breakdowns.

* **Role-Based Access Control:** To ensure proper privilege segregation across user roles (`Guest`, `Standard User`, `Moderator`, and `Administrator`), specifically validating that elevated administrative actions are restricted strictly to authorized admin accounts.

* **AI Feature Validation:** To validate the functional correctness of the AI-powered `Post Summarization` feature, ensuring that it produces accurate TL;DR summaries via the Google Gemini API integration and handles missing API keys smoothly via fallback mechanisms.

* **Defect Tracking & Reporting:** To execute manual test cases, identify bugs or regressions, and log detailed reports for developers to fix.

#### 1.1.2 Test Scope

##### 1.1.2.1 In-Scope

* **Target Use Cases:** Manual functional testing of the 5 chosen use cases: UC-02, UC-10, UC-12, UC-14, UC-21.

* **Full-Stack Integration:** Web frontend interaction (Vite/Client) interacting with backend API routes (`/api/v1/...`) and PostgreSQL persistence via Drizzle ORM.

* **Browser Compatibility:** Basic UI and functional checks on modern browsers (e.g., Google Chrome, Microsoft Edge).

##### 1.1.2.2 Out-of-Scope

* **Non-functional Requirements:** Load testing, stress testing, high-concurrency scaling, and deep security penetration auditing.

* **Unselected Use Cases:** Features outside the 5 selected use cases (such as full text search discovery or avatar customization).

* **Native Mobile Applications:** Testing is strictly limited to desktop/responsive web environments.

* **Test Automation:** Writing or executing automated test scripts (e.g., Unit, E2E testing).

### 1.2 Features to be tested

* UC-02 - Log In (Authentication & Authorization)

* UC-10 - Create Post (Post Management)

* UC-12 - Leave Comments (User Interaction)

* UC-14 - Request AI Summary (Post Summarization)

* UC-21: Assign Moderator Role (Administration & Moderation)

### 1.3 Test Environment and Tools

#### 1.3.1 Operating and Execution Environment

* **Operating System:** Windows 11 / Linux (Ubuntu 24.04 LTS / WSL2)

* **Frontend Environment:** Vite, React, dev server on `http://localhost:5173`.

* **Backend Environment:** Express, Drizzle ORM, dev server on `http://localhost:4000`.

* **Database Container:** PostgreSQL `v16+` running via Docker exposed on port `5432`.

#### 1.3.2 Test and Inspection Tools

*   **Web Browsers:** Google Chrome and Microsoft Edge for manual functional UI execution and responsive viewport checks.

*   **Browser Developer Tools:** Chrome DevTools and Microsoft Edge DevTools (Console, Network, etc.)

*   **Database Inspection GUI:** Drizzle Studio (`npx drizzle-kit studio`) to inspect real-time table state changes in PostgreSQL (users, posts, comments, roles, etc.).

*   **External Services & API Keys:** Google AI Studio API key for AI summarization testing.

*   **Source Code & Environment Management:** Git version control, Docker Engine for database containerization, VS Code and Antigravity IDE.

### 1.4 Test Schedule and Responsibilities

#### 1.4.1 Test Responsibilities

| Role / Responsibility | Assigned Team Member | Specific Tasks & Deliverables |
| --- | --- | --- |
| **Test Planning** | Nguyen Hai Nam | Write specific Test Plan for team. |
| **Test Environment and Data Preparation** | Nguyen Hai Nam & Nguyen Tuan An | Set up the local testing environment (DB container, backend, frontend). Prepare test data including mock user accounts, pre-existing posts, and valid/invalid Gemini API keys for AI testing. |
| **Test Case Design (UC-02)** | Nguyen Tuan An | Refine and write 10 test cases for **UC-02 (Log In)**. |
| **Test Case Design (UC-10)** | Nguyen Hai Nam | Refine and write 10 test cases for **UC-10 (Create Post)**. |
| **Test Case Design (UC-12)** | Vo An Phu | Refine and write 10 test cases for **UC-12 (Leave Comment)**. |
| **Test Case Design (UC-14)** | Nguyen Hai Trong | Refine and write 10 test cases for **UC-14 (Request AI Summary)**. |
| **Test Case Design (UC-21)** | Pham Dinh Gia Khanh | Refine and write 10 test cases for **UC-21 (Assign Moderator Role)**. |
| **Test Case Review & Quality Assurance** | Nguyen Hai Nam & Pham Dinh Gia Khanh  | Review and refine all test cases (50 test cases). |
| **Test Execution and Bug Logging** | All Team Members | - Execute assigned manual test cases using Cross-testing approach, accurately recording the **Test case ID**, **execution date**, **status** (Pass/Fail), and **actual results**.<br>- Log all discovered defects into the Bug Report, ensuring every failed test case is strictly linked to at least one **bug ID**.<br>- Record bug details, including **bug description**, **steps to reproduce**, **expected vs. actual results**, **severity**, and **status**. |
| **Retesting and Final Run Verification** | Nguyen Hai Nam & Vo An Phu | Perform Retesting on fixed bugs and execute the Final Run to ensure all previously failed test cases are successfully passed and bug statuses are updated to 'Closed/Fixed'. |
| **Test Report and Document Finalization** | Nguyen Hai Nam & Nguyen Hai Trong | - Document Bug Report and Test Summary.<br>- Compile, format, and finalize the complete Software Testing Document. |

#### 1.4.2 Test Schedule

| Phase | Milestone / Task Category | Timeframe | Primary Assignees |
| --- | --- | --- | --- |
| Phase 1 | **Test Planning & Preparation:** Finalize the test plan, set up the local testing environment, and prepare all required test data (mock accounts, pre-existing posts, API keys). | Aug 11 - Aug 12, 2026 | Nguyen Hai Nam & Nguyen Tuan An |
| Phase 2 | **Test Case Design & Review:** Refine and design 50 test cases across 5 selected use cases. Conduct peer reviews to ensure optimal test coverage and validity. | Aug 13 - Aug 15,  2026 | - All Members (Design).<br>- Nguyen Hai Nam & Pham Dinh Gia Khanh (Review) |
| Phase 3 | **First Run Execution & Bug Logging:** Perform cross-testing on the application. Accurately record execution status (Pass/Fail) and systematically log all discovered defects. | Aug 16 - Aug 17, 2026 | All Team Members |
| Phase 4 | **Bug Fixing & Retesting (Final Run):** Allocate time for defect resolution. Perform retesting on previously failed test cases to verify fixes and achieve a 100% pass rate. | Aug 18 - Aug 19, 2026 | Nguyen Hai Nam & Vo An Phu (Retesting) |
| Phase 5 | **Reporting & Finalization:** Compile Test Summary metrics, verify bug ID traceability, format and finalize the document. | Aug 20 - Aug 21, 2026 |	Nguyen Hai Nam & Nguyen Hai Trong |

### 1.5 Entry and Exit Criteria

#### 1.5.1 Entry Criteria

* **Feature Implementation & Code Stability:** Code for all 5 selected use cases (UC-02, UC-10, UC-12, UC-14, UC-21) is fully integrated and ready for testing.

* **Environment & Server Readiness:**
  * The PostgreSQL database Docker container is running on port `5432` with all database migrations applied.
  * The backend server (`http://localhost:4000`) runs without errors.
  * The frontend server (`http://localhost:5173`) runs without errors .

* **Test Data Seeded:** Mock user accounts (for all roles) and sample data (posts, comments, etc.) are loaded into the database.

* **Test Cases Approved:** All 50 functional test cases have been reviewed, refined, and approved by the team.

* **API Keys Configured:** `.env` variables are set, including both valid and invalid Gemini API keys to verify the AI fallback mechanism. 

#### 1.5.2 Exit Criteria

* **100% Execution:** All 50 designed test cases have been executed.

* **Results Logged:** Execution dates, status (Pass/Fail), and actual results are fully documented for every test case.

* **Defect Traceability:** Every test case that failed during the First Run is linked to a specific Bug ID.

* **Bugs Fixed & Retested:** High-severity/critical defects have been resolved by developers. Retesting (Final Run) confirms these tests now pass.

* **Report Finalized:** The Test Summary metrics and Bug Report are fully populated and formatted for submission.









































# B - Export to PDF

*Work performed by: [Name] | Reviewed by: [Name] | Edited by: [Name]*

## 1. Requirements

Install Obsidian

Install Plugin **"Better export PDF"**

Use default format

### 1.1 How to export to PDF

==CTRL P -> Better export PDF: Export current file to PDF==

# C - Diagram example

*Work performed by: [Name] | Reviewed by: [Name] | Edited by: [Name]*

## 1. Diagram rules

Diagram must be drawn using Mermaid.

Example as below:

**Workflow 1: User Authentication & Post Creation**

```mermaid
flowchart TD
    A[User clicks Create Post] --> B{Is Authenticated?}
    B -- No --> C[Redirect to Login/Signup]
    C --> D[User Authenticates]
    D --> E[Open Post Editor]
    B -- Yes --> E

```

# D - Image example

*Work performed by: [Name] | Reviewed by: [Name] | Edited by: [Name]*

## 1. Insert image rule

Insert as markdown format `![Name](image link)`

Example as below:

![Jira Board 1](./PA2-Group06/images/jira1.png)