package com.feirui.ai.domain.session.service.message.handler;

import com.feirui.ai.domain.session.model.valobj.McpSchemaVO;

/**
 * 处理请求接口
 */
public interface IRequestHandler {

    McpSchemaVO.JSONRPCResponse handle(String gatewayId, McpSchemaVO.JSONRPCRequest message);

}
