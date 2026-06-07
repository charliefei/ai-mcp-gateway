package com.feirui.ai.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 大模型请求测试
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GatewayLLMRequestDTO {

    /**
     * 网关ID
     */
    private String gatewayId;

    /**
     * 认证Key
     */
    private String authApiKey;

    /**
     * 超时时间
     */
    private Integer timeout;

    /**
     * 请求信息
     */
    private String message;

    /**
     * 重新加载LLM，当有协议更新时，可以传入入参
     */
    private boolean reload = false;

    /**
     * 传输协议：sse - SSE 传输（默认）；streamable - Streamable HTTP 传输
     */
    private String transport = "sse";

}
