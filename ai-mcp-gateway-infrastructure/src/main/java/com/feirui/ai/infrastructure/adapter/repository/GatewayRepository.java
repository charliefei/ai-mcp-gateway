package com.feirui.ai.infrastructure.adapter.repository;

import com.feirui.ai.domain.gateway.model.entity.GatewayConfigCommandEntity;
import com.feirui.ai.domain.gateway.model.entity.GatewayToolConfigCommandEntity;
import com.feirui.ai.domain.gateway.model.valobj.GatewayConfigVO;
import com.feirui.ai.domain.gateway.model.valobj.GatewayToolConfigVO;
import com.feirui.ai.domain.gateway.repository.IGatewayRepository;
import com.feirui.ai.infrastructure.dao.IMcpGatewayDao;
import com.feirui.ai.infrastructure.dao.IMcpGatewayToolDao;
import com.feirui.ai.infrastructure.dao.po.McpGatewayPO;
import com.feirui.ai.infrastructure.dao.po.McpGatewayToolPO;
import com.feirui.ai.types.enums.GatewayEnum;
import com.feirui.ai.types.exception.AppException;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

import static com.feirui.ai.types.enums.ResponseCode.DB_UPDATE_FAIL;

/**
 * 网关仓储服务实现
 */
@Slf4j
@Repository
public class GatewayRepository implements IGatewayRepository {

    @Resource
    private IMcpGatewayDao mcpGatewayDao;

    @Resource
    private IMcpGatewayToolDao mcpGatewayToolDao;

    @Override
    public void saveGatewayConfig(GatewayConfigCommandEntity commandEntity) {
        GatewayConfigVO gatewayConfigVO = commandEntity.getGatewayConfigVO();

        McpGatewayPO mcpGatewayPO = new McpGatewayPO();
        mcpGatewayPO.setGatewayId(gatewayConfigVO.getGatewayId());
        mcpGatewayPO.setGatewayName(gatewayConfigVO.getGatewayName());
        mcpGatewayPO.setGatewayDesc(gatewayConfigVO.getGatewayDesc());
        mcpGatewayPO.setVersion(gatewayConfigVO.getVersion());
        mcpGatewayPO.setAuth(null != gatewayConfigVO.getAuth() ? gatewayConfigVO.getAuth().getCode() : GatewayEnum.GatewayAuthStatusEnum.NOT_VERIFIED.getCode());
        mcpGatewayPO.setStatus(null != gatewayConfigVO.getStatus() ? gatewayConfigVO.getStatus().getCode() : GatewayEnum.GatewayStatus.ENABLE.getCode());
        mcpGatewayDao.insert(mcpGatewayPO);
    }

    @Override
    public void updateGatewayAuthStatus(GatewayConfigCommandEntity commandEntity) {
        GatewayConfigVO gatewayConfigVO = commandEntity.getGatewayConfigVO();
        if (null == gatewayConfigVO.getAuth()) {
            return;
        }

        McpGatewayPO mcpGatewayPO = new McpGatewayPO();
        mcpGatewayPO.setGatewayId(gatewayConfigVO.getGatewayId());
        mcpGatewayPO.setAuth(null != gatewayConfigVO.getAuth() ? gatewayConfigVO.getAuth().getCode() : null);
        int count = mcpGatewayDao.updateAuthStatusByGatewayId(mcpGatewayPO);
        if (1 != count) {
            throw new AppException(DB_UPDATE_FAIL.getCode(), DB_UPDATE_FAIL.getInfo());
        }
    }

    @Override
    public void saveGatewayToolConfig(GatewayToolConfigCommandEntity commandEntity) {
        GatewayToolConfigVO gatewayToolConfigVO = commandEntity.getGatewayToolConfigVO();

        McpGatewayToolPO mcpGatewayToolPO = new McpGatewayToolPO();
        mcpGatewayToolPO.setGatewayId(gatewayToolConfigVO.getGatewayId());
        mcpGatewayToolPO.setToolId(gatewayToolConfigVO.getToolId());
        mcpGatewayToolPO.setToolName(gatewayToolConfigVO.getToolName());
        mcpGatewayToolPO.setToolType(gatewayToolConfigVO.getToolType());
        mcpGatewayToolPO.setToolDescription(gatewayToolConfigVO.getToolDescription());
        mcpGatewayToolPO.setToolVersion(gatewayToolConfigVO.getToolVersion());
        mcpGatewayToolPO.setProtocolId(gatewayToolConfigVO.getProtocolId());
        mcpGatewayToolPO.setProtocolType(gatewayToolConfigVO.getProtocolType());
        mcpGatewayToolDao.insert(mcpGatewayToolPO);
    }

    @Override
    public void updateGatewayToolProtocol(GatewayToolConfigCommandEntity commandEntity) {
        GatewayToolConfigVO gatewayToolConfigVO = commandEntity.getGatewayToolConfigVO();

        McpGatewayToolPO mcpGatewayToolPO = new McpGatewayToolPO();
        mcpGatewayToolPO.setGatewayId(gatewayToolConfigVO.getGatewayId());
        mcpGatewayToolPO.setProtocolId(gatewayToolConfigVO.getProtocolId());
        mcpGatewayToolPO.setProtocolType(gatewayToolConfigVO.getProtocolType());

        int count = mcpGatewayToolDao.updateProtocolByGatewayId(mcpGatewayToolPO);
        if (1 != count) {
            throw new AppException(DB_UPDATE_FAIL.getCode(), DB_UPDATE_FAIL.getInfo());
        }
    }

    @Override
    public void deleteGatewayToolConfig(Long toolId) {
        mcpGatewayToolDao.deleteByToolId(toolId);
    }

    @Override
    public List<GatewayToolConfigVO> queryGatewayToolConfigList(String gatewayId) {
        List<McpGatewayToolPO> mcpGatewayToolPOS = mcpGatewayToolDao.queryListByGatewayId(gatewayId);
        List<GatewayToolConfigVO> list = new ArrayList<>();
        if (null == mcpGatewayToolPOS || mcpGatewayToolPOS.isEmpty()) {
            return list;
        }

        for (McpGatewayToolPO po : mcpGatewayToolPOS) {
            list.add(GatewayToolConfigVO.builder()
                    .gatewayId(po.getGatewayId())
                    .toolId(po.getToolId())
                    .toolName(po.getToolName())
                    .toolType(po.getToolType())
                    .toolDescription(po.getToolDescription())
                    .toolVersion(po.getToolVersion())
                    .protocolId(po.getProtocolId())
                    .protocolType(po.getProtocolType())
                    .build());
        }

        return list;
    }

}
