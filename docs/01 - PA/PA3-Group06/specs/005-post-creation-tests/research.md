# Research & Architectural Decisions: Post Creation Tests

This document outlines the research and design decisions for structuring the integration test suite for the Post Creation functional group.

## Decision 1: Test Suite Architecture (Vitest)

- **Decision**: Define a single test file `src/backend/__tests__/integration/post.test.ts` using nested `describe` blocks corresponding to the specification's User Stories (Text Posts, Deletion, Media Attachments, Chained Threads). All test cases will be structured as `test.todo(...)` (or `it.todo(...)`) to comply with the "Only create test case, not logic code" instruction.
- **Rationale**: Organizing the test cases hierarchically ensures direct traceability from the `spec.md` user stories to the test report. Using `test.todo()` registers the tests with the test runner and shows them as pending/todo, serving as a clean implementation checklist without running any code.
- **Alternatives Considered**: 
  - *Multiple test files (e.g., post.create.test.ts, post.delete.test.ts)*: Rejected because the functionality is highly related (e.g., deleting a post requires creating one first) and fits well in a single resource-oriented test file.
  - *Skipped tests (`test.skip`)*: Rejected because `test.skip` implies the test has code that is temporarily disabled, whereas `test.todo` represents a task that is yet to be implemented.

## Decision 2: Endpoint Design and Routing

- **Decision**: Define the endpoints following the RESTful naming conventions and routing patterns outlined in `AGENTS.md`. All routes will be mounted under `/api/v1` via Express:
  - `POST /posts` - Create a new post/thread
  - `DELETE /posts/:id` - Delete a post by ID
- **Rationale**: Conforms to the project's API Routing Convention:
  - Express routes are mounted under the main API router in `src/backend/index.ts` with prefix `/api/v1`.
  - Resource routes (like posts) are defined in a sub-router (`src/backend/api/posts/routes.ts`) and mounted without redundant prefixes.
- **Alternatives Considered**: Using custom actions like `POST /posts/create` or `POST /posts/delete`, which violate RESTful conventions.

## Decision 3: Attachment and Media Testing Structure

- **Decision**: Test definitions for attachments will outline verification of multipart/form-data payloads (likely using a middleware like `multer` in the future).
- **Rationale**: Since the UI uses standard file uploads, testing media attachments will involve simulating file boundaries in HTTP requests. By designing the test cases to verify HTTP response statuses (e.g. 201 Created vs 400 Bad Request), we keep tests black-box and technology-agnostic at the HTTP boundary.
- **Alternatives Considered**: Mocking the upload function directly, but integration tests should test at the HTTP/Express route boundary.
