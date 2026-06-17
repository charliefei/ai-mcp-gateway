# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

An MCP (Model Context Protocol) gateway that exposes HTTP/REST APIs as MCP-compatible tools. Clients connect via **SSE** (legacy) or **Streamable HTTP**, then send JSON-RPC 2.0 requests (initialize, tools/list, tools/call, resources/list). The gateway translates tool calls into HTTP requests against configured backend APIs. The transport is selected per gateway via the `transport` field in `mcp_gateway` (see **Transports** below for protocol details).

## Documentation

- `README.md` — overview, deployment, and full feature list
- `docs/mysql/sql/ai_mcp_gateway_v2.sql` — database schema (run once before first start)
- `docs/deploy/README.md` — Docker Compose deployment (single + cluster modes)

## First-time Setup

1. Create the MySQL database: `CREATE DATABASE ai_mcp_gateway_v2;` (no migrations are bundled)
2. Set the env var: `export DASHSCOPE_API_KEY=...` (required only for LLM endpoints)
3. Build once without tests: `mvn clean install -DskipTests`
4. Start the app: `mvn spring-boot:run` (from repo root)

## Build & Run

```bash
# Build all modules
mvn clean install

# Build without tests
mvn clean install -DskipTests

# Run the application (from repo root, NOT from ai-mcp-gateway-app/)
mvn spring-boot:run

# Run with specific profile
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Run tests
mvn test

# Run a single test class
mvn test -pl ai-mcp-gateway-app -Dtest=ApiTest

# Run all tests in a single module
mvn test -pl ai-mcp-gateway-case

# Run admin UI (from ai-mcp-gateway-admin-ui)
npm install
npm run dev

# Type-check admin UI
npx tsc --noEmit

# Build admin UI for production
npm run build
```

**Admin UI stack**: React 18, Vite 6, TypeScript 5.6, Tailwind CSS 3 (class-based dark mode), Radix UI primitives, lucide-react icons, sonner toasts, react-router-dom v7. Custom shadcn/ui-style components in `src/components/ui/`.

**Admin UI page pattern**: All 6 pages (5 CRUD lists: `gateway`, `tool`, `protocol`, `auth`, `test` + 1 `Dashboard` at `/`) follow the same structure: search bar (Card) → data table with record count (CardHeader/CardContent) → pagination (when totalPages > 1) → create/edit dialog. Each page manages its own state with useState/useCallback; the `useApi` hooks in `src/hooks/use-api.ts` are available but pages use manual state — do not refactor a page to `useApi` without first checking the hook's surface.

**Theme**: Dark mode via `darkMode: 'class'` in tailwind.config.ts. Toggle hook at `src/hooks/use-theme.ts` persists to localStorage, listens to system preference changes. CSS custom properties in `src/index.css` use HSL format (e.g., `271 81% 56%` for primary). Sidebar uses sidebar-specific tokens (`--sidebar-bg`, `--sidebar-fg`, etc.) defined in tailwind.config.ts.

**Runtime**: Java 17, Spring Boot 3.4.3, port 8777, context-path `/api-gateway`

**Required env vars**: `DASHSCOPE_API_KEY` (Alibaba Bailian/DashScope API key for LLM features)

## Key Entry Points

- Spring Boot main: `ai-mcp-gateway-app/src/main/java/.../Application.java`
- JSON-RPC 2.0 schema (sealed interfaces + records): `McpSchemaVO` in `ai-mcp-gateway-domain` — defines `JSONRPCRequest`, `JSONRPCNotification`, `JSONRPCResponse`
- SSE controller: `McpSSEGatewayController` (trigger layer) — handles the legacy SSE transport at `/{gatewayId}/mcp/sse`
- Streamable HTTP controller: `McpStreamableGatewayController` (trigger layer) — handles GET/POST/DELETE at `/{gatewayId}/mcp`
- Session/message chain wiring (SSE): `DefaultMcpSSESessionFactory` (session), `DefaultMcpMessageFactory` (message) in case layer (`com.feirui.ai.cases.mcp.sse.*`)
- Session/message chain wiring (Streamable): `DefaultMcpStreamableSessionFactory` (session), `DefaultMcpStreamableMessageFactory` (message) in case layer (`com.feirui.ai.cases.mcp.streamable.*`)
- Distributed-session startup listener: `SessionRedisListener` (trigger layer) — subscribes to Redis session-sync events on boot
- Case-layer distributed bridge: `DistributedRedisService` (`com.feirui.ai.cases.distributed.redis.*`) — links trigger listener to domain services
- MyBatis mappers: `ai-mcp-gateway-app/src/main/resources/mybatis/mapper/`

