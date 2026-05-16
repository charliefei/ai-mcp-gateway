package com.feirui.ai.cases.admin;

import com.feirui.ai.domain.auth.model.entity.RegisterCommandEntity;

/**
 * 运营；认证配置管理
 */
public interface IAdminAuthService {

    void saveGatewayAuth(RegisterCommandEntity commandEntity);

    void deleteGatewayAuth(String gatewayId);

}
