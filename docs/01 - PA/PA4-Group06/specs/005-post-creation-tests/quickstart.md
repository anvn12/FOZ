# Quickstart: Post Creation Test Cases

This quickstart guides you through running the test case definitions for the Post Creation functional group. Since this feature focuses on specifying test cases without logic code, all test cases are registered as `todo` items in Vitest.

1. **Review Specifications**:
   - Read [spec.md](./spec.md) for the user stories, priorities, acceptance scenarios, and edge cases.
   - Read [plan.md](./plan.md) to understand the technical context, structure decisions, and constraints.
   - Inspect [data-model.md](./data-model.md) to understand the proposed Drizzle schema structure for posts and attachments.
   - Review [contracts/post-api.md](./contracts/post-api.md) for the API endpoints and payloads.

2. **Run the Test Suite**:
   Verify that the test suite compiles and registers all defined test cases as `todo` items:

   ```bash
   npx vitest run src/backend/__tests__/integration/post.test.ts
   ```

   **Expected Output**:
   The test runner should list the test suite, showing all post creation integration test cases as pending/todo items.
