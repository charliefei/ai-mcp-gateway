# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

An MCP (Model Context Protocol) gateway that exposes HTTP/REST APIs as MCP-compatible tools. Clients connect via SSE, receive a message endpoint, then send JSON-RPC 2.0 requests (initialize, tools/list, tools/call, resources/list). The gateway translates tool calls into HTTP requests against configured backend APIs.

## Build & Run

```bash
# Build all modules
mvn clean install

# Build without tests
mvn clean install -DskipTests

# Run the application (from ai-mcp-gateway-app)
mvn spring-boot:run

# Run with specific profile
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Run tests
mvn test

# Run a single test class
mvn test -pl ai-mcp-gateway-app -Dtest=ApiTest
```

**Runtime**: Java 17, Spring Boot 3.4.3, port 8777, context-path `/api-gateway`

## Architecture

DDD (Domain-Driven Design) layered architecture using Maven modules:

| Module | Layer | Responsibility |
|---|---|---|
| `ai-mcp-gateway-trigger` | Trigger | HTTP controllers (REST endpoints) |
| `ai-mcp-gateway-api` | API | Service interfaces exposed to trigger layer |
| `ai-mcp-gateway-case` | Case | Orchestration — tree strategy chains for session creation and message handling |
| `ai-mcp-gateway-domain` | Domain | Core business logic: auth, session, protocol domain services |
| `ai-mcp-gateway-infrastructure` | Infrastructure | DB access (MyBatis), HTTP clients (Retrofit/OkHttp), Redis |
| `ai-mcp-gateway-types` | Types | Shared enums, constants, exceptions |
| `ai-mcp-gateway-app` | App | Spring Boot entry point, configs, MyBatis mappers, resources |

**Dependency flow**: trigger → case → domain → types; infrastructure implements domain ports/repositories.

## Key Design Patterns

### Tree Strategy Pattern (case layer)
Session creation and message handling use a chain-of-responsibility tree from the `xfg-wrench-starter-design-framework` library. Each flow is a chain of nodes:

- **Session flow**: `RootNode` → `VerifyNode` (auth check) → `SessionNode` (create session) → `EndNode`
- **Message flow**: `RootNode` (rate limit check) → `SessionNode` (resolve session) → `MessageHandlerNode` → specific handler

Factories (`DefaultMcpSessionFactory`, `DefaultMcpMessageFactory`) wire the chains. Nodes extend abstract base classes and override `doApply()` + `get()` (next node).

### Strategy Pattern (domain layer)
- `SessionMessageHandlerMethodEnum` maps JSON-RPC method names to Spring bean handler names. `SessionMessageService` dispatches to the correct `IRequestHandler` implementation via a `Map<String, IRequestHandler>`.
- Protocol analysis uses `IProtocolAnalysisStrategy` implementations for parsing OpenAPI parameters vs request bodies.

### MCP Protocol (domain layer)
`McpSchemaVO` defines the JSON-RPC 2.0 message types as Java 17 sealed interfaces and records: `JSONRPCRequest`, `JSONRPCNotification`, `JSONRPCResponse`. Protocol version: `2024-11-05`.

## Data Layer

- **Database**: MySQL 8.x via MyBatis. Mapper XMLs in `ai-mcp-gateway-app/src/main/resources/mybatis/mapper/`.
- **Tables**: `mcp_gateway_auth`, `mcp_gateway`, `mcp_gateway_tool`, `mcp_protocol_http`, `mcp_protocol_mapping`
- **Connection pool**: HikariCP

## SSE Endpoint Flow

1. Client GETs `/{gatewayId}/mcp/sse` → creates session, returns SSE stream with `endpoint` event containing the message URL
2. Client POSTs JSON-RPC to `/{gatewayId}/mcp/sse?sessionId=X` → gateway dispatches to appropriate handler
3. Responses stream back over the SSE connection

## Configuration

- `application-dev.yml` — local dev (MySQL at 127.0.0.1:3306, DeepSeek AI)
- `application-test.yml`, `application-prod.yml` — other environments
- Spring AI configured for OpenAI-compatible endpoints (currently DeepSeek)

## Key Dependencies

- `spring-ai` 1.0.0 — AI/LLM integration
- `xfg-wrench-starter-design-framework` 3.0.0 — tree strategy pattern framework
- `retrofit2` + `okhttp3` — HTTP client for backend API calls
- `fastjson` 2.x — JSON processing
- `reactor-core` — reactive streams for SSE
