package com.feirui.ai.domain.gateway.repository;

import com.feirui.ai.domain.gateway.model.entity.GatewayConfigCommandEntity;
import com.feirui.ai.domain.gateway.model.entity.GatewayToolConfigCommandEntity;
import com.feirui.ai.domain.gateway.model.valobj.GatewayToolConfigVO;

import java.util.List;

/**
 * 网关仓储服务接口
 */
public interface IGatewayRepository {

    void saveGatewayConfig(GatewayConfigCommandEntity commandEntity);

    void updateGatewayAuthStatus(GatewayConfigCommandEntity commandEntity);

    void saveGatewayToolConfig(GatewayToolConfigCommandEntity commandEntity);

    void updateGatewayToolProtocol(GatewayToolConfigCommandEntity commandEntity);

    void deleteGatewayToolConfig(Long toolId);

    List<GatewayToolConfigVO> queryGatewayToolConfigList(String gatewayId);

}

