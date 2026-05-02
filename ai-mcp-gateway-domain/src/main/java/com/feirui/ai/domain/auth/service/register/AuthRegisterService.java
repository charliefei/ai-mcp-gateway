package com.feirui.ai.domain.auth.service.register;

import com.feirui.ai.domain.auth.model.entity.RegisterCommandEntity;
import com.feirui.ai.domain.auth.model.valobj.McpGatewayAuthVO;
import com.feirui.ai.domain.auth.model.valobj.enums.AuthStatusEnum;
import com.feirui.ai.domain.auth.repository.IAuthRepository;
import com.feirui.ai.domain.auth.service.IAuthRegisterService;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.stereotype.Service;

/**
 * 认证服务注册
 */
@Slf4j
@Service
public class AuthRegisterService implements IAuthRegisterService {

    @Resource
    private IAuthRepository repository;

    @Override
    public void register(RegisterCommandEntity commandEntity) {
        // 1. 生成 API Key | gw 网关缩写，方便区分
        String apiKey = "gw-" + RandomStringUtils.randomAlphanumeric(48);

        // 2. 构建聚合对象
        McpGatewayAuthVO mcpGatewayAuthVO = McpGatewayAuthVO.builder()
                .gatewayId(commandEntity.getGatewayId())
                .apiKey(apiKey)
                .rateLimit(commandEntity.getRateLimit())
                .expireTime(commandEntity.getExpireTime())
                .status(AuthStatusEnum.AuthConfig.ENABLE)
                .build();

        // 3. 保存数据
        repository.saveGatewayAuth(mcpGatewayAuthVO);
    }

    @Override
    public void deleteGatewayAuth(String gatewayId) {
        repository.deleteGatewayAuth(gatewayId);
    }

}
