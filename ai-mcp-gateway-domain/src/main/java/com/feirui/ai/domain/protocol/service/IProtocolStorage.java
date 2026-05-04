package com.feirui.ai.domain.protocol.service;

import com.feirui.ai.domain.protocol.model.entity.StorageCommandEntity;

import java.util.List;

/**
 * 协议存储接口
 */
public interface IProtocolStorage {

    List<Long> doStorage(StorageCommandEntity commandEntity);

    void deleteGatewayProtocol(Long protocolId);

}