## Architecture

DDD (Domain-Driven Design) layered architecture using Maven modules:

| Module | Layer | Responsibility |
|---|---|---|
| `ai-mcp-gateway-admin-ui` | UI | React/Vite admin frontend (TypeScript, shadcn/ui) |
| `ai-mcp-gateway-trigger` | Trigger | HTTP controllers (REST endpoints) |
| `ai-mcp-gateway-api` | API | Service interfaces exposed to trigger layer |
| `ai-mcp-gateway-case` | Case | Orchestration — tree strategy chains for session creation and message handling |
| `ai-mcp-gateway-domain` | Domain | Core business logic: auth, session, protocol, gateway, admin, llm domain services |
| `ai-mcp-gateway-infrastructure` | Infrastructure | DB access (MyBatis), HTTP clients (Retrofit/OkHttp) |
| `ai-mcp-gateway-types` | Types | Shared enums, constants, exceptions |
| `ai-mcp-gateway-app` | App | Spring Boot entry point, configs, MyBatis mappers, resources |

**Dependency flow**: trigger → case → domain → types; infrastructure implements domain ports/repositories.

## Key Design Patterns

### Tree Strategy Pattern (case layer)
Session creation and message handling use a chain-of-responsibility tree from the `xfg-wrench-starter-design-framework` library. Each transport has its own session and message chains under `com.feirui.ai.cases.mcp.{sse,streamable}.*`:

- **Session flow (SSE)**: `RootNode` → `VerifyNode` (auth check) → `SessionNode` (create session) → `EndNode`
- **Message flow (SSE)**: `RootNode` (rate limit check) → `SessionNode` (resolve session) → `MessageHandlerNode` → specific handler
- **Session flow (Streamable)**: `RootNode` → `VerifyNode` → `StreamableSessionNode` → `EndNode`
- **Message flow (Streamable)**: `RootNode` (rate limit + JSON-RPC `Response` short-circuit to 202) → branches to `InitializeNode` (for the `initialize` method) OR `SessionNode` → `MessageHandlerNode`

Factories (`DefaultMcpSessionFactory`, `DefaultMcpMessageFactory`, `DefaultMcpStreamableSessionFactory`, `DefaultMcpStreamableMessageFactory`) wire the chains. Nodes extend abstract base classes and override `doApply()` + `get()` (next node).

### Strategy Pattern (domain layer)
- `SessionMessageHandlerMethodEnum` maps JSON-RPC method names to Spring bean handler names. `SessionMessageService` dispatches to the correct `IRequestHandler` implementation via a `Map<String, IRequestHandler>`.
- Protocol analysis uses `IProtocolAnalysisStrategy` implementations for parsing OpenAPI parameters vs request bodies.
- **`limit+1` SQL trick for "has more"**: When a search/list query needs both a capped result and a "has more" flag without a separate `COUNT(*)`, run `LIMIT #{limit + 1}` and check `result.size() > limit`. Used by `AdminRepository.globalSearch` to set `truncated = 1` for the "查看全部" link in the global-search palette.

### MCP Protocol (domain layer)
`McpSchemaVO` defines the JSON-RPC 2.0 message types as Java 17 sealed interfaces and records: `JSONRPCRequest`, `JSONRPCNotification`, `JSONRPCResponse`. Protocol version: `2024-11-05`.

### Distributed Sessions (Redis backplane)
Multi-instance deployments share session state via Redisson (added in commits `86ecbf9` + `6db88be`):

- **Storage**: session metadata persisted to a Redis `RMap` via `SessionPort` (infrastructure adapter implementing `ISessionPort`).
- **Sync events**: every create/remove publishes a `SessionSyncEventVO` carrying a `SessionSyncInfoVO` payload on a Redisson Pub/Sub topic.
- **Listener**: `SessionRedisListener` (trigger layer) subscribes on startup and rebroadcasts events to `SessionDistributedService`, which reconciles the local in-memory `SessionManagementService`.
- **Cross-node cleanup**: both SSE and Streamable `EndNode`s publish a removal event so peer nodes drop the session immediately when an SSE stream closes.

