package com.feirui.ai.trigger.http;

import com.alibaba.fastjson.JSON;
import com.feirui.ai.api.IMcpGatewayService;
import com.feirui.ai.api.response.Response;
import com.feirui.ai.cases.mcp.IMcpSessionService;
import com.feirui.ai.types.enums.ResponseCode;
import com.feirui.ai.types.exception.AppException;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import javax.annotation.Resource;
import java.util.UUID;

/**
 * MCP 网关服务接口管理
 */
@Slf4j
@RestController
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
@RequestMapping("/")
public class McpGatewayController implements IMcpGatewayService {

    @Resource
    private IMcpSessionService mcpSessionService;

    /**
     * 处理 sse 连接，创建会话
     * <br/>
     * <a href="http://localhost:8777/api-gateway/gateway_001/mcp/sse">http://localhost:8777/api-gateway/gateway_001/mcp/sse</a>
     * <br/>
     * <a href="http://localhost:8777/api-gateway/gateway_001/mcp/sse?api_key=gw-lf3HFzlJCdnrYl20oHbd5lJQxE7GWz8wjsSgjDZfctJNV8s5">http://localhost:8777/api-gateway/gateway_001/mcp/sse?api_key=gw-lf3HFzlJCdnrYl20oHbd5lJQxE7GWz8wjsSgjDZfctJNV8s5</a>
     *
     * @param gatewayId 网关ID
     */
    @GetMapping(value = "{gatewayId}/mcp/sse", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Override
    public Flux<ServerSentEvent<String>> handleSseConnection(
            @PathVariable("gatewayId") String gatewayId, @RequestParam("api_key") String apiKey) throws Exception {
        try {
            log.info("建立 MCP SSE 连接，gatewayId:{}", gatewayId);
            if (StringUtils.isBlank(gatewayId)) {
                log.info("非法参数，gateway is null");
                throw new AppException(ResponseCode.ILLEGAL_PARAMETER.getCode(), ResponseCode.ILLEGAL_PARAMETER.getInfo());
            }

            return mcpSessionService.createMcpSession(gatewayId, apiKey);
        } catch (AppException e) {
            log.error("建立 MCP SSE 连接拒绝，gatewayId: {}", gatewayId, e);
            return Flux.just(ServerSentEvent.<String>builder()
                    .id(UUID.randomUUID().toString())
                    .event("error")
                    .data(JSON.toJSONString(Response.<String>builder()
                            .code(e.getCode())
                            .info(e.getInfo())
                            .build()))
                    .build());
        } catch (Exception e) {
            log.error("建立 MCP SSE 连接失败，gatewayId: {}", gatewayId, e);
            throw e;
        }
    }

}
