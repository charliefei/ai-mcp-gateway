package com.feirui.ai.cases.admin;

import com.feirui.ai.api.dto.GatewayLLMRequestDTO;
import com.feirui.ai.api.dto.GatewayLLMResponseDTO;

/**
 * LLM 对话模型服务，测试 MCP
 */
public interface IAdminLLMService {

    GatewayLLMResponseDTO testCallGateway(GatewayLLMRequestDTO requestDTO);

}
