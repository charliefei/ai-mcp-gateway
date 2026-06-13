package com.feirui.ai.infrastructure.dao;

import com.feirui.ai.infrastructure.dao.po.McpProtocolHttpPO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface IMcpProtocolHttpDao {

    int insert(McpProtocolHttpPO po);

    int deleteById(Long id);

    int deleteByProtocolId(Long protocolId);

    int updateByProtocolId(McpProtocolHttpPO po);

    McpProtocolHttpPO queryById(Long id);

    List<McpProtocolHttpPO> queryAll();

    McpProtocolHttpPO queryMcpProtocolHttpByProtocolId(Long protocolId);

    List<McpProtocolHttpPO> queryListByProtocolIds(List<Long> protocolIds);

    List<McpProtocolHttpPO> queryProtocolList(McpProtocolHttpPO query);

    Long queryProtocolListCount(McpProtocolHttpPO query);

    /**
     * 全局搜索协议：按关键字在 http_url 中模糊匹配，
     * 返回最多 {@code limit} 条结果。Repository 层建议传 {@code limit+1} 以便判断是否还有更多命中。
     */
    List<McpProtocolHttpPO> searchProtocolList(@org.apache.ibatis.annotations.Param("keyword") String keyword,
                                               @org.apache.ibatis.annotations.Param("limit") int limit);

}

