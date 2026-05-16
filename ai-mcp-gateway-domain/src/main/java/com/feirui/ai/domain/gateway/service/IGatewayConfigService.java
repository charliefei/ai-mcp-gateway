package com.feirui.ai.domain.gateway.service;

import com.feirui.ai.domain.gateway.model.entity.GatewayConfigCommandEntity;

/**
 * 网关配置接口
 */
public interface IGatewayConfigService {

    void saveGatewayConfig(GatewayConfigCommandEntity commandEntity);

    void updateGatewayAuthStatus(GatewayConfigCommandEntity commandEntity);

}
