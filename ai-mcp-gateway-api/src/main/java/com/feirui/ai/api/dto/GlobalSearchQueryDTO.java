package com.feirui.ai.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * 全局搜索查询 DTO
 * <p>
 * 支持跨网关/工具/协议/认证四个维度的关键字检索。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GlobalSearchQueryDTO implements Serializable {

    /** 搜索关键字 */
    private String keyword;

    /** 每个分类返回的最大条数，默认 5，上限 50 */
    private Integer limit;

}
