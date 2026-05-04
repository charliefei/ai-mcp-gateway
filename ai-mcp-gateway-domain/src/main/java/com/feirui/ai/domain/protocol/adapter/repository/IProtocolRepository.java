package com.feirui.ai.domain.protocol.adapter.repository;

import com.feirui.ai.domain.protocol.model.valobj.http.HTTPProtocolVO;

import java.util.List;

/**
 * 协议仓储服务接口
 */
public interface IProtocolRepository {

    List<Long> saveHttpProtocolAndMapping(List<HTTPProtocolVO> httpProtocolVOS);

    void deleteGatewayProtocol(Long protocolId);

}
