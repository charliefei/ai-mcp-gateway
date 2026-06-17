# 部署指南 / Deployment Guide

使用 Docker Compose 一键启动 AI MCP Gateway 的全部组件：管理后台、网关服务（含单实例与集群两种模式）、MySQL、Redis。

Spin up the full AI MCP Gateway stack (admin UI, Spring Boot app — single or clustered, MySQL, Redis) with a single `docker compose up`.

## 📦 包含的服务 / Services

| 服务 / Service | 镜像 / Image | 端口 / Port | 出现条件 / Profile | 说明 / Description |
|---|---|---|---|---|
| `admin-ui` | `ai-mcp-gateway-admin-ui` (本地构建 / built locally) | `${ADMIN_UI_HOST_PORT:-80}` | always | React + Vite 管理后台，由 nginx 提供 SPA 与 `/api-gateway/` 反向代理 |
| `app-lb` | `nginx:1.27-alpine` | `${APP_HOST_PORT:-8777}` | always | 网关前置 nginx 负载均衡器；把请求轮询转发到所有 `app*` 节点 |
| `app` | `ai-mcp-gateway-app` (本地构建 / built locally) | — (仅集群内可达) | `default` | Spring Boot 网关单实例 (default 模式) |
| `app-1/2/3` | `ai-mcp-gateway-app` (本地构建 / built locally) | — (仅集群内可达) | `cluster` | Spring Boot 网关集群节点 (cluster 模式额外启动) |
| `mysql` | `mysql:8.0` | `${MYSQL_HOST_PORT:-3306}` | always | 持久化网关/工具/协议/认证配置；首次启动自动执行 `docs/mysql/sql/` 下的 SQL |
| `redis` | `redis:7-alpine` | `${REDIS_HOST_PORT:-6379}` | always | Redisson 分布式会话后端（多实例部署时启用） |

所有服务都在 `gateway-net` 桥接网络中，DNS 由 Compose 自动解析。

All services run on the `gateway-net` bridge network; DNS is auto-resolved by Compose.

## 🧭 单实例 vs 集群 / Single vs Cluster

两种模式由 Docker Compose 的 **profile** 切换：

The two modes are toggled via Docker Compose **profiles**:

| 模式 / Mode | 命令 / Command | 后端实例数 / # of app instances |
|---|---|---|
| **Single (default)** | `docker compose up -d --build` | 1 (`app`) |
| **Cluster** | `docker compose --profile cluster up -d --build` | 4 (`app` + `app-1` + `app-2` + `app-3`) |

`app-lb`（nginx 负载均衡器）在两种模式下都存在。它的 `upstream` 块使用 docker 内嵌 DNS（`127.0.0.11`）+ nginx `resolve` 指令，所以：
- 单实例模式：只有 `app` 在运行，`app-1/2/3` 的 DNS 不解析，nginx 自动从池中移除它们
- 集群模式：四个实例同时被加入，nginx 轮询转发；任一实例宕机时自动剔除

`app-lb` is present in both modes. Its upstream block uses docker's embedded DNS (`127.0.0.11`) with nginx's `resolve` directive:
- **Single mode**: only `app` resolves; `app-1/2/3` are silently excluded.
- **Cluster mode**: all four are in the pool, round-robin, and any failing instance is failed over via `max_fails` + `proxy_next_upstream`.

要在集群里加/减节点，编辑 `docker-compose.yml` 里的 `app-N` 服务（或者直接复制 `app-1` 服务块）以及 `nginx-app.conf.template` 里的 `upstream gateway_backends` 服务列表，然后重新构建启动。

To add/remove cluster nodes, edit the `app-N` service blocks in `docker-compose.yml` (or duplicate `app-1`) and the matching `server` lines in `nginx-app.conf.template`'s `upstream gateway_backends` block, then re-up.

## 🚀 快速开始 / Quick Start

```bash
cd docs/deploy

# 1) 复制并按需修改环境变量
cp .env.example .env
# 至少把 DASHSCOPE_API_KEY 填上（LLM 测试需要）

# 2a) 单实例模式
docker compose up -d --build

# 2b) 集群模式
docker compose --profile cluster up -d --build

# 3) 查看状态 / 日志
docker compose ps
docker compose logs -f app-lb
```

## 🌐 访问入口 / Access URLs

不论哪种模式，用户可见的入口都是同一套：

The user-facing entry points are identical in both modes:

