package com.feirui.ai.domain.auth.repository;

import com.feirui.ai.domain.auth.model.entity.LicenseCommandEntity;
import com.feirui.ai.domain.auth.model.valobj.McpGatewayAuthVO;
import com.feirui.ai.types.enums.GatewayEnum;

/**
 * 鉴权仓储服务接口
 */
public interface IAuthRepository {

    void saveGatewayAuth(McpGatewayAuthVO mcpGatewayAuthVO);

    boolean validate(String gatewayId, String apiKey);

    int queryEffectiveGatewayAuthCount(String gatewayId);

    McpGatewayAuthVO queryEffectiveGatewayAuthInfo(LicenseCommandEntity commandEntity);

    GatewayEnum.GatewayAuthStatusEnum queryGatewayAuthStatus(String gatewayId);

    void deleteGatewayAuth(String gatewayId);

}
