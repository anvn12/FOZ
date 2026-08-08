# FOZ Software Architecture Document

> **Version**: 1.0.0  
> **Last Updated**: 2026-08-08
>
> Architecture overview of the **FOZ** community forum, covering PA1–PA4. Diagrams use C4 Model conventions rendered in Mermaid.

---

## Table of Contents

1. [Technology Stack](#1-technology-stack)
2. [C4 Level 1 - System Context Diagram](#2-c4-level-1--system-context-diagram)
3. [C4 Level 2 - Container Diagram](#3-c4-level-2--container-diagram)
   - 3.1 [Diagram](#31-diagram)
   - 3.2 [Container Descriptions](#32-container-descriptions)
   - 3.3 [Relationships Summary](#33-relationships-summary)
4. [C4 Level 3 - Component Diagrams](#4-c4-level-3--component-diagrams)
   - 4.1 [Frontend - Web Application](#41-frontend--web-application)
   - 4.2 [Backend - API Server](#42-backend--api-server)

---

# B - Software Architecture: System Context Diagram

## 1. Technology Stack

### Frontend

| Technology | Purpose |
|---|---|
| **React 19** | UI component framework (SPA) |
| **TypeScript 6** | Type-safe application code |
| **Vite 8** | Build tool and dev server with HMR |
| **Tailwind CSS 4** | Utility-first styling (vanilla config, no UI library) |
| **react-router-dom 7** | Client-side routing |
| **@tanstack/react-query 5** | Server-state management and caching |
| **zustand 5** | Lightweight client-state management (auth store) |
| **react-hook-form 7** | Form state management and validation |
| **react-hot-toast 2** | Toast notification system |
| **react-icons 5** | Icon library |
| **Vitest 4** | Unit testing framework |

### Backend

| Technology | Purpose |
|---|---|
| **Node.js (LTS ≥ 24)** | JavaScript runtime (ESM) |
| **Express 5** | Web framework for RESTful API |
| **TypeScript 6** | Type-safe server code |
| **Drizzle ORM** | SQL-visible ORM with type-safe queries |
| **drizzle-kit** | Database migration tooling |
| **Zod 4** | Runtime schema validation at API boundaries |
| **bcrypt 6** | Password hashing |
| **jsonwebtoken 9** | JWT access and refresh token management |
| **express-rate-limit 8** | Rate limiting for abuse-prone endpoints |
| **multer 2** | Multipart file upload handling |
| **sharp 0.35** | Server-side image processing and optimization |
| **cookie-parser** | HTTP cookie parsing for refresh tokens |
| **Vitest 4** | Unit and integration testing |

### Database

| Technology | Purpose |
|---|---|
| **PostgreSQL 16** | Primary relational database (provisioned via Docker) |
| **postgres.js** | Node.js PostgreSQL client driver |

### External Services

| Service | Purpose |
|---|---|
| **Cloudinary** | Cloud-based image/media storage and CDN delivery |
| **Google Generative AI API** (Gemini) | AI-powered post & comment summarization (TL;DR) with fallback provider chain |
| **Google OAuth 2.0** | Social authentication (Google Sign-In) |

### Shared Module

| Technology | Purpose |
|---|---|
| **`src/shared/`** | Zod schemas, DTOs, enums - single source of truth imported by both frontend and backend via `#shared/*` path aliases. No npm workspace, no codegen, no tRPC. |

---

## 2. C4 Level 1 - System Context Diagram

This diagram shows FOZ as a single box, the actors who interact with it, and the external systems it depends on.

```mermaid
flowchart TD
    subgraph actors [" "]
        Guest(["Guest User<br/><i>Unauthenticated visitor</i><br/>Browses posts and profiles"])
        Standard(["Standard User<br/><i>Registered member</i><br/>Creates posts, comments,<br/>reacts, reports content"])
        Moderator(["Moderator<br/><i>Content moderator</i><br/>Reviews reports,<br/>flags violations"])
        Admin(["Administrator<br/><i>System administrator</i><br/>Manages users, categories,<br/>issues punishments"])
    end

    FOZ["FOZ Forum Platform<br/><i>Software System</i><br/><br/>A threads-style community forum<br/>where users create posts, comment,<br/>react, search, and interact with<br/>AI-generated summaries"]

    subgraph external [" "]
        Google["Google OAuth 2.0<br/><i>External System</i><br/>Provides social login<br/>authentication"]
        Gemini["Google Generative AI<br/>(Gemini API)<br/><i>External System</i><br/>Powers AI post/comment<br/>summarization (TL;DR)"]
        Cloudinary["Cloudinary<br/><i>External System</i><br/>Cloud image storage,<br/>transformation, and CDN"]
    end

    Guest -- "Browses feed, searches<br/>posts, views profiles<br/>[HTTPS]" --> FOZ
    Standard -- "Creates posts, comments,<br/>reacts, uploads media,<br/>requests AI summaries<br/>[HTTPS]" --> FOZ
    Moderator -- "Reviews reports queue,<br/>flags or dismisses reports<br/>[HTTPS]" --> FOZ
    Admin -- "Manages users, categories,<br/>system settings, audit logs,<br/>issues punishments<br/>[HTTPS]" --> FOZ

    FOZ -- "Exchanges OAuth<br/>authorization code<br/>for user profile<br/>[HTTPS]" --> Google
    FOZ -- "Sends post + comments<br/>for summarization<br/>[HTTPS REST]" --> Gemini
    FOZ -- "Uploads/deletes images<br/>via stream API<br/>[HTTPS]" --> Cloudinary

    classDef system fill:#1168bd,stroke:#0b4884,color:#fff
    classDef person fill:#08427b,stroke:#073b6e,color:#fff
    classDef ext fill:#f5a623,stroke:#d4901c,color:#000

    class FOZ system
    class Guest,Standard,Moderator,Admin person
    class Google,Gemini,Cloudinary ext
```

### Diagram Explanation

Four actor types interact with the system:

- **Guest** — Unauthenticated. Can browse the feed, search, and view profiles. Cannot create content, react, report, or use AI features.
- **Standard User** — Authenticated member. Everything a guest can do, plus creating posts (text + images), commenting (nested replies), reacting, editing/deleting own content, managing their profile, reporting, requesting AI TL;DR summaries, and changing their password.
- **Moderator** — Standard user privileges plus the moderation queue (review, flag, or dismiss reports). Cannot issue punishments directly — this enforces separation of powers.
- **Administrator** — Moderator privileges plus the admin dashboard: user management (warn, suspend, ban), category management, system settings, audit logs, and punishment issuance.

The system depends on three external services:

- **Google OAuth 2.0** — Social login. The backend exchanges an auth code for a token, fetches the Google profile, and links or creates a FOZ account.
- **Google Generative AI (Gemini)** — AI post/comment summarization. Uses a fallback chain across multiple Gemini model versions for resilience.
- **Cloudinary** — Image storage and CDN. Attachments and avatars are streamed to Cloudinary; CDN URLs are stored in the database.

---

# C - Software Architecture: Container Diagram and Component Diagram

## 3. C4 Level 2 - Container Diagram

Zooms into FOZ to show its deployable units (containers), the technology each uses, and how they talk to each other. In C4 terms a "container" is a separately runnable process or data store.

### 3.1 Diagram

```mermaid
flowchart TD
    Guest(["Guest User"])
    Standard(["Standard User"])
    Moderator(["Moderator"])
    Admin(["Administrator"])

    subgraph foz ["FOZ Forum Platform"]
        SPA["Web Application<br/><i>React 19 · TypeScript · Vite 8</i><br/><br/>SPA delivering forum UI:<br/>feed, post detail, profile,<br/>search, moderation panel,<br/>admin dashboard.<br/>Styled with Tailwind CSS."]

        API["Backend API Server<br/><i>Node.js v24 · Express 5 · ESM</i><br/><br/>RESTful API under /api/v1<br/>auth · validation · business logic<br/>rate limiting · CORS"]

        DB[("PostgreSQL Database<br/><i>postgres:16</i><br/><br/>User accounts, profiles, posts,<br/>comments, reactions, reports,<br/>audit logs, categories, hashtags,<br/>summaries, system settings")]
    end

    Google["Google OAuth 2.0"]
    Gemini["Google Generative AI"]
    Cloudinary["Cloudinary"]

    Guest -- "Visits pages [HTTPS]" --> SPA
    Standard -- "Interacts with forum [HTTPS]" --> SPA
    Moderator -- "Reviews reports [HTTPS]" --> SPA
    Admin -- "Manages system [HTTPS]" --> SPA

    SPA -- "JSON REST calls<br/>[HTTPS /api/v1/*]" --> API
    API -- "Reads/writes data<br/>[postgres.js, TCP :5432]" --> DB
    API -- "Exchanges OAuth code<br/>[HTTPS]" --> Google
    API -- "Summarization requests<br/>[HTTPS REST]" --> Gemini
    API -- "Uploads/deletes images<br/>[HTTPS]" --> Cloudinary

    classDef system fill:#1168bd,stroke:#0b4884,color:#fff
    classDef person fill:#08427b,stroke:#073b6e,color:#fff
    classDef ext fill:#f5a623,stroke:#d4901c,color:#000

    class SPA,API,DB system
    class Guest,Standard,Moderator,Admin person
    class Google,Gemini,Cloudinary ext
```

### 3.2 Container Descriptions

- **Web Application (SPA)** — Renders the entire forum UI: feed (latest + for-you), post detail with comments/reactions, profiles, search, moderation queue, admin dashboard, and auth screens. No direct DB access, all data comes from the API via REST.
  - **Technology**: React 19 + TypeScript + Vite 8, styled with Tailwind CSS v4. Key libs: `react-router-dom` (routing), `@tanstack/react-query` (server-state cache), `zustand` (auth state), `react-hook-form` (forms), `react-hot-toast` (toasts). Tested with Vitest + Testing Library.
  - **Communication**: Sends JSON requests to `/api/v1/*`. Dev: Vite proxies to `localhost:4000`. Prod: Vercel rewrites to the Render backend. Auth uses `Bearer` tokens; refresh uses an HttpOnly cookie.

- **Backend API Server** — RESTful API under `/api/v1` covering auth, posts, comments, reactions, profiles, search, upload, moderation, admin, hashtags, and a `/health` probe. Includes AI summarization, Zod validation, rate limiting, CORS, and a central error handler.
  - **Technology**: Node.js v24 (ESM) + Express 5. Auth: `jsonwebtoken` + `bcrypt`. DB: Drizzle ORM + `postgres.js` + `drizzle-kit` migrations. Validation: `zod`. Uploads: `multer` + `sharp`. Env: fail-fast Zod validation at startup.
  - **Communication**: Receives JSON from the SPA. Connects to Postgres via `postgres.js` (TCP :5432, pool max 10). Calls Google OAuth, Gemini, and Cloudinary over HTTPS.

- **PostgreSQL Database** — Stores all relational data: users, profiles, refresh sessions, posts, attachments, comments, reactions, reports, audit logs, categories, settings, hashtags, summaries, and social links.
  - **Technology**: `postgres:16` Docker service (`foz_db`, port 5432, volume `foz_pg_data`, database `foz_dev`). Migrations via `drizzle-kit`.
  - **Communication**: Accepts connections only from the Backend API Server (TCP :5432). No browser or SPA access.

- **Google OAuth 2.0** *(external)* — Social login. Backend exchanges auth codes for tokens and fetches user profiles. HTTPS only, called by the backend.

- **Google Generative AI / Gemini** *(external)* — On-demand AI TL;DR summaries (post snapshot, highlights, sentiment). Uses `gemini-2.5-flash` / `gemini-1.5-flash` / `gemini-2.0-flash` with a fallback chain. HTTPS only, called by the backend.

- **Cloudinary** *(external)* — Image storage and CDN. Attachments and avatars are streamed up; CDN URLs are persisted in Postgres. HTTPS only, called by the backend.

### 3.3 Relationships Summary

| From | To | Protocol | Description |
|---|---|---|---|
| User (all roles) | Web Application | HTTPS | Browsing, form submission, and UI interaction |
| Web Application | Backend API Server | HTTP/HTTPS JSON | REST calls to `/api/v1/*`. Dev: Vite proxies to `localhost:4000`. Authenticated calls pass `Bearer` tokens; refresh uses HTTP-only credentials |
| Backend API Server | PostgreSQL Database | SQL over TCP :5432 | Drizzle ORM queries via `postgres-js` driver |
| Backend API Server | Google OAuth 2.0 | HTTPS | Exchanges authorization codes for tokens, fetches user profiles |
| Backend API Server | Google Gemini API | HTTPS REST | Sends structured prompts, receives AI-generated summaries |
| Backend API Server | Cloudinary | HTTPS | Streams image uploads and issues delete requests |


---

## 4. C4 Level 3 - Component Diagrams

These diagrams zoom into the Web Application and Backend API Server containers to show their internal components. The database and external systems appear for context.

### 4.1 Frontend - Web Application

#### 4.1.1 Diagram

```mermaid
flowchart TD
    API_EXT["Backend API Server<br/>[container: Node.js · Express 5]"]

    subgraph spa ["Web Application - React 19 + Vite 8"]

        subgraph routing ["Routing & Layout Layer"]
            Router["App Router<br/>[component: react-router-dom · App.tsx]<br/><br/>Client-side routes with<br/>role-based guards<br/>(RequireRole, AdminGuard)"]
        end

        subgraph pages ["Page Components"]
            FeedPages["Feed Pages<br/>[component: HomePage]<br/><br/>Latest and For-You feed<br/>with infinite scroll and<br/>trending hashtags widget"]
            PostPage["Post Detail Page<br/>[component: PostPage]<br/><br/>Full post view, comments,<br/>nested replies, reactions,<br/>TL;DR summary, media,<br/>reporting"]
            ProfilePage["Profile Page<br/>[component: ProfilePage]<br/><br/>User profile with posts,<br/>bio, avatar, edit modal"]
            SearchPage["Search Page<br/>[component: SearchPage]<br/><br/>Full-text search for<br/>posts, users, hashtags<br/>with tab filters"]
            AuthPages["Auth Pages<br/>[component: Login, Register,<br/>Onboarding, ChangePassword]<br/><br/>Credential and social<br/>login flows, registration,<br/>avatar onboarding"]
            ModPages["Moderator Pages<br/>[component: Dashboard, ReportsQueue]<br/><br/>Report review queue<br/>with escalate/dismiss"]
            AdminPages["Admin Pages<br/>[component: Dashboard, Users, Reports,<br/>Categories, Settings,<br/>AuditLogs]<br/><br/>Full admin panel"]
        end

        subgraph state ["State & Data Layer"]
            AuthStore["Auth Store<br/>[component: zustand · stores/auth.ts]<br/><br/>Client-side auth state:<br/>user, accessToken,<br/>login/logout, silent refresh"]
            APIClient["API Client<br/>[component: fetch wrappers · src/api/]<br/><br/>Typed fetch functions and<br/>react-query hooks for<br/>each backend resource"]
        end
    end

    Router -- "routes to" --> FeedPages
    Router -- "routes to" --> PostPage
    Router -- "routes to" --> ProfilePage
    Router -- "routes to" --> SearchPage
    Router -- "routes to" --> AuthPages
    Router -- "routes to" --> ModPages
    Router -- "routes to" --> AdminPages

    FeedPages -- "calls API" --> APIClient
    PostPage -- "calls API" --> APIClient
    ProfilePage -- "calls API" --> APIClient
    SearchPage -- "calls API" --> APIClient
    ModPages -- "calls API" --> APIClient
    AdminPages -- "calls API" --> APIClient
    AuthPages -- "reads/writes session" --> AuthStore
    AuthPages -- "calls API" --> APIClient

    AuthStore -- "injects Bearer token" --> APIClient
    APIClient -- "HTTPS JSON /api/v1/*" --> API_EXT

    classDef system fill:#1168bd,stroke:#0b4884,color:#fff
    classDef comp fill:#3baf4a,stroke:#2d8a3a,color:#fff

    class API_EXT system
    class Router,FeedPages,PostPage,ProfilePage,SearchPage,AuthPages,ModPages,AdminPages comp
    class AuthStore,APIClient comp
```

#### 4.1.2 Component Descriptions

- **App Router (`App.tsx`)**
  - **Responsibility**: Declares all client-side routes (`/latest`, `/foryou`, `/posts/:id`, `/profiles/@:username`, `/search`, `/login`, `/register`, `/moderator`, `/admin/*`, etc.) and wraps protected routes with `RequireRole` and `AdminGuard` components that check the auth store for the required role.
  - **Relationships**: Receives navigation actions from the User; renders matching Page Components; injects global layout and dialog controls.

- **Feed Pages (`HomePage`)**
  - **Responsibility**: Renders the post feed in two modes: "Latest" (chronological) and "For You" (engagement-ranked). Supports infinite scroll via cursor-based pagination. Includes a TrendingHashtagsWidget sidebar.
  - **Relationships**: Calls APIClient for post, feed, and reaction data.

- **Post Detail Page (`PostPage`)**
  - **Responsibility**: Full post view with body text, media gallery, reaction controls, comment thread with nested replies, AI-generated TL;DR summary card, report button, and post edit/delete for the owner.
  - **Relationships**: Calls APIClient for post, comment, reaction, summary, and report data.

- **Profile Page (`ProfilePage`)**
  - **Responsibility**: Displays a user's profile (display name, bio, avatar, location, website) and their posts. Includes a ProfileEditModal for the profile owner to update their information and upload avatars.
  - **Relationships**: Calls APIClient for profile and user post data.

- **Search Page (`SearchPage`)**
  - **Responsibility**: Provides full-text search across posts, users, and hashtags with tab-based result filtering.
  - **Relationships**: Calls APIClient for search queries.

- **Auth Pages (`LoginPage`, `RegisterPage`, `OnboardingPage`, `ChangePasswordPage`)**
  - **Responsibility**: Login page (email/password + Google OAuth), register page (with Zod-validated form), onboarding avatar upload, and change-password page.
  - **Relationships**: Uses Auth Store to persist session; calls APIClient for auth endpoints.

- **Moderator Pages (`ModDashboard`, `ReportsQueue`)**
  - **Responsibility**: Moderator dashboard with report statistics and a reports queue page where moderators can review, flag (escalate), or dismiss user reports.
  - **Relationships**: Calls APIClient for moderation endpoints; guarded by RequireRole.

- **Admin Pages** (`Dashboard`, `Users`, `Reports`, `Categories`, `Settings`, `AuditLogs`) — Full admin panel: site stats, user management, report management, category CRUD, system settings, audit logs. Guarded by AdminGuard. Calls APIClient for admin endpoints.

- **Auth Store (`src/frontend/src/stores/auth.ts`)**
  - **Responsibility**: Zustand store managing client-side authentication state: `user` object, `accessToken`, `setSession`, `clearSession`, and `silentRefresh` (automatic token renewal via the refresh cookie).
  - **Relationships**: Read by APIClient for Bearer token injection; updated by Auth Pages upon login, registration, or session restoration.

- **API Client (`src/frontend/src/api/`)**
  - **Responsibility**: Modular API modules (`auth.ts`, `interactions.ts`, `post-summary.ts`, `profile.ts`, `search.ts`, `upload.ts`, `admin.ts`, `hashtags.ts`) providing typed `fetch` wrappers with `Bearer` authorization headers and `@tanstack/react-query` hooks for caching and data sync.
  - **Relationships**: Invoked by all page components; reads access tokens from Auth Store; executes REST calls to Backend API Server.

---

### 4.2 Backend - API Server

The backend is split into two diagrams for readability: **Diagram A** covers content and discovery (posts, comments, search, profiles, hashtags, media); **Diagram B** covers identity, governance, and AI (auth, OAuth, reactions, reports, moderation, admin, TL;DR).

#### 4.2.1 Diagram A - Content & Discovery (Feed · Search · Profile · Hashtags · Media)

```mermaid
flowchart TD
    WebApp_A["Web Application<br/><i>React SPA</i>"]
    DB_A[("PostgreSQL<br/><i>postgres:16</i>")]
    Cloud_A["Cloudinary<br/><i>external</i>"]

    subgraph BE_A ["Backend API Server [Container]"]
        GW_A["API Gateway<br/><i>Express 5 + middleware</i><br/><br/>CORS · cookie-parser ·<br/>rate limiting · auth ·<br/>Zod validation ·<br/>central error handler"]

        PostR["Post Router<br/><i>/api/v1/posts/*</i><br/><br/>Post CRUD, feed<br/>(latest, for-you),<br/>repost, user posts"]
        CommentR["Comment Router<br/><i>/posts/:id/comments/*</i><br/><br/>Comment CRUD,<br/>nested replies"]
        SearchR["Search Router<br/><i>/api/v1/search/*</i><br/><br/>Full-text search<br/>posts, users, hashtags"]
        ProfileR["Profile Router<br/><i>/api/v1/profiles/*</i><br/><br/>Get/update profile,<br/>avatar upload"]
        HashtagR["Hashtag Router<br/><i>/api/v1/hashtags/*</i><br/><br/>Trending hashtags,<br/>hashtag feed"]
        UploadR["Upload Router<br/><i>/api/v1/upload/*</i><br/><br/>Image upload<br/>via multer pipeline"]

        PostSvc["Post Service<br/><i>posts.ts</i><br/><br/>Post CRUD logic,<br/>feed assembly,<br/>attachment handling,<br/>hashtag extraction"]
        FeedRank["Feed Ranking<br/><i>Component</i><br/><br/>For-You algorithm:<br/>engagement-weighted<br/>post scoring"]
        CommentSvc["Comment Service<br/><i>comments.ts</i><br/><br/>Comment CRUD,<br/>nested reply logic"]
        ImgProc["Image Processor<br/><i>sharp</i><br/><br/>Resize, WebP conversion,<br/>optimization"]
        CloudSvc["Cloudinary Service<br/><i>Component</i><br/><br/>Stream upload,<br/>asset deletion,<br/>URL parsing"]

        DAL_A["Data Access Layer<br/><i>Drizzle ORM</i><br/><br/>Interactions · Hashtag ·<br/>Profile repositories"]
        Shared_A["Shared Types<br/><i>src/shared/schemas</i><br/><br/>Zod DTOs · enums"]
    end

    WebApp_A -- "HTTP JSON /api/v1" --> GW_A

    GW_A -- "/posts" --> PostR
    GW_A -- "/comments" --> CommentR
    GW_A -- "/search" --> SearchR
    GW_A -- "/profiles" --> ProfileR
    GW_A -- "/hashtags" --> HashtagR
    GW_A -- "/upload" --> UploadR

    PostR -- "delegates CRUD" --> PostSvc
    PostR -- "delegates For-You" --> FeedRank
    CommentR -- "delegates CRUD" --> CommentSvc
    SearchR -- "queries" --> DAL_A
    ProfileR -- "reads/writes" --> DAL_A
    HashtagR -- "queries" --> DAL_A
    UploadR -- "sends buffer" --> ImgProc
    ImgProc -- "streams optimized image" --> CloudSvc

    PostSvc -- "reads/writes" --> DAL_A
    FeedRank -- "reads engagement data" --> DAL_A
    CommentSvc -- "reads/writes" --> DAL_A
    CloudSvc -- "HTTPS" --> Cloud_A

    DAL_A -- "SQL / :5432" --> DB_A

    GW_A -. "validate" .-> Shared_A
    PostSvc -. "schemas" .-> Shared_A

    classDef system fill:#1168bd,stroke:#0b4884,color:#fff
    classDef comp fill:#3baf4a,stroke:#2d8a3a,color:#fff
    classDef ext fill:#f5a623,stroke:#d4901c,color:#000

    class WebApp_A,DB_A system
    class Cloud_A ext
    class GW_A,PostR,CommentR,SearchR,ProfileR,HashtagR,UploadR comp
    class PostSvc,FeedRank,CommentSvc,ImgProc,CloudSvc comp
    class DAL_A,Shared_A comp
```

#### 4.2.2 Diagram B - Identity, Governance & AI (Auth · OAuth · Reactions · Reports · Moderation · Admin · AI TL;DR)

```mermaid
flowchart TD
    WebApp_B["Web Application<br/><i>React SPA</i>"]
    DB_B[("PostgreSQL<br/><i>postgres:16</i>")]
    Google_B["Google OAuth 2.0<br/><i>external</i>"]
    Gemini_B["Gemini API<br/><i>external</i>"]

    subgraph BE_B ["Backend API Server [Container]"]
        GW_B["API Gateway<br/><i>Express 5 + middleware</i><br/><br/>CORS · cookie-parser ·<br/>rate limiting · auth ·<br/>Zod validation ·<br/>central error handler"]

        AuthR["Auth Router<br/><i>/api/v1/auth/*</i><br/><br/>Register, login,<br/>refresh, logout, me,<br/>Google OAuth callback"]
        ReactionR["Reaction Router<br/><i>/posts/:id/reactions/*</i><br/><br/>Toggle reactions<br/>on posts/comments"]
        ModR["Moderation Router<br/><i>/api/v1/moderation/*</i><br/><br/>Submit, list, escalate,<br/>dismiss reports"]
        AdminR["Admin Router<br/><i>/api/v1/admin/*</i><br/><br/>User mgmt, categories,<br/>settings, audit logs"]
        SumR["Summary Endpoint<br/><i>/posts/:id/summary</i><br/><br/>Get/refresh AI<br/>post summaries"]

        AuthSvc["Auth Service<br/><i>auth.service.ts</i><br/><br/>Password auth, token<br/>issuance, refresh<br/>rotation, cookies"]
        SocialAuth["Social Auth Service<br/><i>social-auth.service.ts</i><br/><br/>OAuth profile linking,<br/>account creation,<br/>username generation"]
        OAuthProv["OAuth Providers<br/><i>oauth-providers.ts</i><br/><br/>Google code exchange,<br/>profile fetching"]
        ReactionSvc["Reaction Service<br/><i>reactions.ts</i><br/><br/>Toggle/remove<br/>reaction logic"]
        ReportSvc["Report Service<br/><i>reports.ts</i><br/><br/>Report creation<br/>and retrieval"]
        AdminSvc["Admin Service<br/><i>admin.service.ts</i><br/><br/>User role/status mgmt,<br/>category CRUD, settings,<br/>stats, audit logging"]
        PostSumSvc["Post Summary Service<br/><i>post-summary.service.ts</i><br/><br/>Summary orchestration:<br/>stale check, generate,<br/>cache in DB"]
        AISvc["AI Summarizer<br/><i>ai-summarizer.ts</i><br/><br/>LLM prompt building,<br/>Gemini fallback chain,<br/>JSON parsing"]

        JWTLib["JWT Library<br/><i>jsonwebtoken</i><br/><br/>Sign/verify tokens"]
        PwdLib["Password Library<br/><i>bcrypt</i><br/><br/>Hash/compare passwords"]
        EnvCfg["Env Config<br/><i>Zod · env.ts</i><br/><br/>Fail-fast env validation"]

        DAL_B["Data Access Layer<br/><i>Drizzle ORM</i><br/><br/>User · Interactions ·<br/>Admin · Summary<br/>repositories"]
        Shared_B["Shared Types<br/><i>src/shared/schemas</i><br/><br/>Zod DTOs · enums"]
    end

    WebApp_B -- "HTTP JSON /api/v1" --> GW_B

    GW_B -- "/auth" --> AuthR
    GW_B -- "/reactions" --> ReactionR
    GW_B -- "/moderation" --> ModR
    GW_B -- "/admin" --> AdminR
    GW_B -- "/summary" --> SumR

    AuthR -- "delegates credential auth" --> AuthSvc
    AuthR -- "delegates OAuth flow" --> SocialAuth
    SocialAuth -- "exchanges code for profile" --> OAuthProv
    ReactionR -- "delegates toggle" --> ReactionSvc
    ModR -- "delegates report ops" --> ReportSvc
    AdminR -- "delegates admin ops" --> AdminSvc
    SumR -- "delegates summary lifecycle" --> PostSumSvc

    AuthSvc -- "signs/verifies tokens" --> JWTLib
    AuthSvc -- "hashes/compares passwords" --> PwdLib
    AuthSvc -- "reads/writes users & sessions" --> DAL_B
    SocialAuth -- "reads/writes users & links" --> DAL_B
    OAuthProv -- "HTTPS" --> Google_B
    ReactionSvc -- "toggles reactions" --> DAL_B
    ReportSvc -- "reads/writes reports" --> DAL_B
    AdminSvc -- "reads/writes admin data" --> DAL_B
    PostSumSvc -- "requests AI generation" --> AISvc
    PostSumSvc -- "caches summaries" --> DAL_B
    AISvc -- "HTTPS REST" --> Gemini_B

    DAL_B -- "SQL / :5432" --> DB_B

    GW_B -. "validate" .-> Shared_B
    AuthSvc -. "schemas" .-> Shared_B

    classDef system fill:#1168bd,stroke:#0b4884,color:#fff
    classDef comp fill:#3baf4a,stroke:#2d8a3a,color:#fff
    classDef ext fill:#f5a623,stroke:#d4901c,color:#000

    class WebApp_B,DB_B system
    class Google_B,Gemini_B ext
    class GW_B,AuthR,ReactionR,ModR,AdminR,SumR comp
    class AuthSvc,SocialAuth,OAuthProv,ReactionSvc,ReportSvc,AdminSvc,PostSumSvc,AISvc comp
    class JWTLib,PwdLib,EnvCfg comp
    class DAL_B,Shared_B comp
```

> **Note:** The API Gateway, DAL, and Shared Types appear in both diagrams (shared infrastructure). The split is purely for presentation — the backend runs as **one container**.

#### 4.2.3 Component Descriptions

##### Middleware Pipeline (API Gateway)

Middleware applied (in order) before routing in `src/backend/index.ts`:

| Component | Responsibility | Source |
|---|---|---|
| **CORS Middleware** | Enforces origin-based CORS policy with credentials support. Allowed origins are configurable via `CORS_ORIGIN` env var. | `src/backend/index.ts` |
| **Auth Middleware** | Extracts and verifies the JWT access token from the `Authorization: Bearer` header. Hydrates `req.user` with `{ sub, role, status }`. Routes can be optionally or mandatorily authenticated (`requireAuth`, `optionalAuth`). | `src/backend/api/auth/` |
| **Rate Limiter** | Applies configurable per-window rate limits to abuse-prone endpoints (auth, AI summarization). Uses `express-rate-limit` with in-memory store. | `src/backend/lib/rate-limit.ts` |
| **Zod Validation** | Validates request bodies and parameters against Zod schemas from `src/shared/` at the API boundary. Rejects invalid requests with structured 422 error responses. | Inline in route handlers |
| **Central Error Handler** | The single place that maps thrown errors to HTTP JSON responses: `ZodError` -> 422, `AuthError` -> status from error, payload-too-large -> 413, unhandled -> 500. No error swallowing anywhere else. | `src/backend/index.ts` |

##### Route Layer

| Router | Path Prefix | Responsibility |
|---|---|---|
| **Auth Router** | `/api/v1/auth` | `POST /register`, `POST /login`, `POST /refresh`, `DELETE /logout`, `GET /me`, `GET /google` (initiate OAuth), `GET /google/callback`, `POST /change-password` |
| **Post Router** | `/api/v1/posts` | `GET /` (feed), `GET /for-you`, `POST /` (create), `GET /:id`, `PATCH /:id`, `DELETE /:id`, `POST /:id/repost`, `GET /user/:userId` |
| **Comment Router** | `/api/v1/posts/:postId/comments` | `GET /`, `POST /`, `PATCH /:commentId`, `DELETE /:commentId` |
| **Reaction Router** | `/api/v1/posts/:targetId/reactions` | `POST /` (toggle like on post or comment) |
| **Profile Router** | `/api/v1/profiles` | `GET /me`, `PATCH /me`, `GET /:userId`, `GET /username/:username` |
| **Search Router** | `/api/v1/search` | `GET /` (unified search with type filter: posts, users, hashtags) |
| **Upload Router** | `/api/v1/upload` | `POST /` (image upload via multer -> sharp -> Cloudinary) |
| **Moderation Router** | `/api/v1/moderation` | `POST /reports` (submit), `GET /reports` (queue), `PATCH /reports/:id` (escalate/dismiss) |
| **Admin Router** | `/api/v1/admin` | `GET /stats`, `GET/PATCH /users`, `GET /audit-logs`, `GET/POST/PATCH/DELETE /categories`, `GET/PATCH /settings`, `GET/PATCH /reports` |
| **Hashtag Router** | `/api/v1/hashtags` | `GET /trending`, `GET /:tag/posts` |

##### Service Layer

| Component | Responsibility | Key Relationships |
|---|---|---|
| **Auth Service** (`src/backend/api/auth/auth.service.ts`) | Core authentication logic: password verification, JWT access token signing (HS256, 15-min TTL), refresh token issuance with rotation (7-day, HttpOnly cookie), cookie construction, and session management. Defines the `AuthError` class used by the central error handler. | Uses JWT Library, Password Library, User Repository. |
| **Social Auth Service** (`src/backend/api/auth/social-auth.service.ts`) | Handles the OAuth account-linking flow: finds existing social links, links social profiles to existing email-matched accounts, or creates new user accounts with generated usernames. Issues session tokens matching the standard auth flow. | Uses OAuth Providers, User Repository. |
| **OAuth Providers** (`src/backend/api/auth/oauth-providers.ts`) | Implements provider-specific OAuth logic. Currently supports Google: exchanges authorization codes for tokens via the Google token endpoint, then fetches the user profile from the Google userinfo API. | Calls Google OAuth 2.0 (external). |
| **Post Service** (`src/backend/services/interactions/posts.ts`) | Business logic for post CRUD: creation (with content, attachments, and hashtag extraction), reading (single post with author/reactions/comment count), updating, soft-deletion (respecting ownership), and feed assembly with cursor-based pagination. | Uses Interactions Repository, Hashtag Repository. |
| **Feed Ranking** | Implements the "For You" feed algorithm: scores posts based on engagement metrics (reaction count, comment count, recency) to produce a ranked feed. | Uses Interactions Repository. |
| **Comment Service** (`src/backend/services/interactions/comments.ts`) | Business logic for comment CRUD: creation (with post-existence check and optional parent-comment for nesting), updating, and soft-deletion with ownership enforcement. | Uses Interactions Repository. |
| **Reaction Service** (`src/backend/services/interactions/reactions.ts`) | Toggle-style reaction logic: adds a reaction if it doesn't exist, removes it if it does. Currently supports the "like" reaction kind on both posts and comments. | Uses Interactions Repository. |
| **Report Service** (`src/backend/services/interactions/reports.ts`) | Creates user reports against posts, comments, or other users with a reason type and optional details. Retrieves reports for the moderation queue. | Uses Interactions Repository. |
| **AI Summarizer** (`src/backend/services/ai-summarizer.ts`) | Core AI logic: builds a structured prompt from post content and comment bodies, calls the Gemini API with a fallback chain of model versions (`gemini-2.5-flash` -> `gemini-1.5-flash` -> `gemini-2.0-flash`), parses the JSON response into `{ postSnapshot, keyHighlights, sentiment }`, and falls back to a text-truncation heuristic if all API calls fail. | Calls Gemini API (external). |
| **Post Summary Service** (`src/backend/services/post-summary.service.ts`) | Orchestrates the summary lifecycle: checks if a cached summary exists and is still fresh, triggers AI Summarizer if not, and upserts the result into the database. | Uses AI Summarizer, Summary Repository. |
| **Cloudinary Service** | Wraps the Cloudinary SDK: configures credentials from env, streams file buffers to Cloudinary's upload API, extracts public IDs from URLs, and deletes assets. | Calls Cloudinary (external). |
| **Image Processor** | Uses `sharp` to resize, reformat (to WebP), and optimize uploaded images before they are sent to Cloudinary. Ensures consistent image dimensions and file sizes. | Used by Upload Router. |
| **Admin Service** | Admin business logic: dashboard statistics (user/post/comment/report counts), user management (role changes, status changes with audit logging), forum category CRUD, system settings management, and audit log retrieval. | Uses Admin Repository, User Repository. |

##### Data Access Layer (`src/backend/db/`)

| Component | Responsibility | Database Tables |
|---|---|---|
| **User Repository** | Queries for user accounts and profiles: find by ID, email, or username; create users; update profiles; issue refresh tokens; manage refresh sessions. | `user_accounts`, `profiles`, `refresh_sessions`, `user_social_links` |
| **Interactions Repository** | Queries for posts, comments, reactions, reports, and attachments. Handles feed queries with pagination, post-with-relations fetching, comment trees, reaction toggling, and report management. | `posts`, `comments`, `reactions`, `reports`, `post_attachments` |
| **Hashtag Repository** | Manages hashtag entities and their associations with posts. Supports trending hashtag queries (by post count) and hashtag-based post feeds. | `hashtags`, `post_hashtags` |
| **Summary Repository** (`src/backend/db/post-summary.repository.ts`) | Upserts and retrieves AI-generated post summaries. Handles staleness checks based on comment count changes. | `post_summaries` |
| **Admin Repository** | Queries for admin operations: audit log insertion and retrieval, forum category CRUD, system settings reads/writes, and aggregate statistics. | `admin_audit_logs`, `forum_categories`, `system_settings` |
| **Profile Repository** (`src/backend/db/profiles.ts`) | Dedicated profile queries: get profile by user ID, update profile fields (display name, bio, avatar URL, location, website). | `profiles` |

##### Library Layer

| Component | Responsibility |
|---|---|
| **JWT Library** (`jsonwebtoken`) | Wraps `jsonwebtoken` to sign access tokens with `HS256` and configurable TTL, and to verify tokens extracting the payload `{ sub, role, status }`. |
| **Password Library** (`bcrypt`) | Wraps `bcrypt` for password hashing (configurable cost factor) and comparison. |
| **Env Config** (`src/backend/env.ts`) | Validates all environment variables at startup using a Zod schema. Fails fast with clear error messages if required variables are missing or malformed. Exports the typed `env` object used throughout the backend. |
