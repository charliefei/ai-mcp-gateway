package com.feirui.ai.cases.admin.llm;

import com.feirui.ai.api.dto.GatewayLLMRequestDTO;
import com.feirui.ai.api.dto.GatewayLLMResponseDTO;
import com.feirui.ai.cases.admin.IAdminLLMService;
import com.feirui.ai.domain.gateway.service.IGatewayToolConfigService;
import com.feirui.ai.domain.llm.model.entity.BuildChatModelCommandEntity;
import com.feirui.ai.domain.llm.model.valobj.McpConfigVO;
import com.feirui.ai.domain.llm.service.ILLMService;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * LLM 模型对话验证case
 */
@Slf4j
@Service
public class AdminLLMService implements IAdminLLMService {

    @Value("${server.servlet.context-path}")
    private String baseUrlContextPath;

    @Value("${server.port}")
    private Integer port;

    @Resource
    private ILLMService llmService;

    @Resource
    private IGatewayToolConfigService gatewayToolConfigService;

    @Override
    public GatewayLLMResponseDTO testCallGateway(GatewayLLMRequestDTO requestDTO) {
        log.info("AdminLLMService.testCallGateway {} {}", requestDTO.getGatewayId(), requestDTO.getMessage());

        String gatewayId = requestDTO.getGatewayId();

        String baseUrl = "http://localhost:" + port;
        String sseEndpoint = baseUrlContextPath + "/" + gatewayId + "/mcp/sse";

        // 获取对话模型
        ChatModel chatModel = llmService.getChatModel(gatewayId);

        // 判断是否重新加载 mcp 服务
        if (requestDTO.isReload() || null == chatModel) {

            McpConfigVO mcpConfigVO = McpConfigVO.builder()
                    .baseUri(baseUrl)
                    .sseEndpoint(sseEndpoint)
                    .authApiKey(requestDTO.getAuthApiKey())
                    .timeout(requestDTO.getTimeout())
                    .build();

            BuildChatModelCommandEntity commandEntity = BuildChatModelCommandEntity.builder()
                    .gatewayId(gatewayId)
                    .mcpConfigVO(mcpConfigVO)
                    .build();

            llmService.buildChatModel(commandEntity);

            chatModel = llmService.getChatModel(gatewayId);
        }

        String call = chatModel.call(requestDTO.getMessage());

        return GatewayLLMResponseDTO.builder().content(call).build();
    }

}
