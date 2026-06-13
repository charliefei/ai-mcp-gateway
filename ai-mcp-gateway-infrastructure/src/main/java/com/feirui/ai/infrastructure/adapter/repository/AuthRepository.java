package com.feirui.ai.infrastructure.adapter.repository;

import com.feirui.ai.domain.auth.model.entity.LicenseCommandEntity;
import com.feirui.ai.domain.auth.model.valobj.McpGatewayAuthVO;
import com.feirui.ai.domain.auth.repository.IAuthRepository;
import com.feirui.ai.infrastructure.dao.IMcpGatewayAuthDao;
import com.feirui.ai.infrastructure.dao.IMcpGatewayDao;
import com.feirui.ai.infrastructure.dao.po.McpGatewayAuthPO;
import com.feirui.ai.infrastructure.dao.po.McpGatewayPO;
import com.feirui.ai.types.enums.GatewayEnum;
import com.feirui.ai.types.enums.McpErrorCodes;
import com.feirui.ai.types.exception.AppException;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;

import java.util.Objects;

/**
 * 鉴权仓储服务
 */
@Slf4j
@Repository
public class AuthRepository implements IAuthRepository {

    @Resource
    private IMcpGatewayAuthDao mcpGatewayAuthDao;

    @Resource
    private IMcpGatewayDao mcpGatewayDao;

    @Override
    public boolean validate(String gatewayId, String apiKey) {
        McpGatewayAuthPO poReq = new McpGatewayAuthPO();
        poReq.setGatewayId(gatewayId);
        poReq.setApiKey(apiKey);
        McpGatewayAuthPO mcpGatewayAuthPO = mcpGatewayAuthDao.queryMcpGatewayAuthPO(poReq);
        if (null == mcpGatewayAuthPO) return false;
        return Objects.equals(mcpGatewayAuthPO.getStatus(), GatewayEnum.GatewayStatus.ENABLE.getCode());
    }

    @Override
    public int queryEffectiveGatewayAuthCount(String gatewayId) {
        return mcpGatewayAuthDao.queryEffectiveGatewayAuthCount(gatewayId);
    }

    @Override
    public McpGatewayAuthVO queryEffectiveGatewayAuthInfo(LicenseCommandEntity commandEntity) {

        McpGatewayAuthPO poReq = new McpGatewayAuthPO();
        poReq.setGatewayId(commandEntity.getGatewayId());
        poReq.setApiKey(commandEntity.getApiKey());

        McpGatewayAuthPO mcpGatewayAuthPO = mcpGatewayAuthDao.queryMcpGatewayAuthPO(poReq);
        if (null == mcpGatewayAuthPO) return null;

        return McpGatewayAuthVO.builder()
                .gatewayId(mcpGatewayAuthPO.getGatewayId())
                .apiKey(mcpGatewayAuthPO.getApiKey())
                .rateLimit(mcpGatewayAuthPO.getRateLimit())
                .expireTime(mcpGatewayAuthPO.getExpireTime())
                .status(GatewayEnum.GatewayStatus.get(mcpGatewayAuthPO.getStatus()))
                .build();
    }

    @Override
    public void saveGatewayAuth(McpGatewayAuthVO mcpGatewayAuthVO) {
        McpGatewayAuthPO existingAuth = mcpGatewayAuthDao.queryMcpGatewayAuthPO(McpGatewayAuthPO.builder().gatewayId(mcpGatewayAuthVO.getGatewayId()).build());
        
        McpGatewayAuthPO mcpGatewayAuthPO = McpGatewayAuthPO.builder()
                .gatewayId(mcpGatewayAuthVO.getGatewayId())
                .apiKey(mcpGatewayAuthVO.getApiKey())
                .rateLimit(mcpGatewayAuthVO.getRateLimit())
                .expireTime(mcpGatewayAuthVO.getExpireTime())
                .status(mcpGatewayAuthVO.getStatus().getCode())
                .build();
                
        if (existingAuth != null) {
            mcpGatewayAuthDao.updateByGatewayId(mcpGatewayAuthPO);
        } else {
            mcpGatewayAuthDao.insert(mcpGatewayAuthPO);
        }
    }

    @Override
    public GatewayEnum.GatewayAuthStatusEnum queryGatewayAuthStatus(String gatewayId) {
        McpGatewayPO mcpGatewayPO = mcpGatewayDao.queryMcpGatewayByGatewayId(gatewayId);
        if (null == mcpGatewayPO) {
            throw new AppException(McpErrorCodes.INVALID_PARAMS, "无效参数 gatewayId 不存在");
        }
        return GatewayEnum.GatewayAuthStatusEnum.get(mcpGatewayPO.getAuth());
    }

    @Override
    public void deleteGatewayAuth(String gatewayId) {
        mcpGatewayAuthDao.deleteByGatewayId(gatewayId);
    }

}
