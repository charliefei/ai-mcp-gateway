package com.feirui.ai.domain.auth.service;

import com.feirui.ai.domain.auth.model.entity.RegisterCommandEntity;

/**
 * 认证服务注册接口
 */
public interface IAuthRegisterService {

    /**
     * 注册
     */
    void register(RegisterCommandEntity commandEntity);

    /**
     * 删除
     */
    void deleteGatewayAuth(String gatewayId);

}
