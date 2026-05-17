<p align="center">
  <h1 align="center">AI MCP Gateway</h1>
  <p align="center"><strong>通用 MCP 协议网关</strong> / <em>Universal MCP Protocol Gateway</em></p>
  <p align="center">将 HTTP/REST API 转换为 MCP 兼容工具 · 内置管理后台 · 支持 LLM 集成</p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Java-17-orange?logo=openjdk&logoColor=white" alt="Java 17" />
  <img src="https://img.shields.io/badge/Spring%20Boot-3.4.3-green?logo=springboot&logoColor=white" alt="Spring Boot 3.4.3" />
  <img src="https://img.shields.io/badge/React-18-blue?logo=react&logoColor=white" alt="React 18" />
  <img src="https://img.shields.io/badge/MCP-2024--11--05-purple" alt="MCP 2024-11-05" />
  <img src="https://img.shields.io/badge/license-Apache%202.0-blue.svg" alt="Apache 2.0" />
  <img src="https://img.shields.io/badge/Maven-3.8+-red?logo=apachemaven&logoColor=white" alt="Maven 3.8+" />
</p>

---

## 📖 目录 / Table of Contents

- [项目概述 / Overview](#-项目概述--overview)
- [功能特性 / Features](#-功能特性--features)
- [架构设计 / Architecture](#-架构设计--architecture)
- [快速开始 / Quick Start](#-快速开始--quick-start)
- [配置说明 / Configuration](#-配置说明--configuration)
- [API 文档 / API Reference](#-api-文档--api-reference)
- [管理后台 / Admin UI](#-管理后台--admin-ui)
- [项目结构 / Project Structure](#-项目结构--project-structure)
- [技术栈 / Tech Stack](#-技术栈--tech-stack)
- [许可证 / License](#-许可证--license)

---

## 🚀 项目概述 / Overview

**AI MCP Gateway** 是一个基于 [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) 的通用协议网关，能将现有的 HTTP/REST API 自动转换为 MCP 兼容工具，让 AI 大模型通过标准化的 MCP 客户端直接调用后端服务。

**AI MCP Gateway** is a universal protocol gateway based on the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/). It transforms existing HTTP/REST APIs into MCP-compatible tools, enabling AI models to call backend services directly through standardized MCP clients.

### 工作流程 / How It Works

```
┌──────────────┐     SSE (JSON-RPC 2.0)      ┌─────────────────┐     HTTP/REST      ┌──────────────┐
│  MCP Client  │◄──────────────────────────►│  AI MCP Gateway │◄──────────────────►│  Backend API │
│  (AI Model)  │   tools/list, tools/call     │   (Port 8777)   │   Retrofit/OkHttp  │  (any HTTP)  │
└──────────────┘                              └─────────────────┘                    └──────────────┘
                                                     │
                                                     │ Admin CRUD (Port 8777)
                                                     ▼
                                              ┌─────────────────┐
                                              │   Admin UI       │
                                              │   (Port 5173)    │
                                              └─────────────────┘
```

1. 客户端通过 SSE 连接到网关，获取消息端点
2. 客户端发送 JSON-RPC 请求（`tools/list`、`tools/call` 等）
3. 网关查找工具对应的 HTTP 协议配置，调用后端 API
4. 响应结果通过 SSE 流式返回给客户端

---

## ✨ 功能特性 / Features

| 特性 / Feature | 说明 / Description |
|---|---|
| 🔌 **MCP 服务端** | 完整实现 MCP 2024-11-05 协议，支持 `initialize`、`tools/list`、`tools/call`、`resources/list` |
| 🔄 **HTTP 协议转换** | 自动将 HTTP API 转换为 MCP 工具，支持 GET/POST/PUT/DELETE/PATCH 方法 |
| 🔐 **认证鉴权** | API Key 认证 + 速率限制，支持网关级别的开关控制 |
| 📊 **OpenAPI 导入** | 支持导入 OpenAPI 3.0 规范 JSON，自动解析参数/请求体映射 |
| 🧠 **LLM 集成** | 内置 Spring AI，支持通过 DashScope / OpenAI 兼容端点调用大模型 |
| 🖥️ **管理后台** | React 管理界面，支持网关、工具、协议、认证的完整 CRUD 管理 |
| 🌙 **暗色模式** | 管理后台支持亮色/暗色主题切换，跟随系统偏好 |
| ⚡ **高性能** | 线程池 + HikariCP 连接池 + OkHttp 连接池，保证高并发场景性能 |
| 🔬 **在线测试** | 管理后台内置 LLM 测试功能，端到端验证网关连通性 |

---

## 🏗️ 架构设计 / Architecture

项目采用 **DDD（领域驱动设计）** 分层架构，基于 Maven 多模块管理：

```
ai-mcp-gateway/
├── ai-mcp-gateway-types          # 共享层：枚举、常量、异常定义
├── ai-mcp-gateway-domain         # 领域层：核心业务逻辑
│   ├── gateway/                  #   网关配置服务
│   ├── auth/                     #   认证鉴权服务
│   ├── session/                  #   会话管理服务
│   ├── protocol/                 #   协议分析服务
│   ├── admin/                    #   运营管理服务
│   └── llm/                      #   LLM 集成服务
├── ai-mcp-gateway-api            # API 层：服务接口与 DTO 定义
├── ai-mcp-gateway-case           # 编排层：责任链模式处理会话与消息
├── ai-mcp-gateway-infrastructure # 基础设施层：DB 访问、HTTP 客户端
├── ai-mcp-gateway-trigger        # 触发层：REST 控制器
├── ai-mcp-gateway-app            # 应用层：Spring Boot 入口、配置
└── ai-mcp-gateway-admin-ui       # 管理后台：React + Vite + Tailwind
```

**依赖方向 / Dependency Flow:**

```
trigger → case → domain → types
infrastructure → domain (implements ports)
```

### 核心设计模式 / Key Design Patterns

- **树策略模式 / Tree Strategy Pattern** — 使用 `xfg-wrench-starter-design-framework` 实现责任链。会话创建链路：`RootNode → VerifyNode → SessionNode → EndNode`；消息处理链路：`RootNode → SessionNode → MessageHandlerNode → 具体处理器`
- **策略模式 / Strategy Pattern** — JSON-RPC 方法通过 `Map<String, IRequestHandler>` 分发到对应处理器；OpenAPI 协议分析支持 `parameters` / `requestBody` 两种解析策略
- **密封接口 / Sealed Interfaces (Java 17)** — `McpSchemaVO` 使用 sealed interface 定义 JSON-RPC 消息类型

---

## ⚡ 快速开始 / Quick Start

### 前置条件 / Prerequisites

| 工具 / Tool | 版本 / Version | 说明 / Notes |
|---|---|---|
| JDK | 17+ | |
| Maven | 3.8+ | |
| MySQL | 8.x | 需手动创建数据库 |
| Node.js | 18+ | 仅管理后台需要 |

### 1. 克隆项目 / Clone

```bash
git clone https://github.com/charliefei/ai-mcp-gateway.git
cd ai-mcp-gateway
```

### 2. 创建数据库 / Create Database

```sql
CREATE DATABASE IF NOT EXISTS ai_mcp_gateway_v2 DEFAULT CHARACTER SET utf8mb4;
```

数据库表结构由 MyBatis 自动维护（当前无独立的 Schema 迁移脚本）。

### 3. 配置环境变量 / Set Environment Variables

```bash
# 必需：阿里云百炼 / DashScope API Key（LLM 功能需要）
export DASHSCOPE_API_KEY=your_api_key_here
```

### 4. 构建与运行 / Build & Run

```bash
# 构建所有模块
mvn clean install -DskipTests

# 启动后端服务（默认端口 8777）
mvn spring-boot:run

# 或使用 dev 配置启动
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### 5. 启动管理后台 / Start Admin UI (可选 / Optional)

```bash
cd ai-mcp-gateway-admin-ui
npm install
npm run dev
```

### 6. 访问 / Access

| 服务 / Service | 地址 / URL |
|---|---|
| 网关 API | `http://localhost:8777/api-gateway` |
| 管理 API | `http://localhost:8777/api-gateway/admin/` |
| 管理后台 / Admin UI | `http://localhost:5173` |

---

## ⚙️ 配置说明 / Configuration

### 应用配置 / Application Config

配置文件位于 `ai-mcp-gateway-app/src/main/resources/`：

| 文件 / File | 用途 / Purpose |
|---|---|
| `application.yml` | 主配置，指定激活的 Profile |
| `application-dev.yml` | 开发环境：端口 8777，本地 MySQL |
| `application-test.yml` | 测试环境：端口 8091 |
| `application-prod.yml` | 生产环境：端口 8091 |

### 关键配置项 / Key Properties

```yaml
# 数据库 / Database (dev)
spring:
  datasource:
    url: jdbc:mysql://127.0.0.1:3306/ai_mcp_gateway_v2
    username: root
    password: 123456

# Spring AI / LLM
spring:
  ai:
    openai:
      base-url: https://dashscope.aliyuncs.com/compatible-mode
      api-key: ${DASHSCOPE_API_KEY}
      chat:
        options:
          model: qwen3.6-flash

# 线程池 / Thread Pool
thread:
  pool:
    core-size: 20
    max-size: 50
    queue-capacity: 5000
```

### 管理后台配置 / Admin UI Config

管理后台通过 Vite 代理转发 API 请求：

```typescript
// vite.config.ts
proxy: {
  '/api-gateway': {
    target: 'http://localhost:8777',
    changeOrigin: true,
  }
}
```

---

## 📡 API 文档 / API Reference

### MCP 协议端点 / MCP Protocol Endpoints

| 方法 / Method | 路径 / Path | 说明 / Description |
|---|---|---|
| `GET` | `/{gatewayId}/mcp/sse?api_key=KEY` | SSE 连接，创建会话，返回消息端点 |
| `POST` | `/{gatewayId}/mcp/sse?sessionId=X&api_key=KEY` | 接收 JSON-RPC 2.0 请求 |

### 支持的 JSON-RPC 方法 / Supported Methods

| 方法 / Method | 说明 / Description |
|---|---|
| `initialize` | 协议握手，返回服务器能力集 |
| `tools/list` | 列出网关配置的所有工具（含 JSON Schema） |
| `tools/call` | 调用指定工具，触发后端 API 请求 |
| `resources/list` | 返回资源列表 |

### 管理 API / Admin API

所有管理接口位于 `/api-gateway/admin/` 下，支持跨域访问。

#### 网关配置 / Gateway Config

| 方法 | 路径 | 说明 |
|---|---|---|
| `POST` | `/save_gateway_config` | 创建或更新网关配置 |
| `GET` | `/query_gateway_config_list` | 查询所有网关 |
| `GET` | `/query_gateway_config_page` | 分页查询网关（支持 gatewayId/gatewayName 过滤） |

#### 工具配置 / Tool Config

| 方法 | 路径 | 说明 |
|---|---|---|
| `POST` | `/save_gateway_tool_config` | 创建或更新工具配置 |
| `POST` | `/delete_gateway_tool_config` | 删除工具配置 |
| `GET` | `/query_gateway_tool_page` | 分页查询工具 |

#### 协议配置 / Protocol Config

| 方法 | 路径 | 说明 |
|---|---|---|
| `POST` | `/save_gateway_protocol` | 保存协议配置（手动编辑） |
| `POST` | `/import_gateway_protocol` | 导入 OpenAPI JSON |
| `POST` | `/analysis_protocol` | 预览解析 OpenAPI JSON |
| `POST` | `/delete_gateway_protocol` | 删除协议配置 |

#### 认证配置 / Auth Config

| 方法 | 路径 | 说明 |
|---|---|---|
| `POST` | `/save_gateway_auth` | 为网关生成 API Key |
| `POST` | `/delete_gateway_auth` | 删除认证配置 |
| `GET` | `/query_gateway_auth_page` | 分页查询认证 |

#### 测试 / Test

| 方法 | 路径 | 说明 |
|---|---|---|
| `POST` | `/test_call_gateway` | 端到端测试：通过 LLM 验证网关连通性 |

### 统一响应格式 / Unified Response

```json
{
  "code": "0000",
  "info": "success",
  "data": { }
}
```

| Code | 含义 / Meaning |
|---|---|
| `0000` | 成功 / Success |
| `0001` | 通用错误 / General Error |
| `0002` | 参数非法 / Illegal Parameter |
| `1001` | 认证过期 / Auth Expired |
| `1002` | 速率限制 / Rate Limited |

---

## 🖥️ 管理后台 / Admin UI

管理后台提供可视化的网关运营管理界面：

| 页面 / Page | 功能 / Function |
|---|---|
| **网关配置** / Gateway | 管理网关实例，设置认证与验证模式 |
| **工具配置** / Tool | 管理 MCP 工具，绑定网关与协议 |
| **协议配置** / Protocol | 管理 HTTP 协议映射，支持 OpenAPI 导入 |
| **认证配置** / Auth | 管理 API Key，设置速率限制与过期时间 |
| **网关测试** / Test | 通过 LLM 端到端测试网关连通性 |

### 技术栈 / Tech Stack

- **React 18** + **TypeScript 5.6**
- **Vite 6** 构建工具
- **Tailwind CSS 3** (Class-based 暗色模式)
- **Radix UI** 无样式组件库
- **lucide-react** 图标库
- **sonner** Toast 通知
- **react-router-dom v7** 路由管理

### 开发命令 / Dev Commands

```bash
cd ai-mcp-gateway-admin-ui

npm install          # 安装依赖
npm run dev          # 启动开发服务器
npx tsc --noEmit     # TypeScript 类型检查
npm run build        # 生产构建
```

---

## 📁 项目结构 / Project Structure

<details>
<summary>展开查看详细目录 / Click to expand</summary>

```
ai-mcp-gateway/
├── ai-mcp-gateway-app/                        # Spring Boot 应用入口
│   └── src/main/resources/
│       ├── application.yml                    #   主配置
│       ├── application-dev.yml                #   开发环境配置
│       ├── application-test.yml               #   测试环境配置
│       ├── application-prod.yml               #   生产环境配置
│       ├── logback-spring.xml                 #   日志配置
│       └── mybatis/mapper/                    #   MyBatis 映射文件
│           ├── mcp_gateway_mapper.xml
│           ├── mcp_gateway_auth_mapper.xml
│           ├── mcp_gateway_tool_mapper.xml
│           ├── mcp_protocol_http_mapper.xml
│           └── mcp_protocol_mapping_mapper.xml
├── ai-mcp-gateway-trigger/                    # REST 控制器层
│   └── src/main/java/.../trigger/http/
│       ├── AdminController.java               #   管理 API 控制器
│       └── McpGatewayController.java          #   MCP 协议控制器（SSE）
├── ai-mcp-gateway-case/                       # 编排层（责任链）
│   └── src/main/java/.../case/
│       ├── mcp/                               #   MCP 会话/消息流程
│       ├── admin/                             #   管理功能编排
│       └── llm/                               #   LLM 调用编排
├── ai-mcp-gateway-domain/                     # 领域核心
│   └── src/main/java/.../domain/
│       ├── gateway/service/                   #   网关配置实现
│       ├── auth/service/                      #   认证鉴权实现
│       ├── session/service/                   #   会话管理实现
│       ├── protocol/service/                  #   协议分析实现
│       ├── admin/service/                     #   运营管理实现
│       ├── llm/service/                       #   LLM 集成实现
│       └── mcp/schema/                        #   JSON-RPC 消息类型
├── ai-mcp-gateway-api/                        # 服务接口 + DTO
├── ai-mcp-gateway-infrastructure/             # 基础设施
│   └── src/main/java/.../infrastructure/
│       ├── dao/                               #   MyBatis DAO 接口
│       ├── po/                                #   持久化对象
│       ├── repository/                        #   仓库实现（适配器模式）
│       └── gateway/                           #   通用 HTTP 客户端
│           └── GenericHttpGateway.java        #     Retrofit 接口
├── ai-mcp-gateway-types/                      # 共享类型
│   └── src/main/java/.../types/
│       ├── enums/                             #   枚举（GatewayEnum, AuthStatusEnum 等）
│       ├── common/                            #   常量（ResponseCode, McpErrorCodes）
│       └── exception/                         #   自定义异常
├── ai-mcp-gateway-admin-ui/                   # 管理后台（React）
│   └── src/
│       ├── components/
│       │   ├── layout/                        #   布局组件（MainLayout, Sidebar）
│       │   └── ui/                            #   基础 UI 组件（Button, Card, Dialog, Tabs 等）
│       ├── pages/
│       │   ├── gateway/GatewayList.tsx        #   网关配置页面
│       │   ├── tool/ToolList.tsx              #   工具配置页面
│       │   ├── protocol/ProtocolList.tsx      #   协议配置页面
│       │   ├── auth/AuthList.tsx              #   认证配置页面
│       │   └── test/TestGateway.tsx           #   网关测试页面
│       ├── hooks/                             #   自定义 Hooks（useApi, useTheme）
│       ├── lib/                               #   工具函数（API 客户端, cn）
│       └── types/                             #   TypeScript 类型定义
├── pom.xml                                    # 根 POM（依赖管理）
└── CLAUDE.md                                  # Claude Code 配置
```

</details>

---

## 🔧 技术栈 / Tech Stack

### 后端 / Backend

| 技术 / Technology | 版本 / Version | 用途 / Purpose |
|---|---|---|
| Java | 17 | 运行环境 |
| Spring Boot | 3.4.3 | 应用框架 |
| Spring AI | 1.0.0 | LLM 集成 |
| MyBatis | 3.0.4 | ORM / 数据库访问 |
| MySQL | 8.x | 配置持久化 |
| HikariCP | — | 数据库连接池 |
| Retrofit2 + OkHttp | 2.9.0 / 4.9.3 | HTTP 客户端 |
| Reactor Core | 3.7.3 | 响应式 SSE 推送 |
| FastJSON | 2.0.28 | JSON 序列化 |
| xfg-wrench-framework | 3.0.0 | 责任链设计框架 |

### 前端 / Frontend

| 技术 / Technology | 版本 / Version | 用途 / Purpose |
|---|---|---|
| React | 18 | UI 框架 |
| TypeScript | 5.6 | 类型安全 |
| Vite | 6 | 构建工具 |
| Tailwind CSS | 3.4 | 原子化 CSS |
| Radix UI | — | 无障碍 UI 原语 |
| lucide-react | 0.468 | 图标库 |
| react-router-dom | 7 | 客户端路由 |
| sonner | 1.7 | Toast 通知 |
| axios | 1.7 | HTTP 请求 |

---

## 🤝 贡献 / Contributing

欢迎提交 Issue 和 Pull Request！在提交代码前，请确保：

1. 代码通过 `mvn test` 测试
2. 管理后台通过 `npx tsc --noEmit` 类型检查
3. 遵循项目现有的代码风格和架构模式

---

## 📄 许可证 / License

本项目基于 [Apache License 2.0](http://www.apache.org/licenses/LICENSE-2.0) 开源。

This project is licensed under the [Apache License 2.0](http://www.apache.org/licenses/LICENSE-2.0).

---

<p align="center">
  <sub>Built with ❤️ by charliefei</sub>
</p>
