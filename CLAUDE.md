# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

An MCP (Model Context Protocol) gateway that exposes HTTP/REST APIs as MCP-compatible tools. Clients connect via **SSE** (legacy) or **Streamable HTTP**, then send JSON-RPC 2.0 requests (initialize, tools/list, tools/call, resources/list). The gateway translates tool calls into HTTP requests against configured backend APIs. The transport is selected per gateway via the `transport` field in `mcp_gateway` (see **Transports** below for protocol details).

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
- SSE controller: `McpGatewayController` (trigger layer) — handles the legacy SSE transport at `/{gatewayId}/mcp/sse`
- Streamable HTTP controller: `McpStreamableController` (trigger layer) — handles GET/POST/DELETE at `/{gatewayId}/mcp`
- Session/message chain wiring (SSE): `DefaultMcpSessionFactory`, `DefaultMcpMessageFactory` in case layer (`com.feirui.ai.cases.mcp.sse.*`)
- Session/message chain wiring (Streamable): `DefaultMcpStreamableSessionFactory`, `DefaultMcpStreamableMessageFactory` in case layer (`com.feirui.ai.cases.mcp.streamable.*`)
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

### MCP Protocol (domain layer)
`McpSchemaVO` defines the JSON-RPC 2.0 message types as Java 17 sealed interfaces and records: `JSONRPCRequest`, `JSONRPCNotification`, `JSONRPCResponse`. Protocol version: `2024-11-05`.

## Data Layer

- **Database**: MySQL 8.x via MyBatis. Mapper XMLs in `ai-mcp-gateway-app/src/main/resources/mybatis/mapper/`.
- **Tables**: `mcp_gateway_auth`, `mcp_gateway`, `mcp_gateway_tool`, `mcp_protocol_http`, `mcp_protocol_mapping`
- **Connection pool**: HikariCP

## Transports

The gateway supports two MCP transports side-by-side, selectable per gateway via the `transport` field in `mcp_gateway` (values from `SessionTransportTypeEnumVO`: `sse`, `streamable`).

### SSE transport (`McpGatewayController`, path `/{gatewayId}/mcp/sse`)

1. Client GETs `/{gatewayId}/mcp/sse?api_key=KEY` → server creates session, returns SSE stream; first event is `endpoint` with the message URL, e.g. `/mcp/sse/messages?sessionId=<id>`
2. Client POSTs JSON-RPC body to the message URL with `sessionId` and (if auth enabled) `api_key` query params
3. Responses stream back over the original SSE connection

### Streamable HTTP transport (`McpStreamableController`, path `/{gatewayId}/mcp`)

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

## Access URLs

- API: `http://localhost:8777/api-gateway`
- Admin UI: `http://localhost:5173` (Vite dev server)
- Admin API: `http://localhost:8777/api-gateway/admin/`

## Gotchas

- The `api_key` is passed as a **query parameter** (`?api_key=KEY`), not as an HTTP header
- `mvn spring-boot:run` must be run from repo root (parent POM), not from `ai-mcp-gateway-app/`
- Database `ai_mcp_gateway_v2` must be created manually before first run (no schema migration scripts in repo)
- `vite.config.ts` requires `@types/node` for `path` and `__dirname` — if builds fail with TS2307/TS2304, run `npm install --save-dev @types/node`
- `application-dev.yml` contains a hardcoded MySQL password — do NOT copy dev credentials into test/prod profiles; use env vars

## Admin Management API

An operations management subsystem at `/admin/` provides CRUD management for gateway configurations:

- **Gateway config**: save, query list/paginated
- **Tool config**: save/delete, query list/paginated/by gateway ID
- **Protocol config**: save/delete/import (OpenAPI JSON), query list/paginated/by gateway ID, analysis (preview parsed OpenAPI)
- **Auth config**: save/delete, query list/paginated/by gateway ID
- **LLM test call**: `test_call_gateway` — sends a test request through the gateway to verify end-to-end connectivity

Triggers route to case-layer admin services (`IAdminGatewayService`, `IAdminAuthService`, `IAdminProtocolService`, `IAdminManageService`, `IAdminLLMService`), which delegate to domain services in `domain.gateway`, `domain.admin`, and `domain.llm` packages.

## Admin UI (ai-mcp-gateway-admin-ui)

- **Layout files**: `src/components/layout/` holds `MainLayout.tsx` (route shell), `Sidebar.tsx` (left nav), and `TopBar.tsx` (header bar). New layout chrome goes here — not into individual pages.
- **UI primitive pattern**: All shared components in `src/components/ui/` follow the shadcn/ui pattern — Radix primitive + hand-rolled Tailwind styling. New composite components should extend the same pattern; do not introduce parallel component systems.
- **Composite widgets (`src/components/common/`)**: Reusable page-level widgets — `FormField`, `PageHeader`, `SearchBar`, `Pagination`, `StatusDot`, `MethodPill`, `ConfirmDialog`, `EmptyState`, `GradientText`, `Toolbar`, `ApiKeyCell` (re-exported from `index.ts`). Use these for any element that appears on more than one page; do not re-implement them inline.
- **Select dropdowns**: ALWAYS use `@radix-ui/react-select` (already installed). Do NOT hand-roll a `<select>` wrapper or use `@floating-ui/react` — both have been tried and failed: native `position: fixed` is hijacked by the Dialog's `transform` scale/translate animations; Floating UI's `autoUpdate` did not flip reliably inside a Dialog portal. `src/components/ui/select.tsx` exposes a `FlatSelect` shim over Radix primitives that accepts the flat `options` API — call sites pass `{ value, onChange, options }` unchanged.
- **Re-export pattern when swapping implementations**: When replacing the implementation of a UI primitive, keep the existing export name via `export { NewImpl as OldName }` so call sites don't need to change. Example: `export { FlatSelect as Select }`.
- **Admin UI type/build checks**: `npx tsc --noEmit` (type check), `npx vite build` (production build). There is no lint config — these two commands are the verification surface.
- **`FormField` label is `ReactNode`**: `FormField` in `src/components/common/FormField.tsx` accepts `label?: ReactNode`, so icon-prefixed labels work: `<FormField label={<span className="flex items-center gap-1.5"><Key className="h-3 w-3" /> 认证 API Key</span>}>`.

## Key Dependencies

- `spring-ai` 1.0.0 — AI/LLM integration
- `xfg-wrench-starter-design-framework` 3.0.0 — tree strategy pattern framework
- `retrofit2` + `okhttp3` — HTTP client for backend API calls
- `fastjson` 2.x — JSON processing
- `reactor-core` — reactive streams for SSE
