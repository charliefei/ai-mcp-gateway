package com.feirui.ai.domain.llm.model.valobj;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * mcp 配置值对象
 */
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class McpConfigVO {

    private String baseUri;
    private String sseEndpoint;
    /**
     * Streamable HTTP 端点，默认 /mcp
     */
    private String streamableEndpoint;
    /**
     * 传输协议：sse / streamable；不传则按 sse 处理
     */
    private String transport;
    private String authApiKey;
    private Integer timeout;

}
