package com.feirui.ai.domain.session.adapter.repository;

import com.feirui.ai.domain.session.model.valobj.gateway.McpGatewayConfigVO;
import com.feirui.ai.domain.session.model.valobj.gateway.McpToolConfigVO;
import com.feirui.ai.domain.session.model.valobj.gateway.McpToolProtocolConfigVO;

import java.util.List;

/**
 * 会话仓储接口
 */
public interface ISessionRepository {

    McpGatewayConfigVO queryMcpGatewayConfigByGatewayId(String gatewayId);

    List<McpToolConfigVO> queryMcpGatewayToolConfigListByGatewayId(String gatewayId);

    McpToolProtocolConfigVO queryMcpGatewayProtocolConfig(String gatewayId, String toolName);

}
