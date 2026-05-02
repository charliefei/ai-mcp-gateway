package com.feirui.ai.domain.auth.repository;

import com.feirui.ai.domain.auth.model.entity.LicenseCommandEntity;
import com.feirui.ai.domain.auth.model.valobj.McpGatewayAuthVO;
import com.feirui.ai.domain.auth.model.valobj.enums.AuthStatusEnum;

/**
 * 鉴权仓储服务接口
 */
public interface IAuthRepository {

    void saveGatewayAuth(McpGatewayAuthVO mcpGatewayAuthVO);

    boolean validate(String gatewayId, String apiKey);

    int queryEffectiveGatewayAuthCount(String gatewayId);

    McpGatewayAuthVO queryEffectiveGatewayAuthInfo(LicenseCommandEntity commandEntity);

    AuthStatusEnum.GatewayConfig queryGatewayAuthStatus(String gatewayId);

    void deleteGatewayAuth(String gatewayId);

}
