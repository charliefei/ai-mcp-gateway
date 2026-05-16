package com.feirui.ai.cases.admin.protocol;

import com.feirui.ai.cases.admin.IAdminProtocolService;
import com.feirui.ai.domain.protocol.model.entity.AnalysisCommandEntity;
import com.feirui.ai.domain.protocol.model.entity.StorageCommandEntity;
import com.feirui.ai.domain.protocol.model.valobj.http.HTTPProtocolVO;
import com.feirui.ai.domain.protocol.service.IProtocolAnalysis;
import com.feirui.ai.domain.protocol.service.IProtocolStorage;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 协议配置管理
 */
@Slf4j
@Service
public class AdminProtocolService implements IAdminProtocolService {

    @Resource
    private IProtocolStorage protocolStorage;

    @Resource
    private IProtocolAnalysis protocolAnalysis;

    @Override
    public void saveGatewayProtocol(StorageCommandEntity commandEntity) {
        protocolStorage.doStorage(commandEntity);
    }

    @Override
    public void deleteGatewayProtocol(Long protocolId) {
        protocolStorage.deleteGatewayProtocol(protocolId);
    }

    @Override
    public void importGatewayProtocol(AnalysisCommandEntity commandEntity) {
        // 1. 协议解析
        List<HTTPProtocolVO> httpProtocolVOS = protocolAnalysis.doAnalysis(commandEntity);

        // 2. 协议存储
        protocolStorage.doStorage(StorageCommandEntity.builder().httpProtocolVOS(httpProtocolVOS).build());
    }

    @Override
    public List<HTTPProtocolVO> analysisProtocol(AnalysisCommandEntity commandEntity) {
        return protocolAnalysis.doAnalysis(commandEntity);
    }

}
