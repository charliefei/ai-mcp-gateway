package com.feirui.ai.domain.protocol.service.analysis.strategy;

import com.alibaba.fastjson.JSONObject;
import com.feirui.ai.domain.protocol.model.valobj.http.HTTPProtocolVO;

import java.util.List;

/**
 * 协议解析策略接口
 */
public interface IProtocolAnalysisStrategy {

    void doAnalysis(JSONObject operation, JSONObject definitions, List<HTTPProtocolVO.ProtocolMapping> mappings);

}