| 入口 / Endpoint | URL |
|---|---|
| 管理控制台 / Admin Console | `http://localhost/` |
| 网关 API / Gateway API | `http://localhost:8777/api-gateway/` |
| 管理 API / Admin API | `http://localhost:8777/api-gateway/admin/` |
| MCP SSE | `http://localhost:8777/api-gateway/{gatewayId}/mcp/sse?api_key=KEY` |
| MCP Streamable HTTP | `http://localhost:8777/api-gateway/{gatewayId}/mcp` |
| LB 健康检查 / LB health | `http://localhost:8777/healthz` |

## 🔧 常用操作 / Common Operations

```bash
# 停止
docker compose down

# 完全清理（含数据卷）
docker compose down -v

# 重新构建某个服务
docker compose build app app-lb
docker compose up -d app app-lb

# 进入容器调试
docker compose exec app-lb sh
docker compose exec app sh
docker compose exec mysql mysql -uroot -p

# 查看负载均衡器实际命中的后端（upstream 区段需开启 stub_status，
# 默认未开启；可以临时加 `location /stub_status { stub_status; }` 调试）
docker compose exec app-lb nginx -T | sed -n '/upstream/,/^}/p'
```

## ⚙️ 配置说明 / Configuration Notes

- **数据库 Schema 初始化**：`docs/mysql/sql/` 目录挂载到 `/docker-entrypoint-initdb.d`，**仅在数据卷为空时**（即首次启动）执行。如需重置： `docker compose down -v && docker compose up -d`。
- **后端镜像构建**：`ai-mcp-gateway-app/Dockerfile` 是 multi-stage 构建（`maven:3.9-eclipse-temurin-17` → `eclipse-temurin:17-jre-alpine`），构建上下文是项目根目录；首次构建会下载 Maven 依赖较慢，后续仅源码改动会复用依赖缓存。POM-first 复制 + `mvn dependency:go-offline` 是关键层。
- **集群中每个后端实例的端口**：`app` / `app-1` / `app-2` / `app-3` 可以各自监听不同的内部端口，由 `.env` 里的 `APP_PORT` / `APP_1_PORT` / `APP_2_PORT` / `APP_3_PORT` 控制（默认 `8777/8778/8779/8780`）。每个实例的 `SERVER_PORT` 走 Spring Boot 的 relaxed binding（`SERVER_PORT` → `server.port`）。`app-lb` 把同样的 `APP_*_PORT` 通过 `envsubst` 注入到 `nginx-app.conf.template` 的 `upstream` 区段，所以每个后端的 `:port` 始终与该实例的 `SERVER_PORT` 保持同步。要新增节点：在 compose 里复制 `app-1` 服务块并加一个 `APP_4_PORT`，同时在 `nginx-app.conf.template` 的 `upstream` 里加一行 `server app-4:${APP_4_PORT} ...`。
- **Spring Profile**：`docker-compose.yml` 默认使用 `dev`，并通过 `SPRING_DATASOURCE_URL` / `REDIS_SDK_CONFIG_HOST` / `REDIS_SDK_CONFIG_PORT` 把连接指向容器内的 `mysql` / `redis`。无需额外修改源码。
- **前端反代目标**：`admin-ui` 在构建阶段通过 build-arg `BACKEND_URL=http://app-lb:80` 写入 nginx.conf。所有请求都先经过 `app-lb`，再由它分发给后端 Spring Boot 实例。
- **负载均衡策略**：`nginx-app.conf.template` 使用默认的 round-robin 调度；如需更复杂的策略（least_conn、ip_hash 等），把 `upstream gateway_backends` 改成 `least_conn;` 或 `ip_hash;` 即可。
- **集群会话一致性**：`app` 与 `app-N` 共享同一个 MySQL 和 Redis。Spring Boot 实例之间通过 Redisson 的 `RMap` + Pub/Sub 自动同步会话状态（见 CLAUDE.md “Distributed Sessions”）。
- **DASHSCOPE_API_KEY**：管理后台"网关测试"功能会调用 DashScope；未配置时 LLM 测试端点会失败，其它 CRUD 接口不受影响。
- **生产环境**：务必修改 `MYSQL_ROOT_PASSWORD`、移除 `MYSQL_HOST_PORT` / `REDIS_HOST_PORT` 的宿主端口暴露、为容器挂载专用网络与卷，并根据流量调整 `JAVA_OPTS` 与 nginx upstream 节点数。
