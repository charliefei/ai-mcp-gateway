package com.feirui.ai.domain.protocol.service;

import com.feirui.ai.domain.protocol.model.entity.AnalysisCommandEntity;
import com.feirui.ai.domain.protocol.model.valobj.http.HTTPProtocolVO;

import java.util.List;

/**
 * 协议解析接口
 */
public interface IProtocolAnalysis {

    List<HTTPProtocolVO> doAnalysis(AnalysisCommandEntity commandEntity);

}
