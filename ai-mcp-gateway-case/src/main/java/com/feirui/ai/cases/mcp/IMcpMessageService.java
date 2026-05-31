package com.feirui.ai.cases.mcp;

import com.feirui.ai.domain.session.model.entity.HandleMessageCommandEntity;
import org.springframework.http.ResponseEntity;

/**
 * MCP 消息处理case层服务接口
 */
public interface IMcpMessageService<T> {

    ResponseEntity<T> handleMessage(HandleMessageCommandEntity commandEntity) throws Exception;

}
