package com.feirui.ai.cases.mcp.streamable.message.node;

import com.feirui.ai.cases.mcp.streamable.message.AbstractMcpStreamableMessageServiceSupport;
import com.feirui.ai.cases.mcp.streamable.message.factory.DefaultMcpStreamableMessageFactory;
import com.feirui.ai.domain.auth.model.entity.RateLimitCommandEntity;
import com.feirui.ai.domain.auth.service.IAuthRateLimitService;
import com.feirui.ai.domain.session.model.entity.HandleMessageCommandEntity;
import com.feirui.ai.domain.session.model.valobj.McpSchemaVO;
import com.feirui.ai.domain.session.model.valobj.enums.SessionMessageHandlerMethodEnum;
import com.feirui.ai.types.enums.McpErrorCodes;
import com.feirui.ai.types.exception.AppException;
import cn.bugstack.wrench.design.framework.tree.StrategyHandler;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

/**
 * 根节点
 */
@Slf4j
@Service("mcpStreamableMessageRootNode")
public class RootNode extends AbstractMcpStreamableMessageServiceSupport {

    @Resource(name = "mcpStreamableMessageInitializeNode")
    private InitializeNode initializeNode;

    @Resource(name = "mcpStreamableMessageSessionNode")
    private SessionNode sessionNode;

    @Resource
    private IAuthRateLimitService authRateLimitService;

    @Override
    protected ResponseEntity<?> doApply(HandleMessageCommandEntity requestParameter, DefaultMcpStreamableMessageFactory.DynamicContext dynamicContext) throws Exception {
        try {
            log.info("Streamable 消息处理 RootNode:{}", requestParameter);

            // JSON-RPC Response（客户端→服务端）: 无需处理，直接返回 202 Accepted
            if (requestParameter.getJsonrpcMessage() instanceof McpSchemaVO.JSONRPCResponse) {
                log.info("Streamable 收到客户端 JSON-RPC 响应，直接接受:{} {}",
                        requestParameter.getGatewayId(), requestParameter.getSessionId());
                return ResponseEntity.accepted().build();
            }

            // JSON-RPC Request: 应用限流策略
            if (requestParameter.getJsonrpcMessage() instanceof McpSchemaVO.JSONRPCRequest request) {
                String method = request.method();
                SessionMessageHandlerMethodEnum sessionMessageHandlerMethodEnum = SessionMessageHandlerMethodEnum.getByMethod(method);
                if (SessionMessageHandlerMethodEnum.TOOLS_CALL.equals(sessionMessageHandlerMethodEnum)) {
                    boolean isHit = authRateLimitService.rateLimit(new RateLimitCommandEntity(requestParameter.getGatewayId(), requestParameter.getApiKey()));
                    if (isHit) {
                        log.warn("Streamable 消息处理 RootNode - 命中限流{} {}", requestParameter.getGatewayId(), requestParameter.getApiKey());
                        throw new AppException(McpErrorCodes.INSUFFICIENT_PERMISSIONS, "fail to auth apikey rateLimiter");
                    }
                }
            }

            // JSON-RPC Notification（通知，如 notifications/initialized）: 无 id，正常路由处理
            // 各类消息统一路由到对应的子节点处理
            return router(requestParameter, dynamicContext);
        } catch (Exception e) {
            log.error("Streamable 消息处理 RootNode:{}", requestParameter, e);
            throw e;
        }
    }

    @Override
    public StrategyHandler<HandleMessageCommandEntity, DefaultMcpStreamableMessageFactory.DynamicContext, ResponseEntity<?>> get(HandleMessageCommandEntity requestParameter, DefaultMcpStreamableMessageFactory.DynamicContext dynamicContext) throws Exception {
        if (requestParameter.getJsonrpcMessage() instanceof McpSchemaVO.JSONRPCRequest request
                && SessionMessageHandlerMethodEnum.INITIALIZE.getMethod().equals(request.method())) {
            return initializeNode;
        }
        return sessionNode;
    }

}
