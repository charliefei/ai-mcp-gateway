package com.feirui.ai.cases.mcp.sse.message;

import cn.bugstack.wrench.design.framework.tree.StrategyHandler;
import com.feirui.ai.cases.mcp.IMcpMessageService;
import com.feirui.ai.cases.mcp.sse.message.factory.DefaultMcpMessageFactory;
import com.feirui.ai.domain.session.model.entity.HandleMessageCommandEntity;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;

/**
 * 会话消息处理
 */
@Slf4j
@Service("mcpSSEMessageService")
public class McpSSEMessageService implements IMcpMessageService<Void> {

    @Resource
    private DefaultMcpMessageFactory defaultMcpMessageFactory;

    @Override
    public ResponseEntity<Void> handleMessage(HandleMessageCommandEntity commandEntity) throws Exception {
        StrategyHandler<HandleMessageCommandEntity, DefaultMcpMessageFactory.DynamicContext, ResponseEntity<Void>> strategyHandler
                = defaultMcpMessageFactory.strategyHandler();

        return strategyHandler.apply(commandEntity, new DefaultMcpMessageFactory.DynamicContext());
    }

}
