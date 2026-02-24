package com.feirui.ai.infrastructure.dao;

import com.feirui.ai.infrastructure.dao.po.McpGatewayToolPO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface IMcpGatewayToolDao {

    List<McpGatewayToolPO> queryEffectiveTools(String gatewayId);

    Long queryToolProtocolIdByToolName(McpGatewayToolPO mcpGatewayToolPOReq);

}
