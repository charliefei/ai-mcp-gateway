package com.feirui.ai.domain.admin.service;

import com.feirui.ai.domain.admin.model.entity.*;

import java.util.List;

public interface IAdminService {

    List<GatewayConfigEntity> queryGatewayConfigList();

    GatewayConfigPageEntity queryGatewayConfigPage(GatewayConfigQueryEntity queryEntity);

    List<GatewayToolConfigEntity> queryGatewayToolList();

    GatewayToolPageEntity queryGatewayToolPage(GatewayToolQueryEntity queryEntity);

    List<GatewayToolConfigEntity> queryGatewayToolListByGatewayId(String gatewayId);

    List<GatewayProtocolConfigEntity> queryGatewayProtocolList();

    GatewayProtocolPageEntity queryGatewayProtocolPage(GatewayProtocolQueryEntity queryEntity);

    List<GatewayProtocolConfigEntity> queryGatewayProtocolListByGatewayId(String gatewayId);

    List<GatewayAuthConfigEntity> queryGatewayAuthList();

    GatewayAuthPageEntity queryGatewayAuthPage(GatewayAuthQueryEntity queryEntity);

    /**
     * 根据网关ID查询该网关下的认证配置列表
     */
    List<GatewayAuthConfigEntity> queryGatewayAuthListByGatewayId(String gatewayId);

    /**
     * 全局搜索：跨网关/工具/协议/认证四个维度检索关键字
     *
     * @param queryEntity 关键字 + 每分类返回上限
     * @return 按分类聚合的搜索结果
     */
    GlobalSearchResultEntity globalSearch(GlobalSearchQueryEntity queryEntity);

}
