package com.feirui.ai.domain.gateway.service.tool;

import com.feirui.ai.domain.gateway.model.entity.GatewayToolConfigCommandEntity;
import com.feirui.ai.domain.gateway.model.valobj.GatewayToolConfigVO;
import com.feirui.ai.domain.gateway.repository.IGatewayRepository;
import com.feirui.ai.domain.gateway.service.IGatewayToolConfigService;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 网关工具配置服务实现
 */
@Slf4j
@Service
public class GatewayToolConfigService implements IGatewayToolConfigService {

    @Resource
    private IGatewayRepository repository;

    @Override
    public void saveGatewayToolConfig(GatewayToolConfigCommandEntity commandEntity) {
        repository.saveGatewayToolConfig(commandEntity);
    }

    @Override
    public void updateGatewayToolProtocol(GatewayToolConfigCommandEntity commandEntity) {
        repository.updateGatewayToolProtocol(commandEntity);
    }

    @Override
    public void deleteGatewayToolConfig(Long toolId) {
        repository.deleteGatewayToolConfig(toolId);
    }

    @Override
    public List<GatewayToolConfigVO> queryGatewayToolConfigList(String gatewayId) {
        return repository.queryGatewayToolConfigList(gatewayId);
    }

}
