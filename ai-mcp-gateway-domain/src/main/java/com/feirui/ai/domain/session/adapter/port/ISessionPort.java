package com.feirui.ai.domain.session.adapter.port;

import com.feirui.ai.domain.session.model.valobj.gateway.McpToolProtocolConfigVO;

import java.io.IOException;

/**
 * 回话端口
 */
public interface ISessionPort {

    Object toolCall(McpToolProtocolConfigVO.HTTPConfig httpConfig, Object params) throws IOException;

}
