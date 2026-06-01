package com.feirui.ai.cases.mcp.streamable.message.node;

import com.feirui.ai.cases.mcp.streamable.message.AbstractMcpStreamableMessageServiceSupport;
import com.feirui.ai.cases.mcp.streamable.message.factory.DefaultMcpStreamableMessageFactory;
import com.feirui.ai.domain.session.model.entity.HandleMessageCommandEntity;
import com.feirui.ai.domain.session.model.valobj.McpSchemaVO;
import com.feirui.ai.domain.session.model.valobj.SessionConfigVO;
import cn.bugstack.wrench.design.framework.tree.StrategyHandler;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.stereotype.Service;

/**
 * Streamable 消息处理节点
 */
@Slf4j
@Service("mcpStreamableMessageHandlerNode")
public class MessageHandlerNode extends AbstractMcpStreamableMessageServiceSupport {

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    protected ResponseEntity<?> doApply(HandleMessageCommandEntity requestParameter, DefaultMcpStreamableMessageFactory.DynamicContext dynamicContext) throws Exception {
        log.info("Streamable 消息处理 MessageHandlerNode:{}", requestParameter);

        McpSchemaVO.JSONRPCResponse jsonrpcResponse = serviceMessageService.processHandlerMessage(requestParameter);
        if (null != jsonrpcResponse) {
            String responseJson = objectMapper.writeValueAsString(jsonrpcResponse);

            // 推送到 SSE sink（供 GET 监听者接收，保持向后兼容）
            SessionConfigVO sessionConfigVO = dynamicContext.getSessionConfigVO();
            if (sessionConfigVO != null && sessionConfigVO.getSink() != null) {
                sessionConfigVO.getSink().tryEmitNext(ServerSentEvent.<String>builder()
                        .id(sessionConfigVO.getSessionId())
                        .event("message")
                        .data(responseJson)
                        .build());
            }

            // JSON-RPC Request（有 id）: 直接返回 200 + JSON 响应
            // JSON-RPC Notification（有 method 无 id）: 返回 202 Accepted
            if (requestParameter.getJsonrpcMessage() instanceof McpSchemaVO.JSONRPCRequest) {
                return ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(responseJson);
            }
        }

        // Notification 或无需响应的消息：返回 202 Accepted（无 body）
        return ResponseEntity.accepted().build();
    }

    @Override
    public StrategyHandler<HandleMessageCommandEntity, DefaultMcpStreamableMessageFactory.DynamicContext, ResponseEntity<?>> get(HandleMessageCommandEntity requestParameter, DefaultMcpStreamableMessageFactory.DynamicContext dynamicContext) throws Exception {
        return defaultStrategyHandler;
    }

}