Redis config lives in `application-dev.yml` under `redis.sdk.config` (`host`, `port`, `pool-size`, `min-idle-size`). Each profile must supply its own block — env-var-driven like the DB password.

Domain ports live in `com.feirui.ai.domain.session.service.distributed` and `management` sub-packages; the case-layer bridge is `com.feirui.ai.cases.distributed.redis.DistributedRedisService`. Single-instance dev still works without Redis — the listener will fail to subscribe but local in-memory sessions continue.

## Data Layer

- **Database**: MySQL 8.x via MyBatis. Mapper XMLs in `ai-mcp-gateway-app/src/main/resources/mybatis/mapper/`.
- **Tables**: `mcp_gateway_auth`, `mcp_gateway`, `mcp_gateway_tool`, `mcp_protocol_http`, `mcp_protocol_mapping`
- **Connection pool**: HikariCP

## Transports

The gateway supports two MCP transports side-by-side, selectable per gateway via the `transport` field in `mcp_gateway` (values from `SessionTransportTypeEnumVO`: `sse`, `streamable`).

### SSE transport (`McpSSEGatewayController`, path `/{gatewayId}/mcp/sse`)

1. Client GETs `/{gatewayId}/mcp/sse?api_key=KEY` → server creates session, returns SSE stream; first event is `endpoint` with the message URL, e.g. `/mcp/sse/messages?sessionId=<id>`
2. Client POSTs JSON-RPC body to the message URL with `sessionId` and (if auth enabled) `api_key` query params
3. Responses stream back over the original SSE connection

### Streamable HTTP transport (`McpStreamableGatewayController`, path `/{gatewayId}/mcp`)

1. `GET /{gatewayId}/mcp` (header `Mcp-Session-Id: <id>`, optional `?api_key=`) — opens an SSE listener stream bound to the existing session
2. `POST /{gatewayId}/mcp` (header `Mcp-Session-Id: <id>`, optional `?api_key=`, body = JSON-RPC 2.0) — sends a request; **must include `Accept: application/json, text/event-stream`** or the server returns 406
3. `DELETE /{gatewayId}/mcp` (header `Mcp-Session-Id: <id>`) — terminates the session

Server response rules:
- `Request` with `id` → JSON-RPC `Response` body (status 200)
- `Notification` (no `id`) → `202 Accepted` with empty body
- `Response` (client→server, e.g. progress ack) → `202 Accepted` with empty body
- Any protocol/parse/auth error → JSON-RPC `Response` with `error` object and matching HTTP status (400/406/500)

`Mcp-Session-Id` is the canonical session identifier; `?sessionId=` query param is accepted for compatibility with the SSE transport.

The `api_key` is optional on both transports and required only for gateways with auth enabled. Auth keys are managed via the admin API.

## Configuration

- `application.yml` — base config; active profile is selected by `SPRING_PROFILES_ACTIVE` env var (or `mvn spring-boot:run -Dspring-boot.run.profiles=<name>`)
- `application-dev.yml` — local dev (MySQL at 127.0.0.1:3306, database `ai_mcp_gateway_v2`)
- `application-test.yml`, `application-prod.yml` — other environments
- Spring AI configured for OpenAI-compatible endpoints against Alibaba Bailian/DashScope (`qwen3.6-flash` model)
- Thread pool: core 20 / max 50, CallerRunsPolicy rejection (see `ThreadPoolConfig`)

## Docker Deployment

A self-contained compose stack lives at `docs/deploy/`:
- `docker-compose.yml` — orchestrates MySQL 8, Redis 7, the Spring Boot app, an `app-lb` nginx load balancer, and the admin UI
- `nginx-app.conf` — backend load balancer with docker-DNS-based service discovery
- `.env.example` — env template (`DASHSCOPE_API_KEY`, `MYSQL_ROOT_PASSWORD`, host-port overrides)

