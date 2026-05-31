package com.feirui.ai.cases.mcp.sse.session;

import cn.bugstack.wrench.design.framework.tree.StrategyHandler;
import com.feirui.ai.cases.mcp.IMcpSessionService;
import com.feirui.ai.cases.mcp.sse.session.factory.DefaultMcpSSESessionFactory;
import com.feirui.ai.types.exception.AppException;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import javax.annotation.Resource;

import static com.feirui.ai.types.enums.ResponseCode.METHOD_NOT_FOUND;

/**
 * 会话服务接口
 */
@Service("mcpSSESessionService")
public class McpSSESessionService implements IMcpSessionService {

    @Resource
    private DefaultMcpSSESessionFactory defaultMcpSSESessionFactory;

    @Override
    public Flux<ServerSentEvent<String>> createMcpSession(String gatewayId, String apiKey) throws Exception {

        StrategyHandler<String, DefaultMcpSSESessionFactory.DynamicContext, Flux<ServerSentEvent<String>>> strategyHandler =
                defaultMcpSSESessionFactory.strategyHandler();

        DefaultMcpSSESessionFactory.DynamicContext dynamicContext = new DefaultMcpSSESessionFactory.DynamicContext();
        dynamicContext.setApiKey(apiKey);

        return strategyHandler.apply(gatewayId, dynamicContext);
    }

    @Override
    public Flux<ServerSentEvent<String>> getMcpSession(String gatewayId, String apiKey, String sessionId) throws Exception {
        throw new AppException(METHOD_NOT_FOUND.getCode(), METHOD_NOT_FOUND.getInfo());
    }

    @Override
    public void deleteMcpSession(String sessionId) {
        throw new AppException(METHOD_NOT_FOUND.getCode(), METHOD_NOT_FOUND.getInfo());
    }

}
