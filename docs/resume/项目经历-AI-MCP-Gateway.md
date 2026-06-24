# AI MCP Gateway —— 模型上下文协议网关

> 基于 Spring Boot 3 + React 18 自研的 MCP（Model Context Protocol）网关，将任意 HTTP/REST 业务接口零成本转化为大模型可调用的 MCP 工具，支持 SSE 与 Streamable HTTP 双协议、分布式部署、可视化配置与 OpenAPI 一键导入。

---

## 项目经历描述（简历正文版）

- **MCP 协议网关设计**：基于 Spring Boot 3 + Reactor 实现了 MCP Server 的 `initialize` / `tools/list` / `tools/call` 等 JSON-RPC 2.0 消息处理链路，同时支持 **SSE**（legacy）与 **Streamable HTTP** 两种传输协议；通过**树形策略模式**构建会话创建与消息分发的责任链（RootNode → VerifyNode → SessionNode → MessageHandlerNode），完成客户端建连、鉴权校验、会话保持、消息分发与结果回推。

- **分布式 Session 同步与高可用**：基于 **Redisson RMap + Pub/Sub** 实现跨实例会话状态共享——会话元数据持久化到 Redis Hash 结构，增删事件通过发布订阅实时广播到集群各节点，本地内存 Session 与远端状态保持最终一致；SSE 长连接关闭或 Streamable 会话 DELETE 时同步触发清理事件，节点掉线不影响其他节点上的会话，使网关具备水平扩展能力，支撑大模型长连接高并发场景。

- **动态工具注册与 OpenAPI 协议解析**：设计 `mcp_gateway` / `mcp_gateway_tool` / `mcp_protocol_http` / `mcp_protocol_mapping` 等核心表结构，支持通过管理后台导入 OpenAPI/Swagger JSON；通过 `IProtocolAnalysisStrategy` 策略链自动解析 `requestBody`、`query`、`path` 三类参数及字段映射规则，自动生成符合 MCP 规范的 `inputSchema`，新接口接入由"逐个手写"变为"一键导入"，大幅降低接入成本。

- **工具调用适配层**：基于 **Retrofit + OkHttp** 封装通用 HTTP 调用网关 `HttpCallService`，按照协议配置动态构造请求头、Query 参数、Path 变量与 JSON Body，将大模型的工具调用（`tools/call`）无损转发到任意 RESTful 后端业务接口；同时实现超时、重试、响应解析的标准化处理，屏蔽不同业务方的接口差异。

- **鉴权与限流能力建设**：实现网关级 **API Key 认证**（`AuthLicenseService` 校验 Key 合法性 + 有效期），并基于 **Guava RateLimiter** 封装 `AuthRateLimitService`，以 `gatewayId + apiKey` 为粒度进行细粒度频控与限流缓存；同时支持 SSE 长连接建立前的预鉴权与消息处理链中的限流拦截，兼顾安全性与吞吐。

- **DDD 分层架构与工程化交付**：按照 **Trigger → Case → Domain → Infrastructure** 四层 DDD 架构组织业务，借助 `xfg-wrench` 树策略框架解耦编排逻辑，Trigger 层暴露网关/工具/协议/认证 CRUD、OpenAPI 导入、分页查询、LLM 调用测试、全局搜索（`limit+1` 优化）等管理接口；前端基于 React 18 + Vite + shadcn/ui 实现可视化配置台，支持 ⌘K 全局搜索；交付侧配套 `docker-compose`（单实例 + Nginx 集群模式）、Redis 分布式 Session Backplane、健康检查与配置热更新脚本，实现"开箱即用"的工程化部署。

---

## 备选精简版（如版面紧张，可用此版）

- **MCP 协议网关**：自研 MCP Server 消息处理链路，实现 `initialize` / `tools/list` / `tools/call` 等 JSON-RPC 2.0 方法，支持 SSE 与 Streamable HTTP 双协议；采用**树形策略模式**构建会话与消息处理责任链（RootNode → VerifyNode → SessionNode → MessageHandlerNode）。

- **分布式 Session 同步**：基于 **Redisson RMap + Pub/Sub** 实现多实例 Session 状态共享与跨节点清理，节点无状态化后可水平扩展支撑大模型长连接高并发。

- **OpenAPI 协议解析与动态工具注册**：设计网关/工具/协议/字段映射四类核心表，通过策略模式解析 `requestBody` / `query` / `path` 参数并自动生成 MCP `inputSchema`，支持从 OpenAPI/Swagger JSON 一键导入，新接口接入从天级降到分钟级。

- **HTTP 工具调用适配层**：基于 **Retrofit + OkHttp** 封装通用调用网关，按配置动态拼装请求头、Query、Path、Body，将 LLM 工具调用无损转发到任意 RESTful 后端接口。

- **鉴权与限流**：实现 API Key 网关级认证 + 有效期校验，基于 **Guava RateLimiter** 按 `gatewayId + apiKey` 维度进行频控，覆盖连接建立与消息处理全链路。

- **DDD 架构与工程化交付**：四层 DDD 拆分（Trigger → Case → Domain → Infrastructure），管理后台覆盖网关/工具/协议/认证 CRUD、OpenAPI 导入、LLM 联调测试、⌘K 全局搜索；前端 React 18 + shadcn/ui，配套 Docker Compose 单实例 + Nginx 集群部署方案。

---

## 关键亮点提示（面试可展开的技术点）

| 简历中的描述 | 面试可深挖的方向 |
|---|---|
| 树形策略模式 / 责任链 | 为什么用树而不是单链？RootNode / VerifyNode / SessionNode 的解耦设计？`xfg-wrench` 框架做了什么？ |
| SSE + Streamable HTTP 双协议 | 两者的差异？为什么 MCP 2024-11-05 规范要做协议升级？Streamable 的 `Accept` 头、Session-Id、Mcp-Session-Id 设计 |
| Redisson 分布式 Session | RMap vs 普通 String 存储？Pub/Sub 事件丢失如何处理？为什么单节点掉线不影响业务？ |
| `limit+1` 优化 | 为什么不用 `COUNT(*)`？分页接口的"has more"判断的 N 种方案对比 |
| API Key 限流粒度 | 为什么是 `gatewayId + apiKey` 而不是 IP？令牌桶 vs 漏桶选型？分布式限流怎么做？ |
| DDD 分层 | 为什么要把"编排"单独抽到 Case 层？贫血模型 vs 充血模型？ |

---

## 技术栈速查

- **后端**：Java 17、Spring Boot 3.4.3、Spring AI 1.0.0、MyBatis、HikariCP、Retrofit2、OkHttp3、Redisson、Reactor、Guava、Fastjson 2.x
- **前端**：React 18、Vite 6、TypeScript 5.6、Tailwind CSS 3、Radix UI、shadcn/ui、lucide-react、sonner、react-router-dom v7
- **架构**：DDD 四层（Trigger → Case → Domain → Infrastructure）、树形策略模式（`xfg-wrench-starter-design-framework` 3.0.0）
- **协议**：MCP 2024-11-05、JSON-RPC 2.0、SSE、Streamable HTTP、OpenAPI 3.0
- **基础设施**：MySQL 8.x、Redis 7、Nginx 1.27、Docker Compose
