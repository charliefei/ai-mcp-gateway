package com.feirui.ai.infrastructure.dao;

import com.feirui.ai.infrastructure.dao.po.McpGatewayAuthPO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface IMcpGatewayAuthDao {

    int insert(McpGatewayAuthPO po);

    int deleteById(Long id);

    int deleteByGatewayId(String gatewayId);

    int updateById(McpGatewayAuthPO po);

    int updateByGatewayId(McpGatewayAuthPO po);

    McpGatewayAuthPO queryById(Long id);

    List<McpGatewayAuthPO> queryAll();

    List<McpGatewayAuthPO> queryAuthList(McpGatewayAuthPO query);

    Long queryAuthListCount(McpGatewayAuthPO query);

    /**
     * 根据网关ID精确查询该网关下的所有认证记录
     */
    List<McpGatewayAuthPO> queryListByGatewayId(String gatewayId);

    McpGatewayAuthPO queryMcpGatewayAuthPO(McpGatewayAuthPO req);

    int queryEffectiveGatewayAuthCount(String gatewayId);

    /**
     * 全局搜索认证：按关键字在 gateway_id / api_key 中模糊匹配，
     * 返回最多 {@code limit} 条结果。Repository 层建议传 {@code limit+1} 以便判断是否还有更多命中。
     */
    List<McpGatewayAuthPO> searchAuthList(@org.apache.ibatis.annotations.Param("keyword") String keyword,
                                          @org.apache.ibatis.annotations.Param("limit") int limit);

}
