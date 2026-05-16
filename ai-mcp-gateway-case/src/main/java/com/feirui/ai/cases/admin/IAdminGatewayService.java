package com.feirui.ai.cases.admin;

import com.feirui.ai.domain.gateway.model.entity.GatewayConfigCommandEntity;
import com.feirui.ai.domain.gateway.model.entity.GatewayToolConfigCommandEntity;

/**
 * 网关配置管理
 */
public interface IAdminGatewayService {

    void saveGatewayConfig(GatewayConfigCommandEntity commandEntity);

    void saveGatewayToolConfig(GatewayToolConfigCommandEntity commandEntity);

    void deleteGatewayToolConfig(Long toolId);

}
