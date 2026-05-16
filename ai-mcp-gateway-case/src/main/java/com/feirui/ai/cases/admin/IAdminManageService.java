package com.feirui.ai.cases.admin;

import com.feirui.ai.domain.admin.model.entity.*;

import java.util.List;

/**
 * 运营管理
 */
public interface IAdminManageService {

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

}