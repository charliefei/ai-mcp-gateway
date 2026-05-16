package com.feirui.ai.domain.gateway.service.gateway;

import com.feirui.ai.domain.gateway.model.entity.GatewayConfigCommandEntity;
import com.feirui.ai.domain.gateway.repository.IGatewayRepository;
import com.feirui.ai.domain.gateway.service.IGatewayConfigService;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * 网关配置服务
 */
@Slf4j
@Service
public class GatewayConfigService implements IGatewayConfigService {

    @Resource
    private IGatewayRepository repository;

    @Override
    public void saveGatewayConfig(GatewayConfigCommandEntity commandEntity) {
        repository.saveGatewayConfig(commandEntity);
    }

    @Override
    public void updateGatewayAuthStatus(GatewayConfigCommandEntity commandEntity) {
        repository.updateGatewayAuthStatus(commandEntity);
    }
}
