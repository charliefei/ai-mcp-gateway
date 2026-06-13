package com.feirui.ai.domain.admin.model.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 全局搜索查询实体
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GlobalSearchQueryEntity {

    /** 搜索关键字 */
    private String keyword;

    /** 每个分类的最大返回条数 */
    private Integer limit;

}
