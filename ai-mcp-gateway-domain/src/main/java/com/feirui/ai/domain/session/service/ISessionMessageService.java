package com.feirui.ai.domain.session.service;

import com.feirui.ai.domain.session.model.entity.HandleMessageCommandEntity;
import com.feirui.ai.domain.session.model.valobj.McpSchemaVO;

/**
 * 会话消息服务接口
 */
public interface ISessionMessageService {

    McpSchemaVO.JSONRPCResponse processHandlerMessage(String gatewayId, McpSchemaVO.JSONRPCMessage message);

    McpSchemaVO.JSONRPCResponse processHandlerMessage(HandleMessageCommandEntity commandEntity);

}
