package com.feirui.ai.domain.gateway.service;

import com.feirui.ai.domain.gateway.model.entity.GatewayToolConfigCommandEntity;
import com.feirui.ai.domain.gateway.model.valobj.GatewayToolConfigVO;

import java.util.List;

/**
 * 网关工具配置服务接口
 */
public interface IGatewayToolConfigService {

    void saveGatewayToolConfig(GatewayToolConfigCommandEntity commandEntity);

    void updateGatewayToolProtocol(GatewayToolConfigCommandEntity commandEntity);

    void deleteGatewayToolConfig(Long toolId);

    List<GatewayToolConfigVO> queryGatewayToolConfigList(String gatewayId);

}
