package com.feirui.ai.cases.mcp.sse.session.node;

import cn.bugstack.wrench.design.framework.tree.StrategyHandler;
import com.feirui.ai.cases.mcp.sse.session.AbstractMcpSSESessionSupport;
import com.feirui.ai.cases.mcp.sse.session.factory.DefaultMcpSSESessionFactory;
import com.feirui.ai.domain.auth.model.entity.LicenseCommandEntity;
import com.feirui.ai.domain.auth.service.IAuthLicenseService;
import com.feirui.ai.types.enums.McpErrorCodes;
import com.feirui.ai.types.exception.AppException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import javax.annotation.Resource;

/**
 * 鉴权核验
 */
@Slf4j
@Service("mcpSessionVerifyNode")
public class VerifyNode extends AbstractMcpSSESessionSupport {

    @Resource(name = "mcpSessionSessionNode")
    private SSESessionNode sessionNode;

    @Resource
    private IAuthLicenseService authLicenseService;

    @Override
    protected Flux<ServerSentEvent<String>> doApply(String requestParameter, DefaultMcpSSESessionFactory.DynamicContext dynamicContext) throws Exception {
        log.info("创建会话-VerifyNode:{}", requestParameter);

        boolean isCheckSuccess
                = authLicenseService.checkLicense(new LicenseCommandEntity(requestParameter, dynamicContext.getApiKey()));

        if (!isCheckSuccess) {
            throw new AppException(McpErrorCodes.INSUFFICIENT_PERMISSIONS, "fail to auth apikey");
        }

        return router(requestParameter, dynamicContext);
    }

    @Override
    public StrategyHandler<String, DefaultMcpSSESessionFactory.DynamicContext, Flux<ServerSentEvent<String>>> get(String requestParameter, DefaultMcpSSESessionFactory.DynamicContext dynamicContext) throws Exception {
        return sessionNode;
    }

}
