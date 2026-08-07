# D — Deployment Diagram

*Work performed by: Nguyễn Tuấn An | Reviewed by: [Name] | Edited by: [Name]*

> **Version**: 1.0.0
> **Last Updated**: 2026-08-07
>
> This document maps the containers defined in the Architecture Document to the physical and cloud infrastructure that runs them, for both **development** and **production** environments. Diagrams use Mermaid syntax following C4 deployment conventions.

---

## Table of Contents

1. [Production Deployment Diagram](#1-production-deployment-diagram)
   - 1.1 [Diagram](#11-diagram)
   - 1.2 [Node Descriptions](#12-node-descriptions)
   - 1.3 [Communication Protocols Summary](#13-communication-protocols-summary)
2. [Development Deployment Diagram](#2-development-deployment-diagram)
   - 2.1 [Diagram](#21-diagram)
   - 2.2 [Node Descriptions](#22-node-descriptions)
   - 2.3 [Communication Protocols Summary](#23-communication-protocols-summary)
3. [Environment Comparison](#3-environment-comparison)

---

## 1. Production Deployment Diagram

### 1.1 Diagram

```mermaid
flowchart TD
    subgraph user_device ["User Device<br/><i>Web Browser (Desktop / Mobile)</i>"]
        Browser["Web Browser<br/><i>Chrome, Firefox, Safari, Edge</i><br/><br/>Runs the React 19 SPA<br/>after initial page load"]
    end

    subgraph vercel_cloud ["Vercel — Edge Network / CDN<br/><i>Cloud Hosting Platform (Free Tier)</i>"]
        SPA["Web Application<br/><i>React 19 · TypeScript · Vite 8</i><br/><br/>Static SPA bundle (HTML, JS, CSS)<br/>served from Vercel CDN.<br/>API rewrites proxy /api/v1/*<br/>to Render backend."]
    end

    subgraph render_cloud ["Render — Web Service<br/><i>Cloud Hosting Platform (Free Tier)</i>"]
        API["Backend API Server<br/><i>Node.js v24 · Express 5 · ESM</i><br/><br/>RESTful API under /api/v1<br/>hosted as a Render Web Service<br/>at foz-backend.onrender.com"]
    end

    subgraph neon_cloud ["Neon — Serverless PostgreSQL<br/><i>Cloud Database Service (Free Tier)</i>"]
        DB[("PostgreSQL Database<br/><i>postgres:16 (Neon hosted)</i><br/><br/>User accounts, profiles, posts,<br/>comments, reactions, reports,<br/>audit logs, categories, hashtags,<br/>summaries, system settings")]
    end

    subgraph google_cloud ["Google Cloud Platform<br/><i>External Services</i>"]
        GoogleOAuth["Google OAuth 2.0<br/><i>Social Authentication</i>"]
        GeminiAPI["Google Generative AI<br/>(Gemini API)<br/><i>AI Summarization</i>"]
    end

    subgraph cloudinary_cloud ["Cloudinary<br/><i>Media Cloud (Free Tier)</i>"]
        CloudinaryCDN["Cloudinary<br/><i>Image Storage & CDN</i><br/><br/>Post attachments and<br/>profile avatars"]
    end

    Browser -- "HTTPS (port 443)<br/>Initial page load &<br/>static assets" --> SPA
    SPA -. "Vercel Rewrite Rule<br/>/api/v1/:match* →<br/>foz-backend.onrender.com<br/>[HTTPS]" .-> API
    Browser -- "HTTPS JSON<br/>/api/v1/* via Vercel rewrite<br/>+ Bearer token auth" --> API

    API -- "SQL over TLS<br/>(postgres.js driver,<br/>TCP port 5432)" --> DB

    API -- "HTTPS<br/>OAuth code exchange<br/>& profile fetch" --> GoogleOAuth
    API -- "HTTPS REST<br/>Structured prompts &<br/>JSON responses" --> GeminiAPI
    API -- "HTTPS<br/>Stream upload &<br/>asset deletion" --> CloudinaryCDN

    Browser -- "HTTPS<br/>CDN-delivered image URLs<br/>(read-only)" --> CloudinaryCDN

    classDef infra fill:#6c757d,stroke:#495057,color:#fff
    classDef container fill:#1168bd,stroke:#0b4884,color:#fff
    classDef ext fill:#f5a623,stroke:#d4901c,color:#000
    classDef client fill:#08427b,stroke:#073b6e,color:#fff
    classDef db fill:#2d6a4f,stroke:#1b4332,color:#fff

    class Browser client
    class SPA,API container
    class DB db
    class GoogleOAuth,GeminiAPI,CloudinaryCDN ext
```

### 1.2 Node Descriptions

| Node | Infrastructure / Cloud Service | Containers Deployed | Notes |
|---|---|---|---|
| **User Device** | Desktop or mobile device running a modern web browser (Chrome, Firefox, Safari, Edge) | **Web Application (SPA)** — downloaded and executed client-side as static JS/CSS/HTML | The React 19 SPA runs entirely in the browser after the initial page load. All server communication is via REST API calls. |
| **Vercel — Edge Network / CDN** | **Vercel** (free tier, no credit card required). Global edge CDN with serverless rewrite rules. | **Web Application (SPA)** — static build output (`src/frontend/dist`) served from Vercel's CDN. | Vercel serves the static SPA bundle and uses [rewrite rules](../vercel.json) to proxy all `/api/v1/*` requests to the Render-hosted backend (`foz-backend.onrender.com`). This eliminates CORS issues in production and provides a unified domain for the user. Build command: `npm run build`. |
| **Render — Web Service** | **Render** (free tier, no credit card required). Managed container/web-service hosting. | **Backend API Server** — Node.js v24 Express 5 application running as a Render Web Service. | The backend runs as a single long-lived process. Render provides the `RENDER_EXTERNAL_HOSTNAME` env var used for Google OAuth callback URL construction. The free tier has cold-start latency on idle instances. |
| **Neon — Serverless PostgreSQL** | **Neon** (free tier). Serverless PostgreSQL with auto-scaling and branching. | **PostgreSQL Database** — `postgres:16`-compatible managed database. | Neon provides a serverless PostgreSQL-compatible endpoint. The backend connects via `DATABASE_URL` using the `postgres.js` driver over TLS-encrypted TCP on port 5432. Schema migrations are managed via `drizzle-kit`. |
| **Google Cloud Platform** | **Google Cloud** (API-based services). | **Google OAuth 2.0** — social login identity provider. **Google Generative AI (Gemini API)** — AI summarization service. | Two independent Google services: OAuth 2.0 for authentication and Gemini API for post/comment TL;DR summarization with a fallback model chain (`gemini-2.5-flash` → `gemini-1.5-flash` → `gemini-2.0-flash`). |
| **Cloudinary** | **Cloudinary** (free tier). Cloud-based media management and CDN. | **Cloudinary Media Service** — image storage, transformation, and CDN delivery. | Post attachments and profile avatars are uploaded from the backend via Cloudinary's streaming API. CDN URLs are stored in the database and served directly to browsers for read access. |

### 1.3 Communication Protocols Summary

| From | To | Protocol | Port | Description |
|---|---|---|---|---|
| User Browser | Vercel CDN | HTTPS | 443 | Initial SPA download (HTML, JS, CSS, static assets) |
| User Browser (SPA) | Render Backend (via Vercel rewrite) | HTTPS | 443 | JSON REST API calls to `/api/v1/*`; Vercel transparently rewrites to `foz-backend.onrender.com`. Authenticated requests include `Authorization: Bearer <token>` header; refresh uses HTTP-only cookies. |
| Render Backend | Neon PostgreSQL | PostgreSQL wire protocol over TLS | 5432 | SQL queries via `postgres.js` driver through Drizzle ORM. Connection pool max 10. |
| Render Backend | Google OAuth 2.0 | HTTPS | 443 | Authorization code exchange and user profile fetch |
| Render Backend | Google Gemini API | HTTPS REST | 443 | Structured prompt submission and JSON response parsing |
| Render Backend | Cloudinary | HTTPS | 443 | Image stream upload and asset deletion |
| User Browser | Cloudinary CDN | HTTPS | 443 | Direct image retrieval via CDN-delivered URLs |

---

## 2. Development Deployment Diagram

### 2.1 Diagram

```mermaid
flowchart TD
    subgraph dev_machine ["Developer's Local Machine<br/><i>Windows / macOS / Linux</i>"]
        subgraph browser_node ["Web Browser"]
            Browser_Dev["Web Browser<br/><i>Chrome / Firefox / Edge</i><br/><br/>Accesses the SPA at<br/>http://localhost:5173"]
        end

        subgraph vite_node ["Vite Dev Server<br/><i>Node.js process — port 5173</i>"]
            SPA_Dev["Web Application (SPA)<br/><i>React 19 · TypeScript · Vite 8</i><br/><br/>HMR-enabled dev server.<br/>Proxies /api/v1/* to<br/>localhost:4000."]
        end

        subgraph express_node ["Express Dev Server<br/><i>Node.js process — port 4000</i>"]
            API_Dev["Backend API Server<br/><i>Node.js v24 · Express 5 · ESM</i><br/><br/>RESTful API under /api/v1<br/>with hot-reload (tsx/nodemon)"]
        end

        subgraph docker_node ["Docker Container<br/><i>docker-compose service: foz_db</i>"]
            DB_Dev[("PostgreSQL Database<br/><i>postgres:16</i><br/><br/>Container: foz_db<br/>Database: foz_dev<br/>Volume: foz_pg_data")]
        end

        subgraph shared_node ["Shared Module<br/><i>Build-time dependency</i>"]
            Shared_Dev["Shared Module<br/><i>src/shared/</i><br/><br/>Zod schemas, DTOs, enums.<br/>Imported via #shared/*<br/>path aliases at build time."]
        end
    end

    subgraph google_dev ["Google Cloud Platform<br/><i>External Services</i>"]
        GoogleOAuth_Dev["Google OAuth 2.0"]
        GeminiAPI_Dev["Google Generative AI<br/>(Gemini API)"]
    end

    subgraph cloudinary_dev ["Cloudinary<br/><i>External Service</i>"]
        CloudinaryCDN_Dev["Cloudinary<br/><i>Image Storage & CDN</i>"]
    end

    Browser_Dev -- "HTTP (port 5173)<br/>Page loads + HMR<br/>WebSocket" --> SPA_Dev
    SPA_Dev -- "Vite Proxy<br/>/api/v1/* →<br/>localhost:4000<br/>[HTTP]" --> API_Dev

    API_Dev -- "SQL over TCP<br/>(postgres.js driver,<br/>port 5432,<br/>user: foz / db: foz_dev)" --> DB_Dev

    API_Dev -- "HTTPS<br/>OAuth code exchange" --> GoogleOAuth_Dev
    API_Dev -- "HTTPS REST<br/>AI summarization" --> GeminiAPI_Dev
    API_Dev -- "HTTPS<br/>Image upload/delete" --> CloudinaryCDN_Dev

    Shared_Dev -. "Build-time import<br/>(Vite alias)" .-> SPA_Dev
    Shared_Dev -. "Build-time import<br/>(TS path mapping)" .-> API_Dev

    classDef infra fill:#6c757d,stroke:#495057,color:#fff
    classDef container fill:#1168bd,stroke:#0b4884,color:#fff
    classDef ext fill:#f5a623,stroke:#d4901c,color:#000
    classDef client fill:#08427b,stroke:#073b6e,color:#fff
    classDef db fill:#2d6a4f,stroke:#1b4332,color:#fff
    classDef shared fill:#7b2d8b,stroke:#5a1d6b,color:#fff

    class Browser_Dev client
    class SPA_Dev,API_Dev container
    class DB_Dev db
    class GoogleOAuth_Dev,GeminiAPI_Dev,CloudinaryCDN_Dev ext
    class Shared_Dev shared
```

### 2.2 Node Descriptions

| Node | Infrastructure | Containers / Processes Running | Notes |
|---|---|---|---|
| **Web Browser** | Developer's local browser (Chrome, Firefox, Edge) | **Web Application (SPA)** — React app loaded from `http://localhost:5173` | HMR (Hot Module Replacement) via Vite's WebSocket connection provides instant feedback during development. |
| **Vite Dev Server** | Local machine, Node.js process on **port 5173** | **Web Application (SPA)** — Vite 8 dev server serving the React 19 SPA with HMR | The Vite dev server proxies all `/api/v1/*` requests to `http://localhost:4000` (the Express backend), eliminating CORS issues during local development. |
| **Express Dev Server** | Local machine, Node.js process on **port 4000** | **Backend API Server** — Express 5 RESTful API running in development mode | Typically launched via `tsx` or `nodemon` for hot-reload. Environment variables loaded from `.env` file. Connects to the local Docker PostgreSQL instance. |
| **Docker Container (foz_db)** | Local machine, **Docker Desktop** running `docker-compose.yml` | **PostgreSQL Database** — `postgres:16` image as service `foz_db` | Provisioned via `docker-compose.yml`. Credentials: user `foz`, password `foz`, database `foz_dev`. Port `5432` exposed to localhost. Data persisted in Docker volume `foz_pg_data`. Health check: `pg_isready -U foz -d foz_dev`. |
| **Shared Module** | Local machine filesystem (`src/shared/`) | **Shared Module** — TypeScript source (Zod schemas, DTOs, enums) | Not a running process. Consumed at build time by both the Vite dev server (via Vite alias `#shared/*`) and the Express dev server (via TypeScript `paths` mapping). Changes trigger HMR/rebuild in consumers. |
| **Google Cloud Platform** | Google Cloud (same external API as production) | **Google OAuth 2.0**, **Gemini API** | Developers must configure `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `AI_API_KEY` in their local `.env` file. OAuth callback defaults to `http://localhost:4000/api/v1/auth/google/callback`. |
| **Cloudinary** | Cloudinary Cloud (same external API as production) | **Cloudinary Media Service** | Developers must configure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in their local `.env` file. |

### 2.3 Communication Protocols Summary

| From | To | Protocol | Port | Description |
|---|---|---|---|---|
| Browser | Vite Dev Server | HTTP + WebSocket | 5173 | Page loads and HMR (Hot Module Replacement) updates |
| Vite Dev Server | Express Dev Server | HTTP (Vite proxy) | 4000 | Proxied REST API calls (`/api/v1/*` → `localhost:4000`) |
| Express Dev Server | Docker PostgreSQL | PostgreSQL wire protocol (TCP) | 5432 | SQL queries via `postgres.js` / Drizzle ORM (unencrypted locally) |
| Express Dev Server | Google OAuth 2.0 | HTTPS | 443 | Authorization code exchange and user profile fetch |
| Express Dev Server | Gemini API | HTTPS REST | 443 | AI summarization requests |
| Express Dev Server | Cloudinary | HTTPS | 443 | Image upload and deletion |

---

## 3. Environment Comparison

| Aspect                   | Development                                         | Production                                                     |
| ------------------------ | --------------------------------------------------- | -------------------------------------------------------------- |
| **Frontend Hosting**     | Vite dev server on `localhost:5173`                 | Vercel Edge CDN (global, static build)                         |
| **Backend Hosting**      | Express on `localhost:4000` with hot-reload         | Render Web Service (`foz-backend.onrender.com`)                |
| **Database**             | Docker container `foz_db` (`postgres:16`, local)    | Neon Serverless PostgreSQL (cloud, TLS-encrypted)              |
| **API Proxying**         | Vite proxy (`/api/v1/*` → `localhost:4000`)         | Vercel rewrite rules (`/api/v1/*` → Render)                    |
| **TLS/HTTPS**            | HTTP (no TLS locally)                               | HTTPS everywhere (Vercel, Render, Neon all enforce TLS)        |
| **Image Storage**        | Cloudinary (same cloud service)                     | Cloudinary (same cloud service)                                |
| **OAuth Callback**       | `http://localhost:4000/api/v1/auth/google/callback` | `https://foz-backend.onrender.com/api/v1/auth/google/callback` |
| **Shared Module**        | Live source imports with HMR rebuild                | Compiled into static bundles at build time                     |
| **Database Credentials** | Hardcoded in `docker-compose.yml` (`foz/foz`)       | Managed via Neon dashboard + `DATABASE_URL` env var            |
| **Cold Start**           | None (always running)                               | Render free tier has cold-start on idle                        |
