package com.feirui.ai.infrastructure.dao;

import com.feirui.ai.infrastructure.dao.po.McpGatewayPO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface IMcpGatewayDao {

    int insert(McpGatewayPO po);

    int deleteById(Long id);

    int updateById(McpGatewayPO po);

    int updateAuthStatusByGatewayId(McpGatewayPO po);

    McpGatewayPO queryById(Long id);

    List<McpGatewayPO> queryAll();

    McpGatewayPO queryMcpGatewayByGatewayId(String gatewayId);

    List<McpGatewayPO> queryGatewayList(McpGatewayPO query);

    Long queryGatewayListCount(McpGatewayPO query);

    /**
     * 全局搜索网关：按关键字在 gateway_id / gateway_name / gateway_desc 中模糊匹配，
     * 返回最多 {@code limit} 条结果。Repository 层建议传 {@code limit+1} 以便判断是否还有更多命中。
     */
    List<McpGatewayPO> searchGatewayList(@org.apache.ibatis.annotations.Param("keyword") String keyword,
                                         @org.apache.ibatis.annotations.Param("limit") int limit);

}

