package com.feirui.ai.cases.admin;

import com.feirui.ai.domain.protocol.model.entity.StorageCommandEntity;

/**
 * 协议配置管理
 */
public interface IAdminProtocolService {

    void saveGatewayProtocol(StorageCommandEntity commandEntity);

    void deleteGatewayProtocol(Long protocolId);

    void importGatewayProtocol(com.feirui.ai.domain.protocol.model.entity.AnalysisCommandEntity commandEntity);

    java.util.List<com.feirui.ai.domain.protocol.model.valobj.http.HTTPProtocolVO> analysisProtocol(com.feirui.ai.domain.protocol.model.entity.AnalysisCommandEntity commandEntity);

}
