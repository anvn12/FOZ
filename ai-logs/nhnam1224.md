### 2026-07-20 18:00
**Tool:** copilot
**Model:** GPT-5.4 mini
**Prompt:** "Follow instructions in #prompt:speckit.specify.prompt.md with these arguments: I want to create code for User Interactions functional groupas shown in the attached UI images. What to have: - Comment to the post, like/unlike a post or comment, reply/edit/delete a comment. - Creating a new post, deleting posts (restricted by the post owner check). @[docs/1B. Project Proposal.md] @[docs/ui-designs/user interactions/images/post web.png] @[docs/ui-designs/user interactions/images/comment web.png]"
**Files touched:** `specs/008-user-interactions/spec.md`, `specs/008-user-interactions/checklists/requirements.md`, `.specify/feature.json`

### 2026-07-20 18:11
**Tool:** copilot
**Model:** GPT-5.4 mini
**Prompt:** "Follow instructions in #prompt:speckit.plan.prompt.md"
**Files touched:** `specs/008-user-interactions/plan.md`, `specs/008-user-interactions/research.md`, `specs/008-user-interactions/data-model.md`, `specs/008-user-interactions/quickstart.md`, `specs/008-user-interactions/contracts/user-interactions-api.md`, `.github/copilot-instructions.md`

### 2026-07-20 18:17
**Tool:** copilot
**Model:** GPT-5.4 mini
**Prompt:** "Follow instructions in #prompt:speckit.tasks.prompt.md"
**Files touched:** `specs/008-user-interactions/tasks.md`

### 2026-07-20 18:47
**Tool:** copilot
**Model:** GPT-5.4 mini
**Prompt:** "Follow instructions in #prompt:speckit.implement.prompt.md with these arguments: (phase 1, 2)"
**Files touched:** `src/shared/schemas/index.ts`, `src/shared/schemas/interactions.ts`, `src/backend/db/schema/interactions.ts`, `src/backend/db/repositories/interactions.ts`, `src/backend/services/interactions/posts.ts`, `src/backend/services/interactions/comments.ts`, `src/backend/services/interactions/reactions.ts`, `src/backend/api/posts/routes.ts`, `src/backend/api/comments/routes.ts`, `src/backend/api/reactions/routes.ts`, `src/frontend/src/api/interactions.ts`, `src/frontend/src/components/post/PostComposer.tsx`, `src/frontend/src/components/post/PostCard.tsx`, `src/frontend/src/components/comment/CommentThread.tsx`, `src/frontend/src/components/comment/CommentItem.tsx`, `src/frontend/src/components/reaction/ReactionButton.tsx`, `src/frontend/src/pages/feed/FeedPage.tsx`, `src/backend/db/schema/index.ts`, `src/backend/index.ts`, `src/backend/db/migrations/0003_user_interactions.sql`, `specs/008-user-interactions/tasks.md`

### 2026-07-20 19:28
**Tool:** copilot
**Model:** GPT-5.4 mini
**Prompt:** "Follow instructions in #prompt:speckit.implement.prompt.md with these arguments: (phase 3, 4, 5)"
**Files touched:** `src/backend/db/repositories/interactions.ts`, `src/backend/services/interactions/posts.ts`, `src/backend/services/interactions/comments.ts`, `src/backend/services/interactions/reactions.ts`, `src/backend/api/posts/routes.ts`, `src/backend/api/comments/routes.ts`, `src/backend/api/reactions/routes.ts`, `src/backend/index.ts`, `src/frontend/src/api/interactions.ts`, `src/frontend/src/App.tsx`, `src/frontend/src/pages/feed/FeedPage.tsx`, `src/frontend/src/components/post/PostComposer.tsx`, `src/frontend/src/components/post/PostCard.tsx`, `src/frontend/src/components/comment/CommentThread.tsx`, `src/frontend/src/components/comment/CommentItem.tsx`, `src/frontend/src/components/reaction/ReactionButton.tsx`, `specs/008-user-interactions/tasks.md`

### 2026-07-20 19:47
**Tool:** copilot
**Model:** GPT-5.4 mini
**Prompt:** "Follow instructions in #prompt:speckit.implement.prompt.md with these arguments: (phase 6)"
**Files touched:** `src/backend/index.ts`, `src/frontend/src/components/post/PostComposer.tsx`, `src/frontend/src/components/reaction/ReactionButton.tsx`, `src/frontend/src/components/comment/CommentItem.tsx`, `src/frontend/src/components/comment/CommentEditor.tsx`, `specs/008-user-interactions/contracts/user-interactions-api.md`, `specs/008-user-interactions/quickstart.md`, `specs/008-user-interactions/tasks.md`

### 2026-07-20 20:01
**Tool:** copilot
**Model:** GPT-5.4 mini
**Prompt:** "fixing post thread feature (can not post thread when clicking on 'Post' button). the error is attatched in the image above in Chrome DevTools Console"
**Files touched:** `src/frontend/vite.config.ts`, `src/backend/api/posts/routes.ts`, `src/backend/api/comments/routes.ts`, `src/backend/api/reactions/routes.ts`, `src/backend/db/schema/interactions.ts`

### 2026-07-20 21:11
**Tool:** Codex
**Model:** GPT-5
**Prompt:** "run the fe and be parallel
- First, check user interactions features (in ./specs/008-user-interactions and other related folders and files).If fail, fix.
- Next, design the UI to match with 2 images above, with full buttons and features (only for user interactions, other functions can be ignored)."
**Files touched:** `src/backend/api/auth/middleware.ts`, `src/backend/api/comments/routes.ts`, `src/backend/api/posts/routes.ts`, `src/backend/db/repositories/interactions.ts`, `src/backend/services/interactions/comments.ts`, `src/backend/services/interactions/posts.ts`, `src/backend/services/interactions/reactions.ts`, `src/frontend/src/api/interactions.ts`, `src/frontend/src/App.tsx`, `src/frontend/src/pages/feed/FeedPage.tsx`, `src/frontend/src/index.css`

### 2026-07-24 15:30
**Tool:** devin
**Model:** SWE-1.6 Slow
**Prompt:** "/speckit.specify I want to create test cases for Feed Generation, which is described in @README.md and @docs/1B. Project Proposal.md (Feed Generation features in FOZ - this project). Only test cases, not code. Do in @docs/QA report/. Only test cases for functional requirements, not code. You must strictly follow the AI usage logging rules outlined in AGENTS.md. Before ending your turn, you must use the AI usage logging skill located at .agents/skills/ai-usage-log to log these changes."
**Files touched:** `docs/QA report/feed-generation-test-cases.md`
