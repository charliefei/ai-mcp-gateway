package com.feirui.ai.infrastructure.dao;

import com.feirui.ai.infrastructure.dao.po.McpGatewayToolPO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface IMcpGatewayToolDao {

    int insert(McpGatewayToolPO po);

    int updateProtocolByGatewayId(McpGatewayToolPO po);

    List<McpGatewayToolPO> queryEffectiveTools(String gatewayId);

    List<McpGatewayToolPO> queryListByGatewayId(String gatewayId);

    Long queryToolProtocolIdByToolName(McpGatewayToolPO mcpGatewayToolPOReq);

    List<McpGatewayToolPO> queryToolList(McpGatewayToolPO query);

    Long queryToolListCount(McpGatewayToolPO query);

    List<McpGatewayToolPO> queryAll();

    int deleteByToolId(Long toolId);

    /**
     * 全局搜索工具：按关键字在 gateway_id / tool_name / tool_description 中模糊匹配，
     * 返回最多 {@code limit} 条结果。Repository 层建议传 {@code limit+1} 以便判断是否还有更多命中。
     */
    List<McpGatewayToolPO> searchToolList(@org.apache.ibatis.annotations.Param("keyword") String keyword,
                                          @org.apache.ibatis.annotations.Param("limit") int limit);

}