**Per-module Dockerfiles**: `ai-mcp-gateway-app/Dockerfile` (pre-existing, copies the prebuilt jar) and `ai-mcp-gateway-admin-ui/Dockerfile` (multi-stage Node 20 → nginx 1.27). The admin UI's `nginx.conf` has a `__BACKEND_URL__` placeholder that the Dockerfile's `sed` step replaces at build time — **changing the backend URL requires rebuilding the admin UI image**, not just restarting the container.

**Mode switching via profiles**:
- Single (default): `docker compose up -d --build` — 1 backend (`app`) behind `app-lb`
- Cluster: `docker compose --profile cluster up -d --build` — adds `app-1`, `app-2`, `app-3`. `nginx-app.conf` uses `resolver 127.0.0.11` + `resolve` on each upstream `server`, so services whose DNS doesn't resolve (inactive profile) are silently excluded from the pool.

**Host port mapping**: the user-facing URL `http://localhost:8777/api-gateway/` is unchanged, but in docker that port is now served by `app-lb` (nginx) on every `app*` container — the Spring Boot containers are reachable only inside the `gateway-net` bridge.

**Env-var overrides for the dev profile** (compose uses these to point at in-network MySQL/Redis):
- `SPRING_DATASOURCE_URL` / `SPRING_DATASOURCE_USERNAME` / `SPRING_DATASOURCE_PASSWORD` (Spring relaxed binding)
- `REDIS_SDK_CONFIG_HOST` / `REDIS_SDK_CONFIG_PORT` (YAML path is `redis.sdk.config.host`)

**Health-check URL**: there is no Spring Actuator. The compose `healthcheck` hits `/api-gateway/admin/query_gateway_config_list`.

**DB schema bootstrap**: `docs/mysql/sql/` is bind-mounted to `/docker-entrypoint-initdb.d` and runs **only once**, on first start with an empty data volume. To re-bootstrap: `docker compose down -v`.

## Access URLs

- API: `http://localhost:8777/api-gateway`
- Admin UI: `http://localhost:5173` (Vite dev server)
- Admin API: `http://localhost:8777/api-gateway/admin/`

## Gotchas

- The `api_key` is passed as a **query parameter** (`?api_key=KEY`), not as an HTTP header
- `mvn spring-boot:run` must be run from repo root (parent POM), not from `ai-mcp-gateway-app/`
- Database `ai_mcp_gateway_v2` must be created manually before first run — schema is in `docs/mysql/sql/ai_mcp_gateway_v2.sql`
- `vite.config.ts` requires `@types/node` for `path` and `__dirname` — if builds fail with TS2307/TS2304, run `npm install --save-dev @types/node`
- `application-dev.yml` contains a hardcoded MySQL password — do NOT copy dev credentials into test/prod profiles; use env vars
- **Reverse-proxying the MCP transport**: any nginx/HAProxy/ALB in front of the gateway must set `proxy_buffering off`, `proxy_http_version 1.1`, `proxy_set_header Connection ""`, and 1h `proxy_send_timeout` / `proxy_read_timeout`, otherwise SSE / Streamable HTTP streams stall. `docs/deploy/nginx-app.conf` is the reference config.
- **`application-dev.yml` hardcodes Redis at `192.168.1.108:16379`** — for non-local deployments override via `REDIS_SDK_CONFIG_HOST` / `REDIS_SDK_CONFIG_PORT` env vars (Spring relaxed binding of the YAML path `redis.sdk.config.host`).
- **Admin UI backend URL is baked at image build time**: the `__BACKEND_URL__` placeholder in `ai-mcp-gateway-admin-ui/nginx.conf` is `sed`-replaced by the Dockerfile. Switching the upstream (e.g. from `app` to `app-lb`) requires `docker compose build admin-ui` before `up`.

## Admin Management API

An operations management subsystem at `/admin/` provides CRUD management for gateway configurations:

- **Gateway config**: save, query list/paginated
- **Tool config**: save/delete, query list/paginated/by gateway ID
- **Protocol config**: save/delete/import (OpenAPI JSON), query list/paginated/by gateway ID, analysis (preview parsed OpenAPI)
- **Auth config**: save/delete, query list/paginated/by gateway ID
- **LLM test call**: `test_call_gateway` — sends a test request through the gateway to verify end-to-end connectivity
- **Global search**: `GET /admin/global_search?keyword=xxx&limit=5` — returns categorized matches (网关/工具/协议/认证) with `count`, `truncated`, and `items` per category. Follows the same DDD chain as other admin endpoints.

Triggers route to case-layer admin services (`IAdminGatewayService`, `IAdminAuthService`, `IAdminProtocolService`, `IAdminManageService`, `IAdminLLMService`), which delegate to domain services in `domain.gateway`, `domain.admin`, and `domain.llm` packages.

## Admin UI (ai-mcp-gateway-admin-ui)

- **Layout files**: `src/components/layout/` holds `MainLayout.tsx` (route shell), `Sidebar.tsx` (left nav), and `TopBar.tsx` (header bar). New layout chrome goes here — not into individual pages.
- **UI primitive pattern**: All shared components in `src/components/ui/` follow the shadcn/ui pattern — Radix primitive + hand-rolled Tailwind styling. New composite components should extend the same pattern; do not introduce parallel component systems.
- **Composite widgets (`src/components/common/`)**: Reusable page-level widgets — `FormField`, `PageHeader`, `SearchBar`, `Pagination`, `StatusDot`, `MethodPill`, `ConfirmDialog`, `EmptyState`, `GradientText`, `Toolbar`, `ApiKeyCell` (re-exported from `index.ts`). Use these for any element that appears on more than one page; do not re-implement them inline.
- **Select dropdowns**: ALWAYS use `@radix-ui/react-select` (already installed). Do NOT hand-roll a `<select>` wrapper or use `@floating-ui/react` — both have been tried and failed: native `position: fixed` is hijacked by the Dialog's `transform` scale/translate animations; Floating UI's `autoUpdate` did not flip reliably inside a Dialog portal. `src/components/ui/select.tsx` exposes a `FlatSelect` shim over Radix primitives that accepts the flat `options` API — call sites pass `{ value, onChange, options }` unchanged.
- **Re-export pattern when swapping implementations**: When replacing the implementation of a UI primitive, keep the existing export name via `export { NewImpl as OldName }` so call sites don't need to change. Example: `export { FlatSelect as Select }`.
- **Admin UI type/build checks**: `npx tsc --noEmit` (type check), `npx vite build` (production build). There is no lint config — these two commands are the verification surface.
- **`FormField` label is `ReactNode`**: `FormField` in `src/components/common/FormField.tsx` accepts `label?: ReactNode`, so icon-prefixed labels work: `<FormField label={<span className="flex items-center gap-1.5"><Key className="h-3 w-3" /> 认证 API Key</span>}>`.
- **Global search palette**: `src/components/layout/GlobalSearch.tsx` opens from the TopBar button or `⌘K`/`Ctrl+K` (listener mounted in `MainLayout`). Calls `searchApi.globalSearch(keyword, 5)` and navigates to `/${path}?q=${encoded}` on click. Reuse the existing custom `Dialog` for the modal — it already handles Escape, backdrop, body overflow.
- **Debounce hook**: `src/hooks/use-debounce.ts` — `useDebounce<T>(value, 200)` for throttling search inputs.
- **Per-page `?q=` prefill**: Gateway/Tool/Protocol/Auth list pages each read `?q=` via `useSearchParams` and prefill their primary local search field (`searchGatewayName` / `searchGatewayId` / `searchHttpUrl` / `searchGatewayId`). A second `useEffect` syncs state if the URL changes after mount. When adding a new list page that should participate in global search, mirror this pattern: `useState(() => searchParams.get('q') ?? '')` + sync `useEffect`.
- **Auth API key masking**: `apiKey` is masked server-side in the global-search response (`maskApiKey` in `AdminRepository.java`) — frontend never receives a plaintext key from `global_search`. Other endpoints still return plaintext; the existing `ApiKeyCell` component handles client-side masking/reveal.

## Key Dependencies

- `spring-ai` 1.0.0 — AI/LLM integration
- `xfg-wrench-starter-design-framework` 3.0.0 — tree strategy pattern framework
- `retrofit2` + `okhttp3` — HTTP client for backend API calls
- `fastjson` 2.x — JSON processing
- `reactor-core` — reactive streams for SSE
- `redisson` — distributed Redis client for session sync (RMap + Pub/Sub topic)
